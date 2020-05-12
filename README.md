# discord-stats

A Discord utility to collect and display statistics about your server in (hopefully) a fashionable way.

To run, use docker which has nginx setup for the React SPA and Spring application.

```sh
docker build -t samoxive/discordstats .
docker run -e DISCORD_TOKEN=$DISCORD_TOKEN -p $WEB_PORT:80 samoxive/discordstats
```
