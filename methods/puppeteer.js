const puppeteer = require('puppeteer');

/**
 * Function to generate a png file from a part of a website (scraping)
 * @param {number} tournamentId
 * @returns {Promise<void>}
 */
const generate_image = async (tournamentId) => {
	const browser = await puppeteer.launch(
		{
			defaultViewport: { width: 1920, height: 1080 },
		},
	);
	// open new tab
	const page = await browser.newPage();
	// go to site
	await page.goto(`https://tss.warthunder.com/index.php?action=tournament&id=${tournamentId}`);

	// ale #preset_undefined - the selector we require
	// wait for the selector to load
	await page.waitForSelector('#preset_undefined');
	// declare a variable with an ElementHandle
	const element = await page.$('#preset_undefined');
	// take screenshot element in puppeteer
	await element.screenshot({ path: './assets/tournamentVehicles.png' });
	// close browser
	await browser.close();
};

module.exports = generate_image;
