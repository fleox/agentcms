#!/usr/bin/env bash
# Renders a README demo GIF with VHS, then (optionally) appends a still of
# the result so the animation ends on what the commands produced.
#   .github/demos/render.sh theme
set -euo pipefail
name="$1"
gif=".github/assets/demo-$name.gif"
vhs ".github/demos/$name.tape"
still=""
case "$name" in
  theme) still="/tmp/agentcms-preview-aurora/.screenshots/home-desktop.png" ;;
esac
if [ -n "$still" ] && [ -f "$still" ]; then
  tmp=$(mktemp -d)
  # Same frame size as the tape (1200x680), the page scaled into a dark frame.
  ffmpeg -v error -y -i "$gif" -loop 1 -t 3.5 -i "$still" -filter_complex \
    "[1:v]crop=1280:725:0:0,scale=1152:-2,pad=1200:680:(ow-iw)/2:(oh-ih)/2:color=0x1e1e2e,fps=10,format=rgba[s];\
     [0:v]fps=10,format=rgba[g];[g][s]concat=n=2:v=1:a=0,split[a][b];[a]palettegen=max_colors=192[p];[b][p]paletteuse=dither=sierra2_4a" \
    "$tmp/out.gif"
  mv "$tmp/out.gif" "$gif"
  rm -rf "$tmp"
fi
ls -la "$gif"
