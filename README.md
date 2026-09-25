# Little Spoon Menu · 小勺辅食菜单

A simple web app that makes a **daily or weekly menu for a 14-month-old** from the food you already have at home.

- Every dish is **super soft or pureed** (for a toddler with only a couple of teeth), with **no salt, no sugar, no honey**.
- Meals rotate so the week stays **varied**: no main meal repeats in a week, lunch and dinner use different proteins and starches, and it aims for an iron-rich food every day.
- Add foods by **tapping chips**, **typing** (English or 中文, e.g. `carrot, 鸡蛋, 南瓜`), or **scanning a photo** of your fridge or groceries.
- **Suggested amounts** for every ingredient in every dish (grams, raw or dry weight), plus a per-meal energy/protein/iron line.
- **Nutrition table for each day** (food + milk) against the daily needs of a 1–3 year old, and a **Nutrition** tab with a portion guide, daily needs and a searchable per-100 g nutrition facts table for all foods.
- **Share with family**: send the week's menu as a link; family members open it and save it on their phone.
- Full **English / 中文** interface, including dish names and cooking steps.
- **iPhone app**: install from Safari with “Add to Home Screen” (works offline), or build the included native Xcode project. See **[docs/IPHONE.md](docs/IPHONE.md)** (中文说明).

## Try it

**On your computer:** download the repo and open `index.html` in a browser (double-click works), or run:

```bash
npm start          # serves on http://localhost:8080
```

**On your phone:** publish it with GitHub Pages (below), open the link in Safari, then use "Add to Home Screen". Full iPhone guide, including the native app and TestFlight for family: [docs/IPHONE.md](docs/IPHONE.md).

### Publish with GitHub Pages
1. Merge this branch into `main`.
2. On GitHub go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` runs the tests and deploys. Your link will be `https://<your-user>.github.io/<repo>/`.

The repository is private, and GitHub Pages on a private repository needs a paid GitHub plan. Free alternatives are making the repository public, or connecting it to Netlify or Cloudflare Pages (see [docs/IPHONE.md](docs/IPHONE.md)).

## How to use

1. **At home / 家里有什么**: tap the foods you have (a typical kitchen is pre-selected, so press *Clear* first to start fresh). Type anything else, or scan a photo.
2. Choose **Today / 今天** or **This week / 本周** and tap **Make menu / 生成菜单**.
3. On the **Menu / 菜单** tab:
   - tap **How to make / 做法** for step-by-step soft-texture instructions,
   - tap ⇄ to swap a single dish,
   - tap **New combinations / 换一批搭配** to reshuffle everything,
   - each ingredient shows its suggested amount; open **Nutrition for the day / 当日营养成分** under each day,
   - **Share with family / 分享给家人** sends a link to the same menu, or copy/print the week to stick on the fridge.
4. **Nutrition / 营养**: how much to serve, daily needs for ages 1–3, iron tips, and nutrition facts per 100 g for every food.
5. **Settings / 设置**: smooth puree vs. soft mash, with or without two snacks, how much milk a day (counted in the totals), allergens to leave out, and the API key for photo scanning.

## About the amounts and nutrition numbers

- Amounts are typical for one meal at 12–24 months, as raw weight (dry weight for grains, lentils and prunes). Follow your child's hunger: offer, don't force.
- Nutrient values per 100 g are approximate, from USDA FoodData Central and the China Food Composition Tables. Daily needs are the US Dietary Reference Intakes for ages 1–3; energy is an estimate for a ~10 kg 14-month-old (about 800 kcal).
- Foods you add yourself show amounts but are not counted in the totals (the app says so).
- Iron is often below 7 mg a day from food alone at this age. The Nutrition tab lists ways to raise it; ask your paediatrician about fortified cereal or supplements.

## Photo scanning (optional)

Photo scanning sends the photo to Claude (Anthropic's AI model) to recognise the foods. You review the list before anything is added.
It needs your own Anthropic API key (get one at https://console.anthropic.com/settings/keys) entered in **Settings**. The key is stored only in your browser and sent only to Anthropic. Each scan costs a small amount on your Anthropic account. Everything else in the app works without a key.

## Safety rules built in

- No added salt, sugar, honey, soy sauce or stock cubes. Typed foods like these are refused.
- Round foods are never served whole, no whole nuts, nut and seed butters are thinned.
- Eggs, meat and fish are always fully cooked; fish is checked for bones.
- Allergens are tagged; you can exclude egg, dairy, fish, shellfish, wheat, soy, peanut or sesame.
- Liver at most once a week.

This is general guidance, not medical advice. Check with your paediatrician, especially about allergies.

## Project layout

| File | What it does |
|---|---|
| `index.html`, `css/style.css` | The app page |
| `js/data.js` | Food database: bilingual names, soft-prep notes, allergen and iron tags, portions, nutrients per 100 g, daily needs |
| `js/planner.js` | Menu generator (variety rules, dish names, cooking steps, portions, nutrition totals). No DOM, unit-tested |
| `js/vision.js` | Photo → foods using the Anthropic SDK (loaded only when scanning) |
| `js/app.js` | UI, English/Chinese text, saving to the browser |
| `tests/` | `npm test` (Node 18+) |
| `ios/`, `capacitor.config.json` | Native iPhone app (Capacitor). `npm install && npm run ios` on a Mac opens it in Xcode |

To add a food, add an entry to `FOODS` in `js/data.js` with `en`, `zh`, `cat`, `prep` text, a `portion` in grams and its `n` nutrient row.
