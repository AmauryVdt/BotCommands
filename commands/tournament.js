const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament')
		.setDescription('Set channels to send tournament.')
		.addStringOption(option =>
			option.setName('abchannel')
				.setDescription('The channel to send TSS Arcade Battle Tournament')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('rbchannel')
				.setDescription('The channel to send TSS Realistic Battle Tournament')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('sbchannel')
				.setDescription('The channel to send TSS Simulator Battle Tournament')
				.setRequired(false)),
		// .setDefaultMemberPermissions([Permissions.]),
	async execute(interaction) {
		const abChannel = interaction.options.getString('abchannel');
		await interaction.reply(`You just use the tournament command with the following options : ${interaction}`);
	},
};
