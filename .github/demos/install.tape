# Install demo for the README: a REAL Claude Code session (agentcms plugin
# installed) creating a site on a test S3 bucket. Not reproducible as is:
# the recording is reviewed, then waits are sped up with a visible label.
#   .github/demos/compose.sh .github/demos/out/install.mp4 .github/assets/demo-install.gif <sent s> <done s> 8 8
Output ".github/demos/out/install.mp4"

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

Type `Install a new AgentCMS site "demo" in the agentcms-demo folder of my S3 bucket — same bucket and credential as my qa-s3 site, encrypted SQLite. Title: "Atlas Journal". Don't ask me anything, just give me the URL at the end.`
Sleep 1s
Enter
Sleep 600s
