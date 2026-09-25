/*
 * Photos -> ingredient lists and dish ideas, using Claude's vision via the official Anthropic SDK.
 * The SDK is loaded on demand from the jsDelivr CDN, only when a photo is scanned,
 * so the rest of the app works fully offline.
 *
 * The API key is entered by the user in Settings and kept only in this browser.
 */
(function (root) {
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk/+esm';
  const MODEL = 'claude-opus-5';
  let sdkPromise = null;

  function loadSdk() {
    if (!sdkPromise) sdkPromise = import(SDK_URL).then(m => m.default || m.Anthropic);
    return sdkPromise;
  }

  /** Downscale the photo to keep uploads small and fast. Returns { mediaType, data }. */
  function fileToJpegBase64(file, maxSide) {
    maxSide = maxSide || 1280;
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({ mediaType: 'image/jpeg', data: dataUrl.split(',')[1] });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image-unreadable')); };
      img.src = url;
    });
  }

  function buildPrompt(foods) {
    const list = foods.map(f => `${f.id}: ${f.en} / ${f.zh}`).join('\n');
    return `A parent took this photo of food at home (fridge, pantry, groceries or a table). They are planning meals for a 14-month-old who can only eat very soft or pureed food with no added salt or sugar.

List every raw food ingredient you can see that could be cooked soft for this toddler.

Use these ids when an item matches (a close variety counts, e.g. any white fish -> cod, butternut -> pumpkin):
${list}

Leave out non-food items, and anything with added salt or sugar or that is a choking hazard even when cooked (candy, chips, sausages, ham, soy sauce, sugary drinks, whole nuts).

Reply with only a JSON object in this shape, no other text:
{"known": ["id", ...], "other": [{"en": "English name", "zh": "中文名", "category": "carb|veg|fruit|protein|dairy|fat"}]}`;
  }

  function parseJson(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end < start) throw new Error('bad-response');
    const obj = JSON.parse(text.slice(start, end + 1));
    return {
      known: Array.isArray(obj.known) ? obj.known.filter(x => typeof x === 'string') : [],
      other: Array.isArray(obj.other) ? obj.other.filter(x => x && (x.en || x.zh)) : [],
    };
  }

  /**
   * Identify foods in a photo.
   * @returns {Promise<{known: string[], other: {en,zh,category}[]}>}
   */
  async function identifyFoods(file, apiKey, foods) {
    const text = await askAboutImage(file, apiKey, buildPrompt(foods));
    const result = parseJson(text);
    const ids = new Set(foods.map(f => f.id));
    result.known = [...new Set(result.known.filter(id => ids.has(id)))];
    return result;
  }

  // ---------- dish ideas ----------

  function buildDishPrompt(foods, ages) {
    const list = foods.map(f => `${f.id}: ${f.en} / ${f.zh}`).join('\n');
    const ageList = ages.map(a => `${a.id}: ${a.en}`).join('\n');
    return `A parent saved this picture as a menu idea for their young children. It may show one dish, a plate with several dishes, a written menu or a recipe card.

For each dish in the picture (at most 6), work out what it is and how to make it at home for young children: no added sugar or honey, and no salt for under-2s (a small pinch at most from age 2).

Use these food ids for ingredients (a close variety counts, e.g. any white fish -> cod). Leave out seasonings, oil and water. Put important ingredients that are not on the list in "missing".
${list}

Age groups (list every group that can eat the dish, with the texture adjusted where needed; leave out a group if the dish is unsafe for it, e.g. whole nuts, fried or very salty food):
${ageList}

Reply with only a JSON object in this shape, no other text:
{"dishes": [{"title_zh": "中文菜名", "title_en": "English dish name", "foods": ["id"], "missing": [{"en": "", "zh": ""}], "meal": "breakfast|lunch|dinner|snack", "ages": ["id"], "steps_zh": ["3–6 short steps"], "steps_en": ["3–6 short steps"]}]}`;
  }

  // The meal Claude named comes first; lunch and dinner dishes suit either.
  const MEALS = { breakfast: ['breakfast'], lunch: ['lunch', 'dinner'], dinner: ['dinner', 'lunch'], snack: ['snack1', 'snack2'] };

  /** Clean up Claude's dish list: known food ids only, known meals and ages, short text. Pure, for tests. */
  function normalizeDishes(obj, foodIds, ageIds) {
    const ids = new Set(foodIds);
    const ages = new Set(ageIds);
    const str = (x, n) => (typeof x === 'string' ? x.trim().slice(0, n) : '');
    const steps = x => (Array.isArray(x) ? x.map(y => str(y, 200)).filter(Boolean).slice(0, 8) : []);
    return (obj && Array.isArray(obj.dishes) ? obj.dishes : []).slice(0, 6).map(d => {
      const titles = { zh: str(d.title_zh, 40) || str(d.title_en, 40), en: str(d.title_en, 60) || str(d.title_zh, 60) };
      return {
        titles,
        foods: [...new Set((Array.isArray(d.foods) ? d.foods : []).filter(id => ids.has(id)))],
        missing: (Array.isArray(d.missing) ? d.missing : []).filter(m => m && (m.en || m.zh)).map(m => ({ en: str(m.en, 40) || str(m.zh, 40), zh: str(m.zh, 40) || str(m.en, 40) })).slice(0, 6),
        slots: MEALS[d.meal] || [],
        ages: (Array.isArray(d.ages) ? d.ages : []).filter(a => ages.has(a)),
        steps: { zh: steps(d.steps_zh), en: steps(d.steps_en) },
      };
    }).filter(d => d.titles.zh || d.titles.en);
  }

  /**
   * Read a menu-idea picture into dishes.
   * @param image  a File/Blob, or the URL of a picture (family gallery)
   * @returns {Promise<Array<{titles, foods, missing, slots, ages, steps}>>}
   */
  async function analyzeDishes(image, apiKey, foods, ages) {
    let file = image;
    if (typeof image === 'string') {
      const res = await fetch(image);
      if (!res.ok) throw new Error('image-unreadable');
      file = await res.blob();
    }
    const text = await askAboutImage(file, apiKey, buildDishPrompt(foods, ages));
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end < start) throw new Error('bad-response');
    return normalizeDishes(JSON.parse(text.slice(start, end + 1)), foods.map(f => f.id), ages.map(a => a.id));
  }

  // ---------- shared request ----------

  async function askAboutImage(file, apiKey, prompt) {
    if (!apiKey) throw new Error('no-key');
    const [Anthropic, image] = await Promise.all([loadSdk(), fileToJpegBase64(file)]);
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    let response;
    try {
      response = await request(client, image, prompt);
    } catch (err) {
      // Most specific first; APIConnectionError is a subclass of APIError in the TS SDK.
      if (err instanceof Anthropic.AuthenticationError) throw new Error('bad-key');
      if (err instanceof Anthropic.RateLimitError) throw new Error('rate-limit');
      if (err instanceof Anthropic.APIConnectionError) throw new Error('network');
      if (err instanceof Anthropic.APIError) throw new Error('api:' + (err.message || err.status));
      throw err;
    }

    if (response.stop_reason === 'refusal') throw new Error('refused');
    return response.content.filter(b => b.type === 'text').map(b => b.text).join('');
  }

  function request(client, image, prompt) {
    return client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
          { type: 'text', text: prompt },
        ],
      }],
    });
  }

  const api = { identifyFoods, analyzeDishes, normalizeDishes, MODEL };
  root.TDM_VISION = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
