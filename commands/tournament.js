const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament')
		.setDescription('Set channels to send tournament.')
		.addChannelOption(option =>
			option.setName('abchannel')
				.setDescription('The channel to send TSS Arcade Battle Tournament')
				.addChannelTypes(0)
				.setRequired(false))
		.addChannelOption(option =>
			option.setName('rbchannel')
				.setDescription('The channel to send TSS Realistic Battle Tournament')
				.addChannelTypes(0)
				.setRequired(false))
		.addChannelOption(option =>
			option.setName('sbchannel')
				.setDescription('The channel to send TSS Simulator Battle Tournament')
				.addChannelTypes(0)
				.setRequired(false))
		.setDefaultMemberPermissions(0),
	async execute(interaction) {
		const { guild, options } = interaction;
		const abChannel = options.getChannel('abchannel');
		const rbChannel = options.getChannel('rbchannel');
		const sbChannel = options.getChannel('sbchannel');
		await interaction.reply(`You just use the tournament command with the following options : ${abChannel !== null ? 'Arcade Channel: ' + abChannel.name : ''} ${rbChannel !== null ? 'Realistic Channel: ' + rbChannel.name : ''} ${sbChannel !== null ? 'Simulator Channel' + sbChannel.name : ''}`);
	},
};
