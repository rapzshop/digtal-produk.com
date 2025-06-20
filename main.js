let stok = 10;

const firebaseConfig = {
  projectId: "pembayaran-8587d",
  storageBucket: "pembayaran-8587d.appspot.com",
  messagingSenderId: "254544978602",
  appId: "1:254544978602:web:6b211fd7a68c57e30be6d3",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function generateID() {
  return 'ORDER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function getHargaByProduk(produk) {
  return produk === "canva" ? "4000" : "5000";
}

function setHargaOtomatis() {
  const produk = document.getElementById("produk").value;
  const harga = getHargaByProduk(produk);
  document.getElementById("harga").value = harga;
}

function kirimPesan() {
  const nama = document.getElementById("nama").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const produk = document.getElementById("produk").value;
  const metode = document.getElementById("metode").value;
  const kode = document.getElementById("kode").value || 'Tidak digunakan';
  const harga = getHargaByProduk(produk);
  const email = document.getElementById("email").value.trim();
  const bukti = document.getElementById("bukti").files[0];
  const idTransaksi = generateID();

  if (!/^08[0-9]{8,11}$/.test(wa)) return alert("❌ Nomor WA tidak valid.");
  if (!nama) return alert("❗ Nama wajib diisi.");
  if (!metode) return alert("❗ Pilih metode pembayaran.");
  if (!bukti) return alert("❗ Upload bukti transfer wajib.");
  if (produk === "canva" && !email) return alert("❗ Email untuk Canva wajib diisi.");
  if (stok <= 0) return alert("❌ Stok habis.");

  document.getElementById("submitBtn").disabled = true;
  document.getElementById("spinner").style.display = "block";

  const waktu = new Date().toLocaleString("id-ID");
  const data = {
    nama, wa, produk, metode, kode, harga, email,
    waktu, status: "menunggu", id: idTransaksi
  };

  db.ref("pesanan/" + idTransaksi).set(data).then(() => {
    const msg = `
🛒 Pesanan Baru Masuk
👤 *${nama}*
📱 *${wa}*
📦 *${produk === "canva" ? "Canva Pro" : "Alight Motion"}*
💳 *${metode}*
💰 *Rp ${harga}*
🎟 *${kode}*
📧 *${email || "-"}*
🕒 ${waktu}
✅ Konfirmasi: https://console.firebase.google.com/project/pembayaran-8587d/database/pembayaran-8587d-default-rtdb/data/~2Fpesanan~2F${idTransaksi}
`;

    const botToken = "7834741276:AAE4aBvJWrAQt1iUNirsayeuyA3zCBWu0oA";
    const chatID = "7133478033";

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatID, text: msg, parse_mode: "Markdown" }),
    });

    const formData = new FormData();
    formData.append("chat_id", chatID);
    formData.append("photo", bukti);
    formData.append("caption", `🧾 Bukti Transfer dari ${nama}`);

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      body: formData,
    }).then(() => {
      stok--;
      document.getElementById("stok-text").textContent = stok;

      const pesanPembeli =
        produk === "canva"
          ? `📦 *Canva Pro - 1 bulan*\n📧 Email: ${email}\n💳 Metode: ${metode}\n💰 Harga: Rp ${harga}\n🕒 Tanggal: ${waktu}\n\nTerima kasih telah melakukan pemesanan!\nProduk akan segera diproses oleh admin.`
          : `📦 *Alight Motion - 1 Tahun*\n📆 Garansi 3 Bulan\n🔗 https://jpst.it/3UWRT\n📧 Email: ${email || "-"}\n💳 Metode: ${metode}\n💰 Harga: Rp ${harga}\n🕒 Tanggal: ${waktu}\n\nTerima kasih telah order 🙏`;

      fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: { Authorization: "5GMYufEN5CdzTGmwdTn4" },
        body: new URLSearchParams({
          target: wa,
          message: pesanPembeli,
          delay: 2,
        }),
      });

      if (produk === "alight") {
        const fonteApi = "s5qRBg43GWaR9TkFSwMb";
        const pesanWa = `📦 Alight Motion - 1 Tahun\n🗒 Email: kerewasfas-9754@yopmail.com\n🔗 https://jpst.it/3UWRT\n📆 Garansi 3 Bulan\nTerima kasih telah order 🙏`;

        fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: { Authorization: fonteApi },
          body: new URLSearchParams({
            target: wa,
            message: pesanWa,
            delay: 3,
          }),
        }).then(() => {
          alert("✅ Produk telah dikirim ke WhatsApp buyer!");
        }).catch(() => alert("⚠ Produk gagal dikirim via WA."));
      } else {
        alert("✅ Pesanan berhasil dikirim. Produk akan dikirim setelah admin konfirmasi.");
      }

      document.getElementById("submitBtn").disabled = false;
      document.getElementById("spinner").style.display = "none";
    });
  });
}

const countdown = document.getElementById("countdown");
const now = new Date().getTime();
const end = now + 3 * 60 * 60 * 1000;
const x = setInterval(() => {
  const now = new Date().getTime();
  const distance = end - now;
  if (distance < 0) {
    clearInterval(x);
    countdown.innerHTML = "❌ Promo berakhir";
    return;
  }
  const h = Math.floor(distance / (1000 * 60 * 60));
  const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((distance % (1000 * 60)) / 1000);
  countdown.innerHTML = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}, 1000);
