/**
 * Google Sheets Integration Module
 * Sends scraped data to Google Sheets via Google Apps Script Web App
 */

const { GOOGLE_SCRIPT_URL, MAX_RETRIES } = require('./config');

/**
 * Send events data to Google Sheets
 * @param {Array} events - Array of event objects from scraper
 * @returns {Object} Response from Google Apps Script
 */
async function pushToGoogleSheet(events) {
    if (!GOOGLE_SCRIPT_URL) {
        console.error('[SHEETS] ❌ GOOGLE_SCRIPT_URL chưa được cấu hình! Kiểm tra file .env');
        return { success: false, error: 'GOOGLE_SCRIPT_URL not configured' };
    }

    if (!events || events.length === 0) {
        console.warn('[SHEETS] ⚠️ Không có dữ liệu để gửi');
        return { success: false, error: 'No data to send' };
    }

    console.log(`[SHEETS] 📤 Đang gửi ${events.length} events tới Google Sheet...`);

    const payload = {
        action: 'updateEvents',
        timestamp: new Date().toISOString(),
        totalEvents: events.length,
        events: events
    };

    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[SHEETS] 🔄 Attempt ${attempt}/${MAX_RETRIES}...`);

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                redirect: 'follow'
            });

            // Google Apps Script returns redirect, follow it
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log(`[SHEETS] ✅ Cập nhật thành công! ${result.rowsWritten || events.length} rows đã ghi.`);
                return result;
            } else {
                throw new Error(result.error || 'Unknown error from Google Apps Script');
            }

        } catch (error) {
            lastError = error;
            console.error(`[SHEETS] ❌ Attempt ${attempt} thất bại:`, error.message);

            if (attempt < MAX_RETRIES) {
                const waitTime = attempt * 2000; // Progressive delay
                console.log(`[SHEETS] ⏳ Chờ ${waitTime / 1000}s trước khi thử lại...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    console.error(`[SHEETS] 💥 Tất cả ${MAX_RETRIES} attempts đều thất bại!`);
    return { success: false, error: lastError?.message || 'All retries failed' };
}

/**
 * Format events into rows for Google Sheet display (local preview)
 * @param {Array} events - Array of event objects
 */
function printPreview(events) {
    console.log('\n' + '─'.repeat(120));
    console.log('  PREVIEW DỮ LIỆU (sẽ ghi vào Google Sheet)');
    console.log('─'.repeat(120));
    console.log(
        '  ' +
        'Tiêu Đề'.padEnd(30) +
        'Khu Vực'.padEnd(15) +
        'Loại'.padEnd(10) +
        'Ngày Bắt Đầu'.padEnd(25) +
        'Ngày Kết Thúc'.padEnd(25)
    );
    console.log('─'.repeat(120));

    for (const event of events) {
        console.log(
            '  ' +
            (event.title || 'N/A').substring(0, 28).padEnd(30) +
            (event.region || 'N/A').padEnd(15) +
            (event.type || 'N/A').padEnd(10) +
            (event.start || 'N/A').substring(0, 23).padEnd(25) +
            (event.end || 'N/A').substring(0, 23).padEnd(25)
        );
    }

    console.log('─'.repeat(120));
    console.log(`  Tổng: ${events.length} events\n`);
}

module.exports = { pushToGoogleSheet, printPreview };
