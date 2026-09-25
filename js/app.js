/* UI controller: state, rendering and events. */
(function () {
  const { CATEGORIES, FOODS, ALLERGENS, STARTER_PANTRY } = window.TDM_DATA;
  const P = window.TDM_PLANNER;

  // ---------- text ----------
  const T = {
    en: {
      appName: 'Little Spoon Menu', appSub: 'Soft food for 14 months · no salt · no sugar',
      tabHome: 'At home', tabMenu: 'Menu', tabSettings: 'Settings',
      photoTitle: 'Scan a photo', photoHint: 'Snap your fridge, pantry or groceries and we\'ll pick out the foods.',
      photoBtn: 'Take or choose a photo', photoWorking: 'Looking at your photo…',
      photoFound: n => `Found ${n} food${n === 1 ? '' : 's'}. Untick anything that's wrong, then add.`,
      photoNone: 'No foods spotted in that photo. Try a closer, brighter shot.',
      photoAdd: 'Add to foods at home', photoAdded: n => `Added ${n} food${n === 1 ? '' : 's'}.`,
      errNoKey: 'Photo scanning needs an Anthropic API key. Add one in Settings, or type your foods instead.',
      errBadKey: 'The API key was rejected. Check it in Settings.',
      errRate: 'Too many requests right now. Wait a minute and try again.',
      errNetwork: 'Could not reach the photo service. Check your connection, or type your foods instead.',
      errRefused: 'The photo could not be analysed. Try a different photo.',
      errImage: 'That file could not be opened as an image.',
      errGeneric: 'Photo scan failed. You can type your foods instead.',
      typeTitle: 'Type what you have', typeHint: 'Separate with commas. English or Chinese both work.',
      typePh: 'e.g. carrot, egg, 南瓜, 豆腐', add: 'Add',
      typeAdded: n => `Added ${n} food${n === 1 ? '' : 's'}.`,
      typeBlocked: list => `Skipped ${list}: added salt/sugar or a choking risk at this age.`,
      unknownQ: name => `“${name}” is new to us. What kind of food is it?`, skip: 'Skip',
      pantryTitle: 'Foods at home', pantryHint: 'Tap to mark what you have. Highlighted foods go into the menu.',
      starter: 'Fill a typical kitchen', clear: 'Clear', selected: n => `${n} selected`,
      myFoods: 'My added foods',
      modeDay: 'Today', modeWeek: 'This week', make: 'Make menu',
      needFoods: 'Pick a few foods first (at least one grain, vegetable or fruit).',
      menuEmpty: 'No menu yet. Pick the foods you have, then tap “Make menu”.', gotoHome: 'Choose foods',
      reshuffle: 'New combinations', copy: 'Copy as text', print: 'Print', copied: 'Menu copied.',
      copyManual: 'Copying is blocked here. The text is below: select it and copy.',
      swapped: 'Swapped for a different dish.', swap: 'Swap this dish', how: 'How to make',
      statFoods: n => `<b>${n}</b> different foods`,
      statIron: (a, b) => `<b>${a}/${b}</b> days with iron-rich food`,
      statDays: n => `<b>${n}</b> ${n === 1 ? 'day' : 'days'}`,
      warnMissing: c => `No ${c} selected. Adding some will make meals more balanced.`,
      warnFew: (c, n) => `Only ${n} ${c} selected, so some will repeat. Add more for extra variety.`,
      warnIron: 'No iron-rich foods selected. Iron matters at this age: try beef, egg, lentils, spinach, tofu or oats.',
      catNames: { carb: 'grains/starches', veg: 'vegetables', fruit: 'fruit', protein: 'protein foods' },
      allergenTag: 'allergen', ironTag: 'iron',
      milkNote: 'Alongside meals: about 350–500 ml of breast milk, whole milk or formula a day, and sips of water from an open cup.',
      textureTitle: 'Texture', texPuree: 'Smooth puree', texPureeHint: 'Blended completely smooth. Safest while learning.',
      texMash: 'Soft mash', texMashHint: 'Fork-mashed with tiny soft lumps, to practise gum-chewing.',
      mealsTitle: 'Meals per day', snacksLabel: 'Include 2 snacks (5 feeds a day)',
      allergyTitle: 'Leave out (allergies)', allergyHint: 'Foods with these allergens will never be suggested.',
      keyTitle: 'Photo scanning', keyHint: 'Photo scanning uses Claude and needs an Anthropic API key. The key is stored only in this browser and sent only to Anthropic. Everything else works without it.',
      save: 'Save', keySaved: 'Key saved in this browser.', keyRemoved: 'Key removed.', keyLink: 'Get an API key',
      safetyTitle: 'Safety rules this app follows',
      safety: [
        'No added salt, sugar, honey, soy sauce or stock cubes. Fruit is the only sweetener.',
        'Everything is cooked until it squashes easily between two fingers.',
        'Round foods (blueberries, grapes) are never served whole. No whole nuts.',
        'Eggs, meat and fish are always fully cooked. Fish is checked for bones.',
        'Allergens are tagged. Introduce a new one alone, in the morning, and watch for 2 days.',
        'Liver is limited to once a week (very high vitamin A).',
        'Always sit with your child while they eat.',
      ],
      disclaimer: 'General guidance only. Check with your paediatrician, especially about allergies.',
      dayName: d => d.toLocaleDateString('en-GB', { weekday: 'long' }),
      dayDate: d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      menuFor: 'Toddler menu',
    },
    zh: {
      appName: '小勺辅食菜单', appSub: '14个月宝宝软烂辅食 · 无盐 · 无糖',
      tabHome: '家里有什么', tabMenu: '菜单', tabSettings: '设置',
      photoTitle: '拍照识别', photoHint: '拍一下冰箱、橱柜或刚买的菜，自动识别食材。',
      photoBtn: '拍照或选择照片', photoWorking: '正在识别照片…',
      photoFound: n => `识别到 ${n} 种食材。取消勾选不对的，再点添加。`,
      photoNone: '照片里没有识别到食材。试试靠近一点、光线亮一点。',
      photoAdd: '添加到家里的食材', photoAdded: n => `已添加 ${n} 种食材。`,
      errNoKey: '拍照识别需要 Anthropic API 密钥。请在“设置”中添加，或直接输入食材。',
      errBadKey: 'API 密钥无效，请在“设置”中检查。',
      errRate: '请求太频繁，请稍等一分钟再试。',
      errNetwork: '无法连接识别服务。请检查网络，或直接输入食材。',
      errRefused: '这张照片无法分析，请换一张试试。',
      errImage: '无法打开这个图片文件。',
      errGeneric: '识别失败，可以直接输入食材。',
      typeTitle: '输入家里的食材', typeHint: '用逗号分隔，中英文都可以。',
      typePh: '例如：胡萝卜，鸡蛋，pumpkin，豆腐', add: '添加',
      typeAdded: n => `已添加 ${n} 种食材。`,
      typeBlocked: list => `已跳过 ${list}：含盐/糖或这个月龄有噎呛风险。`,
      unknownQ: name => `“${name}”不在食材库里，它属于哪一类？`, skip: '跳过',
      pantryTitle: '家里的食材', pantryHint: '点击选择家里有的食材，高亮的会用来搭配菜单。',
      starter: '一键选常见食材', clear: '清空', selected: n => `已选 ${n} 种`,
      myFoods: '我添加的食材',
      modeDay: '今天', modeWeek: '本周', make: '生成菜单',
      needFoods: '请先选几种食材（至少一种主食、蔬菜或水果）。',
      menuEmpty: '还没有菜单。先选好家里的食材，再点“生成菜单”。', gotoHome: '去选食材',
      reshuffle: '换一批搭配', copy: '复制文字', print: '打印', copied: '菜单已复制。',
      copyManual: '这里无法自动复制，文字在下方，请手动选择复制。',
      swapped: '已换成另一道菜。', swap: '换一道', how: '做法',
      statFoods: n => `<b>${n}</b> 种不同食材`,
      statIron: (a, b) => `<b>${a}/${b}</b> 天有富含铁的食物`,
      statDays: n => `<b>${n}</b> 天`,
      warnMissing: c => `没有选择${c}，加一些会让营养更均衡。`,
      warnFew: (c, n) => `${c}只选了 ${n} 种，会有重复。多加几种会更丰富。`,
      warnIron: '没有富含铁的食物。这个月龄很需要铁：可以加牛肉、鸡蛋、红扁豆、菠菜、豆腐或燕麦。',
      catNames: { carb: '主食', veg: '蔬菜', fruit: '水果', protein: '蛋白质食物' },
      allergenTag: '过敏原', ironTag: '补铁',
      milkNote: '除了辅食：每天约350–500毫升母乳、全脂奶或配方奶，并用敞口杯喝少量白开水。',
      textureTitle: '食物质地', texPuree: '细腻泥糊', texPureeHint: '完全打成顺滑的泥，学吃阶段最安全。',
      texMash: '软烂碎末', texMashHint: '用叉子压成带小软粒的泥，练习用牙床咀嚼。',
      mealsTitle: '每天几餐', snacksLabel: '包含2次加餐（每天5顿）',
      allergyTitle: '不吃（过敏）', allergyHint: '含这些过敏原的食物不会出现在菜单里。',
      keyTitle: '拍照识别', keyHint: '拍照识别使用 Claude，需要 Anthropic API 密钥。密钥只保存在这个浏览器里，只发送给 Anthropic。其他功能不需要密钥。',
      save: '保存', keySaved: '密钥已保存在这个浏览器。', keyRemoved: '密钥已删除。', keyLink: '获取 API 密钥',
      safetyTitle: '本应用遵循的安全原则',
      safety: [
        '不加盐、糖、蜂蜜、酱油或鸡精，水果是唯一的甜味来源。',
        '所有食物都煮到两根手指一捏就烂。',
        '圆形食物（蓝莓、葡萄）绝不整颗给，不给整粒坚果。',
        '鸡蛋、肉和鱼都要完全熟透，鱼要仔细挑刺。',
        '过敏原会标注。新的过敏原单独添加、在上午吃，观察2天。',
        '肝脏每周最多一次（维生素A很高）。',
        '宝宝吃东西时大人要一直在旁边。',
      ],
      disclaimer: '仅供一般参考，请咨询儿科医生，特别是过敏相关问题。',
      dayName: d => d.toLocaleDateString('zh-CN', { weekday: 'long' }),
      dayDate: d => `${d.getMonth() + 1}月${d.getDate()}日`,
      menuFor: '宝宝辅食菜单',
    },
  };

  // ---------- storage ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('tdm.' + key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('tdm.' + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    },
  };

  const browserZh = (navigator.language || '').toLowerCase().startsWith('zh');
  const state = {
    lang: store.get('lang', browserZh ? 'zh' : 'en'),
    tab: 'home',
    mode: store.get('mode', 'week'),
    pantry: new Set(store.get('pantry', STARTER_PANTRY)),
    custom: store.get('custom', []),
    settings: Object.assign({ texture: 'puree', snacks: true, exclude: [] }, store.get('settings', {})),
    apiKey: store.get('apiKey', ''),
    plan: store.get('plan', null),
    unknown: [],
  };

  const $ = id => document.getElementById(id);
  const t = key => T[state.lang][key];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const allFoods = () => FOODS.concat(state.custom);
  const foodName = f => (state.lang === 'zh' ? f.zh : f.en);

  function save() {
    store.set('pantry', [...state.pantry]);
    store.set('custom', state.custom);
    store.set('settings', state.settings);
    store.set('plan', state.plan);
    store.set('mode', state.mode);
    store.set('lang', state.lang);
  }

  let toastTimer = null;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  function setStatus(el, msg, kind) {
    el.hidden = !msg;
    el.textContent = msg || '';
    el.className = 'status' + (kind ? ' ' + kind : '');
  }

  // ---------- static text ----------
  function applyLang() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (typeof v === 'string') el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    document.title = t('appName');
    $('lang-en').setAttribute('aria-pressed', state.lang === 'en');
    $('lang-zh').setAttribute('aria-pressed', state.lang === 'zh');
    $('safety-list').innerHTML = t('safety').map(s => `<li>${esc(s)}</li>`).join('');
  }

  // ---------- tabs ----------
  function showTab(tab) {
    state.tab = tab;
    ['home', 'menu', 'settings'].forEach(id => {
      $('panel-' + id).hidden = id !== tab;
      $('tab-' + id).setAttribute('aria-selected', id === tab);
    });
    if (tab === 'menu') renderMenu();
    window.scrollTo({ top: 0 });
  }

  // ---------- pantry ----------
  function renderPantry() {
    const html = CATEGORIES.map(cat => {
      const items = allFoods().filter(f => f.cat === cat.id && !f.custom);
      return `<div class="cat"><h3>${esc(cat[state.lang])}</h3><div class="chips">${items.map(chip).join('')}</div></div>`;
    });
    if (state.custom.length) {
      html.push(`<div class="cat"><h3>${esc(t('myFoods'))}</h3><div class="chips">${state.custom.map(chip).join('')}</div></div>`);
    }
    $('pantry').innerHTML = html.join('');
    $('pantry-count').textContent = t('selected')(state.pantry.size);
  }

  function chip(f) {
    const on = state.pantry.has(f.id);
    const excluded = f.allergen && state.settings.exclude.includes(f.allergen);
    return `<button type="button" class="chip" data-food="${esc(f.id)}" aria-pressed="${on}"${excluded ? ' disabled title="allergy"' : ''} style="${excluded ? 'opacity:.35' : ''}">
      <span aria-hidden="true">${f.emoji || '🍽️'}</span>${esc(foodName(f))}${f.custom ? '<span class="x" data-remove="' + esc(f.id) + '" aria-label="remove">✕</span>' : ''}</button>`;
  }

  function addFoods(ids) {
    let n = 0;
    for (const id of ids) if (!state.pantry.has(id)) { state.pantry.add(id); n++; }
    save();
    renderPantry();
    return n;
  }

  // ---------- typed input ----------
  function onTextSubmit(e) {
    e.preventDefault();
    const input = $('food-text');
    const res = P.parseFoodText(input.value, state.custom);
    const msgs = [];
    addFoods(res.matched);
    if (res.matched.length) msgs.push(t('typeAdded')(res.matched.length));
    if (res.blocked.length) msgs.push(t('typeBlocked')(res.blocked.join(state.lang === 'zh' ? '、' : ', ')));
    setStatus($('text-feedback'), msgs.join(' '), res.blocked.length ? 'err' : 'ok');
    state.unknown = res.unknown;
    renderUnknown();
    input.value = '';
  }

  function renderUnknown() {
    const box = $('unknown-box');
    box.hidden = !state.unknown.length;
    box.innerHTML = state.unknown.map((name, i) => `
      <div class="unknown-item">
        <span>${esc(t('unknownQ')(name))}</span>
        <div class="chips">
          ${CATEGORIES.map(c => `<button type="button" class="chip" data-unknown="${i}" data-cat="${c.id}"><span aria-hidden="true">${c.emoji}</span>${esc(c[state.lang])}</button>`).join('')}
          <button type="button" class="chip" data-unknown="${i}" data-cat="">${esc(t('skip'))}</button>
        </div>
      </div>`).join('');
  }

  function addCustom(name, cat, zhName) {
    const id = 'custom:' + name.toLowerCase().replace(/\s+/g, '-');
    if (!state.custom.some(c => c.id === id)) {
      const emoji = { carb: '🍚', veg: '🥬', fruit: '🍏', protein: '🍖', dairy: '🥛', fat: '🫒' }[cat];
      state.custom.push({ id, cat, custom: true, form: cat === 'carb' ? 'mash' : undefined, en: name, zh: zhName || name, emoji, aliases: zhName ? [zhName] : [] });
    }
    state.pantry.add(id);
    return id;
  }

  // ---------- photo ----------
  async function onPhoto(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const status = $('photo-status');
    const review = $('photo-review');
    review.hidden = true;
    if (!state.apiKey) { setStatus(status, t('errNoKey'), 'err'); return; }
    setStatus(status, t('photoWorking'));
    try {
      const res = await window.TDM_VISION.identifyFoods(file, state.apiKey, FOODS);
      const items = res.known.map(id => ({ key: id, known: true, food: FOODS.find(f => f.id === id) }))
        .concat(res.other.filter(o => ['carb', 'veg', 'fruit', 'protein', 'dairy', 'fat'].includes(o.category))
          .map(o => ({ key: 'new:' + (o.en || o.zh), known: false, food: { en: o.en || o.zh, zh: o.zh || o.en, cat: o.category, emoji: '➕' } })));
      if (!items.length) { setStatus(status, t('photoNone'), 'err'); return; }
      setStatus(status, t('photoFound')(items.length), 'ok');
      review.hidden = false;
      review.innerHTML = `<div class="chips">${items.map((it, i) => `<button type="button" class="chip" data-review="${i}" aria-pressed="true"><span aria-hidden="true">${it.food.emoji || '🍽️'}</span>${esc(foodName(it.food))}</button>`).join('')}</div>
        <button type="button" class="btn btn-small" id="review-add">${esc(t('photoAdd'))}</button>`;
      review._items = items;
    } catch (err) {
      const code = String(err && err.message || '');
      const key = code === 'no-key' ? 'errNoKey' : code === 'bad-key' ? 'errBadKey' : code === 'rate-limit' ? 'errRate'
        : code === 'network' ? 'errNetwork' : code === 'refused' ? 'errRefused' : code === 'image-unreadable' ? 'errImage'
          : /Failed to fetch|import|NetworkError/i.test(code) ? 'errNetwork' : 'errGeneric';
      setStatus(status, t(key), 'err');
      console.error(err);
    }
  }

  function onReviewClick(e) {
    const review = $('photo-review');
    const c = e.target.closest('[data-review]');
    if (c) { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true'); return; }
    if (e.target.id === 'review-add') {
      const ids = [];
      review.querySelectorAll('[data-review]').forEach(el => {
        if (el.getAttribute('aria-pressed') !== 'true') return;
        const it = review._items[+el.dataset.review];
        ids.push(it.known ? it.food.id : addCustom(it.food.en, it.food.cat, it.food.zh));
      });
      addFoods(ids);
      review.hidden = true;
      setStatus($('photo-status'), t('photoAdded')(ids.length), 'ok');
    }
  }

  // ---------- plan ----------
  function genOpts(seed) {
    return {
      pantry: [...state.pantry], customFoods: state.custom, settings: state.settings, seed,
      history: P.usageOf(state.plan),
    };
  }

  function makePlan() {
    const cats = new Set(allFoods().filter(f => state.pantry.has(f.id) && !(f.allergen && state.settings.exclude.includes(f.allergen))).map(f => f.cat));
    if (!cats.has('carb') && !cats.has('veg') && !cats.has('fruit')) { toast(t('needFoods')); return; }
    const opts = genOpts(Date.now() & 0x7fffffff);
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    state.plan = P.generatePlan({ ...opts, startDate, days: state.mode === 'week' ? 7 : 1 });
    save();
    showTab('menu');
  }

  function renderMenu() {
    const plan = state.plan;
    $('menu-empty').hidden = !!plan;
    $('menu-body').hidden = !plan;
    $('print-btn').hidden = window.self !== window.top; // printing is blocked inside embedded viewers
    if (!plan) return;

    const st = P.planStats(plan, state.custom);
    $('summary').innerHTML = [
      t('statDays')(st.days), t('statFoods')(st.distinct), t('statIron')(st.ironDays, st.days),
    ].map(s => `<span class="pill">${s}</span>`).join('');

    $('warnings').innerHTML = (plan.warnings || []).map(w => {
      const c = w.cat ? t('catNames')[w.cat] : '';
      const msg = w.type === 'missing' ? t('warnMissing')(c) : w.type === 'few' ? t('warnFew')(c, w.n) : t('warnIron');
      return `<p class="warn">${esc(msg)}</p>`;
    }).join('');

    const start = new Date(plan.startDate + 'T12:00:00');
    const dates = plan.days.map((_, i) => new Date(start.getTime() + i * 86400000));
    $('day-nav').innerHTML = plan.days.length > 1
      ? dates.map((d, i) => `<a href="#day-${i}" data-day="${i}">${esc(t('dayName')(d).slice(0, state.lang === 'zh' ? 3 : 3))}</a>`).join('')
      : '';

    $('days').innerHTML = plan.days.map((day, di) => `
      <section class="day">
        <h2 id="day-${di}">${esc(t('dayName')(dates[di]))}<small>${esc(t('dayDate')(dates[di]))}</small></h2>
        <div class="meals">${day.meals.map((m, mi) => mealHtml(m, di, mi)).join('')}</div>
      </section>`).join('');
  }

  function mealHtml(meal, di, mi) {
    const slot = P.SLOTS[meal.slot];
    const d = P.describeMeal(meal, state.lang, state.custom, state.settings.texture);
    const snack = meal.slot.startsWith('snack');
    const ings = d.ingredients.map(i => `<span class="ing">${i.emoji} ${esc(i.name)}${i.allergen ? `<span class="tag allergen">${esc(t('allergenTag'))}</span>` : ''}${i.iron ? `<span class="tag iron">${esc(t('ironTag'))}</span>` : ''}</span>`).join('');
    return `
      <article class="meal${snack ? ' snack' : ''}">
        <div class="meal-when"><b>${slot.time}</b><span>${esc(slot[state.lang])}</span></div>
        <div class="meal-main">
          <div class="meal-top">
            <h3 class="meal-title">${esc(d.title)}</h3>
            <button type="button" class="swap" data-swap="${di}:${mi}" title="${esc(t('swap'))}" aria-label="${esc(t('swap'))}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h13l-3-3M20 15H7l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div class="ings">${ings}</div>
          <details class="how"><summary>${esc(t('how'))}</summary><ol>${d.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></details>
        </div>
      </article>`;
  }

  function swap(di, mi) {
    state.plan = P.swapMeal(state.plan, di, mi, genOpts(Date.now() & 0x7fffffff));
    save();
    renderMenu();
    toast(t('swapped'));
  }

  function planText() {
    const plan = state.plan;
    const start = new Date(plan.startDate + 'T12:00:00');
    const lines = [t('menuFor')];
    plan.days.forEach((day, di) => {
      const d = new Date(start.getTime() + di * 86400000);
      lines.push('', `${t('dayName')(d)} ${t('dayDate')(d)}`);
      day.meals.forEach(m => {
        const s = P.SLOTS[m.slot];
        lines.push(`  ${s.time} ${s[state.lang]}: ${P.describeMeal(m, state.lang, state.custom, state.settings.texture).title}`);
      });
    });
    return lines.join('\n');
  }

  function copyPlan() {
    const text = planText();
    const fallback = () => {
      const ta = $('copy-fallback');
      ta.hidden = false;
      ta.value = text;
      ta.focus();
      ta.select();
      toast(t('copyManual'));
    };
    try {
      navigator.clipboard.writeText(text).then(() => toast(t('copied')), fallback);
    } catch (e) { fallback(); }
  }

  // ---------- settings ----------
  function renderSettings() {
    $('tex-' + state.settings.texture).checked = true;
    $('snacks-toggle').checked = state.settings.snacks !== false;
    $('allergens').innerHTML = ALLERGENS.map(a => `<label><input type="checkbox" id="alg-${a.id}" data-allergen="${a.id}"${state.settings.exclude.includes(a.id) ? ' checked' : ''}> ${esc(a[state.lang])}</label>`).join('');
    $('api-key').value = state.apiKey;
  }

  function renderMode() {
    $('mode-day').setAttribute('aria-pressed', state.mode === 'day');
    $('mode-week').setAttribute('aria-pressed', state.mode === 'week');
  }

  function renderAll() {
    applyLang();
    renderPantry();
    renderUnknown();
    renderSettings();
    renderMode();
    if (state.tab === 'menu') renderMenu();
  }

  // ---------- events ----------
  document.addEventListener('click', e => {
    const el = e.target;
    const lang = el.closest('[data-lang]');
    if (lang) {
      state.lang = lang.dataset.lang;
      ['text-feedback', 'photo-status', 'key-status'].forEach(id => setStatus($(id), ''));
      $('photo-review').hidden = true;
      save(); renderAll(); return;
    }
    const tab = el.closest('[data-tab]');
    if (tab) { showTab(tab.dataset.tab); return; }
    const mode = el.closest('[data-mode]');
    if (mode) { state.mode = mode.dataset.mode; save(); renderMode(); return; }
    const rm = el.closest('[data-remove]');
    if (rm) {
      state.custom = state.custom.filter(c => c.id !== rm.dataset.remove);
      state.pantry.delete(rm.dataset.remove);
      save(); renderPantry(); return;
    }
    const food = el.closest('[data-food]');
    if (food) {
      const id = food.dataset.food;
      state.pantry.has(id) ? state.pantry.delete(id) : state.pantry.add(id);
      save(); renderPantry(); return;
    }
    const unk = el.closest('[data-unknown]');
    if (unk) {
      const name = state.unknown[+unk.dataset.unknown];
      if (unk.dataset.cat) { addCustom(name, unk.dataset.cat); save(); renderPantry(); }
      state.unknown.splice(+unk.dataset.unknown, 1);
      renderUnknown(); return;
    }
    const sw = el.closest('[data-swap]');
    if (sw) { const [di, mi] = sw.dataset.swap.split(':').map(Number); swap(di, mi); return; }
    const dayLink = el.closest('[data-day]');
    if (dayLink) { e.preventDefault(); $('day-' + dayLink.dataset.day).scrollIntoView({ behavior: 'smooth' }); }
  });

  $('text-form').addEventListener('submit', onTextSubmit);
  $('photo-input').addEventListener('change', onPhoto);
  $('photo-review').addEventListener('click', onReviewClick);
  $('starter-btn').addEventListener('click', () => { addFoods(STARTER_PANTRY); });
  $('clear-btn').addEventListener('click', () => { state.pantry.clear(); save(); renderPantry(); });
  $('make-btn').addEventListener('click', makePlan);
  $('reshuffle-btn').addEventListener('click', makePlan);
  $('goto-home').addEventListener('click', () => showTab('home'));
  $('copy-btn').addEventListener('click', copyPlan);
  $('print-btn').addEventListener('click', () => window.print());

  document.querySelectorAll('input[name="texture"]').forEach(r => r.addEventListener('change', () => {
    state.settings.texture = r.value; save();
  }));
  $('snacks-toggle').addEventListener('change', e => { state.settings.snacks = e.target.checked; save(); });
  $('allergens').addEventListener('change', e => {
    const a = e.target.dataset.allergen;
    if (!a) return;
    const set = new Set(state.settings.exclude);
    e.target.checked ? set.add(a) : set.delete(a);
    state.settings.exclude = [...set];
    save(); renderPantry();
  });
  $('key-save').addEventListener('click', () => {
    state.apiKey = $('api-key').value.trim();
    store.set('apiKey', state.apiKey);
    setStatus($('key-status'), state.apiKey ? t('keySaved') : t('keyRemoved'), 'ok');
  });

  // Offline support when served over http(s) (not available in every host).
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && window.self === window.top) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  renderAll();
  showTab(state.plan && location.hash === '#menu' ? 'menu' : 'home');
})();
