/**
 * FF Events Auto-Scraper - Main Entry Point
 * 
 * Usage:
 *   node index.js --once              Chạy 1 lần, scrape tất cả regions
 *   node index.js --schedule          Chạy theo lịch (cron)
 *   node index.js --test              Test scrape 1 region (mặc định: Vietnam)
 *   node index.js --test --region pk  Test scrape khu vực cụ thể
 *   node index.js --preview           Scrape và preview, không gửi Google Sheet
 */

require('dotenv').config();

const { REGIONS, CRON_SCHEDULE } = require('./config');
const { scrapeRegion, scrapeAllRegions } = require('./scraper');
const { pushToGoogleSheet, printPreview } = require('./sheets');

// Parse command line arguments
const args = process.argv.slice(2);
const isSchedule = args.includes('--schedule');
const isTest = args.includes('--test');
const isPreview = args.includes('--preview');
const isOnce = args.includes('--once') || (!isSchedule && !isTest && !isPreview);

// Get specific region for test mode
const regionIndex = args.indexOf('--region');
const regionArg = regionIndex !== -1 ? args[regionIndex + 1] : null;

/**
 * Run the full scrape + push pipeline
 */
async function runPipeline() {
    const startTime = Date.now();

    try {
        // Scrape all regions
        const allEvents = await scrapeAllRegions(REGIONS);

        if (allEvents.length === 0) {
            console.log('[MAIN] ⚠️ Không có dữ liệu nào được scrape!');
            return;
        }

        // Preview data
        printPreview(allEvents);

        // Push to Google Sheet
        const result = await pushToGoogleSheet(allEvents);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        if (result.success) {
            console.log(`[MAIN] 🎉 Hoàn thành! ${allEvents.length} events đã cập nhật. (${elapsed}s)`);
        } else {
            console.error(`[MAIN] ⚠️ Scrape thành công nhưng gửi Google Sheet thất bại: ${result.error}`);
        }

    } catch (error) {
        console.error('[MAIN] 💥 Lỗi pipeline:', error.message);
    }
}

/**
 * Run test mode - scrape single region
 */
async function runTest() {
    let targetRegion;

    if (regionArg) {
        targetRegion = REGIONS.find(r =>
            r.code.toLowerCase() === regionArg.toLowerCase() ||
            r.name.toLowerCase() === regionArg.toLowerCase()
        );
    }

    if (!targetRegion) {
        // Default to Vietnam
        targetRegion = REGIONS.find(r => r.code === 'VN') || REGIONS[0];
    }

    console.log(`\n🧪 TEST MODE - Scraping: ${targetRegion.name} (${targetRegion.code})\n`);

    const events = await scrapeRegion(targetRegion);

    if (events.length > 0) {
        printPreview(events);

        // Print full JSON for inspection
        console.log('\n📋 JSON Output:');
        console.log(JSON.stringify(events, null, 2));
    } else {
        console.log('❌ Không tìm thấy event nào!');
    }

    return events;
}

/**
 * Run preview mode - scrape all but don't push
 */
async function runPreview() {
    console.log('\n👁️ PREVIEW MODE - Chỉ scrape, không gửi Google Sheet\n');

    const allEvents = await scrapeAllRegions(REGIONS);

    if (allEvents.length > 0) {
        printPreview(allEvents);
    }

    return allEvents;
}

/**
 * Run scheduled mode with cron
 */
async function runScheduled() {
    const cron = require('node-cron');

    console.log(`\n⏰ SCHEDULE MODE - Chạy theo lịch: ${CRON_SCHEDULE}`);
    console.log('   Nhấn Ctrl+C để dừng.\n');

    // Run immediately on start
    console.log('[SCHEDULE] 🚀 Chạy lần đầu...');
    await runPipeline();

    // Then schedule
    cron.schedule(CRON_SCHEDULE, async () => {
        console.log(`\n[SCHEDULE] ⏰ Cron triggered: ${new Date().toLocaleString('vi-VN')}`);
        await runPipeline();
    });

    console.log(`[SCHEDULE] ✅ Đã lên lịch. Lần chạy tiếp theo theo cron: ${CRON_SCHEDULE}`);
}

// Main execution
(async () => {
    try {
        if (isTest) {
            await runTest();
        } else if (isPreview) {
            await runPreview();
        } else if (isSchedule) {
            await runScheduled();
        } else {
            await runPipeline();
        }
    } catch (error) {
        console.error('[MAIN] 💥 Fatal error:', error);
        process.exit(1);
    }

    // Exit for non-scheduled modes
    if (!isSchedule) {
        process.exit(0);
    }
})();
