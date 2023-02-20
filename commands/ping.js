const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong! And show the latency.'),
	async execute(interaction) {
		const responseEmbed = new EmbedBuilder()
			.setColor('Yellow')
			.setDescription(`🏓 Server latency is ${Date.now() - interaction.createdTimestamp}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`);
		await interaction.reply({ embeds: [responseEmbed] });
	},
};
