(function () {
  "use strict";

  const semuaNama = [
    "Naufal", "lya", "king bogell", "Elin", "Nazil", "Dilan rajin sholat",
    "Rijal kancell", "Egi", "Safira", "Nuri", "diyan", "Vian", "Rengga",
    "sipa", "Fairuz anak yang soleh", "pio", "Aulia w", "Kiranaaa", "Raditya"
  ];
  const semuaHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  let tersedia = [...semuaNama];
  let terpilih = []; // { nama, hari }
  let sedangRolling = false;
  let intervalId = null;
  let timeoutId = null;
  let sesi = 0;
  let hariBaru = null;
  let kapasitas = buatKapasitas();

  // Bagi rata: 19 orang / 5 hari = empat hari berisi 4 orang, satu hari berisi 3.
  // Hari yang kebagian lebih sedikit diacak setiap putaran baru.
  function buatKapasitas() {
    const dasar = Math.floor(semuaNama.length / semuaHari.length);
    const sisa = semuaNama.length % semuaHari.length;
    const urutan = [...semuaHari];
    for (let i = urutan.length - 1; i > 0; i--) {
      const j = acak(i + 1);
      [urutan[i], urutan[j]] = [urutan[j], urutan[i]];
    }
    const hasil = {};
    urutan.forEach((h, i) => { hasil[h] = dasar + (i < sisa ? 1 : 0); });
    return hasil;
  }

  function hariTersedia() {
    return semuaHari.filter((h) => terpilih.filter((t) => t.hari === h).length < kapasitas[h]);
  }

  const DURASI = 3000;
  const KECEPATAN = 70;

  const $ = (id) => document.getElementById(id);
  const el = {
    hasil: $("hasil"), hariHasil: $("hariHasil"), layar: $("layar"), pesan: $("pesan"),
    btnRolling: $("btnRolling"), btnReset: $("btnReset"),
    jumlahTersisa: $("jumlahTersisa"), jumlahTerpilih: $("jumlahTerpilih"),
    badgeTersisa: $("badgeTersisa"), badgeRiwayat: $("badgeRiwayat"),
    daftarTersedia: $("daftarTersedia"), daftarRiwayat: $("daftarRiwayat"), jadwal: $("jadwal")
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

  function buatItem(nomor, nama, hari) {
    const li = document.createElement("li");
    const no = document.createElement("span");
    no.className = "no";
    no.textContent = nomor;
    const teks = document.createElement("span");
    teks.textContent = nama;
    li.append(no, teks);
    if (hari) {
      const tag = document.createElement("span");
      tag.className = "tag-hari";
      tag.textContent = hari;
      li.appendChild(tag);
    }
    return li;
  }

  function isiDaftar(ul, data, pesanKosong, tampilHari) {
    ul.replaceChildren();
    if (data.length === 0) {
      const li = document.createElement("li");
      li.className = "kosong";
      li.textContent = pesanKosong;
      ul.appendChild(li);
      return;
    }
    data.forEach((d, i) => {
      ul.appendChild(tampilHari ? buatItem(i + 1, d.nama, d.hari) : buatItem(i + 1, d));
    });
  }

  function renderJadwal() {
    el.jadwal.replaceChildren();
    semuaHari.forEach((hari) => {
      const isi = terpilih.filter((t) => t.hari === hari);
      const kol = document.createElement("div");
      kol.className = "hari-kolom" + (hari === hariBaru ? " baru" : "");
      const judul = document.createElement("h3");
      judul.textContent = hari;
      const jml = document.createElement("span");
      jml.className = "badge";
      jml.textContent = isi.length + "/" + kapasitas[hari];
      judul.appendChild(jml);
      const ul = document.createElement("ul");
      if (isi.length === 0) {
        const li = document.createElement("li");
        li.className = "kosong";
        li.textContent = "Belum ada";
        ul.appendChild(li);
      } else {
        isi.forEach((t) => {
          const li = document.createElement("li");
          li.textContent = t.nama;
          ul.appendChild(li);
        });
      }
      kol.append(judul, ul);
      el.jadwal.appendChild(kol);
    });
  }

  function render() {
    isiDaftar(el.daftarTersedia, tersedia, "Tidak ada peserta tersisa.", false);
    isiDaftar(el.daftarRiwayat, terpilih, "Belum ada nama terpilih.", true);
    renderJadwal();
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
    hariBaru = null;
    const sesiIni = ++sesi;
    el.btnRolling.disabled = true;
    el.btnRolling.textContent = "⏳ Mengacak...";
    el.hasil.classList.remove("muncul");
    el.hariHasil.classList.remove("muncul");
    el.hasil.classList.add("rolling");
    el.hariHasil.hidden = false;
    setPesan("Mengacak nama dan hari...", false);
    renderJadwal();

    intervalId = setInterval(() => {
      if (sesiIni !== sesi || tersedia.length === 0) return;
      el.hasil.textContent = tersedia[acak(tersedia.length)];
      const pilihan = hariTersedia();
      if (pilihan.length) el.hariHasil.textContent = "📅 " + pilihan[acak(pilihan.length)];
    }, KECEPATAN);

    timeoutId = setTimeout(() => selesaiRolling(sesiIni), DURASI);
  }

  function selesaiRolling(sesiIni) {
    if (sesiIni !== sesi) return;
    hentikanTimer();
    if (tersedia.length === 0) { sedangRolling = false; render(); return; }

    const [nama] = tersedia.splice(acak(tersedia.length), 1);
    const sisaHari = hariTersedia();
    const hari = sisaHari[acak(sisaHari.length)];
    terpilih.push({ nama, hari });
    hariBaru = hari;
    sedangRolling = false;

    el.hasil.classList.remove("rolling");
    el.hasil.textContent = nama;
    el.hariHasil.textContent = "📅 " + hari;
    void el.hasil.offsetWidth;
    el.hasil.classList.add("muncul");
    el.hariHasil.classList.add("muncul");
    confetti();

    el.btnRolling.textContent = "ROLLING SEKARANG";
    if (tersedia.length === 0) {
      setPesan("🎉 Selesai! Seluruh peserta sudah mendapatkan giliran.", true);
    } else {
      setPesan("✅ Berhasil! " + nama + " dapat jadwal hari " + hari + ".", true);
    }
    render();
  }

  function resetSemua() {
    if (!window.confirm("Reset semua? Riwayat dan jadwal akan dihapus.")) return;
    sesi++;
    hentikanTimer();
    sedangRolling = false;
    hariBaru = null;
    tersedia = [...semuaNama];
    terpilih = [];
    kapasitas = buatKapasitas();
    el.hasil.classList.remove("rolling", "muncul");
    el.hasil.textContent = "Siap Rolling?";
    el.hariHasil.hidden = true;
    el.hariHasil.textContent = "";
    el.btnRolling.textContent = "ROLLING SEKARANG";
    setPesan("Tekan tombol untuk memilih satu nama.", false);
    render();
  }

  el.btnRolling.addEventListener("click", mulaiRolling);
  el.btnReset.addEventListener("click", resetSemua);
  render();
})();
