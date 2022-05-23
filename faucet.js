const Discord = require("discord.js");  
const {
    Client,
    Intents
} = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
const { token, owner, owner_role } = require('./config.json');
var fs = require('fs');

client.once('ready', () => {
	console.log('Ready!');
});

function getrand(){
	var cfg = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
	var rand = Math.random() < 0.5 ? ((1 - Math.random()) * (cfg.max - cfg.min) + cfg.min) : (Math.random() * (cfg.max - cfg.min) + cfg.min);
	var power = Math.pow(10, 4);
    return Math.floor(rand * power) / power;
}

function checkowner(interaction){
	for(i=0; i<interaction.member._roles.length; i++){
		if(interaction.member._roles[i]===owner_role || interaction.user.id===owner){
			return true;
		}
	}
	return false;
}

function getembed(){
	var cfg = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
	embedallow='';
	for(i=0, c=1;i<embedallowraw.length;i++, c++){
		embedallow+=embedallowraw[i]+' ';
		if(c===2){
			c=0;
			embedallow+='\n';
		}
	}
	const allowedList = {
		color: 0x0099ff,
		title: 'List of available currencies to faucet',
		description: `You will get the random amount between: ${cfg.min}$ - ${cfg.max}$`,
		fields: [
			{
				name: 'Currencies',
				value: embedallow,
			}
		],
		footer: {
			text: 'Thank you for using this faucet',
		},
	};
	return allowedList;
}

function gettime(times, userid){
	for(i=0; i<times.length; i+=2){
		if(times[i]===userid){
			user_time=times[i+1];
		}
	}
	if(Math.floor(((user_time/60)/60)/24)>0){
		return ((user_time/60)/60)/24+' days';
	}
	else if(Math.floor((user_time/60)/60)>0){
		console.log()
		return Math.floor((user_time/60)/60)+' hours';
	}
	else if(Math.floor(user_time/60)>0){
		return Math.floor(user_time/60)+' minutes';
	}
	else{
		return user_time+' seconds';
	}
}

function addPersonToAwait(userid){
	var time = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
	fs.readFile('faucet_time.json', 'utf8', function readFileCallback(err, data){
		if (err){
			console.log(err);	
		} else {
		obj = JSON.parse(data);
		obj.awaiting.push(userid.toString(), time.time_s);
		json = JSON.stringify(obj);
		fs.writeFile('faucet_time.json', json, 'utf8', function(err){
			if(err) return console.log(err);});
	}});
}

function getUserLeftTime(times, userid){
	for(i=0;i<times.length;i+=2){
		if(times[i]===userid){
			return true;
		}
	}
	return false;
}

async function addAllowed(interaction, emojiid, currency){
	if((emojiid[0]+emojiid[1]==='<:'||emojiid[0]+emojiid[1]+emojiid[2]==='<a:') && emojiid[emojiid.length-1]==='>'){
		fs.readFile('faucet_allow.json', 'utf8', function readFileCallback(err, data){
			if (err){
				console.log(err);	
			} else {
			obj = JSON.parse(data);
			obj.allowed.push(emojiid, currency.toUpperCase());
			json = JSON.stringify(obj);
			fs.writeFile('faucet_allow.json', json, 'utf8', async function(err){
				if(err) return console.log(err);
				await interaction.reply({embeds: [
					new Discord.MessageEmbed()
						.setTitle(`✅ Command successful`)
						.setDescription(`<@${interaction.user.id}> New currency allowed successfully.`)
						.setColor('GREEN')
				], ephemeral: true});
			});
		}});
	}
	else{
		await interaction.reply({embeds: [
			new Discord.MessageEmbed()
				.setTitle(`🚫 Command error`)
				.setDescription(`Please provide a correct emoji id.`)
				.setColor('DARK_RED')
		], ephemeral: true});
	}
}

async function removeAllowed(interaction,currency){
	fs.readFile('faucet_allow.json', 'utf8', function readFileCallback(err, data){
		if (err){
			console.log(err);	
		} else {
		obj = JSON.parse(data);
		var buf=[], c=0;
		for(i=0; i<obj.allowed.length; i++){
			if(currency.toUpperCase()===obj.allowed[i]||currency.toUpperCase()===obj.allowed[i+1]){
				continue;
			}
			else{
				buf[c]=obj.allowed[i];
				c++;
			}
		}
		if(obj.allowed.length===buf.length){
			interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`🚫 Command error`)
					.setDescription(`<@${interaction.user.id}> Currency you specified is already not allowed.`)
					.setColor('DARK_RED')
			], ephemeral: true});
		}
		else{
			interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`✅ Command successful`)
					.setDescription(`<@${interaction.user.id}> Currency is not allowed anymore.`)
					.setColor('GREEN')
			], ephemeral: true});
		}
		obj.allowed=buf;
		json = JSON.stringify(obj);
		fs.writeFile('faucet_allow.json', json, 'utf8', async function(err){
			if(err) return console.log(err);
		});
	}});
}

client.on('interactionCreate', async interaction => {
	var allowed = JSON.parse(fs.readFileSync('./faucet_allow.json', 'utf8'));
	var userOnWait = JSON.parse(fs.readFileSync('./faucet_time.json', 'utf8'));
    if (!interaction.isCommand()) return;
	if (interaction.commandName === 'allowed') {
		embedallowraw=allowed.allowed;
		await interaction.reply({ embeds: [getembed()] });
	}
	if (interaction.commandName === 'bals') {
		await interaction.reply('$bals top noembed');
	}
	if (interaction.commandName === 'faucet') {
		var check = false;
		for(i=1;i<allowed.allowed.length;i+=2){
			if(interaction.options.getString('currency').toUpperCase()===allowed.allowed[i]){
				check=true;
			}
		}
		if(!check){
			await interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`🚫 Command error`)
					.setDescription(`<@${interaction.user.id}> currency ${interaction.options.getString('currency')} is not allowed to faucet.`)
					.setFooter({ text: `Hint: Check allowed currencies with /allowed` })
					.setColor('DARK_RED')
			], ephemeral: true});
		}
		else if(check){
			if(getUserLeftTime(userOnWait.awaiting, interaction.user.id)){
				await interaction.reply({embeds: [
					new Discord.MessageEmbed()
						.setTitle(`🚫 Command error`)
						.setDescription(`<@${interaction.user.id}> You just received the faucet reward, you need to wait ${gettime(userOnWait.awaiting, interaction.user.id)}`)
						.setColor('DARK_RED')
				], ephemeral: true});
			}
			else{
			await interaction.reply(`<@617037497574359050>tip <@${interaction.user.id}> ${getrand()}$ ${interaction.options.getString('currency')}`);
				addPersonToAwait(interaction.user.id);
			}
		}
	}
	if (interaction.commandName === 'bal') {
		await interaction.reply(`$bal ${interaction.options.getString('currency')} noembed`);
	}
	if (interaction.commandName === 'say') {
		if(checkowner(interaction)){
			await interaction.reply(interaction.options.getString('text'));
		}
		else{
			await interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`🚫 Command error`)
					.setDescription(`<@${interaction.user.id}> You don't have the rights to use this command.`)
					.setColor('DARK_RED')
			]});
		}
	}
	if (interaction.commandName === 'addallowed') {
		if(checkowner(interaction)){
			addAllowed(interaction, interaction.options.getString('emojiid'), interaction.options.getString('currency'));
		}
		else{
			await interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`🚫 Command error`)
					.setDescription(`<@${interaction.user.id}> You don't have the rights to use this command.`)
					.setColor('DARK_RED')
			]});
		}
	}
	if (interaction.commandName === 'removeallowed') {
		if(checkowner(interaction)){
			removeAllowed(interaction,interaction.options.getString('currency'));
		}
		else{
			await interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`🚫 Command error`)
					.setDescription(`<@${interaction.user.id}> You don't have the rights to use this command.`)
					.setColor('DARK_RED')
			]});
		}
	}
	if (interaction.commandName === 'setfaucettimeout') {
		if(checkowner(interaction)){
			fs.readFile('config.json', 'utf8', function readFileCallback(err, data){
				if (err){
					console.log(err);	
				} else {
				obj = JSON.parse(data);
				obj.time_s=interaction.options.getInteger('time')
				json = JSON.stringify(obj);
				fs.writeFile('config.json', json, 'utf8', function(err){
					if(err) return console.log(err);});
			}});
			await interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`✅ Command successful`)
					.setDescription(`<@${interaction.user.id}> Time between faucet claims changed successfully!`)
					.setColor('GREEN')
			], ephemeral: true});
		}
		else{
			await interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`🚫 Command error`)
					.setDescription(`<@${interaction.user.id}> You don't have the rights to use this command.`)
					.setColor('DARK_RED')
			]});
		}
	}
	if (interaction.commandName === 'setfaucetreward') {
		if(checkowner(interaction)){
			fs.readFile('config.json', 'utf8', function readFileCallback(err, data){
				if (err){
					console.log(err);	
				} else {
				obj = JSON.parse(data);
				if(interaction.options.getNumber('min')>interaction.options.getNumber('max')){
					obj.min=interaction.options.getNumber('max');
					obj.max=interaction.options.getNumber('min');
				}
				else{
					obj.min=interaction.options.getNumber('min');
					obj.max=interaction.options.getNumber('max');
				}
				json = JSON.stringify(obj);
				fs.writeFile('config.json', json, 'utf8', function(err){
					if(err) return console.log(err);});
			}});
			await interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`✅ Command successful`)
					.setDescription(`<@${interaction.user.id}> Faucet rewards changed successfully!`)
					.setColor('GREEN')
			], ephemeral: true});
		}
		else{
			await interaction.reply({embeds: [
				new Discord.MessageEmbed()
					.setTitle(`🚫 Command error`)
					.setDescription(`<@${interaction.user.id}> You don't have the rights to use this command.`)
					.setColor('DARK_RED')
			]});
		}
	}
	if (interaction.commandName === 'help') {
		const help = {
			color: 0x0099ff,
			title: 'How to use the bot',
			fields: [
				{
					name: 'How to claim a faucet reward?',
					value: 'To get a faucet reward type /faucet <coin_name>',
				},
				{
					name: 'How to check allowed currencies?',
					value: 'To see the list of allowed currencies to faucet type /allowed',
				},
				{
					name: 'How to check the balance of the faucet?',
					value: 'To check the balance of the faucet type /bals to see all alances; /bal <coin_name> to see a balance of a specific currency',
				}
			],
			footer: {
				text: 'Thank you for using this faucet',
			},
		};
		await interaction.reply({embeds:[help], ephemeral: true});
	}
});

function removeUsersFromAwait(arr, value) {
	var i = 0;
	while (i < arr.length) {
	  if (arr[i] === value) {
		arr.splice(i, 1);
	  } else {
		++i;
	  }
	}
	return arr;
  }

function faucettime(){
	fs.readFile('faucet_time.json', 'utf8', function readFileCallback(err, data){
		if (err){
			console.log(err);	
		} else {
		obj = JSON.parse(data);
		if(obj.awaiting.length>=2){
			for(i=1;i<obj.awaiting.length;i+=2){
				obj.awaiting[i]=parseInt(obj.awaiting[i])-1;
				if(obj.awaiting[i]<=0){
					obj.awaiting=removeUsersFromAwait(obj.awaiting, obj.awaiting[i]);
					obj.awaiting=removeUsersFromAwait(obj.awaiting, obj.awaiting[i-1]);
				}
			}
		}
		json = JSON.stringify(obj);
		fs.writeFile('faucet_time.json', json, 'utf8', function(err){
			if(err) return console.log(err);});
	}});
}
setInterval(faucettime, 1000);

client.login(token);