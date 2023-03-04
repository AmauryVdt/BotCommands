// const config = require("../config.json")
const FormData = require('form-data')
const fetch = require('node-fetch');
const { Client, EmbedBuilder  } = require("discord.js")
const log = require("./sendLogs.js")
const generate_image = require("./puppeteer")
const db = require('./db')
const { PrismaClient } = require('@prisma/client')
let prisma = new PrismaClient()

class Tournament {

	/**
	 * Object
	 * @type {Client}
	 */
	static #client

	/**
	 * Logo of tournaments
	 * @type string
	 */
	static #logoPictures

	/**
	 * Temp array of tournaments
	 * @type []
	 */
	static #tempTournaments

	/**
	 * temp cookie for request
	 * @type string
	 */
	static #cookie

	/**
	 * All Tournaments
	 */
	static #tournaments

	/**
	 * Array of IDs of Tournaments
	 * @type Array<number>
	 */
	static #tournamentsIds

	/**
	 * Array of IDs of Tournaments
	 * @type Boolean
	 */
	static #tournamentsAutoOn

	/**
	 * Main function of Tournament class
	 * @param {Client} client - Object
	 */
	static async tournament( client ) {

		this.#client = client

		this.#tournamentsAutoOn = false

		this.#logoPictures = "https://static-tss.warthunder.com/icon_tournament/"

		this.#tempTournaments = []

		this.#tournamentsIds = []

		this.#cookie = "cf_clearance=71c80538d429eb26de7dbf2b6114c7cd59734670-1620679609-0-150;"

		await this.#getTournamentEveryDay()
		// await this.#sendEmbedMessageForAllGuild()
	}

	static async #getTournamentEveryDay() {
		const noon = new Date();
		noon.setHours(12, 0, 0, 0); // Set the time to noon
		let timeUntilNoon = noon.getTime() - Date.now(); // Calculate time until noon

		// If it's already past noon, add 1 day to the time until noon
		if (timeUntilNoon <= 0) {
			timeUntilNoon += 12 * 60 * 60 * 1000; // half a day in milliseconds
		}

		setTimeout(async () => {
			await this.#getNewTournaments();
			setInterval(async _ => { await this.#getNewTournaments(); }, 12 * 60 * 60 * 1000); // 1 day in milliseconds
		}, timeUntilNoon);
	}

	/**
	 * To get new tournaments of TSS WarThunder
	 * @returns {Promise<void>}
	 */
	static async #getNewTournaments() {
		// Send message when the method start
		await log.sendLog(this.#client, log.level.INFO, "Launch of the tournament engine", "New Tournaments")
		await this.#requestTournaments().catch(err => { log.sendLog(this.#client, log.level.ERROR, "Request failed\n" + err.message, "Request Tournaments"); })

		// Get old tournements
		const oldTournaments = await prisma.tournaments.findMany();

		// Delete passed tournaments
		for( let i = 0; i < this.#tempTournaments.length; i++){
			if (!(this.#tempTournaments[i].status === "1" && this.#tempTournaments[i].active === "0") || oldTournaments.some(ot => ot.id.toString() === (this.#tempTournaments[i].tournamentID).toString())) {
				this.#tempTournaments.splice(i, 1);
				i--;
			}
		}

		// Sort by start date of tournaments
		this.#tempTournaments.sort(function compare(a, b) {
			if (a.dateStartTournament < b.dateStartTournament)
				return -1;
			if (a.dateStartTournament > b.dateStartTournament )
				return 1;
			return 0;
		});

		// Get details of each tournament
		for (let tournament of this.#tempTournaments)
			if (!tournament.details)
				await this.#requestDetailsTournament(tournament)
					.catch(err => log.sendLog(this.#client, log.level.ERROR, `Error when requesting detail for tournament ${tournament.tournamentID} :\n${err.message}`, "Request Details Tournaments"))

		if (this.#tempTournaments.length > 0) {
			let sentTournaments = [];
			// Log the date of each tournament
			for (let tournament of this.#tempTournaments) {
				const date = new Date(tournament.dateStartTournament * 1000)
				sentTournaments.push(`${tournament.tournamentID} : ${tournament.gameMode}, ${date}, ${tournament.nameEN}`)
			}
			await log.sendLog(this.#client, log.level.SUCCESS, `${this.#tempTournaments.length} new tournament(s) get\n${sentTournaments.join("\n")}`, "New Tournaments")

			// Send tournament to the test sever
			await this.#sendEmbedMessageForAllChannels(this.#tempTournaments);
		}
		else {
			console.log("No new tournament, no call of the method to send embed message")
			await log.sendLog(this.#client, log.level.WARNING, "No new tournament, no call of the method to send embed message", "New Tournaments")
		}
	}

	/**
	 * Request to get all tournaments
	 * @returns {Promise<void>} - true: the request worked, false: the request failed
	 */
	static #requestTournaments = async () => {

		const myBody = new FormData();
		myBody.append("countCard", "0");
		myBody.append("action", "GetActiveTournaments");

		const requestOptions = {
			method: 'POST',
			headers: {
				//"cookie": "71c80538d429eb26de7dbf2b6114c7cd59734670-1620679609-0-150; PHPSESSID=vj4vhdmo0gk1mjncnpsua9s4b6; lang=en",
				"cookie": this.#cookie,
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
			},
			body: myBody,
		};

		await fetch("https://tss.warthunder.com/functions.php", requestOptions)
			.then(response => response.json())
			.then(result => this.#tempTournaments = result.data)
			.catch(err => {console.error(err.message); throw err});
	};

	/**
	 * Request to get details for one tournament
	 * @param {tempTournaments.any} tournament
	 */
	static #requestDetailsTournament = async (tournament ) => {
		const requestOptions = {
			method: 'GET',
			headers: {
				"cookie": this.#cookie,
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
			},
			redirect: 'follow'
		};

		await fetch(`https://tss.warthunder.com/functions.php?id=${tournament.tournamentID}&action=DetailTournament`, requestOptions)
			.then(response => response.json())
			.then(result => tournament.details = result)
			.catch(err => {console.error(err.message); throw err});
	}

	/**
	 * Foreach tournament, send the embed message for each subscribe guild
	 * @param {this.tempTournaments} tournaments
	 * @returns {Promise<void>}
	 */
	static #sendEmbedMessageForAllChannels = async (tournaments) => {
		const guildIdsToDelete = [];
		let channels = { AB: [], RB: [], HB: [] };
		const guildIds = this.#client.guilds.cache.map(g => g.id);
		const tournamentSettings = await prisma.tournament_settings.findMany()
		tournamentSettings.forEach(ts => {
			if (guildIds.includes(ts.guild_id)) {
				channels.AB.push(ts.ab_channel)
				channels.RB.push(ts.rb_channel)
				channels.HB.push(ts.sb_channel)
			}
			else {
				guildIdsToDelete.push(ts.guild_id)
			}
		});
		// Deleting guilds not in the bot APIs data.
		if (guildIdsToDelete.length > 0) {
			await prisma.tournament_settings
				.deleteMany({
					where: {
						guild_id: {
							in: guildIdsToDelete,
						}
					}
				})
				.then(async () => {
					await log.sendLog(this.#client, log.level.INFO, `${guildIdsToDelete.join("\n")}`,'PRISMA : Delete tournament guild settings')
					await prisma.$disconnect();
				})
				.catch(async (e) => {
					await log.sendLog(this.#client, log.level.ERROR, e.message, "PRISMA : Insert tournament ID")
					await prisma.$disconnect();
				});
		}
		else {
			await log.sendLog(this.#client, log.level.INFO, 'No guild ids to delete','PRISMA : Delete tournament guild settings')
		}

		// Set up an object to log stats
		let numberOfTournamentChannels = { AB: { tournaments: 0, guilds: channels.AB.filter(id => id !== null).length, sent: 0, error: 0}, RB: { tournaments: 0, guilds: channels.RB.filter(id => id !== null).length, sent: 0, error: 0}, HB: { tournaments: 0, guilds: channels.HB.filter(id => id !== null).length, sent: 0, error: 0} }

		for (const tournament of tournaments) {
			const embed = this.#embedMessage(tournament)
			await generate_image(tournament.tournamentID).catch(err => log.sendLog(this.#client, log.level.ERROR, err.message, "Puppeteer, generate image by scraping"))

			const gameMode = tournament.gameMode;

			await Promise.all(this.#client.channels.cache
				.filter(c => channels[gameMode].includes(c.id))
				.map(c => c.send(embed)
					.then(async _ => {
						numberOfTournamentChannels[gameMode]['sent'] += 1;
					})
					.catch(err => {
						numberOfTournamentChannels[gameMode]['error'] += 1;
						log.sendLog(this.#client, log.level.ERROR, `Channel ID : ${channel}\n\nError Message : \n${err.message}`, "Send Embed Message In Specific Channel")
					})
				))

			// Add the tournament in the database (to not resend it the next day)
			await prisma.tournaments
				.create({
					data: {
						id: parseInt(tournament.tournamentID),
					}
				})
				.then(async () => {
					await prisma.$disconnect();
				})
				.catch(async (e) => {
					await log.sendLog(this.#client, log.level.ERROR, e.message, "PRISMA : Insert tournament ID")
					await prisma.$disconnect();
				});

			// For stats
			numberOfTournamentChannels[gameMode]['tournaments'] += 1;
		}
		// TODO: It is horrible, need a fix
		const textToSendLog = 	`AB: ${numberOfTournamentChannels.AB.tournaments} tournaments send in ${numberOfTournamentChannels.AB.guilds} guilds (Total : ${ numberOfTournamentChannels.AB.sent } sent, ${ numberOfTournamentChannels.AB.error } error)\n` +
								`RB: ${numberOfTournamentChannels.RB.tournaments} tournaments send in ${numberOfTournamentChannels.RB.guilds} guilds (Total : ${ numberOfTournamentChannels.RB.sent } sent, ${ numberOfTournamentChannels.RB.error } error)\n` +
								`SB: ${numberOfTournamentChannels.HB.tournaments} tournaments send in ${numberOfTournamentChannels.HB.guilds} guilds (Total : ${ numberOfTournamentChannels.HB.sent } sent, ${ numberOfTournamentChannels.HB.error } error)`
		await log.sendLog(this.#client, log.level.SUCCESS, textToSendLog, "Send Embed Message")
	}

	static async #sendEmbedMessageForAllGuilds(tournaments) {
		const guildIds = this.#client.guilds.cache.map(g => g.id);
		const tournamentSettings = await prisma.tournament_settings.findMany();
		for(const item of tournamentSettings) {
			if(guildIds.includes(item.guild_id.toString())) {
				const abChannel = item.ab_channel;
				const rbChannel = item.rb_channel;
				const sbChannel = item.sb_channel;

				//await this.#sendEmbedMessage(tournaments, abChannel, rbChannel, sbChannel);
			}
		}
	}

	/**
	 * Send an embed message with data of each tournament
	 * @param {tempTournaments[]} tournaments
	 * @param {string} channelAB
	 * @param {string} channelRB
	 * @param {string} channelHB
	 * @returns {Promise<void>}
	 */
	static async #sendEmbedMessage(tournaments, channelAB, channelRB, channelHB) {
		let sentTournaments = []
		for (let tournament of tournaments) {
			const embed = this.#embedMessage(tournament)
			await generate_image(tournament.tournamentID).catch(err => log.sendLog(this.#client, log.level.ERROR, err.message, "Puppeteer, generate image by scraping"))

			let channel = null
			if (channelAB !== null && tournament.gameMode === 'AB') {
				channel = channelAB
			}
			else if (channelRB !== null && tournament.gameMode === 'RB') {
				channel = channelRB
			}
			else if (channelHB !== null && tournament.gameMode === 'HB') {
				channel = channelHB
			}
			else if (tournament.gameMode !== 'AB' || tournament.gameMode !== 'RB' || tournament.gameMode !== 'HB') {
				console.log("⚠ The game mode is not matching" + tournament.gameMode + ": " + new Date(tournament.dateStartTournament * 1000).toLocaleString("en-GB", {timeZone:"UTC"}) + ", " + tournament.nameEN)
			}

			if (channel !== null) {
				await this.#client.channels.cache.get(channel).send(embed)
					.then(_ => {
						this.#tournamentsIds.push(tournament.tournamentID);
						sentTournaments.push(tournament.gameMode + ", " + new Date(tournament.dateStartTournament * 1000).toLocaleString("en-GB", {timeZone: "UTC"}) + ", " + tournament.nameEN)
					})
					.catch(err => log.sendLog(this.#client, log.level.ERROR, `Channel ID : ${channel}\n\nError Message : \n${err.message}`, "Send Embed Message In Specific Channel"))
			}
		}
		await log.sendLog(this.#client, log.level.SUCCESS, sentTournaments.join("\n"), "Send Embed Message")
	}

	/**
	 * Return an embedMessage with values of the specific tournament
	 * @param {tempTournaments.any} tournament
	 * @returns {Discord.MessageEmbed}
	 */
	static #embedMessage(tournament) {
		let color = 0x0099ff
		switch (tournament.details.teamSize.toString()) {
		case "1" :
			color = 0x0c88db
			break
		case "2" :
			color = 0x50af1f
			break
		case "3" :
			color = 0xcdd41b
			break
		case "4" :
			color = 0xcf640c
			break
		case "5" :
			color = 0x5a0a0b
			break
		default :
			console.log(`⚠ The tournament size is not matching : ${tournament.details.teamSize.toString()}`)
		}

		const embedMessage = {
			color: color,
			title: tournament.nameEN,
			url: `https://tss.warthunder.com/index.php?action=tournament&id=${tournament.tournamentID}`,
			author: {
				name: 'War Thunder Tournament',
				icon_url: 'https://tss.warthunder.com/images/menu/gaijin_top_panel_icon.png',
				url: 'https://tss.warthunder.com/index.php?action=current_tournaments',
			},
			description: `${this.#timeStampToString(tournament.dateStartTournament)} UTC - ${this.#timeStampToString(tournament.dateEndTournament)} UTC`,
			thumbnail: {
				url: this.#logoPictures + tournament.details.icon_name,
			},
			fields: [
				{
					name: '\u200b',
					value: '\u200b',
					inline: false,
				},
				{
					name: 'Team Size',
					value: `${tournament.details.teamSize}x${tournament.details.teamSize}`,
					inline: true,
				},
				{
					name: 'Type',
					value: tournament.details.typeTournament === 'single-elumination' ? 'single-eliminitation' : tournament.details.typeTournament,
					inline: true,
				},
				{
					name: 'Cluster',
					value: tournament.details.cluster,
					inline: true,
				},
				{
					name: 'Prize pool',
					value: tournament.details.prize_pool,
					inline: false,
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false,
				},
			],
			image: {
				url: 'attachment://tournamentVehicles.png',
			},
			timestamp: new Date(tournament.dateStartTournament * 1000),
			footer: {
				text: 'eSport Official Discord - Gaijin',
				icon_url: 'attachment://WT_Esports_Standard.png',
			},
		}
		return {
			files: ['./assets/WT_Esports_Standard.png', './assets/tournamentVehicles.png'],
			embeds: [embedMessage],
		}
	}

	/**
	 * Get date format from timestamp format
	 * @param {string} time - timestamp
	 * @returns {string} - date string format
	 */
	static #timeStampToString(time) {
		const options = { timeZone: "UTC", weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric" };
		const date = new Date(time * 1000)
		return date.toLocaleDateString('en-GB', options)
	}

	/**
	 * Make timeStamp from human date
	 * @param {string} time
	 * @returns {number} - timeStamp format
	 */
	static #dateToTimeStamp(time) {
		const tempDate = new Date(time)
		if (tempDate instanceof Date && !isNaN(tempDate)) {
			const newDate = new Date(Date.UTC( tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()))
			return newDate / 1000
		}
		return 0
	}

	/**
	 * Send message into user DM
	 * @param {string} message : message to send to the user
	 * @param {Array<Discord.ClientUser.id>} userIds (Only user in the cache's bot)
	 */
	static async sendMessageIntoDM(message, userIds) {
		let users = []
		for (const id of userIds) {
			const user = await this.#client.users.cache.find(guild => guild.id === id)
			if (user)
				users.push(user)
		}
		// userIds.forEach(async id => users.push(await this.#client.users.cache.find(guild => guild.id === id).catch(err => {console.log(err.message); throw err})))
		if (users.length > 0) {
			for (const user of users)
				await user.createDM().then(DMChannel => DMChannel.send(message)).catch(err => {console.log(err.message); throw err})
		} else {
			const railo = this.#client.users.cache.find(guild => guild.id === config.USER_ID_RAILO)
			railo.createDM().then(DMChannel => DMChannel.send(
				"Une erreur est survenue lors de la récupération des utilisateur à l'aide des Ids.\nLe message était le suivant :\n\n" + message
			)).catch(err => {console.log(err.message); throw err})
		}
	}

	/**
	 * Remove the value item of its array
	 * @param {Array<any>} arr - The array from which we want to delete the value
	 * @param {any} value - The value we want to delete
	 */
	static removeItemOnce(arr, value) {
		const index = arr.indexOf(value);
		if (index > -1) {
			arr.splice(index, 1);
		}
	}

	// /**
	//  * Remove item of its array
	//  * @param {Array<any>} arr - They array
	//  * @param {any} value - The item to delete
	//  */
	// static removeItem<T>(arr: Array<T>, value: T): Array<T> {
	//     const index = arr.indexOf(value);
	//     if (index > -1) {
	//         arr.splice(index, 1);
	//     }
	// }
}

module.exports = Tournament
