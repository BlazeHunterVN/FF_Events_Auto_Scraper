/**
 * FF Events Scraper Module
 * Uses Puppeteer to scrape event data from regional FF Event pages
 */

const puppeteer = require('puppeteer');
const { BROWSER_OPTIONS, PAGE_TIMEOUT } = require('./config');

/**
 * Scrape events from a single region URL
 * @param {Object} region - { name, code, url }
 * @param {Object} browser - Puppeteer browser instance (optional, will create if not provided)
 * @returns {Array} Array of event objects
 */
async function scrapeRegion(region, browser = null) {
    const ownBrowser = !browser;
    if (ownBrowser) {
        browser = await puppeteer.launch(BROWSER_OPTIONS);
    }

    const page = await browser.newPage();

    try {
        console.log(`[SCRAPER] 🔄 Đang scrape khu vực: ${region.name} (${region.code})...`);

        // Set user agent to avoid blocks
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        );

        // Navigate to the page
        await page.goto(region.url, {
            waitUntil: 'networkidle2',
            timeout: PAGE_TIMEOUT
        });

        // Wait for content to load
        await page.waitForSelector('.events-container', { timeout: PAGE_TIMEOUT });

        // Small delay to ensure all dynamic content is rendered
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract event data from the page
        const events = await page.evaluate((regionName, regionCode) => {
            const results = [];
            const content = document.querySelector('.content');
            if (!content) return results;

            // Find all sections (Events and Updates)
            const headings = content.querySelectorAll('h2');
            let currentType = 'Event';

            // Iterate through all elements to track section type
            const allElements = content.children;
            let sectionType = 'Event';

            for (const element of allElements) {
                // Check if it's a heading to determine section type
                if (element.tagName === 'H2') {
                    const text = element.textContent.trim().toLowerCase();
                    if (text.includes('update')) {
                        sectionType = 'Update';
                    } else if (text.includes('event')) {
                        sectionType = 'Event';
                    }
                    continue;
                }

                // Check if it's an events-container
                if (element.classList && element.classList.contains('events-container')) {
                    const cards = element.querySelectorAll('.event-card');

                    for (const card of cards) {
                        const eventData = {
                            region: regionName,
                            regionCode: regionCode,
                            type: sectionType,
                            title: '',
                            start: '',
                            end: '',
                            bannerUrl: '',
                            redirect: ''
                        };

                        // Get the event details div
                        const details = card.querySelector('.event-details');
                        if (!details) {
                            // Try getting title from .title div
                            const titleDiv = card.querySelector('.title');
                            if (titleDiv) {
                                eventData.title = titleDiv.textContent.trim();
                            }
                            results.push(eventData);
                            continue;
                        }

                        // Parse all <p> tags in event-details
                        const paragraphs = details.querySelectorAll('p');
                        for (const p of paragraphs) {
                            const strong = p.querySelector('strong');
                            if (!strong) continue;

                            const label = strong.textContent.trim().toLowerCase().replace(':', '');

                            // Get the text content after the strong tag
                            let value = '';

                            if (label === 'banner url' || label === 'redirect') {
                                // For links, get the href from the anchor tag
                                const link = p.querySelector('a');
                                if (link) {
                                    value = link.href || link.textContent.trim();
                                }
                            } else {
                                // For text fields, get text content minus the strong text
                                const fullText = p.textContent.trim();
                                const strongText = strong.textContent.trim();
                                value = fullText.replace(strongText, '').trim();
                            }

                            switch (label) {
                                case 'title':
                                    eventData.title = value;
                                    break;
                                case 'start':
                                    eventData.start = value;
                                    break;
                                case 'end':
                                    eventData.end = value;
                                    break;
                                case 'banner url':
                                    eventData.bannerUrl = value;
                                    break;
                                case 'redirect':
                                    eventData.redirect = value;
                                    break;
                            }
                        }

                        // Fallback: get title from .title div if not found in details
                        if (!eventData.title) {
                            const titleDiv = card.querySelector('.title');
                            if (titleDiv) {
                                eventData.title = titleDiv.textContent.trim();
                            }
                        }

                        results.push(eventData);
                    }
                }
            }

            return results;
        }, region.name, region.code);

        console.log(`[SCRAPER] ✅ ${region.name}: Tìm thấy ${events.length} events/updates`);
        return events;

    } catch (error) {
        console.error(`[SCRAPER] ❌ Lỗi scrape ${region.name}:`, error.message);
        return [];
    } finally {
        await page.close();
        if (ownBrowser) {
            await browser.close();
        }
    }
}

/**
 * Scrape all regions
 * @param {Array} regions - Array of region objects from config
 * @returns {Array} Combined array of all events from all regions
 */
async function scrapeAllRegions(regions) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  FF EVENTS SCRAPER - ${new Date().toLocaleString('vi-VN')}`);
    console.log(`  Scraping ${regions.length} khu vực...`);
    console.log(`${'═'.repeat(60)}\n`);

    const browser = await puppeteer.launch(BROWSER_OPTIONS);
    const allEvents = [];

    try {
        for (const region of regions) {
            const events = await scrapeRegion(region, browser);
            allEvents.push(...events);

            // Small delay between regions to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    } finally {
        await browser.close();
    }

    console.log(`\n[SCRAPER] 📊 TỔNG CỘNG: ${allEvents.length} events từ ${regions.length} khu vực\n`);
    return allEvents;
}

module.exports = { scrapeRegion, scrapeAllRegions };
