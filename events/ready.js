const { Events } = require('discord.js');
const tournament = require('../methods/tournaments');
const dotenv = require('dotenv');
const log = require('../methods/sendLogs');
dotenv.config();

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		if (!process.env.APP_ENV) {	console.log('APP_ENV not set yet, please set up the variable');	}
		console.log(`Ready! Logged in as ${client.user.tag} in ${process.env.APP_ENV}`);
		client.user.setPresence({ activities: [{ name: process.env.APP_ENV === 'PRODUCTION' ? 'WarThunder' : 'Coding the bot' }], status: 'online' });
		console.log(`Activity set to "${client.user.presence.activities[0].name}"`);
		await tournament.tournament(client).catch(err => console.error(err));
	},
};
