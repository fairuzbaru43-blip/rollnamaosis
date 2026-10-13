(function () {
  "use strict";

  const semuaNama = [
    "Naufal", "lya", "king bogell", "Elin", "Nazil", "Dilan rajin sholat",
    "Rijal kancell", "Egi", "Safira", "Nuri", "diyan", "Vian", "Rengga",
    "sipa", "Fairuz anak yang soleh", "pio", "Aulia w", "Kiranaaa", "Raditya"
  ];

  let tersedia = [...semuaNama];
  let terpilih = [];
  let sedangRolling = false;
  let intervalId = null;
  let timeoutId = null;
  let sesi = 0; // penanda putaran; hasil lama diabaikan jika sesi berubah

  const DURASI = 3000;
  const KECEPATAN = 70;

  const el = {
    hasil: document.getElementById("hasil"),
    layar: document.getElementById("layar"),
    pesan: document.getElementById("pesan"),
    btnRolling: document.getElementById("btnRolling"),
    btnReset: document.getElementById("btnReset"),
    jumlahTersisa: document.getElementById("jumlahTersisa"),
    jumlahTerpilih: document.getElementById("jumlahTerpilih"),
    badgeTersisa: document.getElementById("badgeTersisa"),
    badgeRiwayat: document.getElementById("badgeRiwayat"),
    daftarTersedia: document.getElementById("daftarTersedia"),
    daftarRiwayat: document.getElementById("daftarRiwayat")
  };

  function acak(max) {
    if (window.crypto && crypto.getRandomValues) {
      const batas = Math.floor(4294967296 / max) * max;
      const buf = new Uint32Array(1);
      do { crypto.getRandomValues(buf); } while (buf[0] >= batas);
      return buf[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function buatItem(nomor, nama) {
    const li = document.createElement("li");
    const no = document.createElement("span");
    no.className = "no";
    no.textContent = nomor;
    const teks = document.createElement("span");
    teks.textContent = nama;
    li.append(no, teks);
    return li;
  }

  function isiDaftar(ul, data, pesanKosong) {
    ul.replaceChildren();
    if (data.length === 0) {
      const li = document.createElement("li");
      li.className = "kosong";
      li.textContent = pesanKosong;
      ul.appendChild(li);
      return;
    }
    data.forEach((nama, i) => ul.appendChild(buatItem(i + 1, nama)));
  }

  function render() {
    isiDaftar(el.daftarTersedia, tersedia, "Tidak ada peserta tersisa.");
    isiDaftar(el.daftarRiwayat, terpilih, "Belum ada nama terpilih.");
    el.jumlahTersisa.textContent = tersedia.length;
    el.jumlahTerpilih.textContent = terpilih.length;
    el.badgeTersisa.textContent = tersedia.length;
    el.badgeRiwayat.textContent = terpilih.length;
    el.btnRolling.disabled = sedangRolling || tersedia.length === 0;
    el.daftarRiwayat.scrollTop = el.daftarRiwayat.scrollHeight;
  }

  function hentikanTimer() {
    if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
    if (timeoutId !== null) { clearTimeout(timeoutId); timeoutId = null; }
  }

  function setPesan(teks, sukses) {
    el.pesan.textContent = teks;
    el.pesan.classList.toggle("sukses", Boolean(sukses));
  }

  function confetti() {
    const ikon = ["🎉", "✨", "🎊", "⭐"];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.textContent = ikon[i % ikon.length];
      s.style.left = (Math.random() * 95) + "%";
      s.style.animationDelay = (Math.random() * 0.4) + "s";
      el.layar.appendChild(s);
      setTimeout(() => s.remove(), 2200);
    }
  }

  function mulaiRolling() {
    if (sedangRolling || tersedia.length === 0) return;
    sedangRolling = true;
    const sesiIni = ++sesi;
    el.btnRolling.disabled = true;
    el.btnRolling.textContent = "⏳ Mengacak...";
    el.hasil.classList.remove("muncul");
    el.hasil.classList.add("rolling");
    setPesan("Mengacak nama...", false);

    intervalId = setInterval(() => {
      if (sesiIni !== sesi || tersedia.length === 0) return;
      el.hasil.textContent = tersedia[acak(tersedia.length)];
    }, KECEPATAN);

    timeoutId = setTimeout(() => selesaiRolling(sesiIni), DURASI);
  }

  function selesaiRolling(sesiIni) {
    if (sesiIni !== sesi) return; // sudah di-reset
    hentikanTimer();
    if (tersedia.length === 0) { sedangRolling = false; render(); return; }

    const [nama] = tersedia.splice(acak(tersedia.length), 1);
    terpilih.push(nama);
    sedangRolling = false;

    el.hasil.classList.remove("rolling");
    el.hasil.textContent = nama;
    void el.hasil.offsetWidth; // restart animasi
    el.hasil.classList.add("muncul");
    confetti();

    el.btnRolling.textContent = "ROLLING SEKARANG";
    if (tersedia.length === 0) {
      setPesan("Selesai! Seluruh peserta sudah mendapatkan giliran.", true);
    } else {
      setPesan("✅ Berhasil! " + nama + " terpilih.", true);
    }
    render();
  }

  function resetSemua() {
    if (!window.confirm("Reset semua? Riwayat nama terpilih akan dihapus.")) return;
    sesi++;
    hentikanTimer();
    sedangRolling = false;
    tersedia = [...semuaNama];
    terpilih = [];
    el.hasil.classList.remove("rolling", "muncul");
    el.hasil.textContent = "Siap Rolling?";
    el.btnRolling.textContent = "ROLLING SEKARANG";
    setPesan("Tekan tombol untuk memilih satu nama.", false);
    render();
  }

  el.btnRolling.addEventListener("click", mulaiRolling);
  el.btnReset.addEventListener("click", resetSemua);
  render();
})();
