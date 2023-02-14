const { Events } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		if (process.env.APP_ENV === 'PRODUCTION') {
			console.log('Production');
		}
		else if (process.env.APP_ENV === 'DEBUG') {
			console.log('Debug');
		}
		else {
			console.log('APP_ENV not set yet, please set up the variable');
		}
		client.user.setPresence({ activities: [{ name: process.env.APP_ENV === 'PRODUCTION' ? 'WarThunder' : 'Coding the bot' }], status: 'idle' });
		console.log(`Activity set to "${client.user.presence.activities[0].name}"`);
	},
};
