/*
 * Dish photo library.
 *  - "My photos": uploaded in the app and kept on this device (IndexedDB).
 *  - "Family photos": image files in the repo's gallery/ folder, listed in gallery/index.json
 *    by scripts/build-gallery.js when the site is published, so every phone sees them.
 *
 * A gallery item: { id, title, notes, foods: [foodId], slots: [slot], who: [profileId], src, shared }.
 */
(function (root) {
  const DB_NAME = 'tdm-gallery';
  const STORE = 'photos';
  let dbPromise = null;
  const urlCache = new Map();

  function openDb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (!root.indexedDB) { reject(new Error('no-indexeddb')); return; }
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  function tx(mode, fn) {
    return openDb().then(db => new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const store = t.objectStore(STORE);
      let out;
      Promise.resolve(fn(store)).then(v => { out = v; });
      t.oncomplete = () => resolve(out);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }

  function reqValue(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /** Shrink a photo so hundreds fit on a phone: longest side 1200 px, JPEG. */
  function compress(file, maxSide) {
    maxSide = maxSide || 1200;
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(b => (b ? resolve(b) : reject(new Error('image-unreadable'))), 'image/jpeg', 0.82);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image-unreadable')); };
      img.src = url;
    });
  }

  async function listLocal() {
    try {
      const rows = await tx('readonly', store => reqValue(store.getAll()));
      return (rows || []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map(r => ({
        id: r.id, title: r.title || '', notes: r.notes || '', foods: r.foods || [], slots: r.slots || [], who: r.who || [],
        src: blobUrl(r.id, r.blob), shared: false,
      }));
    } catch (e) {
      return [];
    }
  }

  function blobUrl(id, blob) {
    if (!blob) return '';
    if (!urlCache.has(id)) urlCache.set(id, URL.createObjectURL(blob));
    return urlCache.get(id);
  }

  async function addLocal(file, meta) {
    const blob = await compress(file);
    const id = 'local:' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const row = { id, blob, createdAt: Date.now(), title: meta.title || '', notes: meta.notes || '', foods: meta.foods || [], slots: meta.slots || [], who: meta.who || [] };
    await tx('readwrite', store => reqValue(store.put(row)));
    return id;
  }

  async function updateLocal(id, patch) {
    await tx('readwrite', async store => {
      const row = await reqValue(store.get(id));
      if (row) store.put(Object.assign(row, patch));
    });
  }

  async function removeLocal(id) {
    await tx('readwrite', store => reqValue(store.delete(id)));
    if (urlCache.has(id)) { URL.revokeObjectURL(urlCache.get(id)); urlCache.delete(id); }
  }

  /**
   * Family photos from the published gallery/index.json. `base` is the site URL ('' when the app
   * is itself served from the site). Returns [] when there is no gallery yet or no connection.
   */
  async function loadShared(base) {
    try {
      const res = await fetch(base + 'gallery/index.json', { cache: 'no-cache' });
      if (!res.ok) return [];
      const list = await res.json();
      return (Array.isArray(list) ? list : []).filter(x => x && x.file).map(x => ({
        id: 'shared:' + x.file, title: String(x.title || ''), notes: String(x.notes || ''), tags: Array.isArray(x.tags) ? x.tags.map(String) : [],
        src: base + 'gallery/' + encodeURIComponent(x.file), shared: true, foods: [], slots: [], who: [],
      }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Best photo for a meal: the one sharing the most foods with it (at least 2, or all of a
   * 1–2 food dish), preferring photos tagged for this child and meal. Returns an item or null.
   */
  function matchPhoto(meal, items, profileId) {
    if (meal.template === 'gallery') return items.find(g => g.id === meal.gallery) || null;
    const foods = new Set(meal.items);
    let best = null;
    let bestScore = 0;
    for (const g of items) {
      if (!g.foods || !g.foods.length) continue;
      const overlap = g.foods.filter(id => foods.has(id)).length;
      const needed = Math.min(2, foods.size);
      if (overlap < needed) continue;
      let s = overlap * 2 - (g.foods.length - overlap) * 0.5;
      if (g.who && g.who.includes(profileId)) s += 1;
      if (g.slots && g.slots.includes(meal.slot)) s += 1;
      if (s > bestScore) { bestScore = s; best = g; }
    }
    return best;
  }

  /** A drawn plate with the dish's foods, for dishes without a photo. Returns an SVG data URI. */
  function illustrate(emojis, slot) {
    const plates = { breakfast: '#FCE9C8', snack1: '#E3F1DC', lunch: '#DDEBF7', snack2: '#F4E1EE', dinner: '#FBE0D2' };
    const bg = plates[slot] || '#EDEDE8';
    const list = emojis.slice(0, 4);
    const pos = [
      [[100, 108]],
      [[74, 104], [128, 112]],
      [[100, 74], [70, 124], [132, 124]],
      [[72, 76], [130, 76], [72, 130], [130, 130]],
    ][Math.max(0, list.length - 1)] || [];
    const size = list.length <= 1 ? 70 : list.length === 2 ? 56 : 46;
    const items = list.map((e, i) => `<text x="${pos[i][0]}" y="${pos[i][1]}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${e}</text>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="${bg}"/><circle cx="100" cy="104" r="84" fill="#fff" opacity=".95"/><circle cx="100" cy="104" r="68" fill="none" stroke="${bg}" stroke-width="4"/>${items}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  root.TDM_GALLERY = { listLocal, addLocal, updateLocal, removeLocal, loadShared, matchPhoto, illustrate, compress };
})(window);
