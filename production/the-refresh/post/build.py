"""THE REFRESH — assemble, grade, title and encode.

usage: python3 build.py CLIPS_DIR OUT.mp4 --fps 60 [--interp mci|none] [--variant main|web]
                        [--audio MIX.wav] [--preview]
"""
import argparse
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from timeline import DURATION, END_CARD_START, H, SEGMENTS, W  # noqa: E402

HERE = Path(__file__).parent

# Grade: gentle S-curve, soft vignette, a little warmth in the highlights only, blacks floored at #070707, fine grain.
GRADE = ("curves=all='0/0 0.25/0.215 0.75/0.785 1/1',"
         "vignette=angle=PI/5,"
         "colorbalance=rh=0.025:gh=0.008:bh=-0.025,"
         "colorlevels=romin=0.0275:gomin=0.0275:bomin=0.0275,"
         "noise=alls=3:allf=t")


def run(cmd):
    print("+", " ".join(cmd) if len(" ".join(cmd)) < 400 else cmd[0] + " …", flush=True)
    subprocess.run(cmd, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clips")
    ap.add_argument("out")
    ap.add_argument("--fps", type=float, default=60)
    ap.add_argument("--interp", default="mci")
    ap.add_argument("--variant", default="main")
    ap.add_argument("--audio")
    ap.add_argument("--preview", action="store_true")
    a = ap.parse_args()

    clips = Path(a.clips)
    work = Path(a.out).with_suffix("")
    work = work.parent / (work.name + "_work")
    work.mkdir(parents=True, exist_ok=True)
    fps = a.fps
    vw, vh = (540, 960) if a.preview else (W, H)

    # 1. Conform each shot: trim, retime to its slot, 1080x1920, target fps (motion-compensated when retimed/upsampled).
    seg_files = []
    for i, (g0, gdur, clip, sin, sout) in enumerate(SEGMENTS):
        speed = (sout - sin) / gdur
        interp = (f"minterpolate=fps={fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
                  if a.interp == "mci" and not a.preview else f"fps={fps}")
        vf = (f"trim=start={sin}:end={sout},setpts=(PTS-STARTPTS)/{speed:.6f},"
              f"scale={vw}:{vh}:flags=lanczos,setsar=1,{interp},trim=duration={gdur}")
        is_last = i == len(SEGMENTS) - 1
        if is_last:  # hold the final hero frame under the end card
            vf += f",tpad=stop_mode=clone:stop_duration={DURATION - END_CARD_START + 0.1}"
        out = work / f"seg{i + 1}.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-i", str(clips / clip), "-vf", vf, "-an",
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "10", "-pix_fmt", "yuv420p", str(out)])
        seg_files.append(out)

    # 2. Concatenate and grade.
    lst = work / "concat.txt"
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in seg_files))
    base = work / "base.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
         "-vf", f"{GRADE},fps={fps},trim=duration={DURATION}", "-an",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "10", "-pix_fmt", "yuv420p", str(base)])

    # 3. Titles / light / end card overlay streamed from Python, plus audio, final encode.
    ov = subprocess.Popen([sys.executable, str(HERE / "overlay.py"), "stream", str(fps), a.variant], stdout=subprocess.PIPE)
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(base),
           "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-"]
    if a.audio:
        cmd += ["-i", a.audio]
    scale = f",scale={vw}:{vh}" if a.preview else ""
    cmd += ["-filter_complex", f"[1:v]setpts=PTS-STARTPTS{scale}[ov];[0:v][ov]overlay=format=auto:shortest=1,format=yuv420p[v]",
            "-map", "[v]"]
    if a.audio:
        cmd += ["-map", "2:a", "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-c:a", "aac", "-b:a", "320k", "-ar", "48000"]
    if a.preview:
        cmd += ["-c:v", "libx264", "-preset", "veryfast", "-crf", "24"]
    else:
        cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high", "-level", "4.2",
                "-x264-params", "keyint=60:min-keyint=30", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
    cmd += ["-r", str(fps), "-t", str(DURATION), "-movflags", "+faststart", a.out]
    print("+ overlay | ffmpeg …", flush=True)
    subprocess.run(cmd, stdin=ov.stdout, check=True)
    ov.wait()
    print("done", a.out)


if __name__ == "__main__":
    main()
