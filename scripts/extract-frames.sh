#!/usr/bin/env bash
# Converts a cinematic clip into scroll-scrubbable WebP frame sequences.
#
#   scripts/extract-frames.sh <video.mp4> <scene-id> [desktop-fps] [mobile-fps]
#
# scene-id: reveal | protection | case | power | complete
# Output:   public/cinematic/<scene-id>/desktop/0001.webp …  (1600px wide, 16:9)
#           public/cinematic/<scene-id>/mobile/0001.webp  …  (540x960 centre crop, 9:16)
# Then set `frames` for that scene in src/config/cinematic.ts using the printed counts.
set -euo pipefail
IN="$1"; SCENE="$2"; DFPS="${3:-24}"; MFPS="${4:-15}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/cinematic/$SCENE"
rm -rf "$OUT"; mkdir -p "$OUT/desktop" "$OUT/mobile"

ffmpeg -loglevel error -i "$IN" -an -vf "fps=$DFPS,scale=1600:-2:flags=lanczos" \
  -c:v libwebp -quality 74 -compression_level 5 "$OUT/desktop/%04d.webp"
ffmpeg -loglevel error -i "$IN" -an -vf "fps=$MFPS,crop=ih*9/16:ih,scale=540:960:flags=lanczos" \
  -c:v libwebp -quality 68 -compression_level 5 "$OUT/mobile/%04d.webp"

D=$(ls "$OUT/desktop" | wc -l); M=$(ls "$OUT/mobile" | wc -l)
echo "$SCENE: desktop=$D frames ($(du -sh "$OUT/desktop" | cut -f1)), mobile=$M frames ($(du -sh "$OUT/mobile" | cut -f1))"
echo "frames: { desktop: { path: \"/cinematic/$SCENE/desktop\", count: $D, ext: \"webp\" }, mobile: { path: \"/cinematic/$SCENE/mobile\", count: $M, ext: \"webp\" } },"
