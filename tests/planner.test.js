// Run with: node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const D = require('../js/data.js');
const P = require('../js/planner.js');

const catOf = id => D.FOODS.find(f => f.id === id).cat;

test('weekly plan has 7 days of 5 feeds using only pantry foods', () => {
  const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: {}, seed: 1 });
  assert.strictEqual(plan.days.length, 7);
  for (const d of plan.days) {
    assert.deepStrictEqual(d.meals.map(m => m.slot), ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner']);
    for (const m of d.meals) for (const id of m.items) assert.ok(D.STARTER_PANTRY.includes(id), id);
  }
});

test('no main meal repeats in a week; snacks repeat rarely even with only 4 fruits', () => {
  for (const seed of [1, 2, 3, 99, 12345]) {
    const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: {}, seed });
    const meals = plan.days.flatMap(d => d.meals);
    const mains = meals.filter(m => !m.slot.startsWith('snack')).map(P.comboKey);
    const snacks = meals.filter(m => m.slot.startsWith('snack')).map(P.comboKey);
    assert.strictEqual(new Set(mains).size, mains.length, `seed ${seed}`);
    assert.ok(snacks.length - new Set(snacks).size <= 1, `seed ${seed}: snacks ${snacks}`);
  }
});

test('lunch and dinner differ in protein and starch on the same day', () => {
  const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: {}, seed: 7 });
  for (const d of plan.days) {
    const lunch = d.meals.find(m => m.slot === 'lunch');
    const dinner = d.meals.find(m => m.slot === 'dinner');
    assert.notStrictEqual(lunch.protein, dinner.protein);
    assert.notStrictEqual(lunch.main, dinner.main);
  }
});

test('week uses most of the pantry (diversity)', () => {
  const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: {}, seed: 5 });
  const stats = P.planStats(plan);
  assert.ok(stats.distinct >= D.STARTER_PANTRY.length - 2, `only ${stats.distinct} foods used`);
  assert.strictEqual(stats.ironDays, 7);
});

test('main meals contain a starch, vegetable and protein when available', () => {
  const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 3, settings: {}, seed: 11 });
  for (const d of plan.days) for (const m of d.meals.filter(m => m.slot === 'lunch' || m.slot === 'dinner')) {
    const cats = m.items.map(catOf);
    assert.ok(cats.includes('carb') && cats.includes('veg') && cats.includes('protein'), JSON.stringify(m));
  }
});

test('excluded allergens never appear', () => {
  const exclude = ['egg', 'dairy', 'wheat', 'fish'];
  const plan = P.generatePlan({ pantry: D.FOODS.map(f => f.id), days: 7, settings: { exclude }, seed: 3 });
  for (const d of plan.days) for (const m of d.meals) for (const id of m.items) {
    const f = D.FOODS.find(x => x.id === id);
    assert.ok(!exclude.includes(f.allergen), `${id} has ${f.allergen}`);
  }
});

test('liver appears at most once a week', () => {
  for (const seed of [1, 2, 3, 4]) {
    const plan = P.generatePlan({ pantry: ['rice', 'carrot', 'pumpkin', 'banana', 'pear', 'liver', 'chicken', 'tofu'], days: 7, settings: {}, seed });
    const n = plan.days.flatMap(d => d.meals).filter(m => m.items.includes('liver')).length;
    assert.ok(n <= 1, `liver ${n} times (seed ${seed})`);
  }
});

test('no-snack setting gives 3 meals a day', () => {
  const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 1, settings: { snacks: false }, seed: 1 });
  assert.deepStrictEqual(plan.days[0].meals.map(m => m.slot), ['breakfast', 'lunch', 'dinner']);
});

test('small pantry still produces a plan and warns', () => {
  const plan = P.generatePlan({ pantry: ['rice', 'banana'], days: 7, settings: {}, seed: 1 });
  assert.strictEqual(plan.days.length, 7);
  assert.ok(plan.warnings.some(w => w.type === 'missing' && w.cat === 'protein'));
  for (const d of plan.days) for (const m of d.meals) {
    const txt = P.describeMeal(m, 'en', [], 'puree');
    assert.ok(txt.title.length > 0);
  }
});

test('swapMeal changes only the chosen meal', () => {
  const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: {}, seed: 8 });
  const next = P.swapMeal(plan, 2, 2, { pantry: D.STARTER_PANTRY, settings: {}, seed: 9 });
  assert.notStrictEqual(P.comboKey(next.days[2].meals[2]), P.comboKey(plan.days[2].meals[2]));
  assert.deepStrictEqual(next.days[0], plan.days[0]);
  assert.deepStrictEqual(next.days[2].meals[0], plan.days[2].meals[0]);
});

test('dish text renders in both languages with safety step and no salt/sugar added', () => {
  const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: {}, seed: 4 });
  for (const d of plan.days) for (const m of d.meals) {
    const en = P.describeMeal(m, 'en', [], 'puree');
    const zh = P.describeMeal(m, 'zh', [], 'mash');
    assert.ok(en.steps.some(s => s.includes('No salt')));
    assert.ok(zh.steps.some(s => s.includes('不加盐')));
    assert.ok(/[一-鿿]/.test(zh.title), zh.title);
    assert.ok(!/undefined|null/.test(en.title + zh.title + en.steps.join() + zh.steps.join()), en.title);
  }
});

test('free text matches English, Chinese and aliases, and blocks unsafe foods', () => {
  const r = P.parseFoodText('Carrot, 鸡蛋，西红柿、butternut squash; honey, 酱油, 菠萝', []);
  assert.deepStrictEqual(r.matched, ['carrot', 'egg', 'tomato', 'pumpkin']);
  assert.deepStrictEqual(r.blocked, ['honey', '酱油']);
  assert.deepStrictEqual(r.unknown, ['菠萝']);
  assert.deepStrictEqual(P.parseFoodText('unsalted butter', []).matched, ['butter']);
});

test('custom foods are used in the plan', () => {
  const custom = [{ id: 'custom:pineapple', cat: 'fruit', custom: true, en: 'pineapple', zh: '菠萝' }];
  const plan = P.generatePlan({ pantry: ['rice', 'carrot', 'chicken', 'custom:pineapple'], customFoods: custom, days: 2, settings: {}, seed: 1 });
  assert.ok(plan.days.flatMap(d => d.meals).some(m => m.items.includes('custom:pineapple')));
  const m = plan.days[0].meals.find(x => x.items.includes('custom:pineapple'));
  assert.ok(P.describeMeal(m, 'zh', custom, 'puree').title.includes('菠萝'));
});

test('every food has a portion and a full nutrient row', () => {
  for (const f of D.FOODS) {
    assert.ok(f.portion > 0, f.id);
    assert.strictEqual(f.n.length, D.NUTRIENTS.length, f.id);
    assert.ok(f.n.every(v => typeof v === 'number' && v >= 0), f.id);
  }
});

test('portions follow the meal: one egg, bigger fruit at snacks, dry weight for grains', () => {
  const cat = P.buildCatalog([]);
  assert.strictEqual(P.portionFor({ slot: 'lunch', items: ['egg'] }, 'egg', cat), 50);
  const snackFruit = P.portionFor({ slot: 'snack1', template: 'snack_fruit', items: ['banana'] }, 'banana', cat);
  const twoFruit = P.portionFor({ slot: 'snack1', template: 'snack_two_fruit', items: ['banana', 'pear'] }, 'banana', cat);
  assert.ok(snackFruit > twoFruit);
  assert.ok(P.isDry(cat.get('rice')) && !P.isDry(cat.get('potato')));
});

test('daily nutrition is in a sensible range for a 14-month-old and includes milk', () => {
  for (const seed of [1, 2, 3]) {
    const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: {}, seed });
    for (const d of plan.days) {
      const r = P.dayNutrition(d, [], { type: 'whole', ml: 400 });
      assert.ok(r.total[0] > 550 && r.total[0] < 1100, `kcal ${r.total[0]}`);
      assert.ok(r.total[1] >= 13, `protein ${r.total[1]}`);
      assert.ok(Math.abs(r.milk[0] - 244) < 1);
      assert.ok(Math.abs(r.total[6] - r.food[6] - r.milk[6]) < 1e-9);
    }
  }
  const noMilk = P.dayNutrition({ meals: [] }, [], { type: 'breast', ml: 0 });
  assert.ok(noMilk.total.every(v => v === 0));
});

test('custom foods without data are reported, not guessed', () => {
  const custom = [{ id: 'custom:pineapple', cat: 'fruit', custom: true, en: 'pineapple', zh: '菠萝' }];
  const r = P.mealNutrition({ slot: 'snack1', template: 'snack_fruit', items: ['custom:pineapple'] }, custom);
  assert.deepStrictEqual(r.uncounted, ['custom:pineapple']);
  assert.ok(r.grams['custom:pineapple'] > 0);
});

// ---------- ages, textures, cooking methods, family photos ----------
const BIG_PANTRY = D.STARTER_PANTRY.concat(['mantou', 'bread', 'milk', 'shrimp', 'salmon', 'pork', 'napacabbage', 'cauliflower', 'ricotta', 'millet', 'pasta', 'lentils']);
const STAGE_METHODS = { meatball: 1, veg_pancake: 1, roast: 1, pancake: 1, steamcake: 1, oat_yogurt: 1, softrice: 2, wonton: 2, finger: 3 };

test('3-year-old gets family-style breakfast and dinner only', () => {
  const plan = P.generatePlan({ pantry: BIG_PANTRY, days: 7, settings: { age: 'y3', texture: 'family', meals: ['breakfast', 'dinner'] }, seed: 3 });
  for (const d of plan.days) {
    assert.deepStrictEqual(d.meals.map(m => m.slot), ['breakfast', 'dinner']);
    for (const m of d.meals) {
      assert.ok(m.template.startsWith('k_') || m.template === 'gallery', m.template);
      for (const id of m.items) assert.ok(BIG_PANTRY.includes(id), id);
    }
  }
  const keys = plan.days.flatMap(d => d.meals.map(P.comboKey));
  assert.strictEqual(new Set(keys).size, keys.length);
});

test('age defaults: 3–4 years plans breakfast and dinner with family food', () => {
  const prof = P.profileOf({ age: 'y3' });
  assert.deepStrictEqual(prof.slots, ['breakfast', 'dinner']);
  assert.strictEqual(prof.kid, true);
  assert.strictEqual(P.profileOf({}).stage, 1);
});

test('cooking methods respect the texture stage', () => {
  for (const texture of ['puree', 'mash', 'minced', 'bites']) {
    const stage = D.TEXTURES.find(x => x.id === texture).stage;
    for (const seed of [1, 2, 3]) {
      const plan = P.generatePlan({ pantry: BIG_PANTRY, days: 7, settings: { age: 'm12', texture }, seed });
      for (const m of plan.days.flatMap(d => d.meals)) {
        if (STAGE_METHODS[m.template] !== undefined) assert.ok(STAGE_METHODS[m.template] <= stage, `${m.template} at ${texture}`);
        for (const id of m.items) assert.ok((D.FOODS.find(f => f.id === id).minStage || 0) <= stage, `${id} at ${texture}`);
      }
    }
  }
});

test('a baby week uses many different cooking methods, not just purees', () => {
  const plan = P.generatePlan({ pantry: BIG_PANTRY, days: 7, settings: { age: 'm12', texture: 'mash' }, seed: 11 });
  const mains = new Set(plan.days.flatMap(d => d.meals.filter(m => m.slot === 'lunch' || m.slot === 'dinner').map(m => m.template)));
  assert.ok(mains.size >= 5, [...mains].join(','));
  assert.ok([...mains].some(x => ['meatball', 'stew', 'roast', 'veg_pancake', 'egg_custard', 'tofu_stew'].includes(x)));
});

test('dish text is complete for every age, texture and language', () => {
  const profiles = [
    { age: 'm12', texture: 'puree' }, { age: 'm12', texture: 'mash' }, { age: 'm12', texture: 'minced' },
    { age: 'y2', texture: 'bites' }, { age: 'y3', texture: 'family', meals: D.AGE_GROUPS[0].meals }, { age: 'y4', texture: 'family' },
  ];
  for (const settings of profiles) for (const seed of [1, 2, 3, 4]) {
    const plan = P.generatePlan({ pantry: BIG_PANTRY, days: 7, settings, seed });
    for (const m of plan.days.flatMap(d => d.meals)) for (const lang of ['en', 'zh']) {
      const d = P.describeMeal(m, lang, [], settings);
      const text = d.title + d.steps.join(' ');
      assert.ok(d.title.length > 1, JSON.stringify(m));
      assert.ok(!/undefined|null|NaN/.test(text), `${m.template}: ${text}`);
    }
  }
});

test('salt guidance follows age: none under 2, a pinch at most from 2', () => {
  const meal = { slot: 'dinner', template: 'k_set', main: 'rice', protein: 'beef', veg: 'carrot', veg2: 'broccoli', pmethod: 'braise', vmethod: 'steam', items: ['rice', 'beef', 'carrot', 'broccoli'] };
  assert.ok(P.describeMeal(meal, 'en', [], { age: 'y3', texture: 'family' }).steps.some(s => s.includes('pinch of salt')));
  assert.ok(P.describeMeal(meal, 'en', [], { age: 'm12', texture: 'family' }).steps.some(s => s.includes('No salt')));
});

test('older children get bigger portions and their own daily needs', () => {
  const cat = P.buildCatalog([]);
  const meal = { slot: 'dinner', template: 'k_set', items: ['rice', 'beef'] };
  assert.ok(P.portionFor(meal, 'rice', cat, 'y3') > P.portionFor(meal, 'rice', cat, 'm12'));
  assert.strictEqual(P.portionFor(meal, 'egg', cat, 'y3'), 50);
  assert.ok(P.needsFor('y3')[0] > P.needsFor('m12')[0]);
  assert.strictEqual(P.needsFor('y4')[5], 10);
});

test('family photo dishes are used only when their foods are at home', () => {
  const gallery = [
    { id: 'g1', title: '番茄炒蛋', foods: ['tomato', 'egg'], slots: ['dinner'], ages: ['y3'] },
    { id: 'g2', title: '三文鱼饭', foods: ['salmon', 'rice'], slots: ['dinner'], ages: [] },
  ];
  let used1 = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const plan = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: { age: 'y3', texture: 'family' }, seed, gallery });
    const meals = plan.days.flatMap(d => d.meals);
    const g = meals.filter(m => m.template === 'gallery');
    assert.ok(g.every(m => m.gallery === 'g1' && m.slot === 'dinner'), 'salmon is not at home, so g2 never appears');
    assert.ok(g.length <= 1, 'each photo dish at most once a week');
    used1 += g.length;
  }
  assert.ok(used1 > 0);
  const baby = P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: { age: 'm12' }, seed: 1, gallery });
  assert.ok(!baby.days.flatMap(d => d.meals).some(m => m.gallery === 'g1'), 'tagged for the 3-year-old only');
});

test('hints from the other child make shared ingredients more likely', () => {
  const hint = ['beef', 'broccoli', 'sweetpotato'];
  let withHint = 0;
  let without = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const count = p => p.days.flatMap(d => d.meals).filter(m => m.slot === 'dinner').reduce((n, m) => n + m.items.filter(id => hint.includes(id)).length, 0);
    const settings = { age: 'y3', texture: 'family' };
    withHint += count(P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings, seed, hints: Array(7).fill(hint) }));
    without += count(P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings, seed }));
  }
  assert.ok(withHint > without, `${withHint} vs ${without}`);
});

test('foods are recognised in dish names', () => {
  assert.deepStrictEqual(P.foodsInText('南瓜鸡肉粥').sort(), ['chicken', 'pumpkin']);
  assert.deepStrictEqual(P.foodsInText('Tomato & egg noodles').sort(), ['egg', 'noodles', 'tomato']);
  assert.deepStrictEqual(P.foodsInText('pineapple cake'), []);
});

test('gallery file names become titles and tags', () => {
  const { parseName } = require('../scripts/build-gallery.js');
  assert.deepStrictEqual(parseName('番茄炒蛋 [晚餐 大宝].jpg'), { title: '番茄炒蛋', tags: ['晚餐', '大宝'] });
  assert.deepStrictEqual(parseName('pumpkin_congee【早餐，小宝】.png'), { title: 'pumpkin congee', tags: ['早餐', '小宝'] });
});

// ---------- menu-idea pictures read by AI ----------
const V = require('../js/vision.js');

test('AI dish readings are cleaned: known foods, meals and ages only', () => {
  const dishes = V.normalizeDishes({ dishes: [
    { title_zh: '番茄炒蛋', title_en: 'Tomato & egg', foods: ['tomato', 'egg', 'dragon-meat'], missing: [{ zh: '葱' }], meal: 'dinner', ages: ['y3', 'teen'], steps_zh: ['打蛋', ''], steps_en: ['Beat eggs'] },
    { title_en: 'Fruit cup', foods: 'banana', meal: 'snack' },
    { foods: ['egg'] },
  ] }, D.FOODS.map(f => f.id), D.AGE_GROUPS.map(a => a.id));
  assert.strictEqual(dishes.length, 2, 'a dish without a name is dropped');
  assert.deepStrictEqual(dishes[0].foods, ['tomato', 'egg']);
  assert.deepStrictEqual(dishes[0].slots, ['dinner', 'lunch']);
  assert.deepStrictEqual(dishes[0].ages, ['y3']);
  assert.deepStrictEqual(dishes[0].steps.zh, ['打蛋']);
  assert.deepStrictEqual(dishes[0].missing, [{ en: '葱', zh: '葱' }]);
  assert.deepStrictEqual(dishes[1].titles, { zh: 'Fruit cup', en: 'Fruit cup' });
  assert.deepStrictEqual(dishes[1].foods, []);
  assert.deepStrictEqual(dishes[1].slots, ['snack1', 'snack2']);
  assert.deepStrictEqual(V.normalizeDishes(null, [], []), []);
});

test('idea dishes show their own name and steps in each language', () => {
  const g = { id: 'local:1', title: '番茄牛肉烩饭', titles: { zh: '番茄牛肉烩饭', en: 'Tomato beef rice' }, steps: { zh: ['牛肉切碎', '番茄炒软'], en: ['Mince the beef', 'Soften the tomato'] }, foods: ['tomato', 'beef', 'rice'] };
  const meal = P.galleryToMeal(g, 'dinner');
  const en = P.describeMeal(meal, 'en', [], { age: 'm12', texture: 'mash' });
  const zh = P.describeMeal(meal, 'zh', [], { age: 'y3', texture: 'family' });
  assert.strictEqual(en.title, 'Tomato beef rice');
  assert.strictEqual(zh.title, '番茄牛肉烩饭');
  assert.ok(en.steps.includes('Mince the beef'));
  assert.ok(en.steps.some(s => s.includes('Mash with a fork')), 'baby texture step is added to the idea');
  assert.ok(zh.steps.some(s => s.includes('一小撮盐')), 'big kid seasoning note is added');
  const noEn = P.describeMeal({ ...meal, titles: { zh: '番茄牛肉烩饭', en: '' }, steps: { zh: ['牛肉切碎'], en: [] } }, 'en', [], {});
  assert.strictEqual(noEn.title, '番茄牛肉烩饭');
  assert.ok(noEn.steps.includes('牛肉切碎'), 'falls back to the other language');
});

test('how often ideas are used can be turned off or up', () => {
  const gallery = [{ id: 'g1', title: '牛肉粥', foods: ['beef', 'rice'], slots: ['lunch', 'dinner'], ages: [] },
    { id: 'g2', title: '香蕉燕麦', foods: ['banana', 'oats'], slots: ['breakfast'], ages: [] }];
  const count = rate => {
    let n = 0;
    for (let seed = 1; seed <= 20; seed++) n += P.planStats(P.generatePlan({ pantry: D.STARTER_PANTRY, days: 7, settings: {}, seed, gallery, galleryRate: rate })).ideas;
    return n;
  };
  assert.strictEqual(count(0), 0);
  assert.ok(count(0.6) >= count(0.3));
  assert.ok(count(0.6) > 20);
});
