// Kontrol sentuh: memakai input key yang sama dengan keyboard agar gameplay tetap konsisten.
(() => {
  const root = document.getElementById('mobileControls');
  const game = document.getElementById('game');
  if (!root || !game) return;

  const send = (type, key) => {
    const normalized = key === 'escape' ? 'Escape' : key === ' ' ? ' ' : key.length === 1 ? key : key[0].toUpperCase() + key.slice(1);
    window.dispatchEvent(new KeyboardEvent(type, { key: normalized, bubbles: true, cancelable: true }));
  };


  // ---- D-pad gambar panah: satu zona sentuh. Arah dibaca dari posisi jempol (8 arah),
  // jadi jempol bisa digeser dari satu panah ke panah lain tanpa diangkat, dan bisa serong.
  const pad = root.querySelector('.touch-pad');
  const DIR_KEYS = { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' };
  const SECTORS = [['right'], ['down', 'right'], ['down'], ['down', 'left'], ['left'], ['up', 'left'], ['up'], ['up', 'right']];
  const held = new Set();
  let padPointer = null;

  const applyDirs = (next) => {
    Object.keys(DIR_KEYS).forEach((dir) => {
      const on = next.has(dir);
      const was = held.has(dir);
      if (on === was) return;
      const arrow = pad.querySelector('[data-dir="' + dir + '"]');
      if (on) { held.add(dir); arrow && arrow.classList.add('pressed'); send('keydown', DIR_KEYS[dir]); }
      else { held.delete(dir); arrow && arrow.classList.remove('pressed'); send('keyup', DIR_KEYS[dir]); }
    });
  };
  const readDirs = (event) => {
    const rect = pad.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    if (Math.hypot(x, y) < 0.07) return new Set(); // zona mati di tengah
    const sector = ((Math.round(Math.atan2(y, x) * 4 / Math.PI) % 8) + 8) % 8;
    return new Set(SECTORS[sector]);
  };
  const releasePad = () => { padPointer = null; applyDirs(new Set()); };

  if (pad) {
    pad.addEventListener('pointerdown', (event) => {
      if (padPointer !== null) return;
      event.preventDefault();
      padPointer = event.pointerId;
      try { pad.setPointerCapture(event.pointerId); } catch (_) {}
      applyDirs(readDirs(event));
    });
    pad.addEventListener('pointermove', (event) => {
      if (event.pointerId !== padPointer) return;
      event.preventDefault();
      applyDirs(readDirs(event));
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => pad.addEventListener(name, (event) => {
      if (event.pointerId === padPointer) releasePad();
    }));
    pad.addEventListener('contextmenu', (event) => event.preventDefault());
    // Jika pad tiba-tiba disembunyikan (dialog/jeda terbuka) saat jempol masih menempel, lepaskan arah.
    setInterval(() => { if (held.size && pad.offsetParent === null) releasePad(); }, 200);
  }

  root.querySelectorAll('[data-key]').forEach((button) => {
    const key = button.dataset.key;
    const down = (event) => {
      event.preventDefault();
      if (button.dataset.pressed === '1') return;
      button.dataset.pressed = '1';
      button.classList.add('pressed');
      send('keydown', key);
      try { button.setPointerCapture(event.pointerId); } catch (_) {}
    };
    const up = (event) => {
      if (button.dataset.pressed !== '1') return;
      event.preventDefault();
      button.dataset.pressed = '0';
      button.classList.remove('pressed');
      send('keyup', key);
    };
    button.addEventListener('pointerdown', down);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => button.addEventListener(name, up));
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  });

  root.querySelectorAll('[data-tap]').forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.classList.add('pressed');
      const key = button.dataset.tap;
      send('keydown', key);
      requestAnimationFrame(() => send('keyup', key));
    });
    button.addEventListener('pointerup', () => button.classList.remove('pressed'));
    button.addEventListener('pointercancel', () => button.classList.remove('pressed'));
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  });

  // Bersihkan tombol yang tertahan saat tab kehilangan fokus atau game ditinggalkan.
  const releaseAll = () => {
    releasePad();
    root.querySelectorAll('[data-key][data-pressed="1"]').forEach((button) => {
      button.dataset.pressed = '0'; button.classList.remove('pressed'); send('keyup', button.dataset.key);
    });
  };
  window.addEventListener('blur', releaseAll);
  window.addEventListener('pagehide', releaseAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
})();
