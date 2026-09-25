/* UI controller: state, rendering and events. */
(function () {
  const { CATEGORIES, FOODS, ALLERGENS, STARTER_PANTRY, NUTRIENTS, MILKS } = window.TDM_DATA;
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
      tabNutrition: 'Nutrition',
      installTitle: 'Install on your iPhone', gotIt: 'Got it',
      installBody: 'In Safari, tap the Share button, then “Add to Home Screen”. The app then opens full-screen and works offline.',
      share: 'Share with family', shareText: 'Our toddler menu', linkCopied: 'Link copied. Paste it to your family.',
      sharedBody: 'A family member shared this menu with you.', sharedSave: 'Save to this phone', sharedDismiss: 'Not now',
      sharedSaved: 'Shared menu saved on this phone.', sharedBad: 'That shared link is incomplete. Ask for it to be sent again.',
      perMeal: (kcal, p, fe) => `≈ ${kcal} kcal · protein ${p} g · iron ${fe} mg`,
      dayNutrition: 'Nutrition for the day', colFood: 'Meals', colMilk: 'Milk', colTotal: 'Total', colNeed: 'Daily need',
      milkLine: (ml, type) => `Includes ${ml} ml ${type}. Change this in Settings.`,
      uncounted: list => `Not counted (no data): ${list}.`,
      statKcal: n => `<b>≈${n}</b> kcal/day`,
      dry: 'dry', oneEgg: '1 egg',
      portionTitle: 'How much to serve',
      portionHint: 'Typical amounts for one meal at 12–24 months. Weights are raw, or dry for grains, before cooking. Let your child\'s hunger lead: some days they eat more, some days less.',
      colGroup: 'Food group', colAmount: 'Per meal', colExample: 'Looks like',
      portionRows: [
        ['carb', '15–25 g dry grain, or 50–60 g potato', '½–¾ small bowl of congee or mash'],
        ['veg', '20–40 g', '1½–3 tablespoons of puree'],
        ['protein', '25–35 g meat or fish, 1 egg, or 50 g tofu', '1–2 tablespoons of minced meat'],
        ['fruit', '40–60 g', '½ banana, or 3–4 tablespoons of puree'],
        ['dairy', '60–80 g yogurt', '¼–⅓ cup'],
        ['fat', '3 g oil or butter, 20 g avocado', '½ teaspoon oil'],
      ],
      portionTips: [
        'A whole meal is usually 120–180 ml (½–¾ cup) of food. Offer, don\'t force: stop when they turn away or close their mouth.',
        'Milk: 350–500 ml a day. More than about 600 ml can crowd out food and iron.',
        'Offer water in an open or straw cup with meals. No juice.',
      ],
      needsTitle: 'Daily needs, ages 1–3', colNutrient: 'Nutrient', colPerDay: 'Per day', colWhy: 'Why it matters',
      needsWhy: { kcal: 'Growth and energy; about 800 kcal at 14 months (10 kg)', protein: 'Muscles and growth', iron: 'Brain development; often too low at this age', calcium: 'Bones and teeth; mostly from milk and yogurt', vitA: 'Eyes and immunity; orange veg and leafy greens', vitC: 'Immunity; also helps absorb iron' },
      ironTips: [
        'Iron is the nutrient most often short at this age. Red meat (beef, lamb, pork) 3–4 times a week helps most.',
        'Serve iron foods with vitamin C (tomato, broccoli, kiwi, strawberry, pepper) to absorb more iron.',
        'An iron-fortified baby cereal mixed into porridge adds a lot of iron. Ask your paediatrician whether a supplement is needed.',
      ],
      factsTitle: 'Nutrition facts per 100 g', factsSearch: 'Search foods', sortBy: 'Sort by', colName: 'Food', colServe: 'Serve',
      factsHint: 'Approximate values for raw (or dry) food, from USDA FoodData Central and the China Food Composition Tables.',
      milkTitle: 'Milk each day', milkHint: 'Counted in the daily nutrition totals.',
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
      tabNutrition: '营养',
      installTitle: '安装到 iPhone', gotIt: '知道了',
      installBody: '在 Safari 里点“分享”按钮，再选“添加到主屏幕”。之后就像App一样全屏打开，没网也能用。',
      share: '分享给家人', shareText: '宝宝辅食菜单', linkCopied: '链接已复制，发给家人即可。',
      sharedBody: '家人给你分享了这份菜单。', sharedSave: '保存到这部手机', sharedDismiss: '暂不',
      sharedSaved: '分享的菜单已保存。', sharedBad: '这个分享链接不完整，请让家人重新发送。',
      perMeal: (kcal, p, fe) => `约 ${kcal} 千卡 · 蛋白质 ${p} 克 · 铁 ${fe} 毫克`,
      dayNutrition: '当日营养成分', colFood: '辅食', colMilk: '奶', colTotal: '合计', colNeed: '每日需要',
      milkLine: (ml, type) => `已包含 ${ml} 毫升${type}，可在“设置”中修改。`,
      uncounted: list => `未计入（无数据）：${list}。`,
      statKcal: n => `<b>约${n}</b> 千卡/天`,
      dry: '干重', oneEgg: '1个鸡蛋',
      portionTitle: '建议食用量',
      portionHint: '12–24个月宝宝每餐的参考量。重量指烹饪前的生重（谷物为干重）。以宝宝的食欲为准，有时吃得多、有时吃得少都正常。',
      colGroup: '食物类别', colAmount: '每餐用量', colExample: '大约相当于',
      portionRows: [
        ['carb', '谷物干重15–25克，或土豆类50–60克', '半碗到大半小碗粥或泥'],
        ['veg', '20–40克', '1勺半到3汤匙菜泥'],
        ['protein', '肉或鱼25–35克、1个鸡蛋或豆腐50克', '1–2汤匙肉泥'],
        ['fruit', '40–60克', '半根香蕉，或3–4汤匙果泥'],
        ['dairy', '酸奶60–80克', '1/4–1/3杯'],
        ['fat', '油或黄油3克，牛油果20克', '半小勺油'],
      ],
      portionTips: [
        '一餐总量通常是120–180毫升（半杯到大半杯）。不强迫进食：宝宝扭头或闭嘴就停。',
        '奶：每天350–500毫升。超过约600毫升会影响吃饭和铁的吸收。',
        '吃饭时用敞口杯或吸管杯喝白开水，不喝果汁。',
      ],
      needsTitle: '1–3岁每日营养需要', colNutrient: '营养素', colPerDay: '每天', colWhy: '作用',
      needsWhy: { kcal: '生长和活动所需；14个月（约10公斤）约800千卡', protein: '肌肉和生长', iron: '大脑发育；这个年龄最容易缺', calcium: '骨骼和牙齿；主要来自奶和酸奶', vitA: '视力和免疫；橙色蔬菜和深绿叶菜', vitC: '免疫；还能促进铁吸收' },
      ironTips: [
        '铁是这个年龄最容易不足的营养素。每周吃3–4次红肉（牛肉、羊肉、猪肉）最有帮助。',
        '含铁食物搭配维生素C（番茄、西兰花、猕猴桃、草莓、红椒）能吸收更多铁。',
        '在粥里加强化铁米粉能补充很多铁。是否需要补铁剂，请咨询儿科医生。',
      ],
      factsTitle: '食物营养成分表（每100克）', factsSearch: '搜索食材', sortBy: '排序', colName: '食材', colServe: '每餐建议',
      factsHint: '生重（谷物为干重）的近似值，参考美国农业部食物数据库和《中国食物成分表》。',
      milkTitle: '每天喝奶', milkHint: '会计入每日营养合计。',
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
    settings: Object.assign({ texture: 'puree', snacks: true, exclude: [], milkType: 'whole', milkMl: 400 }, store.get('settings', {})),
    shared: null,
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
    ['home', 'menu', 'nutrition', 'settings'].forEach(id => {
      $('panel-' + id).hidden = id !== tab;
      $('tab-' + id).setAttribute('aria-selected', id === tab);
    });
    if (tab === 'menu') renderMenu();
    if (tab === 'nutrition') renderNutrition();
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

  // Custom foods from a shared menu are shown before they are saved.
  const customAll = () => (state.shared ? state.custom.concat(state.shared.custom.filter(c => !state.custom.some(x => x.id === c.id))) : state.custom);
  const currentPlan = () => (state.shared ? state.shared.plan : state.plan);
  const milkSetting = () => ({ type: state.settings.milkType, ml: +state.settings.milkMl });

  function fmt(v, dp) {
    return dp ? (Math.round(v * 10) / 10).toFixed(1) : String(Math.round(v));
  }

  function renderMenu() {
    const plan = currentPlan();
    $('shared-banner').hidden = !state.shared;
    $('menu-empty').hidden = !!plan;
    $('menu-body').hidden = !plan;
    $('menu-body').classList.toggle('readonly', !!state.shared);
    $('print-btn').hidden = window.self !== window.top; // printing is blocked inside embedded viewers
    if (!plan) return;

    const st = P.planStats(plan, customAll());
    const kcal = plan.days.reduce((sum, d) => sum + P.dayNutrition(d, customAll(), milkSetting()).total[0], 0) / plan.days.length;
    $('summary').innerHTML = [
      t('statDays')(st.days), t('statFoods')(st.distinct), t('statKcal')(Math.round(kcal)), t('statIron')(st.ironDays, st.days),
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
        ${dayNutritionHtml(day)}
      </section>`).join('');
  }

  function dayNutritionHtml(day) {
    const r = P.dayNutrition(day, customAll(), milkSetting());
    const milk = MILKS.find(m => m.id === state.settings.milkType) || MILKS[0];
    const rows = NUTRIENTS.map((n, i) => {
      let need = '<td></td>';
      if (n.need) {
        const pct = r.total[i] / n.need;
        const level = pct >= 0.9 ? 'ok' : pct >= 0.6 ? 'mid' : 'low';
        need = `<td class="need"><span class="bar ${level}"><span style="width:${Math.min(100, pct * 100).toFixed(0)}%"></span></span><span class="pct">${Math.round(pct * 100)}%</span></td>`;
      }
      return `<tr><th scope="row">${esc(n[state.lang])} <small>${n.unit}</small></th><td>${fmt(r.food[i], n.dp)}</td><td>${fmt(r.milk[i], n.dp)}</td><td><b>${fmt(r.total[i], n.dp)}</b></td>${need}</tr>`;
    }).join('');
    const unc = r.uncounted.length ? `<p class="hint small">${esc(t('uncounted')(r.uncounted.map(id => foodName(P.buildCatalog(customAll()).get(id) || { en: id, zh: id })).join(', ')))}</p>` : '';
    return `<details class="nutri"><summary>${esc(t('dayNutrition'))}</summary>
      <div class="table-wrap"><table class="grid day-table">
        <thead><tr><th></th><th>${esc(t('colFood'))}</th><th>${esc(t('colMilk'))}</th><th>${esc(t('colTotal'))}</th><th>${esc(t('colNeed'))}</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
      <p class="hint small">${esc(t('milkLine')(+state.settings.milkMl, milk[state.lang]))}</p>${unc}
    </details>`;
  }

  function mealHtml(meal, di, mi) {
    const slot = P.SLOTS[meal.slot];
    const d = P.describeMeal(meal, state.lang, customAll(), state.settings.texture);
    const nut = P.mealNutrition(meal, customAll());
    const catalog = P.buildCatalog(customAll());
    const amount = id => {
      if (id === 'egg') return t('oneEgg');
      const f = catalog.get(id);
      return `${nut.grams[id]} g${f && P.isDry(f) ? ' ' + t('dry') : ''}`;
    };
    const snack = meal.slot.startsWith('snack');
    const ings = d.ingredients.map(i => `<span class="ing">${i.emoji} ${esc(i.name)} <span class="amt">${esc(amount(i.id))}</span>${i.allergen ? `<span class="tag allergen">${esc(t('allergenTag'))}</span>` : ''}${i.iron ? `<span class="tag iron">${esc(t('ironTag'))}</span>` : ''}</span>`).join('');
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
          <p class="meal-nutri">${esc(t('perMeal')(Math.round(nut.totals[0]), fmt(nut.totals[1], 1), fmt(nut.totals[5], 1)))}</p>
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
    const plan = currentPlan();
    const start = new Date(plan.startDate + 'T12:00:00');
    const lines = [t('menuFor')];
    plan.days.forEach((day, di) => {
      const d = new Date(start.getTime() + di * 86400000);
      lines.push('', `${t('dayName')(d)} ${t('dayDate')(d)}`);
      day.meals.forEach(m => {
        const s = P.SLOTS[m.slot];
        const nut = P.mealNutrition(m, customAll());
        const cat = P.buildCatalog(customAll());
        const amounts = m.items.map(id => `${foodName(cat.get(id) || { en: id, zh: id })} ${id === 'egg' ? t('oneEgg') : nut.grams[id] + 'g'}`).join(', ');
        lines.push(`  ${s.time} ${s[state.lang]}: ${P.describeMeal(m, state.lang, customAll(), state.settings.texture).title}`);
        lines.push(`      ${amounts}`);
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
    $('milk-type').innerHTML = MILKS.map(m => `<option value="${m.id}"${m.id === state.settings.milkType ? ' selected' : ''}>${esc(m[state.lang])}</option>`).join('');
    $('milk-ml').value = String(state.settings.milkMl);
  }

  // ---------- nutrition tab ----------
  function renderNutrition() {
    const catName = id => (CATEGORIES.find(c => c.id === id) || {})[state.lang] || id;
    $('portion-table').innerHTML = `<thead><tr><th>${esc(t('colGroup'))}</th><th>${esc(t('colAmount'))}</th><th>${esc(t('colExample'))}</th></tr></thead>
      <tbody>${t('portionRows').map(r => `<tr><th scope="row">${esc(catName(r[0]))}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody>`;
    $('portion-tips').innerHTML = t('portionTips').map(x => `<li>${esc(x)}</li>`).join('');
    const why = t('needsWhy');
    $('needs-table').innerHTML = `<thead><tr><th>${esc(t('colNutrient'))}</th><th>${esc(t('colPerDay'))}</th><th>${esc(t('colWhy'))}</th></tr></thead>
      <tbody>${NUTRIENTS.filter(n => n.need).map(n => `<tr><th scope="row">${esc(n[state.lang])}</th><td class="num">${n.need} ${n.unit}</td><td>${esc(why[n.id] || '')}</td></tr>`).join('')}</tbody>`;
    $('iron-tips').innerHTML = t('ironTips').map(x => `<li>${esc(x)}</li>`).join('');
    const sel = $('facts-sort');
    const current = sel.value || 'name';
    sel.innerHTML = `<option value="name">${esc(t('colName'))}</option>` + NUTRIENTS.map(n => `<option value="${n.id}">${esc(n[state.lang])}</option>`).join('');
    sel.value = current;
    renderFacts();
  }

  function renderFacts() {
    const q = $('facts-search').value.trim().toLowerCase();
    const sortKey = $('facts-sort').value || 'name';
    const idx = NUTRIENTS.findIndex(n => n.id === sortKey);
    let foods = FOODS.filter(f => !q || [f.en, f.zh, ...(f.aliases || [])].some(x => x.toLowerCase().includes(q)));
    if (idx >= 0) foods = foods.slice().sort((a, b) => b.n[idx] - a.n[idx]);
    else foods = foods.slice().sort((a, b) => foodName(a).localeCompare(foodName(b), state.lang === 'zh' ? 'zh-CN' : 'en'));
    const head = `<thead><tr><th>${esc(t('colName'))}</th><th>${esc(t('colServe'))}</th>${NUTRIENTS.map(n => `<th${n.id === sortKey ? ' class="sorted"' : ''}>${esc(n[state.lang])}<small>${n.unit}</small></th>`).join('')}</tr></thead>`;
    const body = foods.map(f => `<tr><th scope="row">${f.emoji} ${esc(foodName(f))}</th><td class="num">${f.id === 'egg' ? esc(t('oneEgg')) : f.portion + ' g' + (P.isDry(f) ? ' ' + esc(t('dry')) : '')}</td>${f.n.map((v, i) => `<td class="num${NUTRIENTS[i].id === sortKey ? ' sorted' : ''}">${fmt(v, NUTRIENTS[i].dp)}</td>`).join('')}</tr>`).join('');
    $('facts-table').innerHTML = head + `<tbody>${body}</tbody>`;
  }

  // ---------- sharing with family ----------
  function b64url(bytes) {
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64url(str) {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }

  async function encodeShare(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      return 'z' + b64url(new Uint8Array(await new Response(stream).arrayBuffer()));
    }
    return 'j' + b64url(bytes);
  }

  async function decodeShare(code) {
    let bytes = fromB64url(code.slice(1));
    if (code[0] === 'z') {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    const obj = JSON.parse(new TextDecoder().decode(bytes));
    const ok = obj && Array.isArray(obj.d) && obj.d.length && obj.d.every(day => Array.isArray(day) && day.every(m => m && P.SLOTS[m.slot] && Array.isArray(m.items) && m.items.every(x => typeof x === 'string')));
    if (!ok) throw new Error('bad-share');
    return {
      plan: { mode: obj.d.length > 1 ? 'week' : 'day', startDate: String(obj.s || '').slice(0, 10), days: obj.d.map(meals => ({ meals })), warnings: [] },
      custom: (Array.isArray(obj.c) ? obj.c : []).filter(c => c && typeof c.id === 'string' && c.id.startsWith('custom:')).map(c => ({ id: c.id, cat: c.cat, custom: true, form: c.cat === 'carb' ? 'mash' : undefined, en: String(c.en), zh: String(c.zh), emoji: c.emoji || '🍽️' })),
    };
  }

  // Inside the native iPhone app there is no web address to link to, so the menu is shared as text.
  const isWebPage = () => location.protocol === 'http:' || location.protocol === 'https:';

  async function shareMenu() {
    if (!isWebPage()) {
      const text = planText();
      if (navigator.share) {
        try { await navigator.share({ title: t('shareText'), text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      return copyPlan();
    }
    const plan = currentPlan();
    const used = new Set(plan.days.flatMap(d => d.meals.flatMap(m => m.items)));
    const custom = customAll().filter(c => used.has(c.id)).map(c => ({ id: c.id, cat: c.cat, en: c.en, zh: c.zh, emoji: c.emoji }));
    const code = await encodeShare({ v: 1, s: plan.startDate, d: plan.days.map(d => d.meals), c: custom });
    const url = location.href.split('#')[0] + '#share=' + code;
    if (navigator.share) {
      try { await navigator.share({ title: t('shareText'), text: t('shareText'), url }); return; } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast(t('linkCopied'));
    } catch (e) {
      const ta = $('copy-fallback');
      ta.hidden = false;
      ta.value = url;
      ta.focus();
      ta.select();
      toast(t('copyManual'));
    }
  }

  function clearShareHash() {
    try { history.replaceState(null, '', location.href.split('#')[0]); } catch (e) { /* ignore */ }
  }

  async function loadSharedFromHash() {
    const m = location.hash.match(/^#share=([A-Za-z0-9_-]+)$/);
    if (!m) return false;
    try {
      state.shared = await decodeShare(m[1]);
      showTab('menu');
    } catch (e) {
      clearShareHash();
      toast(t('sharedBad'));
    }
    return true;
  }

  // ---------- iPhone install tip ----------
  function maybeShowInstallTip() {
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    $('install-tip').hidden = !(ios && !standalone && isWebPage() && !window.Capacitor && window.self === window.top && !store.get('installTipDone', false));
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
    if (state.tab === 'nutrition') renderNutrition();
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
  $('share-btn').addEventListener('click', () => { shareMenu().catch(() => toast(t('copyManual'))); });
  $('shared-save').addEventListener('click', () => {
    const sh = state.shared;
    state.custom = customAll();
    state.plan = sh.plan;
    state.shared = null;
    clearShareHash();
    save();
    renderAll();
    renderMenu();
    toast(t('sharedSaved'));
  });
  $('shared-dismiss').addEventListener('click', () => { state.shared = null; clearShareHash(); renderMenu(); });
  $('install-close').addEventListener('click', () => { store.set('installTipDone', true); $('install-tip').hidden = true; });
  $('facts-search').addEventListener('input', renderFacts);
  $('facts-sort').addEventListener('change', renderFacts);
  $('milk-type').addEventListener('change', e => { state.settings.milkType = e.target.value; save(); });
  $('milk-ml').addEventListener('change', e => { state.settings.milkMl = +e.target.value; save(); });
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
  maybeShowInstallTip();
  showTab(state.plan && location.hash === '#menu' ? 'menu' : 'home');
  loadSharedFromHash();
  window.addEventListener('hashchange', loadSharedFromHash);
})();
