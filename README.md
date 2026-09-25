# Little Spoon Menu · 小勺辅食菜单

A simple web app that makes a **daily or weekly menu for a 14-month-old** from the food you already have at home.

- Every dish is **super soft or pureed** (for a toddler with only a couple of teeth), with **no salt, no sugar, no honey**.
- Meals rotate so the week stays **varied**: no main meal repeats in a week, lunch and dinner use different proteins and starches, and it aims for an iron-rich food every day.
- Add foods by **tapping chips**, **typing** (English or 中文, e.g. `carrot, 鸡蛋, 南瓜`), or **scanning a photo** of your fridge or groceries.
- Full **English / 中文** interface, including dish names and cooking steps.
- Works offline (except photo scanning) and can be added to your phone's home screen.

## Try it

**On your computer:** download the repo and open `index.html` in a browser (double-click works), or run:

```bash
npm start          # serves on http://localhost:8080
```

**On your phone:** publish it with GitHub Pages (below), open the link, then use "Add to Home Screen".

### Publish with GitHub Pages
1. Merge this branch into `main`.
2. On GitHub go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` runs the tests and deploys. Your link will be `https://<your-user>.github.io/<repo>/`.

## How to use

1. **At home / 家里有什么**: tap the foods you have (a typical kitchen is pre-selected, so press *Clear* first to start fresh). Type anything else, or scan a photo.
2. Choose **Today / 今天** or **This week / 本周** and tap **Make menu / 生成菜单**.
3. On the **Menu / 菜单** tab:
   - tap **How to make / 做法** for step-by-step soft-texture instructions,
   - tap ⇄ to swap a single dish,
   - tap **New combinations / 换一批搭配** to reshuffle everything,
   - copy or print the week to stick on the fridge.
4. **Settings / 设置**: smooth puree vs. soft mash, with or without two snacks, allergens to leave out, and the API key for photo scanning.

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
| `js/data.js` | Food database: bilingual names, soft-prep notes, allergen and iron tags |
| `js/planner.js` | Menu generator (variety rules, dish names, cooking steps). No DOM, unit-tested |
| `js/vision.js` | Photo → foods using the Anthropic SDK (loaded only when scanning) |
| `js/app.js` | UI, English/Chinese text, saving to the browser |
| `tests/` | `npm test` (Node 18+) |

To add a food, add an entry to `FOODS` in `js/data.js` with `en`, `zh`, `cat` and `prep` text.
