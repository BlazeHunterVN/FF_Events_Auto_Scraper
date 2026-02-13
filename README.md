# 🎯 FF Events Auto-Scraper → Google Sheets

Hệ thống tự động lấy dữ liệu **Events & Updates** từ **8 khu vực** Free Fire và cập nhật vào **Google Sheet** — chạy tự động trên **GitHub Actions**.

## 📋 Khu Vực Hỗ Trợ

| Code | Khu Vực | 
|------|---------|
| PK | Pakistan |
| IND | India |
| BR | Brazil |
| VN | Vietnam |
| ID | Indonesia |
| SG | Singapore |
| TW | Taiwan |
| TH | Thailand |

## 🚀 Setup Trên GitHub

### Bước 1: Tạo Google Sheet & Apps Script

1. Tạo **Google Sheet** mới
2. Vào **Extensions → Apps Script**
3. Copy toàn bộ nội dung file `google_apps_script.gs` vào editor
4. Chạy function **`initializeSheet()`** để tạo headers
5. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** → **Copy URL**

### Bước 2: Tạo GitHub Repository

```bash
cd "d:\VS Code Project\BOT\BOT_V1"
git init
git add .
git commit -m "Initial: FF Events Auto-Scraper"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Bước 3: Thêm GitHub Secret

1. Vào GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `GOOGLE_SCRIPT_URL`
4. Value: URL từ bước 1.6

### Bước 4: Chạy Thử

1. Vào tab **Actions** trên GitHub
2. Chọn workflow **🔄 FF Events Auto-Scraper**
3. Click **Run workflow** → chọn region (hoặc để trống = tất cả)
4. Kiểm tra Google Sheet có dữ liệu

## ⏰ Lịch Chạy Tự Động

Mặc định: **mỗi 6 giờ** (0h, 6h, 12h, 18h UTC)

Thay đổi trong file `.github/workflows/scrape.yml`:
```yaml
schedule:
  - cron: '0 */6 * * *'   # mỗi 6h
  # - cron: '0 */3 * * *' # mỗi 3h
  # - cron: '0 */1 * * *' # mỗi 1h
```

## 📊 Cấu Trúc Google Sheet

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| **Tiêu Đề** | **Khu Vực** | **Loại** | **Ngày Bắt Đầu** | **Ngày Kết Thúc** | **Link 1 (Banner)** | **Link 2 (Redirect)** | **Cập Nhật Lúc** |

Mỗi khu vực có **màu nền riêng** để dễ phân biệt.

## 💻 Chạy Local (tuỳ chọn)

```bash
npm install
cp .env.example .env
# Paste GOOGLE_SCRIPT_URL vào .env
node index.js --once       # Chạy 1 lần
node index.js --test --region vn   # Test 1 khu vực
node index.js --preview    # Xem data, không gửi Sheet
node index.js --schedule   # Chạy theo lịch
```
