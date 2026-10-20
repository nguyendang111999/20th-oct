# 🎁 Quà 20/10 cho Mẹ Chinh, Tâm Đoan & Hải Đoan

Website nhỏ chúc mừng Ngày Phụ nữ Việt Nam 20/10: mở hộp quà, chọn quà của từng người, chạm để lật 3 lời chúc. Có cánh hoa rơi, nhạc hộp nhạc, thả tim.

## Link

| Gửi cho | Link |
|---|---|
| Cả nhà | https://nguyendang111999.github.io/20th-oct/ |
| Mẹ Chinh | https://nguyendang111999.github.io/20th-oct/me/ |
| Tâm Đoan | https://nguyendang111999.github.io/20th-oct/tam-doan/ |
| Hải Đoan | https://nguyendang111999.github.io/20th-oct/hai-doan/ |

Link riêng mở thẳng quà của người đó, và khi gửi qua Zalo/Messenger sẽ hiện ảnh xem trước có tên người nhận.

## Sửa lời chúc

Mọi chữ trên trang nằm trong [`js/content.js`](js/content.js). Chỉ sửa phần nằm giữa hai dấu ngoặc kép `"…"`, giữ nguyên dấu phẩy cuối dòng.

## Thêm ảnh

Chép ảnh vào [`assets/photos/`](assets/photos/) với tên `me-chinh.jpg`, `tam-doan.jpg`, `hai-doan.jpg`. Chưa có ảnh thì trang hiện bông hoa thay thế.

## Nhạc nền

Mặc định là giai điệu hộp nhạc tự soạn (không cần file). Muốn dùng bài riêng: chép file vào `assets/music.mp3`, rồi trong `js/content.js` đổi `music: "auto"` thành `music: "assets/music.mp3"`. Đổi thành `music: ""` để tắt nhạc.

## Đăng lên GitHub Pages

1. Đẩy code lên nhánh `main` của repo `nguyendang111999/20th-oct`.
2. Vào **Settings → Pages**, mục **Build and deployment** chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, bấm **Save**.
3. Chờ 1–2 phút rồi mở link ở trên.

Sau mỗi lần sửa và đẩy lên, GitHub Pages cần vài phút để cập nhật. Zalo/Messenger lưu ảnh xem trước của link một thời gian, nên nên đăng xong rồi mới gửi link.

## Xem thử trên máy

```bash
python -m http.server 8000
```

Rồi mở http://localhost:8000 (link riêng: http://localhost:8000/me/).

## Ảnh xem trước (og:image)

Ảnh trong [`assets/og/`](assets/og/) được chụp từ [`tools/og-image.html`](tools/og-image.html) (thêm `?p=me`, `?p=tam-doan`, `?p=hai-doan` cho từng người) ở khung 1200×630. Nếu đổi tên hay câu chúc trong ảnh thì chụp lại, ví dụ bằng Edge:

```bash
msedge --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=8000 --screenshot=assets/og/me.png "http://localhost:8000/tools/og-image.html?p=me"
```

## Cấu trúc

```
index.html            trang chung
me/ tam-doan/ hai-doan/  trang riêng của từng người (chỉ khác phần ảnh xem trước)
css/style.css         giao diện
js/content.js         nội dung, lời chúc
js/main.js            hộp quà, thẻ quà, lật lời chúc
js/art.js             hình hoa, vòng lá, hộp quà (SVG)
js/fx.js              cánh hoa rơi, pháo hoa, tim
js/music.js           nhạc hộp nhạc
assets/               ảnh, favicon, ảnh xem trước
```

Repo đang để công khai: ai có link đều xem được trang (kể cả ảnh bạn thêm vào).
