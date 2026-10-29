# Theme authoring demo for the README: real agentcms CLI, no site involved.
#   .github/demos/render.sh theme   (from the repository root; needs vhs, ttyd, ffmpeg)
Output .github/assets/demo-theme.gif

Set Shell "bash"
Set FontSize 18
Set Width 1200
Set Height 680
Set Padding 24
Set Theme "Catppuccin Mocha"
Set TypingSpeed 45ms
Set WindowBar Colorful

Hide
Type "export TMPDIR=/tmp PS1='\[\e[38;5;141m\]❯\[\e[0m\] ' && rm -rf /tmp/demo /tmp/agentcms-preview-aurora && mkdir /tmp/demo && cd /tmp/demo && clear"
Enter
Sleep 500ms
Show

Type "npx -y @agent-cms/agentcms ext new theme aurora --with settings,block"
Sleep 400ms
Enter
Sleep 4s

Type "cd aurora && npm install"
Sleep 300ms
Enter
Hide
Sleep 25s
Type "clear"
Enter
Sleep 300ms
Show

Type "npm run build"
Sleep 300ms
Enter
Sleep 4s

Type "npm run check"
Sleep 300ms
Enter
Sleep 4s

Type "clear && npm run preview"
Sleep 300ms
Enter
Hide
Sleep 50s
Show
Sleep 5s
