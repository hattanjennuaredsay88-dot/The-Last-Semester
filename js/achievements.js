// Daftar achievement. Dievaluasi dari state save (tiap kali menyimpan) dan dari semua slot saat layar dibuka.
const Achievements = (() => {
  const q = (s) => s.q || {}, f = (s) => (s.q && s.q.flags) || {};
  const LIST = [
    { id: "start",   t: "Semester Dimulai",    d: "Mulai petualangan Marco.",                         ok: () => true },
    { id: "angkot",  t: "Berangkat Bersama",   d: "Naik angkot bersama Evelyn.",                       ok: (s) => !!f(s).angkotBoarded },
    { id: "rajin",   t: "Anak Rajin",          d: "Hadir di sekolah minimal 5 kali.",                  ok: (s) => (q(s).attendance || 0) >= 5 },
    { id: "week",    t: "Seminggu Bertahan",   d: "Capai hari ke-7.",                                  ok: (s) => (s.day || 0) >= 7 },
    { id: "half",    t: "Setengah Jalan",      d: "Capai hari ke-15.",                                 ok: (s) => (s.day || 0) >= 15 },
    { id: "helper",  t: "Tangan Penolong",     d: "Selesaikan 1 quest sampingan.",                     ok: (s) => (q(s).sideCompleted || 0) >= 1 },
    { id: "village", t: "Sahabat Kampung",     d: "Selesaikan 3 quest sampingan.",                     ok: (s) => (q(s).sideCompleted || 0) >= 3 },
    { id: "life",    t: "Hidup Terus Berjalan", d: "Alami 3 kejadian kehidupan.",                      ok: (s) => (q(s).lifeEvents || 0) >= 3 },
    { id: "evelyn",  t: "Sahabat dari Sebelah", d: "Kedekatan dengan Evelyn mencapai 8.",              ok: (s) => ((s.s && s.s.e) || 0) >= 8 },
    { id: "circle",  t: "Terseret Arus",       d: "Bersumpah bergabung dengan circle Bram.",           ok: (s) => !!q(s).bramJoined },
    { id: "good",    t: "Bebas",               d: "Raih Good Ending: Bebas.",                          ok: (s) => s.ending === "good" },
    { id: "goodEv",  t: "Bebas, Bersamamu",    d: "Raih Good Ending bersama Evelyn.",                  ok: (s) => s.ending === "goodEvelyn" },
    { id: "neutral", t: "Hidup Biasa",         d: "Raih Neutral Ending.",                              ok: (s) => s.ending === "neutral" },
    { id: "bad",     t: "Jalan Gelap",         d: "Raih Bad Ending.",                                  ok: (s) => s.ending === "bad" }
  ];
  // id achievement yang terpenuhi oleh satu state
  const check = (state) => (state ? LIST.filter((a) => { try { return a.ok(state); } catch (e) { return false; } }).map((a) => a.id) : []);
  return { LIST, check };
})();
