const Discord = require("discord.js")
const dotenv = require('dotenv');
dotenv.config();

class SendLog {
	/**
	 * Enum of type's log
	 * @typedef {T[keyof T]} valueOf<T>
	 * @template T
	 */
	static level = {
		INFO: "ℹ Info ℹ",
		SUCCESS: "✅ Success ✅",
		WARNING: "⚠ Warning ⚠",
		ERROR: "❌ Error ❌",
	}

	/**
	 *
	 * @param {Discord.Client} client
	 * @param {valueOf<level>} type
	 * @param {string} message
	 * @param {string} title
	 */
	static async sendLog(client, type, message, title = "") {
		// If instances are OK
		if (!(client instanceof Discord.Client) || !(Object.values(this.level).includes(type)) || typeof message !== "string" || typeof title !== "string") {
			console.error("Error when sending logs")
			return
		}

		// Message to send
		const logToSend = `**${type}  ${title ? title : ""}** : \n${message}`

		// Send to the console
		console.log(`${title} : ${message}`)

		// Send to the channel
		await client.channels.cache.get(process.env.LOG_CHANNEL_ID).send(logToSend).catch(e => console.error(e))

		// // Send to the developer
		// await client.users.cache.find(user => user.id === process..env.DEVELOPER_ID)
		// 	.createDM()
		// 	.then(DMChannel => DMChannel.send(logToSend))
		// 	.catch(err => {console.log(err.message)})
	}
}

module.exports = SendLog
