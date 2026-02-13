/**
 * Google Apps Script - FF Events Data Receiver
 * 
 * HƯỚNG DẪN DEPLOY:
 * 1. Mở Google Sheet → Extensions → Apps Script
 * 2. Paste toàn bộ code này vào editor
 * 3. Click Deploy → New deployment
 * 4. Chọn Type: Web app
 * 5. Execute as: Me
 * 6. Who has access: Anyone
 * 7. Click Deploy → Copy URL
 * 8. Paste URL vào file .env (GOOGLE_SCRIPT_URL)
 * 
 * CẤU TRÚC SHEET:
 * Tất cả 8 khu vực gộp vào 1 sheet duy nhất
 * Row 1: Header
 * Cột A: Tiêu Đề (Title)
 * Cột B: Khu Vực (Region)
 * Cột C: Loại (Type - Event/Update)
 * Cột D: Ngày Bắt Đầu (Start)
 * Cột E: Ngày Kết Thúc (End)
 * Cột F: Link 1 - Banner URL
 * Cột G: Link 2 - Redirect URL
 * Cột H: Cập Nhật Lúc (Last Updated)
 */

// Sheet name - đổi tên nếu cần
var SHEET_NAME = 'FF Events';

/**
 * Handle POST requests from Node.js scraper
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var events = data.events;
    
    if (!events || events.length === 0) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'No events data received' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Write header row
    var headers = [
      'Tiêu Đề',
      'Khu Vực', 
      'Loại',
      'Ngày Bắt Đầu',
      'Ngày Kết Thúc',
      'Link 1 (Banner)',
      'Link 2 (Redirect)',
      'Cập Nhật Lúc'
    ];
    
    // Clear existing data (keep formatting)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
    }

    // Set headers
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setHorizontalAlignment('center');

    // Sort events by region, then by type
    events.sort(function(a, b) {
      if (a.region !== b.region) return a.region.localeCompare(b.region);
      if (a.type !== b.type) return a.type === 'Event' ? -1 : 1;
      return 0;
    });

    // Write data rows
    var timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    var rows = [];
    var currentRegion = '';
    
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      
      rows.push([
        event.title || '',
        event.region || '',
        event.type || '',
        event.start || '',
        event.end || '',
        event.bannerUrl || '',
        event.redirect || '',
        timestamp
      ]);
    }

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    // Auto-resize columns
    for (var col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }

    // Apply alternating row colors for readability
    applyRegionColors(sheet, events, rows.length);

    // Freeze header row
    sheet.setFrozenRows(1);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        rowsWritten: rows.length,
        timestamp: timestamp
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      status: 'OK', 
      message: 'FF Events Google Apps Script is running',
      sheetName: SHEET_NAME
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Apply color coding by region for visual distinction
 */
function applyRegionColors(sheet, events, totalRows) {
  var regionColors = {
    'Pakistan': '#FFF3E0',   // Light Orange
    'India': '#E8F5E9',      // Light Green
    'Brazil': '#E3F2FD',     // Light Blue
    'Vietnam': '#FBE9E7',    // Light Red
    'Indonesia': '#F3E5F5',  // Light Purple
    'Singapore': '#E0F7FA',  // Light Cyan
    'Taiwan': '#FFF9C4',     // Light Yellow
    'Thailand': '#FCE4EC'    // Light Pink
  };

  for (var i = 0; i < totalRows; i++) {
    var region = events[i].region;
    var color = regionColors[region] || '#FFFFFF';
    sheet.getRange(i + 2, 1, 1, 8).setBackground(color);
  }
}

/**
 * Manual trigger - for testing the setup
 * Run this function to initialize the sheet with headers
 */
function initializeSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  var headers = [
    'Tiêu Đề',
    'Khu Vực', 
    'Loại',
    'Ngày Bắt Đầu',
    'Ngày Kết Thúc',
    'Link 1 (Banner)',
    'Link 2 (Redirect)',
    'Cập Nhật Lúc'
  ];

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 250); // Title
  sheet.setColumnWidth(2, 120); // Region
  sheet.setColumnWidth(3, 80);  // Type
  sheet.setColumnWidth(4, 200); // Start
  sheet.setColumnWidth(5, 200); // End
  sheet.setColumnWidth(6, 350); // Banner URL
  sheet.setColumnWidth(7, 350); // Redirect
  sheet.setColumnWidth(8, 180); // Last Updated

  SpreadsheetApp.getUi().alert('✅ Sheet "' + SHEET_NAME + '" đã được khởi tạo!');
}
