// Mesin game: peta tile, pemain, NPC, dialog visual novel, waktu, ending.
const Game = (() => {
  const TS = 16, VW = 320, VH = 180, SC = 2, DAY_LEN = 1800, DAY_START_MINUTES = 300, DAYS = 30;
  const GRASS = 0, ROAD = 1, WALL = 2, TREE = 3, FLOOR = 4, DOOR = 5, PATH = 6, BED = 7, DESK = 8;
  const SOLID = World.SOLID;
  const PHASES = ["Pagi", "Siang", "Sore"];
  const SPAWN = { x: 4 * TS + 8, y: 4 * TS + 14 };   // tengah karpet di kamar Marco
  const $ = (id) => document.getElementById(id);
  const cv = $("canvas"); let ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // ---------- peta ----------
  // Peta, tile, dan semua gambar lingkungan ada di world.js.
  const maps = World.maps, doors = World.doors;

  // ---------- NPC & cerita ----------
  // wander: berjalan acak di sekitar titik awal (rx/ry = jangkauan piksel). chat: NPC pelengkap, tidak mengubah statistik cerita.
  const npcs = [
    { id: "nenek", name: "Nenek", map: "home", x: 16, y: 11, color: "#b9a0d6", hair: "#ddd", wander: true, rx: 40, ry: 20, spd: 10 },
    { id: "sari", name: "Bu Sari", map: "class", x: 36, y: 2, color: "#2e8b57", hair: "#222", long: true },
    { id: "rafi", name: "Rafi", map: "world", x: 35, y: 14, color: "#c0392b", hair: "#111", wander: true, rx: 60, ry: 40 },
    // --- geng pembuly: menghadang Marco dan memaksanya ikut circle mereka (lihat startHadang) ---
    { id: "arga", name: "Arga", map: "world", x: 45, y: 12, color: "#eeeeee", hair: "#b8461f", gang: true },
    { id: "galih", name: "Galih", map: "world", x: 44, y: 14, color: "#eeeeee", hair: "#241a30", gang: true, wander: true, rx: 20, ry: 10, spd: 10 },
    { id: "bram", name: "Bram", map: "world", x: 46, y: 14, color: "#eeeeee", hair: "#1a1a22", gang: true, wander: true, rx: 24, ry: 12, spd: 12 },
    // --- Evelyn: teman masa kecil Marco, tetangga sebelah rumah Nenek. Kedekatan (s.e) menentukan good ending bersamanya ---
    { id: "evelyn", name: "Evelyn", map: "world", x: 18, y: 14, color: "#eeeeee", pants: "#4a5d78", hair: "#241a30", wander: true, rx: 44, ry: 22, spd: 12 },
    { id: "satpam", name: "Pak Satpam", map: "world", x: 113, y: 13, color: "#344d73", pants: "#242d43", hair: "#28232a", skin: "#c98f5f", hat: "#243b60", chat: ["Pagi. Gerbang masih terbuka, jangan lupa masuk sebelum setengah tujuh.", "Kalau sudah bel masuk, langsung menuju kelas, ya.", "Jaga ketertiban di lingkungan sekolah."] },
    // Warga distrik baru. Mereka memberi suasana dan cerita kecil di luar jalur utama.
    { id: "buRukmini", name: "Bu Rukmini", map: "world", x: 28, y: 108, color: "#bd7180", hair: "#33251f", hijab: "#e4c7a6", skin: "#c98f5f", wander: true, rx: 90, ry: 42, spd: 9, chat: ["Gang sini memang sempit, tapi semua tetangga saling kenal.", "Kalau malam, lampu depan rumah jangan lupa dinyalakan."] },
    { id: "fajar", name: "Fajar", map: "world", x: 55, y: 125, color: "#4d83a8", hair: "#222", wander: true, rx: 60, ry: 38, spd: 13, chat: ["Gue sering bantu di bengkel. Lumayan buat uang jajan.", "Kalau mau ke pusat kota, ikutin jalan besar ke timur."] },
    { id: "pakHendra", name: "Pak Hendra", map: "world", x: 180, y: 23, color: "#647a91", hair: "#555", hat: "#30394d", skin: "#d2a27b", wander: true, rx: 70, ry: 34, spd: 8, chat: ["Kawasan sini tenang, tapi biaya hidupnya memang tinggi.", "Tolong jangan memetik bunga taman, ya."] },
    { id: "celine", name: "Celine", map: "world", x: 197, y: 42, color: "#eee4dc", pants: "#59627a", hair: "#5a3b32", long: true, wander: true, rx: 45, ry: 28, spd: 11, chat: ["Aku suka jalan pagi di taman kompleks.", "Kota ini ternyata punya banyak sudut yang belum pernah aku lihat."] },
    { id: "mira", name: "Mira", map: "world", x: 178, y: 114, color: "#d18a9a", hair: "#382a32", hijab: "#e9c8d8", wander: true, rx: 70, ry: 36, spd: 12, chat: ["Pasar malam paling ramai kalau akhir pekan.", "Lampu-lampu di sini bagus banget setelah matahari tenggelam."] },
    { id: "danu", name: "Danu", map: "world", x: 207, y: 113, color: "#4c779d", hair: "#242424", wander: true, rx: 55, ry: 30, spd: 13, chat: ["Arcade itu tempat favorit anak-anak sekitar.", "Kadang ada pertunjukan musik kecil di plaza."] },
    { id: "seno", name: "Seno", map: "world", x: 130, y: 102, color: "#9b8a62", hair: "#333", hat: "#55452f", wander: true, rx: 65, ry: 40, spd: 10, chat: ["Ini pusat kota. Semua jalur angkot biasanya lewat sini.", "Kalau tersesat, cari papan petunjuk di persimpangan."] },
    { id: "angkotHome", name: "Pak Joko (Sopir Angkot)", map: "world", x: 12, y: 16, color: "#3f8f75", hair: "#242424", hat: "#24345f", skin: "#c98f5f", commute: true, chat: ["Angkot jurusan SMA Nusa. Lima belas menit kalau jalanan lancar."] },
    // Pak Joko menunggu di sisi halte SMA Nusa; titiknya sengaja dekat jalur pejalan kaki.
    { id: "angkotSchool", name: "Pak Joko (Sopir Angkot)", map: "world", x: 116, y: 18, color: "#3f8f75", hair: "#242424", hat: "#24345f", skin: "#c98f5f", commute: true },
    { id: "warung", name: "Pak Darto", map: "world", x: 10, y: 27, color: "#e1a21b", hair: "#666", skin: "#d9a878" },
    // --- warga & siswa yang berjalan acak ---
    { id: "joko", name: "Pak Joko", map: "world", x: 30, y: 29, color: "#6b8e23", hair: "#555", hat: "#d8b45a", skin: "#c98f5f", wander: true, rx: 110, ry: 40, spd: 12,
      chat: ["Padi tahun ini bagus, Nak. Tinggal tunggu menguning.", "Burung-burung itu bandel. Makanya Bapak pasang orang-orangan sawah.", "Sekolah yang rajin ya. Jangan kayak Bapak, seumur hidup di sawah."] },
    { id: "tini", name: "Bu Tini", map: "world", x: 8, y: 17, color: "#c2506b", hair: "#222", long: true, wander: true, rx: 150, ry: 0, spd: 16,
      chat: ["Mau ke pasar, Marco. Nenekmu titip kue, laris terus katanya.", "Kamu makin tinggi aja. Makan yang banyak ya.", "Hati-hati nyeberang, mobil sekarang ngebut-ngebut."] },
    { id: "dimas", name: "Dimas", map: "world", x: 32, y: 14, pants: "#6b7078", color: "#eeeeee", hair: "#1a1a1a", wander: true, rx: 50, ry: 30, spd: 15,
      chat: ["Tugas Matematika udah belum? Gue belum nyentuh sama sekali.", "Katanya Bu Sari mau kasih ujian dadakan. Mampus.", "Kantin tadi penuh banget, gue nyerah beli gorengan."] },
    { id: "putri", name: "Putri", map: "world", x: 38, y: 14, pants: "#6b7078", color: "#eeeeee", hair: "#222", hijab: "#d9d9e6", wander: true, rx: 45, ry: 30, spd: 14,
      chat: ["Marco, kamu kemarin gak masuk, ya? Ini catatannya kupinjamkan.", "Aku mau daftar kuliah kedokteran. Doain ya!", "Kalau stres, coba jalan sore di dekat kolam. Tenang banget."] },
    { id: "ujang", name: "Mang Ujang", map: "world", x: 26, y: 15, color: "#555e66", hair: "#222", hat: "#2f6f4f", skin: "#c98f5f", wander: true, rx: 36, ry: 14, spd: 11,
      chat: ["Ojek, Dek? Murah, lima ribu sampai sekolah.", "Zaman sekarang penumpang pindah ke aplikasi. Mamang ngetem aja.", "Kalau mau cepat, jangan lewat sawah. Becek."] },
    { id: "warti", name: "Bu Warti", map: "world", x: 17, y: 27, color: "#e08aa0", hair: "#3a2a20", hijab: "#f0d8a0", wander: true, rx: 8, ry: 70, spd: 13,
      chat: ["Jemuran Ibu jangan disenggol ya, baru dicuci.", "Gang ini sempit, tapi tetangganya baik-baik semua.", "Ibu lagi cari Pak Darto, mau beli gula."] },
    { id: "bimo", name: "Bimo", map: "world", x: 16, y: 11, color: "#3a8fe0", hair: "#111", hat: "#e0483a", wander: true, rx: 80, ry: 24, spd: 24,
      chat: ["Kak Marco! Lihat, aku nangkap kupu-kupu!", "Bebek di kolam itu galak, tadi aku dikejar.", "Kakak mau main petak umpet? Tapi jangan ngintip!"] },
    { id: "haji", name: "Pak Haji Soleh", map: "world", x: 3, y: 14, color: "#f2f2f2", hair: "#ddd", hat: "#222", skin: "#d9a878", wander: true, rx: 44, ry: 16, spd: 9,
      chat: ["Nenekmu itu orang baik. Jaga dia ya, Nak.", "Selagi masih ada waktu, bahagiakan orang tua.", "Anak muda itu pilih-pilih teman, jangan sembarangan."] },
    // --- teman sekelas ---
    { id: "tono", name: "Tono", map: "class", x: 34, y: 4, pants: "#6b7078", color: "#eeeeee", hair: "#222", wander: true, rx: 24, ry: 0, spd: 13,
      chat: ["PR Fisika kamu udah? Boleh liat nomor tiga?", "Jam kosong gini enaknya tidur.", "Bu Sari kalau marah serem, tapi aslinya baik."] },
    { id: "sinta", name: "Sinta", map: "class", x: 38, y: 4, pants: "#6b7078", color: "#eeeeee", hair: "#222", hijab: "#e4e4ee", wander: true, rx: 20, ry: 0, spd: 13,
      chat: ["Aku lagi hafalin rumus buat ujian. Kamu belajar apa?", "Marco, kamu sebenarnya pintar loh, cuma males.", "Jangan lupa piket hari ini ya."] },
    { id: "wawan", name: "Wawan", map: "class", x: 34, y: 6, pants: "#6b7078", color: "#eeeeee", hair: "#111", wander: true, rx: 24, ry: 0, spd: 14,
      chat: ["Rafi ngajak nongkrong lagi, tapi aku takut ketahuan Bu Sari.", "Kantin buka, nih. Mau nitip gorengan?", "Semester terakhir... gak kerasa, ya."] },
    // Siswa tambahan membuat sekolah terasa hidup di setiap lantai.
    { id: "naya", name: "Naya", map: "class", x: 42, y: 4, pants: "#6b7078", color: "#eeeeee", hair: "#34252a", hijab: "#e8b8a8", wander: true, rx: 22, ry: 12, spd: 12,
      chat: ["Papan kenangan kelas nanti dipasang dekat aula, katanya.", "Kamu lihat pengumuman try out belum?", "Aku lagi nyari spidol warna buat tugas kelompok."] },
    { id: "fikri", name: "Fikri", map: "class", x: 46, y: 4, pants: "#6b7078", color: "#eeeeee", hair: "#171717", wander: true, rx: 22, ry: 12, spd: 13,
      chat: ["Bel masuk tadi hampir gak kedengeran gara-gara anak kelas sebelah.", "Nanti istirahat gue mau beli es teh.", "Lu udah belajar buat ujian akhir belum?"] },
    { id: "riko", name: "Riko", map: "class", x: 50, y: 4, pants: "#6b7078", color: "#eeeeee", hair: "#5a3826", wander: true, rx: 20, ry: 12, spd: 12,
      chat: ["Gue piket hari ini. Kenapa selalu kebagian nyapu?", "Lapangan indoor lagi dipakai latihan basket.", "Tadi ada yang ninggalin buku di lorong."] },
    { id: "lala", name: "Lala", map: "lt2", x: 5, y: 4, pants: "#6b7078", color: "#eeeeee", hair: "#33252a", hijab: "#d7c9f0", wander: true, rx: 18, ry: 10, spd: 12,
      chat: ["Anak kelas XII katanya lagi sibuk nyiapin acara perpisahan.", "Aku suka duduk dekat jendela kalau jam kosong.", "Jangan lupa bawa buku paket besok, ya."] },
    { id: "kevin", name: "Kevin", map: "lt2", x: 13, y: 4, pants: "#6b7078", color: "#eeeeee", hair: "#252525", wander: true, rx: 18, ry: 10, spd: 13,
      chat: ["Tangga sini rame banget pas pergantian jam.", "Gue lagi latihan buat seleksi basket.", "Ada yang tahu jadwal remedial minggu ini?"] },
    { id: "meli", name: "Meli", map: "lt3", x: 5, y: 4, pants: "#6b7078", color: "#eeeeee", hair: "#3a2929", hijab: "#e2d8c7", wander: true, rx: 18, ry: 10, spd: 12,
      chat: ["Kakak kelas XII kelihatannya sibuk terus akhir-akhir ini.", "Aku tadi bantu guru bawa buku ke ruang guru.", "Perpustakaan lantai dua adem banget."] },
    { id: "dion", name: "Dion", map: "lt3", x: 13, y: 4, pants: "#6b7078", color: "#eeeeee", hair: "#161616", wander: true, rx: 18, ry: 10, spd: 13,
      chat: ["Ada pertandingan antarkelas minggu depan, ikut nonton gak?", "Gue lupa bawa penggaris lagi.", "Bel pulang tuh suara paling indah."] },
    // Pengunjung dan penjaga kantin.
    { id: "yati", name: "Bu Yati", map: "canteen", x: 5, y: 4, color: "#d98c62", hair: "#34231d", hijab: "#f0d6a4", skin: "#c98f5f",
      chat: ["Mau pesan apa, Nak? Hari ini ada nasi kuning dan gorengan.", "Jangan lupa buang bungkus makanan ke tempat sampah, ya.", "Kalau kantin ramai, antre yang rapi. Semua kebagian."] },
    { id: "aldi", name: "Aldi", map: "canteen", x: 11, y: 6, pants: "#6b7078", color: "#eeeeee", hair: "#171717", wander: true, rx: 28, ry: 18, spd: 13,
      chat: ["Gue udah antre dari tadi, tapi es teh-nya belum jadi.", "Duduk sini aja, masih ada tempat.", "Gorengan kantin ini emang juara."] },
    { id: "rara", name: "Rara", map: "canteen", x: 18, y: 6, pants: "#6b7078", color: "#eeeeee", hair: "#35272c", hijab: "#c6d8e8", wander: true, rx: 30, ry: 18, spd: 12,
      chat: ["Tadi Bu Sari ngasih tugas kelompok mendadak.", "Aku lagi nunggu Naya. Katanya mau makan bareng.", "Kantin penuh banget kalau bel istirahat bunyi."] },
    { id: "bagas", name: "Bagas", map: "canteen", x: 22, y: 11, pants: "#6b7078", color: "#eeeeee", hair: "#503421", wander: true, rx: 22, ry: 16, spd: 14,
      chat: ["Ada sambal baru, tapi pedesnya lumayan.", "Gue tadi hampir lupa bawa uang jajan.", "Abis makan langsung balik kelas, jangan sampai telat."] },
    { id: "salsa", name: "Salsa", map: "canteen", x: 9, y: 11, pants: "#6b7078", color: "#eeeeee", hair: "#3c2c28", hijab: "#e7b8bf", wander: true, rx: 24, ry: 14, spd: 12,
      chat: ["Kalian bahas acara perpisahan? Aku mau bantu dekorasi.", "Ada tempat kosong di meja sana.", "Aku tadi lihat Evelyn lewat lorong."] }
  ];
  // Rombongan siswa: mereka mulai dari jalan sekitar sekolah, berjalan ke pintu utama,
  // lalu baru dipindahkan ke lorong dalam setelah benar-benar mencapai pintu.
  const SCHOOL_STUDENTS = [
    ["Adit", "#4d83a8"], ["Nanda", "#c47c9b"], ["Reza", "#688b63"], ["Intan", "#b28bc8"],
    ["Fauzan", "#b18b56"], ["Citra", "#d08c9a"], ["Yoga", "#6388b3"], ["Dewi", "#9c7fb2"],
    ["Rangga", "#5b9b8d"], ["Alya", "#d49b6a"], ["Dito", "#7885a6"], ["Maya", "#c77f8b"],
    ["Farhan", "#8b9860"], ["Nisa", "#bd8db1"], ["Iqbal", "#668aa0"], ["Vina", "#c18a6d"],
    ["Rizky", "#8a9b70"], ["Tasya", "#b77d9b"], ["Hafiz", "#7b82a9"], ["Lina", "#d0a16c"],
    ["Rendi", "#6e9b92"], ["Salsa", "#c987a0"], ["Della", "#a88ac1"], ["Bayu", "#7791a8"]
  ];
  SCHOOL_STUDENTS.forEach(([name, color], i) => {
    const sx = 108 + (i % 6), sy = 17 + Math.floor(i / 6) * 2 + (i % 2);
    npcs.push({ id: "schoolStudent" + String(i + 1).padStart(2, "0"), name, map: "world",
      x: sx, y: sy, color, pants: "#68717d", hair: i % 3 === 0 ? "#30252a" : "#211f25",
      commute: { start: 1 / 24 + Math.floor(i / 4) * 0.003, started: false, targetX: 114 * TS + 8, targetY: 11 * TS + 14 },
      chat: ["Pagi! Kita masuk bareng, yuk.", "Bel sebentar lagi. Jangan sampai terlambat.", "Kelas hari ini katanya bakal ramai."]
    });
  });

  npcs.push(
    { id: "evelynBreak", name: "Evelyn", map: "class", x: 36, y: 9, color: "#eeeeee", pants: "#4a5d78", hair: "#241a30" },
    { id: "evelynCanteen", name: "Evelyn", map: "canteen", x: 15, y: 10, color: "#eeeeee", pants: "#4a5d78", hair: "#241a30" },
    { id: "bramYard", name: "Bram", map: "backyard", x: 12, y: 8, color: "#eeeeee", hair: "#1a1a22", gang: true },
    { id: "galihYard", name: "Galih", map: "backyard", x: 10, y: 8, color: "#eeeeee", hair: "#241a30", gang: true },
    { id: "rafiYard", name: "Rafi", map: "backyard", x: 14, y: 8, color: "#c0392b", hair: "#111", gang: true },
    { id: "satpamYard", name: "Pak Satpam", map: "backyard", x: 12, y: 3, color: "#344d73", pants: "#242d43", hair: "#28232a", skin: "#c98f5f", hat: "#243b60" }
  );
  // ---------- penghuni sekolah ----------
  // Kepala sekolah, wakil kepala sekolah, dokter UKS, guru piket, guru di tiap kelas, dan siswa yang duduk di bangku masing-masing.
  // Posisi dihitung dari denah sekolah di world.js (maps.*.rooms), jadi ikut bergeser kalau denah diubah.
  const roomOx = (map, label) => { const r = maps[map].rooms.find((o) => o.label === label); return r ? r.ox : 0; };
  const SCHOOL_MAP_OF = (label) => (label.startsWith("XII") ? "class" : label.startsWith("XI") ? "lt2" : "lt3");

  const kepOx = roomOx("class", "KEPSEK"), wakOx = roomOx("class", "WAKEPSEK"), guruOx = roomOx("class", "GURU"), uksOx = roomOx("class", "UKS");
  npcs.push(
    // Kepala sekolah berdiri di belakang mejanya; Marco menghampiri dari sisi meja.
    { id: "kepsek", name: "Pak Hartono (Kepsek)", map: "class", x: kepOx + 3, y: 2, color: "#c2b08a", pants: "#3a3d4a", hair: "#8d8d92", skin: "#d2a27b", glasses: true, tie: "#7a2230", staff: true, noArt: true,
      chat: ["Selamat datang, Marco. Bapak Hartono, kepala sekolah di sini. Semester terakhir ini manfaatkan sebaik-baiknya.",
        "Disiplin itu kebiasaan kecil: datang tepat waktu, mengerjakan tugas, menghormati guru dan teman.",
        "Pintu ruangan Bapak selalu terbuka kalau kamu punya masalah, di sekolah maupun di rumah.",
        "Gerbang ditutup pukul setengah tujuh. Aturan itu berlaku untuk semua siswa, tanpa kecuali.",
        "Kelulusan bukan akhir, Marco. Itu pintu menuju hal-hal yang lebih besar.",
        "Sekolah ini punya banyak alumni yang sukses. Bapak ingin kamu jadi salah satunya."] },
    { id: "wakepsek", name: "Bu Ratna (Wakepsek)", map: "class", x: wakOx + 3, y: 2, color: "#c9b894", pants: "#3a3d4a", hair: "#2a1f1c", hijab: "#6b4f8a", skin: "#c98f5f", staff: true, noArt: true,
      chat: ["Ibu Ratna, wakil kepala sekolah bidang kesiswaan. Urusan tata tertib dan kegiatan siswa, tanyakan ke Ibu.",
        "Seragam rapi, sepatu hitam, rambut sesuai aturan. Sederhana, tapi banyak yang melupakannya.",
        "Kegiatan perpisahan sedang Ibu susun bersama OSIS. Kalau mau membantu, Ibu senang sekali.",
        "Kalau ada teman yang bermasalah, jangan dijauhi. Ajak bicara, atau laporkan ke Ibu.",
        "Ibu hafal wajah anak-anak yang sering terlambat. Semoga kamu bukan salah satunya."] },
    // Dokter berdiri di samping meja pemeriksaan, dekat lemari obat.
    { id: "dokter", name: "dr. Anita (Dokter UKS)", map: "class", x: uksOx + 4, y: 3, color: "#f2f5f6", coat: "#58a6a8", pants: "#3d4f66", hair: "#241a1a", long: true, skin: "#e0b08a", staff: true, noArt: true,
      chat: ["Selamat datang di UKS. Kalau ada keluhan, bilang saja. Jangan ditahan-tahan.",
        "Sarapan itu penting, Marco. Banyak siswa pusing di kelas karena perut kosong.",
        "Obat-obatan ada di lemari ini, tapi saya tidak memberikannya tanpa memeriksa dulu.",
        "Istirahat cukup, makan teratur, banyak minum air putih. Resep paling murah dan paling manjur.",
        "Anak-anak kelas XII sering datang dengan keluhan lambung. Biasanya karena stres ujian.",
        "Kalau ada teman yang pingsan, baringkan dulu dan panggil saya. Jangan panik."] }
  );

  // Guru piket berkeliling di lobi dan lorong lantai 1.
  npcs.push({ id: "guruPiket", name: "Pak Wahyu (Guru Piket)", map: "class", x: World.school.entranceX, y: 9, color: "#8a5a2b", pants: "#2f3340", hair: "#1c1c1c", skin: "#c98f5f", glasses: true, wander: true, rx: 70, ry: 14, spd: 11, noArt: true,
    chat: ["Hari ini Bapak yang piket. Siapa yang telat, Bapak catat.", "Jangan berlarian di lorong. Licin, nanti jatuh.", "Bel masuk sudah bunyi? Cepat ke kelas, jangan nongkrong.", "Kalau ada yang butuh izin keluar, ke ruang piket dulu."] });

  // Ruang guru: tiga guru di meja masing-masing, menghadap meja.
  npcs.push(
    { id: "guruBK", name: "Bu Siska (Guru BK)", map: "class", x: guruOx + 1, y: 4, face: "up", color: "#2f6f6a", pants: "#2a2f3d", hair: "#2a1f1c", hijab: "#e0d3b8", skin: "#c98f5f", noArt: true,
      chat: ["Ibu guru BK. Kalau ada yang mengganjal di pikiran, ceritakan saja, Marco.", "Banyak anak takut ke ruang BK. Padahal Ibu cuma ingin membantu.", "Pilih jurusan kuliah itu soal minat, bukan ikut-ikutan teman."] },
    { id: "guruPAI", name: "Pak Yusuf (Guru Agama)", map: "class", x: guruOx + 5, y: 4, face: "up", color: "#f2f2ee", pants: "#2a2f3d", hair: "#1c1c1c", hat: "#1f1f26", skin: "#d2a27b", noArt: true,
      chat: ["Ilmu itu cahaya, Nak. Jangan dimatikan karena malas.", "Orang tua itu doanya mustajab. Jaga Nenekmu baik-baik.", "Sedang mengoreksi tugas. Sebentar lagi selesai, kok."] },
    { id: "guruSeni", name: "Pak Bambang (Guru Seni)", map: "class", x: guruOx + 4, y: 6, face: "up", color: "#7a3f5e", pants: "#2a2f3d", hair: "#59595e", skin: "#d2a27b", glasses: true, noArt: true,
      chat: ["Bapak lagi menyiapkan pentas seni untuk acara perpisahan.", "Seni itu bukan pelajaran sampingan. Banyak orang hidup dari situ.", "Kamu bisa main alat musik? Kita masih kekurangan orang di panggung."] }
  );

  // Gym: guru olahraga dan beberapa siswa yang sedang latihan basket.
  npcs.push({ id: "guruPJOK", name: "Pak Dodi (Guru PJOK)", map: "gym", x: 5, y: 8, color: "#2e6fb0", pants: "#1f2a44", hair: "#1c1c1c", skin: "#c98f5f", wander: true, rx: 28, ry: 40, spd: 11, noArt: true,
    chat: ["Pemanasan dulu sebelum main. Cedera itu gampang, sembuhnya yang lama.", "Seleksi tim basket sekolah bulan depan. Mau ikut?", "Olahraga bukan cuma soal menang. Tapi soal kerja sama."] });
  [["Gani", 9, 5, "#c0392b"], ["Rafli", 12, 5, "#c0392b"], ["Jefri", 10, 11, "#2e6fb0"], ["Kemal", 13, 11, "#2e6fb0"]].forEach(([name, x, y, color], i) => {
    npcs.push({ id: "gymPlayer" + (i + 1), name, map: "gym", x, y, color, pants: "#1f2a44", hair: i % 2 ? "#3a2a22" : "#1c1c1c", wander: true, rx: 40, ry: 30, spd: 16, noArt: true,
      chat: ["Lawan, Kak! Satu lawan satu?", "Seleksi tim sekolah sebentar lagi, jadi latihan terus.", "Jangan berdiri di tengah lapangan, nanti kena bola."] });
  });

  // Guru dan siswa di setiap kelas. Guru berdiri di depan papan tulis; siswa duduk di bangku (menghadap papan).
  const TEACHER_BATIK = ["#8a5a2b", "#2f6f6a", "#7a3f5e", "#3f5f8f", "#6a7a3a", "#9a4a3a", "#4f4a8a", "#a0782e"];
  const TEACHERS = [
    // label, nama, mapel, gender, sifat, obrolan
    ["XII-B", "Pak Anwar", "Matematika", "m", "sabar tapi suka kasih soal sulit", ["Turunan dan integral itu seperti naik tangga. Pelan-pelan, jangan melompat.", "Soal ujian akhir tidak jauh dari latihan yang Bapak bagikan.", "Lebih baik ditanya daripada dicontek."]],
    ["XII-C", "Bu Lestari", "Bahasa Inggris", "f", "ramah dan sering ngajak ngobrol pakai bahasa Inggris", ["Practice makes perfect. Jangan takut salah grammar.", "Nonton film pakai subtitle bahasa Inggris, itu cara belajar yang menyenangkan.", "Tugas speaking minggu depan, siapkan topikmu dari sekarang."]],
    ["XII-D", "Pak Heru", "Fisika", "m", "tegas dan tepat waktu", ["Fisika itu bukan hafalan rumus, tapi memahami kenapa sesuatu bergerak.", "Praktikum minggu depan. Jas lab jangan lupa.", "Hukum Newton ada di mana-mana, bahkan di angkot yang ngerem mendadak."]],
    ["XII-E", "Bu Ratih", "Sejarah", "f", "suka bercerita panjang", ["Sejarah mengajari kita supaya tidak mengulang kesalahan yang sama.", "Zaman dulu pelajar harus berjalan jauh ke sekolah. Kalian beruntung.", "Catat tanggalnya, tapi pahami ceritanya."]],
    ["XI-A", "Pak Surya", "Kimia", "m", "santai tapi teliti", ["Kimia itu dapur versi ilmiah. Salah takar, hasilnya beda.", "Jangan bermain-main dengan bahan praktikum.", "Tabel periodik tidak perlu dihafal sekaligus. Satu golongan per hari."]],
    ["XI-B", "Bu Wulan", "Bahasa Indonesia", "f", "lembut tapi tidak mudah dibohongi", ["Menulis itu melatih berpikir. Mulailah dari satu paragraf.", "Baca satu buku sebulan. Itu saja sudah cukup untuk memulai.", "Tugas resensi dikumpulkan hari Jumat, ya."]],
    ["XI-C", "Pak Darmawan", "Ekonomi", "m", "suka memberi contoh dari warung dekat sekolah", ["Uang saku juga butuh anggaran. Catat pemasukan dan pengeluaranmu.", "Inflasi itu kenapa harga gorengan naik terus.", "Wirausaha dimulai dari hal kecil, misalnya jual es teh."]],
    ["XI-D", "Bu Fitri", "Biologi", "f", "penyayang tanaman", ["Sel itu unit terkecil kehidupan. Kecil, tapi pekerjaannya banyak.", "Jaga tanaman di depan kelas, ya. Itu bahan praktikum kita.", "Tidur cukup itu bagian dari biologi juga."]],
    ["XI-E", "Pak Gunawan", "Geografi", "m", "penjelajah yang suka membawa peta", ["Peta itu bukan cuma gambar. Itu cara membaca dunia.", "Bapak pernah naik gunung di tiga provinsi. Mau dengar ceritanya?", "Cuaca di kampung kita itu menarik untuk dipelajari."]],
    ["X-A", "Bu Yuni", "Bahasa Indonesia", "f", "ceria dan suka bernyanyi", ["Selamat datang di SMA. Jangan canggung, semua awalnya baru.", "Puisi tidak harus rumit. Tulis saja yang kamu rasakan.", "Kelas X ini penuh semangat. Ibu suka."]],
    ["X-B", "Pak Taufik", "Matematika", "m", "tegas dan jarang tersenyum", ["Matematika dikerjakan, bukan ditonton.", "Kerjakan PR sendiri. Bapak tahu kalau itu hasil nyontek.", "Aljabar itu fondasi. Kalau goyah, nanti runtuh semua."]],
    ["X-C", "Bu Nurul", "Seni Budaya", "f", "kreatif dan berantakan", ["Gambar itu bukan soal bagus atau jelek, tapi soal jujur.", "Pameran seni sekolah dibuka bulan depan.", "Kamu punya bakat yang belum ketemu, percaya sama Ibu."]],
    ["X-D", "Pak Edi", "PKn", "m", "suka berdiskusi", ["Hak dan kewajiban itu satu paket.", "Hormat pada perbedaan itu dimulai dari kelas ini.", "Jangan cuma protes, tawarkan solusi."]],
    ["X-E", "Bu Mega", "Sosiologi", "f", "pengamat yang tajam", ["Masyarakat itu seperti kelas: tiap orang punya peran.", "Amati sekitarmu, banyak pelajaran di luar buku.", "Tugas wawancara warga dikumpulkan minggu depan."]]
  ];
  const BOYS = ["Arif", "Bagus", "Cahyo", "Denny", "Gilang", "Heri", "Ilham", "Joni", "Krisna", "Lukman", "Mario", "Nando", "Oka", "Pandu", "Rio", "Satria", "Teguh", "Umar", "Vino", "Wisnu", "Yusril", "Zaki", "Ardi", "Dani", "Fajri", "Luki", "Mirza", "Naufal", "Tegar", "Yoan"];
  const GIRLS = ["Ayu", "Bella", "Cantika", "Dinda", "Erika", "Fani", "Gita", "Hana", "Indah", "Jihan", "Kirana", "Laras", "Mawar", "Nabila", "Olivia", "Prita", "Qonita", "Rani", "Sekar", "Tiara", "Ulfa", "Vira", "Winda", "Yasmin", "Zahra", "Amel", "Bunga", "Cinta", "Dina", "Elsa"];
  const GRADE_CHAT = {
    XII: ["Semester terakhir, rasanya cepat banget lewat.", "Aku masih bingung mau daftar kuliah ke mana.", "Try out minggu depan, belum ada yang siap.", "Katanya acara perpisahan bakal ada pentas seni.", "Jangan lupa isi data kelulusan ke wali kelas.", "Kalau suntuk belajar, ke kantin aja sebentar."],
    XI: ["Kelas XI itu enak, belum kena beban ujian akhir.", "Katanya kakak kelas XII lagi sibuk nyiapin perpisahan.", "Aku lagi nyari tempat duduk dekat jendela.", "Tugas kelompok minggu ini bikin pusing.", "Ada yang bawa penghapus lebih? Punyaku hilang.", "Pergantian jam, tangga selalu penuh."],
    X: ["Aku masih nyasar kalau cari ruang lab.", "Kelas X itu seru, tapi tugasnya banyak banget.", "Kakak kelas XII keren-keren, ya. Aku mau seperti mereka.", "Kantin di lantai bawah selalu ramai pas istirahat.", "Aku baru hafal nama semua guru minggu ini.", "Katanya ada seleksi ekskul bulan depan."]
  };
  const HAIR = ["#1c1c1c", "#241a1a", "#3a2a22", "#171717", "#4a3426", "#2a2024"];
  const SKINS = ["#f0c8a0", "#e0b088", "#d9a878", "#c98f5f"];
  const HIJABS = ["#e4e4ee", "#d7c9f0", "#e8b8a8", "#c6d8e8", "#e2d8c7", "#e7b8bf", "#cfe0cf"];
  const SEATS = [[1, 4], [5, 4], [1, 6], [5, 6], [2, 4], [4, 4], [2, 6], [4, 6]];
  let boyI = 0, girlI = 0, hashI = 0;
  const teacherOfClass = (label) => (label === "XII-A" ? null : TEACHERS.find((t) => t[0] === label));
  ["XII", "XI", "X"].forEach((grade) => ["A", "B", "C", "D", "E"].forEach((letter) => {
    const label = grade + "-" + letter, map = SCHOOL_MAP_OF(label), ox = roomOx(map, label), key = label.replace("-", "");
    const tch = teacherOfClass(label);
    // Guru kelas: Bu Sari (wali kelas XII-A) sudah ada di daftar NPC utama; kelas lain mendapat guru sendiri.
    if (tch) {
      const [, name, subj, gender, trait, lines] = tch;
      const female = gender === "f", pal = TEACHER_BATIK[hashI++ % TEACHER_BATIK.length];
      npcs.push(Object.assign({ id: "guru" + key, name, map, x: ox + 3, y: 2, color: pal, pants: "#2a2f3d", hair: female ? "#2a1f1c" : (hashI % 2 ? "#1c1c1c" : "#59595e"), skin: SKINS[hashI % SKINS.length], glasses: hashI % 3 === 0, noArt: true,
        chat: lines.slice() }, female ? (hashI % 2 ? { hijab: HIJABS[hashI % HIJABS.length] } : { long: true }) : {}));
    }
    const subject = tch ? tch[2] : "Matematika", tName = tch ? tch[1] : "Bu Sari", trait = tch ? tch[4] : "wali kelas kami, tegas tapi baik";
    // Kursi yang sudah dipakai siswa lama (Tono, Sinta, Lala, dst.) tidak dipakai lagi.
    const used = npcs.filter((n) => n.map === map && n.y >= 4 && n.y <= 6 && n.x >= ox && n.x < ox + 7).map((n) => (n.x - ox) + "," + n.y);
    const free = SEATS.filter((s) => !used.includes(s.join(",")));
    const have = used.length, want = Math.max(0, 4 - have);
    for (let k = 0; k < want; k++) {
      const girl = k % 2 === 1, name = girl ? GIRLS[girlI++ % GIRLS.length] : BOYS[boyI++ % BOYS.length], seat = free[k];
      const h = hashI++;
      const pool = GRADE_CHAT[grade], base = h % pool.length;
      const intro = grade === "XII" ? (label === "XII-A" ? "Aku " + name + ", teman sekelasmu. Kamu biasa duduk di bangku mana, sih?" : "Aku " + name + " dari " + label + ". Kelas kita sebelahan, tapi jarang ngobrol, ya.")
        : "Kak Marco dari XII-A, ya? Aku " + name + ", kelas " + label + ".";
      npcs.push(Object.assign({ id: "siswa" + key + (k + 1), name, map, x: ox + seat[0], y: seat[1], face: "up", color: "#eeeeee", pants: "#6b7078", hair: HAIR[h % HAIR.length], skin: SKINS[h % SKINS.length], noArt: true,
        chat: [intro, "Sekarang jam " + subject + ". " + tName + " orangnya " + trait + ".", pool[base], pool[(base + 2) % pool.length], pool[(base + 4) % pool.length]] },
        girl ? (h % 2 ? { hijab: HIJABS[h % HIJABS.length] } : { long: true }) : {}));
    }
  }));

  // Kehidupan kota: hampir semua warga di dunia luar punya rutinitas jalan kaki.
  npcs.forEach((n) => {
    if (n.map === "world" && n.id !== "evelyn" && !n.commute && !n.wander) { n.wander = true; n.rx = 28; n.ry = 22; n.spd = n.spd || 11; }
    n.px = n.x * TS + 8; n.py = n.y * TS + 14; n.hx = n.px; n.hy = n.py; n.dir = n.face || "down"; n.wt = Math.random() * 2; n.vx = 0; n.vy = 0; n.dist = 0;
  });

  // Obrolan tambahan: dipakai setelah adegan cerita hari itu selesai, atau untuk NPC pelengkap. Boleh diulang tanpa batas dan tidak mengubah statistik.
  const EXTRA_CHAT = {
    nenek: ["Kalau capek, istirahat dulu. Jangan memaksakan diri, Nak.", "Nenek tadi bikin kue lagi buat dijual. Nanti bantu antar, ya.", "Dulu ibumu juga suka duduk di situ, nonton hujan.", "Minum air putih yang banyak. Jangan cuma kopi sama gorengan.", "Nenek cuma ingin kamu lulus dan hidup dengan baik. Itu saja.", "Kalau ada apa-apa, cerita sama Nenek. Jangan dipendam sendiri."],
    sari: ["Pelajaran belum selesai, Marco. Jangan keluyuran.", "Kalau ada yang tidak paham, tanya Ibu. Jangan malu.", "Ibu percaya kamu bisa lebih baik dari nilai-nilai kemarin.", "Ujian akhir sudah dekat. Kerjakan tugas sedikit demi sedikit.", "Ibu lihat kamu mulai berubah. Pertahankan, ya."],
    rafi: ["Santai aja, Co. Hidup jangan dibawa serius.", "Kalau butuh uang jajan, bilang gue. Ada kerjaan ringan.", "Lu itu bakat, cuma kurang berani.", "Jangan cerita ke siapa-siapa soal obrolan kita, ya.", "Gue lagi nunggu orang. Lu ngapain di sini?"],
    warung: ["Gula habis lagi, nih. Padahal baru kemarin Bapak belanja.", "Es teh dingin lima ribu. Kalau mau utang, tulis di buku itu.", "Anak-anak sekarang betah di HP. Dulu Bapak main kelereng.", "Warung ini peninggalan almarhum bapaknya Bapak. Dijaga baik-baik.", "Kalau mau kerja sambilan, Bapak selalu butuh tangan tambahan."],
    evelyn: ["Eh, kamu lagi. Kebetulan banget, atau emang sengaja?", "Tadi aku lihat Nenek di depan rumah. Beliau kelihatan sehat, kok.", "Kamu masih suka nyimpen permen di saku, kayak waktu kecil?", "Semester terakhir ya... aku masih belum rela, deh.", "Kalau kamu butuh teman belajar, pintu rumahku selalu kebuka."],
    arga: ["Apa lu lihat-lihat?", "Gue lagi gak mood basa-basi, Marco.", "Lu masih punya waktu buat mikir. Jangan kelamaan.", "Dunia ini keras. Kita yang bikin lu kuat.", "Kalau Rafi nyari gue, bilang gue di sini."],
    galih: ["Sini, sini. Gorengan masih hangat, nih.", "Gue bukan jahat, Co. Gue cuma gak suka diatur.", "Hidup sekali doang. Jangan dihabisin buat nurut terus.", "Kalau capek di sekolah, mampir sini aja.", "Bram lagi bete, jangan diajak bercanda."],
    bram: ["Hm.", "Gue gak suka orang yang banyak tanya.", "Lu gak bakal ngerti, Marco. Belum.", "Jangan deket-deket kalau gak ada urusan.", "Kalau Arga nyuruh, lu denger. Simpel."],
    joko: ["Hujan belum turun, air sawah mulai seret.", "Kalau lewat pematang, hati-hati. Licin."],
    tini: ["Kue Nenekmu itu yang paling laris, lho.", "Ibu mau mampir ke rumah Bu Warti dulu."],
    dimas: ["Gue mau nyontek, tapi takut ketahuan.", "Nanti pulang sekolah main bola, ikut gak?"],
    putri: ["Aku lagi nyari buku persiapan ujian masuk.", "Semangat ya, Marco. Tinggal sedikit lagi."],
    ujang: ["Ojek, Dek? Gratis kalau mamang lagi baik hati.", "Mamang dulu juga pernah muda dan bandel."],
    warti: ["Awas, lantai licin, baru dipel.", "Ibu lagi masak buat arisan nanti sore."],
    bimo: ["Kak Marco, ayo main kejar-kejaran!", "Aku punya kelereng baru, mau lihat?"],
    haji: ["Salat jangan sampai tertinggal, Nak.", "Kalau hati lagi gundah, perbanyak istigfar."],
    tono: ["Gue ngantuk banget. Semalam begadang main game.", "Bu Sari lagi di mana ya? Kok belum masuk."],
    sinta: ["Aku mau ke perpustakaan habis ini. Ikut?", "Catatan Matematika kemarin masih kusimpan."],
    wawan: ["Kalau ujian nanti jelek, gue pindah ke kutub aja.", "Sinta rajin banget, ya. Bikin minder."],
    yati: ["Kalau mau duduk, jangan taruh tas di atas meja, ya.", "Ibu baru bikin bakwan. Masih hangat.", "Anak kelas XII biasanya paling ramai kalau istirahat."],
    naya: ["Aku dan Sinta lagi nyusun daftar foto buat papan kenangan.", "Kalau kamu nemu spidol hitam, kabari aku ya."],
    fikri: ["Katanya ada pengumuman jadwal ujian ditempel di lantai satu.", "Kelas kita butuh kipas tambahan, panas banget siang-siang."],
    riko: ["Gue disuruh ambil bola ke gudang olahraga.", "Kalau bel istirahat, lorong ini langsung penuh."],
    lala: ["Aku suka suasana sekolah pagi-pagi sebelum ramai.", "Teman sekelasku lagi latihan presentasi."],
    kevin: ["Lapangan indoor bisa dipakai setelah jam pelajaran selesai.", "Gue harus balikin buku ke perpustakaan."],
    meli: ["Aku tadi bantu bersihin papan tulis.", "Kak, kelas XII ada tugas kelompok juga?"],
    dion: ["Teman-teman lagi debat soal tim basket antarkelas.", "Gue mau beli minum sebelum bel."],
    aldi: ["Kalau duduk di meja dekat jendela, anginnya enak.", "Bu Yati hafal pesanan semua anak sini."],
    rara: ["Kita lagi bahas dekorasi kelas buat perpisahan.", "Nanti kalau sudah selesai makan, aku mau ke perpustakaan."],
    bagas: ["Jangan lupa jadwal piket kantin kelas kita minggu depan.", "Gue lagi nabung buat beli sepatu futsal."],
    salsa: ["Sinta tadi nyari kamu, Marco.", "Kalau ada acara kelas, aku bagian dekorasi."]
  };
  const FALLBACK_CHAT = ["Hari yang tenang, ya.", "Oh, Marco. Ada perlu apa?", "Semoga harimu menyenangkan.", "Lagi sibuk nih, tapi ngobrol sebentar boleh."];
  npcs.forEach((n) => { n.chat = (n.chat || []).concat(EXTRA_CHAT[n.id] || []); n.bag = []; });

  // fx: u = uang, d = disiplin, n = hubungan nenek, c = circle (semua tersembunyi dari pemain)
  const scenes = {
    nenek: [
      { w: "Nenek", m: "warm", t: "Marco, sarapannya sudah Nenek siapkan. Jangan telat ke sekolah, ya.", c: [
        { t: "Iya, Nek. Marco berangkat habis makan.", fx: { n: 2, d: 1 }, r: "Nenek tersenyum. \"Anak baik.\"" },
        { t: "Nanti aja, Nek. Masih ngantuk.", fx: { n: -1, d: -1 }, e: "sad", r: "Nenek menghela napas pelan, lalu diam." },
        { t: "Ah, Nenek cerewet banget! Berisik!", fx: { n: -3, d: -1 }, e: "sad", r: "Nenek terdiam. Matanya berkaca-kaca. \"Maaf, Nenek cuma khawatir...\"" }] },
      { w: "Nenek", m: "warm", t: "Nenek mau jualan kue di pasar. Sore ini kamu bantu angkat dagangan?", c: [
        { t: "Siap, Nek. Marco bantu.", fx: { n: 3, u: 1, d: 1 }, r: "\"Tangan kamu kuat, Nak. Mirip bapakmu.\"" },
        { t: "Ada urusan sama temen, Nek.", fx: { n: -2, c: 1 }, e: "sad", r: "\"Ya sudah... hati-hati.\"" },
        { t: "Nenek gak usah ngatur hidup Marco!", fx: { n: -4, c: 2 }, e: "sad", r: "\"Nenek ngatur karena sayang, Marco...\"" }] },
      { w: "Nenek", m: "sad", t: "Nenek sisihkan sedikit uang untuk kuliahmu nanti. Kamu sendiri sudah menabung?", c: [
        { t: "Marco juga nabung, Nek.", fx: { u: 2, n: 1, d: 1 }, r: "Mata Nenek berkaca-kaca. \"Nenek bangga.\"" },
        { t: "Buat Marco jajan aja, Nek.", fx: { u: 1, n: -2, c: 1 }, e: "sad", r: "Nenek menyodorkan uang itu tanpa bicara." },
        { t: "Kuliah, kuliah! Marco gak mau denger lagi!", fx: { n: -4, d: -1 }, e: "sad", r: "Bahu Nenek bergetar. \"Nenek cuma ingin kamu punya masa depan...\"" }] }
    ],
    rafi: [
      { w: "Rafi", t: "Woi Marco! Bolos jam terakhir yuk. Gue tau tempat nongkrong asik.", c: [
        { t: "Ikut, deh.", fx: { c: 3, d: -2, u: -1 }, r: "Rafi nyengir. \"Nah gitu dong.\"" },
        { t: "Gak, gue mau ikut pelajaran.", fx: { d: 2, c: -1, n: 1 }, r: "\"Cupu lu. Yaudah.\"" }] },
      { w: "Rafi", m: "tense", t: "Ada kerjaan gampang. Titip barang, bayarannya gede. Lu cuma tinggal diem.", c: [
        { t: "Gue ikut.", fx: { c: 4, u: 3, d: -2 }, r: "\"Aman. Cuma bawa tas doang.\"" },
        { t: "Gak mau. Itu bahaya.", fx: { c: -2, d: 1 }, r: "Rafi mendengus. \"Terserah.\"" }] },
      { w: "Rafi", t: "Malam ini gue traktir karaoke. Anak-anak udah nunggu.", c: [
        { t: "Boleh, sekali ini aja.", fx: { c: 2, u: -2, n: -1 }, r: "\"Sekali jadi kebiasaan, bro.\"" },
        { t: "Gue pulang, Nenek nungguin.", fx: { n: 2, c: -1, d: 1 }, r: "Rafi mengangkat bahu." }] }
    ],
    sari: [
      { w: "Bu Sari", t: "Minggu depan ada ujian. Kamu sudah belajar, Marco?", c: [
        { t: "Belum, Bu. Tapi malam ini saya mulai.", fx: { d: 2 }, r: "\"Bagus. Ibu pegang janjimu.\"" },
        { t: "Santai aja, Bu. Pasti bisa.", fx: { d: -1, c: 1 }, r: "Bu Sari menggeleng pelan." }] },
      { w: "Bu Sari", m: "warm", t: "Nilai kamu naik sedikit. Kamu punya potensi kalau mau serius.", c: [
        { t: "Terima kasih, Bu. Saya mau coba.", fx: { d: 3, n: 1 }, r: "\"Ibu tunggu kejutan darimu.\"" },
        { t: "Biasa aja, Bu.", fx: { d: -1 }, r: "\"Sayang sekali.\"" }] },
      { w: "Bu Sari", m: "tense", t: "Ada ujian susulan. Ingat, jangan menyontek ya.", c: [
        { t: "Saya kerjakan sendiri, Bu.", fx: { d: 3 }, r: "\"Itu baru Marco yang Ibu harapkan.\"" },
        { t: "(Rafi bisa kasih contekan...)", fx: { d: -2, c: 2 }, r: "Bu Sari menatapmu lama." }] }
    ],
    warung: [
      { w: "Pak Darto", t: "Mau kerja part-time bantu Bapak jaga warung?", c: [
        { t: "Mau, Pak.", fx: { u: 3, d: 1, n: 1 }, r: "\"Mulai besok, jangan telat.\"" },
        { t: "Beli es teh aja, Pak.", fx: { u: -1 }, r: "\"Lima ribu, ya.\"" }] },
      { w: "Pak Darto", t: "Bapak ikut reksadana kecil-kecilan. Mau ikut? Modalnya sedikit.", c: [
        { t: "Ikut, Pak. Marco mau belajar investasi.", fx: { u: 4, d: 1 }, r: "\"Sabar ya, hasilnya pelan tapi pasti.\"" },
        { t: "Mending jajan.", fx: { u: -2, c: 1 }, r: "Pak Darto tertawa kecil." }] },
      { w: "Pak Darto", t: "Teman Bapak jual HP murah. Beli buat dijual lagi, mau?", c: [
        { t: "Marco hitung untungnya dulu.", fx: { u: 2, d: 1 }, r: "\"Anak pintar.\"" },
        { t: "Duitnya buat nongkrong aja.", fx: { u: -2, c: 1 }, r: "\"Hati-hati dompetmu.\"" }] }
    ],
    evelyn: [
      { w: "Evelyn", m: "warm", t: "Marco! Pagi-pagi udah kusut aja. Kamu begadang lagi?", c: [
        { t: "Iya, susah tidur mikirin lulus.", fx: { e: 2, d: 1 }, r: "\"Dari kecil kamu emang gitu. Sini, aku temenin mikirnya.\"" },
        { t: "Biasa aja.", fx: { e: 0 }, r: "Evelyn tersenyum tipis. \"Bohong. Kelihatan dari mata kamu.\"" },
        { t: "Bukan urusan lu.", fx: { e: -1, c: 1 }, r: "\"Aku tetanggamu dari umur lima tahun, jadi tetap urusanku.\"" }] },
      { w: "Evelyn", m: "warm", t: "Inget gak, dulu kita manjat pohon jambu di belakang rumah terus ketahuan Nenek?", c: [
        { t: "Inget! Lu yang jatuh duluan.", fx: { e: 2 }, r: "\"Heh! Kamu yang dorong, tau!\" Ia tertawa, dan kamu ikut tertawa." },
        { t: "Udah lupa.", fx: { e: -1 }, r: "\"Aku masih inget semuanya, sih,\" katanya pelan." }] },
      { w: "Evelyn", t: "Aku sering lihat kamu bareng anak-anak geng belakang sekolah. Kamu baik-baik aja?", c: [
        { t: "Jujur, gue gak nyaman sama mereka.", fx: { c: -2, d: 1, n: 1, e: 2 }, h: -1, r: "\"Rumah kita sebelahan. Kalau butuh teman jalan pulang, tinggal ketuk.\"" },
        { t: "Gue baik-baik aja.", fx: { e: 0 }, r: "Evelyn mengangguk pelan, tidak sepenuhnya yakin." },
        { t: "Jangan ikut campur.", fx: { c: 1, e: -2 }, r: "\"Aku cuma gak mau kehilangan sahabatku.\"" }] },
      { w: "Evelyn", m: "bright", t: "Sore ini aku belajar di perpustakaan buat ujian. Mau bareng, kayak waktu SD dulu?", c: [
        { t: "Ikut. Makasih udah ngajak.", fx: { d: 3, c: -1, e: 2 }, r: "\"Seru deh. Nanti kita saling tanya soal.\"" },
        { t: "Lain kali ya.", fx: { d: -1, e: -1 }, r: "\"Oke. Pintunya selalu terbuka.\"" },
        { t: "Males, mending nongkrong.", fx: { d: -2, c: 1, e: -2 }, r: "Evelyn menghela napas kecil. \"Sayang banget.\"" }] },
      { w: "Evelyn", m: "sad", t: "Kamu udah mikir mau ke mana setelah lulus? Aku pengin daftar kuliah. Kalau kamu...?", c: [
        { t: "Belum tau. Tapi gue mau Nenek bangga.", fx: { d: 1, n: 1, e: 2 }, r: "\"Nenek pasti bangga. Aku juga.\"" },
        { t: "Gue mau bebas, pergi jauh.", fx: { e: 1, u: 1 }, r: "\"Kalau pergi, jangan lupa pulang, ya.\"" },
        { t: "Ngapain mikirin itu.", fx: { e: -1, d: -1 }, r: "\"Soalnya aku mikirin kamu,\" gumamnya, nyaris tak terdengar." }] }
    ],
    // Geng pembuly. Kalau Marco yang menghampiri, mereka tetap menekan: ajakan, ancaman halus, lalu ancaman terbuka.
    arga: [
      { w: "Arga", m: "tense", t: "Lu Marco, kan? Temennya Rafi. Berarti lu udah setengah masuk lingkaran kita.", c: [
        { t: "Gue cuma kenal Rafi. Gak lebih.", fx: { c: -1, d: 1 }, r: "Arga menatapmu lama. \"Belum lebih. Bukan berarti nggak akan.\"" },
        { t: "Terus kenapa?", fx: { c: 1, d: -1 }, r: "\"Terus lu ikut gue. Sesederhana itu.\"" },
        { t: "Minggir, gue mau lewat.", fx: { c: -2, d: 1 }, r: "Arga bergeser setengah langkah, matanya tidak lepas darimu. \"Hari ini gue biarin.\"" }] },
      { w: "Arga", m: "tense", t: "Aturan kita cuma satu. Yang udah masuk, gak keluar. Lu masih bisa milih sekarang.", c: [
        { t: "Gue mikir dulu.", fx: { c: 1 }, r: "\"Jangan kelamaan. Gue bukan orang sabar.\"" },
        { t: "Gue gak mau masuk.", fx: { c: -2, d: 1, n: 1 }, r: "\"Pilihan lu. Tapi semua pilihan ada harganya.\"" },
        { t: "Oke, gue ikut.", fx: { c: 3, d: -2, u: -1 }, r: "\"Bagus. Mulai sekarang lu jalan bareng kita.\"" }] },
      { w: "Arga", m: "tense", t: "Nenek lu jualan di pasar, kan? Pasar itu rame. Banyak hal bisa kejadian.", c: [
        { t: "Jangan bawa-bawa Nenek gue!", fx: { c: -2, n: 1, d: 1 }, r: "\"Makanya jangan bikin gue harus nyebut-nyebut.\"" },
        { t: "...Oke. Gue ikut kalian.", fx: { c: 4, n: -2, d: -2 }, r: "\"Gitu dong. Gampang, kan?\"" }] }
    ],
    galih: [
      { w: "Galih", t: "Eh, Marco! Sini duduk, santai. Gue bawain gorengan. Kita bukan nakal, cuma punya cara sendiri buat seneng-seneng.", c: [
        { t: "Makasih, tapi gue mau pulang.", fx: { c: -1, n: 1, d: 1 }, r: "\"Yah, padahal seru. Besok gue tawarin lagi, ya.\"" },
        { t: "Boleh, sebentar aja.", fx: { c: 2, d: -1 }, r: "\"Nah! Sebentar itu lama-lama jadi kebiasaan.\"" },
        { t: "Kenapa sih lu ngikutin gue terus?", fx: { c: -1, d: 1 }, r: "Senyum Galih tidak berubah. \"Soalnya lu menarik, Marco.\"" }] },
      { w: "Galih", t: "Rafi cerita soal lu. Anak baik yang lagi kepepet. Nenek lu butuh uang, kan? Kita bisa bantu.", c: [
        { t: "Gue gak butuh bantuan lu.", fx: { c: -2, n: 1, d: 1 }, r: "\"Semua orang butuh bantuan. Cuma beda waktunya.\"" },
        { t: "Bantu gimana?", fx: { c: 3, u: 1, d: -1 }, r: "\"Gampang. Besok gue kenalin ke orang-orangnya.\"" }] },
      { w: "Galih", m: "tense", t: "Orang yang nolak ajakan kita biasanya jadi bahan omongan satu sekolah. Gue cuma gak mau itu kejadian sama lu.", c: [
        { t: "Terserah mereka mau ngomong apa.", fx: { c: -2, d: 1 }, r: "\"Berani. Sampai kapan, ya?\"" },
        { t: "Jangan sampai nyebar, Lih.", fx: { c: 2, d: -1 }, r: "\"Tenang. Selama lu satu pihak sama kita, aman.\"" }] }
    ],
    bram: [
      { w: "Bram", m: "tense", t: "Woi! Lu ngeliatin apa? Sini lu.", c: [
        { t: "Gak ngeliatin apa-apa.", fx: { c: 1, d: -1 }, r: "\"Awas lu kalau mulai ngeliatin.\"" },
        { t: "Gak usah dorong-dorong.", fx: { c: -1, d: 1 }, r: "Bram mendengus. \"Berani juga lu. Gue catat.\"" }] },
      { w: "Bram", m: "tense", t: "Malem ini lu ikut nongkrong. Gue gak nerima alasan.", c: [
        { t: "Oke, gue dateng.", fx: { c: 3, d: -2, n: -1, u: -1 }, r: "\"Nah. Bawa duit jajan sekalian.\"" },
        { t: "Gue gak bisa. Nenek nunggu di rumah.", fx: { c: -2, n: 1, d: 1 }, r: "\"Cih. Anak Nenek.\"" }] },
      { w: "Bram", m: "tense", t: "Nih, ambil. Biar lu ngerasa jadi bagian kita.", c: [
        { t: "Gue gak ngerokok.", fx: { c: -2, d: 1 }, r: "Bram menyeringai tipis. \"Belagu. Tapi ya udah.\"" },
        { t: "Ya udah, satu aja.", fx: { c: 3, d: -2 }, r: "\"Nah. Gitu doang, kan.\"" }] }
    ]
  };

  const endings = {
    good: ["GOOD ENDING: Bebas", "Marco lulus dengan nilai terbaik, dan usaha kecilnya mulai berjalan.", "Ia membeli tiket pesawat pertamanya, lalu mengajak Nenek berkeliling dunia.", "\"Kamu sudah bebas sekarang, Nak,\" bisik Nenek."],
    goodEvelyn: ["GOOD ENDING: Bebas, Bersamamu", "Marco lulus dengan nilai terbaik, dan usaha kecilnya mulai berjalan.", "Evelyn, sahabat dari rumah sebelah, tetap mendampinginya setelah kelulusan. Bertahun-tahun kemudian, setelah mereka dewasa dan membangun hidup bersama, Evelyn menjadi istri Marco.", "\"Dari dulu aku cuma ingin kita terus saling mendukung,\" kata Evelyn. Nenek tersenyum melihat mereka memulai keluarga kecil mereka."],
    bad: ["BAD ENDING: Jalan Gelap", "Marco tidak lulus. Barang titipan Rafi ternyata barang terlarang, dan Arga, Galih, serta Bram menghilang begitu polisi datang.", "Polisi datang tengah malam. Kini ia mantan narapidana, miskin dan sendirian.", "Di rumah, kursi Nenek kosong."],
    neutral: ["NEUTRAL ENDING: Hidup Biasa", "Marco lulus dengan nilai biasa saja.", "Ia masuk universitas, atau bekerja di kantor. Hidup berjalan tenang tanpa kejutan.", "Tidak sebebas impiannya, tapi Nenek tersenyum di hari wisuda."]
  };

  // ---------- state ----------
  let state, hooks, running = false, paused = false, last = 0, t = 0;
  let player, cam = { x: 0, y: 0 }, keys = {}, dlg = null, hudMsg = "", hudTimer = 0, curRoom = "", mapOpen = false;
  const fresh = () => ({ day: 1, clock: 0, fatigue: 0, map: "home", x: SPAWN.x, y: SPAWN.y, s: { u: 0, d: 0, n: 0, c: 0, e: 0 }, talked: [], r: [], heat: 0, q: { attendance: 0, absences: 0, late: 0, gangChoices: 0, goodChoices: 0, sideCompleted: 0, path: "undecided", bramJoined: false, evelynTrust: 0, lifeEvents: 0, flags: {} }, done: false });
  const clockPhase = () => ((state.clock % DAY_LEN) + DAY_LEN) % DAY_LEN / DAY_LEN;
  const ensureQuestState = () => {
    state.q = state.q || {};
    Object.assign(state.q, { attendance: 0, absences: 0, late: 0, gangChoices: 0, goodChoices: 0, sideCompleted: 0, path: "undecided", bramJoined: false, evelynTrust: 0, lifeEvents: 0 }, state.q);
    state.q.flags = state.q.flags || {};
  };
  let enc = null, encCool = 0;   // enc: geng sedang mengejar Marco. encCool: jeda sebelum mencoba lagi.

  // hewan & kendaraan
  const cat = { x: 12 * TS, y: 14 * TS, vx: 0, vy: 0, t: 0 };
  // Lajur atas melaju ke kanan, lajur bawah ke kiri (lalu lintas kiri). Satu lajur memakai kecepatan sama agar tidak saling tembus.
  const cars = [
    { x: 0, y: 285, v: 34, c: "#3b8ed0", k: "sedan" }, { x: 420, y: 285, v: 34, c: "#d94a3a", k: "motor" }, { x: 760, y: 285, v: 34, c: "#d8d8e2", k: "truk" },
    { x: 300, y: 302, v: -28, c: "#e8a020", k: "angkot" }, { x: 720, y: 302, v: -28, c: "#3a8f5a", k: "motor" }, { x: 40, y: 302, v: -28, c: "#8a5fc0", k: "sedan" }
  ];

  // Angkot quest pagi: datang dari arah barat, berhenti di halte kampung, lalu menuju halte SMA.
  const questAngkot = { active: false, phase: "idle", x: -130, y: 285, v: 52, wait: 0, cooldown: 0, c: "#38a66b", k: "angkot" };
  const HOME_STOP = { x: 12 * TS - 49, y: 285 };
  const SCHOOL_STOP = { x: 116 * TS - 49, y: 285 };
  function activateAngkotQuest() {
    const f = state.q.flags;
    if (state.map !== "world" || !state.talked.includes("evelyn") || f.angkotBoarded || f.angkotQuestDone || clockPhase() >= 10 / 24) return;
    if (f.angkotQuestStarted && !questAngkot.active) {
      questAngkot.active = true; questAngkot.phase = "approach"; questAngkot.x = -130;
    }
    if (!f.angkotQuestStarted) {
      f.angkotQuestStarted = true;
      questAngkot.active = true; questAngkot.phase = "approach"; questAngkot.x = -130; questAngkot.wait = 0; questAngkot.cooldown = 0;
      flash("Quest baru: tunggu angkot di Halte Kampung!");
    }
  }

  // ---------- audio adaptif ----------
  const Sound = {
    mood: "calm",
    init() { if (window.TLSAudio) { TLSAudio.init(); TLSAudio.setScene("home"); } },
    beep(f, d, type, v) { if (window.TLSAudio) TLSAudio.tone(f, d, type || "sine", v || .02, 0, TLSAudio.master); },
    play() { if (!window.TLSAudio) return; const scene = ({ calm: "home", bright: "school", warm: "warm", sad: "sad", tense: "tense" })[this.mood] || "school"; TLSAudio.setScene(scene); },
    stop() { if (window.TLSAudio) TLSAudio.pause(true); }
  };
  const phaseOf = () => Math.min(2, Math.floor(clockPhase() * 3));
  function setMood(m) { const mood = m || ["calm", "bright", "sad"][phaseOf()]; if (mood !== Sound.mood) { Sound.mood = mood; Sound.play(); } }

  // ---------- tabrakan (AABB) ----------
  const solidAt = (px, py) => {
    const m = maps[state.map], i = Math.floor(px / TS), j = Math.floor(py / TS);
    if (i < 0 || j < 0 || i >= m.w || j >= m.h) return true;
    return !!SOLID[m.t[j][i]];
  };
  const blocked = (x, y) => solidAt(x - 3, y - 4) || solidAt(x + 3, y - 4) || solidAt(x - 3, y) || solidAt(x + 3, y);
  function move(e, dx, dy) {
    if (!blocked(e.x + dx, e.y)) e.x += dx;
    if (!blocked(e.x, e.y + dy)) e.y += dy;
  }
  // Cari titik berdiri yang tidak terblokir di sekitar (x, y). Dipakai saat pemain turun dari angkot
  // supaya tidak pernah muncul di dalam objek (halte, pagar, dinding) dan terjebak.
  function findFreeSpot(x, y, mapName, avoidX, avoidY) {
    const prev = state.map; state.map = mapName;
    const ok = (px, py) => !blocked(px, py) && !(avoidX !== undefined && Math.hypot(px - avoidX, py - avoidY) < 10);
    let res = null;
    if (ok(x, y)) res = { x, y };
    for (let r = 1; r <= 6 && !res; r++) {
      let best = null, bd = 1e9;
      for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        const px = x + di * TS, py = y + dj * TS;
        if (ok(px, py) && Math.hypot(di, dj) < bd) { bd = Math.hypot(di, dj); best = { x: px, y: py }; }
      }
      res = best;
    }
    state.map = prev;
    return res || { x, y };
  }
  // ---------- Evelyn mengikuti Marco ----------
  // Dua tahap. (1) Bergabung: bila Evelyn masih jauh atau terhalang, ia mencari jalan lewat petak yang bisa dilalui
  // (BFS) menuju Marco, jadi tidak menembus dinding. (2) Mengikuti: ia berjalan menelusuri jejak langkah Marco dan
  // menjaga jarak FOLLOW_GAP di belakangnya. Karena jejaknya adalah jalur yang baru saja dilalui Marco, di gerbang dan
  // gang satu petak ia otomatis berbaris di belakang, tidak sejajar atau memotong lewat benda.
  const FOLLOW_GAP = 20;
  const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function lineFree(x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / 3));
    for (let k = 0; k <= n; k++) if (blocked(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n)) return false;
    return true;
  }
  function tilePath(sx, sy, gx, gy) {
    const m = maps[state.map], W = m.w, H = m.h;
    const si = Math.floor(sx / TS), sj = Math.floor(sy / TS), gi = Math.floor(gx / TS), gj = Math.floor(gy / TS);
    const walk = (i, j) => i >= 0 && j >= 0 && i < W && j < H && !SOLID[m.t[j][i]] && m.t[j][i] !== DOOR && m.t[j][i] !== World.T.STAIR;
    if (si === gi && sj === gj) return [];
    const key = (i, j) => j * W + i, from = new Map([[key(si, sj), -1]]), q = [[si, sj]];
    let head = 0, found = false;
    while (head < q.length && q.length < 12000) {
      const [i, j] = q[head++];
      if (i === gi && j === gj) { found = true; break; }
      for (const [di, dj] of DIRS8) {
        const ni = i + di, nj = j + dj, k = key(ni, nj);
        if (from.has(k) || !walk(ni, nj)) continue;
        if (di && dj && !(walk(i + di, j) && walk(i, j + dj))) continue;   // tidak memotong sudut benda
        from.set(k, key(i, j)); q.push([ni, nj]);
      }
    }
    if (!found) return null;
    const path = [], start = key(si, sj);
    for (let k = key(gi, gj); k !== start && k !== undefined; k = from.get(k)) path.push({ x: (k % W) * TS + 8, y: Math.floor(k / W) * TS + 14 });
    return path.reverse();
  }
  function stepToward(e, tx, ty, step) {
    const dx = tx - e.px, dy = ty - e.py, d = Math.hypot(dx, dy);
    if (d < 0.01) return 0;
    const s = Math.min(step, d), mx = dx / d * s, my = dy / d * s, ox = e.px, oy = e.py;
    if (!blocked(e.px + mx, e.py)) e.px += mx;
    if (!blocked(e.px, e.py + my)) e.py += my;
    e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    return Math.hypot(e.px - ox, e.py - oy);
  }
  function followPlayer(e, dt, stepX, stepY) {
    const px = player.x, py = player.y;
    // Peta berganti atau Marco berpindah mendadak (pintu, angkot): mulai ulang tahap bergabung.
    if (e.fmap !== state.map || e.fpx === undefined || Math.hypot(px - e.fpx, py - e.fpy) > 14) {
      e.fmap = state.map; e.trail = []; e.attached = false; e.jpath = null; e.jt = 0; e.jwait = 0;
    }
    e.fpx = px; e.fpy = py;
    const moved = Math.hypot(stepX, stepY), base = dt > 0 ? moved / dt : 0;
    let walked = 0;
    if (!e.attached) {
      if (Math.hypot(px - e.px, py - e.py) <= 60 && lineFree(e.px, e.py, px, py)) { e.attached = true; e.trail = [{ x: px, y: py }]; e.jpath = null; }
      else {
        e.jwait = (e.jwait || 0) + dt;
        if (e.jwait > 12) {   // jaga-jaga bila tidak ada jalan: muncul di dekat Marco
          const s = findFreeSpot(px - 20, py + 8, state.map, px, py); e.px = s.x; e.py = s.y; e.jwait = 0; e.jpath = null;
        } else {
          e.jt = (e.jt || 0) - dt;
          if (!e.jpath || e.jt <= 0) { e.jpath = tilePath(e.px, e.py, px, py); e.jt = 0.35; }
          if (e.jpath && e.jpath.length <= 3 && Math.hypot(px - e.px, py - e.py) <= 60) {
            // Sudah dekat: langsung ikut jejak lewat petak-petak jalur tadi (tetap tidak menembus benda).
            e.attached = true; e.trail = e.jpath.slice(0, -1).concat([{ x: px, y: py }]); e.jpath = null;
          } else if (e.jpath && e.jpath.length) {
            const wp = e.jpath[0];
            walked = stepToward(e, wp.x, wp.y, 64 * dt);
            if (Math.hypot(wp.x - e.px, wp.y - e.py) < 2) e.jpath.shift();
          } else if (e.jpath) walked = stepToward(e, px, py, 64 * dt);
        }
      }
    } else {
      const tr = e.trail, last = tr[tr.length - 1];
      if (moved > 0 && (!last || Math.hypot(px - last.x, py - last.y) >= 2)) tr.push({ x: px, y: py });
      if (tr.length > 400) tr.splice(0, tr.length - 400);
      let L = 0, cx = e.px, cy = e.py;
      for (const p of tr) { L += Math.hypot(p.x - cx, p.y - cy); cx = p.x; cy = p.y; }
      L += Math.hypot(px - cx, py - cy);
      let budget = Math.max(base * 1.12, Math.min(95, (L - FOLLOW_GAP) * 7)) * dt;
      while (budget > 0.0001 && L > FOLLOW_GAP + 0.01) {
        const t = tr[0] || { x: px, y: py }, dx = t.x - e.px, dy = t.y - e.py, d = Math.hypot(dx, dy);
        if (d < 0.0001) { if (tr.length) { tr.shift(); continue; } break; }
        const s = Math.min(budget, d, L - FOLLOW_GAP);
        e.px += dx / d * s; e.py += dy / d * s; budget -= s; L -= s; walked += s;
        e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
        if (s >= d - 1e-6 && tr.length) tr.shift();
      }
      if (walked <= 0.01) e.dir = player.dir;
    }
    e.walk = walked > 0.01; e.dist += walked;
  }

  const tileAt = (px, py) => { const m = maps[state.map]; return m.t[Math.floor(py / TS)] ? m.t[Math.floor(py / TS)][Math.floor(px / TS)] : undefined; };
  // Warga boleh melintasi trotoar dan jalan raya; hanya tile solid yang membatasi gerak biasa.
  // Warga di dunia luar memakai kotak tabrak lebih lebar daripada Marco (badan mereka ±6 px), jadi tidak lagi
  // terlihat menembus dinding, pagar, pohon, atau perabot walau titik tengahnya masih di petak kosong.
  const NPC_HALF = 6;
  const npcBlocked = (x, y) => blocked(x, y) || (state.map === "world" &&
    (solidAt(x - NPC_HALF, y) || solidAt(x + NPC_HALF, y) || solidAt(x - NPC_HALF, y - 6) || solidAt(x + NPC_HALF, y - 6)));
  // NPC yang titik awalnya terjebak di dalam benda (mis. Bimo) dipindah ke tempat kosong terdekat, sekali saja.
  function settleNpc(n) {
    if (n.settled) return;
    n.settled = true;
    if (!npcBlocked(n.px, n.py)) return;
    let best = null, bd = 1e9;
    for (let dj = -10; dj <= 10; dj++) for (let di = -10; di <= 10; di++) {
      const x = n.px + di * 8, y = n.py + dj * 8, d = Math.hypot(di, dj);
      if (d < bd && !npcBlocked(x, y)) { bd = d; best = { x, y }; }
    }
    if (best) { n.px = n.hx = best.x; n.py = n.hy = best.y; }
  }
  const hereNpcs = () => npcs.filter((n) => n.map === state.map && (!n.commute || n.commute.started) && !(["evelynBreak", "evelynCanteen"].includes(n.id) && npcs.some((o) => o.id === "evelyn" && o.follow)));

  // ---------- spritesheet karakter ----------
  // Tiap sheet: sel 28x32, 4 kolom animasi, baris: idle/walk/run x (bawah, atas, samping).
  // Marco: sheet 6 frame jalan x 4 arah (bawah, atas, kiri, kanan), sel 28x38 (ada ruang kosong di atas kepala supaya rambut tidak terpotong).
  // Nenek: sheet lama 1x, 4 kolom siklus per animasi (idle/walk/run x bawah/atas/samping).
  const ROWS = { idle_down: 0, idle_up: 1, idle_side: 2, walk_down: 3, walk_up: 4, walk_side: 5, run_down: 6, run_up: 7, run_side: 8 };
  const SPRITES = {
    marco: { img: new Image(), layout: "dir", cw: 28, ch: 38, unit: 1, cols: 6 },
    // Kostum seragam dibuka setelah quest ganti baju pertama selesai.
    // Atlas seragam baru: 9 frame x 4 arah (bawah, atas, kiri, kanan).
    marcoUniform: { img: new Image(), layout: "dir", cw: 120, ch: 210, unit: 0.18, cols: 9 },
    nenek: { img: new Image(), layout: "anim", cw: 28, ch: 32, unit: 1, cols: 4, sideLeft: false },
    // Geng: sheet 5 frame jalan x 4 arah (bawah, atas, kiri, kanan), sel 28x38 seperti Marco.
    arga: { img: new Image(), layout: "dir", cw: 28, ch: 38, unit: 1, cols: 5 },
    galih: { img: new Image(), layout: "dir", cw: 28, ch: 38, unit: 1, cols: 5 },
    bram: { img: new Image(), layout: "dir", cw: 28, ch: 38, unit: 1, cols: 5 },
    evelyn: { img: new Image(), layout: "dir", cw: 28, ch: 38, unit: 1, cols: 5 },
    // Evelyn kasual (hoodie hitam): dipakai saat ia di rumah / bermain. Atlas 4 arah (bawah, atas, kiri, kanan) x 6 kolom:
    // kolom 0-4 siklus jalan (kiri/kanan hanya 4 frame), kolom 5 = pose diam.
    evelynCasual: { img: new Image(), layout: "dir", cw: 88, ch: 176, unit: 0.21, cols: 6, frames: { down: 5, up: 5, left: 4, right: 4 }, idleCol: 5 },
    evelynBreak: { img: new Image(), layout: "dir", cw: 28, ch: 38, unit: 1, cols: 5 },
    evelynCanteen: { img: new Image(), layout: "dir", cw: 28, ch: 38, unit: 1, cols: 5 }
  };
  SPRITES.marco.img.src = "assets/images/sprites/marco-sprite.png";
  SPRITES.marcoUniform.img.src = "assets/images/sprites/marco-uniform-sprite.png";
  SPRITES.nenek.img.src = "assets/images/sprites/nenek-sprite.png";
  ["arga", "galih", "bram", "evelyn"].forEach((k) => (SPRITES[k].img.src = "assets/images/sprites/" + k + "-sprite.png"));
  SPRITES.evelynCasual.img.src = "assets/images/sprites/evelyn-casual-sprite.png";
  SPRITES.evelynBreak.img.src = "assets/images/sprites/evelyn-sprite.png";
  SPRITES.evelynCanteen.img.src = "assets/images/sprites/evelyn-sprite.png";

  // Dua penanda quest: panah navigasi dekat Marco dan ikon interaksi tepat di atas target.
  const QUEST_MARKERS = { arrow: new Image(), interact: new Image() };
  QUEST_MARKERS.arrow.src = "assets/images/ui/quest-arrow.png";
  QUEST_MARKERS.interact.src = "assets/images/ui/quest-interact.png";

  // Fase langkah mengikuti jarak tempuh, jadi kaki tidak "meluncur".
  // Sprite digambar langsung dalam piksel layar (tanpa diperkecil) supaya tetap tajam.
  function drawSprite(key, x, y, dir, moving, run, dist) {
    const sp = SPRITES[key];
    if (!sp.img.complete || !sp.img.naturalWidth) return false;
    let row, col, flip = false, bob = 0;
    const side = dir === "left" || dir === "right";
    if (sp.layout === "dir") {
      row = { down: 0, up: 1, left: 2, right: 3 }[dir];
      const nFrames = (sp.frames && sp.frames[dir]) || sp.cols;
      col = moving ? Math.floor(dist / (run ? 4.5 : 7)) % nFrames : (sp.idleCol || 0);
      // Marco berseragam memakai empat baris arah yang sudah terpisah pada atlas baru;
      // jangan dicerminkan karena sisi kiri dan kanan memiliki pose kaki yang berbeda.
      flip = false;
    } else {
      row = ROWS[(moving ? (run ? "run" : "walk") : "idle") + "_" + (side ? "side" : dir)];
      col = moving ? Math.floor(dist / (run ? 8 : 7)) % 4 : 0;
      bob = moving && col % 2 === 1 ? 1 : 0;
      flip = side && (dir === "left") !== sp.sideLeft;
    }
    const breathe = !moving && Math.floor(t * 1.4) % 2 === 1 ? 1 : 0;   // napas: tinggi menyusut 1px
    ctx.globalAlpha = .3; ctx.fillStyle = "#000"; ctx.fillRect(Math.round(x) - 6, Math.round(y) - 1, 12, 3); ctx.globalAlpha = 1;
    const m = ctx.getTransform(), k = m.a * sp.unit;
    const dw = sp.cw * k, dh = sp.ch * k - breathe * m.a;
    const left = Math.round(m.a * x + m.e - dw / 2);
    const top = Math.round(m.d * y + m.f - sp.ch * k + 2 * m.a - bob * m.a + breathe * m.a);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (flip) { ctx.translate(left + dw, top); ctx.scale(-1, 1); ctx.drawImage(sp.img, col * sp.cw, row * sp.ch, sp.cw, sp.ch, 0, 0, dw, dh); }
    else ctx.drawImage(sp.img, col * sp.cw, row * sp.ch, sp.cw, sp.ch, left, top, dw, dh);
    ctx.restore();
    return true;
  }

  // ---------- potret dialog ----------
  const PORTRAITS = { mystery: "assets/images/portraits/mystery-guide.webp", pakJoko: "assets/images/portraits/pak-joko.webp", happy: "assets/images/portraits/nenek-potret.webp", kind: "assets/images/portraits/nenek-potret.webp", sad: "assets/images/portraits/nenek-potret.webp", angry: "assets/images/portraits/nenek-potret.webp", marco: "assets/images/portraits/marco.webp", marcoCasual: "assets/images/portraits/marco-casual-dialog.webp", arga: "assets/images/portraits/arga.webp", galih: "assets/images/portraits/galih.webp", bram: "assets/images/portraits/bram.webp", evelyn: "assets/images/portraits/evelyn.webp", evelynCasual: "assets/images/portraits/evelyn-casual.webp" };
  const GANG = { arga: { name: "Arga" }, galih: { name: "Galih" }, bram: { name: "Bram" } };
  Object.values(PORTRAITS).forEach((src) => { const im = new Image(); im.src = src; });

  // Reaksi NPC terhadap jawaban Marco. Jawaban marah/kasar -> NPC sedih, dan kalau sudah sering disakiti -> NPC marah.
  function reaction(ch) {
    let e = ch.e;
    if (!e) {
      const n = (ch.fx && ch.fx.n) || 0, d = (ch.fx && ch.fx.d) || 0;
      e = n >= 2 ? "happy" : n >= 1 ? "kind" : n <= -2 ? "sad" : n < 0 || d < 0 ? "sad" : "kind";
    }
    if (e === "sad" && state.s.n < -8) e = "angry";
    return e;
  }
  // Potret kini menempel di kiri bawah layar (ukuran diatur CSS), jadi tidak perlu dihitung ulang.
  function fitPortrait() {}
  // NPC tanpa file potret (npc-id.webp di folder portraits) memakai potret prosedural dari sprite karakternya, supaya kotak potret
  // selalu muncul di tempat yang sama untuk semua NPC. Letakkan file "<id>.webp" (misal sari.png) untuk menggantinya.
  const npcArt = {};
  npcs.forEach((n) => {
    if (n.id === "nenek" || PORTRAITS[n.id] || n.noArt) return;
    const im = new Image();
    im.onload = () => { npcArt[n.id] = "assets/images/portraits/" + n.id + ".webp"; };
    im.src = "assets/images/portraits/" + n.id + ".webp";
  });
  const procCache = {};
  function proceduralPortrait(n) {
    if (procCache[n.id]) return procCache[n.id];
    const oc = document.createElement("canvas"); oc.width = 120; oc.height = 100;
    const keep = ctx; ctx = oc.getContext("2d"); ctx.imageSmoothingEnabled = false;
    drawChar(60, 146, Object.assign({}, n, { dir: "down", scale: 4, walk: false }));
    ctx = keep;
    return (procCache[n.id] = oc.toDataURL());
  }
  // Evelyn berpakaian kasual saat ia di rumah atau sedang bermain: akhir pekan, atau sepulang sekolah (setelah bel 15.00).
  // Di hari sekolah sebelum bel, dan selama berada di gedung sekolah, ia tetap berseragam.
  const SCHOOL_MAPS = ["class", "lt2", "lt3", "gym", "canteen", "backyard"];
  function evelynCasual() {
    if (SCHOOL_MAPS.includes(state.map)) return false;
    const dow = new Date(2025, 7, 18 + state.day - 1).getDay();
    if (dow === 0 || dow === 6) return true;
    return clockPhase() >= 10 / 24;
  }
  function showPortrait(node) {
    const img = $("portrait");
    const who = dlg.who, marco = node.w === "Marco";
    let src = null, pix = false;
    if (marco) src = state.q && state.q.flags && state.q.flags.marcoUniform ? PORTRAITS.marco : PORTRAITS.marcoCasual;
    else if (node.p && PORTRAITS[node.p]) { src = PORTRAITS[node.p]; if (node.p === "mystery") pix = true; }
    else if (node.p === "nenek" || node.w === "Nenek" || (who && who.id === "nenek")) src = PORTRAITS[node.e || (node.m === "sad" ? "sad" : "kind")];
    else if (who && node.w) {
      if (PORTRAITS[who.id]) src = PORTRAITS[who.id];
      else if (npcArt[who.id]) src = npcArt[who.id];
      else { src = proceduralPortrait(who); pix = true; }
    }
    // Evelyn di rumah / bermain memakai potret kasual; di sekolah tetap potret seragam.
    if (src === PORTRAITS.evelyn && evelynCasual()) src = PORTRAITS.evelynCasual;
    if (!src) { img.hidden = true; return; }
    img.src = src; img.hidden = false;
    img.className = "left" + (pix ? " pix" : "");
  }

  // ---------- dialog ----------
  function openDialog(nodes, onEnd, who) {
    dlg = { nodes, i: 0, c: 0, onEnd, who };
    $("dialog").hidden = false;
    showNode();
  }
  function showNode() {
    const n = dlg.nodes[dlg.i];
    dlg.c = 0; $("dName").textContent = n.w || ""; $("dText").textContent = ""; $("dChoices").innerHTML = "";
    $("dialog").classList.remove("done");
    if (n.m) setMood(n.m);
    showPortrait(n);
  }
  function advance() {
    if (!dlg) return;
    const n = dlg.nodes[dlg.i];
    if (dlg.c < n.t.length) { dlg.c = n.t.length; return; }
    if (n.c) return;
    next();
  }
  function next() {
    dlg.i++;
    if (dlg.i >= dlg.nodes.length) {
      const end = dlg.onEnd; dlg = null; $("dialog").hidden = true; $("dialog").classList.remove("done"); $("portrait").hidden = true; setMood();
      if (end) end();
    } else showNode();
  }
  function choose(k) {
    const n = dlg.nodes[dlg.i], ch = n.c && n.c[k];
    if (!ch) return;
    Object.keys(ch.fx || {}).forEach((key) => (state.s[key] += ch.fx[key]));
    if (ch.fx && (ch.fx.c || 0) > 0) state.q.gangChoices = (state.q.gangChoices || 0) + 1;
    if (ch.fx && ((ch.fx.d || 0) > 0 || (ch.fx.e || 0) > 0)) state.q.goodChoices = (state.q.goodChoices || 0) + 1;
    if (ch.q) {
      if (ch.q.flag) state.q.flags[ch.q.flag] = true;
      if (ch.q.set) Object.assign(state.q, ch.q.set);
      if (ch.q.inc) Object.keys(ch.q.inc).forEach((key) => { state.q[key] = (state.q[key] || 0) + ch.q.inc[key]; });
    }
    Sound.beep(660, 0.1);
    // heat: seberapa keras geng menekan. hs = atur ulang, h = tambah/kurang.
    if (ch.hs !== undefined) state.heat = ch.hs; else if (ch.h) state.heat = Math.max(0, (state.heat || 0) + ch.h);
    const e = reaction(ch), rp = ch.rp || n.p;   // rp: siapa yang membalas (potret geng)
    const mood = rp && GANG[rp] ? "tense" : e === "angry" ? "tense" : e === "sad" ? "sad" : "warm";
    const lines = [{ w: "Marco", t: ch.t }];
    if (ch.r) lines.push({ w: rp && GANG[rp] ? GANG[rp].name : n.w, p: rp, t: ch.r, e, m: mood });
    dlg.nodes.splice(dlg.i + 1, 0, ...lines);
    n.c = null;
    next();
  }
  function updateDialog(dt) {
    if (!dlg) return;
    const n = dlg.nodes[dlg.i];
    if (dlg.c < n.t.length) {
      const before = Math.floor(dlg.c);
      dlg.c = Math.min(n.t.length, dlg.c + dt * 45);
      if (Math.floor(dlg.c) % 3 === 0 && Math.floor(dlg.c) !== before) Sound.beep(500, 0.03, "square", 0.015);
      $("dText").textContent = n.t.slice(0, Math.floor(dlg.c));
    } else {
      $("dText").textContent = n.t;
      $("dialog").classList.toggle("done", !n.c);
      if (n.c && !$("dChoices").children.length) {
        n.c.forEach((ch, k) => {
          const b = document.createElement("button");
          b.textContent = (k + 1) + ". " + ch.t;
          b.onclick = () => choose(k);
          $("dChoices").appendChild(b);
        });
        fitPortrait();
      }
    }
  }

  // ---------- alur hari ----------
  // Adegan cerita (pilihan, mengubah statistik) hanya sekali sehari. Selanjutnya NPC berganti ke obrolan biasa tanpa batas.
  function chatLine(n) {
    const pool = n.chat && n.chat.length ? n.chat : FALLBACK_CHAT;
    if (!n.bag.length) {
      n.bag = pool.slice().sort(() => Math.random() - 0.5);
      if (n.bag.length > 1 && n.bag[n.bag.length - 1] === n.last) n.bag.unshift(n.bag.pop());   // jangan mengulang kalimat yang baru dipakai
    }
    n.last = n.bag.pop();
    return n.last;
  }
  // ---------- quest bercabang & side quest ----------
  // Quest tersimpan di state.q agar pilihan dan progres tetap ada setelah reload/save.
  function questTalk(n) {
    const q = state.q, f = q.flags;
    const offer = (node) => { state.talked.push(n.id); openDialog([node], null, n); return true; };
    const evelynAfternoonBeat = n.id === "evelyn" && state.map === "world" && clockPhase() >= 10 / 24 &&
      ((!q.bramJoined && !f.evelynMemoryDone) || (q.bramJoined && !f.evelynConfronted));
    const todayForWeekend = new Date(2025, 7, 18 + state.day - 1).getDay();
    const evelynWeekendBeat = n.id === "evelyn" && state.map === "world" &&
      (todayForWeekend === 0 || todayForWeekend === 6) && f.evelynStudyRoute &&
      clockPhase() >= 4 / 24 && clockPhase() < 10 / 24 && f.evelynStudyAskedDay !== state.day;
    if (state.talked.includes(n.id) && !evelynAfternoonBeat && !evelynWeekendBeat) return false;

    if (n.id === "yati" && state.map === "canteen" && f.canteenVisitDay !== state.day) {
      f.canteenVisitDay = state.day;
      if ((state.s.u || 0) >= 2) return offer({ w: "Bu Yati", m: "warm", t: "Mau makan dulu, Marco? Hari ini ada nasi kuning, gorengan, dan es teh. Pilih yang kamu mau.", c: [
        { t: "Beli nasi kuning dan air mineral (2 uang).", fx: { u: -2 }, r: "Bu Yati menyiapkan nasi kuning. " + '"Makan yang cukup, ya. Biar kuat sampai pelajaran selesai."' },
        { t: "Beli gorengan saja (1 uang).", fx: { u: -1 }, r: "Bu Yati memasukkan beberapa gorengan ke kertas cokelat. " + '"Hati-hati masih panas."' },
        { t: "Lihat-lihat dulu, Bu. Terima kasih.", fx: {}, r: "Bu Yati mengangguk ramah. " + '"Kalau berubah pikiran, Ibu di sini."' }
      ] });
      return offer({ w: "Bu Yati", m: "warm", t: "Mau makan dulu, Marco? Hari ini ada nasi kuning dan gorengan. Kalau uang jajannya belum cukup, gak apa-apa. Nanti kalau ada rezeki, mampir lagi, ya." });
    }

    if (n.id === "sari" && state.map === "class" && done("attend") && !f.classProjectStarted && !f.classProjectDeclined) {
      return offer({ w: "Bu Sari", m: "warm", t: "Marco, kelas XII sedang menyiapkan pameran akhir semester. Ibu butuh bantuanmu mengumpulkan arsip dan menyusun papan kenangan kelas. Kamu bersedia?", c: [
        { t: "Saya bantu, Bu. Saya ingin ikut berkontribusi.", fx: { d: 2, n: 1 }, q: { flag: "classProjectStarted", set: { classProjectDay: state.day } }, r: "Bagus. Besok temui Sinta untuk menyatukan bahan-bahannya." },
        { t: "Maaf, Bu. Saya belum bisa ikut.", fx: { d: -1 }, q: { flag: "classProjectDeclined" }, r: "Tidak apa-apa. Ibu harap kamu tetap mengikuti pelajaran dengan baik." }
      ] });
    }
    if (n.id === "sinta" && state.map === "class" && f.classProjectStarted && !f.classProjectDone && state.day > (q.classProjectDay || 0)) {
      f.classProjectDone = true; q.sideCompleted++; q.goodChoices++;
      state.s.d += 3; state.s.e += 1;
      return offer({ w: "Sinta", m: "bright", t: "Marco! Arsip yang kamu kumpulkan lengkap. Kita berhasil menyusun papan kenangan kelas. Bu Sari bilang hasilnya akan dipajang saat acara perpisahan. Makasih sudah menepati janji.", r: "Sinta menempelkan foto kelas di bagian tengah. Untuk pertama kalinya setelah lama, Marco merasa benar-benar menjadi bagian dari kelas." });
    }
    if (n.id === "dimas" && state.map === "world" && state.day >= 2 && q.attendance >= 1 && !f.dimasDone) {
      if (!f.dimasStarted) return offer({ w: "Dimas", m: "sad", t: "Co, gue ketinggalan banyak catatan gara-gara beberapa hari gak fokus. Besok ada kuis. Bisa bantu gue belajar sebentar?", c: [
        { t: "Boleh. Kita belajar bareng sepulang sekolah.", fx: { d: 2 }, q: { flag: "dimasStarted", set: { dimasDay: state.day } }, r: "Serius? Makasih, Co. Besok gue tunggu di dekat kelas." },
        { t: "Gue lagi banyak urusan. Coba tanya Sinta.", fx: { d: -1 }, q: { flag: "dimasDeclined" }, r: "Oh... iya, gak apa-apa." }
      ] });
      if (state.day > (q.dimasDay || 0)) {
        f.dimasDone = true; q.sideCompleted++; state.s.d += 3; state.s.u += 1;
        return offer({ w: "Dimas", m: "bright", t: "Nilai kuis gue aman, Co! Ternyata belajar bareng lebih gampang daripada panik sendirian. Ini sedikit uang buat traktir es teh. Makasih, ya." });
      }
    }
    if (n.id === "warung" && state.map === "world" && state.day >= 3 && !f.warungDone) {
      if (!f.warungStarted) return offer({ w: "Pak Darto", m: "warm", t: "Marco, Bapak butuh bantuan merapikan stok dan mengantar pesanan ke rumah Bu Warti. Tidak berat, tapi perlu orang yang bisa dipercaya. Mau coba?", c: [
        { t: "Saya mau, Pak. Sepulang sekolah saya bantu.", fx: { u: 1, d: 1 }, q: { flag: "warungStarted", set: { warungDay: state.day } }, r: "Nah, begitu. Besok datang lagi, Bapak ajari cara mencatat barang." },
        { t: "Maaf, Pak. Saya belum bisa berkomitmen.", fx: { d: 0 }, q: { flag: "warungDeclined" }, r: "Tidak masalah. Sekolah dan keluarga tetap nomor satu." }
      ] });
      if (state.day > (q.warungDay || 0)) {
        f.warungDone = true; q.sideCompleted++; state.s.u += 4; state.s.n += 1;
        return offer({ w: "Pak Darto", m: "bright", t: "Kerjaanmu rapi dan pesanan sampai tepat waktu. Ini upahmu. Yang paling penting, Bapak senang kamu bisa dipercaya." });
      }
    }
    if (n.id === "putri" && state.map === "world" && state.day >= 4 && q.attendance >= 2 && !f.putriDone) {
      if (!f.putriStarted) return offer({ w: "Putri", m: "sad", t: "Marco, formulir beasiswa aku hampir selesai, tapi ada satu bagian yang harus ditulis tangan dan tintaku habis. Kamu kebetulan mau ke toko alat tulis?", c: [
        { t: "Aku bisa bantu carikan pulpen dan kertas.", fx: { d: 1, e: 1 }, q: { flag: "putriStarted", set: { putriDay: state.day } }, r: "Makasih! Besok aku tunggu di dekat taman." },
        { t: "Maaf, aku harus menyelesaikan urusanku dulu.", fx: { d: 0 }, q: { flag: "putriDeclined" }, r: "Oke, semoga urusanmu lancar." }
      ] });
      if (state.day > (q.putriDay || 0)) {
        f.putriDone = true; q.sideCompleted++; state.s.d += 2; state.s.e += 1;
        return offer({ w: "Putri", m: "bright", t: "Formulirnya sudah terkirim! Aku jadi punya kesempatan ikut seleksi. Terima kasih sudah membantu tanpa mengharapkan imbalan." });
      }
    }
    const calendarDay = new Date(2025, 7, 18 + state.day - 1).getDay();
    const weekend = calendarDay === 0 || calendarDay === 6;
    if (n.id === "evelyn" && state.map === "world" && weekend && f.evelynStudyRoute &&
        clockPhase() >= 4 / 24 && clockPhase() < 10 / 24 && f.evelynStudyAskedDay !== state.day) {
      f.evelynStudyAskedDay = state.day;
      return offer({ w: "Evelyn", p: "evelyn", m: "bright",
        t: calendarDay === 6
          ? "Marco, hari ini Sabtu. Aku tahu ini akhir pekan, tapi ujian makin dekat. Mau belajar bareng di perpustakaan? Setelah itu kita bisa cari jajanan."
          : "Besok sudah Senin lagi. Sebelum minggu baru dimulai, mau belajar bareng sebentar? Aku sudah siapkan rangkuman buat kita.",
        c: [
          { t: "Ayo. Kita belajar bareng. Setelah itu kita istirahat.", fx: { d: 2, e: 2 }, q: { flag: "evelynWeekendStudy", inc: { evelynTrust: 1 } }, r: 'Evelyn tersenyum lega. "Aku suka kalau kita saling mengingatkan, bukan saling memaksa."' },
          { t: "Hari ini aku mau punya waktu sendiri dulu.", fx: { e: -1 }, q: { flag: "evelynWeekendDeclined" }, r: 'Evelyn mengangguk. "Oke. Jangan lupa istirahat juga, ya."' }
        ] });
    }
    if (n.id === "evelyn" && state.map === "world" && clockPhase() >= 10 / 24 && state.day >= 2 && !q.bramJoined && !f.evelynMemoryDone) {
      if (!f.evelynMemoryStarted && q.attendance >= 1) return offer({ w: "Evelyn", m: "warm", t: "Aku menemukan kamera kecil lama di lemari. Kayaknya masih ada foto kita waktu kecil di dekat pohon jambu. Mau bantu aku mencarinya di rumah?", c: [
        { t: "Tentu. Aku juga kangen masa-masa itu.", fx: { e: 2, n: 1 }, q: { flag: "evelynMemoryStarted", set: { evelynMemoryDay: state.day } }, r: "Kalau begitu besok mampir, ya. Aku mau tunjukkan sesuatu." },
        { t: "Nanti dulu. Aku masih punya urusan.", fx: { e: -1 }, q: { flag: "evelynMemoryDeclined" }, r: "Oh, baiklah. Kapan-kapan saja." }
      ] });
      if (f.evelynMemoryStarted && state.day > (q.evelynMemoryDay || 0)) {
        f.evelynMemoryDone = true; q.evelynTrust += 1; q.sideCompleted++; state.s.e += 4; state.s.n += 1;
        return offer({ w: "Evelyn", m: "bright", t: "Ini fotonya! Lihat, kita masih kecil dan Nenek ada di belakang sambil pura-pura marah. Aku senang kita masih bisa membuat kenangan baru, Marco." });
      }
    }
    if (n.id === "rafi" && state.map === "world" && state.day >= 2 && (q.absences > 0 || q.gangChoices >= 2 || q.path === "circle") && !f.rafiInviteResolved) {
      return offer({ w: "Rafi", m: "tense", t: "Gue lihat lu mulai jarang di sekolah, Co. Bram lagi nyari orang yang bisa dipercaya. Ada tempat buat lu kalau lu capek dianggap anak kecil.", c: [
        { t: "Gue ikut. Kenalin gue ke Bram.", fx: { c: 4, d: -2, e: -1 }, q: { flag: "rafiInviteResolved", set: { path: "circle", gangInvited: true } }, r: "Nah, itu baru Marco yang gue kenal. Besok temui Bram. Jangan bikin dia nunggu." },
        { t: "Gue gak mau hidup gue diatur kalian.", fx: { c: -2, d: 2, e: 1 }, q: { flag: "rafiInviteResolved", set: { gangRejected: true } }, r: "Terserah lu. Tapi kalau berubah pikiran, lu tau tempat gue." },
        { t: "Gue perlu waktu buat mikir.", fx: { c: 1 }, q: { flag: "rafiInviteResolved", set: { path: "drift" } }, r: "Jangan kelamaan. Kesempatan gak nunggu." }
      ] });
    }
    if (n.id === "bram" && state.map === "world" && q.gangInvited && !q.bramJoined && state.day > 2) {
      return offer({ w: "Bram", m: "tense", t: "Rafi bilang lu mau gabung. Di sini gak ada setengah-setengah. Kalau lu ikut, lu ikut aturan circle. Kalau enggak, jangan cari kami lagi.", c: [
        { t: "Gue gabung. Gue ikut aturan kalian.", fx: { c: 7, d: -4, e: -3 }, q: { set: { bramJoined: true, path: "circle" }, flag: "bramOath" }, r: "Bagus. Mulai sekarang lu bagian dari kami. Jangan berharap Evelyn bakal percaya sama lu seperti dulu." },
        { t: "Gue berubah pikiran. Gue gak mau gabung.", fx: { c: -3, d: 2 }, q: { set: { gangInvited: false, gangRejected: true }, flag: "bramRefused" }, r: "Hah. Buang-buang waktu gue." }
      ] });
    }
    if (n.id === "evelyn" && q.bramJoined && !f.evelynConfronted) {
      f.evelynConfronted = true; state.s.e -= 2;
      return offer({ w: "Evelyn", m: "sad", t: "Marco, aku dengar kamu sekarang ikut Bram. Aku gak bisa pura-pura semuanya baik-baik saja. Aku peduli sama kamu, tapi aku juga harus menjaga diriku. Jangan minta aku menunggu kalau kamu sendiri memilih jalan itu." });
    }
    if (n.id === "arga" && q.bramJoined && !f.argaTestDone) {
      f.argaTestDone = true;
      return offer({ w: "Arga", m: "tense", t: "Bram bilang lu udah masuk. Ada satu urusan: besok malam lu harus memilih, tetap ikut circle atau berhenti sebelum semuanya makin jauh.", c: [
        { t: "Gue tetap di sini. Gue gak akan mundur.", fx: { c: 5, d: -3 }, q: { flag: "argaTestAccepted" }, r: "Arga mengangguk. " + '"Akhirnya lu ngerti cara dunia bekerja."' },
        { t: "Gue mau keluar. Ini bukan hidup yang gue cari.", fx: { c: -4, d: 2, n: 1 }, q: { flag: "argaTestRefused", set: { gangExitAttempt: true } }, r: "Arga menatapmu lama. " + '"Lu boleh pergi, tapi pilihan lu bakal punya akibat."' }
      ] });
    }
    return false;
  }

  function talk(n) {
    n.dir = "down";
    if (n.id === "angkotHome") {
      if (!state.talked.includes("evelyn")) {
        openDialog([{ w: "Pak Joko", p: "pakJoko", m: "warm", t: "Lho, Marco! Mau berangkat ke SMA Nusa? Tunggu Evelyn dulu, ya. Biar sekalian Bapak antar kalian berdua." }], null, n);
        return;
      }
      if (clockPhase() >= 10 / 24) {
        openDialog([{ w: "Pak Joko", p: "pakJoko", t: "Kalau mau pulang nanti, cari Bapak di halte dekat sekolah, ya. Jalur kampung masih Bapak yang pegang." }], null, n); return;
      }
      openDialog([{ w: "Pak Joko", p: "pakJoko", m: "bright", t: "Jurusan SMA Nusa! Ayo naik, Marco. Evelyn juga ikut, kan? Perjalanan kira-kira lima belas menit. Pegangan, ya!" }], () => playAngkotCutscene(() => {
        state.clock += DAY_LEN * (15 / 1440);
        enter("world", 114 * TS + 8, 18 * TS + 14);
        const ev = npcs.find((o) => o.id === "evelyn");
        flash("Tiba di halte SMA Nusa · perjalanan angkot 15 menit");
        if (window.TLSAudio) TLSAudio.sfx("door");
      }), n);
      return;
    }
    if (n.id === "angkotSchool") {
      if (clockPhase() < 10 / 24) {
        openDialog([
          { w: "Marco", m: "warm", t: "Pagi, Pak Joko! Terima kasih sudah nganterin kami." },
          { w: "Pak Joko", p: "pakJoko", m: "bright", t: "Sama-sama, Co! Wah, sekarang berangkatnya bareng Evelyn, ya? Sudah besar kalian. Jangan lupa belajar yang rajin, Bapak tunggu kalau pulang nanti." },
          { w: "Evelyn", p: "evelyn", m: "warm", t: "Terima kasih, Pak Joko. Hati-hati di jalan, ya!" }
        ], null, n); return;
      }
      openDialog([{ w: "Pak Joko", p: "pakJoko", m: "warm", t: "Mau pulang, Marco? Jurusan kampung, ya? Ayo. Lima belas menit sampai halte dekat rumahmu." }], () => {
        state.clock += DAY_LEN * (15 / 1440);
        enter("world", 12 * TS + 8, 16 * TS + 14);
        const ev = npcs.find((o) => o.id === "evelyn");
        flash("Tiba di halte dekat rumah · perjalanan angkot 15 menit");
        if (window.TLSAudio) TLSAudio.sfx("door");
      }, n);
      return;
    }
    if (n.id === "evelynBreak" || n.id === "evelynCanteen") {
      openDialog([{ w: "Evelyn", p: "evelyn", m: "warm", t: n.id === "evelynCanteen"
        ? "Aku senang kamu menerima ajakanku. Makan dulu, nanti kita kembali ke kelas bareng."
        : "Sebentar lagi istirahat, Marco. Jangan lupa makan siang, ya." }], null, n);
      return;
    }
    if (n.id === "satpamYard") {
      openDialog([{ w: "Pak Satpam", m: "tense", t: "Kalian seharusnya ada di kelas. Area belakang bukan tempat untuk bolos atau melakukan hal yang melanggar aturan. Saya melihat kalian tadi berkumpul di sini." },
        { w: "Bram", m: "tense", t: "Pak, kami cuma ngobrol sebentar..." },
        { w: "Pak Satpam", m: "tense", t: "Saya akan laporkan kejadian ini ke wali kelas. Marco, kamu juga harus bertanggung jawab atas pilihanmu." },
        { w: "Marco", m: "sad", t: "Saya paham, Pak. Saya salah karena ikut ke sini." }], () => {
          const f = state.q.flags;
          if (!f.yardConsequenceApplied) { f.yardConsequenceApplied = true; state.s.d -= 3; state.s.c += 1; flash("Pak Satpam melaporkan kejadian ke wali kelas"); }
        }, n);
      return;
    }
    if (n.id === "satpam") {
      if (clockPhase() >= 1.5 / 24 && clockPhase() < 10 / 24) {
        if (!done("late")) { state.r.push("late"); state.q.late = (state.q.late || 0) + 1; state.s.d -= 2; }
        openDialog([{ w: "Pak Satpam", m: "tense", t: "Waduh, Marco. Gerbang utama sudah ditutup sejak pukul 06.30. Saya sudah mencatat keterlambatanmu. Aturan sekolah tidak mengizinkan siswa masuk setelah gerbang ditutup. Kamu harus menunggu sampai jam pulang." }], null, n);
      } else {
        openDialog([{ w: "Pak Satpam", m: "warm", t: clockPhase() < 1.5 / 24 ? "Pagi, Marco. Gerbang masih dibuka. Usahakan sudah di kelas sebelum pukul 06.30, ya." : "Jam sekolah sudah selesai. Hati-hati di jalan pulang." }], null, n);
      }
      return;
    }
    if (n.id === "nenek" && state.map === "home" && clockPhase() < 10 / 24 && done("sarapan") && done("bekal") && !done("goodbye")) {
      state.r.push("goodbye");
      if (!state.talked.includes("nenek")) state.talked.push("nenek");
      state.s.n += 2;
      openDialog([
        { w: "Nenek", p: "nenek", m: "warm", t: "Marco, bekalnya sudah Nenek siapkan. Jangan lupa dimakan saat istirahat, ya. Belajar yang sungguh-sungguh, tapi jangan lupa jaga diri." },
        { w: "Marco", m: "warm", t: "Iya, Nek. Marco berangkat dulu. Nanti pulang Marco cerita soal hari ini. Nenek jangan terlalu capek jualan kuenya." },
        { w: "Nenek", p: "nenek", m: "warm", t: "Hati-hati di jalan. Salam buat Evelyn. Nenek tunggu kamu pulang." },
        { w: "Marco", m: "calm", t: "Siap, Nek. Assalamualaikum." }
      ], null, n);
      return;
    }
    if (n.id === "evelyn" && state.map === "world" && clockPhase() < 10 / 24) {
      // Evelyn tetap di tempatnya saat diajak bicara; baru setelah dialog ia berjalan menyusul Marco.
      if (!n.follow) { n.follow = true; n.attached = false; n.trail = []; n.fmap = null; n.jpath = null; }
      n.wander = false; n.walk = false;
    }
    if (questTalk(n)) return;
    if (n.staff && staffTalk(n)) return;
    const list = scenes[n.id];
    if (list && !state.talked.includes(n.id)) {
      state.talked.push(n.id);
      const copy = JSON.parse(JSON.stringify(list[(state.day - 1) % list.length]));
      if (GANG[n.id] || n.id === "evelyn") copy.p = n.id;
      return openDialog([copy], null, n);
    }
    openDialog([{ w: n.name, m: n.gang ? "tense" : undefined, t: chatLine(n) }], null, n);
  }
  // Kepala sekolah, wakepsek, dan dokter UKS menanggapi catatan kehadiran dan kondisi Marco; sisanya obrolan biasa.
  function staffTalk(n) {
    const q = state.q, f = q.flags, late = q.late || 0, abs = q.absences || 0, streak = q.attendanceStreak || 0, tired = state.fatigue || 0;
    if (n.id === "dokter" && tired >= 1 && f.uksRestDay !== state.day) {
      openDialog([{ w: n.name, m: "warm", t: "Wajahmu kelihatan lelah, Marco. Tidurmu kurang semalam? Kalau mau, berbaring di tempat tidur UKS sebentar. Setengah jam cukup untuk menyegarkan badan.", c: [
        { t: "Boleh, Dok. Saya istirahat sebentar.", fx: {}, q: { flag: "uksRestAccepted" }, r: "Silakan berbaring. Nanti Ibu bangunkan. Minum air putih dulu, ya." },
        { t: "Tidak usah, Dok. Saya masih kuat.", fx: {}, r: "Baiklah. Kalau mulai pusing, langsung kembali ke sini." }
      ] }], () => {
        if (!f.uksRestAccepted) return;
        f.uksRestAccepted = false; f.uksRestDay = state.day;
        state.fatigue = Math.max(0, (state.fatigue || 0) - 1);
        state.clock += DAY_LEN * (30 / 1440);
        flash("Istirahat 30 menit di UKS · rasa kantuk berkurang");
      }, n);
      return true;
    }
    const L = [];
    if (n.id === "kepsek") {
      if (late >= 1) L.push("Bapak melihat ada catatan keterlambatan atas namamu, Marco. Gerbang ditutup setengah tujuh. Bapak harap itu tidak terulang.");
      if (abs >= 1) L.push("Ada catatan ketidakhadiran atas namamu. Kalau ada kendala di rumah, bicarakan dengan wali kelas atau langsung ke Bapak.");
      if (streak >= 3) L.push("Kehadiranmu rapi beberapa hari ini. Bapak senang melihatnya. Pertahankan.");
      if (f.classProjectStarted) L.push("Bu Sari bercerita soal papan kenangan kelas XII. Bapak senang kamu ikut terlibat.");
      if (f.yardConsequenceApplied) L.push("Bapak dengar soal kejadian di halaman belakang. Semua orang boleh salah langkah, asal mau kembali ke jalan yang benar.");
    } else if (n.id === "wakepsek") {
      if (late >= 1) L.push("Marco, buku catatan keterlambatan ada di meja Ibu. Namamu sudah ada di sana. Jangan sampai halamannya bertambah.");
      if (f.yardConsequenceApplied) L.push("Ibu menerima laporan Pak Satpam tentang halaman belakang. Ibu kecewa, tapi Ibu percaya kamu bisa memperbaikinya.");
      if (streak >= 3) L.push("Wali kelasmu bilang kamu mulai disiplin. Ibu catat itu sebagai nilai plus.");
    } else if (n.id === "dokter") {
      if (tired >= 1) L.push("Tadi kamu sudah istirahat di sini. Jangan begadang lagi malam ini, ya.");
      if (late >= 1 || abs >= 1) L.push("Kalau sering terlambat gara-gara bangun kesiangan, coba tidur sebelum jam sepuluh. Tubuh remaja butuh delapan jam.");
    }
    if (L.length && (n.dynTurn = !n.dynTurn)) {
      n.dynIdx = ((n.dynIdx || 0) + 1) % L.length;
      openDialog([{ w: n.name, m: "warm", t: L[n.dynIdx] }], null, n);
      return true;
    }
    return false;
  }
  function sleep() {
    if (tutActive()) return openDialog([{ w: "???", t: "Belum waktunya tidur, Marco. Selesaikan dulu tugasmu, lalu keluar lewat pintu depan." }], null);
    // Pemain bebas tidur kapan saja. Durasi tidur dihitung sampai pukul 05.00 berikutnya.
    const nowMinutes = (DAY_START_MINUTES + Math.floor((clockPhase()) * 1440)) % 1440;
    let sleepMinutes = (DAY_START_MINUTES - nowMinutes + 1440) % 1440;
    if (sleepMinutes === 0) sleepMinutes = 1440;
    const hours = sleepMinutes / 60;
    state.fatigue = hours >= 8 ? 0 : hours >= 6 ? 1 : hours >= 4 ? 2 : 3;
    const line = hours >= 8
      ? "Aku tidur cukup. Semoga besok semuanya berjalan lancar."
      : hours >= 6
        ? "Aku tidur agak larut. Semoga besok gak terlalu mengantuk."
        : hours >= 4
          ? "Tidurku sedikit sekali. Besok pasti susah bangun dan sulit fokus."
          : "Cuma sebentar tidur... Besok kepalaku pasti berat dan semuanya terasa membingungkan.";
    openDialog([{ w: "Marco", m: hours < 6 ? "sad" : "calm", t: line }], nextDay);
  }
  function nextDay() {
    state.day++; state.talked = []; state.r = []; state.clock = 0;
    // Kurang tidur membuat Marco terlambat benar-benar siap beraktivitas.
    const delayHours = [0, 0.25, 0.5, 1][state.fatigue || 0];
    state.clock += DAY_LEN * delayHours / 24;
    const ev = npcs.find((n) => n.id === "evelyn");
    if (ev) { ev.follow = false; ev.attached = false; ev.trail = []; ev.wander = true; ev.map = "world"; ev.px = ev.hx; ev.py = ev.hy; }
    npcs.filter((n) => n.commute).forEach((n, i) => {
      n.map = "world"; n.commute.started = false; n.commute.arrived = false;
      n.px = n.x * TS + 8; n.py = n.y * TS + 14; n.hx = n.px; n.hy = n.py; n.walk = false; n.wander = false;
    });
    if (state.day > DAYS) return finish();
    enter("home", SPAWN.x, SPAWN.y);
    flash("Hari " + state.day);
    hooks.save(snapshot());
    const wakeLine = state.fatigue >= 3
      ? "Kepalaku berat... Aku bahkan susah mengingat apa yang harus kulakukan. Aku harus cepat bersiap."
      : state.fatigue === 2
        ? "Aduh, masih ngantuk. Rasanya pikiranku lambat sekali pagi ini."
        : state.fatigue === 1
          ? "Aku masih sedikit mengantuk karena tidur larut. Ayo, jangan sampai terlambat."
          : MORNING[(state.day - 2) % MORNING.length];
    openDialog([{ w: "Marco", m: state.fatigue >= 2 ? "sad" : "calm", t: wakeLine }], null);
    if (state.fatigue >= 2) flash(state.fatigue >= 3 ? "Kurang tidur parah: Marco linglung dan terlambat bangun" : "Kurang tidur: Marco sulit berkonsentrasi");
  }
  function finish() {
    const s = state.s;
    let type = "neutral";
    if (s.c >= 60 || (s.c >= 35 && s.d < 20) || (state.q.bramJoined && s.c >= 35)) type = "bad";
    else if (s.u >= 70 && s.d >= 80 && s.c <= 10 && state.q.attendance >= 10 && state.q.absences <= 4) type = "good";
    // Evelyn hanya membuka masa depan bersama Marco jika kepercayaan terjaga dan Marco tidak pernah bersumpah bergabung dengan Bram.
    const e = type === "good" && s.e >= 15 && state.q.evelynTrust >= 1 && state.q.flags.evelynStudyRoute && !state.q.bramJoined && state.q.path !== "circle" ? endings.goodEvelyn : endings[type];
    setMood(type === "bad" ? "tense" : type === "good" ? "bright" : "calm");
    state.ending = e === endings.goodEvelyn ? "goodEvelyn" : type;
    state.day = DAYS; state.done = true;
    openDialog([{ w: "", t: e[0] }, { w: "", t: e[1] }, { w: "", t: e[2] }, { w: "", t: e[3] }], () => { hooks.save(snapshot()); quit(true); });
  }
  function enter(map, x, y) {
    if (window.TLSAudio) TLSAudio.sfx("door");
    state.map = map; state.x = x; state.y = y; player.x = x; player.y = y;
    const ev = npcs.find((n) => n.id === "evelyn");
    if (ev && ev.follow) {
      ev.map = map;
      // Evelyn muncul di belakang Marco saat melewati pintu, bukan di depan kelas.
      const behind = findFreeSpot(player.x - 20, player.y + 8, map, player.x, player.y);
      ev.px = behind.x; ev.py = behind.y;
      ev.dir = player.dir; ev.walk = false; ev.attached = false; ev.trail = []; ev.fmap = null; ev.jpath = null;
    }
  }

  function tryEnterSchoolGate() {
    if (state.map !== "world") return false;
    const d = doors.world.find((o) => o.to === "class");
    if (!d || Math.hypot(player.x - (d.x * TS + 8), player.y - (d.y * TS + 14)) > 27) return false;
    if (!state.talked.includes("evelyn")) {
      openDialog([{ w: "Marco", t: "Aku janji berangkat bersama Evelyn. Aku harus menemuinya dulu." }], null);
      return true;
    }
    if (clockPhase() < 1 / 24) {
      openDialog([{ w: "Marco", t: "Sekolah mulai pukul 06.00. Aku tunggu sampai gerbang dibuka." }], null);
      return true;
    }
    if (clockPhase() >= 10 / 24) {
      openDialog([{ w: "Marco", t: "Jam sekolah sudah selesai. Besok saja masuk kelas." }], null);
      return true;
    }
    if (clockPhase() >= 1.5 / 24) {
      if (!done("late")) { state.r.push("late"); state.q.late = (state.q.late || 0) + 1; state.s.d -= 2; }
      openDialog([{ w: "Pak Satpam", m: "tense", t: "Stop, Marco. Gerbang sudah dikunci sejak pukul 06.30. Namamu sudah dicatat terlambat. Kamu tidak bisa masuk hari ini." }], null);
      return true;
    }
    enter("class", World.school.entranceX * TS + 8, 10 * TS + 14);
    if (!done("attend")) { state.r.push("attend"); state.q.attendance = (state.q.attendance || 0) + 1; }
    if ((state.fatigue || 0) >= 2 && !done("groggy")) {
      state.r.push("groggy"); state.s.d -= 1;
      openDialog([{ w: "Marco", m: "sad", t: state.fatigue >= 3
        ? "Aduh, aku susah menangkap penjelasan Bu Sari. Mataku berat dan pikiranku ke mana-mana."
        : "Aku berusaha fokus, tapi masih mengantuk. Beberapa penjelasan Bu Sari terlewat." }], null);
    }
    return true;
  }
  function flash(msg) { hudMsg = msg; hudTimer = 2.5; }

  // ---------- HUD: tanggal, jam, cuaca, objective ----------
  // Semester dimulai Senin, 18 Agustus. Satu hari game berlangsung 24 jam (06:00 sampai 06:00 berikutnya) dalam 30 menit nyata.
  const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const ICON_SUN = '<svg viewBox="0 0 16 16" width="1.2em" height="1.2em" fill="#fff" shape-rendering="crispEdges"><rect x="6" y="5" width="4" height="6"/><rect x="5" y="6" width="6" height="4"/><rect x="7" y="0" width="2" height="3"/><rect x="7" y="13" width="2" height="3"/><rect x="0" y="7" width="3" height="2"/><rect x="13" y="7" width="3" height="2"/><rect x="2" y="2" width="2" height="2"/><rect x="12" y="2" width="2" height="2"/><rect x="2" y="12" width="2" height="2"/><rect x="12" y="12" width="2" height="2"/></svg>';
  const ICON_DUSK = '<svg viewBox="0 0 16 16" width="1.2em" height="1.2em" fill="#ffb061" shape-rendering="crispEdges"><rect x="5" y="6" width="6" height="5"/><rect x="4" y="8" width="8" height="3"/><rect x="7" y="1" width="2" height="3"/><rect x="1" y="7" width="3" height="2"/><rect x="12" y="7" width="3" height="2"/><rect x="1" y="12" width="14" height="2"/></svg>';
  function qGangObjective() { return state.q && (state.q.gangInvited && !state.q.bramJoined || state.q.bramJoined && !state.q.flags.argaTestDone); }
  function objective() {
    const ts = tutStep();
    if (ts && ts.obj) return "Tutorial: " + ts.obj;
    const p = clockPhase(), home = state.map === "home";
    const f = state.q.flags;
    if (f.angkotQuestStarted && !f.angkotBoarded && state.map === "world") return questAngkot.phase === "stopped" ? "Naik angkot bersama Evelyn — tekan [E] di dekat pintu" : "Quest: tunggu angkot di Halte Kampung";
    if (enc) return "Hadapi Arga dan gengnya";
    if (p >= 17 / 24) {
      if (!home) return "Pulang ke rumah Nenek untuk beristirahat";
      if (!done("makan")) return "Makan malam bersama Nenek di dapur";
      if (!done("gigi")) return "Sikat gigi di kamar mandi";
      return "Tidur di kamar Marco kapan saja jika siap";
    }
    const calendarDay = new Date(2025, 7, 18 + state.day - 1).getDay();
    const weekend = calendarDay === 0 || calendarDay === 6;
    if (weekend && state.q.flags.evelynStudyRoute && p >= 4 / 24 && p < 10 / 24 &&
        state.map === "world" && state.q.flags.evelynStudyAskedDay !== state.day)
      return "Temui Evelyn — dia mengajakmu belajar di akhir pekan";
    if (p >= 4.5 / 24 && p < 5.5 / 24 && state.map === "class" && done("attend") &&
        state.q.flags.middayChoiceDay !== state.day) return "Jam istirahat: Evelyn ingin mengajakmu ke kantin";
    if (p >= 10 / 24 && p < 13 / 24) {
      const f = state.q.flags;
      if (f.classProjectStarted && !f.classProjectDone) return "Side Quest: temui Sinta untuk menyelesaikan proyek kelas";
      if (f.dimasStarted && !f.dimasDone) return "Side Quest: bantu Dimas belajar";
      if (f.warungStarted && !f.warungDone) return "Side Quest: kembali ke warung Pak Darto";
      if (f.putriStarted && !f.putriDone) return "Side Quest: temui Putri di taman";
      if (f.evelynMemoryStarted && !f.evelynMemoryDone) return "Side Quest: temui Evelyn untuk melihat foto lama";
      if (qGangObjective()) return "Quest Circle: temui Bram atau tentukan sikapmu";
    }
    if (p >= 13 / 24) {
      if (!home) return "Pulang ke rumah Nenek";
      if (!done("makan")) return "Makan malam bersama Nenek di dapur";
      if (!done("gigi")) return "Sikat gigi di kamar mandi";
      return "Istirahat di rumah";
    }
    if (!done("mandi")) return "Quest pagi: mandi di kamar mandi";
    if (!done("baju")) return "Quest pagi: ganti seragam di kamar Marco";
    if (!done("sarapan")) return "Sarapan bersama Nenek di dapur";
    if (!done("bekal")) return "Quest pagi: ambil bekal yang disiapkan Nenek";
    if (!done("goodbye")) return "Pamit kepada Nenek sebelum berangkat";
    if (home) return "Temui Evelyn di depan rumah";
    if (state.map === "world" && !state.talked.includes("evelyn")) return "Ajak Evelyn berangkat ke sekolah";
    if (p < 1 / 24) return "Tunggu pukul 06.00 bersama Evelyn";
    if (p < 10 / 24 && state.map === "class") return state.talked.includes("sari") ? "Ikuti kegiatan kelas XII" : "Temui Bu Sari di kelas";
    if (p < 10 / 24 && state.map === "canteen") return "Istirahat di kantin, lalu kembali ke kelas";
    if (p < 10 / 24) return "Masuk sekolah sebelum pelajaran dimulai";
    if (state.map === "class") return "Sekolah selesai — bersiap pulang";
    return "Jelajahi desa dan ikuti cerita sepulang sekolah";
  }
  const hudCache = {};
  function setHud(id, key, html) { if (hudCache[id] !== html) { hudCache[id] = html; $(id)[key] = html; } }
  function updateHud() {
    const d = new Date(2025, 7, 18 + state.day - 1), p = clockPhase();
    const mins = (DAY_START_MINUTES + Math.floor(p * 1440)) % 1440, hh = String(Math.floor(mins / 60)).padStart(2, "0"), mm = String(mins % 60).padStart(2, "0");
    setHud("hdDay", "textContent", DAY_NAMES[d.getDay()] + ", " + d.getDate() + " " + MONTHS[d.getMonth()] + "  \u00b7  Hari " + state.day + "/" + DAYS);
    setHud("hdTime", "textContent", hh + ":" + mm);
    setHud("hdIcon", "innerHTML", p > 0.7 ? ICON_DUSK : ICON_SUN);
    setHud("hqText", "textContent", objective());
    const tf = tutStep() && tutStep().focus;
    $("hudQuest").classList.toggle("tut-focus", tf === "quest");
    $("hudDate").classList.toggle("tut-focus", tf === "date");
    const f = $("hudFlash");
    if (hudTimer > 0) { f.textContent = hudMsg; f.hidden = false; } else f.hidden = true;
    const nearBusDoor = state.map === "world" && questAngkot.active && questAngkot.phase === "stopped" && Math.hypot(player.x - (questAngkot.x + 49), player.y - (questAngkot.y + 10)) < 62;
    const nearDoor = !nearBusDoor && !dlg && doorNearPlayer();
    const nearInner = !nearBusDoor && !nearDoor && !dlg && innerDoorNearPlayer();
    $("hudHint").textContent = nearBusDoor ? "[E] Naik angkot bersama Evelyn  [M] peta wilayah" : nearInner ? "[E] Buka pintu" + (nearInner.room ? " ke " + nearInner.room : "") + "  [Esc] menu" : nearDoor ? "[E] Masuk/keluar ruangan  [M] peta wilayah  [Esc] menu" : state.map === "world" ? "[E] bicara/masuk  [M] peta wilayah  [Esc] menu" : "[E] bicara/masuk  [Esc] menu";
    $("hudHint").hidden = !!dlg;
  }
  const snapshot = () => Object.assign({}, state, { x: player.x, y: player.y });

  // ---------- pencegatan oleh geng ----------
  // Tiap dua hari (tiap hari kalau Marco sering menolak) Arga, Galih, dan Bram muncul dari luar layar, mengepung Marco, lalu
  // memaksanya ikut. Menolak menaikkan heat, dan tekanannya ikut naik. Mengalah menurunkan heat tapi mengisi circle.
  const gang = () => npcs.filter((n) => n.gang);
  const GANG_OFF = { arga: [0, -18], galih: [-18, 6], bram: [18, 6] };
  const offscreen = (x, y) => Math.abs(x - (cam.x + VW / 2)) > VW / 2 + 16 || Math.abs(y - (cam.y + VH / 2)) > VH / 2 + 24;

  function startHadang() {
    let spot = null;
    for (let k = 0; k < 80 && !spot; k++) {
      const a = Math.random() * Math.PI * 2, r = 190 + Math.random() * 110;
      const x = player.x + Math.cos(a) * r, y = player.y + Math.sin(a) * r * 0.7;
      if (offscreen(x, y) && !npcBlocked(x, y)) spot = { x, y };
    }
    if (!spot) { encCool = 4; return; }
    enc = { t: 0 };
    gang().forEach((n, i) => {
      n.chase = true; n.leave = false; n.hold = false; n.walk = true; n.off = GANG_OFF[n.id];
      n.px = spot.x + (i - 1) * 10; n.py = spot.y;
      if (npcBlocked(n.px, n.py)) n.px = spot.x;
    });
    flash("Ada yang mengincarmu...");
    setMood("tense");
  }
  function stopHadang(warp) {
    enc = null;
    gang().forEach((n) => {
      n.chase = false; n.hold = false; n.walk = false;
      if (warp) { n.px = n.hx; n.py = n.hy; n.leave = false; } else n.leave = true;
    });
  }
  function hadangArrive() {
    const crew = gang();
    enc = null;
    state.talked.push("hadang");
    crew.forEach((n) => {
      const x = player.x + n.off[0], y = player.y + n.off[1];
      if (Math.hypot(n.px - x, n.py - y) > 6 && !blocked(x, y)) { n.px = x; n.py = y; }
      n.chase = false; n.hold = true; n.walk = false;
      n.dir = Math.abs(player.x - n.px) > Math.abs(player.y - n.py) ? (player.x > n.px ? "right" : "left") : (player.y > n.py ? "down" : "up");
    });
    player.dir = "up"; player.walk = false;
    openDialog(hadangNodes(), () => {
      crew.forEach((n) => { n.hold = false; n.leave = true; if (!state.talked.includes(n.id)) state.talked.push(n.id); });
      setMood(); hooks.save(snapshot());
    }, crew[0]);
  }
  // Isi dialog pencegatan. Level 0: ajakan memaksa. Level 1: ancaman dan uang jajan diambil. Level 2: Nenek ikut diancam.
  function hadangNodes() {
    const heat = state.heat || 0, lv = Math.min(2, heat), kuat = state.s.d >= 15;   // kuat: Marco cukup disiplin, ada guru yang memergoki
    const A = (t) => ({ w: "Arga", p: "arga", m: "tense", t }), G = (t) => ({ w: "Galih", p: "galih", m: "tense", t }), B = (t) => ({ w: "Bram", p: "bram", m: "tense", t });
    const nodes = [
      [A("Marco. Berhenti di situ."), G("Santai, jangan tegang gitu. Kita cuma mau ngajak lu gabung. Semua orang di sekolah ini kenal kita."), B("Dan lu bakal ikut. Kita bukan lagi nanya.")],
      [A("Kemarin lu nolak. Hari ini gue tanya sekali lagi."), G("Jangan bikin ini sulit, Marco. Lu tau siapa yang didengerin di sekolah ini."), B("Atau gue yang bikin lu ngerti.")],
      [A("Gue udah cukup sabar. Besok sepulang sekolah, gudang belakang. Atau gue yang dateng ke rumah lu."), G("Nenek lu pasti seneng didatengin temen cucunya, kan?"), B("Pilih.")]
    ][lv];
    const choices = [
      [
        { t: "Oke... gue ikut sebentar.", fx: { c: 3, d: -2, u: -1, n: -1 }, hs: 0, rp: "arga", r: "\"Pinter. Mulai besok lu jalan bareng kita.\"" },
        { t: "Gue gak mau. Minggir.", fx: { c: -2, d: 1, n: 1 }, h: 1, rp: "bram", r: "Bram mendorong bahumu sampai kamu mundur selangkah. \"Lu pikir bisa nolak?\" Arga mengangkat tangan dan mereka mundur. \"Kita ketemu lagi.\"" },
        { t: "Iya, nanti gue nyusul.", fx: { c: 1, d: -1 }, rp: "galih", r: "\"Gue pegang omongan lu. Jangan bohong, ya.\"" }
      ],
      [
        { t: "Oke, oke. Gue ikut.", fx: { c: 3, d: -2, u: -1, n: -1 }, hs: 0, rp: "arga", r: "\"Dari tadi kek. Capek gue ngomong.\"" },
        { t: "Gue tetep gak mau.", fx: { c: -2, d: 1, n: 1, u: -1 }, h: 1, rp: "bram", r: "Bram merogoh saku seragammu dan mengambil uang jajanmu. \"Ini harga nolak.\" Mereka pergi sambil tertawa." },
        { t: "Besok deh, gue janji.", fx: { c: 2, d: -1 }, rp: "galih", r: "\"Besok jangan lupa. Kita bakal nyari lu.\"" }
      ],
      [
        { t: "...Oke. Jangan ganggu Nenek.", fx: { c: 4, d: -2, u: -1, n: -2 }, hs: 0, rp: "arga", r: "\"Pilihan bagus. Gue gak suka ngulang.\"" },
        kuat
          ? { t: "Jangan sentuh Nenek gue! Gue gak takut sama kalian.", fx: { c: -3, d: 2, n: 1 }, h: -1, rp: "arga", r: "Dari kejauhan Bu Sari memanggil namamu. Arga mendecak dan memberi isyarat mundur. \"Lain kali.\"" }
          : { t: "Jangan sentuh Nenek gue! Gue gak takut sama kalian.", fx: { c: -2, d: 1, n: 1, u: -1 }, rp: "bram", r: "Bram mencengkeram kerah seragammu sebelum Arga memberi isyarat mundur. \"Kita belum selesai.\"" },
        { t: "Gue dateng. Cuma sekali.", fx: { c: 3, d: -2, n: -1 }, rp: "galih", r: "\"Pinter. Jangan sampai gue harus ngingetin lagi.\"" }
      ]
    ][lv];
    nodes[nodes.length - 1].c = choices;
    return nodes;
  }

  // Cutscene naik angkot (7 ilustrasi, geser kanan->kiri, ENTER lanjut). Game dibekukan selama cutscene.
  let inCutscene = false;
  function playAngkotCutscene(after) {
    inCutscene = true; keys = {};
    Cutscene.play(() => { inCutscene = false; keys = {}; after(); }, { id: "angkot", scenes: Cutscene.ANGKOT, rtl: true });
  }

  // Pintu dan tangga: dipakai dengan menekan E saat Marco berdiri di atas atau di samping petak pintu.
  function doorNearPlayer() {
    const m = maps[state.map], list = doors[state.map] || [];
    let best = null, bd = 1e9;
    for (const d of list) {
      const tp = m.t[d.y] && m.t[d.y][d.x];
      if (tp !== DOOR && tp !== World.T.STAIR) continue;
      const dist = Math.hypot(player.x - (d.x * TS + 8), (player.y - 2) - (d.y * TS + 8));
      if (dist < 17 && dist < bd) { bd = dist; best = d; }
    }
    return best;
  }
  // Pintu antar-ruangan di dalam bangunan (rumah dan sekolah): padat, harus dibuka dengan E, lalu Marco melangkah ke sisi seberang.
  function innerDoorNearPlayer() {
    const m = maps[state.map], IDOOR = World.T.IDOOR;
    if (!m || dlg) return null;
    const ci = Math.floor(player.x / TS), cj = Math.floor((player.y - 2) / TS);
    let best = null, bd = 1e9;
    for (let j = cj - 2; j <= cj + 2; j++) for (let i = ci - 2; i <= ci + 2; i++) {
      if (!m.t[j] || m.t[j][i] !== IDOOR) continue;
      const cx = i * TS + 8, cy = j * TS + 8, dist = Math.hypot(player.x - cx, (player.y - 2) - cy);
      const hz = m.t[j][i - 1] === World.T.WALL && m.t[j][i + 1] === World.T.WALL;
      const lateral = hz ? Math.abs(player.x - cx) : Math.abs((player.y - 2) - cy);   // harus berdiri sejajar dengan pintu, bukan di sudut dinding
      if (dist >= 22 || lateral > 11 || dist >= bd) continue;
      // sisi tempat Marco berdiri (-1 = atas/kiri, 1 = bawah/kanan); tujuannya sisi yang berlawanan
      const side = hz ? ((player.y - 2) < cy ? -1 : 1) : (player.x < cx ? -1 : 1);
      const ti = hz ? i : i - side, tj = hz ? j - side : j;
      const facing = player.dir === (hz ? (side < 0 ? "down" : "up") : (side < 0 ? "right" : "left"));   // Marco menghadap pintu
      best = { i, j, hz, side, ti, tj, dist, facing, room: World.roomName(state.map, ti * TS + 8, tj * TS + 8) };
      bd = dist;
    }
    return best;
  }
  function useInnerDoor(d) {
    let x = d.ti * TS + 8, y = d.tj * TS + 14;
    if (blocked(x, y)) { const f = findFreeSpot(x, y, state.map); x = f.x; y = f.y; }
    const dir = d.hz ? (d.side < 0 ? "down" : "up") : (d.side < 0 ? "right" : "left");
    enter(state.map, x, y);
    player.dir = dir; player.walk = false;
    // Evelyn ikut melewati pintu: ia muncul di samping Marco, bukan menembus dinding.
    const ev = npcs.find((n) => n.id === "evelyn");
    if (ev && ev.follow) {
      const off = d.hz ? [-12, 0] : [0, -12];
      const sp = findFreeSpot(x + off[0], y + off[1], state.map, x, y);
      ev.px = sp.x; ev.py = sp.y; ev.dir = dir; ev.walk = false; ev.attached = false; ev.trail = []; ev.fmap = null; ev.jpath = null;
    }
    return true;
  }
  function useDoor(d) {
    if (d.to === "world" && state.map === "home" && exitBlocked()) return true;
    if (d.to === "world" && state.map === "home" && tutActive()) {
      openDialog([{ w: "???", p: "mystery", t: "Sampai jumpa, Jangan kecewakan aku." }], () => {
        state.tut = { done: true }; tutReset();
        enter(d.to, d.tx * TS + 8, d.ty * TS + 14);
      });
      return true;
    }
    // Pintu gedung sekolah ditangani tryEnterSchoolGate (tekan E di dekat gerbang/pintu); terkunci di luar jam sekolah.
    if (d.to === "class" && state.map === "world") return false;
    enter(d.to, d.tx * TS + 8, d.ty * TS + 14);
    if (d.to === "class" && !done("attend")) { state.r.push("attend"); state.q.attendance = (state.q.attendance || 0) + 1; }
    if (d.to === "class" && (state.fatigue || 0) >= 2 && !done("groggy")) {
      state.r.push("groggy");
      state.s.d -= 1;
      openDialog([{ w: "Marco", m: "sad", t: state.fatigue >= 3
        ? "Aduh, aku susah menangkap penjelasan Bu Sari. Mataku berat dan pikiranku ke mana-mana."
        : "Aku berusaha fokus, tapi masih mengantuk. Beberapa penjelasan Bu Sari terlewat." }], null);
    }
    return true;
  }

  function interact() {
    if (dlg || enc || inCutscene) return;
    if (state.map === "world" && tryEnterSchoolGate()) return;
    if (state.map === "world" && questAngkot.active && questAngkot.phase === "stopped" &&
        Math.hypot(player.x - (questAngkot.x + 49), player.y - (questAngkot.y + 10)) < 62) {
      state.q.flags.angkotBoarded = true; state.q.flags.angkotQuestDone = true;
      // Angkot tetap terlihat berhenti di halte selama dialog; baru dihapus saat cutscene perjalanan dimulai.
      openDialog([{ w: "Marco", m: "warm", t: "Akhirnya angkotnya datang. Evelyn, ayo naik. Kita harus sampai sebelum bel masuk." },
        { w: "Evelyn", p: "evelyn", m: "bright", t: "Untung kita sempat. Duduk dekat jendela, yuk." },
        { w: "Pak Joko", p: "pakJoko", m: "warm", t: "SMA Nusa, ya? Siap, Marco! Pegangan, sebentar lagi sampai." }], () => { questAngkot.active = false; questAngkot.phase = "idle"; playAngkotCutscene(() => {
          state.clock += DAY_LEN * (15 / 1440);
          // Turun di jalur pejalan kaki tepat di bawah celah gerbang (x=114), di sebelah barat halte (x=116).
          // Titik dicek terhadap tabrakan peta; bila terhalang, dicari petak bebas terdekat agar tidak stuck.
          const spot = findFreeSpot(114 * TS + 8, 17 * TS + 14, "world");
          const arrivalX = spot.x, arrivalY = spot.y;
          enter("world", arrivalX, arrivalY);
          const ev = npcs.find((o) => o.id === "evelyn");
          if (ev && ev.follow) {
            const evSpot = findFreeSpot(arrivalX - 18, arrivalY + 2, "world", arrivalX, arrivalY);
            ev.map = "world";
            ev.px = evSpot.x;
            ev.py = evSpot.y;
            ev.dir = "right";
            ev.walk = false; ev.attached = false; ev.trail = []; ev.fmap = null; ev.jpath = null;
          }
          // Angkot tetap terlihat di halte beberapa saat setelah penumpang turun,
          // lalu melaju ke kanan dan keluar dari layar.
          questAngkot.active = true;
          questAngkot.phase = "school-stopped";
          questAngkot.x = SCHOOL_STOP.x;
          questAngkot.y = 285;
          questAngkot.wait = 3.5;
          flash("Tiba di Halte SMA Nusa · turun bersama Evelyn");
          if (window.TLSAudio) TLSAudio.sfx("door");
        }); });
      return;
    }
    const n = hereNpcs().find((o) => Math.hypot(o.px - player.x, o.py - player.y) < 22);
    const inner = innerDoorNearPlayer();
    if (inner && (!n || inner.facing || inner.dist <= Math.hypot(n.px - player.x, n.py - player.y))) return useInnerDoor(inner);   // menghadap pintu = pintu menang atas NPC yang kebetulan lewat
    if (n) return talk(n);
    const door = doorNearPlayer();
    if (door && useDoor(door)) return;
    if (state.map === "home") {
      const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[player.dir];
      const ti = Math.floor((player.x + d[0] * 12) / TS), tj = Math.floor((player.y - 4 + d[1] * 12) / TS);
      const row = maps.home.t[tj], tp = row && row[ti];
      if (tp === BED) return sleep();
      const room = World.roomName("home", ti * TS + 8, tj * TS + 8);
      if (tp === T.WARDROBE && room === "Kamar Marco") {
        // Quest pertama membuka kostum seragam. Setelahnya lemari bisa dipakai untuk berganti outfit.
        if (done("baju") && state.q.flags.marcoUniformUnlocked) {
          state.q.flags.marcoUniform = !state.q.flags.marcoUniform;
          Sound.beep(620, 0.08);
          return openDialog([{ w: "Marco", m: "calm", t: state.q.flags.marcoUniform
            ? "Gue pakai seragam sekolah lagi. Kemeja, dasi, dan celana abu-abu sudah rapi."
            : "Gue ganti ke baju putih biasa yang biasa gue pakai di rumah. Seragamnya gue simpan lagi di lemari." }], null);
        }
        return routineStep("baju");
      }
      if ((tp === T.SINK || tp === T.TUB) && room === "Kamar Mandi") return routineStep(isEvening() ? "gigi" : "mandi");
      if ((tp === T.TABLE || tp === T.FRIDGE || tp === T.KITCHEN) && room === "Dapur") {
        if (isEvening()) return routineStep("makan");
        if (done("sarapan") && !done("bekal")) return routineStep("bekal");
        return routineStep("sarapan");
      }
    }
    // Rumah warga dapat dijelajahi dan perabotnya bisa diperiksa dengan tombol E.
    if (maps[state.map] && maps[state.map].houseMeta) {
      const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[player.dir];
      const ti = Math.floor((player.x + d[0] * 12) / TS), tj = Math.floor((player.y - 4 + d[1] * 12) / TS);
      const row = maps[state.map].t[tj], tp = row && row[ti];
      const room = World.roomName(state.map, ti * TS + 8, tj * TS + 8);
      const details = {
        [T.BED]: "Tempat tidur yang tertata rapi. Rumah ini terasa tenang.",
        [T.DESK]: "Meja kecil dengan buku dan barang-barang pribadi pemilik rumah.",
        [T.WARDROBE]: "Lemari kayu yang menyimpan pakaian keluarga ini.",
        [T.TV]: "Televisi tua yang menjadi hiburan keluarga saat malam.",
        [T.SOFA]: "Sofa empuk di ruang tamu. Bantalnya sedikit tidak beraturan.",
        [T.SHELF]: "Rak berisi buku, foto keluarga, dan beberapa benda kenangan.",
        [T.KITCHEN]: "Area memasak yang masih menyisakan aroma masakan rumahan.",
        [T.FRIDGE]: "Kulkas keluarga. Ada magnet dan catatan kecil menempel di pintunya.",
        [T.TABLE]: "Meja makan sederhana. Sepertinya keluarga ini sering berkumpul di sini.",
        [T.TOILET]: "Kamar mandi kecil yang bersih.",
        [T.SINK]: "Wastafel dengan cermin kecil di atasnya.",
        [T.PLANT]: "Tanaman hias yang dirawat dengan telaten."
      };
      if (details[tp]) return openDialog([{ w: "Marco", m: "calm", t: details[tp] }], null);
      if (room) return openDialog([{ w: "Marco", m: "calm", t: "Ini " + room.toLowerCase() + ". Rumah ini punya suasana yang berbeda dari rumah Nenek." }], null);
    }
  }

  // ---------- rutinitas harian ----------
  // Pagi: mandi, ganti seragam, sarapan, pamit ke Nenek, lalu berangkat. Malam: makan, sikat gigi, tidur.
  const T = World.T;
  const MORNING = [
    "Pagi lagi. Mandi dulu, baru ganti baju dan sarapan.",
    "Kemarin cepat banget lewatnya. Siap-siap ke sekolah, Marco.",
    "Satu hari lagi. Jangan telat, jangan bikin Nenek khawatir.",
    "Bangun, mandi, makan. Kayak biasa."
  ];
  const isEvening = () => clockPhase() >= 13 / 24; // 18.00
  const done = (k) => state.r.includes(k);
  const morningReady = () => ["mandi", "baju", "sarapan", "bekal", "goodbye"].every(done) && state.talked.includes("nenek");
  function routineStep(k) {
    const M = (t, m) => openDialog([{ w: "Marco", m: m || "calm", t }], null);
    if (done(k)) return M({ mandi: "Sudah mandi. Segar.", baju: "Seragam sudah rapi.", sarapan: "Perutku sudah penuh.", makan: "Sudah makan malam.", gigi: "Gigi sudah bersih." }[k]);
    if (k === "baju" && !done("mandi")) return M("Mandi dulu, baru ganti baju. Masa pakai seragam bersih ke badan yang belum mandi.");
    if (k === "sarapan" && !done("baju")) return M("Sarapan sambil masih berantakan begini? Ganti seragam dulu.");
    if (k === "bekal" && !done("sarapan")) return M("Sarapan dulu. Nenek sudah menyiapkan bekal setelah itu.");
    if (k === "makan" && !isEvening()) return M("Belum waktunya makan malam. Hari masih panjang.");
    if (k === "gigi" && !done("makan")) return M("Makan malam dulu, baru sikat gigi.");
    const say = {
      mandi: "Airnya dingin banget pagi-pagi. Tapi lumayan, ngantuknya hilang.",
      baju: "Kemeja putih, dasi, topi. Rapi. Nenek pasti senang melihatnya.",
      sarapan: "Nasi hangat dan telur dadar buatan Nenek. Selalu enak.",
      bekal: "Aku mengambil kotak bekal yang Nenek siapkan dan memasukkannya ke tas. Ada nasi, telur, dan sedikit buah. Nanti bisa dimakan saat istirahat.",
      makan: "Makan malam bareng Nenek, sederhana tapi hangat.",
      gigi: "Sikat gigi, cuci muka. Tinggal tidur."
    }[k];
    state.r.push(k);
    if (k === "baju") {
      state.s.d += 1;
      state.q.flags.marcoUniformUnlocked = true;
      state.q.flags.marcoUniform = true;
    }
    if (k === "sarapan" || k === "makan") state.s.n += 1;
    if (k === "bekal") state.s.n += 1;
    Sound.beep(520, 0.08);
    if (k === "sarapan") return openDialog([
      { w: "Nenek", p: "nenek", m: "warm", t: "Duduk dulu, Marco. Nenek temani sarapan. Hari masih pagi, jangan terburu-buru. Bekalmu juga sudah Nenek siapkan di dapur." },
      { w: "Marco", m: "warm", t: "Makasih, Nek. Masakan Nenek selalu bikin aku semangat. Habis ini aku ambil bekal, lalu pamit sebelum berangkat sama Evelyn." }
    ], null, npcs.find((o) => o.id === "nenek"));
    if (k === "bekal") return openDialog([
      { w: "Nenek", p: "nenek", m: "warm", t: "Ini bekalmu, Marco. Nenek masukkan nasi, telur, dan buah kesukaanmu. Jangan lupa dimakan waktu istirahat, ya." },
      { w: "Marco", m: "warm", t: "Makasih banyak, Nek. Marco simpan baik-baik. Nanti pulang Marco ceritain hari ini." }
    ], null, npcs.find((o) => o.id === "nenek"));
    M(say, k === "gigi" ? "calm" : "warm");
  }
  // Keluar rumah di pagi hari sebelum siap ditahan dulu.
  function exitBlocked() {
    if (state.map !== "home" || isEvening() || morningReady()) return false;
    const left = !done("mandi") ? "mandi" : !done("baju") ? "ganti seragam" : !done("sarapan") ? "sarapan" : !done("bekal") ? "mengambil bekal" : "pamit ke Nenek";
    openDialog([{ w: "Marco", m: "calm", t: "Tunggu, belum siap. Aku belum " + left + "." }], null);
    return true;
  }
  function togglePause(v) {
    if (dlg) return;
    paused = v === undefined ? !paused : v;
    if (window.TLSAudio) TLSAudio.pause(paused);
    $("pause").hidden = !paused;
    if (paused) $("pResume").focus({ preventScroll: true });   // Tab / Enter langsung bisa dipakai di menu jeda
  }
  function saveNow() { hooks.save(snapshot()); flash("Progres tersimpan"); togglePause(false); }
  function autosave() { if (running && state && hooks) hooks.save(snapshot()); }
  function quit(silent) {
    if (!silent) autosave();
    running = false; Sound.stop(); dlg = null; paused = false;
    $("dialog").hidden = true; $("pause").hidden = true;
    hooks.exit();
  }

  // ---------- tutorial "???" ----------
  // Hanya untuk game pertama di akun baru (diminta lewat hooks.tutorial dari app.js). Progres langkah ada di state.tut
  // ({ step } selagi berjalan, { done: true } setelah selesai) sehingga ikut tersimpan di slot dan bisa dilanjutkan.
  // Tiap langkah: say = dialog "???", obj = teks quest di HUD, test = syarat selesai, auto = selesai begitu dialog habis,
  // focus = kotak HUD yang disorot. Langkah yang syaratnya sudah terpenuhi sebelum dijelaskan dilewati.
  const IS_TOUCH = document.documentElement.classList.contains("is-touch");
  const TUT_STEPS = [
    { id: "welcome", auto: true, say: [
      "Akhirnya kamu bangun juga, Marco. Tenang, aku bukan musuhmu. Namaku belum perlu kamu tahu. Panggil saja aku ???.",
      "Sebelum melangkah keluar, izinkan aku mengajarimu cara menjalani hari-harimu. Tekan Enter atau Spasi untuk melanjutkan dialog seperti ini.",
      "Kadang kamu akan diberi pilihan jawaban. Tekan 1, 2, atau 3 untuk memilih. Hati-hati, setiap pilihan menentukan ke mana ceritamu bergerak."] },
    { id: "move", obj: IS_TOUCH ? "Berjalan dengan tombol panah di layar" : "Berjalan dengan W A S D atau tombol panah",
      say: [IS_TOUCH ? "Mulai dari yang paling dasar. Tahan tombol panah di kiri bawah layar untuk menggerakkan Marco, geser jempolmu untuk berbelok. Coba berjalan sebentar di kamarmu."
                     : "Mulai dari yang paling dasar. Gerakkan Marco dengan W A S D atau tombol panah. Coba berjalan sebentar di kamarmu."],
      test: () => tutWalk >= 48 },
    { id: "run", obj: IS_TOUCH ? "Tahan tombol Lari sambil berjalan" : "Tahan Shift sambil berjalan untuk berlari", say: [
      IS_TOUCH ? "Bagus. Sekarang tahan tombol Lari di kanan sambil berjalan untuk berlari. Lebih cepat, tapi lebih melelahkan, jadi jangan berlebihan."
      : "Bagus. Sekarang tahan Shift sambil berjalan untuk berlari. Lebih cepat, tapi lebih melelahkan, jadi jangan berlebihan."],
      test: () => tutRun >= 40 },
    { id: "quest", auto: true, focus: "quest", say: [
      "Lihat pojok kanan atas layar. Kotak yang menyala itu adalah quest aktifmu. Ia selalu memberi tahu apa yang harus kamu lakukan sekarang.",
      "Panah kuning kecil di dekat Marco menunjuk ke tujuan quest. Saat tujuannya terlihat, ada ikon di atasnya yang menandai tempat kamu harus menekan E."] },
    { id: "clock", auto: true, focus: "date", say: [
      "Sekarang lihat pojok kiri atas. Di sana ada tanggal dan jam. Hari dimulai pukul 05.00 dan sekolah mulai pukul 06.00, jadi waktumu tidak banyak."] },
    { id: "mandi", obj: "Mandi di kamar mandi (tekan E)", test: () => done("mandi"), say: [
      "Tugas pertama setiap pagi: mandi. Kamar mandi ada di sisi kanan atas rumah. Ikuti panah kuning, lalu berdiri dekat wastafel atau bak mandi dan tekan E.",
      "Setiap ruangan dipisahkan pintu yang tertutup. Berdirilah tepat di depan pintu lalu tekan E untuk membukanya dan melangkah ke ruangan di seberang."] },
    { id: "baju", obj: "Ganti seragam di lemari kamar Marco", test: () => done("baju"), say: [
      "Segar? Sekarang ganti seragam. Lemarimu ada di kamar tempat kamu bangun tadi, di ujung kanan. Hadapi lemarinya dan tekan E.",
      "Setelah ini lemari yang sama bisa dipakai untuk berganti baju kapan saja."] },
    { id: "sarapan", obj: "Sarapan di dapur (tekan E)", test: () => done("sarapan"), say: [
      "Nenek sudah menunggu di dapur, di sisi kanan bawah rumah. Dekati meja makan, kompor, atau kulkas lalu tekan E untuk sarapan."] },
    { id: "bekal", obj: "Ambil bekal di dapur (tekan E)", test: () => done("bekal"), say: [
      "Nenek juga menyiapkan bekal untukmu. Tekan E sekali lagi di dapur untuk mengambilnya."] },
    { id: "nenek", obj: "Pamit kepada Nenek (tekan E)", test: () => done("goodbye"), say: [
      "Terakhir, berpamitlah pada Nenek. Dekati orangnya lalu tekan E untuk bicara. Semua orang di dunia ini punya cerita, jadi jangan ragu mengobrol dengan mereka."] },
    { id: "tips", auto: true, say: [
      "Beberapa hal lagi. Di luar rumah, tekan M untuk membuka peta wilayah. Tekan Esc untuk membuka menu jeda, tempatmu menyimpan progres.",
      "Kamu boleh tidur di kasurmu kapan saja, tapi tidur terlalu larut membuat besok sulit bangun dan sulit fokus. Gerbang sekolah tutup pukul 06.30, jangan sampai terlambat."] },
    { id: "exit", obj: "Keluar lewat pintu depan (tekan E)", say: [
      "Kamu sudah siap. Pintu depan ada di bagian bawah rumah, di ruang tengah. Dekati lalu tekan E untuk keluar. Evelyn pasti sudah menunggu di depan rumah."] }
  ];
  let tutShown = false, tutPos = null, tutWalk = 0, tutRun = 0;
  const tutActive = () => !!(state && state.tut && !state.tut.done);
  const tutStep = () => (tutActive() ? TUT_STEPS[state.tut.step] || null : null);
  function tutReset() { tutShown = false; tutPos = null; tutWalk = 0; tutRun = 0; }
  function tutNext() { state.tut.step = Math.min(state.tut.step + 1, TUT_STEPS.length - 1); tutReset(); }
  function tutUpdate() {
    if (!tutActive() || dlg || enc || inCutscene) return;
    const s = tutStep();
    if (!s) { state.tut = { done: true }; return; }
    if (!tutShown) {
      tutShown = true;
      if (s.test && s.test()) return tutNext();   // sudah dikerjakan sebelum sempat dijelaskan
      openDialog(s.say.map((t) => ({ w: "???", p: "mystery", t })), () => { if (s.auto) tutNext(); });
      return;
    }
    if (tutPos) {
      const d = Math.hypot(player.x - tutPos.x, player.y - tutPos.y);
      if (d < 12) { tutWalk += d; if (player.run) tutRun += d; }
    }
    tutPos = { x: player.x, y: player.y };
    if (s.test && s.test()) tutNext();
  }

  // ---------- input ----------
  addEventListener("keydown", (e) => {
    if (!running || inCutscene) return;
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (k === "escape") togglePause();
    else if (paused) return;
    else if (k === "e") interact();
    else if (k === "m" && state.map === "world" && !dlg) { mapOpen = !mapOpen; }
    else if (k === "enter" || k === " ") { e.preventDefault(); advance(); }
    else if (dlg && "123".includes(k)) choose(+k - 1);
  });
  addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
  addEventListener("blur", () => { keys = {}; });

  // ---------- Life Happens: kejadian dunia yang membuat hari Marco terasa hidup ----------
  // Event dipicu sekali per hari, disimpan dalam quest flags, dan berubah sesuai jalur/relasi pemain.
  function triggerLifeEvent() {
    if (dlg || state.done || !state.q) return false;
    const f = state.q.flags, day = state.day, p = clockPhase();
    const due = (key, minPhase = 10 / 24) => !f[key] && p >= minPhase && p < 17 / 24 && (state.map === "world" || state.map === "home");
    const run = (key, node) => { f[key] = true; state.q.lifeEvents = (state.q.lifeEvents || 0) + 1; openDialog([node], null); return true; };

    if (day === 4 && due("life_rain")) {
      const close = state.s.e >= 4;
      return run("life_rain", { w: "Marco", m: "calm", t: "Langit yang sejak siang mendung akhirnya menumpahkan hujan. Di depan toko, Evelyn berdiri sambil memeluk tasnya. Ia cuma membawa satu payung kecil.", c: [
        { t: "Pulang bareng. Payungnya kita bagi dua.", fx: { e: 3, n: 1 }, q: { flag: "rainShared", inc: { evelynTrust: 1 } }, r: close ? "Evelyn tertawa kecil. 'Kamu masih ingat cara jalan pelan-pelan biar kita gak kehujanan?'" : "Evelyn tersenyum canggung. Kalian berjalan berdampingan, sesekali bahu kalian terkena rintik hujan." },
        { t: "Aku harus mampir ke warung dulu. Hati-hati, ya.", fx: { u: 1 }, q: { flag: "rainSeparate" }, r: "Evelyn mengangguk. Hujan membuat jalan kampung terasa lebih sepi dari biasanya." }
      ] });
    }
    if (day === 6 && due("life_grandma_call")) {
      return run("life_grandma_call", { w: "Nenek", p: "nenek", m: "sad", t: "Marco, kalau kamu belum jauh, bisa pulang sebentar? Nenek menemukan sesuatu di lemari lama. Tidak harus sekarang, tapi Nenek ingin kamu melihatnya.", c: [
        { t: "Aku pulang sekarang, Nek.", fx: { n: 3, e: 1 }, q: { flag: "grandmaKeepsakeSeen" }, r: "Di rumah, Nenek menunjukkan kotak kecil berisi tiket pertunjukan sekolah Marco waktu SD. 'Dulu kamu gugup sekali, tapi tetap naik panggung.'" },
        { t: "Nanti malam ya, Nek. Aku masih ada urusan.", fx: { n: -1 }, q: { flag: "grandmaKeepsakeDelayed" }, r: "'Iya, Nak. Jangan lupa makan.' Suara Nenek terdengar sedikit lebih pelan." }
      ] });
    }
    if (day === 9 && due("life_rumor")) {
      const circle = state.q.path === "circle" || state.q.bramJoined;
      return run("life_rumor", circle
        ? { w: "Wawan", m: "tense", t: "Co, ada omongan aneh di kelas. Katanya lu sekarang sering bantu Bram bikin anak lain takut. Bu Sari juga dengar. Lu mau jelasin apa?", c: [
            { t: "Gue gak mau nama gue dipakai buat nakut-nakutin orang.", fx: { d: 2, c: -2 }, q: { flag: "rumorDenied" }, r: "Wawan mengangguk. 'Kalau gitu buktiin, Co. Jangan cuma ngomong.'" },
            { t: "Biarin aja. Mereka gak perlu tahu urusan gue.", fx: { c: 3, e: -2 }, q: { flag: "rumorIgnored" }, r: "Wawan mundur selangkah. Sejak itu beberapa teman memilih tidak banyak bicara denganmu." }
          ] }
        : { w: "Sinta", m: "sad", t: "Marco, ada yang bilang kamu cuma berubah karena ingin dipuji guru. Aku gak percaya begitu saja, tapi aku ingin dengar langsung darimu.", c: [
            { t: "Aku memang belum sempurna, tapi aku sedang mencoba.", fx: { d: 2, e: 1 }, q: { flag: "rumorAnswered" }, r: "Sinta tersenyum. 'Itu sudah cukup buat mulai.'" },
            { t: "Aku gak peduli omongan orang.", fx: { d: -1 }, q: { flag: "rumorDismissed" }, r: "Sinta mengangguk, meski percakapan itu terasa menggantung." }
          ] });
    }
    if (day === 11 && due("life_blackout", 15 / 24)) {
      return run("life_blackout", { w: "Marco", m: "sad", t: "Listrik satu kampung mendadak padam. Kipas berhenti, rumah-rumah gelap, dan suara warga mulai terdengar dari luar. Nenek menyalakan lilin di ruang tengah.", c: [
        { t: "Bantu Nenek dan cek keadaan tetangga.", fx: { n: 3, d: 1 }, q: { flag: "blackoutHelped" }, r: "Kalian membagikan lilin ke Bu Warti. Di teras, beberapa tetangga duduk bersama sambil bercerita. Malam terasa hangat meski gelap." },
        { t: "Aku keluar sebentar cari udara.", fx: { e: 1 }, q: { flag: "blackoutWalked" }, r: "Di ujung gang, Evelyn sedang membantu Bimo mencari ibunya. Kamu ikut mengantar mereka pulang." }
      ] });
    }
    if (day === 12 && f.life_blackout && due("life_blackout_after")) {
      return run("life_blackout_after", { w: "Bu Warti", m: "warm", t: "Marco, terima kasih sudah membantu semalam. Bimo masih cerita soal kalian yang keliling gang bawa lilin. Ibu punya beberapa kue lebih. Bawa pulang buat Nenek, ya.", c: [
        { t: "Terima kasih, Bu. Nenek pasti senang.", fx: { n: 2, u: 1 }, q: { flag: "blackoutThanks" }, r: "Bu Warti membungkus kue dengan kertas minyak. Hal kecil itu membuat perjalanan pulang terasa menyenangkan." },
        { t: "Wah, boleh. Buat teman-teman juga ya.", fx: { e: 1, d: 1 }, q: { flag: "blackoutShared" }, r: "Kue itu akhirnya dibagi bersama beberapa teman sepulang sekolah." }
      ] });
    }
    if (day === 16 && due("life_dimas_conflict")) {
      return run("life_dimas_conflict", { w: "Dimas", m: "sad", t: "Dimas terlihat kesal di dekat gerbang. Ia gagal masuk tim futsal dan menuduh teman-temannya sengaja menjatuhkannya. 'Gue capek selalu jadi pilihan terakhir, Co.'", c: [
        { t: "Dengerin dulu. Jangan ambil keputusan pas lagi emosi.", fx: { d: 2, e: 1 }, q: { flag: "dimasSupported" }, r: "Dimas menarik napas. Kalian duduk sebentar sampai ia lebih tenang. 'Makasih udah gak langsung ngehakimin gue.'" },
        { t: "Kalau gak cocok, cari kegiatan lain aja.", fx: { d: 1 }, q: { flag: "dimasRedirected" }, r: "Dimas mengangguk pelan. Saran itu sederhana, tapi membuatnya berpikir ulang." },
        { t: "Gue lagi gak mau ikut campur.", fx: { e: -1 }, q: { flag: "dimasIgnored" }, r: "Dimas mengangkat bahu dan pergi sendiri." }
      ] });
    }
    if (day === 18 && due("life_wallet")) {
      return run("life_wallet", { w: "Marco", m: "calm", t: "Di dekat halte, kamu menemukan dompet kain tergeletak. Ada kartu perpustakaan dan foto seorang anak kecil di dalamnya. Tidak ada uang banyak, tapi jelas milik seseorang.", c: [
        { t: "Cari pemiliknya lewat Pak Darto.", fx: { d: 2, n: 1 }, q: { flag: "walletReturned" }, r: "Pak Darto mengenali dompet itu milik seorang pelanggan. Sore itu pemiliknya datang dan berterima kasih dengan mata berkaca-kaca." },
        { t: "Titipkan ke pos keamanan sekolah.", fx: { d: 1 }, q: { flag: "walletSecurity" }, r: "Petugas mencatat barang temuan itu. Setidaknya dompetnya punya peluang kembali ke pemilik." },
        { t: "Lewati saja. Bukan urusanku.", fx: { d: -1 }, q: { flag: "walletIgnored" }, r: "Kamu melanjutkan langkah, tapi foto kecil itu terus terbayang." }
      ] });
    }
    if (day === 19 && (f.walletReturned || f.walletSecurity) && due("life_wallet_thanks")) {
      return run("life_wallet_thanks", { w: "Pak Darto", m: "bright", t: "Marco! Pemilik dompet kemarin datang. Katanya kartu perpustakaan itu satu-satunya kenangan dari kakaknya. Dia titip salam dan terima kasih buat kamu.", c: [ { t: "Syukurlah dompetnya kembali.", fx: { n: 1, d: 1 }, q: { flag: "walletThanks" }, r: "Pak Darto tersenyum. 'Hal kecil begini kadang berarti besar buat orang lain.'" } ] });
    }
    if (day === 22 && due("life_village_fair")) {
      return run("life_village_fair", { w: "Nenek", p: "nenek", m: "warm", t: "Akhir pekan ini kampung mengadakan pasar malam kecil untuk mengumpulkan dana perpustakaan. Nenek ingin membuka lapak kue, tapi persiapannya banyak. Evelyn juga menawarkan bantuan.", c: [
        { t: "Bantu Nenek menyiapkan lapak.", fx: { n: 3, u: 2, d: 1 }, q: { flag: "fairGrandma" }, r: "Kalian menata kue sampai senja. Nenek terlihat bangga melihatmu menyapa pelanggan satu per satu." },
        { t: "Ajak Evelyn mengurus dekorasi dan acara.", fx: { e: 3, d: 1 }, q: { flag: "fairEvelyn", inc: { evelynTrust: 1 } }, r: "Evelyn tertawa saat lampu hias tersangkut di rambutnya. Untuk beberapa jam, semua masalah terasa jauh." },
        { t: "Ikut Rafi. Katanya ada cara cepat cari uang di sana.", fx: { c: 3, u: 2, e: -1 }, q: { flag: "fairRafi" }, r: "Rafi mengajakmu pergi sebelum acara dimulai. Kamu mendapat uang, tetapi melewatkan malam bersama warga." }
      ] });
    }
    if (day === 23 && (f.fairGrandma || f.fairEvelyn || f.fairRafi) && due("life_fair_aftermath")) {
      const helped = f.fairGrandma || f.fairEvelyn;
      return run("life_fair_aftermath", { w: helped ? "Evelyn" : "Nenek", m: helped ? "bright" : "sad", t: helped ? "Foto pasar malam kemarin dipasang di papan pengumuman kampung. Kamu dan Evelyn terlihat sedang tertawa di belakang lapak. 'Kayaknya kita harus lebih sering bikin hari biasa jadi kenangan,' katanya." : "Nenek menyimpan satu kue yang tidak terjual. 'Sayang kamu tidak sempat datang, Nak. Tapi tidak apa-apa. Semoga urusanmu kemarin lancar.'", fx: helped ? { e: 1, n: 1 } : { n: -1 }, q: { flag: "fairAftermath" } });
    }
    if (day === 24 && due("life_old_letter", 13 / 24)) {
      return run("life_old_letter", { w: "Nenek", p: "nenek", m: "sad", t: "Nenek memanggilmu ke kamar. Dari dalam buku lama, beliau mengeluarkan surat yang sudah menguning. Itu tulisan orang tua Marco, ditujukan untukmu sebelum kamu masuk SMA.", c: [
        { t: "Bacakan surat itu bersamaku, Nek.", fx: { n: 4, d: 1 }, q: { flag: "letterRead" }, r: "Surat itu berisi pesan sederhana: jangan merasa harus menjadi orang lain agar diterima. 'Kami bangga kalau kamu tumbuh jadi dirimu sendiri.' Nenek menyimpan surat itu karena ingin memberikannya saat kamu siap." },
        { t: "Aku belum siap membacanya. Simpan dulu, Nek.", fx: { n: 1 }, q: { flag: "letterSaved" }, r: "Nenek mengangguk dan menyimpan surat itu kembali. 'Kapan pun kamu siap, kita baca bersama.'" }
      ] });
    }
    if (day === 25 && due("life_grandma_reveal", 13 / 24)) {
      return run("life_grandma_reveal", { w: "Nenek", p: "nenek", m: "sad", t: "Nenek meletakkan buku tabungan kecil di meja. Selama bertahun-tahun beliau menyisihkan sedikit uang dari hasil jualan kue. Jumlahnya belum cukup untuk semua impian, tapi cukup membantu biaya pendaftaran setelah lulus.", c: [
        { t: "Nek, uang ini kita pakai untuk kebutuhan Nenek dulu.", fx: { n: 4, d: 2 }, q: { flag: "grandmaFundForHer" }, r: "Nenek tersenyum. 'Nenek sehat, Nak. Melihat kamu punya pilihan hidup yang lebih luas itu juga kebutuhan Nenek.'" },
        { t: "Aku akan belajar sungguh-sungguh supaya pengorbanan Nenek gak sia-sia.", fx: { n: 3, d: 3 }, q: { flag: "grandmaFundPromise" }, r: "Nenek menggenggam tanganmu. Malam itu kalian duduk lama, membicarakan hal-hal kecil yang ingin dilakukan setelah kelulusan." },
        { t: "Aku ingin menentukan masa depanku sendiri, Nek.", fx: { n: 1, d: 1 }, q: { flag: "grandmaFundIndependent" }, r: "Nenek mengangguk. 'Itu memang hidupmu, Nak. Nenek hanya ingin kamu tahu bahwa kamu tidak sendirian.'" }
      ] });
    }
    return false;
  }

  // ---------- update ----------
  function update(dt) {
    t += dt;
    updateDialog(dt);
    if (window.TLSAudio) {
      let scene = state.map === "home" ? "home" : state.map === "world" ? "village" : state.map === "canteen" ? "canteen" : state.map === "backyard" ? "backyard" : ["class", "lt2", "lt3", "gym"].includes(state.map) ? "school" : "home";
      if (dlg && dlg.nodes && dlg.nodes[dlg.i]) { const mood = dlg.nodes[dlg.i].m; if (mood === "tense") scene = "tense"; else if (mood === "sad") scene = "sad"; else if (mood === "warm" || mood === "bright") scene = "warm"; }
      TLSAudio.setScene(scene);
      if (player && player.walk && Math.random() < dt * 2.2) TLSAudio.sfx("step");
      if (clockPhase() >= 1 / 24 && clockPhase() < 1.08 / 24 && state.q.flags.audioBellDay !== state.day) { state.q.flags.audioBellDay = state.day; TLSAudio.sfx("bell"); }
      if (dlg && dlg.nodes && dlg.nodes[dlg.i] && dlg.nodes[dlg.i].m === "tense" && !state.q.flags.audioTenseCue) { state.q.flags.audioTenseCue = true; TLSAudio.sfx("alert"); }
      if (!dlg) state.q.flags.audioTenseCue = false;
    }
    if (paused || inCutscene) return;
    if (!dlg) state.clock += dt;
    activateAngkotQuest();
    tutUpdate();
    // Jam istirahat sekitar 09.30: Evelyn mengajak Marco ke kantin.
    // Jika ditolak, Rafi dan Bram menawarkan jalan pintas yang berisiko ke halaman belakang.
    const middayFlags = state.q.flags;
    if (!dlg && (state.map === "class" || state.map === "canteen") && done("attend") &&
        clockPhase() >= 4.5 / 24 && clockPhase() < 5.5 / 24 &&
        middayFlags.middayChoiceDay !== state.day) {
      middayFlags.middayChoiceDay = state.day;
      openDialog([{ w: "Evelyn", p: "evelyn", m: "bright",
        t: "Marco! Bel istirahat. Aku mau ke kantin. Temenin, yuk? Kita bisa makan bareng sebentar sebelum pelajaran berikutnya.",
        c: [
          { t: "Boleh. Aku juga belum makan. Ayo ke kantin.", fx: { e: 3, d: 1 }, q: { flag: "evelynCanteenAccepted", set: { path: "school" }, inc: { evelynTrust: 1 } }, r: 'Evelyn terlihat senang. "Aku sudah simpan tempat duduk buat kita."' },
          { t: "Maaf, aku mau sendiri dulu.", fx: { e: -2, c: 1 }, q: { flag: "evelynCanteenDeclined", set: { path: "drift" } }, r: 'Evelyn menunduk sebentar. "Oh... kalau begitu, hati-hati ya."' }
        ] }], () => {
          if (middayFlags.evelynCanteenAccepted) {
            middayFlags.evelynStudyRoute = true;
            flash("Evelyn mengajak Marco makan di kantin");
            enter("canteen", 14 * TS + 8, 14 * TS + 14);
          } else if (middayFlags.evelynCanteenDeclined) {
            openDialog([{ w: "Rafi", p: "rafi", m: "tense", t: "Marco! Kalau gak mau ikut Evelyn, ikut kami aja. Bram, Galih, dan gue mau ke halaman belakang. Bram mau ngajak lu merokok. Gak usah sok jadi anak teladan terus.",
              c: [
                { t: "Oke, gue ikut ke belakang.", fx: { c: 3, d: -2, e: -1 }, q: { flag: "yardInviteAccepted" }, r: 'Bram menyeringai. "Nah, gitu dong. Kita cuma mau nongkrong sebentar."' },
                { t: "Gak. Gue tetap di sekolah dan balik ke kelas.", fx: { d: 2, c: -2, e: 1 }, q: { flag: "yardInviteRejected", set: { path: "school" } }, r: 'Rafi mendecakkan lidah. "Terserah lu. Jangan bilang kami gak pernah ngajak."' }
              ] }], () => {
                if (middayFlags.yardInviteAccepted) {
                  enter("backyard", 12 * TS + 8, 13 * TS + 14);
                  if (Math.random() < 0.72) {
                    openDialog([
                      { w: "Bram", p: "bram", m: "tense", t: "Santai aja, Marco. Kita cuma mau nongkrong. Gue bawa rokok—" },
                      { w: "Pak Satpam", m: "tense", t: "Berhenti! Kalian pikir area belakang ini tidak diawasi? Saya melihat kalian meninggalkan kelas dan mendengar ajakan tadi. Belum sempat kalian melakukan apa pun, saya sudah datang." },
                      { w: "Marco", m: "sad", t: "Pak... saya ikut mereka. Saya tahu seharusnya saya tetap di kelas." },
                      { w: "Pak Satpam", m: "tense", t: "Kalian kembali ke kelas sekarang. Saya akan bicara dengan wali kelas setelah pelajaran selesai." }
                    ], () => {
                      if (!middayFlags.yardConsequenceApplied) { middayFlags.yardConsequenceApplied = true; state.s.d -= 3; state.s.c += 1; flash("Ketahuan Pak Satpam — disiplin Marco berkurang"); }
                      enter("class", (World.school.width - 2) * TS + 8, World.school.yardY * TS + 14);
                    });
                  } else {
                    openDialog([{ w: "Bram", p: "bram", m: "tense", t: "Kita aman untuk sekarang. Tapi gue gak nyangka lu bakal ikut. Rokoknya ada, tapi lu masih bisa berubah pikiran, Marco.",
                      c: [
                        { t: "Gue berubah pikiran. Gue balik ke kelas.", fx: { d: 2, c: -2 }, q: { flag: "yardBackedOut" }, r: "Bram mengangkat bahu. Kamu meninggalkan halaman belakang sebelum masalah bertambah." },
                        { t: "Gue cuma mau nongkrong sebentar.", fx: { c: 2, d: -1 }, q: { flag: "yardHungOut" }, r: "Galih tertawa kecil. Waktu istirahat hampir habis, dan kamu tahu kamu harus segera kembali." }
                      ] }]);
                  }
                }
              });
          }
        });
    }
    // Tidak ada batas tidur paksa: waktu terus berjalan sampai pemain memilih tidur.
    if (!dlg) setMood();
    // Bel pulang pukul 15.00. Marco otomatis meninggalkan gedung sekolah dan memasuki babak sepulang sekolah.
    if (!dlg && !state.r.includes("afterschool") && clockPhase() >= 10 / 24) {
      state.r.push("afterschool");
      if (state.map === "class" || state.map === "lt2" || state.map === "lt3" || state.map === "gym" || state.map === "canteen" || state.map === "backyard") {
        enter("world", 114 * TS + 8, 18 * TS + 14);
        const ev = npcs.find((o) => o.id === "evelyn");
      }
      if (!done("attend")) {
        state.q.absences = (state.q.absences || 0) + 1;
        state.q.attendanceStreak = 0;
      } else state.q.attendanceStreak = (state.q.attendanceStreak || 0) + 1;
      const milestone = {};
      if (state.day === 3) {
        if (state.q.attendance >= 2 && state.q.gangChoices < 2) {
          state.q.path = "school";
          milestone[3] = { w: "Bu Sari", m: "warm", t: "Dua hari terakhir kamu hadir dan mulai mengambil tanggung jawab. Ibu ingin menawarkan proyek akhir semester. Tapi keputusanmu setelah bel pulang tetap milikmu.", c: [
            { t: "Fokus pada proyek kelas dan persiapan ujian.", fx: { d: 3, n: 1, c: -1 }, q: { flag: "schoolRouteChosen", set: { path: "school" } }, r: "Bu Sari mengangguk. Besok kamu bisa mulai mengumpulkan bahan bersama teman-teman." },
            { t: "Luangkan waktu bersama Evelyn dan Nenek.", fx: { e: 2, n: 2, d: 1 }, q: { flag: "familyRouteChosen", set: { path: "school" } }, r: "Evelyn tersenyum. " + '"Kita gak harus selalu buru-buru. Yang penting jangan saling menghilang."' },
            { t: "Cari Rafi. Gue penasaran sama tawarannya.", fx: { c: 3, d: -2, e: -1 }, q: { flag: "gangRouteOpened", set: { path: "drift" } }, r: "Dari ujung jalan, Rafi mengangkat tangan memanggilmu." }
          ] };
        } else if (state.q.absences > 0 || state.q.gangChoices >= 2) {
          state.q.path = "circle";
          milestone[3] = { w: "Rafi", m: "tense", t: "Kamu mulai sering melewatkan kelas. Rafi menganggap itu tanda kalau kamu siap masuk ke lingkaran Bram. Tapi masih ada kesempatan untuk menentukan batasmu.", c: [
            { t: "Ikut Rafi menemui Bram.", fx: { c: 4, d: -2, e: -2 }, q: { flag: "gangRouteOpened", set: { path: "circle", gangInvited: true } }, r: "Rafi tersenyum. " + '"Gue tau lu bakal ngerti. Besok kita ketemu Bram."' },
            { t: "Gue memang bolos, tapi bukan berarti gue ikut kalian.", fx: { c: -2, d: 2, n: 1 }, q: { flag: "gangRouteRejected", set: { path: "drift", gangRejected: true } }, r: "Rafi kehilangan senyumnya. " + '"Oke. Tapi jangan datang kalau butuh bantuan nanti."' }
          ] };
        } else {
          state.q.path = "drift";
          milestone[3] = { w: "Marco", m: "sad", t: "Tiga hari berlalu dan kamu belum benar-benar menentukan arah. Sekolah terasa jauh, tapi circle Rafi juga belum tentu tempat yang tepat. Besok pilihanmu akan mulai punya konsekuensi." };
        }
      }
      if (state.day === 8) milestone[8] = state.q.path === "circle"
        ? { w: "Bram", m: "tense", t: "Bram mengajakmu ikut mengurus sesuatu sepulang sekolah. Ia bilang ini kesempatan membuktikan kesetiaanmu. Evelyn sudah mulai menjaga jarak.", c: [
            { t: "Gue ikut. Gue mau dipercaya.", fx: { c: 5, d: -3, e: -2 }, q: { set: { gangInvited: true } }, r: "Bram mengangguk. " + '"Bagus. Jangan banyak tanya."' },
            { t: "Gue gak mau ninggalin hidup gue demi kalian.", fx: { c: -3, d: 2, n: 1 }, q: { flag: "gangDoubt", set: { gangExitAttempt: true } }, r: "Bram menatapmu dingin. " + '"Lu pikir bisa keluar begitu aja?"' }
          ] }
        : { w: "Sinta", m: "bright", t: "Proyek kelas mulai terlihat hasilnya. Teman-teman mengajakmu ikut menyiapkan pameran dan belajar untuk ujian.", c: [
            { t: "Ambil tanggung jawab menyelesaikan proyek.", fx: { d: 3, e: 1 }, q: { flag: "classProjectCommitted" }, r: "Sinta tersenyum. " + '"Aku tahu kamu bisa diandalkan."' },
            { t: "Bantu sebisanya, tapi tetap luangkan waktu untuk Nenek.", fx: { n: 2, d: 1 }, r: "Kamu membagi waktu dengan lebih baik." }
          ] };
      if (state.day === 14) milestone[14] = state.q.path === "circle"
        ? { w: "Arga", m: "tense", t: "Ujian akhir dimulai besok. Arga meminta kamu memilih: tetap bersama circle dan membuktikan loyalitas, atau kembali ke sekolah dan menerima akibat dari keputusanmu.", c: [
            { t: "Tetap bersama Bram. Sekolah bukan prioritas gue.", fx: { c: 6, d: -4 }, q: { flag: "circleCommitment", set: { bramJoined: true } }, r: "Arga mengangguk. Jalan pulang terasa lebih sepi dari biasanya." },
            { t: "Gue mau berhenti. Gue akan hadapi sekolah.", fx: { c: -4, d: 3, n: 1 }, q: { flag: "circleTurnedAway", set: { gangExitAttempt: true } }, r: "Arga tidak menahanmu. Tapi kepercayaan yang hilang tidak mudah kembali." }
          ] }
        : { w: "Bu Sari", m: "warm", t: "Ujian akhir semakin dekat. Ibu melihat perubahanmu, Marco. Sekarang buktikan lewat pilihanmu sendiri.", c: [
            { t: "Fokus belajar dan jujur saat ujian.", fx: { d: 4, c: -2 }, q: { flag: "examHonest" }, r: "Bu Sari tersenyum bangga." },
            { t: "Cari jalan pintas bersama Rafi.", fx: { c: 4, d: -3 }, q: { flag: "examCheat" }, r: "Bu Sari menghela napas kecewa." }
          ] };
      if (state.day === 20) milestone[20] = state.q.path === "circle"
        ? { w: "Nenek", m: "sad", t: "Nenek mendengar kamu semakin sering bersama Bram. Beliau tidak memarahimu. Justru itu yang membuat suasana rumah terasa berat.", c: [
            { t: "Aku akan mencoba memperbaiki semuanya, Nek.", fx: { n: 3, d: 2, c: -3 }, q: { flag: "grandmaAppeal" }, r: "Nenek menggenggam tanganmu. " + '"Pintu rumah ini selalu terbuka, Nak."' },
            { t: "Aku sudah memilih jalan sendiri.", fx: { c: 4, n: -3 }, r: "Nenek mengangguk pelan, tetapi matanya tampak sedih." }
          ] }
        : { w: "Nenek", m: "sad", t: "Nenek tidak tahu berapa lama lagi bisa menemanimu setiap pagi. Nenek hanya ingin kamu memilih jalan yang membuatmu tetap bisa menatap diri sendiri.", c: [
            { t: "Aku akan berusaha lulus dengan jujur, Nek.", fx: { n: 3, d: 3, c: -2 }, r: 'Nenek menggenggam tangan Marco. "Itu sudah lebih dari cukup."' },
            { t: "Aku ingin cepat kaya, apa pun caranya.", fx: { c: 4, u: 3, n: -2 }, r: "Nenek terdiam lama." }
          ] };
      if (state.day === 26) milestone[26] = state.q.path === "circle" || state.q.bramJoined
        ? { w: "Evelyn", m: "sad", t: "Sebentar lagi semuanya selesai. Aku masih peduli padamu, Marco, tapi aku tidak bisa membangun masa depan dengan seseorang yang terus memilih circle Bram dan meninggalkan tanggung jawabnya.", c: [
            { t: "Aku mengerti. Aku harus menerima akibat pilihanku.", fx: { e: -1, n: 1, d: 1 }, q: { flag: "evelynGoodbye" }, r: "Evelyn mengangguk. Kalian berpisah sebagai dua orang yang pernah saling mengenal baik." },
            { t: "Aku akan tetap bersama mereka.", fx: { c: 4, e: -3, d: -2 }, r: "Evelyn tidak menjawab. Ia berbalik dan berjalan pulang." }
          ] }
        : { w: "Evelyn", m: "sad", t: "Sebentar lagi semuanya selesai. Apa pun yang terjadi setelah kelulusan, aku harap kamu tidak kehilangan dirimu sendiri.", c: [
            { t: "Aku ingin masa depan yang tenang bersama orang-orang yang kusayangi.", fx: { e: 3, n: 2, d: 2, c: -1 }, q: { inc: { evelynTrust: 1 } }, r: 'Evelyn tersenyum kecil. "Aku ingin itu juga."' },
            { t: "Aku akan pergi sendiri dan mengejar uang.", fx: { u: 2, e: -1 }, r: "Evelyn mengangguk, meski tampak sedih." },
            { t: "Aku sudah terlanjur masuk terlalu jauh dengan mereka.", fx: { c: 4, e: -2, d: -2 }, q: { set: { path: "circle" } }, r: "Evelyn berharap kamu masih mau mencari jalan keluar." }
          ] };
      const beat = milestone[state.day];
      if (!done("attend")) {
        state.s.d -= 3;
        openDialog([{ w: "Marco", m: "sad", t: "Aku tidak masuk sekolah hari ini. Bu Sari pasti kecewa. Aku tidak bisa terus menghindari tanggung jawab." }], null);
      } else if (beat) openDialog([beat], null);
      else openDialog([{ w: "Marco", m: "calm", t: "Bel pulang berbunyi. Hari sekolah selesai; sekarang waktunya menentukan apa yang akan Marco lakukan setelah sekolah." }], null);
    }

    // Kejadian kehidupan berjalan terpisah dari quest utama; tidak menimpa dialog yang sedang berlangsung.
    if (!dlg) triggerLifeEvent();

    // pemain
    let dx = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0);
    let dy = (keys["s"] || keys["arrowdown"] ? 1 : 0) - (keys["w"] || keys["arrowup"] ? 1 : 0);
    player.walk = false;
    let playerStepX = 0, playerStepY = 0;
    if (!dlg && (dx || dy)) {
      const tiredSpeed = [1, 0.88, 0.72, 0.58][state.fatigue || 0];
      const sp = (keys["shift"] ? 78 : 48) * tiredSpeed * dt, len = Math.hypot(dx, dy);
      const bx = player.x, by = player.y;
      move(player, (dx / len) * sp, (dy / len) * sp);
      playerStepX = player.x - bx; playerStepY = player.y - by;
      player.dist += Math.hypot(playerStepX, playerStepY);   // fase langkah ikut jarak nyata
      player.walk = Math.hypot(playerStepX, playerStepY) > 0.01; player.run = !!keys["shift"];
      player.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    }
    // Evelyn mengikuti jejak Marco (lihat followPlayer): lewat gerbang atau gang sempit ia berjalan di belakang Marco
    // dan tidak menembus benda. Selama ia sendiri sedang diajak bicara, ia diam dulu.
    const companion = npcs.find((n) => n.id === "evelyn");
    if (companion && companion.follow && companion.map === state.map && !(dlg && dlg.who === companion)) {
      followPlayer(companion, dt, playerStepX, playerStepY);
    }
    // Pintu tidak lagi memicu perpindahan otomatis: masuk/keluar ruangan harus menekan E di dekat pintu (lihat useDoor).
    // Rombongan siswa bergerak dalam gelombang menuju pintu sekolah antara 06.00–06.25.
    // Mereka baru menjadi NPC interior setelah mencapai pintu; tidak ada spawn instan di kelas.
    const schoolP = clockPhase();
    npcs.filter((n) => n.commute && n.map === "world").forEach((n) => {
      const c = n.commute;
      if (!c.started && schoolP >= c.start && schoolP < 1.5 / 24) c.started = true;
      if (!c.started) return;
      const dx = c.targetX - n.px, dy = c.targetY - n.py, dist = Math.hypot(dx, dy);
      if (dist <= 9) {
        n.map = "class";
        const idx = Number(n.id.replace("schoolStudent", "")) - 1;
        n.px = (World.school.entranceX - 12 + (idx % 12) * 2) * TS + 8;
        n.py = (9 + Math.floor(idx / 12)) * TS + 14;
        n.hx = n.px; n.hy = n.py; n.wander = true; n.rx = 30; n.ry = 18; n.spd = 9;
        n.commute.arrived = true; n.walk = false;
        return;
      }
      const step = Math.min(dist, 30 * dt), ox = n.px, oy = n.py;
      const mx = (dx / dist) * step, my = (dy / dist) * step;
      // Jalur rombongan memakai gerak dua sumbu dan tidak berhenti karena bersenggolan dengan teman.
      if (!blocked(n.px + mx, n.py)) n.px += mx;
      if (!blocked(n.px, n.py + my)) n.py += my;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      n.walk = n.px !== ox || n.py !== oy; n.dist += Math.hypot(n.px - ox, n.py - oy);
    });

    // NPC berjalan acak (tidak keluar jangkauan, tidak masuk jalan raya, pintu, atau menabrak pemain/NPC lain)
    const here = hereNpcs();
    here.forEach((n) => {
      if (state.map === "world") settleNpc(n);
      if (n.hold) { n.walk = false; return; }
      if (n.chase) {   // geng mengepung Marco
        const dx = player.x + n.off[0] - n.px, dy = player.y + n.off[1] - n.py, d = Math.hypot(dx, dy);
        n.walk = d > 2;
        if (n.walk) {
          const st = Math.min(d, 64 * dt), ox = n.px, oy = n.py;
          if (!npcBlocked(n.px + (dx / d) * st, n.py)) n.px += (dx / d) * st;
          if (!npcBlocked(n.px, n.py + (dy / d) * st)) n.py += (dy / d) * st;
          n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
          n.dist += Math.hypot(n.px - ox, n.py - oy);
        }
        return;
      }
      if (n.leave) {   // pulang ke tempat nongkrong; kalau sudah di luar layar, langsung muncul di sana
        const dx = n.hx - n.px, dy = n.hy - n.py, d = Math.hypot(dx, dy);
        n.lt = (n.lt || 0) + dt;
        if (d < 4 || (offscreen(n.px, n.py) && offscreen(n.hx, n.hy)) || n.lt > 25) { n.px = n.hx; n.py = n.hy; n.leave = false; n.lt = 0; n.walk = false; return; }
        const st = Math.min(d, 48 * dt), ox = n.px, oy = n.py;
        if (!npcBlocked(n.px + (dx / d) * st, n.py)) n.px += (dx / d) * st;
        if (!npcBlocked(n.px, n.py + (dy / d) * st)) n.py += (dy / d) * st;
        n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
        n.walk = true; n.dist += Math.hypot(n.px - ox, n.py - oy);
        return;
      }
      // Posisi dan status berjalan Evelyn sudah disalin dari perpindahan Marco
      // pada bagian input pemain. Jangan reset n.walk di sini: itu mematikan
      // animasi kaki Evelyn tepat sebelum render dijalankan.
      if (n.follow && n.id === "evelyn") return;
      if (n.face && !n.wander && !(dlg && dlg.who === n)) n.dir = n.face;   // siswa/guru yang duduk kembali menghadap mejanya
      if (!n.wander || (dlg && dlg.who === n)) { n.walk = false; return; }
      n.wt -= dt;
      if (n.wt <= 0) {
        const r = Math.random(), v = n.spd || 14;
        n.wt = 0.8 + Math.random() * 2.2;
        n.vx = n.vy = 0;
        if (r < 0.2) n.vx = v; else if (r < 0.4) n.vx = -v; else if (r < 0.6 && n.ry > 0) n.vy = v; else if (r < 0.8 && n.ry > 0) n.vy = -v;   // sisanya berhenti sebentar
        if (n.vx) n.dir = n.vx > 0 ? "right" : "left"; else if (n.vy) n.dir = n.vy > 0 ? "down" : "up";
      }
      const ox = n.px, oy = n.py;
      const nx = n.px + n.vx * dt, ny = n.py + n.vy * dt;
      const free = (x, y) => !npcBlocked(x, y) && Math.abs(x - n.hx) <= n.rx && Math.abs(y - n.hy) <= n.ry &&
        Math.hypot(x - player.x, y - player.y) > 12 && !here.some((o) => o !== n && Math.hypot(x - o.px, y - o.py) < 11);
      if (free(nx, n.py)) n.px = nx;
      if (free(n.px, ny)) n.py = ny;
      n.walk = n.px !== ox || n.py !== oy;
      if (n.walk) n.dist += Math.hypot(n.px - ox, n.py - oy); else if (n.vx || n.vy) n.wt = Math.min(n.wt, 0.1);   // mentok: cari arah lain
    });
    // pembuly menghadang
    if (encCool > 0) encCool -= dt;
    if (enc && state.map !== "world") stopHadang(true);
    else if (enc && !dlg) {
      enc.t += dt;
      if (gang().every((n) => Math.hypot(n.px - player.x, n.py - player.y) < 30) || enc.t > 10) hadangArrive();
    } else if (!enc && !dlg && encCool <= 0 && state.map === "world" && state.day >= 3 && clockPhase() > 0.2 && clockPhase() < 0.9
      && !state.talked.includes("hadang") && ((state.day - 3) % 2 === 0 || (state.heat || 0) >= 2)) startHadang();
    // kucing, mobil
    if (state.map === "world") {
      cat.t -= dt;
      if (cat.t <= 0) { cat.t = 1 + Math.random() * 2; const r = Math.random(); cat.vx = r < .3 ? 16 : r < .6 ? -16 : 0; cat.vy = r > .8 ? 12 : r > .6 ? -12 : 0; }
      const nx = cat.x + cat.vx * dt, ny = cat.y + cat.vy * dt;
      if (maps.world.t[Math.floor(ny / TS)][Math.floor(nx / TS)] === GRASS) { cat.x = nx; cat.y = ny; }
      // Kendaraan berhenti bila ada orang (Marco atau warga) tepat di depan atau di badan kendaraan, jadi tidak menembus pejalan kaki.
      // c.v tetap utuh karena arah gambar kendaraan ditentukan tandanya.
      cars.forEach((c) => {
        const W = (World.CAR_W && World.CAR_W[c.k]) || 76, dir = c.v > 0 ? 1 : -1, front = dir > 0 ? c.x + W : c.x;
        const inLane = (x, y) => y >= c.y + 10 && y <= c.y + World.CAR_H + 2 && (x - front) * dir > -W && (x - front) * dir < 28;
        const stop = inLane(player.x, player.y) || npcs.some((n) => n.map === "world" && (!n.commute || n.commute.started) && inLane(n.px, n.py));
        if (!stop) c.x += c.v * dt;
        if (c.x > maps.world.w * TS + 40) c.x -= maps.world.w * TS + 160; if (c.x < -120) c.x += maps.world.w * TS + 160;
      });
      if (questAngkot.active) {
        if (questAngkot.phase === "school-stopped") {
          questAngkot.wait -= dt;
          if (questAngkot.wait <= 0) {
            questAngkot.phase = "school-depart";
            flash("Angkot mulai meninggalkan halte.");
          }
        } else if (questAngkot.phase === "school-depart") {
          questAngkot.x += questAngkot.v * dt;
          if (questAngkot.x > SCHOOL_STOP.x + 220) {
            questAngkot.active = false;
            questAngkot.phase = "idle";
          }
        } else if (!state.q.flags.angkotBoarded) {
          if (questAngkot.phase === "approach") {
            questAngkot.x += questAngkot.v * dt;
            if (questAngkot.x >= HOME_STOP.x) { questAngkot.x = HOME_STOP.x; questAngkot.phase = "stopped"; questAngkot.wait = 8; flash("Angkot berhenti di halte! Dekati pintunya dan tekan E."); }
          } else if (questAngkot.phase === "stopped") {
            questAngkot.wait -= dt;
            if (questAngkot.wait <= 0) { questAngkot.phase = "depart"; flash("Angkot berangkat. Tunggu angkot berikutnya."); }
          } else if (questAngkot.phase === "depart") {
            questAngkot.x += questAngkot.v * dt;
            if (questAngkot.x > SCHOOL_STOP.x + 120) { questAngkot.phase = "cooldown"; questAngkot.cooldown = 10; }
          } else if (questAngkot.phase === "cooldown") {
            questAngkot.cooldown -= dt;
            if (questAngkot.cooldown <= 0) { questAngkot.x = -130; questAngkot.phase = "approach"; }
          }
        }
      }
    }
    // nama ruangan di rumah
    const rn = World.roomName(state.map, player.x, player.y - 2);
    if (rn && rn !== curRoom) { curRoom = rn; flash(rn); } else if (!rn && state.map !== "home") curRoom = "";
    // kamera halus
    const m = maps[state.map], mw = m.w * TS, mh = m.h * TS;
    const tx = Math.max(0, Math.min(mw - VW, player.x - VW / 2)), ty = Math.min(Math.max(0, Math.min(mh - VH, player.y - VH / 2)), player.y - 40);   // turun hanya bila perlu, supaya kepala tidak terpotong di tepi atas peta
    cam.x += (tx - cam.x) * Math.min(1, dt * 6); cam.y += (ty - cam.y) * Math.min(1, dt * 6);
    if (hudTimer > 0) hudTimer -= dt;
    updateHud();
  }

  // ---------- gambar ----------
  // Karakter prosedural untuk NPC (tinggi ~32px, selevel Marco dan Nenek): kepala, badan, lengan, kaki, plus variasi
  // kulit, rambut panjang, kerudung, dan topi. scale > 1 dipakai untuk potret besar di layar dialog.
  function drawChar(x, y, o) {
    const s = o.scale || 1, walk = !!o.walk, ph = walk ? Math.floor(t * 8) % 2 : 0, bob = walk ? 0 : (Math.floor(t * 2) % 2);
    const skin = o.skin || "#f0c8a0", pants = o.pants || "#2a2a3a", shade = "rgba(0,0,0,.16)", dir = o.dir || "down";
    const R = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x + a * s), Math.round(y + b * s), w * s, h * s); };
    ctx.globalAlpha = .3; R(-6, -1, 12, 3, "#000"); ctx.globalAlpha = 1;
    // kaki & sepatu
    R(-4, -9, 3, 8 - ph, pants); R(1, -9, 3, 7 + ph, pants);
    R(-4, -1 - ph, 3, 2, "#1d1d26"); R(1, -2 + ph, 3, 2, "#1d1d26");
    // badan & lengan
    R(-5, -19 + bob, 10, 10, o.color); R(-5, -19 + bob, 10, 2, "rgba(255,255,255,.22)"); R(-5, -11 + bob, 10, 2, shade);
    R(-7, -18 + bob + ph, 2, 8, o.color); R(5, -18 + bob - ph, 2, 8, o.color);
    R(-7, -10 + bob + ph, 2, 2, skin); R(5, -10 + bob - ph, 2, 2, skin);
    // rambut / kerudung di belakang kepala
    if (o.hijab) R(-7, -31 + bob, 14, 15, o.hijab);
    else if (o.long) R(-7, -30 + bob, 14, dir === "up" ? 14 : 12, o.hair);
    // kepala
    if (!(o.hijab && dir === "up")) {
      R(-5, -29 + bob, 10, 11, skin);
      R(-5, -20 + bob, 10, 1, shade);
      if (dir === "down") { R(-3, -25 + bob, 2, 2, "#222"); R(1, -25 + bob, 2, 2, "#222"); R(-1, -21 + bob, 2, 1, "#b0705a"); }
      else if (dir === "left") { R(-4, -25 + bob, 2, 2, "#222"); R(-5, -22 + bob, 1, 1, "#b0705a"); }
      else if (dir === "right") { R(2, -25 + bob, 2, 2, "#222"); R(4, -22 + bob, 1, 1, "#b0705a"); }
    }
    if (!o.hijab && !o.bald) {
      R(-6, -32 + bob, 12, 5, o.hair); R(-6, -28 + bob, 1, 3, o.hair); R(5, -28 + bob, 1, 3, o.hair);
      if (dir === "up") R(-6, -28 + bob, 12, 9, o.hair);
    }
    if (o.hijab && dir !== "up") R(-5, -29 + bob, 10, 1, o.hijab);        // bingkai kerudung di dahi
    // Atribut staf: dasi (kepala sekolah), jas dokter dengan stetoskop, kacamata.
    if (o.tie && dir === "down") R(-1, -19 + bob, 2, 7, o.tie);
    if (o.coat && dir !== "up") {
      R(-1, -19 + bob, 2, 10, o.coat);
      if (dir === "down") { R(-3, -18 + bob, 1, 5, "#3a3a44"); R(2, -18 + bob, 1, 5, "#3a3a44"); R(-3, -13 + bob, 6, 1, "#3a3a44"); }
    }
    if (o.glasses && dir === "down") {
      [-4, 0].forEach((gx) => { R(gx, -26 + bob, 4, 1, "#2b2b33"); R(gx, -23 + bob, 4, 1, "#2b2b33"); R(gx, -25 + bob, 1, 2, "#2b2b33"); R(gx + 3, -25 + bob, 1, 2, "#2b2b33"); });
    }
    if (o.hat) { R(-7, -34 + bob, 14, 3, o.hat); R(-6, -35 + bob, 12, 1, o.hat); if (dir === "down") R(-7, -31 + bob, 14, 1, o.hat); }
  }
  function drawCat() {
    const cy = cat.y, step = Math.floor(t * 6) % 2, L = cat.vx < 0 ? -1 : 1, moving = cat.vx || cat.vy;
    ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.fillRect(cat.x - 1, cy, 12, 2);
    ctx.fillStyle = "#e08a3c"; ctx.fillRect(cat.x, cy - 6, 9, 5);
    ctx.fillStyle = "#b8661f"; ctx.fillRect(cat.x + 2, cy - 6, 1, 3); ctx.fillRect(cat.x + 5, cy - 6, 1, 3);
    const hx = cat.x + (L < 0 ? -3 : 8);
    ctx.fillStyle = "#e08a3c"; ctx.fillRect(hx, cy - 8, 4, 4); ctx.fillRect(hx, cy - 10, 1, 2); ctx.fillRect(hx + 3, cy - 10, 1, 2);
    ctx.fillStyle = "#222"; ctx.fillRect(hx + (L < 0 ? 0 : 2), cy - 7, 1, 1);
    const tx = cat.x + (L < 0 ? 9 : -3), tw = Math.round(Math.sin(t * 4));
    ctx.fillStyle = "#e08a3c"; ctx.fillRect(tx, cy - 8 + tw, 2, 4); ctx.fillRect(tx, cy - 9 + tw, 2, 1);
    ctx.fillRect(cat.x + 1, cy - 1, 2, moving ? 1 + step : 1); ctx.fillRect(cat.x + 6, cy - 1, 2, moving ? 2 - step : 1);
  }
  const WORLD_POI = [
    { name: "Rumah Marco & Nenek", x: 9, y: 12, type: "home" }, { name: "Rumah Evelyn", x: 18, y: 13, type: "home" },
    { name: "Halte Kampung", x: 12, y: 15, type: "transit" }, { name: "Warung Pak Darto", x: 10, y: 25, type: "food" },
    { name: "SMA Nusa", x: 114, y: 12, type: "school" }, { name: "Halte SMA", x: 116, y: 17, type: "transit" },
    { name: "Lapangan Kampung", x: 53, y: 115, type: "park" }, { name: "Bengkel Ujang", x: 38, y: 99, type: "shop" },
    { name: "Vila Adipraja", x: 172, y: 18, type: "home" }, { name: "Galeri Kota", x: 211, y: 18, type: "shop" },
    { name: "Taman Elit", x: 194, y: 61, type: "park" }, { name: "Pusat Kota", x: 125, y: 89, type: "place" },
    { name: "Pasar Malam", x: 172, y: 101, type: "food" }, { name: "Kedai Lentera", x: 189, y: 101, type: "food" },
    { name: "Arcade 88", x: 208, y: 101, type: "fun" }, { name: "Panggung Musik", x: 172, y: 124, type: "fun" },
    { name: "Toko Musik", x: 215, y: 124, type: "shop" }, { name: "Halte Distrik Malam", x: 202, y: 130, type: "transit" }
  ];
  function questDestination() {
    const ts = tutStep();
    if (ts && ts.id === "exit" && state.map === "home") return { map: "home", x: 11 * TS + 8, y: 13 * TS + 8, name: "Pintu depan" };
    const p = clockPhase(), f = state.q.flags, q = state.q;
    const npcTarget = (id) => { const n = npcs.find(o => o.id === id); return n ? { map: n.map, x: n.px, y: n.py, name: n.name } : null; };
    if (state.map === "home") {
      if (p >= 17/24) { if (!done("makan")) return {map:"home",x:18*TS,y:10*TS,name:"Dapur"}; if (!done("gigi")) return {map:"home",x:19*TS,y:2*TS,name:"Kamar mandi"}; return {map:"home",x:6*TS,y:2*TS,name:"Kamar Marco"}; }
      if (!done("mandi")) return {map:"home",x:19*TS,y:2*TS,name:"Kamar mandi"};
      if (!done("baju")) return {map:"home",x:7*TS,y:2*TS,name:"Lemari Marco"};
      if (!done("sarapan") || !done("bekal")) return {map:"home",x:18*TS,y:10*TS,name:"Dapur"};
      if (!done("goodbye")) return npcTarget("nenek");
      return {map:"world",x:18*TS,y:14*TS,name:"Rumah Evelyn"};
    }
    if (f.classProjectStarted && !f.classProjectDone) return npcTarget("sinta");
    if (f.dimasStarted && !f.dimasDone) return npcTarget("dimas");
    if (f.warungStarted && !f.warungDone) return npcTarget("warung");
    if (f.putriStarted && !f.putriDone) return npcTarget("putri");
    if (f.evelynMemoryStarted && !f.evelynMemoryDone) return npcTarget("evelyn");
    if (state.map === "world") {
      if (f.angkotQuestStarted && !f.angkotBoarded) return {map:"world",x:12*TS+8,y:15*TS+14,name:"Halte Kampung"};
      if (f.angkotBoarded && p < 10/24) return {map:"world",x:114*TS+8,y:12*TS+14,name:"Gerbang SMA Nusa"};
      if (p >= 17/24) return {map:"world",x:9*TS+8,y:12*TS+14,name:"Rumah Marco"};
      if (p >= 10/24) return {map:"world",x:116*TS+8,y:17*TS+14,name:"Halte SMA"};
      if (!state.talked.includes("evelyn")) return npcTarget("evelyn");
      if (p < 1/24) return {map:"world",x:12*TS+8,y:15*TS+14,name:"Halte Kampung"};
      return {map:"world",x:114*TS+8,y:12*TS+14,name:"Gerbang SMA Nusa"};
    }
    if (state.map === "class") return npcTarget("sari");
    if (state.map === "canteen") return npcTarget("yati");
    return null;
  }

  function render() {
    ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.imageSmoothingEnabled = false;
    const m = maps[state.map], ox = Math.round(m.w * TS < VW ? (VW - m.w * TS) / 2 : -cam.x), oy = Math.round(m.h * TS < VH ? (VH - m.h * TS) / 2 : -cam.y);
    const p = clockPhase(), dusk = World.dusk(p), view = { x: -ox, y: -oy, w: VW, h: VH };
    ctx.fillStyle = "#14102a"; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.translate(ox, oy);
    World.under(ctx, state.map, t, view, dusk);
    if (state.map === "world") {
      drawCat();
      // burung
      for (let b = 0; b < 3; b++) { const bx = (t * 22 + b * 130) % (maps.world.w * TS) - 20, by = 34 + b * 22 + Math.sin(t * 2 + b) * 6, f = Math.floor(t * 6 + b) % 2; ctx.fillStyle = "#222"; ctx.fillRect(bx, by, 3, 2); ctx.fillRect(bx - 3, by - f * 2, 3, 1); ctx.fillRect(bx + 3, by - f * 2, 3, 1); }
    }
    const list = hereNpcs().map((n) => ({ y: n.py, f: () => { const key = n.id === "evelyn" && evelynCasual() ? "evelynCasual" : n.id; if (!(SPRITES[key] && drawSprite(key, n.px, n.py, n.dir, !!n.walk, !!n.chase, n.dist))) drawChar(n.px, n.py, n); } }))
      .concat([{ y: player.y, f: () => {
        const marcoSprite = state.q.flags.marcoUniform ? "marcoUniform" : "marco";
        if (!drawSprite(marcoSprite, player.x, player.y, player.dir, player.walk, player.run, player.dist)) drawChar(player.x, player.y, { color: "#3b6fd0", hair: "#1a1a1a", dir: player.dir, walk: player.walk });
      } }])
      .concat(state.map === "world" ? cars.map((c) => ({ y: c.y + World.CAR_H, f: () => World.car(ctx, c, t) })) : [])
      .concat(state.map === "world" && questAngkot.active && ["approach", "stopped", "depart", "school-stopped", "school-depart"].includes(questAngkot.phase) ? [{ y: questAngkot.y + World.CAR_H, f: () => World.car(ctx, questAngkot, t) }] : [])
      .concat(World.sortables(ctx, state.map, t, view, dusk));
    list.sort((a, b) => a.y - b.y).forEach((o) => o.f());
    World.over(ctx, state.map, t, view, dusk);
    // Dua penanda quest: panah selalu dekat player, ikon perintah tepat di atas target.
    const goal = questDestination();
    if (goal && goal.map === state.map) {
      const dx = goal.x - player.x, dy = goal.y - player.y;
      const angle = Math.atan2(dy, dx);
      const arrowX = player.x + Math.cos(angle) * 17;
      const arrowY = player.y - 22 + Math.sin(angle) * 7 + Math.sin(t * 7) * 1.5;
      ctx.save();
      ctx.translate(arrowX, arrowY);
      // Sprite panah dasarnya mengarah ke bawah; rotasi membuatnya menunjuk ke quest.
      ctx.rotate(angle - Math.PI / 2);
      if (QUEST_MARKERS.arrow.complete && QUEST_MARKERS.arrow.naturalWidth) {
        ctx.drawImage(QUEST_MARKERS.arrow, -7, -8, 14, 10);
      } else {
        ctx.fillStyle = "#ffbf24"; ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(-6, -2); ctx.lineTo(-2, -2); ctx.lineTo(-2, -7); ctx.lineTo(2, -7); ctx.lineTo(2, -2); ctx.lineTo(6, -2); ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      // Ikon tanda perintah ditempatkan pada koordinat target, bukan sekadar di dekatnya.
      const left = cam.x, top = cam.y, right = cam.x + VW, bottom = cam.y + VH;
      const targetVisible = goal.x >= left && goal.x <= right && goal.y >= top && goal.y <= bottom;
      if (targetVisible) {
        const markerX = goal.x;
        const markerY = goal.y - 34 + Math.sin(t * 4) * 1.5;
        if (QUEST_MARKERS.interact.complete && QUEST_MARKERS.interact.naturalWidth) {
          ctx.drawImage(QUEST_MARKERS.interact, markerX - 8, markerY - 18, 16, 20);
        } else {
          ctx.fillStyle = "#fff0d8"; ctx.fillRect(markerX - 5, markerY - 12, 10, 12);
          ctx.fillStyle = "#30283f"; ctx.fillRect(markerX - 1, markerY - 9, 2, 5); ctx.fillRect(markerX - 1, markerY - 2, 2, 2);
        }
      }
    }
    // Gerbang besi SMA Nusa terkunci dari pukul 06.30 sampai jam sekolah selesai.
    if (state.map === "world" && p >= 1.5 / 24 && p < 10 / 24) {
      const gx = 114 * TS, gy = 15 * TS;
      ctx.fillStyle = "#30283f";
      for (let k = -10; k <= 10; k += 5) ctx.fillRect(gx + k, gy - 22, 2, 20);
      ctx.fillRect(gx - 12, gy - 18, 24, 2);
      ctx.fillRect(gx - 12, gy - 7, 24, 2);
      ctx.fillStyle = "#9b8caf"; ctx.fillRect(gx - 13, gy - 22, 2, 20); ctx.fillRect(gx + 11, gy - 22, 2, 20);
    }
    ctx.restore();
    ctx.fillStyle = World.tint(p); ctx.fillRect(0, 0, VW, VH);
    World.vignette(ctx, VW, VH);
    if (mapOpen && state.map === "world") drawWorldMap();
  }

  function drawWorldMap() {
    const x = 5, y = 5, w = 310, h = 170, mx = 13, my = 25, mw = 294, mh = 139;
    ctx.save();
    ctx.fillStyle = "rgba(15,18,28,.97)"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#d9c69a"; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
    ctx.fillStyle = "#f4e5c5"; ctx.font = "bold 8px monospace"; ctx.fillText("PETA KOTA  ·  [M] TUTUP", x + 7, y + 12);
    ctx.fillStyle = "#759b78"; ctx.fillRect(mx, my, mw, mh);
    const sx = mw / 240, sy = mh / 160, X = v => mx + v*sx, Y = v => my + v*sy;
    // area distrik
    ctx.fillStyle = "#779c7a"; ctx.fillRect(X(0),Y(0),150*sx,80*sy);
    ctx.fillStyle = "#a5a38b"; ctx.fillRect(X(150),Y(0),90*sx,80*sy);
    ctx.fillStyle = "#9a806f"; ctx.fillRect(X(0),Y(80),100*sx,80*sy);
    ctx.fillStyle = "#858b82"; ctx.fillRect(X(100),Y(55),50*sx,105*sy);
    ctx.fillStyle = "#5e7180"; ctx.fillRect(X(150),Y(80),90*sx,80*sy);
    // jalan utama dan gang
    ctx.lineCap = "square"; ctx.strokeStyle = "#e6dfc9"; ctx.lineWidth = 3;
    [18,50,89,129].forEach(v=>{ctx.beginPath();ctx.moveTo(X(0),Y(v));ctx.lineTo(X(240),Y(v));ctx.stroke();});
    [22,72,120,160,205].forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),Y(0));ctx.lineTo(X(v),Y(160));ctx.stroke();});
    ctx.strokeStyle = "#f6f0df"; ctx.lineWidth = 1.5;
    [[8,27,26,27],[30,34,50,34],[78,34,98,34],[151,24,181,24],[151,45,181,45],[166,68,211,68],[12,105,76,105],[12,140,76,140],[151,105,223,105],[151,140,223,140],[95,72,95,117],[135,58,135,128]].forEach(a=>{ctx.beginPath();ctx.moveTo(X(a[0]),Y(a[1]));ctx.lineTo(X(a[2]),Y(a[3]));ctx.stroke();});
    // Label distrik
    ctx.font="bold 6px monospace"; ctx.fillStyle="#fff8df";
    ctx.fillText("KAMPUNG SENJA",X(4),Y(7)); ctx.fillText("DISTRIK ELIT",X(158),Y(7));
    ctx.fillText("DISTRIK PINGGIRAN",X(3),Y(91)); ctx.fillText("PUSAT KOTA",X(103),Y(61)); ctx.fillText("DISTRIK MALAM",X(158),Y(91));
    // Lokasi spesifik dengan simbol dan nama saat zoom map dibuka.
    WORLD_POI.forEach((poi,i)=>{
      const px=X(poi.x), py=Y(poi.y);
      const colors={home:"#fff0c6",transit:"#f4c85e",food:"#f19a72",school:"#9ed0f2",park:"#a8d89b",shop:"#e6b8ec",fun:"#f6a6cf",place:"#f2f0dc"};
      ctx.fillStyle=colors[poi.type]||"#fff"; ctx.beginPath(); ctx.arc(px,py,2.1,0,Math.PI*2);ctx.fill();
      ctx.font="4.5px monospace"; ctx.fillStyle="#fffdf0"; ctx.fillText(poi.name.replace("Distrik ", "").slice(0, 15),px+3,py-2);
    });
    // Warga aktif sebagai titik kecil
    npcs.filter(n=>n.map==="world").forEach(n=>{ctx.fillStyle=n.id==="evelyn"?"#ffb5d2":"#d9e7ef";ctx.fillRect(X(n.px/TS),Y(n.py/TS),1.5,1.5);});
    const px=X(player.x/TS), py=Y(player.y/TS);
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#e8c25a";ctx.lineWidth=1;ctx.beginPath();ctx.arc(px,py,4.5,0,Math.PI*2);ctx.stroke();
    const goal=questDestination();
    if(goal && goal.map==="world") { const qx=X(goal.x/TS),qy=Y(goal.y/TS);ctx.fillStyle="#ffd66e";ctx.beginPath();ctx.moveTo(qx,qy-4);ctx.lineTo(qx-3,qy+3);ctx.lineTo(qx+3,qy+3);ctx.closePath();ctx.fill();ctx.strokeStyle="#332b22";ctx.stroke(); }
    ctx.fillStyle="#f4e5c5";ctx.font="bold 6px monospace";ctx.fillText("POSISI: "+World.districtName(player.x,player.y),x+7,y+165);
    if(goal && goal.map==="world") {ctx.textAlign="right";ctx.fillText("TUJUAN: "+goal.name,x+w-7,y+165);ctx.textAlign="left";}
    ctx.restore();
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt); render();
    requestAnimationFrame(loop);
  }

  // Game baru (slot kosong / save selesai) membuka cutscene dulu; save yang dilanjutkan langsung masuk game.
  function start(saved, h) {
    if (!saved || saved.done) {
      // Cutscene mimpi Marco diputar sebelum cutscene bangun tidur yang sudah ada.
      Cutscene.play(() => Cutscene.play(() => begin(saved, h), { id: "intro", scenes: Cutscene.INTRO }), {
        id: "marco-dream", scenes: Cutscene.DREAM
      });
    } else begin(saved, h);
  }
  function begin(saved, h) {
    hooks = h;
    state = saved && !saved.done ? JSON.parse(JSON.stringify(saved)) : fresh();
    if ((!saved || saved.done) && h.tutorial) state.tut = { step: 0 };   // tutorial "???" hanya untuk game pertama di akun baru
    tutReset();
    player = { x: state.x, y: state.y, dir: "down", walk: false, run: false, dist: 0, moveVx: 0, moveVy: 0 };
    if (state.schoolLayout !== 2) {   // denah sekolah baru: pemain yang tersimpan di lantai 1 dipindahkan ke lobi
      if (state.map === "class") enter("class", World.school.entranceX * TS + 8, 10 * TS + 14);
      state.schoolLayout = 2;
    }
    if (blocked(player.x, player.y)) {
      const near = findFreeSpot(player.x, player.y, state.map);   // mis. save lama berdiri di bekas lengkungan yang kini jadi pintu
      if (!blocked(near.x, near.y)) { player.x = near.x; player.y = near.y; state.x = near.x; state.y = near.y; }
      else if (state.map === "class") enter("class", World.school.entranceX * TS + 8, 10 * TS + 14); else enter("home", SPAWN.x, SPAWN.y);
    }   // save lama dari denah rumah sebelumnya
    state.heat = state.heat || 0;
    state.r = state.r || [];   // langkah rutinitas hari ini (save lama belum punya)
    ensureQuestState();
    state.s.e = state.s.e || 0;   // kedekatan dengan Evelyn (save lama belum punya)
    enc = null; encCool = 0;
    gang().forEach((n) => { n.px = n.hx; n.py = n.hy; n.chase = n.leave = n.hold = false; });
    const ev = npcs.find((n) => n.id === "evelyn");
    if (ev) { ev.follow = false; ev.attached = false; ev.trail = []; ev.wander = true; ev.px = ev.hx; ev.py = ev.hy; }
    curRoom = "";
    cam.x = player.x - VW / 2; cam.y = player.y - VH / 2;
    keys = {}; paused = false; dlg = null; mapOpen = false; running = true;
    Sound.init(); Sound.mood = ""; setMood(); 
    if (!saved || saved.done) openDialog([
      { w: "Marco", m: "calm", t: "Mimpi yang aneh..." }], null);
    last = performance.now(); requestAnimationFrame(loop);
  }

  return { start, togglePause, saveNow, quit, autosave, setKey(key, value) { keys[String(key).toLowerCase()] = !!value; } };
})();
