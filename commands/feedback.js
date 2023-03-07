const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Send your feedback or bug report.'),
	async execute(interaction) {
		const modal = new ModalBuilder()
			.setCustomId('modalFeedback')
			.setTitle('TSS Bot Feedback');

		// Create the text input components
		const typeFeedbackInput = new TextInputBuilder()
			.setCustomId('typeFeedbackInput')
			// The label is the prompt the user sees for this input
			.setLabel('What is the type of the feedback ?')
			// Short means only a single line of text
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Feedback, Bug Report, etc')
			.setRequired(true);

		const contentFeedbackInput = new TextInputBuilder()
			.setCustomId('contentFeedbackInput')
			.setLabel('Your feedback :')
			// Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(2000)
			.setPlaceholder('Tell us everything !')
			.setRequired(true);


		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('selectFeedback')
			.setPlaceholder('Type')
			.addOptions(
				{
					label: 'Bug',
					description: 'To send a bug report to the Team',
					value: 'bug',
				},
				{
					label: 'feedback',
					description: 'To send a feedback to the Team',
					value: 'feedback',
				},
			);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder().addComponents(typeFeedbackInput);
		const secondActionRow = new ActionRowBuilder().addComponents(contentFeedbackInput);
		const thirdActionRow = new ActionRowBuilder().addComponents(selectMenu);

		// Add inputs to the modal
		modal.addComponents(firstActionRow, secondActionRow/*, thirdActionRow*/);

		// Show the modal to the user
		await interaction.showModal(modal);
	},
};
