const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		const responseEmbed = new EmbedBuilder()
			.setColor(0xffd102)
			.setDescription(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
		await interaction.reply({ embeds: [responseEmbed], ephemeral: true });
	},
};
