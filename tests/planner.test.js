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
