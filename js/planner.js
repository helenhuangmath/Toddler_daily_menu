/*
 * Menu planner. Pure functions: no DOM, so it runs in the browser and in Node tests.
 *
 * A plan is { days: [{ meals: [Meal] }], createdAt, mode }.
 * A Meal stores only ingredient ids + a template key; the text (dish name and
 * steps) is rendered per language by describeMeal(), so switching language never
 * changes the menu.
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

  // "fresh carrots" contains "carrot", "新鲜胡萝卜" contains "胡萝卜", but "pineapple" must not match "apple".
  function containsWord(text, word) {
    if (/[一-鿿]/.test(word)) return text.includes(word);
    const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(^|[^a-z])' + esc + '(e?s)?($|[^a-z])').test(text);
  }

  // ---------- core planner ----------

  // Porridges plus the naturally sweet mashes read like breakfast; plain potato or pasta do not.
  const BREAKFAST_CARB = f => f.form === 'porridge' || f.id === 'sweetpotato' || f.id === 'chineseyam' || (f.custom && f.form === 'mash');

  function slotsFor(settings) {
    return settings.snacks === false
      ? ['breakfast', 'lunch', 'dinner']
      : ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'];
  }

  function makeContext(opts) {
    const catalog = buildCatalog(opts.customFoods);
    const exclude = new Set((opts.settings && opts.settings.exclude) || []);
    const pantry = (opts.pantry || [])
      .map(id => catalog.get(id))
      .filter(f => f && !exclude.has(f.allergen));
    const byCat = {};
    for (const f of pantry) (byCat[f.cat] = byCat[f.cat] || []).push(f);
    return {
      catalog,
      byCat,
      rand: mulberry32(opts.seed != null ? opts.seed : Date.now()),
      usage: {}, // id -> count in this plan
      history: opts.history || {}, // id -> count in the previous plan (soft penalty)
      combos: new Set(),
      settings: opts.settings || {},
    };
  }

  function has(ctx, cat) {
    return (ctx.byCat[cat] || []).length > 0;
  }

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
      s += (ctx.history[f.id] || 0) * 0.25;
      if (f.iron && !day.hasIron) s -= 0.8;
      s += ctx.rand() * (1.2 + (opts && opts.noise ? opts.noise : 0));
      if (s < bestScore) { bestScore = s; best = f; }
    }
    return best;
  }

  function comboKey(meal) {
    return meal.template + ':' + meal.items.slice().sort().join('+');
  }

  function buildMeal(ctx, slot, day, noise, avoid) {
    const o = { noise, avoid };
    const meal = { slot, items: [], template: '' };
    const add = f => { if (f) meal.items.push(f.id); return f; };

    if (slot === 'breakfast') {
      const carb = add(pick(ctx, 'carb', day, { ...o, filter: f => BREAKFAST_CARB(f) }) || pick(ctx, 'carb', day, o));
      const fruit = add(pick(ctx, 'fruit', day, o));
      // Rotate the extra between egg, dairy and fat for variety.
      const r = ctx.rand();
      const egg = (ctx.byCat.protein || []).find(f => f.id === 'egg');
      let extra = null;
      if (egg && !day.today.has('egg') && r < 0.34 && !(o.avoid || []).includes('egg')) extra = egg;
      const spread = { ...o, filter: f => f.id !== 'oliveoil' }; // oil is stirred into mains, not served as a topping
      if (!extra && r < 0.7) extra = pick(ctx, 'dairy', day, { ...o, filter: f => f.id !== 'milk' }) || pick(ctx, 'fat', day, spread);
      else if (!extra) extra = pick(ctx, 'fat', day, spread) || pick(ctx, 'dairy', day, { ...o, filter: f => f.id !== 'milk' });
      add(extra);
      if (carb && fruit && carb.id === 'oats' && fruit.id === 'banana' && extra && extra.id === 'egg') meal.template = 'pancake';
      else if (carb) meal.template = carb.form === 'mash' ? 'bf_mash' : carb.form === 'noodle' ? 'bf_noodle' : 'bf_porridge';
      else meal.template = fruit ? 'fruit_only' : 'empty';
      meal.extra = extra ? extra.id : null;
      meal.main = carb ? carb.id : null;
      meal.fruit = fruit ? fruit.id : null;
    } else if (slot === 'snack1' || slot === 'snack2') {
      const fruit = add(pick(ctx, 'fruit', day, o));
      const r = ctx.rand();
      let partner = null;
      if (r < 0.45) partner = pick(ctx, 'dairy', day, { ...o, filter: f => f.id !== 'milk' });
      else if (r < 0.7) partner = (ctx.byCat.fat || []).find(f => f.id === 'avocado') || null;
      else if (r < 0.85 && fruit) partner = pick(ctx, 'fruit', day, { ...o, avoid: [...(o.avoid || []), fruit.id] });
      if (partner && partner.id === 'avocado' && day.today.has('avocado')) partner = null;
      add(partner);
      if (!fruit) {
        const alt = add(pick(ctx, 'dairy', day, o) || pick(ctx, 'carb', day, { ...o, filter: f => f.form === 'mash' }));
        meal.template = alt ? 'snack_simple' : 'empty';
        meal.fruit = alt ? alt.id : null;
      } else {
        meal.fruit = fruit.id;
        meal.partner = partner ? partner.id : null;
        meal.template = !partner ? 'snack_fruit' : partner.cat === 'dairy' ? 'snack_dairy' : partner.cat === 'fat' ? 'snack_avocado' : 'snack_two_fruit';
      }
    } else {
      // lunch / dinner: starch + vegetable + protein (+ a little fat)
      const carb = add(pick(ctx, 'carb', day, o));
      const veg = add(pick(ctx, 'veg', day, o));
      const protein = add(pick(ctx, 'protein', day, o));
      let fat = null;
      if (ctx.rand() < 0.5) fat = add(pick(ctx, 'fat', day, { ...o, filter: f => f.id === 'oliveoil' || f.id === 'butter' || f.id === 'tahini' }));
      meal.main = carb ? carb.id : null;
      meal.veg = veg ? veg.id : null;
      meal.protein = protein ? protein.id : null;
      meal.fat = fat ? fat.id : null;
      if (protein && protein.id === 'egg' && veg && ctx.rand() < 0.6) meal.template = 'egg_custard';
      else if (protein && protein.id === 'tofu' && veg && ctx.rand() < 0.5) meal.template = 'tofu_stew';
      else if (carb) meal.template = 'main_' + carb.form;
      else if (veg || protein) meal.template = 'main_nocarb';
      else meal.template = 'empty';
    }
    return meal;
  }

  function newDay(prev) {
    return { meals: [], today: new Set(), yesterday: prev ? new Set(prev.today) : new Set(), hasIron: false };
  }

  function commit(ctx, day, meal) {
    day.meals.push(meal);
    ctx.combos.add(comboKey(meal));
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
   * generatePlan({ pantry: [id], customFoods: [food], days: 1|7, settings, seed, history })
   */
  function generatePlan(opts) {
    const ctx = makeContext(opts);
    const nDays = opts.days || 1;
    const slots = slotsFor(ctx.settings);
    const days = [];
    let prev = null;
    for (let d = 0; d < nDays; d++) {
      const day = newDay(prev);
      for (const slot of slots) commit(ctx, day, buildUniqueMeal(ctx, slot, day));
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
      for (const id of m.items) ctx.usage[id] = (ctx.usage[id] || 0) + 1;
    }));
    ctx.combos.add(comboKey(old));
    const day = newDay();
    plan.days[dayIdx].meals.forEach((m, mi) => { if (mi !== mealIdx) m.items.forEach(id => day.today.add(id)); });
    if (dayIdx > 0) plan.days[dayIdx - 1].meals.forEach(m => m.items.forEach(id => day.yesterday.add(id)));
    day.hasIron = [...day.today].some(id => (ctx.catalog.get(id) || {}).iron);
    // Push away from the old ingredients so the swap is visibly different.
    for (const id of old.items) ctx.usage[id] = (ctx.usage[id] || 0) + 2;
    let meal = buildUniqueMeal(ctx, old.slot, day);
    if (comboKey(meal) === comboKey(old)) meal = buildUniqueMeal(ctx, old.slot, day, old.items);
    const days = plan.days.map((d, di) => di !== dayIdx ? d : { meals: d.meals.map((m, mi) => (mi === mealIdx ? meal : m)) });
    return { ...plan, days };
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
    for (const d of plan.days) {
      let iron = false;
      for (const m of d.meals) for (const id of m.items) {
        ids.add(id);
        const f = catalog.get(id);
        if (f) { cats[f.cat] && cats[f.cat].add(id); if (f.iron) iron = true; }
      }
      if (iron) ironDays++;
    }
    return { distinct: ids.size, cats: Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, v.size])), ironDays, days: plan.days.length };
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
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  const TEXTURE = {
    puree: {
      en: 'Blend until completely smooth, thinning with breast milk, formula or cooking water.',
      zh: '用料理棒打至完全顺滑，可加母乳、配方奶或煮菜的水调稀。',
    },
    mash: {
      en: 'Mash with a fork into soft, tiny lumps that squash between your fingers.',
      zh: '用叉子压成软软的小颗粒，要能用手指轻松捏碎。',
    },
  };

  const FINISH = {
    en: 'Cool to lukewarm and test on your wrist. No salt, sugar, honey or stock cubes.',
    zh: '放至温热，滴在手腕内侧试温。不加盐、糖、蜂蜜或鸡精。',
  };

  /**
   * Returns { title, steps: [string], ingredients: [{id,name,emoji,allergen}] }.
   */
  function describeMeal(meal, lang, customFoods, texture) {
    const catalog = buildCatalog(customFoods);
    const L = lang === 'zh' ? 'zh' : 'en';
    const n = id => (id ? name(catalog, id, L) : '');
    const nl = id => lower(n(id), L);
    const tex = TEXTURE[texture === 'mash' ? 'mash' : 'puree'][L];
    const zh = L === 'zh';
    let title = '';
    let combine = '';

    const vp = [meal.veg, meal.protein].filter(Boolean);
    const vpEn = vp.map(nl).join(' & ');
    const vpZh = vp.map(n).join('');

    switch (meal.template) {
      case 'main_porridge': {
        const base = n(meal.main);
        const isRice = meal.main === 'rice';
        title = zh ? `${vpZh}${isRice ? '' : base}粥` : cap(`${vpEn ? vpEn + ' ' : ''}${isRice ? 'congee' : nl(meal.main) + ' porridge'}`);
        combine = zh
          ? `把${vp.map(n).join('和')}的细泥拌入${isRice ? '米' : base}粥，再小火煮2分钟。`
          : `Stir the finely pureed ${vpEn || 'ingredients'} into the ${isRice ? 'rice congee' : nl(meal.main)} and simmer 2 more minutes.`;
        break;
      }
      case 'main_noodle':
        title = zh ? `${vpZh}烂面条` : cap(`soft ${vpEn ? vpEn + ' ' : ''}noodles`);
        combine = zh ? `把煮软的短面条和${vp.map(n).join('、')}一起小火焖2分钟，汤汁收浓。` : `Simmer the short noodles with the ${vpEn} for 2 minutes until thick and saucy.`;
        break;
      case 'main_pasta':
        title = zh ? `${vpZh}酱小意面` : cap(`tiny pasta with ${vpEn || 'vegetable'} sauce`);
        combine = zh ? `把${vp.map(n).join('、')}打成酱，拌入煮软的小意面。` : `Blend the ${vpEn} into a sauce and stir through the soft pasta.`;
        break;
      case 'main_mash':
        title = zh ? `${vpZh}${n(meal.main)}泥` : cap(`${nl(meal.main)} mash with ${vpEn || 'veggies'}`);
        combine = zh ? `把${n(meal.main)}压成泥，拌入${vp.map(n).join('和')}。` : `Mash the ${nl(meal.main)} and mix in the ${vpEn}.`;
        break;
      case 'main_nocarb':
        title = zh ? `${vpZh}泥` : cap(`${vpEn} puree`);
        combine = zh ? `把所有食材一起打匀。` : 'Blend everything together.';
        break;
      case 'egg_custard':
        title = zh ? `${n(meal.veg)}蒸蛋羹${meal.main ? ' + ' + n(meal.main) + (meal.main === 'rice' || meal.main === 'millet' ? '粥' : '') : ''}` : cap(`steamed egg custard with ${nl(meal.veg)}${meal.main ? ' + ' + nl(meal.main) : ''}`);
        combine = zh
          ? `鸡蛋加1.5倍温水打散过筛，拌入${n(meal.veg)}细末，盖盘子中火蒸10–12分钟至完全凝固。${meal.main ? '搭配软烂的' + n(meal.main) + '。' : ''}`
          : `Whisk the egg with 1.5× its volume of warm water, sieve, stir in the finely chopped ${nl(meal.veg)}, cover and steam 10–12 min until fully set.${meal.main ? ' Serve with the soft ' + nl(meal.main) + '.' : ''}`;
        break;
      case 'tofu_stew':
        title = zh ? `${n(meal.veg)}豆腐羹${meal.main ? ' + ' + n(meal.main) : ''}` : cap(`silken tofu & ${nl(meal.veg)} stew${meal.main ? ' with ' + nl(meal.main) : ''}`);
        combine = zh ? `嫩豆腐和${n(meal.veg)}加少许水小火煮3分钟，压碎成羹。${meal.main ? '配' + n(meal.main) + '。' : ''}` : `Simmer the tofu and ${nl(meal.veg)} in a splash of water for 3 minutes, then mash into a thick stew.${meal.main ? ' Serve over the ' + nl(meal.main) + '.' : ''}`;
        break;
      case 'bf_porridge':
      case 'bf_noodle': {
        const base = meal.main === 'rice' ? (zh ? '米' : 'rice') : n(meal.main);
        const oats = meal.main === 'oats';
        title = zh ? `${n(meal.fruit)}${oats ? '燕麦' : base}${meal.template === 'bf_noodle' ? '面' : '粥'}` : cap(`${oats ? 'oatmeal' : nl(meal.main) + (meal.template === 'bf_noodle' ? '' : ' porridge')} with ${meal.fruit ? nl(meal.fruit) : 'fruit'}`);
        combine = zh ? `把${n(meal.fruit)}泥拌进温热的${oats ? '燕麦' : base}${meal.template === 'bf_noodle' ? '面' : '粥'}里。水果的天然甜味就够了。` : `Swirl the mashed ${nl(meal.fruit)} into the warm ${oats ? 'oatmeal' : nl(meal.main)}. The fruit is the only sweetener needed.`;
        break;
      }
      case 'bf_mash':
        title = zh ? `${n(meal.main)}${n(meal.fruit)}泥` : cap(`${nl(meal.main)} & ${nl(meal.fruit)} mash`);
        combine = zh ? `把${n(meal.main)}和${n(meal.fruit)}一起压成泥。` : `Mash the ${nl(meal.main)} and ${nl(meal.fruit)} together.`;
        break;
      case 'pancake':
        title = zh ? '香蕉燕麦软饼' : 'Soft banana-oat pancakes';
        combine = zh
          ? '1根香蕉压泥+1个鸡蛋+3勺燕麦粉拌匀，不粘锅刷薄油，小火每面煎2分钟至全熟。饼很软，可撕小块或压碎喂。'
          : 'Mix 1 mashed banana, 1 egg and 3 tbsp oat flour. Cook small rounds on a lightly oiled non-stick pan, 2 min per side on low heat until cooked through. Tear into tiny soft pieces or mash.';
        break;
      case 'fruit_only':
        title = zh ? `${n(meal.fruit)}泥` : cap(`${nl(meal.fruit)} puree`);
        combine = '';
        break;
      case 'snack_fruit':
        title = zh ? `${n(meal.fruit)}泥` : cap(`${nl(meal.fruit)} puree`);
        combine = '';
        break;
      case 'snack_dairy':
        title = meal.partner === 'yogurt'
          ? (zh ? `${n(meal.fruit)}酸奶` : cap(`yogurt with ${nl(meal.fruit)}`))
          : (zh ? `${n(meal.fruit)}拌软奶酪` : cap(`${nl(meal.fruit)} with ${nl(meal.partner)}`));
        combine = zh ? `把${n(meal.fruit)}泥拌入${n(meal.partner)}。` : `Stir the ${nl(meal.fruit)} into the ${nl(meal.partner)}.`;
        break;
      case 'snack_avocado':
        title = zh ? `牛油果${n(meal.fruit)}泥` : cap(`avocado & ${nl(meal.fruit)} mash`);
        combine = zh ? `牛油果和${n(meal.fruit)}一起压成泥，现做现吃（会氧化变色）。` : `Mash the avocado and ${nl(meal.fruit)} together. Serve right away (it browns).`;
        break;
      case 'snack_two_fruit':
        title = zh ? `${n(meal.fruit)}${n(meal.partner)}泥` : cap(`${nl(meal.fruit)} & ${nl(meal.partner)} puree`);
        combine = zh ? '两种水果混合压泥。' : 'Mash both fruits together.';
        break;
      case 'snack_simple':
        title = zh ? `${n(meal.fruit)}` : cap(nl(meal.fruit));
        combine = '';
        break;
      default:
        title = zh ? '（食材不足，请添加更多食材）' : '(Not enough foods — add more at home)';
    }

    if (meal.extra && meal.template !== 'pancake') {
      title += zh ? ` + ${n(meal.extra)}` : ` + ${nl(meal.extra)}`;
    }
    if (meal.fat && !title.includes(n(meal.fat))) {
      combine += zh ? ` 出锅后拌入${n(meal.fat)}。` : ` Stir in the ${nl(meal.fat)} at the end.`;
    }

    const steps = [];
    for (const id of meal.items) {
      const f = catalog.get(id);
      if (!f) continue;
      if (meal.template === 'pancake') break;
      const p = f.prep ? f.prep[L] : '';
      steps.push(`${name(catalog, id, L, true)}：${p || (zh ? '洗净，煮或蒸至非常软烂。' : 'Wash, then steam or boil until very soft.')}`.replace('：', zh ? '：' : ': '));
    }
    if (combine) steps.push(combine.trim());
    if (meal.template !== 'pancake' && meal.template !== 'empty') steps.push(tex);
    if (meal.template !== 'empty') steps.push(FINISH[L]);

    const ingredients = meal.items.map(id => {
      const f = catalog.get(id) || { id };
      return { id, name: name(catalog, id, L, true), emoji: f.emoji || '🍽️', allergen: f.allergen || null, iron: !!f.iron };
    });
    return { title, steps, ingredients };
  }

  const api = {
    SLOTS, generatePlan, swapMeal, describeMeal, parseFoodText, planStats, usageOf, buildCatalog, slotsFor, comboKey, mulberry32,
  };
  root.TDM_PLANNER = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
