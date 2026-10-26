# TEKAURA — THE REFRESH · Production plan (Stage 1)

21 s premium vertical ad · Higgsfield MCP generation · FFmpeg/Python post.

## Verified environment (2026-10-25)

| Item | Status |
|---|---|
| Higgsfield MCP | Connected (server "Highfield"). Plan: Plus. Balance: 1,199.75 credits |
| Logo / product refs in repo | None. Site uses a text wordmark, so a temporary TEKAURA wordmark is typeset for approval |
| FFmpeg 6.1.1, Python 3 + Pillow + NumPy | Available locally. Higgsfield sandbox also has ffmpeg/sox/ImageMagick |
| Blender | Not installed |
| Music generation | No general music model exposed (Suno absent; Sonilo is games-only). Soundtrack + SFX composed/synthesised originally in Python, so the audio is fully original and licence-free |

## Model choices (verified, quoted with get_cost)

| Use | Model | Why | Quoted cost |
|---|---|---|---|
| Master + keyframe stills | GPT Image 2.5 (high, 2K, 9:16) | Photoreal, strong reference-image editing for same-phone variants | 2.75 cr / image |
| Main video | Kling 4.0, 1080p, 9:16, image-to-video with start + end keyframes | First/last-frame control keeps geometry locked; 3–30 s | ~1 cr / second |
| Fallback hero shots | Seedance 2.5, 1080p, omni-reference | Better motion physics if Kling fails a shot | 80 cr / 5 s (35 at 720p) |
| British voice-over | ElevenLabs v4 | | ~0.7 cr / take |

## Consistency strategy — keyframe-locked

1. **Master reference** (K0): generic premium graphite smartphone, flat-edged metal frame, triple-lens rear module, floating in a #070707 studio with a thin white rim light.
2. **Keyframes** are made by editing K0 (reference image), so every state is the *same* phone:
   - K1 worn front: scratches, fingerprints, narrow light
   - K2 pristine front: screen protector applied
   - K3 rear, bare camera module
   - K4 rear with lens protector
   - K5 clear case, empty, floating (rotated)
   - K6 phone in clear case, 3/4 rear
   - K7 final hero, cased, front 3/4, centre-low framing with headroom for the wordmark
3. **Each video shot** = Kling 4.0 interpolating between two approved keyframes, with restrained camera moves. No text and no logos in generation.
4. **Accessory fits**: if AI warps the protector or case, that moment is composited in Python instead. That means a perspective-tracked glass plate with a light sweep over the plate, or a deliberate cinematic cut with flash and snap SFX. Wrong product geometry is never accepted.

## Shot list (9:16, generated slightly long and trimmed to timing)

| # | Time | Keyframes | Gen length | Move | Overlay |
|---|---|---|---|---|---|
| 1 Old phone | 0–3 s | K1→K1 (push-in) | 4 s | Narrow light reveals worn screen, slow dolly in | YOUR PHONE DESERVES BETTER. |
| 2 Screen refresh | 3–7 s | K1→K2 | 5 s | Macro, protector descends, ripple of light | CRYSTAL CLEAR. |
| 3 Camera protection | 7–10 s | K3→K4 | 4 s | Orbit to rear, lens protector aligns | EVERY DETAIL PROTECTED. |
| 4 Perfect case | 10–14 s | K5→K6 | 5 s | Pull back, case rotates, phone seats | THE PERFECT FIT. |
| 5 Transformation | 14–18 s | K6→K7 | 5 s | Smooth hero orbit | PROTECT. / REFRESH. / REPEAT. |
| 6 Reveal | 18–21 s | K7→K7 (drift) | 4 s | Settle, beam crosses frame, background goes darker | TEKAURA · REFRESH YOUR PHONE. · PROTECT IT. STYLE IT. LOVE IT AGAIN. |

## Post-production

- Trim to frame-exact timing; motivated cuts (light-flash or whip with motion blur), never morphs between shapes.
- Unified grade: crushed #070707 blacks, neutral silver mids, a little warmth in highlights, fine grain to glue shots together.
- Typography: Geist-style geometric sans in wide-tracked uppercase, animated with a fade, blur-in and 8 px rise, rendered with Pillow and composited in FFmpeg.
- Audio: original Python-synthesised score (sub-pad → pulse → build → resolve), plus synthesised glass, click, whoosh, snap, bass-hit and shimmer SFX. VO ducked about 6 dB under the music bed.
- 60 fps: Kling outputs ~24 fps. Try motion-compensated interpolation per shot. Deliver at 60 only if glass edges stay clean, otherwise 30 fps.

## Deliverables

1. `tekaura-refresh-9x16.mp4`: 1080×1920, 21 s, with VO
2. `tekaura-refresh-16x9.mp4`: 1920×1080, 21 s, from native 16:9 keyframes and video (not a crop)
3. `tekaura-refresh-web-loop.mp4`: silent, minimal text, loop-friendly

## Budget

| Stage | Generations | Credits |
|---|---|---|
| 2. Master image (4 variants) | 4 | 11 |
| 3a. Keyframes K1–K7 (2 variants each) | 14 | 38.5 |
| 3b. Video 9:16 (6 shots × 2 takes, 27 s each pass) | 12 | ~54 |
| VO (2 takes) | 2 | ~1.5 |
| **Core 9:16 total** | | **≈105** |
| 16:9 native pass (keyframes + 6 shots × 1–2 takes) | ~18 | ~75 |
| Contingency (re-takes, up to 2 Seedance 2.5 fallback shots) | | ~170 |
| **Ceiling requested** | | **350 credits** (about 29% of balance) |
