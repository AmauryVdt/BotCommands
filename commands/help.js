const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Show commands and their descriptions'),
	async execute(interaction) {
		const embedMessage = new EmbedBuilder()
			.setTitle('Help')
			.setDescription('All available commands :')
			.setColor(0xffd102);
		await interaction.reply({ embeds: [embedMessage] });
	},
};
