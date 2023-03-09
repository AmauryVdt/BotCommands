const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, PermissionsBitField } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

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
				.setRequired(false)),
	// .setDefaultMemberPermissions(0),
	async execute(interaction) {
		const { guild, options } = interaction;

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			interaction.reply({ content: 'Sorry, you can\'t run this command. You need administration role.', ephemeral: true })
			return;
		}

		const abChannel = options.getChannel('abchannel');
		const rbChannel = options.getChannel('rbchannel');
		const sbChannel = options.getChannel('sbchannel');

		const getChannelId = channel => channel != null ? channel.id : null;

		const errEmbed = new EmbedBuilder()
			.setDescription('Something went wrong. Please try again later.')
			.setColor(0xc72c3b);

		const successEmbed = new EmbedBuilder()
			.setTitle('Tournament channels are set up')
			.setDescription(`
				Arcade :    ${abChannel !== null ? `<#${abChannel.id}>` : 'Disable'}\n
				Realistic : ${rbChannel !== null ? `<#${rbChannel.id}>` : 'Disable'}\n
				Simulator : ${sbChannel !== null ? `<#${sbChannel.id}>` : 'Disable'}\n
			`)
			.setColor(0xffd102);

		if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
		}

		await prisma.tournament_settings.upsert({
			where: {
				guild_id: guild.id,
			},
			update: {
				ab_channel: getChannelId(abChannel),
				rb_channel: getChannelId(rbChannel),
				sb_channel: getChannelId(sbChannel),
			},
			create: {
				id: uuidv4(),
				guild_id: guild.id,
				ab_channel: getChannelId(abChannel),
				rb_channel: getChannelId(rbChannel),
				sb_channel: getChannelId(sbChannel),
			},
		})
			.then(async () => {
				await prisma.$disconnect();
			})
			.catch(async (e) => {
				console.error(e);
				await prisma.$disconnect();
				await interaction.reply({ embeds: [errEmbed], ephemeral: true });
			});

		await interaction.reply({ embeds: [successEmbed] });
	},
};
