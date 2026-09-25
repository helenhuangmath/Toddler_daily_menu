/*
 * Menu planner. Pure functions: no DOM, so it runs in the browser and in Node tests.
 *
 * A plan is { days: [{ meals: [Meal] }], createdAt, mode }.
 * A Meal stores only ingredient ids, role fields and a template (cooking method) key;
 * the text (dish name and steps) is rendered per language by describeMeal(), so
 * switching language never changes the menu.
 *
 * `settings` is one child's profile: { age, texture, meals, exclude, milkType, milkMl }.
 * Texture stages 0–3 (puree → soft bites) use baby dishes; stage 4 (family food) uses
 * family-style dishes (staple + protein dish + vegetable dish).
 */
(function (root) {
  const DATA = root.TDM_DATA || (typeof require !== 'undefined' ? require('./data.js') : null);

  const SLOTS = {
    breakfast: { en: 'Breakfast', zh: '早餐', time: '7:30' },
    snack1: { en: 'Morning snack', zh: '上午加餐', time: '10:00' },
    lunch: { en: 'Lunch', zh: '午餐', time: '12:00' },
    snack2: { en: 'Afternoon snack', zh: '下午加餐', time: '15:30' },
    dinner: { en: 'Dinner', zh: '晚餐', time: '18:00' },
  };
  const SLOT_ORDER = ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'];

  const MEAT = ['chicken', 'beef', 'pork', 'lamb', 'turkey'];
  const FISH = ['cod', 'salmon'];
  const LEGUME = ['lentils', 'chickpeas'];
  const LEAFY = ['spinach', 'bokchoy', 'napacabbage'];
  const SOUP_VEG = ['wintermelon', 'luffa', 'tomato', 'napacabbage'];
  const BRAISE_VEG = ['potato', 'carrot', 'tomato', 'pumpkin', 'mushroom', 'eggplant', 'wintermelon', 'zucchini', 'cauliflower'];
  const SWEET_FRUIT = ['banana', 'apple', 'pear', 'mango', 'peach', 'blueberry', 'apricot', 'papaya'];
  const ROAST_CARB = ['sweetpotato', 'potato', 'taro', 'chineseyam'];
  const ROAST_VEG = ['carrot', 'pumpkin', 'zucchini', 'broccoli', 'cauliflower', 'bellpepper', 'beet', 'eggplant', 'asparagus'];

  // ---------- helpers ----------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function normalize(s) {
    return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /** Build the lookup of all usable foods: built-ins + user custom foods. */
  function buildCatalog(customFoods) {
    const map = new Map();
    for (const f of DATA.FOODS) map.set(f.id, f);
    for (const c of customFoods || []) map.set(c.id, c);
    return map;
  }

  /**
   * Match free text (English or Chinese, comma/、/，/space-separated) to foods.
   * Returns { matched: [id], unknown: [text], blocked: [text] }.
   */
  function parseFoodText(text, customFoods) {
    const parts = String(text || '')
      .split(/[,，、;；\n]+/)
      .map(s => s.trim())
      .filter(Boolean);
    const catalog = buildCatalog(customFoods);
    const matched = [];
    const unknown = [];
    const blocked = [];
    for (const raw of parts) {
      const q = normalize(raw);
      if (DATA.BLOCKED[0].match.some(b => q === b || (containsWord(q, b) && !findFood(q, catalog)))) {
        blocked.push(raw);
        continue;
      }
      const f = findFood(q, catalog);
      if (f) {
        if (!matched.includes(f.id)) matched.push(f.id);
      } else {
        unknown.push(raw);
      }
    }
    return { matched, unknown, blocked };
  }

  function findFood(q, catalog) {
    let partial = null;
    for (const f of catalog.values()) {
      const names = [f.en, f.zh, ...(f.aliases || [])].map(normalize);
      if (names.includes(q)) return f;
      if (!partial && q.length >= 2 && names.some(n => n.length >= 2 && (n.startsWith(q) || containsWord(q, n)))) partial = f;
    }
    return partial;
  }

  /**
   * Every food named anywhere in a dish title or note, e.g. "南瓜鸡肉粥" → pumpkin, chicken, rice(粥 is not a food name).
   * Used to link photos to dishes.
   */
  function foodsInText(text, customFoods) {
    const q = normalize(text);
    if (!q) return [];
    const found = [];
    for (const f of buildCatalog(customFoods).values()) {
      const names = [f.zh, f.en, ...(f.aliases || []), ...(f.short ? [f.short.zh, f.short.en] : [])].map(normalize).filter(n => n.length >= 2);
      if (names.some(n => containsWord(q, n))) found.push(f.id);
    }
    return found;
  }

  // "fresh carrots" contains "carrot", "新鲜胡萝卜" contains "胡萝卜", but "pineapple" must not match "apple".
  function containsWord(text, word) {
    if (/[一-鿿]/.test(word)) return text.includes(word);
    const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(^|[^a-z])' + esc + '(e?s)?($|[^a-z])').test(text);
  }

  // ---------- profile ----------

  function ageGroup(id) {
    return DATA.AGE_GROUPS.find(a => a.id === id) || DATA.AGE_GROUPS[0];
  }

  function textureStage(id) {
    const t = DATA.TEXTURES.find(x => x.id === id);
    return t ? t.stage : 1;
  }

  /** Normalised view of a profile / settings object. */
  function profileOf(settings) {
    const s = settings || {};
    const age = ageGroup(s.age);
    const texture = s.texture && DATA.TEXTURES.some(x => x.id === s.texture) ? s.texture : age.texture;
    return { age: age.id, scale: age.scale, texture, stage: textureStage(texture), kid: textureStage(texture) >= 4, slots: slotsFor(s), baby: age.id === 'm12' };
  }

  function slotsFor(settings) {
    const s = settings || {};
    if (Array.isArray(s.meals) && s.meals.length) return SLOT_ORDER.filter(x => s.meals.includes(x));
    if (s.snacks === false) return ['breakfast', 'lunch', 'dinner'];
    if (!s.age) return SLOT_ORDER.slice();
    return ageGroup(s.age).meals.slice();
  }

  // ---------- core planner ----------

  // Porridges plus the naturally sweet mashes read like breakfast; plain potato or pasta do not.
  const BREAKFAST_CARB = f => f.form === 'porridge' || f.id === 'sweetpotato' || f.id === 'chineseyam' || (f.custom && f.form === 'mash');
  const STAPLE = f => f.form !== 'flour';

  function makeContext(opts) {
    const catalog = buildCatalog(opts.customFoods);
    const prof = profileOf(opts.settings);
    const exclude = new Set((opts.settings && opts.settings.exclude) || []);
    const pantry = (opts.pantry || [])
      .map(id => catalog.get(id))
      .filter(f => f && !exclude.has(f.allergen) && (f.minStage || 0) <= prof.stage);
    const byCat = {};
    for (const f of pantry) (byCat[f.cat] = byCat[f.cat] || []).push(f);
    const ids = new Set(pantry.map(f => f.id));
    return {
      catalog,
      byCat,
      ids,
      prof,
      rand: mulberry32(opts.seed != null ? opts.seed : Date.now()),
      usage: {}, // id -> count in this plan
      methods: {}, // template -> count in this plan, to rotate cooking methods
      history: opts.history || {}, // id -> count in the previous plan (soft penalty)
      combos: new Set(),
      settings: opts.settings || {},
      gallery: (opts.gallery || []).filter(g => g && g.id && Array.isArray(g.foods) && g.foods.length),
      galleryUsed: new Set(),
      galleryRate: typeof opts.galleryRate === 'number' ? opts.galleryRate : 0.3,
    };
  }

  const has = (ctx, id) => ctx.ids.has(id);

  /**
   * Pick the least-used food from a category, avoiding what the child already ate
   * today and yesterday so every day looks different.
   */
  function pick(ctx, cat, day, opts) {
    const pool = (ctx.byCat[cat] || []).filter(f => !(opts && opts.avoid && opts.avoid.includes(f.id)) && (!opts || !opts.filter || opts.filter(f)));
    if (!pool.length) return null;
    let best = null;
    let bestScore = Infinity;
    for (const f of pool) {
      const used = ctx.usage[f.id] || 0;
      if (f.maxPerWeek && used >= f.maxPerWeek && pool.length > 1) continue;
      let s = used * 1.0;
      if (day.today.has(f.id)) s += 6;
      if (day.yesterday.has(f.id)) s += 1.5;
      if (day.hint.has(f.id)) s -= 1.2; // the other child eats it today: cook once, serve twice
      s += (ctx.history[f.id] || 0) * 0.25;
      if (f.iron && !day.hasIron) s -= 0.8;
      s += ctx.rand() * (1.2 + (opts && opts.noise ? opts.noise : 0));
      if (s < bestScore) { bestScore = s; best = f; }
    }
    return best;
  }

  const pickId = (ctx, cat, day, o, ids) => pick(ctx, cat, day, { ...o, filter: f => ids.includes(f.id) });

  /** Choose a cooking method, favouring ones not used much yet this week. */
  function chooseMethod(ctx, options) {
    const list = options.filter(x => x && x.ok);
    if (!list.length) return null;
    let total = 0;
    const weights = list.map(x => {
      const w = (x.w || 1) / (1 + (ctx.methods[x.id] || 0) * 1.5);
      total += w;
      return w;
    });
    let r = ctx.rand() * total;
    for (let i = 0; i < list.length; i++) {
      r -= weights[i];
      if (r <= 0) return list[i].id;
    }
    return list[list.length - 1].id;
  }

  function comboKey(meal) {
    return meal.template + ':' + meal.items.slice().sort().join('+');
  }

  function finalize(meal) {
    const roles = ['main', 'veg', 'veg2', 'protein', 'fruit', 'partner', 'extra', 'fat'];
    meal.items = [];
    for (const r of roles) if (meal[r] && !meal.items.includes(meal[r])) meal.items.push(meal[r]);
    for (const r of roles) if (meal[r] === undefined) meal[r] = null;
    return meal;
  }

  // ----- baby (texture stages 0–3) -----

  function babyBreakfast(ctx, day, o) {
    const st = ctx.prof.stage;
    const meal = { slot: 'breakfast', template: '' };
    const eggFree = has(ctx, 'egg') && !day.today.has('egg') && !(o.avoid || []).includes('egg');
    const oatsOrFlour = ['oats', 'flour'].filter(id => has(ctx, id) && !day.today.has(id));
    const method = chooseMethod(ctx, [
      { id: 'base', ok: true, w: 2 },
      { id: 'pancake', ok: st >= 1 && eggFree && oatsOrFlour.length && (ctx.byCat.fruit || []).some(f => SWEET_FRUIT.includes(f.id)) },
      { id: 'steamcake', ok: st >= 1 && eggFree && has(ctx, 'oats') && (ctx.byCat.fruit || []).some(f => SWEET_FRUIT.includes(f.id)) },
      { id: 'oat_yogurt', ok: st >= 1 && has(ctx, 'oats') && has(ctx, 'yogurt') },
    ]);
    if (method === 'pancake' || method === 'steamcake') {
      meal.template = method;
      meal.main = method === 'steamcake' ? 'oats' : oatsOrFlour[Math.floor(ctx.rand() * oatsOrFlour.length)];
      const fruit = pickId(ctx, 'fruit', day, o, SWEET_FRUIT);
      meal.fruit = fruit ? fruit.id : null;
      meal.extra = 'egg';
      return finalize(meal);
    }
    if (method === 'oat_yogurt') {
      meal.template = 'oat_yogurt';
      meal.main = 'oats';
      const fruit = pick(ctx, 'fruit', day, o);
      meal.fruit = fruit ? fruit.id : null;
      meal.extra = 'yogurt';
      return finalize(meal);
    }
    const carb = pick(ctx, 'carb', day, { ...o, filter: f => BREAKFAST_CARB(f) }) || pick(ctx, 'carb', day, { ...o, filter: STAPLE });
    const fruit = pick(ctx, 'fruit', day, o);
    // Rotate the extra between egg, dairy and fat for variety.
    const r = ctx.rand();
    let extra = null;
    if (eggFree && r < 0.34) extra = ctx.catalog.get('egg');
    const spread = { ...o, filter: f => f.id !== 'oliveoil' }; // oil is stirred into mains, not served as a topping
    const dairy = { ...o, filter: f => f.id !== 'milk' };
    if (!extra && r < 0.7) extra = pick(ctx, 'dairy', day, dairy) || pick(ctx, 'fat', day, spread);
    else if (!extra) extra = pick(ctx, 'fat', day, spread) || pick(ctx, 'dairy', day, dairy);
    meal.main = carb ? carb.id : null;
    meal.fruit = fruit ? fruit.id : null;
    meal.extra = extra ? extra.id : null;
    if (carb) meal.template = carb.form === 'mash' ? 'bf_mash' : carb.form === 'noodle' ? 'bf_noodle' : carb.form === 'bread' ? 'bf_bread' : 'bf_porridge';
    else meal.template = fruit ? 'fruit_only' : 'empty';
    return finalize(meal);
  }

  function snack(ctx, slot, day, o) {
    const meal = { slot, template: '' };
    const fruit = pick(ctx, 'fruit', day, o);
    const r = ctx.rand();
    let partner = null;
    if (r < 0.45) partner = pick(ctx, 'dairy', day, { ...o, filter: f => f.id !== 'milk' });
    else if (r < 0.7) partner = (ctx.byCat.fat || []).find(f => f.id === 'avocado') || null;
    else if (r < 0.85 && fruit) partner = pick(ctx, 'fruit', day, { ...o, avoid: [...(o.avoid || []), fruit.id] });
    if (partner && partner.id === 'avocado' && day.today.has('avocado')) partner = null;
    if (!fruit) {
      const alt = pick(ctx, 'dairy', day, o) || pick(ctx, 'carb', day, { ...o, filter: f => f.form === 'mash' });
      meal.template = alt ? 'snack_simple' : 'empty';
      meal.fruit = alt ? alt.id : null;
    } else {
      meal.fruit = fruit.id;
      meal.partner = partner ? partner.id : null;
      meal.template = !partner ? 'snack_fruit' : partner.cat === 'dairy' ? 'snack_dairy' : partner.cat === 'fat' ? 'snack_avocado' : 'snack_two_fruit';
    }
    return finalize(meal);
  }

  function babyMain(ctx, slot, day, o) {
    const st = ctx.prof.stage;
    const meal = { slot, template: '' };
    let carb = pick(ctx, 'carb', day, { ...o, filter: STAPLE });
    let veg = pick(ctx, 'veg', day, o);
    let protein = pick(ctx, 'protein', day, o);
    const fat = ctx.rand() < 0.8 ? pick(ctx, 'fat', day, { ...o, filter: f => f.id === 'oliveoil' || f.id === 'butter' || f.id === 'tahini' }) : null;
    const pid = protein && protein.id;
    const eggFree = has(ctx, 'egg') && !day.today.has('egg') && !(o.avoid || []).includes('egg');
    const pancakeBase = ['flour', 'oats'].find(id => has(ctx, id) && !day.today.has(id));
    const roastCarb = (ctx.byCat.carb || []).some(f => ROAST_CARB.includes(f.id) && !day.today.has(f.id));
    const method = chooseMethod(ctx, [
      { id: 'base', ok: true, w: 1.4 },
      { id: 'egg_custard', ok: pid === 'egg' && veg },
      { id: 'tofu_stew', ok: pid === 'tofu' && veg },
      { id: 'stew', ok: veg && (MEAT.includes(pid) || LEGUME.includes(pid)) },
      { id: 'meatball', ok: st >= 1 && veg && (MEAT.includes(pid) || FISH.includes(pid) || pid === 'shrimp') },
      { id: 'veg_pancake', ok: st >= 1 && veg && eggFree && pancakeBase },
      { id: 'roast', ok: st >= 1 && roastCarb && protein },
      { id: 'softrice', ok: st >= 2 && carb && carb.id === 'rice' && veg && protein },
      { id: 'wonton', ok: st >= 2 && veg && has(ctx, 'flour') && !day.today.has('flour') && (MEAT.includes(pid) || pid === 'shrimp' || pid === 'egg') },
      { id: 'finger', ok: st >= 3 && carb && veg && protein },
    ]);
    if (method === 'veg_pancake') {
      carb = ctx.catalog.get(pancakeBase);
      protein = ctx.catalog.get('egg');
    } else if (method === 'wonton') {
      carb = ctx.catalog.get('flour');
    } else if (method === 'roast') {
      if (!(carb && ROAST_CARB.includes(carb.id))) carb = pickId(ctx, 'carb', day, o, ROAST_CARB) || carb;
      if (!(veg && ROAST_VEG.includes(veg.id))) veg = pickId(ctx, 'veg', day, o, ROAST_VEG) || veg;
    }
    meal.main = carb ? carb.id : null;
    meal.veg = veg ? veg.id : null;
    meal.protein = protein ? protein.id : null;
    meal.fat = fat ? fat.id : null;
    if (method && method !== 'base') meal.template = method;
    else if (carb) meal.template = 'main_' + (carb.form === 'bread' ? 'bread' : carb.form);
    else if (veg || protein) meal.template = 'main_nocarb';
    else meal.template = 'empty';
    return finalize(meal);
  }

  // ----- family food (texture stage 4) -----

  function kidBreakfast(ctx, day, o) {
    const meal = { slot: 'breakfast', template: '' };
    const eggOk = has(ctx, 'egg') && !(o.avoid || []).includes('egg');
    const anyFruit = (ctx.byCat.fruit || []).length > 0;
    const porridge = (ctx.byCat.carb || []).some(f => f.form === 'porridge');
    const vegs = (ctx.byCat.veg || []).length > 0;
    const method = chooseMethod(ctx, [
      { id: 'k_porridge', ok: porridge, w: 1.2 },
      { id: 'k_omelette', ok: eggOk && vegs && (has(ctx, 'flour') || has(ctx, 'mantou') || has(ctx, 'bread')) },
      { id: 'k_toast', ok: has(ctx, 'bread') && (eggOk || has(ctx, 'avocado') || has(ctx, 'ricotta')) },
      { id: 'k_noodle', ok: has(ctx, 'noodles') && eggOk && vegs },
      { id: 'k_yogurt', ok: has(ctx, 'yogurt') && has(ctx, 'oats') && anyFruit },
      { id: 'k_mantou', ok: has(ctx, 'mantou') && (has(ctx, 'milk') || eggOk) },
      { id: 'k_pancake', ok: eggOk && (has(ctx, 'oats') || has(ctx, 'flour')) && (ctx.byCat.fruit || []).some(f => SWEET_FRUIT.includes(f.id)) },
    ]);
    const fruitPick = () => { const f = pick(ctx, 'fruit', day, o); return f ? f.id : null; };
    meal.template = method || 'fruit_only';
    switch (method) {
      case 'k_porridge':
        meal.main = (pick(ctx, 'carb', day, { ...o, filter: f => f.form === 'porridge' }) || {}).id || null;
        meal.protein = eggOk ? 'egg' : null;
        meal.fruit = fruitPick();
        break;
      case 'k_omelette':
        meal.main = ['flour', 'mantou', 'bread'].filter(id => has(ctx, id))[Math.floor(ctx.rand() * ['flour', 'mantou', 'bread'].filter(id => has(ctx, id)).length)];
        meal.protein = 'egg';
        meal.veg = (pick(ctx, 'veg', day, o) || {}).id || null;
        meal.fruit = fruitPick();
        break;
      case 'k_toast': {
        meal.main = 'bread';
        const tops = ['egg', 'avocado', 'ricotta'].filter(id => has(ctx, id) && !(id === 'egg' && !eggOk));
        meal.extra = tops[Math.floor(ctx.rand() * tops.length)];
        meal.fruit = fruitPick();
        break;
      }
      case 'k_noodle':
        meal.main = 'noodles';
        meal.protein = 'egg';
        meal.veg = (pickId(ctx, 'veg', day, o, ['tomato', 'bokchoy', 'spinach', 'napacabbage', 'zucchini', 'carrot', 'mushroom']) || pick(ctx, 'veg', day, o) || {}).id || null;
        break;
      case 'k_yogurt':
        meal.main = 'oats';
        meal.extra = 'yogurt';
        meal.fruit = fruitPick();
        break;
      case 'k_mantou':
        meal.main = 'mantou';
        meal.protein = eggOk ? 'egg' : null;
        meal.partner = has(ctx, 'milk') ? 'milk' : null;
        meal.fruit = fruitPick();
        break;
      case 'k_pancake':
        meal.main = has(ctx, 'oats') ? 'oats' : 'flour';
        meal.extra = 'egg';
        meal.fruit = (pickId(ctx, 'fruit', day, o, SWEET_FRUIT) || {}).id || null;
        break;
      default:
        meal.fruit = fruitPick();
        if (!meal.fruit) meal.template = 'empty';
    }
    return finalize(meal);
  }

  function kidMain(ctx, slot, day, o) {
    const meal = { slot, template: '' };
    let protein = pick(ctx, 'protein', day, o);
    const pid = protein && protein.id;
    const veg = pick(ctx, 'veg', day, o);
    const veg2 = veg ? pick(ctx, 'veg', day, { ...o, avoid: [...(o.avoid || []), veg.id] }) : null;
    const riceOk = has(ctx, 'rice');
    const method = chooseMethod(ctx, [
      { id: 'k_set', ok: (ctx.byCat.carb || []).some(f => STAPLE(f) && f.id !== 'oats' && f.form !== 'noodle' && f.form !== 'pasta') && protein, w: 2.2 },
      { id: 'k_friedrice', ok: riceOk && veg && ['egg', 'shrimp', 'chicken', 'pork', 'beef'].includes(pid) },
      { id: 'k_dumpling', ok: has(ctx, 'flour') && veg && (MEAT.includes(pid) || pid === 'shrimp' || pid === 'egg') },
      { id: 'k_noodle_dish', ok: has(ctx, 'noodles') && veg && protein },
      { id: 'k_pasta', ok: has(ctx, 'pasta') && veg && protein },
    ]);
    meal.protein = pid || null;
    meal.veg = veg ? veg.id : null;
    if (method === 'k_set') {
      const carb = pick(ctx, 'carb', day, { ...o, filter: f => STAPLE(f) && f.id !== 'oats' && f.form !== 'noodle' && f.form !== 'pasta' });
      meal.main = carb ? carb.id : null;
      meal.veg2 = veg2 ? veg2.id : null;
      meal.pmethod = proteinMethod(ctx, pid, veg);
      if (meal.pmethod === 'fishcake') meal.veg = 'potato';
      if (meal.pmethod === 'steamed' || meal.pmethod === 'shrimp_egg' || meal.pmethod === 'custard_plain') meal.veg = null;
      if (meal.pmethod === 'shrimp_egg') meal.extra = 'egg';
      meal.vmethod = veg2 ? vegMethod(ctx, veg2.id) : null;
      meal.template = 'k_set';
    } else if (method) {
      meal.template = method;
      meal.main = { k_friedrice: 'rice', k_dumpling: 'flour', k_noodle_dish: 'noodles', k_pasta: 'pasta' }[method];
      if (veg2 && method !== 'k_dumpling') meal.veg2 = veg2.id;
    } else {
      meal.template = veg || protein ? 'k_simple' : 'empty';
      meal.main = (pick(ctx, 'carb', day, { ...o, filter: STAPLE }) || {}).id || null;
    }
    return finalize(meal);
  }

  function proteinMethod(ctx, pid, veg) {
    const vid = veg && veg.id;
    const opts = [];
    if (MEAT.includes(pid) || pid === 'liver') {
      opts.push({ id: 'stirfry', ok: !!veg, w: 1.3 });
      opts.push({ id: 'braise', ok: !!veg && pid !== 'liver' && (BRAISE_VEG.includes(vid) || !!veg), w: 1 });
      opts.push({ id: 'meatball', ok: pid !== 'liver' && !!veg, w: 1 });
    } else if (FISH.includes(pid)) {
      opts.push({ id: 'steamed', ok: true, w: 1.3 });
      opts.push({ id: 'fish_sauce', ok: !!veg, w: 1 });
      opts.push({ id: 'fishcake', ok: has(ctx, 'potato'), w: 0.8 });
    } else if (pid === 'shrimp') {
      opts.push({ id: 'stirfry', ok: !!veg, w: 1.2 });
      opts.push({ id: 'shrimp_egg', ok: has(ctx, 'egg'), w: 1 });
    } else if (pid === 'egg') {
      opts.push({ id: 'egg_stirfry', ok: !!veg, w: 1.3 });
      opts.push({ id: 'custard', ok: !!veg, w: 1 });
      opts.push({ id: 'omelette', ok: !!veg, w: 0.8 });
    } else if (pid === 'tofu') {
      opts.push({ id: 'tofu_braise', ok: true, w: 1 });
    } else if (LEGUME.includes(pid)) {
      opts.push({ id: 'legume_stew', ok: true, w: 1 });
    } else {
      opts.push({ id: 'stirfry', ok: true, w: 1 });
    }
    const m = chooseMethod(ctx, opts.map(x => ({ ...x, id: x.id })));
    return m || (veg ? 'stirfry' : 'steamed');
  }

  function vegMethod(ctx, vid) {
    if (vid === 'eggplant' || vid === 'pumpkin' || vid === 'beet') return 'steam';
    const opts = [
      { id: 'stirfry', ok: true, w: 1.2 },
      { id: 'garlic', ok: LEAFY.includes(vid) || vid === 'broccoli' || vid === 'asparagus', w: 1 },
      { id: 'steam', ok: !LEAFY.includes(vid), w: 0.8 },
      { id: 'soup', ok: SOUP_VEG.includes(vid), w: 1 },
    ];
    return chooseMethod(ctx, opts) || 'stirfry';
  }

  function kidSnack(ctx, slot, day, o) {
    return snack(ctx, slot, day, o);
  }

  // ----- gallery dishes (from the family's own photos) -----

  function galleryMeal(ctx, slot) {
    const mainSlot = slot === 'lunch' || slot === 'dinner' ? ['lunch', 'dinner'] : [slot];
    const snackSlot = slot === 'snack1' || slot === 'snack2';
    const cands = ctx.gallery.filter(g => !ctx.galleryUsed.has(g.id)
      && (g.slots && g.slots.length ? g.slots.some(s => mainSlot.includes(s) || (snackSlot && (s === 'snack1' || s === 'snack2'))) : !snackSlot)
      && (!g.ages || !g.ages.length || g.ages.includes(ctx.prof.age))
      && g.foods.every(id => ctx.ids.has(id)));
    if (!cands.length || ctx.rand() >= ctx.galleryRate) return null;
    const g = cands[Math.floor(ctx.rand() * cands.length)];
    ctx.galleryUsed.add(g.id);
    return galleryToMeal(g, slot);
  }

  function buildMeal(ctx, slot, day, noise, avoid) {
    const o = { noise, avoid };
    const snackSlot = slot === 'snack1' || slot === 'snack2';
    if (ctx.prof.kid) {
      if (slot === 'breakfast') return kidBreakfast(ctx, day, o);
      if (snackSlot) return kidSnack(ctx, slot, day, o);
      return kidMain(ctx, slot, day, o);
    }
    if (slot === 'breakfast') return babyBreakfast(ctx, day, o);
    if (snackSlot) return snack(ctx, slot, day, o);
    return babyMain(ctx, slot, day, o);
  }

  function newDay(prev, hint) {
    return { meals: [], today: new Set(), yesterday: prev ? new Set(prev.today) : new Set(), hasIron: false, hint: hint || new Set() };
  }

  function commit(ctx, day, meal) {
    day.meals.push(meal);
    ctx.combos.add(comboKey(meal));
    ctx.methods[meal.template] = (ctx.methods[meal.template] || 0) + 1;
    if (meal.pmethod) ctx.methods['p:' + meal.pmethod] = (ctx.methods['p:' + meal.pmethod] || 0) + 1;
    for (const id of meal.items) {
      ctx.usage[id] = (ctx.usage[id] || 0) + 1;
      day.today.add(id);
      const f = ctx.catalog.get(id);
      if (f && f.iron) day.hasIron = true;
    }
  }

  function buildUniqueMeal(ctx, slot, day, avoid) {
    let meal = null;
    for (let attempt = 0; attempt < 30; attempt++) {
      meal = buildMeal(ctx, slot, day, Math.min(attempt, 10) * 1.5, avoid);
      if (!ctx.combos.has(comboKey(meal))) break;
    }
    return meal;
  }

  /**
   * generatePlan({ pantry, customFoods, days: 1|7, settings, seed, history, gallery, hints })
   * gallery: [{ id, title, notes, foods: [id], slots?: [slot], ages?: [ageId] }] — the family's own dish photos.
   * hints:   [Set(id)] per day — foods the other child eats that day, preferred so one pot feeds both.
   */
  function generatePlan(opts) {
    const ctx = makeContext(opts);
    const nDays = opts.days || 1;
    const slots = ctx.prof.slots;
    const days = [];
    let prev = null;
    for (let d = 0; d < nDays; d++) {
      const hint = opts.hints && opts.hints[d] ? new Set(opts.hints[d]) : null;
      const day = newDay(prev, hint);
      for (const slot of slots) commit(ctx, day, galleryMeal(ctx, slot) || buildUniqueMeal(ctx, slot, day));
      days.push(day);
      prev = day;
    }
    return {
      mode: nDays > 1 ? 'week' : 'day',
      createdAt: new Date().toISOString(),
      startDate: opts.startDate || new Date().toISOString().slice(0, 10),
      days: days.map(d => ({ meals: d.meals })),
      warnings: pantryWarnings(ctx),
    };
  }

  /** Replace one meal with a different combination, keeping the rest of the plan. */
  function swapMeal(plan, dayIdx, mealIdx, opts) {
    const ctx = makeContext({ ...opts, seed: opts.seed != null ? opts.seed : Date.now() });
    const old = plan.days[dayIdx].meals[mealIdx];
    // Rebuild usage from every other meal.
    plan.days.forEach((d, di) => d.meals.forEach((m, mi) => {
      if (di === dayIdx && mi === mealIdx) return;
      ctx.combos.add(comboKey(m));
      ctx.methods[m.template] = (ctx.methods[m.template] || 0) + 1;
      for (const id of m.items) ctx.usage[id] = (ctx.usage[id] || 0) + 1;
    }));
    ctx.combos.add(comboKey(old));
    const hint = opts.hints && opts.hints[dayIdx] ? new Set(opts.hints[dayIdx]) : null;
    const day = newDay(null, hint);
    plan.days[dayIdx].meals.forEach((m, mi) => { if (mi !== mealIdx) m.items.forEach(id => day.today.add(id)); });
    if (dayIdx > 0) plan.days[dayIdx - 1].meals.forEach(m => m.items.forEach(id => day.yesterday.add(id)));
    day.hasIron = [...day.today].some(id => (ctx.catalog.get(id) || {}).iron);
    // Push away from the old ingredients and method so the swap is visibly different.
    for (const id of old.items) ctx.usage[id] = (ctx.usage[id] || 0) + 2;
    ctx.methods[old.template] = (ctx.methods[old.template] || 0) + 2;
    let meal = buildUniqueMeal(ctx, old.slot, day);
    if (comboKey(meal) === comboKey(old)) meal = buildUniqueMeal(ctx, old.slot, day, old.items);
    return replaceMeal(plan, dayIdx, mealIdx, meal);
  }

  function replaceMeal(plan, dayIdx, mealIdx, meal) {
    const days = plan.days.map((d, di) => di !== dayIdx ? d : { meals: d.meals.map((m, mi) => (mi === mealIdx ? meal : m)) });
    return { ...plan, days };
  }

  /** A meal made from one of the family's own menu-idea pictures. titles/steps are optional { en, zh }. */
  function galleryToMeal(g, slot) {
    const meal = { slot, template: 'gallery', gallery: g.id, title: String(g.title || ''), notes: String(g.notes || ''), items: (g.foods || []).slice(),
      main: null, veg: null, veg2: null, protein: null, fruit: null, partner: null, extra: null, fat: null };
    if (g.titles && (g.titles.en || g.titles.zh)) meal.titles = { en: String(g.titles.en || ''), zh: String(g.titles.zh || '') };
    if (g.steps && (Array.isArray(g.steps.en) || Array.isArray(g.steps.zh))) meal.steps = { en: (g.steps.en || []).map(String), zh: (g.steps.zh || []).map(String) };
    return meal;
  }

  function pantryWarnings(ctx) {
    const w = [];
    for (const cat of ['carb', 'veg', 'fruit', 'protein']) {
      const n = (ctx.byCat[cat] || []).length;
      if (n === 0) w.push({ type: 'missing', cat });
      else if (n < 3) w.push({ type: 'few', cat, n });
    }
    const pantryIds = Object.values(ctx.byCat).flat();
    if (pantryIds.length && !pantryIds.some(f => f.iron)) w.push({ type: 'iron' });
    return w;
  }

  /** Stats for the summary strip. */
  function planStats(plan, customFoods) {
    const catalog = buildCatalog(customFoods);
    const ids = new Set();
    const cats = { carb: new Set(), veg: new Set(), fruit: new Set(), protein: new Set(), dairy: new Set(), fat: new Set() };
    let ironDays = 0;
    const methods = new Set();
    let ideas = 0;
    for (const d of plan.days) {
      let iron = false;
      for (const m of d.meals) {
        methods.add(m.pmethod ? 'p:' + m.pmethod : m.template);
        if (m.template === 'gallery') ideas++;
        for (const id of m.items) {
          ids.add(id);
          const f = catalog.get(id);
          if (f) { cats[f.cat] && cats[f.cat].add(id); if (f.iron) iron = true; }
        }
      }
      if (iron) ironDays++;
    }
    return { distinct: ids.size, cats: Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, v.size])), ironDays, days: plan.days.length, methods: methods.size, ideas };
  }

  /** Usage counts for the history penalty of the next plan. */
  function usageOf(plan) {
    const u = {};
    if (plan) for (const d of plan.days) for (const m of d.meals) for (const id of m.items) u[id] = (u[id] || 0) + 1;
    return u;
  }

  // ---------- text rendering ----------

  function name(catalog, id, lang, full) {
    const f = catalog.get(id);
    if (!f) return id;
    if (!full && f.short) return f.short[lang];
    return lang === 'zh' ? f.zh : f.en;
  }

  function lower(s, lang) {
    return lang === 'zh' ? s : s.charAt(0).toLowerCase() + s.slice(1);
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  // Final texture step by stage.
  const TEXTURE_STEP = [
    { en: 'Blend until completely smooth, thinning with breast milk, formula or cooking water.', zh: '用料理棒打至完全顺滑，可加母乳、配方奶或煮菜的水调稀。' },
    { en: 'Mash with a fork into soft, tiny lumps that squash between your fingers.', zh: '用叉子压成软软的小颗粒，要能用手指轻松捏碎。' },
    { en: 'Chop everything into 2–3 mm bits; it should still be soft and moist.', zh: '全部切成2–3毫米的碎末，保持软、湿润。' },
    { en: 'Cut into soft pieces your child can pick up; each should squash easily between two fingers.', zh: '切成孩子能自己抓的软块，每块都要两根手指一捏就烂。' },
    { en: 'Cut into bite-sized pieces (about 1–2 cm). Quarter grapes and cherry tomatoes.', zh: '切成一口大小（约1–2厘米）。葡萄、小番茄切成四瓣。' },
  ];

  const FINISH_BABY = {
    en: 'Cool to lukewarm and test on your wrist. No salt, sugar, honey or stock cubes.',
    zh: '放至温热，滴在手腕内侧试温。不加盐、糖、蜂蜜或鸡精。',
  };
  const FINISH_KID = {
    en: 'Season lightly: at most a small pinch of salt at the end, no stock cubes, MSG or sugar. Sit with your child while they eat.',
    zh: '清淡调味：出锅前最多加一小撮盐，不加鸡精、味精或糖。孩子吃饭时大人要在旁边。',
  };

  // Stage-appropriate word for fruit served on its own.
  const FRUIT_FORM = [
    { en: 'puree', zh: '泥' }, { en: 'mash', zh: '泥' }, { en: 'chopped', zh: '碎' }, { en: 'soft pieces', zh: '软块' }, { en: 'pieces', zh: '块' },
  ];

  const STAPLE_KID = {
    rice: { en: 'steamed rice', zh: '米饭' }, millet: { en: 'millet rice', zh: '小米饭' }, quinoa: { en: 'quinoa rice', zh: '藜麦饭' },
    couscous: { en: 'couscous', zh: '古斯米' }, mantou: { en: 'steamed bun', zh: '馒头' }, bread: { en: 'whole-wheat bread', zh: '全麦面包' },
  };

  /**
   * Returns { title, steps: [string], ingredients: [{id,name,emoji,allergen,iron}] }.
   * `profile` is a profile/settings object, or (older callers) just a texture id.
   */
  function describeMeal(meal, lang, customFoods, profile) {
    const catalog = buildCatalog(customFoods);
    const prof = profileOf(typeof profile === 'string' ? { texture: profile, age: 'm12' } : profile);
    const L = lang === 'zh' ? 'zh' : 'en';
    const zh = L === 'zh';
    const n = id => (id ? name(catalog, id, L) : '');
    const nl = id => lower(n(id), L);
    const st = prof.stage;
    let title = '';
    const method = [];

    const vp = [meal.veg, meal.protein].filter(Boolean);
    const vpEn = vp.map(nl).join(' & ');
    const vpZh = vp.map(n).join('');
    const carbZh = id => (id === 'rice' ? '米' : n(id));
    // A grain served on the side, named the way it is cooked for this stage.
    const side = id => {
      if (!id) return '';
      const soft = st >= 2;
      const zhName = { rice: soft ? '软饭' : '米粥', millet: '小米粥', oats: '燕麦粥', quinoa: '藜麦粥', noodles: '烂面条' }[id];
      const enName = { rice: soft ? 'soft rice' : 'congee', millet: 'millet porridge', oats: 'oatmeal', quinoa: 'quinoa porridge', noodles: 'soft noodles' }[id];
      return zh ? zhName || n(id) : enName || nl(id);
    };

    switch (meal.template) {
      // ----- baby main dishes -----
      case 'main_porridge': {
        const isRice = meal.main === 'rice';
        const soft = st >= 2;
        title = zh ? `${vpZh}${isRice ? '' : n(meal.main)}${soft && isRice ? '烂饭' : '粥'}` : cap(`${vpEn ? vpEn + ' ' : ''}${isRice ? (soft ? 'soft rice' : 'congee') : nl(meal.main) + ' porridge'}`);
        method.push(zh
          ? `把${vp.map(n).join('和')}拌入${carbZh(meal.main)}${soft && isRice ? '烂饭' : '粥'}，再小火煮2分钟。`
          : `Stir the ${vpEn || 'ingredients'} into the ${isRice ? (soft ? 'soft rice' : 'rice congee') : nl(meal.main)} and simmer 2 more minutes.`);
        break;
      }
      case 'main_noodle':
        title = zh ? `${vpZh}烂面条` : cap(`soft ${vpEn ? vpEn + ' ' : ''}noodles`);
        method.push(zh ? `把煮软的短面条和${vp.map(n).join('、')}一起小火焖2分钟，汤汁收浓。` : `Simmer the short noodles with the ${vpEn} for 2 minutes until thick and saucy.`);
        break;
      case 'main_pasta':
        title = zh ? `${vpZh}酱小意面` : cap(`tiny pasta with ${vpEn || 'vegetable'} sauce`);
        method.push(zh ? `把${vp.map(n).join('、')}打成酱，拌入煮软的小意面。` : `Blend the ${vpEn} into a sauce and stir through the soft pasta.`);
        break;
      case 'main_mash':
        title = zh ? `${vpZh}${n(meal.main)}泥` : cap(`${nl(meal.main)} mash with ${vpEn || 'veggies'}`);
        method.push(zh ? `把${n(meal.main)}压成泥，拌入${vp.map(n).join('和')}。` : `Mash the ${nl(meal.main)} and mix in the ${vpEn}.`);
        break;
      case 'main_bread':
        title = zh ? `${vpZh}汤泡${n(meal.main)}` : cap(`${n(meal.main)} soaked in ${vpEn || 'vegetable'} soup`);
        method.push(zh ? `把${vp.map(n).join('和')}煮成浓汤，${n(meal.main)}撕小块泡软。` : `Cook the ${vpEn} into a thick soup and soak small pieces of ${nl(meal.main)} in it until soft.`);
        break;
      case 'main_nocarb':
        title = zh ? `${vpZh}泥` : cap(`${vpEn} puree`);
        method.push(zh ? '把所有食材一起打匀。' : 'Blend everything together.');
        break;
      case 'egg_custard':
        title = zh ? `${n(meal.veg)}蒸蛋羹${meal.main ? ' + ' + side(meal.main) : ''}` : cap(`steamed egg custard with ${nl(meal.veg)}${meal.main ? ' + ' + side(meal.main) : ''}`);
        method.push(zh
          ? `鸡蛋加1.5倍温水打散过筛，拌入${n(meal.veg)}细末，盖盘子中火蒸10–12分钟至完全凝固。${meal.main ? '搭配软烂的' + n(meal.main) + '。' : ''}`
          : `Whisk the egg with 1.5× its volume of warm water, sieve, stir in the finely chopped ${nl(meal.veg)}, cover and steam 10–12 min until fully set.${meal.main ? ' Serve with the soft ' + nl(meal.main) + '.' : ''}`);
        break;
      case 'tofu_stew':
        title = zh ? `${n(meal.veg)}豆腐羹${meal.main ? ' + ' + side(meal.main) : ''}` : cap(`silken tofu & ${nl(meal.veg)} stew${meal.main ? ' with ' + side(meal.main) : ''}`);
        method.push(zh ? `嫩豆腐和${n(meal.veg)}加少许水小火煮3分钟，压碎成羹。${meal.main ? '配' + n(meal.main) + '。' : ''}` : `Simmer the tofu and ${nl(meal.veg)} in a splash of water for 3 minutes, then mash into a thick stew.${meal.main ? ' Serve over the ' + nl(meal.main) + '.' : ''}`);
        break;
      case 'stew':
        title = zh ? `${n(meal.veg)}炖${n(meal.protein)}${meal.main ? ' + ' + side(meal.main) : ''}` : cap(`${nl(meal.protein)} slow-stewed with ${nl(meal.veg)}${meal.main ? ' + ' + side(meal.main) : ''}`);
        method.push(zh
          ? `${n(meal.protein)}切小块，和${n(meal.veg)}一起加水没过，小火慢炖1–1.5小时，炖到一碰就散（比白煮的肉嫩得多）。`
          : `Cut the ${nl(meal.protein)} small and simmer with the ${nl(meal.veg)}, just covered with water, for 1–1.5 hours until it falls apart (far softer than boiled meat).`);
        if (meal.main) method.push(zh ? `${n(meal.main)}另外煮软，浇上炖汁。` : `Cook the ${nl(meal.main)} soft separately and spoon the stew over.`);
        break;
      case 'meatball':
        title = zh ? `${n(meal.veg)}${n(meal.protein)}小丸子${meal.main ? ' + ' + side(meal.main) : ''}` : cap(`steamed ${nl(meal.protein)} & ${nl(meal.veg)} balls${meal.main ? ' with ' + side(meal.main) : ''}`);
        method.push(zh
          ? `生的${n(meal.protein)}和${n(meal.veg)}一起打成细泥，加1小勺淀粉或燕麦粉拌匀，搓成弹珠大小的丸子，蒸12–15分钟至熟透。`
          : `Blend the raw ${nl(meal.protein)} with the ${nl(meal.veg)} and 1 tsp starch or oat flour, roll marble-sized balls and steam 12–15 min until cooked through.`);
        if (meal.main) method.push(zh ? `配软烂的${n(meal.main)}，可以浇一点蒸出来的汤汁。` : `Serve with the soft ${nl(meal.main)} and a spoon of the steaming juices.`);
        break;
      case 'veg_pancake': {
        const base = meal.main === 'oats' ? (zh ? '燕麦粉' : 'oat flour') : (zh ? '面粉' : 'flour');
        title = zh ? `${n(meal.veg)}鸡蛋软饼` : cap(`soft ${nl(meal.veg)} & egg pancakes`);
        method.push(zh
          ? `${n(meal.veg)}擦细丝或切碎，和1个鸡蛋、2汤匙${base}、少许水拌成稠糊。不粘锅刷薄油，小火每面煎2–3分钟至完全熟透。`
          : `Finely grate the ${nl(meal.veg)} and mix with 1 egg, 2 tbsp ${base} and a splash of water. Cook small pancakes on a lightly oiled non-stick pan, 2–3 min per side on low heat, until cooked through.`);
        break;
      }
      case 'roast':
      {
        const rv = meal.veg && ROAST_VEG.includes(meal.veg) ? meal.veg : null;
        const other = meal.veg && !rv ? meal.veg : null;
        title = zh ? `烤${n(meal.main)}${rv ? '配' + n(rv) : ''}${other || meal.protein ? ' + ' + [other, meal.protein].filter(Boolean).map(n).join('') : ''}` : cap(`oven-roasted ${nl(meal.main)}${rv ? ' & ' + nl(rv) : ''}${other || meal.protein ? ' with ' + [other, meal.protein].filter(Boolean).map(nl).join(' & ') : ''}`);
        method.push(zh
          ? `${n(meal.main)}${rv ? '和' + n(rv) : ''}切块，刷少许油，200°C烤25–35分钟至非常软，味道比水煮更香甜。`
          : `Cut the ${nl(meal.main)}${rv ? ' and ' + nl(rv) : ''} into chunks, brush with a little oil and roast at 200°C for 25–35 min until very soft. Sweeter than boiling.`);
      }
        if (meal.protein) method.push(zh ? `${n(meal.protein)}按上面的方法做熟，和烤好的蔬菜分开放在盘里。` : `Cook the ${nl(meal.protein)} as above and serve next to the roasted veg, not mixed in.`);
        break;
      case 'softrice':
        title = zh ? `${vpZh}软饭` : cap(`soft rice with ${vpEn}`);
        method.push(zh ? '大米加3–4倍水煮30分钟成软饭（比粥稠，比米饭软）。' : 'Cook the rice with 3–4× water for 30 min into soft rice (thicker than congee, softer than normal rice).');
        method.push(zh ? `${vp.map(n).join('和')}切碎拌入软饭，再焖2分钟。` : `Chop the ${vpEn} finely, stir into the rice and cover for 2 minutes.`);
        break;
      case 'wonton':
        title = zh ? `${n(meal.veg)}${n(meal.protein)}小馄饨` : cap(`tiny ${nl(meal.protein)} & ${nl(meal.veg)} wontons`);
        method.push(zh
          ? `${n(meal.protein)}和${n(meal.veg)}剁成细馅，每张薄馄饨皮包小半勺，煮5–6分钟至馅熟透。`
          : `Mince the ${nl(meal.protein)} and ${nl(meal.veg)} into a filling, wrap half a teaspoon in each thin wrapper and boil 5–6 min until the filling is cooked.`);
        method.push(zh ? '捞出剪成小块，可以带一点汤。' : 'Snip into small pieces and serve with a little of the broth.');
        break;
      case 'finger':
        title = zh ? `手指食物拼盘：${n(meal.main)}、${n(meal.veg)}、${n(meal.protein)}` : cap(`finger-food plate: ${nl(meal.main)}, ${nl(meal.veg)} & ${nl(meal.protein)}`);
        method.push(zh
          ? `${n(meal.veg)}切成手指粗的条，蒸到很软；${n(meal.protein)}做成软块或条（豆腐块、蛋饼条、鱼肉碎、小肉丸）；${n(meal.main)}做成软的小块或小饭团。`
          : `Cut the ${nl(meal.veg)} into finger-sized sticks and steam until very soft; make the ${nl(meal.protein)} into soft pieces or strips; serve the ${nl(meal.main)} as soft small pieces or little rice balls.`);
        method.push(zh ? '分成几小堆放在盘子里，让孩子自己抓着吃。' : 'Arrange in separate little piles and let your child feed themselves.');
        break;

      // ----- baby breakfasts -----
      case 'bf_porridge':
      case 'bf_noodle': {
        const base = meal.main === 'rice' ? (zh ? '米' : 'rice') : n(meal.main);
        const oats = meal.main === 'oats';
        title = zh ? `${n(meal.fruit)}${oats ? '燕麦' : base}${meal.template === 'bf_noodle' ? '面' : '粥'}` : cap(`${oats ? 'oatmeal' : nl(meal.main) + (meal.template === 'bf_noodle' ? '' : ' porridge')} with ${meal.fruit ? nl(meal.fruit) : 'fruit'}`);
        method.push(zh ? `把${n(meal.fruit)}拌进温热的${oats ? '燕麦' : base}${meal.template === 'bf_noodle' ? '面' : '粥'}里。水果的天然甜味就够了。` : `Swirl the ${nl(meal.fruit)} into the warm ${oats ? 'oatmeal' : nl(meal.main)}. The fruit is the only sweetener needed.`);
        break;
      }
      case 'bf_mash':
        title = zh ? `${n(meal.main)}${n(meal.fruit)}泥` : cap(`${nl(meal.main)} & ${nl(meal.fruit)} mash`);
        method.push(zh ? `把${n(meal.main)}和${n(meal.fruit)}一起压成泥。` : `Mash the ${nl(meal.main)} and ${nl(meal.fruit)} together.`);
        break;
      case 'bf_bread':
        title = zh ? `${n(meal.main)} + ${n(meal.fruit)}` : cap(`${nl(meal.main)} with ${nl(meal.fruit)}`);
        method.push(zh ? `${n(meal.main)}撕成小块，配${n(meal.fruit)}。` : `Tear the ${nl(meal.main)} into small pieces and serve with the ${nl(meal.fruit)}.`);
        break;
      case 'pancake': {
        const base = meal.main === 'flour' ? (zh ? '面粉' : 'flour') : (zh ? '燕麦粉' : 'oat flour');
        title = zh ? `${n(meal.fruit)}${meal.main === 'flour' ? '' : '燕麦'}软饼` : cap(`soft ${nl(meal.fruit)}${meal.main === 'flour' ? '' : '-oat'} pancakes`);
        method.push(zh
          ? `${n(meal.fruit)}压泥，加1个鸡蛋和3汤匙${base}拌匀。不粘锅刷薄油，小火每面煎2分钟至熟透。饼很软，可以撕小块。`
          : `Mash the ${nl(meal.fruit)} and mix with 1 egg and 3 tbsp ${base}. Cook small rounds on a lightly oiled non-stick pan, 2 min per side on low heat, until cooked through. Tear into soft pieces.`);
        break;
      }
      case 'steamcake':
        title = zh ? `${n(meal.fruit)}燕麦蒸糕` : cap(`${nl(meal.fruit)}-oat steamed cake`);
        method.push(zh
          ? `${n(meal.fruit)}压泥，加1个鸡蛋和4汤匙燕麦粉拌匀，倒进抹油的小碗，大火蒸20分钟，筷子插入不粘即熟。放凉切小块，不用加糖。`
          : `Mash the ${nl(meal.fruit)} with 1 egg and 4 tbsp oat flour, pour into a greased small bowl and steam 20 min until a chopstick comes out clean. Cool and cut into cubes. No sugar needed.`);
        break;
      case 'oat_yogurt':
        title = zh ? `${n(meal.fruit)}酸奶燕麦杯` : cap(`overnight oats with yogurt & ${nl(meal.fruit)}`);
        method.push(zh ? '燕麦片用原味酸奶（或奶）浸泡一夜冷藏，或至少泡30分钟到完全软。' : 'Soak the oats in plain yogurt (or milk) overnight in the fridge, or at least 30 minutes until completely soft.');
        method.push(zh ? `吃前拌入${n(meal.fruit)}。` : `Stir in the ${nl(meal.fruit)} before serving.`);
        break;

      // ----- snacks -----
      case 'fruit_only':
      case 'snack_fruit': {
        const form = FRUIT_FORM[st][L];
        title = zh ? `${n(meal.fruit)}${form}` : cap(`${nl(meal.fruit)} ${form}`);
        break;
      }
      case 'snack_dairy':
        title = meal.partner === 'yogurt'
          ? (zh ? `${n(meal.fruit)}酸奶` : cap(`yogurt with ${nl(meal.fruit)}`))
          : (zh ? `${n(meal.fruit)}拌软奶酪` : cap(`${nl(meal.fruit)} with ${nl(meal.partner)}`));
        method.push(zh ? `把${n(meal.fruit)}拌入${n(meal.partner)}。` : `Stir the ${nl(meal.fruit)} into the ${nl(meal.partner)}.`);
        break;
      case 'snack_avocado':
        title = zh ? `牛油果${n(meal.fruit)}${st >= 3 ? '块' : '泥'}` : cap(`avocado & ${nl(meal.fruit)} ${st >= 3 ? 'pieces' : 'mash'}`);
        method.push(zh ? `牛油果和${n(meal.fruit)}现切现吃（会氧化变色）。` : `Prepare the avocado and ${nl(meal.fruit)} just before serving (avocado browns).`);
        break;
      case 'snack_two_fruit':
        title = zh ? `${n(meal.fruit)}${n(meal.partner)}${FRUIT_FORM[st].zh}` : cap(`${nl(meal.fruit)} & ${nl(meal.partner)} ${FRUIT_FORM[st].en}`);
        break;
      case 'snack_simple':
        title = zh ? `${n(meal.fruit)}` : cap(nl(meal.fruit));
        break;

      // ----- family food: breakfasts -----
      case 'k_porridge':
        title = zh ? `${carbZh(meal.main)}粥${meal.protein ? ' + 水煮蛋' : ''}${meal.fruit ? ' + ' + n(meal.fruit) : ''}` : cap(`${meal.main === 'rice' ? 'rice congee' : nl(meal.main) + ' porridge'}${meal.protein ? ' + boiled egg' : ''}${meal.fruit ? ' + ' + nl(meal.fruit) : ''}`);
        method.push(zh ? `${carbZh(meal.main)}提前泡好或用电饭煲预约煮粥。` : `Cook the ${nl(meal.main)} porridge (use the rice cooker timer overnight).`);
        if (meal.protein) method.push(zh ? '鸡蛋冷水下锅，水开后煮8–10分钟至全熟。' : 'Boil the egg 8–10 minutes after the water boils, until fully set.');
        break;
      case 'k_omelette': {
        const withFlour = meal.main === 'flour';
        title = zh ? (withFlour ? `${n(meal.veg)}鸡蛋饼` : `${n(meal.veg)}炒蛋 + ${n(meal.main)}`) : cap(withFlour ? `${nl(meal.veg)} & egg pancake` : `scrambled egg with ${nl(meal.veg)} + ${nl(meal.main)}`);
        if (meal.fruit) title += zh ? ` + ${n(meal.fruit)}` : ` + ${nl(meal.fruit)}`;
        method.push(withFlour
          ? (zh ? `${n(meal.veg)}切碎，和1–2个鸡蛋、3汤匙面粉、少许水拌成糊，平底锅少油小火煎熟，切小块。` : `Chop the ${nl(meal.veg)} and mix with 1–2 eggs, 3 tbsp flour and a splash of water. Cook on low heat in a little oil, then cut into strips.`)
          : (zh ? `${n(meal.veg)}切小丁炒软，倒入打散的鸡蛋炒至全熟。${n(meal.main)}蒸热或烤一下。` : `Soften the diced ${nl(meal.veg)} in a little oil, add beaten egg and scramble until fully set. Warm the ${nl(meal.main)}.`));
        break;
      }
      case 'k_toast': {
        const top = { egg: zh ? '鸡蛋' : 'egg', avocado: zh ? '牛油果' : 'avocado', ricotta: zh ? '奶酪' : 'soft cheese' }[meal.extra] || '';
        title = zh ? `${top}吐司条${meal.fruit ? ' + ' + n(meal.fruit) : ''}` : cap(`${top} toast fingers${meal.fruit ? ' + ' + nl(meal.fruit) : ''}`);
        method.push(zh ? `全麦面包稍微烤一下，${meal.extra === 'egg' ? '放上炒熟的鸡蛋' : meal.extra === 'avocado' ? '抹上压碎的牛油果' : '抹一层软奶酪'}，切成手指条。` : `Lightly toast the bread, top with ${meal.extra === 'egg' ? 'scrambled egg (fully set)' : meal.extra === 'avocado' ? 'mashed avocado' : 'soft cheese'} and cut into fingers.`);
        break;
      }
      case 'k_noodle':
        title = zh ? `${n(meal.veg)}鸡蛋面` : cap(`${nl(meal.veg)} & egg noodle soup`);
        method.push(zh ? `${n(meal.veg)}切小块加水煮开，放面条煮软，淋入蛋液煮至全熟，面条剪短。` : `Simmer the chopped ${nl(meal.veg)}, add the noodles and cook until soft, then stir in beaten egg until fully set. Snip the noodles short.`);
        break;
      case 'k_yogurt':
        title = zh ? `${n(meal.fruit)}酸奶燕麦杯` : cap(`yogurt, oat & ${nl(meal.fruit)} cup`);
        method.push(zh ? `原味酸奶、燕麦片（提前泡软或隔夜燕麦）和${n(meal.fruit)}块分层装杯。` : `Layer plain yogurt, soaked oats and ${nl(meal.fruit)} pieces in a cup.`);
        break;
      case 'k_mantou':
        title = zh ? `馒头${meal.protein ? ' + 煎蛋' : ''}${meal.partner ? ' + 牛奶' : ''}${meal.fruit ? ' + ' + n(meal.fruit) : ''}` : cap(`steamed bun${meal.protein ? ' + fried egg' : ''}${meal.partner ? ' + milk' : ''}${meal.fruit ? ' + ' + nl(meal.fruit) : ''}`);
        method.push(zh ? '馒头蒸热切片。鸡蛋少油煎至两面全熟。' : 'Steam the bun and slice. Fry the egg in a little oil until both sides are fully set.');
        break;
      case 'k_pancake':
        title = zh ? `${n(meal.fruit)}松饼` : cap(`${nl(meal.fruit)} pancakes`);
        method.push(zh ? `${n(meal.fruit)}压泥，加1个鸡蛋、4汤匙${meal.main === 'flour' ? '面粉' : '燕麦粉'}和少许奶，小火煎成小松饼。不加糖。` : `Mash the ${nl(meal.fruit)} with 1 egg, 4 tbsp ${meal.main === 'flour' ? 'flour' : 'oat flour'} and a splash of milk; cook small pancakes on low heat. No sugar.`);
        break;

      // ----- family food: lunch & dinner -----
      case 'k_set': {
        const dishes = kidSetDishes(meal, L, n, nl);
        title = dishes.titles.join(zh ? ' + ' : ' + ');
        method.push(...dishes.steps);
        break;
      }
      case 'k_friedrice':
        title = zh ? (meal.protein === 'egg' ? `${n(meal.veg)}蛋炒饭` : `${n(meal.veg)}${n(meal.protein)}炒饭`) : cap(`${nl(meal.veg)} & ${nl(meal.protein)} fried rice`);
        method.push(zh ? '用隔夜米饭更好炒。' : 'Day-old rice works best.');
        method.push(zh
          ? `${n(meal.protein)}切小丁先炒熟盛出，再炒${[meal.veg, meal.veg2].filter(Boolean).map(n).join('、')}丁，加米饭和${n(meal.protein)}翻炒均匀。`
          : `Cook the diced ${nl(meal.protein)} first and set aside; stir-fry the diced ${[meal.veg, meal.veg2].filter(Boolean).map(nl).join(' and ')}, then add the rice and ${nl(meal.protein)} and toss until hot.`);
        break;
      case 'k_dumpling':
        title = zh ? `${n(meal.protein)}${n(meal.veg)}饺子` : cap(`${nl(meal.protein)} & ${nl(meal.veg)} dumplings`);
        method.push(zh ? `${n(meal.protein)}和${n(meal.veg)}剁成馅，可加少许香油，用饺子皮包好。` : `Mince the ${nl(meal.protein)} and ${nl(meal.veg)} into a filling (a drop of sesame oil is fine) and wrap in dumpling wrappers.`);
        method.push(zh ? '水开下锅，点两次冷水，煮到饺子浮起、馅熟透。多包的可以冷冻。' : 'Boil until they float and the filling is cooked through. Freeze extras for busy nights.');
        break;
      case 'k_noodle_dish':
        title = zh ? `${n(meal.veg)}${n(meal.protein)}汤面` : cap(`${nl(meal.protein)} & ${nl(meal.veg)} noodle soup`);
        method.push(zh ? `${n(meal.protein)}切小块煮熟，加${[meal.veg, meal.veg2].filter(Boolean).map(n).join('、')}和面条煮软，面条剪短。` : `Cook the ${nl(meal.protein)} in small pieces, add the ${[meal.veg, meal.veg2].filter(Boolean).map(nl).join(' and ')} and the noodles and simmer until soft. Snip the noodles short.`);
        break;
      case 'k_pasta':
        title = zh ? `${n(meal.veg)}${n(meal.protein)}意面` : cap(`${nl(meal.protein)} & ${nl(meal.veg)} pasta`);
        method.push(zh ? `意面煮软；${n(meal.protein)}和${[meal.veg, meal.veg2].filter(Boolean).map(n).join('、')}切小丁炒熟，加少许水或番茄做成酱，拌入意面。` : `Cook the pasta; sauté the diced ${nl(meal.protein)} and ${[meal.veg, meal.veg2].filter(Boolean).map(nl).join(' and ')} with a splash of water (or tomato) into a sauce and toss through.`);
        break;
      case 'k_simple':
        title = zh ? `${[meal.main, meal.veg, meal.protein].filter(Boolean).map(n).join(' + ')}` : cap([meal.main, meal.veg, meal.protein].filter(Boolean).map(nl).join(' + '));
        method.push(zh ? '分别做熟，切成小块。' : 'Cook each food and cut into small pieces.');
        break;

      // ----- the family's own dishes -----
      case 'gallery': {
        title = (meal.titles && (meal.titles[L] || meal.titles.zh || meal.titles.en)) || meal.title || (zh ? '我的菜' : 'My dish');
        const byLang = meal.steps || {};
        const own = [byLang[L], byLang.zh, byLang.en].find(x => Array.isArray(x) && x.length);
        if (own) method.push(...own);
        else if (meal.notes) method.push(...String(meal.notes).split(/\n+/).map(x => x.trim()).filter(Boolean));
        break;
      }
      default:
        title = zh ? '（食材不足，请添加更多食材）' : '(Not enough foods — add more at home)';
    }

    if (meal.extra && ['bf_porridge', 'bf_noodle', 'bf_mash', 'bf_bread', 'fruit_only'].includes(meal.template)) {
      title += zh ? ` + ${n(meal.extra)}` : ` + ${nl(meal.extra)}`;
    }
    if (meal.fat && !prof.kid) {
      method.push(zh ? `出锅后拌入${n(meal.fat)}。` : `Stir in the ${nl(meal.fat)} at the end.`);
    }

    const steps = [];
    const own = meal.template === 'gallery' && (meal.notes || (meal.steps && ((meal.steps.en || []).length || (meal.steps.zh || []).length)));
    const selfContained = ['pancake', 'steamcake', 'veg_pancake'].includes(meal.template);
    if (!prof.kid && !own && !selfContained) {
      for (const id of meal.items) {
        const f = catalog.get(id);
        if (!f) continue;
        if (meal.template === 'wonton' && id === 'flour') continue;
        const p = f.prep ? f.prep[L] : '';
        steps.push(`${name(catalog, id, L, true)}${zh ? '：' : ': '}${p || (zh ? '洗净，煮或蒸至非常软烂。' : 'Wash, then steam or boil until very soft.')}`);
      }
    }
    steps.push(...method.map(x => x.trim()).filter(Boolean));
    if (meal.template !== 'empty') {
      steps.push(TEXTURE_STEP[st][L]);
      steps.push((prof.baby ? FINISH_BABY : FINISH_KID)[L]);
    }

    const ingredients = meal.items.map(id => {
      const f = catalog.get(id) || { id };
      return { id, name: name(catalog, id, L, true), emoji: f.emoji || '🍽️', allergen: f.allergen || null, iron: !!f.iron };
    });
    return { title, steps, ingredients };
  }

  /** Names and steps for a family-style set: staple + protein dish + vegetable dish. */
  function kidSetDishes(meal, L, n, nl) {
    const zh = L === 'zh';
    const titles = [];
    const steps = [];
    const p = meal.protein;
    const v = meal.veg;
    const staple = meal.main ? (STAPLE_KID[meal.main] ? STAPLE_KID[meal.main][L] : (zh ? `蒸${n(meal.main)}` : `steamed ${nl(meal.main)}`)) : '';
    if (staple) titles.push(zh ? staple : cap(staple));
    switch (meal.pmethod) {
      case 'stirfry':
        titles.push(zh ? `${n(v)}炒${n(p)}` : cap(`stir-fried ${nl(p)} with ${nl(v)}`));
        steps.push(zh ? `${n(p)}切细丝或小片，${n(v)}切小块。少油先把${n(p)}炒熟，再下${n(v)}，加一点水盖盖焖2–3分钟到软。` : `Slice the ${nl(p)} thinly and cut the ${nl(v)} small. Stir-fry the ${nl(p)} in a little oil until cooked, add the ${nl(v)} and a splash of water, cover 2–3 min until tender.`);
        break;
      case 'braise':
        titles.push(zh ? `${n(v)}炖${n(p)}` : cap(`${nl(p)} braised with ${nl(v)}`));
        steps.push(zh ? `${n(p)}切2厘米小块，焯水去浮沫，和${n(v)}加水没过，小火炖45–60分钟到软烂。` : `Cut the ${nl(p)} into 2 cm cubes, blanch, then simmer with the ${nl(v)} just covered in water for 45–60 min until tender.`);
        break;
      case 'meatball':
        titles.push(zh ? `${n(v)}${n(p)}丸子` : cap(`${nl(p)} & ${nl(v)} meatballs`));
        steps.push(zh ? `${n(p)}和${n(v)}剁碎，加1汤匙淀粉搅上劲，搓小丸子，蒸15分钟或下汤煮熟。` : `Mince the ${nl(p)} with the ${nl(v)} and 1 tbsp starch, roll small balls, then steam 15 min or poach in broth until cooked.`);
        break;
      case 'steamed':
        titles.push(zh ? `清蒸${n(p)}` : cap(`steamed ${nl(p)}`));
        steps.push(zh ? `${n(p)}放几片姜，水开后蒸8–10分钟，淋少许热油。仔细挑刺。` : `Steam the ${nl(p)} with a few slices of ginger for 8–10 min; drizzle a little hot oil. Check carefully for bones.`);
        break;
      case 'fish_sauce':
        titles.push(zh ? `${n(v)}烩${n(p)}` : cap(`${nl(p)} in ${nl(v)} sauce`));
        steps.push(zh ? `${n(v)}切碎炒软加少许水煮成酱，放入${n(p)}块小火煮5–6分钟至熟。仔细挑刺。` : `Cook the chopped ${nl(v)} down with a little water into a sauce, add the ${nl(p)} pieces and simmer 5–6 min. Check for bones.`);
        break;
      case 'fishcake':
        titles.push(zh ? `${n(p)}土豆饼` : cap(`${nl(p)} & potato cakes`));
        steps.push(zh ? `土豆蒸熟压泥，${n(p)}蒸熟去刺压碎，拌匀做成小饼，平底锅少油小火煎至两面金黄。` : `Mash steamed potato with steamed, boned ${nl(p)}, shape small cakes and pan-fry in a little oil until golden on both sides.`);
        break;
      case 'shrimp_egg':
        titles.push(zh ? '虾仁蒸蛋' : 'Steamed egg with shrimp');
        steps.push(zh ? '鸡蛋加1.5倍温水打散过筛，放入切小丁的虾仁，盖盘子蒸12分钟至凝固。' : 'Whisk egg with 1.5× warm water, sieve, add diced shrimp, cover and steam 12 min until set.');
        break;
      case 'egg_stirfry':
        titles.push(zh ? (v === 'tomato' ? '番茄炒蛋' : `${n(v)}炒蛋`) : cap(v === 'tomato' ? 'tomato & egg stir-fry' : `scrambled egg with ${nl(v)}`));
        steps.push(zh ? `鸡蛋打散炒熟盛出，${n(v)}切块炒软，再倒回鸡蛋翻匀。` : `Scramble the eggs until set and set aside; soften the ${nl(v)} in the pan, then return the egg and toss.`);
        break;
      case 'custard':
        titles.push(zh ? `${n(v)}蒸蛋` : cap(`steamed egg with ${nl(v)}`));
        steps.push(zh ? `鸡蛋加1.5倍温水打散，拌入${n(v)}碎，盖盘子蒸10–12分钟。` : `Whisk egg with 1.5× warm water, stir in chopped ${nl(v)}, cover and steam 10–12 min.`);
        break;
      case 'omelette':
        titles.push(zh ? `${n(v)}鸡蛋饼` : cap(`${nl(v)} omelette`));
        steps.push(zh ? `${n(v)}切碎拌入蛋液，小火煎成蛋饼，切条。` : `Stir chopped ${nl(v)} into beaten egg, cook a thin omelette on low heat and cut into strips.`);
        break;
      case 'tofu_braise':
        titles.push(zh ? `${v ? n(v) : ''}烧豆腐` : cap(`braised tofu${v ? ' with ' + nl(v) : ''}`));
        steps.push(zh ? `豆腐切小块，${v ? '和' + n(v) + '一起' : ''}加少许水小火烧5分钟，勾薄芡。` : `Cube the tofu and simmer ${v ? 'with the ' + nl(v) + ' ' : ''}in a little water for 5 minutes; thicken with a little starch.`);
        break;
      case 'legume_stew':
        titles.push(zh ? `${v ? n(v) : ''}${n(p)}炖菜` : cap(`${nl(p)}${v ? ' & ' + nl(v) : ''} stew`));
        steps.push(zh ? `${n(p)}和${v ? n(v) : '蔬菜'}加水小火炖到软烂浓稠（红扁豆约20分钟）。` : `Simmer the ${nl(p)} with the ${v ? nl(v) : 'veg'} until soft and thick (red lentils take about 20 min).`);
        break;
      default:
        if (p) titles.push(zh ? n(p) : cap(nl(p)));
        if (p) steps.push(zh ? `${n(p)}做熟，切小块。` : `Cook the ${nl(p)} and cut into small pieces.`);
    }
    if (meal.veg2) {
      const v2 = meal.veg2;
      const vm = meal.vmethod || 'stirfry';
      const t = {
        stirfry: [zh ? `清炒${n(v2)}` : `stir-fried ${nl(v2)}`, zh ? `${n(v2)}切小段，少油快炒，加一点水焖软。` : `Stir-fry the ${nl(v2)} quickly in a little oil, then add a splash of water and cover until soft.`],
        garlic: [zh ? `蒜蓉${n(v2)}` : `garlic ${nl(v2)}`, zh ? `少许蒜末爆香，下${n(v2)}炒软。` : `Sizzle a little garlic, add the ${nl(v2)} and cook until soft.`],
        steam: [zh ? `蒸${n(v2)}` : `steamed ${nl(v2)}`, zh ? `${n(v2)}切条蒸8–12分钟到软，淋几滴油。` : `Steam the ${nl(v2)} in sticks for 8–12 min until soft; add a few drops of oil.`],
        soup: [zh ? `${n(v2)}汤` : `${nl(v2)} soup`, zh ? `${n(v2)}切片加水煮10分钟，可以打个蛋花。` : `Simmer the sliced ${nl(v2)} in water for 10 minutes; swirl in an egg if you like.`],
      }[vm] || [zh ? n(v2) : nl(v2), ''];
      titles.push(zh ? t[0] : cap(t[0]));
      if (t[1]) steps.push(t[1]);
    }
    if (meal.main && ['rice', 'millet', 'quinoa'].includes(meal.main)) steps.unshift(zh ? `${n(meal.main)}淘洗后加水煮成${STAPLE_KID[meal.main].zh}（比大人的稍软一点）。` : `Cook the ${nl(meal.main)} a little softer than for adults.`);
    return { titles, steps };
  }

  // ---------- portions & nutrition ----------

  const DEFAULT_PORTION = { carb: 40, veg: 30, fruit: 40, protein: 25, dairy: 50, fat: 5 };

  /** Weighed dry (grains, pasta, flour, lentils, prunes) rather than raw. Buns and bread are weighed as they are. */
  function isDry(f) {
    return (f.cat === 'carb' && f.form && f.form !== 'mash' && f.form !== 'bread') || f.id === 'lentils' || f.id === 'prune';
  }

  function round5(g) {
    return g < 10 ? Math.round(g) : Math.round(g / 5) * 5;
  }

  /** Suggested grams of one ingredient in one meal. `age` is an age-group id (default 12–24 months). */
  function portionFor(meal, id, catalog, age) {
    const f = catalog.get(id);
    if (!f) return 0;
    const scale = ageGroup(age).scale;
    const base = f.portion || DEFAULT_PORTION[f.cat] || 30;
    if (id === 'egg') return 50; // one egg
    if (id === 'milk') return round5(150 * Math.min(scale, 1.3));
    let g = base;
    const snack = meal.slot === 'snack1' || meal.slot === 'snack2';
    if (id === 'flour') {
      g = ['wonton', 'k_dumpling'].includes(meal.template) ? 30 : 15;
    } else if (snack) {
      if (f.cat === 'fruit') g = meal.template === 'snack_two_fruit' ? base * 0.75 : base * 1.25;
      else if (f.id === 'yogurt') g = 60;
    } else if (meal.slot === 'breakfast') {
      if (f.cat === 'carb' && f.form === 'mash') g = base * 0.8;
      else if (f.cat === 'dairy') g = base * 0.85;
      else if (f.id === 'avocado') g = base * 0.75;
    } else if (f.cat === 'veg' && meal.veg && meal.veg2) {
      g = base * 0.8; // two vegetables share the plate
    }
    return round5(g * scale);
  }

  function zeroTotals() {
    return DATA.NUTRIENTS.map(() => 0);
  }

  /** { grams: {id: g}, totals: [..NUTRIENTS], uncounted: [id] } for one meal. */
  function mealNutrition(meal, customFoods, age) {
    const catalog = buildCatalog(customFoods);
    const grams = {};
    const totals = zeroTotals();
    const uncounted = [];
    for (const id of meal.items) {
      const g = portionFor(meal, id, catalog, age);
      grams[id] = g;
      const f = catalog.get(id);
      if (!f || !f.n) { uncounted.push(id); continue; }
      f.n.forEach((v, i) => { totals[i] += (v * g) / 100; });
    }
    return { grams, totals, uncounted };
  }

  /**
   * Daily totals: food + milk. milk = { type: 'whole'|'breast'|'formula', ml }.
   * Returns { food, milk, total } arrays in NUTRIENTS order, plus uncounted custom foods.
   */
  function dayNutrition(day, customFoods, milk, age) {
    const food = zeroTotals();
    const uncounted = new Set();
    for (const m of day.meals) {
      const r = mealNutrition(m, customFoods, age);
      r.totals.forEach((v, i) => { food[i] += v; });
      r.uncounted.forEach(id => uncounted.add(id));
    }
    const mk = DATA.MILKS.find(x => x.id === (milk && milk.type)) || DATA.MILKS[0];
    const ml = milk && milk.ml != null ? milk.ml : 400;
    const milkT = mk.n.map(v => (v * ml) / 100);
    return { food, milk: milkT, total: food.map((v, i) => v + milkT[i]), uncounted: [...uncounted] };
  }

  /** Daily needs for an age group, in NUTRIENTS order. */
  function needsFor(age) {
    return ageGroup(age).needs;
  }

  const api = {
    SLOTS, SLOT_ORDER, portionFor, mealNutrition, dayNutrition, needsFor, isDry, generatePlan, swapMeal, replaceMeal, galleryToMeal,
    describeMeal, parseFoodText, foodsInText, planStats, usageOf, buildCatalog, slotsFor, profileOf, ageGroup, comboKey, mulberry32,
  };
  root.TDM_PLANNER = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
