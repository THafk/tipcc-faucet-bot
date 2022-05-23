# How to set up this bot:
open these files in any text editor: config.json, configbc.json.

## In configbc.json:
	put your bot userid in clientId,
	put your server id in guildId,
	put the token of your bot in token.

## In config.json:
	put the token of your bot in token
	put your userid in owner variable
	put role id in owner_role variable if you want people with a certain role to access (/addallowed, /removeallowed, /say) commands
	you can edit min/max $ value a user can get from faucet and time between claims via a slash command, so leave min, max, time_s as it is

after you have done all of that, run the build-commands.js file, after it will say that commands got registered - run faucet.js.

**Done! your bot is up and running**
