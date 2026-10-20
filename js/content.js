/* =====================================================================
   NỘI DUNG WEBSITE — muốn sửa chữ thì sửa ở file này
   ---------------------------------------------------------------------
   • Chỉ sửa phần chữ nằm giữa hai dấu ngoặc kép "…".
   • Giữ nguyên dấu phẩy ở cuối mỗi dòng.
   • Lưu file rồi tải lại trang là thấy thay đổi.
   ===================================================================== */
window.CONTENT = {
  year: 2026,

  // Nhạc nền:
  //   "auto"              → giai điệu hộp nhạc có sẵn
  //   "assets/music.mp3"  → bài hát riêng (chép file mp3 vào thư mục assets)
  //   ""                  → tắt nhạc
  music: "auto",

  // Màn hình hộp quà khi mở link chung
  intro: {
    title: "Có quà 20/10 nè!",
    hint: "Chạm vào hộp quà để mở",
  },

  hero: {
    title: "Chúc mừng",
    subtitle: "Ngày Phụ nữ Việt Nam",
    lead: "Quà nhỏ cho ba người phụ nữ tuyệt vời nhất nhà mình 💐",
  },

  gifts: {
    title: "Mỗi người một món quà",
    subtitle: "Bấm vào để mở 3 lời chúc dành riêng cho mình.",
  },

  finale: {
    title: "Cả nhà mình",
    text: "Chúc mẹ và hai em 20/10 thật vui, thật xinh, nhận thật nhiều quà và lúc nào cũng được yêu thương!",
    button: "Gửi cả nhà một cái ôm",
  },

  footer: "Làm bằng cả trái tim · 20.10.2026",

  // Ảnh xem trước khi gửi link chung qua Zalo/Messenger
  share: {
    title: "Quà 20/10",
    text: "cho Mẹ Chinh, Tâm Đoan & Hải Đoan",
  },

  people: [
    {
      slug: "me",                               // link riêng: …/me/
      name: "Mẹ Chinh",
      tagline: "Người phụ nữ con thương nhất",
      photo: "assets/photos/me-chinh.jpg",      // chép ảnh đúng tên này vào assets/photos
      theme: "rose",                            // màu: rose (hồng) · lilac (tím) · sea (xanh biển)
      intro: { title: "Quà 20/10 cho Mẹ Chinh", hint: "Mẹ chạm vào hộp quà để mở nha!" },
      share: "Con có quà 20/10 cho mẹ nè!",
      heading: "3 lời chúc con dành cho mẹ",
      wishes: [
        {
          title: "Sức khỏe",
          text: "Chúc mẹ luôn khỏe mạnh, ăn ngon, ngủ ngon. Mẹ khỏe là món quà lớn nhất, hehe.",
        },
        {
          title: "Thảnh thơi",
          text: "Chúc mẹ bớt lo nghĩ, cười nhiều hơn và dành thời gian cho bản thân nhiều hơn.",
        },
        {
          title: "Hạnh phúc",
          text: "Cảm ơn mẹ vì những hy sinh thầm lặng. Chúc mẹ luôn hạnh phúc, vì con thương mẹ nhiều hơn những gì con hay nói.",
        },
      ],
      outro: "❤️❤️❤️❤️❤️",
    },
    {
      slug: "tam-doan",                         // link riêng: …/tam-doan/
      name: "Tâm Đoan",
      tagline: "Cô em gái xinh xắn của Big bro",
      photo: "assets/photos/tam-doan.jpg",
      theme: "lilac",
      intro: { title: "Quà 20/10 cho Tâm Đoan", hint: "Chạm vào hộp quà để mở nha em!" },
      share: "Big bro có quà 20/10 cho em nè!",
      heading: "3 lời chúc Big bro dành cho em",
      wishes: [
        {
          title: "Xinh",
          text: "Chúc Tâm Đoan ngày càng xinh, da đẹp, dáng xinh, ăn nhiều không béo.",
        },
        {
          title: "Học đâu nhớ đó",
          text: "Chúc Tâm Đoan học đâu nhớ đó, thi đâu trúng tủ đó, deadline nào cũng xong sớm, bớt phải ngủ muộn.",
        },
        {
          title: "Vui mỗi ngày",
          text: "Chúc Tâm Đoan luonvuituoi, gặp thêm nhiều người tốt, đi đường không gặp cướp.😎",
        },
      ],
      outro: "20/10 vui vẻ! 💐",
    },
    {
      slug: "hai-doan",                         // link riêng: …/hai-doan/
      name: "Hải Đoan",
      tagline: "Cô em gái đáng yêu của Big bro",
      photo: "assets/photos/hai-doan.jpg",
      theme: "sea",
      intro: { title: "Quà 20/10 cho Hải Đoan", hint: "Chạm vào hộp quà để mở nha em!" },
      share: "Big bro có quà 20/10 cho em nè!",
      heading: "3 lời chúc Big bro dành cho em",
      wishes: [
        {
          title: "Khỏe mạnh",
          text: "Chúc Hải Đoan luôn khỏe mạnh, tươi tắn. Bớt xem content thối não để đọc sách nhiều hơn.",
        },
        {
          title: "Học hành tấn tới",
          text: "Chúc Hải Đoan học hành tấn tới, kiểm tra thì điểm cao, mùa thi nào cũng qua.",
        },
        {
          title: "Mơ thật lớn",
          text: "Chúc Hải Đoan luôn giữ được ước mơ. Sau này thành công, kiếm nhiều tiền(để đãi anh đi ăn).",
        },
      ],
      outro: "20/10 vui vẻ! 💐",
    },
  ],
};
