# Little Spoon Menu · 小勺辅食菜单

A simple web app that makes **daily or weekly menus for young children** (1–5 years) from the food you already have at home, with a separate menu for each child.

- **One profile per child**: age, food texture (smooth puree → soft mash → finely chopped → soft finger food → family food) and which meals to plan. Example: 小宝 (14 months, soft mash, 5 feeds a day) and 大宝 (3 years, family food, breakfast and dinner).
- **Many ways to cook**, not only boiling and mixed purees: steaming, oven-roasting, slow stews, steamed meatballs, veggie pancakes, no-sugar steamed cakes, soft rice, tiny wontons and finger-food plates, chosen to suit each child's texture stage.
- Family dishes for older children: staple + protein dish + vegetable dish (e.g. 米饭 + 土豆炖牛肉 + 蒜蓉菠菜), fried rice, dumplings, noodle soups.
- **一菜两吃 — same ingredients, a recipe for each child** (on by default, Settings): one tap makes menus for all children from one set of ingredients. The youngest child's dish decides the ingredients; each older child gets a family-style recipe with the same foods (e.g. 小宝 “西兰花豆腐红薯泥” → 大宝 “蒸红薯 + 西兰花烧豆腐”). The **一菜两吃（一起看）** view shows both versions side by side with one shared ingredient list and each child's amounts; swapping a dish changes it for everyone.
- Seasoning: the youngest (under 2) gets **no seasoning at all** (no salt, soy sauce, sugar, honey or stock); from 2, a little (a small pinch of salt or a few drops of low-sodium soy sauce), still no sugar or MSG.
- Meals rotate so the week stays **varied**: no main meal repeats in a week, lunch and dinner use different proteins and starches, and it aims for an iron-rich food every day.
- Add foods by **tapping chips**, **typing** (English or 中文, e.g. `carrot, 鸡蛋, 南瓜`), or **scanning a photo** of your fridge or groceries.
- **Suggested amounts** for every ingredient in every dish (grams, raw or dry weight), plus a per-meal energy/protein/iron line.
- **Nutrition table for each day** (food + milk) against the daily needs of a 1–3 year old, and a **Nutrition** tab with a portion guide, daily needs and a searchable per-100 g nutrition facts table for all foods.
- **Picture menu**: switch the menu between text and pictures. Each dish shows your own photo when one matches (no picture otherwise); pick a photo per dish from its dropdown.
- **Menu ideas from pictures** (Ideas tab): save pictures of dishes or menus you like. With an Anthropic API key, AI reads each picture: dish name (中文 + English), ingredients, which meal and which child it suits, and low-salt steps; a picture of a whole menu becomes several dishes. Without a key, the ingredients are picked from the dish name you type. Each idea shows whether you can cook it with what's at home or what's still missing; add it to a menu with one tap, and choose how often new menus use your ideas (never / sometimes / often). Put pictures in the repo's `gallery/` folder so the whole family sees them.
- **Share with family**: send a child's menu as a link; family members open it and save it on their phone.
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

The live app is at https://helenhuangmath.github.io/Toddler_daily_menu/ and updates automatically when `main` changes.

## How to use

0. Pick the child at the top (**给谁做 / Menu for**). Each child has their own menu and settings. With 一菜两吃 on, **生成全家菜单** makes every child's menu at once from the same ingredients.
1. **Foods / 食材**: tap the foods you have (a typical kitchen is pre-selected, so press *Clear* first to start fresh). Type anything else, or scan a photo.
2. Choose **Today / 今天** or **This week / 本周** and tap **Make menu / 生成菜单**.
3. On the **Menu / 菜单** tab:
   - tap **How to make / 做法** for step-by-step soft-texture instructions,
   - tap ⇄ to swap a single dish (with 一菜两吃 on, it changes for every child),
   - choose **一菜两吃（一起看）** in the view dropdown to see each child's version of every dish side by side,
   - tap **New combinations / 换一批搭配** to reshuffle everything,
   - each ingredient shows its suggested amount; open **Nutrition for the day / 当日营养成分** under each day,
   - **Share with family / 分享给家人** sends a link to the same menu, or copy/print the week to stick on the fridge.
4. **Ideas / 灵感**: your menu-idea pictures (add one, let AI read it or type the name, check the ingredients, save; tap **加入菜单** to put it in the menu), the family gallery (tap **✨ AI 识别** to read a family picture on this phone), and cooking methods suited to the child's stage.
5. **Nutrition / 营养**: how much to serve, daily needs for ages 1–3, iron tips, and nutrition facts per 100 g for every food.
6. **Settings / 设置**: 一菜两吃 on/off, and per child: name, age, texture, meals to plan, milk a day (counted in the totals) and allergens to leave out. Add or remove children here. Also the API key for photo scanning.

## Family photo gallery

Upload dish photos to the [`gallery/`](gallery/) folder on GitHub (**Add file → Upload files**). The file name is the dish name, with optional tags in brackets: `番茄炒蛋 [晚餐 大宝].jpg`. A `.txt` file with the same name holds the recipe steps. When the site republishes (1–2 minutes), every family member's app shows the photos, and menu dishes with the same foods use them. Details: [gallery/README.md](gallery/README.md).

## About the amounts and nutrition numbers

- Amounts are typical for one meal at 12–24 months and scaled up for older children (×1.3 at 2–3, ×1.5 at 3–4, ×1.7 at 4–5), as raw weight (dry weight for grains, lentils and prunes). Follow your child's hunger: offer, don't force.
- Nutrient values per 100 g are approximate, from USDA FoodData Central and the China Food Composition Tables. Daily needs are the US Dietary Reference Intakes (ages 1–3 until the 4th birthday, 4–8 after); energy is an estimate per age group (about 800 kcal at 14 months, 1150 kcal at 3). If a child only has some meals planned here, the daily totals only count those meals.
- Foods you add yourself show amounts but are not counted in the totals (the app says so).
- Iron is often below 7 mg a day from food alone at this age. The Nutrition tab lists ways to raise it; ask your paediatrician about fortified cereal or supplements.

## Photo scanning (optional)

Photo scanning sends the photo to Claude (Anthropic's AI model) to recognise the foods. You review the list before anything is added.
It needs your own Anthropic API key (get one at https://console.anthropic.com/settings/keys) entered in **Settings**. The key is stored only in your browser and sent only to Anthropic. Each scan costs a small amount on your Anthropic account. Everything else in the app works without a key.

## Safety rules built in

- Under 2: no seasoning at all (no salt, soy sauce, sugar, honey or stock cubes). From 2: a little salt or low-sodium soy sauce at most, no sugar. Typed foods like these are refused as pantry items.
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
| `js/gallery.js` | Dish photo library: photos on this phone (IndexedDB), the shared `gallery/` folder, photo matching |
| `js/config.js` | Address of the published site, used by the native app |
| `gallery/`, `scripts/build-gallery.js` | Family dish photos; the script writes `gallery/index.json` when the site is published |
| `js/app.js` | UI, English/Chinese text, saving to the browser |
| `tests/` | `npm test` (Node 18+) |
| `ios/`, `capacitor.config.json` | Native iPhone app (Capacitor). `npm install && npm run ios` on a Mac opens it in Xcode |

To add a food, add an entry to `FOODS` in `js/data.js` with `en`, `zh`, `cat`, `prep` text, a `portion` in grams and its `n` nutrient row.
