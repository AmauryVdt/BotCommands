const { Events, EmbedBuilder} = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		}
		else if (interaction.isModalSubmit()) {
			if (interaction.customId === 'modalFeedback') {
				try {
					const emote = ':speech_left:';
					const typeFeedbackInput = interaction.fields.getTextInputValue('typeFeedbackInput');
					const contentFeedbackInput = interaction.fields.getTextInputValue('contentFeedbackInput');
					const feedback = `**${emote} ${typeFeedbackInput} ${emote}** <@${interaction.user.id}> said :\n${contentFeedbackInput}`;
					await interaction.client.channels.cache.get(process.env.FEEDBACK_CHANNEL_ID).send(feedback).catch(e => console.error(e));
					const responseEmbed = new EmbedBuilder()
						.setColor(0xffd102)
						.setDescription('Thank you, your submission was received successfully! We come back to you asap.');
					await interaction.reply({ embeds: [responseEmbed], ephemeral: true });
				}
				catch (error) {
					console.error('Error executing feedbackModal');
					console.error(error);
				}
			}
		}
	},
};
