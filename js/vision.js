/*
 * Photo -> ingredient list, using Claude's vision via the official Anthropic SDK.
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
    if (!apiKey) throw new Error('no-key');
    const [Anthropic, image] = await Promise.all([loadSdk(), fileToJpegBase64(file)]);
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    let response;
    try {
      response = await requestFoods(client, image, foods);
    } catch (err) {
      // Most specific first; APIConnectionError is a subclass of APIError in the TS SDK.
      if (err instanceof Anthropic.AuthenticationError) throw new Error('bad-key');
      if (err instanceof Anthropic.RateLimitError) throw new Error('rate-limit');
      if (err instanceof Anthropic.APIConnectionError) throw new Error('network');
      if (err instanceof Anthropic.APIError) throw new Error('api:' + (err.message || err.status));
      throw err;
    }

    if (response.stop_reason === 'refusal') throw new Error('refused');
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const result = parseJson(text);
    const ids = new Set(foods.map(f => f.id));
    result.known = [...new Set(result.known.filter(id => ids.has(id)))];
    return result;
  }

  function requestFoods(client, image, foods) {
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
          { type: 'text', text: buildPrompt(foods) },
        ],
      }],
    });
  }

  root.TDM_VISION = { identifyFoods, MODEL };
})(window);
