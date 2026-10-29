#!/usr/bin/env bash
# Turns a recorded agent session (VHS mp4) into a README GIF: real time
# until the prompt is sent, the agent's work sped up (visible label), a
# hold on the final answer, and optionally a still of the result.
#   .github/demos/compose.sh <in.mp4> <out.gif> <prompt-sent s> <agent-done s> <hold s> <speed 8|16> [still.png]
set -euo pipefail
in="$1"; out="$2"; sent="$3"; done="$4"; hold="$5"; speed="$6"; still="${7:-}"
dir="$(dirname "$0")"
end=$(echo "$done + $hold" | bc)
inputs=(-i "$in" -i "$dir/speed-label-$speed.png")
graph="[0:v]trim=0:$sent,setpts=PTS-STARTPTS,fps=10,format=rgba[a];\
[0:v]trim=$sent:$done,setpts=(PTS-STARTPTS)/$speed,fps=5,format=rgba[b0];[b0][1:v]overlay=W-w-24:14[b];\
[0:v]trim=$done:$end,setpts=PTS-STARTPTS,fps=10,format=rgba[c];"
n=3; parts="[a][b][c]"
if [ -n "$still" ]; then
  inputs+=(-loop 1 -t 4 -i "$still")
  # The page (1280 wide) scaled into the terminal frame on the same background.
  graph+="[2:v]crop=1280:725:0:0,scale=1152:-2,pad=1200:680:(ow-iw)/2:(oh-ih)/2:color=0x1e1e2e,fps=10,format=rgba[d];"
  n=4; parts="[a][b][c][d]"
fi
graph+="${parts}concat=n=$n:v=1:a=0,split[x][y];[x]palettegen=max_colors=96:stats_mode=diff[p];[y][p]paletteuse=dither=none:diff_mode=rectangle"
ffmpeg -v error -y "${inputs[@]}" -filter_complex "$graph" "$out"
ls -la "$out"
