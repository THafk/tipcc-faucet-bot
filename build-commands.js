const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./configbc.json');

const commands = [
	new SlashCommandBuilder().setName('allowed').setDescription('Check allowed currencies to faucet'),
	new SlashCommandBuilder().setName('help').setDescription('How to use the bot'),
	new SlashCommandBuilder().setName('say').setDescription('Say what you will type').addStringOption(option =>
		option.setName('text')
			.setDescription('This will be said by the bot')
			.setRequired(true)),
    new SlashCommandBuilder().setName('bals').setDescription('Check the balances in the faucet'),
	new SlashCommandBuilder().setName('bal').setDescription('Check the balance of a specific currency in the faucet').addStringOption(option =>
		option.setName('currency')
			.setDescription('Check specific balance')
			.setRequired(true)),
	new SlashCommandBuilder().setName('addallowed').setDescription('Add currency to be available to faucet').addStringOption(option =>
		option.setName('emojiid')
			.setDescription('Emoji that will show in /allowed command. Like this: <:EXAMPLE:964789657816593808>')
			.setRequired(true)).addStringOption(option =>
				option.setName('currency')
					.setDescription('Currency to add to faucet')
					.setRequired(true)),
	new SlashCommandBuilder().setName('removeallowed').setDescription('Remove currency from being available to faucet').addStringOption(option =>
		option.setName('currency')
			.setDescription('currency to remove from faucet')
			.setRequired(true)),
	new SlashCommandBuilder().setName('faucet').setDescription('Receive a faucet reward').addStringOption(option =>
		option.setName('currency')
			.setDescription('Currency to faucet')
			.setRequired(true)),
	new SlashCommandBuilder().setName('setfaucettimeout').setDescription('Set the time between faucet claims').addIntegerOption(option =>
		option.setName('time')
			.setDescription('Input time is seconds')
			.setRequired(true)),
	new SlashCommandBuilder().setName('setfaucetreward').setDescription('Set the min and max amounts a user can get from faucet').addNumberOption(option =>
		option.setName('min')
			.setDescription('Input the minimum value a user can get')
			.setRequired(true)).addNumberOption(option =>
				option.setName('max')
					.setDescription('Input the maximum value a user can get')
					.setRequired(true)),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
