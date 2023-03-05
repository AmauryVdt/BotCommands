const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Send your feedback or bug report.'),
	async execute(interaction) {
		await interaction.reply('Work In Progress');
	},
};
