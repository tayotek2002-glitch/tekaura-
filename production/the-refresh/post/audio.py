"""THE REFRESH — original score, sound design and final mix (no samples, no third-party audio).

usage: python3 audio.py OUT_DIR [VO_FILE]
writes OUT_DIR/music.wav, OUT_DIR/sfx.wav, OUT_DIR/mix_novo.wav and, with VO_FILE, OUT_DIR/mix_vo.wav
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

sys.path.insert(0, str(Path(__file__).parent))
from timeline import BPM, CUTS_WITH_FLASH, DURATION, EVENTS, VO_LINES  # noqa: E402

SR = 48000
N = int(DURATION * SR)
rng = np.random.default_rng(7)
BEAT = 60 / BPM


def t_axis(n):
    return np.arange(n) / SR


def s(t):
    return int(round(t * SR))


def place(buf, sig, t0, gain=1.0):
    """Add mono or stereo sig into stereo buf at time t0 (clipped to buffer)."""
    if sig.ndim == 1:
        sig = np.stack([sig, sig], axis=1)
    i0 = s(t0)
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    i1 = min(N, i0 + len(sig))
    if i1 > i0:
        buf[i0:i1] += sig[: i1 - i0] * gain


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR * 0.45)], "band", fs=SR, output="sos"), x, axis=0)


def fade(n, a=0.01, r=0.05):
    e = np.ones(n)
    na, nr = min(n, s(a)), min(n, s(r))
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def hz(note):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    name, octave = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[name] + 12 * (octave - 4)) / 12)


def reverb_ir(seconds=2.4, seed=3):
    r = np.random.default_rng(seed)
    n = s(seconds)
    env = np.exp(-np.arange(n) / (SR * seconds / 6.5))
    ir = r.standard_normal((n, 2)) * env[:, None]
    ir = lp(ir, 7000)
    ir[: s(0.012)] = 0  # pre-delay
    return ir / np.sqrt((ir ** 2).sum(axis=0))


IR = reverb_ir()


def reverb(x, wet=0.3):
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    y = np.stack([fftconvolve(x[:, c], IR[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - wet) + y * wet


# ---------------------------------------------------------------- instruments
def pad_note(f, dur, cutoff=(900, 1800), amp=1.0, attack=0.8, release=1.2):
    """Detuned additive saw with a moving low-pass rolloff — warm analogue-style pad."""
    n = s(dur)
    t = t_axis(n)
    fc = np.linspace(cutoff[0], cutoff[1], n)
    out = np.zeros(n)
    for det in (-0.006, 0.0, 0.0055):
        ff = f * (1 + det)
        ph = rng.uniform(0, 2 * np.pi)
        for k in range(1, int(min(40, 9000 / ff)) + 1):
            w = np.exp(-k * ff / fc) / k
            out += w * np.sin(2 * np.pi * k * ff * t + ph * k)
    return out * fade(n, attack, release) * amp / 3


def pad_chord(notes, t0, dur, gain, cutoff=(900, 1800), spread=0.35):
    sig = np.zeros((s(dur), 2))
    for i, nm in enumerate(notes):
        mono = pad_note(hz(nm), dur, cutoff)
        pan = (i / max(1, len(notes) - 1) - 0.5) * spread
        sig[:, 0] += mono * (0.5 - pan)
        sig[:, 1] += mono * (0.5 + pan)
    return sig * gain, t0


def pluck(f, dur=0.45, bright=1.0):
    n = s(dur)
    t = t_axis(n)
    env = np.exp(-t / 0.16)
    x = np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.05)
    return x * env * fade(n, 0.002, 0.05)


def bell(f, dur=2.5):
    n = s(dur)
    t = t_axis(n)
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in ((1, 1, 1.2), (2.01, 0.4, 0.6), (3.0, 0.2, 0.35), (4.23, 0.12, 0.2)))
    return x * fade(n, 0.003, 0.3)


def kick(level=1.0):
    n = s(0.45)
    t = t_axis(n)
    f = 45 + 75 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.18)
    x[: s(0.004)] += rng.standard_normal(s(0.004)) * 0.3
    return x * level


def hat(level=1.0):
    n = s(0.06)
    x = hp(rng.standard_normal(n), 7500, 4) * np.exp(-t_axis(n) / 0.012)
    return x * level


def sub(f, dur=0.22):
    n = s(dur)
    t = t_axis(n)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.12) * fade(n, 0.004, 0.03)


# ---------------------------------------------------------------- sound design
def band_sweep(dur, f_from, f_to, amp_env, bands=18, width=0.35, seed=0):
    """Click-free filtered-noise sweep: a fixed filter bank whose gains follow a moving centre."""
    r = np.random.default_rng(seed)
    n = s(dur)
    noise = r.standard_normal(n)
    centres = np.geomspace(150, 9000, bands)
    centre_t = np.geomspace(f_from, f_to, n)
    out = np.zeros(n)
    for c in centres:
        band = bp(noise, c / 1.25, c * 1.25)
        g = np.exp(-0.5 * (np.log(centre_t / c) / width) ** 2)
        out += band * g
    return out * amp_env(np.linspace(0, 1, n))


def whoosh(dur=0.7, up=True, seed=1):
    f0, f1 = (300, 5000) if up else (5000, 300)
    x = band_sweep(dur, f0, f1, lambda u: np.sin(np.pi * u) ** 2, seed=seed)
    return x / (np.abs(x).max() + 1e-9)


def riser(dur, seed=2):
    x = band_sweep(dur, 250, 7000, lambda u: u ** 2.2, seed=seed)
    t = t_axis(len(x))
    gl = np.sin(2 * np.pi * np.cumsum(np.geomspace(180, 720, len(x))) / SR) * (t / t[-1]) ** 2 * 0.15
    x = x / (np.abs(x).max() + 1e-9) + gl
    return x * fade(len(x), 0.05, 0.01)


def glass_shimmer(dur, seed=4):
    r = np.random.default_rng(seed)
    n = s(dur)
    t = t_axis(n)
    out = np.zeros(n)
    for f in (2637, 3136, 3951, 4699, 5588, 6645):
        am = 0.5 + 0.5 * np.sin(2 * np.pi * r.uniform(0.6, 2.2) * t + r.uniform(0, 6.28))
        out += np.sin(2 * np.pi * f * t + r.uniform(0, 6.28)) * am / 6
    air = bp(r.standard_normal(n), 3000, 9000) * 0.25
    return (out + air) * fade(n, dur * 0.4, dur * 0.4)


def click(freq=3200, body=180, level=1.0):
    n = s(0.12)
    t = t_axis(n)
    x = np.zeros(n)
    tr = s(0.0015)
    x[:tr] = hp(rng.standard_normal(tr), 2000) * 0.8
    x += np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.018) * 0.55
    x += np.sin(2 * np.pi * freq * 1.62 * t) * np.exp(-t / 0.01) * 0.25
    x += np.sin(2 * np.pi * body * t) * np.exp(-t / 0.03) * 0.6
    return x * level


def snap(level=1.0):
    n = s(0.2)
    t = t_axis(n)
    x = bp(rng.standard_normal(n), 1800, 7000, 3) * np.exp(-t / 0.006) * 1.2
    x += np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.06)
    x += np.sin(2 * np.pi * 880 * t) * np.exp(-t / 0.03) * 0.35
    return x * level


def impact(dur=2.2, f0=90, f1=32, level=1.0):
    n = s(dur)
    t = t_axis(n)
    f = f1 + (f0 - f1) * np.exp(-t / 0.18)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55)
    x += lp(rng.standard_normal(n), 900) * np.exp(-t / 0.08) * 0.6
    return x * fade(n, 0.002, 0.4) * level


def sparkle(dur, density=18, seed=5):
    r = np.random.default_rng(seed)
    n = s(dur)
    out = np.zeros((n, 2))
    for _ in range(int(density * dur)):
        f = r.uniform(4500, 9500)
        ping = np.sin(2 * np.pi * f * t_axis(s(0.15))) * np.exp(-t_axis(s(0.15)) / 0.03)
        i = r.integers(0, max(1, n - len(ping)))
        pan = r.uniform(0.2, 0.8)
        out[i : i + len(ping), 0] += ping * (1 - pan)
        out[i : i + len(ping), 1] += ping * pan
    return out * fade(n, dur * 0.2, dur * 0.4)[:, None]


# ---------------------------------------------------------------- score
def build_music():
    m = np.zeros((N, 2))
    pads = np.zeros((N, 2))
    # Harmony: A minor world, resolving to A major at the brand reveal ("the refresh").
    sections = [
        (["A2", "E3", "B3", "C4"], 0.0, 3.4, 0.10, (300, 900)),
        (["F2", "C3", "E3", "A3"], 3.0, 4.4, 0.12, (600, 1500)),
        (["A2", "E3", "G3", "C4", "B4"], 7.0, 3.4, 0.12, (700, 1700)),
        (["G2", "D3", "E3", "B3"], 10.0, 2.4, 0.12, (800, 1900)),
        (["F2", "C3", "E3", "A3"], 12.0, 2.4, 0.12, (900, 2100)),
        (["A2", "E3", "C4", "E4"], 14.0, 2.4, 0.13, (1000, 2600)),
        (["F2", "C3", "A3", "E4"], 16.0, 1.4, 0.13, (1400, 3000)),
        (["G2", "D3", "B3", "E4"], 17.0, 1.7, 0.14, (1800, 3600)),
        (["A2", "E3", "C#4", "E4", "B4"], 18.5, 2.5, 0.15, (2400, 1600)),
    ]
    for notes, t0, dur, g, cut in sections:
        sig, _ = pad_chord(notes, t0, dur, g * 2.0, cut)
        place(pads, sig, t0)
    # Low drone underpinning the dark opening.
    n = s(7.5)
    t = t_axis(n)
    drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.41 * t)) * fade(n, 2.5, 2.0) * 0.07
    place(pads, drone, 0.0)
    m += reverb(pads, 0.35)

    # Arpeggiated plucks from 3 s, ping-pong delay, building in brightness.
    arps = np.zeros((N, 2))
    pattern = {
        3.0: ["F4", "A4", "C5", "E5"], 7.0: ["A4", "C5", "E5", "B4"], 10.0: ["G4", "B4", "D5", "E5"],
        12.0: ["F4", "A4", "C5", "E5"], 14.0: ["A4", "C5", "E5", "A5"], 16.0: ["F4", "A4", "C5", "E5"], 17.0: ["G4", "B4", "D5", "E5"],
    }
    starts = sorted(pattern)
    t = 3.0
    i = 0
    while t < 18.45:
        sec = max(k for k in starts if k <= t + 1e-6)
        notes = pattern[sec]
        lvl = 0.07 if t < 14 else 0.09
        p = pluck(hz(notes[i % 4]), bright=0.6 + 0.4 * (t / 18.5))
        pan = 0.35 if i % 2 else 0.65
        place(arps, np.stack([p * (1 - pan), p * pan], axis=1), t, lvl)
        t += BEAT / 2
        i += 1
    d = s(BEAT * 0.75)
    delayed = np.zeros_like(arps)
    delayed[d:, 0] = arps[:-d, 1] * 0.35
    delayed[d:, 1] = arps[:-d, 0] * 0.35
    m += reverb(lp(arps + delayed, 6000), 0.25)

    # Rhythm: soft kick from 10 s, full groove + hats + sub 14–18.5 s.
    drums = np.zeros((N, 2))
    t = 10.0
    while t < 18.45:
        place(drums, kick(0.35 if t < 14 else 0.6), t)
        t += BEAT
    t = 14.0
    k = 0
    while t < 18.45:
        place(drums, hat(0.05 if k % 2 == 0 else 0.08), t)
        root = {14.0: "A1", 16.0: "F1", 17.0: "G1"}[max(x for x in (14.0, 16.0, 17.0) if x <= t + 1e-6)]
        place(drums, sub(hz(root)), t, 0.22)
        t += BEAT / 2
        k += 1
    m += drums

    # Brand reveal: A-major bells over the resolved pad.
    for j, nm in enumerate(["A4", "C#5", "E5", "B5"]):
        place(m, reverb(bell(hz(nm)), 0.45), 18.5 + j * 0.09, 0.05)

    # Section sidechain pump in the groove (gentle).
    pump = np.ones(N)
    t = 14.0
    while t < 18.45:
        i0 = s(t)
        L = s(BEAT)
        pump[i0 : i0 + L] = np.minimum(pump[i0 : i0 + L], 0.72 + 0.28 * np.minimum(1, np.arange(L) / s(0.18)))
        t += BEAT
    m[:, 0] *= pump
    m[:, 1] *= pump
    m *= fade(N, 0.6, 0.6)[:, None]
    return m


def build_sfx():
    fx = np.zeros((N, 2))
    E = EVENTS
    place(fx, riser(2.6), 0.4, 0.10)                                   # opening rise into the protector
    place(fx, reverb(glass_shimmer(1.8), 0.4), E["protector_seat"] - 1.6, 0.10)  # glass moving
    place(fx, whoosh(1.2, up=False, seed=11), E["protector_seat"] - 1.15, 0.07)
    place(fx, reverb(click(3400, 200), 0.2), E["protector_seat"], 0.5)  # precision click
    place(fx, sparkle(0.9, 22), E["protector_seat"] + 0.05, 0.05)      # light ripple
    for c in CUTS_WITH_FLASH:
        place(fx, whoosh(0.6, up=True, seed=int(c)), c - 0.42, 0.12)
    place(fx, whoosh(1.0, up=False, seed=21), E["lens_attach"] - 1.1, 0.06)
    place(fx, reverb(click(1500, 140), 0.2), E["lens_attach"], 0.5)     # magnetic-style click
    place(fx, whoosh(1.4, up=True, seed=31), E["case_snap"] - 1.5, 0.08)  # case approaches
    place(fx, reverb(snap(), 0.2), E["case_snap"], 0.55)                # case snap
    place(fx, sparkle(0.9, 16, seed=9), E["case_snap"] + 0.1, 0.045)    # light around edges
    place(fx, reverb(impact(1.6, 70, 34), 0.25), E["hero_impact"], 0.32)  # subtle bass impact
    place(fx, whoosh(1.6, up=True, seed=41), 14.6, 0.05)               # rotation air
    place(fx, whoosh(1.4, up=False, seed=42), 16.2, 0.04)
    place(fx, riser(1.2, seed=8), E["flood"] - 1.2, 0.11)
    place(fx, reverb(impact(2.4, 95, 30), 0.35), E["flood"], 0.42)      # brand reveal
    place(fx, reverb(sparkle(1.6, 14, seed=12), 0.5), E["flood"] + 0.05, 0.05)
    return fx * fade(N, 0.01, 0.5)[:, None]


# ---------------------------------------------------------------- voice-over
def load_audio(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def split_vo(x, expected):
    """Split a single VO take into lines on silences; returns list of arrays."""
    hop = s(0.01)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(hop * 3) / (hop * 3), "same")[::hop])
    db = 20 * np.log10(rms + 1e-9)
    speech = db > (db.max() - 38)
    regions, start, gap = [], None, 0
    for i, v in enumerate(speech):
        if v:
            if start is None:
                start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap > 22:  # 220 ms of silence ends a line
                regions.append((start, i - gap))
                start, gap = None, 0
    if start is not None:
        regions.append((start, len(speech) - 1))
    regions = [r for r in regions if (r[1] - r[0]) > 12]
    if len(regions) != expected:
        raise SystemExit(f"VO split found {len(regions)} lines, expected {expected}: {regions}")
    pad0, pad1 = s(0.03), s(0.12)
    return [x[max(0, a * hop - pad0) : b * hop + pad1] for a, b in regions]


def build_vo(path):
    lines = split_vo(load_audio(path), len(VO_LINES))
    vo = np.zeros((N, 2))
    for (text, t0), seg in zip(VO_LINES, lines):
        seg = hp(seg, 90) * fade(len(seg), 0.005, 0.06)
        print(f"VO  {t0:5.2f}s  {len(seg) / SR:4.2f}s  {text}")
        if t0 + len(seg) / SR > DURATION - 0.05:
            print("    warning: line runs past the end")
        place(vo, seg, t0)
    vo = vo / (np.sqrt(np.mean(vo[vo != 0] ** 2)) + 1e-9) * 0.11  # ~ -19 dBFS RMS while speaking
    return reverb(vo, 0.06)


def duck(bed, vo, depth_db=4.5):
    env = np.abs(vo).max(axis=1)
    a, r = np.exp(-1 / (SR * 0.04)), np.exp(-1 / (SR * 0.35))
    # one-pole follower on a decimated signal, then upsampled (fast + smooth)
    dec = 48
    e = env[: len(env) // dec * dec].reshape(-1, dec).max(axis=1)
    out = np.zeros_like(e)
    lvl = 0.0
    for i, v in enumerate(e):
        coef = a ** dec if v > lvl else r ** dec
        lvl = coef * lvl + (1 - coef) * v
        out[i] = lvl
    g = np.interp(np.arange(N), np.arange(len(out)) * dec, np.minimum(1, out / 0.05))
    gain = 10 ** (-depth_db * g / 20)
    return bed * gain[:, None]


def master(x, ceiling=0.89):
    x = np.tanh(x * 1.15) / np.tanh(1.15)  # gentle soft clip / glue
    return x / max(1e-9, np.abs(x).max()) * ceiling


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", str(path)],
                   input=pcm.tobytes(), check=True)


if __name__ == "__main__":
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    music, sfx = build_music(), build_sfx()
    write_wav(out / "music.wav", master(music))
    write_wav(out / "sfx.wav", master(sfx))
    bed = music * 0.9 + sfx
    write_wav(out / "mix_novo.wav", master(bed))
    if len(sys.argv) > 2:
        vo = build_vo(sys.argv[2])
        write_wav(out / "mix_vo.wav", master(duck(bed, vo) + vo))
    for f in sorted(out.glob("*.wav")):
        print(f.name)
