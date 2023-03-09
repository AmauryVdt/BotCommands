const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const icon = new AttachmentBuilder('./assets/WT_Esports_Standard.png');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Show commands and their descriptions'),
	async execute(interaction) {
		const embedMessage = new EmbedBuilder()
			.setColor(0xffd102)
			.setTitle('TSS Bot Help Menu')
			.setDescription('TSS Bot is a bot to get last TSS tournament for the War Thunder game.\n')
			.setThumbnail('attachment://WT_Esports_Standard.png')
			.addFields(
				{ name: 'ESPORT', value: ' ' },
				{ name: '/tournament:', value: '\nSet up channel to receive TSS tournament.' },
				{ name: '/feedback:', value: '\nForm to send some feedback or bug report.' },
				{ name: 'INFO', value: ' ' },
				{ name: '/ping:', value: '\nGet the current ping of the server and the API.' },
				{ name: '/user:', value: '\nGet info about the author of the command.' },
				{ name: '/server:', value: '\nGet info about the current server.' },
			);
		await interaction.reply({ embeds: [embedMessage], files: [icon], ephemeral: true });
	},
};
