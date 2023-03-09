const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const dotenv = require('dotenv');
dotenv.config();

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// ADD GUILD COMMAND
		// The put method is used to fully refresh all commands in the guild with the current set
		// const data = await rest.put(
		// 	Routes.applicationGuildCommands(process..env.CLIENT_ID, process..env.GUILD_ID_TEST),
		// 	{ body: commands },
		// );

		// ADD GLOBAL COMMAND
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);

		// // DELETE Specific command
		// // for guild-based commands
		// rest.delete(Routes.applicationGuildCommand("clientId", "guildId", 'commandId'))
		// 	.then(() => console.log('Successfully deleted guild command'))
		// 	.catch(console.error);
		//
		// // for global commands
		// rest.delete(Routes.applicationCommand("clientId", 'commandId'))
		// 	.then(() => console.log('Successfully deleted application command'))
		// 	.catch(console.error);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
