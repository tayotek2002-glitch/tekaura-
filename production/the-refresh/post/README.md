# Post-production pipeline — THE REFRESH

All timing lives in `timeline.py`. Everything here is original: the score and SFX are synthesised in
`audio.py` (no samples), and typography uses Geist (SIL Open Font License, bundled in `fonts/`).

```bash
python3 audio.py OUT_DIR vo.mp3                     # music.wav, sfx.wav, mix_novo.wav, mix_vo.wav
python3 build.py CLIPS_DIR out.mp4 --fps 60 --audio OUT_DIR/mix_vo.wav            # main 9:16
python3 build.py CLIPS_DIR web.mp4 --fps 60 --variant web                          # silent web loop
python3 build.py CLIPS_DIR preview.mp4 --fps 24 --preview --audio OUT_DIR/mix_vo.wav
```
