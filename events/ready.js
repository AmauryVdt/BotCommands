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
		log.sendLog(client, log.level.SUCCESS, `Ready! Logged in as ${client.user.tag} in ${process.env.APP_ENV}`, 'Connexion').catch(e => console.error(e.message));
		client.user.setPresence({ activities: [{ name: process.env.APP_ENV === 'PRODUCTION' ? 'War Thunder' : 'Coding the bot' }], status: 'online' });
		log.sendLog(client, log.level.INFO, `Activity set to "${client.user.presence.activities[0].name}"`, 'Presence').catch(e => console.error(e.message));
		await tournament.tournament(client).catch(err => console.error(err));
	},
};
