# Content demo for the README: a REAL Claude Code session (agentcms plugin
# installed) publishing Markdown articles and switching theme on the demo site. Not reproducible as is:
# the recording is reviewed, then waits are sped up with a visible label.
#   .github/demos/compose.sh .github/demos/out/content.mp4 .github/assets/demo-content.gif <sent s> <done s> 9 16 <live screenshot>
Output ".github/demos/out/content.mp4"

Set Shell "bash"
Set FontSize 16
Set Width 1200
Set Height 680
Set Padding 20
Set Theme "Catppuccin Mocha"
Set TypingSpeed 35ms
Set WindowBar Colorful

Hide
# Clean environment: only the demo folder's settings (agentcms plugin
# enabled, agentcms CLI pre-approved); the folder was trusted beforehand.
Type "unset $(compgen -e | grep -E '^CLAUDE') && alias claude='claude --setting-sources project,local' && export PS1='\[\e[38;5;141m\]❯\[\e[0m\] ' && cd /tmp/agentcms-demo-agent && clear"
Enter
Sleep 500ms
Show

Type "claude"
Enter
Sleep 7s

Type `Publish the articles in ./atlas-journal (Markdown + their photos) on my demo site, then switch it to the magazine theme.`
Sleep 1s
Enter
Sleep 1500s
