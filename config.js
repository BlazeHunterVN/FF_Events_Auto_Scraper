/**
 * Configuration for FF Events Scraper
 * All 8 regions with their URLs
 */

const REGIONS = [
    {
        name: 'Pakistan',
        code: 'PK',
        url: 'https://xv.ct.ws/event/?q=cGt8Y0d0OE1UYzNNRGsyT1RFNE1IeGpabUk0TlRKa1kyWmpZek5sWVdNMllUZzFaR0l5WkdZeE1USm1NV00zT0RGbU9USmhZek0wTW1Sa1ptSXpZMlV6TjJRMk16VTBNMkppTmpneVpHTXd8S0VZMQ'
    },
    {
        name: 'India',
        code: 'IND',
        url: 'https://xv.ct.ws/event/?q=aW5kfGFXNWtmREUzTnpBNU5qa3lNREY4T1Rjek1qRXlNVEZsTnpsbFpXSmlOMk5oWkdKa09UWmtORFpsT0RZeVptTmpaalE0WVdWa01HTmpORGt4WlRJNE5ETmpNV0psWWpFMU9URmhPVE0wWXc9PXxLRVkx'
    },
    {
        name: 'Brazil',
        code: 'BR',
        url: 'https://xv.ct.ws/event/?q=YnJ8WW5KOE1UYzNNRGsyT1RJeE1IeGhZak0xWVRsaVlXTmhZekprT0RFNE16WmhOMll4TURGaVpETTRZakU1T1RZMU1UTTJPVGRrTWpnM05ERmpORFpqWW1RNVlUVXlZekpqWVRaa1ptWTN8S0VZMQ'
    },
    {
        name: 'Vietnam',
        code: 'VN',
        url: 'https://xv.ct.ws/event/?q=dm58ZG01OE1UYzNNRGsyT1RJeU5IeGtaV1UwTVRBMU1UWXpPVGxrTWpJMlpqUTROalZtTjJGbU9EWm1aamd4WTJGa1pEVmxaakUyT0daaU5EWmhaRFl6WlRrellUTmhZVFl5TW1GaU9HUXd8S0VZMQ'
    },
    {
        name: 'Indonesia',
        code: 'ID',
        url: 'https://xv.ct.ws/event/?q=aWR8YVdSOE1UYzNNRGsyT1RJME0zdzFZak5pT0dGaE5XUmxNVFZoWXpBeE9UQTFZVFEyT0RKaFpqY3dORE5sWkRZMU1ETTRaV1EyT1dSbU1UQTJaR014WldJd01HUmpOV1prT1RnM04ySXh8S0VZMQ'
    },
    {
        name: 'Singapore',
        code: 'SG',
        url: 'https://xv.ct.ws/event/?q=c2d8YzJkOE1UYzNNRGsyT1RJMU9Yd3pZV0V4TmpZMlpqRm1aRFZpTXpSaFkyTmhNREZoT1ROa01UazNObVk0WlRCbE56Qm1ZV0ZrTXprd1pqRmhZamt3WVdOa01XRTROamN6WWpRNVlUQXp8S0VZMQ'
    },
    {
        name: 'Taiwan',
        code: 'TW',
        url: 'https://xv.ct.ws/event/?q=dHd8ZEhkOE1UYzNNRGsyT1RJMk9Id3dNV0ZoTTJWaE56RTVNekk1WkRNd01qTXdObVZsTUdabU1XUmlOR1U0TVRNNVpUUmpOVFJpWlRWbE4yTmxPR1F6TldFM05qUmhNR1ZtWVdSa09EWml8S0VZMQ'
    },
    {
        name: 'Thailand',
        code: 'TH',
        url: 'https://xv.ct.ws/event/?q=dGh8ZEdoOE1UYzNNRGsyT1RJM04zeGlZVE0xWVdOaU9HVTROMlJrTkRkaVpqSTNPR1F6T1RVMFpqazVZalEyWTJOak5XUTVZak0wWkdRNU1tVTBaV0ZpTmpkbE9UUTFNemRsTmpBeE16STR8S0VZMQ'
    }
];

// Google Apps Script Web App URL - Set in .env file
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

// Cron schedule: Run every 6 hours
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 */6 * * *';

// Puppeteer settings
const BROWSER_OPTIONS = {
    headless: 'new',
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
    ],
    // Use PUPPETEER_EXECUTABLE_PATH if set (for CI with system Chrome)
    ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    })
};

// Timeout for page loading (ms)
const PAGE_TIMEOUT = 30000;

// Max retry attempts for each region
const MAX_RETRIES = 3;

module.exports = {
    REGIONS,
    GOOGLE_SCRIPT_URL,
    CRON_SCHEDULE,
    BROWSER_OPTIONS,
    PAGE_TIMEOUT,
    MAX_RETRIES
};
