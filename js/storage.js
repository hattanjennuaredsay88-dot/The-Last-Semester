// Semua akses Local Storage ada di sini.
// Catatan: password disimpan polos hanya untuk simulasi belajar, bukan autentikasi yang aman.
const Store = {
  usersKey: "tls_users",
  sessionKey: "tls_session",

  read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch (e) { return fallback; }
  },
  write(key, value) { localStorage.setItem(key, JSON.stringify(value)); },

  register(username, password, confirm) {
    username = username.trim();
    if (username.length < 3) return { ok: false, msg: "Username minimal 3 karakter." };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { ok: false, msg: "Username hanya boleh huruf, angka, dan _." };
    if (password.length < 4) return { ok: false, msg: "Password minimal 4 karakter." };
    if (password !== confirm) return { ok: false, msg: "Password dan ulangi password tidak sama." };
    const users = this.read(this.usersKey, {});
    if (users[username.toLowerCase()]) return { ok: false, msg: "Username sudah dipakai akun lain." };
    users[username.toLowerCase()] = { name: username, pass: password };
    this.write(this.usersKey, users);
    return { ok: true, msg: "Registrasi berhasil! Silakan login." };
  },

  login(username, password) {
    const users = this.read(this.usersKey, {});
    const u = users[username.trim().toLowerCase()];
    if (!u || u.pass !== password) return { ok: false, msg: "Username atau password salah." };
    this.write(this.sessionKey, u.name);
    return { ok: true, msg: "Login berhasil!" };
  },

  // Logout cuma menghapus sesi, akun dan save tetap ada.
  logout() { localStorage.removeItem(this.sessionKey); },
  currentUser() { return this.read(this.sessionKey, null); },

  // Data tambahan per akun: achievement yang terbuka dan cutscene yang sudah dilihat.
  meta(user) { const m = this.read("tls_meta_" + user, {}); m.ach = m.ach || {}; m.cs = m.cs || {}; return m; },
  saveMeta(user, m) { this.write("tls_meta_" + user, m); },

  saves(user) { return this.read("tls_save_" + user, [null, null, null]); },
  saveSlot(user, slot, state) {
    const all = this.saves(user);
    all[slot] = { state, savedAt: new Date().toLocaleString("id-ID") };
    this.write("tls_save_" + user, all);
  }
};
