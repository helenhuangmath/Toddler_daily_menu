/* UI controller: state, rendering and events. */
(function () {
  const { CATEGORIES, FOODS, ALLERGENS, STARTER_PANTRY, NUTRIENTS, MILKS, AGE_GROUPS, TEXTURES, COOKING_IDEAS } = window.TDM_DATA;
  const P = window.TDM_PLANNER;

  // ---------- text ----------
  const T = {
    en: {
      appName: 'Little Spoon Menu', appSub: 'Menus for little ones · low salt · no sugar',
      tabHome: 'Foods', tabMenu: 'Menu', tabSettings: 'Settings',
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
        'Under 2: no added salt, sugar, honey, soy sauce or stock cubes. From 2: only a small pinch of salt, still no added sugar.',
        'Food texture follows each child\'s stage, from smooth puree to family food cut small.',
        'Round foods (blueberries, grapes, cherry tomatoes) are squashed or quartered. No whole nuts under 5.',
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
      tabIdeas: 'Ideas', kidsLabel: 'Menu for',
      viewLabel: 'View', viewList: 'Text menu', viewPictures: 'Picture menu',
      picLabel: 'Picture', photoAuto: 'Auto picture', photoNoneOpt: 'No picture',
      myPhotosGroup: 'My photos', familyPhotosGroup: 'Family gallery',
      sameFood: name => `Same food as ${name}`, sameFoodTip: 'Cook once: take the younger child\'s portion out before adding any salt.',
      ideasTitle: name => `Cooking ideas for ${name}`,
      ideasHint: 'Ways to cook beyond boiling and mixed purees. The menu rotates through the ones that suit this stage.',
      nextStage: 'Next step',
      myPhotosTitle: 'My menu ideas', uploadBtn: 'Add a picture',
      ideaRateLabel: 'Use my ideas in new menus', rateOff: 'Never', rateSome: 'Sometimes', rateOften: 'Often',
      aiRead: '✨ Read this picture with AI', aiShort: '✨ AI read', aiReading: 'Reading the picture…',
      aiNone: 'No dish found in this picture. Type the dish name instead.', aiDone: 'Filled in from the picture. Check it, then save.',
      aiFound: n => `Found ${n} dishes. Untick any you don't want, then save.`,
      aiNeedKey: 'With an Anthropic API key (Settings), AI reads each picture: dish name, ingredients, which child it suits and how to make it. Without one, type the dish name and the ingredients are picked from it.',
      saveDishes: n => `Save ${n} dishes`, photoSavedN: n => `Saved ${n} dishes.`, editPhoto: 'Edit',
      ideaReady: 'You have everything at home', ideaMissing: list => `Still need: ${list}`, ideaExtra: list => `Also uses: ${list}`,
      ideaNoFoods: 'No ingredients yet. Edit it, or let AI read it.', addFoodPh: 'Add an ingredient, e.g. egg',
      draftFoodsLabel: 'Ingredients (tap to remove or add back)',
      statIdeas: n => `<b>${n}</b> from my ideas`,
      myPhotosHint: 'Save pictures of dishes or menus you like. New menus use them when you have the foods at home. Saved on this phone only; for pictures the whole family sees, use the family gallery below.',
      choosePhoto: 'Choose a photo', dishName: 'Dish name', dishNamePh: 'e.g. pumpkin chicken congee', dishNotes: 'How to make (optional, one step per line)',
      forMeals: 'Meal', forWho: 'For', foundFoods: 'Foods found in the name:',
      noFoodsFound: 'No foods recognised yet. Put food names in the dish name, e.g. “pumpkin chicken congee”.',
      savePhoto: 'Save photo', photoSaved: 'Photo saved.', needPhotoTitle: 'Choose a photo and give it a name.',
      addToMenu: 'Add to menu', addToMenuDo: 'Put it in', addedToMenu: 'Added to the menu.', noMenuYet: 'Make a menu first.',
      remove: 'Delete', confirmRemove: 'Tap again to delete', removed: 'Deleted.', cancel: 'Cancel',
      sharedTitle: 'Family gallery', sharedHint: 'Photos in the gallery folder on GitHub. Everyone\'s app shows them, and matching dishes in the menu use them.',
      sharedHow: 'How to add family photos', sharedEmpty: 'No family photos yet.', galleryEmpty: 'No photos yet.',
      kidTitle: 'Children', kidName: 'Name', kidAge: 'Age', kidTexture: 'Food texture', kidMeals: 'Meals to plan',
      addKid: 'Add a child', removeKid: 'Remove this child', confirmRemoveKid: 'Tap again to remove', newKid: 'Child',
      portionScale: (name, age, x) => `The amounts below are for 12–24 months. For ${name} (${age}) the menu uses about ${x}× these.`,
      needsFor: (name, age) => `Daily needs for ${name} (${age})`,
      menuForKid: name => `Menu for ${name}`, details: 'Amounts & how to make',
      pairTitle: 'Same ingredients, a recipe for each child', pairLabel: 'Plan all children together from the same ingredients',
      pairHint: 'One shopping list and less cooking: each dish uses the same ingredients for every child, cooked the way each one eats. The youngest gets no seasoning at all; older children may have a little.',
      makeAll: 'Make menus for all', madeAll: names => `Made matching menus for ${names}.`,
      viewTogether: 'Cook together (all children)',
      togetherTip: name => `Wash, cut and cook the ingredients together. Take ${name}'s portion out before adding any seasoning, then season the rest lightly.`,
      sharedFoods: 'Shared ingredients', pairBadge: (name, title) => `Same ingredients · ${name}: ${title}`,
      noPhotoYet: 'No photo yet. Add one in Ideas, or pick one here.', togetherNeedsPair: 'Turn on “same ingredients” in Settings and make menus to see this view.',
      partialDay: meals => `Only the meals planned here are counted (${meals}). Lunch or snacks eaten at nursery or school are not included.`,
      menuFor: 'Toddler menu',
    },
    zh: {
      appName: '小勺辅食菜单', appSub: '宝宝辅食和儿童餐 · 少盐 · 无糖',
      tabHome: '食材', tabMenu: '菜单', tabSettings: '设置',
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
        '2岁以下：不加盐、糖、蜂蜜、酱油或鸡精。2岁以上：最多一小撮盐，仍然不加糖。',
        '食物质地按每个孩子的阶段安排，从细腻泥糊到切小块的家常菜。',
        '圆形食物（蓝莓、葡萄、小番茄）要压扁或切成四瓣。5岁以下不给整粒坚果。',
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
      tabIdeas: '灵感', kidsLabel: '给谁做',
      viewLabel: '查看方式', viewList: '文字菜单', viewPictures: '图片菜单',
      picLabel: '图片', photoAuto: '自动配图', photoNoneOpt: '不要图片',
      myPhotosGroup: '我的照片', familyPhotosGroup: '家庭图库',
      sameFood: name => `和${name}同食材`, sameFoodTip: '一锅两吃：加盐调味前，先盛出小的那份。',
      ideasTitle: name => `适合${name}的做法`,
      ideasHint: '除了水煮和混合打泥，还可以这样做。菜单会轮换使用适合这个阶段的做法。',
      nextStage: '下一阶段',
      myPhotosTitle: '我的菜单灵感', uploadBtn: '添加图片',
      ideaRateLabel: '生成菜单时用我的灵感菜', rateOff: '不用', rateSome: '有时', rateOften: '经常',
      aiRead: '✨ 用 AI 识别这张图', aiShort: '✨ AI 识别', aiReading: '正在识别图片…',
      aiNone: '没有在图里认出菜，请直接输入菜名。', aiDone: '已根据图片填好，检查后保存。',
      aiFound: n => `识别到 ${n} 道菜，取消勾选不要的，再保存。`,
      aiNeedKey: '在“设置”里填写 Anthropic API 密钥后，AI 会读懂每张图：菜名、食材、适合哪个孩子和做法。没有密钥时，输入菜名也能自动认出里面的食材。',
      saveDishes: n => `保存 ${n} 道菜`, photoSavedN: n => `已保存 ${n} 道菜。`, editPhoto: '编辑',
      ideaReady: '家里的食材够做', ideaMissing: list => `还差：${list}`, ideaExtra: list => `另外需要：${list}`,
      ideaNoFoods: '还没有食材信息：编辑一下或用 AI 识别。', addFoodPh: '添加食材，例如：鸡蛋',
      draftFoodsLabel: '食材（点一下去掉或加回）',
      statIdeas: n => `<b>${n}</b> 道来自我的灵感`,
      myPhotosHint: '保存喜欢的菜或菜单图片。家里食材够的时候，新菜单会用上这些灵感菜。只保存在这部手机上；想让全家都看到，请用下面的家庭图库。',
      choosePhoto: '选择照片', dishName: '菜名', dishNamePh: '例如：南瓜鸡肉粥', dishNotes: '做法（可选，每行一步）',
      forMeals: '餐次', forWho: '给谁', foundFoods: '从菜名识别到的食材：',
      noFoodsFound: '还没识别到食材。菜名里写上食材，例如“南瓜鸡肉粥”。',
      savePhoto: '保存照片', photoSaved: '照片已保存。', needPhotoTitle: '请选一张照片并填写菜名。',
      addToMenu: '加入菜单', addToMenuDo: '放进去', addedToMenu: '已加入菜单。', noMenuYet: '请先生成菜单。',
      remove: '删除', confirmRemove: '再点一次删除', removed: '已删除。', cancel: '取消',
      sharedTitle: '家庭图库（全家共享）', sharedHint: '放在 GitHub 的 gallery 文件夹里的照片，全家每部手机都能看到，菜单里相同食材的菜会自动用这些图。',
      sharedHow: '怎么添加家庭照片', sharedEmpty: '家庭图库里还没有照片。', galleryEmpty: '还没有照片。',
      kidTitle: '孩子', kidName: '名字', kidAge: '年龄', kidTexture: '食物质地', kidMeals: '需要安排的餐',
      addKid: '添加孩子', removeKid: '删除这个孩子', confirmRemoveKid: '再点一次删除', newKid: '宝宝',
      portionScale: (name, age, x) => `下面是1–2岁的量。${name}（${age}）的菜单约为这个量的${x}倍。`,
      needsFor: (name, age) => `${name}（${age}）每日营养需要`,
      menuForKid: name => `${name}的菜单`, details: '用量和做法',
      pairTitle: '一菜两吃：同样的食材，各做各的', pairLabel: '所有孩子用同样的食材一起安排菜单',
      pairHint: '只买一份菜、少做几顿：每道菜所有孩子用同样的食材，按各自的吃法做。最小的孩子什么调料都不放，大一点的可以少放一点。',
      makeAll: '生成全家菜单', madeAll: names => `已为${names}生成同食材菜单。`,
      viewTogether: '一菜两吃（一起看）',
      togetherTip: name => `食材一起洗、切、煮熟；在放任何调料之前，先盛出${name}的一份，剩下的再少放一点调料。`,
      sharedFoods: '共用食材', pairBadge: (name, title) => `一菜两吃 · ${name}吃：${title}`,
      noPhotoYet: '还没有照片，可以在“灵感”里添加，或在这里选一张。', togetherNeedsPair: '在“设置”里打开“一菜两吃”并生成菜单后，就能在这里一起看。',
      partialDay: meals => `只计算这里安排的餐（${meals}）。在幼儿园或学校吃的午餐、加餐没有计入。`,
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
  const SLOT_IDS = P.SLOT_ORDER;

  function newProfile(id, name, ageId) {
    const age = P.ageGroup(ageId);
    return { id, name, age: age.id, texture: age.texture, meals: age.meals.slice(), exclude: [], milkType: 'whole', milkMl: age.milkMl };
  }

  // Profiles: one per child. Older saves had a single `settings` + `plan`; they become the first child.
  function loadProfiles() {
    let profiles = store.get('profiles', null);
    let plans = store.get('plans', null);
    if (!Array.isArray(profiles) || !profiles.length) {
      const old = store.get('settings', null);
      const baby = newProfile('kid1', '小宝', 'm12');
      if (old) {
        baby.texture = old.texture === 'puree' ? 'puree' : 'mash';
        baby.meals = old.snacks === false ? ['breakfast', 'lunch', 'dinner'] : SLOT_IDS.slice();
        baby.exclude = old.exclude || [];
        baby.milkType = old.milkType || 'whole';
        baby.milkMl = old.milkMl != null ? old.milkMl : 400;
      }
      profiles = [baby, newProfile('kid2', '大宝', 'y3')];
      plans = { kid1: store.get('plan', null) };
    }
    return { profiles, plans: plans || {} };
  }

  const loaded = loadProfiles();
  const state = {
    lang: store.get('lang', browserZh ? 'zh' : 'en'),
    tab: 'home',
    mode: store.get('mode', 'week'),
    view: store.get('view', 'list'),
    pantry: new Set(store.get('pantry', STARTER_PANTRY)),
    custom: store.get('custom', []),
    profiles: loaded.profiles,
    plans: loaded.plans,
    active: store.get('active', loaded.profiles[0].id),
    shared: null,
    apiKey: store.get('apiKey', ''),
    unknown: [],
    photos: { local: [], shared: [] },
    draft: null, // idea picture being added or edited on the Ideas tab
    ideaRate: store.get('ideaRate', 0.3), // how often new menus use the family's own ideas
    pairMode: store.get('pairMode', true), // one set of ingredients, a recipe for each child
  };
  if (!state.profiles.some(p => p.id === state.active)) state.active = state.profiles[0].id;

  const $ = id => document.getElementById(id);
  const t = key => T[state.lang][key];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const allFoods = () => FOODS.concat(state.custom);
  const foodName = f => (state.lang === 'zh' ? f.zh : f.en);
  const prof = () => state.profiles.find(p => p.id === state.active) || state.profiles[0];
  const ageLabel = p => P.ageGroup(p.age)[state.lang];
  const activePlan = () => state.plans[state.active] || null;
  const pairing = () => state.pairMode && state.profiles.length > 1;
  const isWebPage = () => location.protocol === 'http:' || location.protocol === 'https:';
  const siteBase = () => (isWebPage() ? '' : (window.TDM_CONFIG && window.TDM_CONFIG.SITE_URL) || '');

  function save() {
    store.set('pantry', [...state.pantry]);
    store.set('custom', state.custom);
    store.set('profiles', state.profiles);
    store.set('plans', state.plans);
    store.set('active', state.active);
    store.set('mode', state.mode);
    store.set('view', state.view);
    store.set('pairMode', state.pairMode);
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

  function fmt(v, dp) {
    return dp ? (Math.round(v * 10) / 10).toFixed(1) : String(Math.round(v));
  }

  function localDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

  // ---------- tabs & child switcher ----------
  const TABS = ['home', 'menu', 'ideas', 'nutrition', 'settings'];
  function showTab(tab) {
    state.tab = tab;
    TABS.forEach(id => {
      $('panel-' + id).hidden = id !== tab;
      $('tab-' + id).setAttribute('aria-selected', id === tab);
    });
    renderTab();
    window.scrollTo({ top: 0 });
  }

  function renderTab() {
    if (state.tab === 'menu') renderMenu();
    if (state.tab === 'ideas') renderIdeas();
    if (state.tab === 'nutrition') renderNutrition();
    if (state.tab === 'settings') renderSettings();
  }

  function renderKidBar() {
    $('kid-bar').innerHTML = `<span class="kid-label">${esc(t('kidsLabel'))}</span>` + state.profiles.map(p =>
      `<button type="button" class="kid" data-kid="${esc(p.id)}" aria-pressed="${p.id === state.active}"><b>${esc(p.name)}</b><small>${esc(ageLabel(p))}</small></button>`).join('');
  }

  function switchKid(id) {
    state.active = id;
    save();
    renderKidBar();
    renderMode();
    renderPantry();
    renderTab();
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
    const excluded = f.allergen && prof().exclude.includes(f.allergen);
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

  // ---------- fridge photo scan ----------
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
      setStatus(status, t(aiErrorKey(err)), 'err');
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

  // ---------- photo library ----------
  const allPhotos = () => state.photos.local.concat(state.photos.shared);
  const photoTitle = g => (g.titles && (g.titles[state.lang] || g.titles.zh || g.titles.en)) || g.title || '—';
  const kidsForAges = ages => (ages && ages.length ? state.profiles.filter(p => ages.includes(p.age)).map(p => p.id) : []);

  // Family photos are tagged by file name: meal words and children's names.
  const SLOT_WORDS = {
    breakfast: ['早餐', 'breakfast'], lunch: ['午餐', '午饭', 'lunch'], dinner: ['晚餐', '晚饭', 'dinner'],
    snack1: ['加餐', '点心', 'snack'], snack2: ['加餐', '点心', 'snack'],
  };
  // AI readings of family-gallery pictures, kept on this phone: { photoId: [dish] }.
  const sharedMeta = () => store.get('sharedMeta', {}) || {};

  function enrichShared(items) {
    const meta = sharedMeta();
    const out = [];
    for (const g of items) {
      const dishes = meta[g.id];
      if (Array.isArray(dishes) && dishes.length) {
        dishes.forEach((d, i) => out.push({
          ...g, id: dishes.length > 1 ? `${g.id}#${i}` : g.id, title: d.titles.zh || d.titles.en, titles: d.titles, steps: d.steps,
          missing: d.missing || [], foods: d.foods, slots: d.slots, who: kidsForAges(d.ages), ai: true,
        }));
        continue;
      }
      const tags = (g.tags || []).map(x => x.toLowerCase());
      const slots = SLOT_IDS.filter(s => SLOT_WORDS[s].some(w => tags.includes(w)));
      const who = state.profiles.filter(p => tags.includes(p.name.toLowerCase())).map(p => p.id);
      out.push({ ...g, slots, who, foods: P.foodsInText(g.title + ' ' + (g.notes || ''), state.custom) });
    }
    return out;
  }

  let rawShared = [];
  async function loadPhotos() {
    const [local, shared] = await Promise.all([window.TDM_GALLERY.listLocal(), window.TDM_GALLERY.loadShared(siteBase())]);
    rawShared = shared;
    state.photos.local = local;
    state.photos.shared = enrichShared(shared);
    renderTab();
  }

  /** The gallery as the planner sees it: ages come from which children a photo is for. */
  function galleryForPlanner() {
    const ageOf = id => (state.profiles.find(p => p.id === id) || {}).age;
    return allPhotos().filter(g => g.foods.length).map(g => ({
      id: g.id, title: g.title, notes: g.notes, titles: g.titles, steps: g.steps, foods: g.foods, slots: g.slots, ages: (g.who || []).map(ageOf).filter(Boolean),
    }));
  }

  function photoFor(meal) {
    if (meal.photo === 'none') return null;
    if (meal.photo && meal.photo !== 'auto') return allPhotos().find(g => g.id === meal.photo) || null;
    return window.TDM_GALLERY.matchPhoto(meal, allPhotos(), state.active);
  }

  function pictureSrc(meal) {
    const g = photoFor(meal);
    return g ? { src: g.src, title: photoTitle(g) } : null;
  }

  function photoSelect(meal, di, mi) {
    const cur = meal.photo || 'auto';
    const opt = (v, label) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(label)}</option>`;
    const group = (label, list) => (list.length ? `<optgroup label="${esc(label)}">${list.map(g => opt(g.id, photoTitle(g))).join('')}</optgroup>` : '');
    return `<label class="pic-select"><span>${esc(t('picLabel'))}</span><select data-photo="${di}:${mi}" id="photo-${di}-${mi}">
      ${opt('auto', t('photoAuto'))}${opt('none', t('photoNoneOpt'))}${group(t('myPhotosGroup'), state.photos.local)}${group(t('familyPhotosGroup'), state.photos.shared)}</select></label>`;
  }

  // ---------- plan ----------

  /** Foods each other child eats on the same dates, so one pot can feed both. */
  function hintsFor(startDate, nDays) {
    const hints = [];
    for (let i = 0; i < nDays; i++) hints.push(new Set());
    const start = new Date(startDate + 'T12:00:00').getTime();
    for (const p of state.profiles) {
      if (p.id === state.active) continue;
      const other = state.plans[p.id];
      if (!other || !other.startDate) continue;
      const offset = Math.round((new Date(other.startDate + 'T12:00:00').getTime() - start) / 86400000);
      other.days.forEach((d, i) => {
        const idx = i + offset;
        if (idx >= 0 && idx < nDays) d.meals.forEach(m => { if (!m.slot.startsWith('snack')) m.items.forEach(id => hints[idx].add(id)); });
      });
    }
    return hints.map(h => [...h]);
  }

  function genOpts(seed, startDate, nDays) {
    return {
      pantry: [...state.pantry], customFoods: state.custom, settings: prof(), seed,
      history: P.usageOf(activePlan()), gallery: galleryForPlanner(), galleryRate: state.ideaRate, hints: hintsFor(startDate, nDays),
    };
  }

  function makePlan() {
    const excl = pairing() ? state.profiles.flatMap(p => p.exclude) : prof().exclude;
    const cats = new Set(allFoods().filter(f => state.pantry.has(f.id) && !(f.allergen && excl.includes(f.allergen))).map(f => f.cat));
    if (!cats.has('carb') && !cats.has('veg') && !cats.has('fruit')) { toast(t('needFoods')); return; }
    const nDays = state.mode === 'week' ? 7 : 1;
    const startDate = localDate(new Date());
    const seed = Date.now() & 0x7fffffff;
    if (pairing()) {
      // One set of ingredients for everyone: the youngest child's menu, rewritten for each of the others.
      const base = P.familyOrder(state.profiles)[0];
      const opts = { ...genOpts(seed, startDate, nDays), history: P.usageOf(state.plans[base.id]), hints: null };
      Object.assign(state.plans, P.generateFamilyPlans({ ...opts, startDate, days: nDays, profiles: state.profiles }));
      toast(t('madeAll')(state.profiles.map(p => p.name).join(state.lang === 'zh' ? '和' : ' & ')));
    } else {
      state.plans[state.active] = P.generatePlan({ ...genOpts(seed, startDate, nDays), startDate, days: nDays });
    }
    save();
    showTab('menu');
  }

  // Custom foods from a shared menu are shown before they are saved.
  const customAll = () => (state.shared ? state.custom.concat(state.shared.custom.filter(c => !state.custom.some(x => x.id === c.id))) : state.custom);
  const currentPlan = () => (state.shared ? state.shared.plan : activePlan());
  const milkSetting = () => ({ type: prof().milkType, ml: +prof().milkMl });

  /** Other children's meal in the same slot on the same date that shares at least 2 foods. */
  /** Another child's meal in the same slot on the same date that shares at least 2 foods. */
  function sameFoodWith(plan, di, meal) {
    if (state.shared) return null;
    if (meal.slot.startsWith('snack') && !meal.pair) return null;
    const date = new Date(new Date(plan.startDate + 'T12:00:00').getTime() + di * 86400000);
    for (const p of state.profiles) {
      if (p.id === state.active) continue;
      const other = state.plans[p.id];
      if (!other || !other.startDate) continue;
      const idx = Math.round((date.getTime() - new Date(other.startDate + 'T12:00:00').getTime()) / 86400000);
      const day = other.days[idx];
      if (!day) continue;
      const om = day.meals.find(m => m.slot === meal.slot) || (meal.pair ? null : day.meals.find(m => ['lunch', 'dinner'].includes(m.slot) && ['lunch', 'dinner'].includes(meal.slot)));
      if (om && om.items.filter(id => meal.items.includes(id)).length >= Math.min(2, meal.items.length)) return { p, meal: om };
    }
    return null;
  }

  function renderMenu() {
    const plan = currentPlan();
    const p = prof();
    $('shared-banner').hidden = !state.shared;
    $('menu-empty').hidden = !!plan;
    $('menu-body').hidden = !plan;
    $('menu-body').classList.toggle('readonly', !!state.shared);
    $('print-btn').hidden = window.self !== window.top; // printing is blocked inside embedded viewers
    renderViewOptions();
    $('menu-heading').textContent = state.shared ? t('menuForKid')(state.shared.name || p.name) : t('menuForKid')(p.name);
    if (!plan) return;

    const st = P.planStats(plan, customAll());
    const kcal = plan.days.reduce((sum, d) => sum + P.dayNutrition(d, customAll(), milkSetting(), p.age).total[0], 0) / plan.days.length;
    $('summary').innerHTML = [
      t('statDays')(st.days), t('statFoods')(st.distinct), t('statKcal')(Math.round(kcal)), t('statIron')(st.ironDays, st.days),
    ].concat(st.ideas ? [t('statIdeas')(st.ideas)] : []).map(s => `<span class="pill">${s}</span>`).join('');

    $('warnings').innerHTML = (plan.warnings || []).map(w => {
      const c = w.cat ? t('catNames')[w.cat] : '';
      const msg = w.type === 'missing' ? t('warnMissing')(c) : w.type === 'few' ? t('warnFew')(c, w.n) : t('warnIron');
      return `<p class="warn">${esc(msg)}</p>`;
    }).join('');

    const start = new Date(plan.startDate + 'T12:00:00');
    const dates = plan.days.map((_, i) => new Date(start.getTime() + i * 86400000));
    $('day-nav').innerHTML = plan.days.length > 1
      ? dates.map((d, i) => `<a href="#day-${i}" data-day="${i}">${esc(t('dayName')(d).slice(0, 3))}</a>`).join('')
      : '';

    if (state.view === 'together') { renderTogether(plan, dates); return; }
    const pictures = state.view === 'pictures';
    $('days').innerHTML = plan.days.map((day, di) => `
      <section class="day">
        <h2 id="day-${di}">${esc(t('dayName')(dates[di]))}<small>${esc(t('dayDate')(dates[di]))}</small></h2>
        ${pictures
          ? `<div class="pic-grid">${day.meals.map((m, mi) => pictureCard(plan, m, di, mi)).join('')}</div>`
          : `<div class="meals">${day.meals.map((m, mi) => mealHtml(plan, m, di, mi)).join('')}</div>`}
        ${dayNutritionHtml(day)}
      </section>`).join('');
  }

  function dayNutritionHtml(day) {
    const p = prof();
    const r = P.dayNutrition(day, customAll(), milkSetting(), p.age);
    const needs = P.needsFor(p.age);
    const milk = MILKS.find(m => m.id === p.milkType) || MILKS[0];
    const rows = NUTRIENTS.map((n, i) => {
      let need = '<td></td>';
      if (needs[i]) {
        const pct = r.total[i] / needs[i];
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
      <p class="hint small">${esc(t('milkLine')(+p.milkMl, milk[state.lang]))}</p>${unc}
      ${p.meals.length < 5 ? `<p class="hint small">${esc(t('partialDay')(p.meals.map(s => P.SLOTS[s][state.lang]).join(state.lang === 'zh' ? '、' : ', ')))}</p>` : ''}
    </details>`;
  }

  function mealParts(plan, meal, di) {
    const p = prof();
    const d = P.describeMeal(meal, state.lang, customAll(), p);
    const nut = P.mealNutrition(meal, customAll(), p.age);
    const catalog = P.buildCatalog(customAll());
    const amount = id => {
      if (id === 'egg') return t('oneEgg');
      const f = catalog.get(id);
      return `${nut.grams[id]} g${f && P.isDry(f) ? ' ' + t('dry') : ''}`;
    };
    const ings = d.ingredients.map(i => `<span class="ing">${i.emoji} ${esc(i.name)} <span class="amt">${esc(amount(i.id))}</span>${i.allergen ? `<span class="tag allergen">${esc(t('allergenTag'))}</span>` : ''}${i.iron ? `<span class="tag iron">${esc(t('ironTag'))}</span>` : ''}</span>`).join('');
    const buddy = sameFoodWith(plan, di, meal);
    let badge = '';
    if (buddy && meal.pair) {
      const title = P.describeMeal(buddy.meal, state.lang, customAll(), buddy.p).title;
      badge = `<button type="button" class="badge-same" data-view="together" title="${esc(t('sameFoodTip'))}">🍲 ${esc(t('pairBadge')(buddy.p.name, title))}</button>`;
    } else if (buddy) {
      badge = `<span class="badge-same" title="${esc(t('sameFoodTip'))}">🍲 ${esc(t('sameFood')(buddy.p.name))}</span>`;
    }
    return { d, nut, ings, badge };
  }

  const swapBtn = (di, mi) => `<button type="button" class="swap" data-swap="${di}:${mi}" title="${esc(t('swap'))}" aria-label="${esc(t('swap'))}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h13l-3-3M20 15H7l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;

  function mealHtml(plan, meal, di, mi) {
    const slot = P.SLOTS[meal.slot];
    const { d, nut, ings, badge } = mealParts(plan, meal, di);
    const pic = pictureSrc(meal);
    const snack = meal.slot.startsWith('snack');
    return `
      <article class="meal${snack ? ' snack' : ''}">
        <div class="meal-when"><b>${slot.time}</b><span>${esc(slot[state.lang])}</span></div>
        <div class="meal-main">
          <div class="meal-top">
            <h3 class="meal-title">${esc(d.title)}</h3>
            ${swapBtn(di, mi)}
          </div>
          ${badge}
          <div class="ings">${ings}</div>
          <p class="meal-nutri">${esc(t('perMeal')(Math.round(nut.totals[0]), fmt(nut.totals[1], 1), fmt(nut.totals[5], 1)))}</p>
          <div class="drops">
            <details class="how"><summary>${esc(t('how'))}</summary><ol>${d.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></details>
            <details class="how pic"><summary>${esc(t('picLabel'))}${pic ? ' 📷' : ''}</summary>
              ${pic ? `<figure class="pic-figure"><img src="${esc(pic.src)}" alt="${esc(d.title)}" loading="lazy"></figure>` : `<p class="hint small">${esc(t('noPhotoYet'))}</p>`}
              ${photoSelect(meal, di, mi)}
            </details>
          </div>
        </div>
      </article>`;
  }

  function pictureCard(plan, meal, di, mi) {
    const slot = P.SLOTS[meal.slot];
    const { d, nut, ings, badge } = mealParts(plan, meal, di);
    const pic = pictureSrc(meal);
    return `
      <article class="pic-card${pic ? '' : ' no-pic'}">
        <div class="pic-img">${pic ? `<img src="${esc(pic.src)}" alt="${esc(d.title)}" loading="lazy">` : ''}<span class="pic-time">${slot.time} · ${esc(slot[state.lang])}</span>${swapBtn(di, mi)}</div>
        <div class="pic-body">
          <h3 class="meal-title">${esc(d.title)}</h3>
          ${badge}
          <details class="how"><summary>${esc(t('details'))}</summary>
            <div class="ings">${ings}</div>
            <p class="meal-nutri">${esc(t('perMeal')(Math.round(nut.totals[0]), fmt(nut.totals[1], 1), fmt(nut.totals[5], 1)))}</p>
            ${photoSelect(meal, di, mi)}
            <ol>${d.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
          </details>
        </div>
      </article>`;
  }

  function renderViewOptions() {
    const opts = [['list', 'viewList'], ['pictures', 'viewPictures']].concat(pairing() ? [['together', 'viewTogether']] : []);
    if (!pairing() && state.view === 'together') state.view = 'list';
    $('view-select').innerHTML = opts.map(([v, k]) => `<option value="${v}"${v === state.view ? ' selected' : ''}>${esc(t(k))}</option>`).join('');
  }

  /** Every child's version of each shared dish, side by side, with one shared ingredient list. */
  function renderTogether(plan, dates) {
    const kids = P.familyOrder(state.profiles);
    const plans = kids.map(p => state.plans[p.id]);
    if (!plans.every(x => x && x.family && x.startDate === plan.startDate && x.days.length === plan.days.length)) {
      $('days').innerHTML = `<p class="empty">${esc(t('togetherNeedsPair'))}</p>`;
      return;
    }
    const catalog = P.buildCatalog(customAll());
    const youngest = kids[0];
    $('days').innerHTML = plan.days.map((_, di) => {
      const blocks = P.SLOT_ORDER.map(slot => {
        const entries = kids.map((p, k) => {
          const mi = plans[k].days[di].meals.findIndex(m => m.slot === slot);
          return mi < 0 ? null : { p, k, mi, meal: plans[k].days[di].meals[mi] };
        }).filter(Boolean);
        if (!entries.length) return '';
        const s = P.SLOTS[slot];
        const items = entries[0].meal.items;
        const nuts = entries.map(e => P.mealNutrition(e.meal, customAll(), e.p.age));
        const shared = entries.length > 1 ? `<div class="together-foods"><b>${esc(t('sharedFoods'))}</b>${items.map(id => {
          const f = catalog.get(id) || { en: id, zh: id, emoji: '🍽️' };
          const amounts = entries.map((e, i) => `${esc(e.p.name)} ${id === 'egg' ? esc(t('oneEgg')) : nuts[i].grams[id] + ' g'}`).join(' · ');
          return `<span class="ing">${f.emoji} ${esc(foodName(f))} <span class="amt">${amounts}</span></span>`;
        }).join('')}</div>` : '';
        const cols = entries.map(e => {
          const d = P.describeMeal(e.meal, state.lang, customAll(), e.p);
          return `<div class="together-col">
            <div class="together-who"><span class="kid-tag">${esc(e.p.name)}</span><small>${esc(ageLabel(e.p))}</small>
              <button type="button" class="swap" data-swap-kid="${esc(e.p.id)}:${di}:${e.mi}" title="${esc(t('swap'))}" aria-label="${esc(t('swap'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h13l-3-3M20 15H7l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
            <h3 class="meal-title">${esc(d.title)}</h3>
            <details class="how"><summary>${esc(t('how'))}</summary><ol>${d.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol></details>
          </div>`;
        }).join('');
        const tip = entries.length > 1 && entries[0].p.id === youngest.id ? `<p class="together-tip">🍲 ${esc(t('togetherTip')(youngest.name))}</p>` : '';
        return `<article class="together"><div class="meal-when"><b>${s.time}</b><span>${esc(s[state.lang])}</span></div>${shared}<div class="together-cols">${cols}</div>${tip}</article>`;
      }).join('');
      return `<section class="day"><h2 id="day-${di}">${esc(t('dayName')(dates[di]))}<small>${esc(t('dayDate')(dates[di]))}</small></h2><div class="together-list">${blocks}</div></section>`;
    }).join('');
  }

  function swap(di, mi, profileId) {
    const id = profileId || state.active;
    const plan = state.plans[id];
    const meal = plan.days[di].meals[mi];
    const seed = Date.now() & 0x7fffffff;
    const familyReady = plan.family && meal.pair && state.profiles.every(p => state.plans[p.id] && state.plans[p.id].family && state.plans[p.id].startDate === plan.startDate);
    if (familyReady) {
      const base = P.familyOrder(state.profiles)[0];
      const opts = { ...genOpts(seed, plan.startDate, plan.days.length), history: P.usageOf(state.plans[base.id]), hints: null, profiles: state.profiles };
      Object.assign(state.plans, P.swapFamilyMeal(state.plans, opts, id, di, meal.slot));
    } else {
      const saved = state.active;
      state.active = id;
      state.plans[id] = P.swapMeal(plan, di, mi, genOpts(seed, plan.startDate, plan.days.length));
      state.active = saved;
    }
    save();
    renderMenu();
    toast(t('swapped'));
  }

  function setMealPhoto(di, mi, value) {
    const plan = activePlan();
    if (!plan) return;
    const meal = { ...plan.days[di].meals[mi], photo: value };
    state.plans[state.active] = P.replaceMeal(plan, di, mi, meal);
    save();
    renderMenu();
  }

  function planText() {
    const plan = currentPlan();
    const p = prof();
    const start = new Date(plan.startDate + 'T12:00:00');
    const lines = [t('menuForKid')(state.shared ? state.shared.name || p.name : p.name)];
    plan.days.forEach((day, di) => {
      const d = new Date(start.getTime() + di * 86400000);
      lines.push('', `${t('dayName')(d)} ${t('dayDate')(d)}`);
      day.meals.forEach(m => {
        const s = P.SLOTS[m.slot];
        const nut = P.mealNutrition(m, customAll(), p.age);
        const cat = P.buildCatalog(customAll());
        const amounts = m.items.map(id => `${foodName(cat.get(id) || { en: id, zh: id })} ${id === 'egg' ? t('oneEgg') : nut.grams[id] + 'g'}`).join(', ');
        lines.push(`  ${s.time} ${s[state.lang]}: ${P.describeMeal(m, state.lang, customAll(), p).title}`);
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

  // ---------- ideas tab: cooking methods + menu-idea pictures ----------
  function renderIdeas() {
    const p = prof();
    const stage = (TEXTURES.find(x => x.id === p.texture) || TEXTURES[1]).stage;
    $('ideas-title').textContent = t('ideasTitle')(p.name);
    const now = COOKING_IDEAS.filter(i => i.minStage <= stage);
    const next = COOKING_IDEAS.filter(i => i.minStage === stage + 1);
    const card = (i, later) => `<li class="idea${later ? ' later' : ''}"><span class="idea-emoji" aria-hidden="true">${i.emoji}</span><div><b>${esc(i[state.lang])}</b>${later ? ` <span class="tag">${esc(t('nextStage'))}</span>` : ''}<p>${esc(i.body[state.lang])}</p></div></li>`;
    $('ideas-list').innerHTML = now.map(i => card(i, false)).join('') + next.map(i => card(i, true)).join('');
    $('idea-rate').innerHTML = [[0, 'rateOff'], [0.3, 'rateSome'], [0.6, 'rateOften']].map(([v, k]) => `<option value="${v}"${v === state.ideaRate ? ' selected' : ''}>${esc(t(k))}</option>`).join('');
    $('ai-hint').hidden = !!state.apiKey;
    renderDraft();
    $('my-photos').innerHTML = photoGrid(state.photos.local, true);
    $('family-photos').innerHTML = state.photos.shared.length ? photoGrid(state.photos.shared, false) : `<p class="hint">${esc(t('sharedEmpty'))}</p>`;
  }

  /** Can this idea be cooked with what is at home? */
  function ideaStatus(g) {
    if (!g.foods.length) return `<p class="idea-status miss">${esc(t('ideaNoFoods'))}</p>`;
    const catalog = P.buildCatalog(state.custom);
    const sep = state.lang === 'zh' ? '、' : ', ';
    const need = g.foods.filter(id => !state.pantry.has(id)).map(id => foodName(catalog.get(id) || { en: id, zh: id }));
    const extra = (g.missing || []).map(m => (state.lang === 'zh' ? m.zh : m.en)).filter(Boolean);
    return (need.length ? `<p class="idea-status miss">${esc(t('ideaMissing')(need.join(sep)))}</p>` : `<p class="idea-status ok">✅ ${esc(t('ideaReady'))}</p>`)
      + (extra.length ? `<p class="idea-status extra">${esc(t('ideaExtra')(extra.join(sep)))}</p>` : '');
  }

  const boxId = id => 'addmenu-' + id.replace(/[^a-z0-9]/gi, '_');

  function photoGrid(list, local) {
    if (!list.length) return `<p class="hint">${esc(t('galleryEmpty'))}</p>`;
    const catalog = P.buildCatalog(state.custom);
    const slotName = s => P.SLOTS[s][state.lang];
    const kidName = id => (state.profiles.find(p => p.id === id) || {}).name || '';
    return `<div class="photo-grid">${list.map(g => `
      <article class="photo-card">
        <img src="${esc(g.src)}" alt="${esc(photoTitle(g))}" loading="lazy">
        <div class="photo-body">
          <b>${esc(photoTitle(g))}</b>
          <div class="photo-foods">${g.foods.map(id => (catalog.get(id) || {}).emoji || '').join(' ')}</div>
          ${g.slots.length || g.who.length ? `<div class="photo-tags">${[...new Set(g.slots.map(slotName))].concat(g.who.map(kidName)).map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : ''}
          ${ideaStatus(g)}
          <div class="row tight">
            <button type="button" class="btn btn-small" data-addmenu="${esc(g.id)}">${esc(t('addToMenu'))}</button>
            ${local ? `<button type="button" class="btn btn-small btn-ghost" data-editphoto="${esc(g.id)}">${esc(t('editPhoto'))}</button>
              <button type="button" class="btn btn-small btn-ghost" data-delphoto="${esc(g.id)}">${esc(t('remove'))}</button>`
              : state.apiKey ? `<button type="button" class="btn btn-small btn-ghost" data-aishared="${esc(g.id.split('#')[0])}">${esc(t('aiShort'))}</button>` : ''}
          </div>
          <div class="addmenu" id="${boxId(g.id)}" hidden></div>
        </div>
      </article>`).join('')}</div>`;
  }

  function openAddToMenu(id) {
    const plan = activePlan();
    const box = $(boxId(id));
    if (!plan) { toast(t('noMenuYet')); return; }
    const g = allPhotos().find(x => x.id === id);
    const start = new Date(plan.startDate + 'T12:00:00');
    const days = plan.days.map((_, i) => {
      const d = new Date(start.getTime() + i * 86400000);
      return `<option value="${i}">${esc(t('dayName')(d))} ${esc(t('dayDate')(d))}</option>`;
    }).join('');
    const slots = plan.days[0].meals.map(m => m.slot);
    const want = (g.slots && g.slots.find(s => slots.includes(s))) || (slots.includes('dinner') ? 'dinner' : slots[0]);
    box.hidden = false;
    box.innerHTML = `<select id="am-day-${esc(box.id)}">${days}</select>
      <select id="am-slot-${esc(box.id)}">${slots.map(s => `<option value="${s}"${s === want ? ' selected' : ''}>${esc(P.SLOTS[s][state.lang])}</option>`).join('')}</select>
      <button type="button" class="btn btn-small" data-addmenu-do="${esc(id)}">${esc(t('addToMenuDo'))}</button>`;
  }

  function doAddToMenu(id) {
    const plan = activePlan();
    const key = boxId(id);
    const di = +$('am-day-' + key).value;
    const slot = $('am-slot-' + key).value;
    const mi = plan.days[di].meals.findIndex(m => m.slot === slot);
    const g = allPhotos().find(x => x.id === id);
    if (!g || mi < 0) return;
    state.plans[state.active] = P.replaceMeal(plan, di, mi, { ...P.galleryToMeal(g, slot), photo: g.id });
    save();
    $(key).hidden = true;
    toast(t('addedToMenu'));
  }

  function aiErrorKey(err) {
    const code = String(err && err.message || '');
    return code === 'no-key' ? 'errNoKey' : code === 'bad-key' ? 'errBadKey' : code === 'rate-limit' ? 'errRate'
      : code === 'network' ? 'errNetwork' : code === 'refused' ? 'errRefused' : code === 'image-unreadable' ? 'errImage'
        : /Failed to fetch|import|NetworkError/i.test(code) ? 'errNetwork' : 'errGeneric';
  }

  // ----- the idea being added or edited -----
  // draft: { mode: 'new'|'edit', id, file, preview, added: Set, removed: Set, slots, who, titles, steps, missing, dishes, busy }

  function draftFoods() {
    const d = state.draft;
    const detected = P.foodsInText($('draft-title').value + ' ' + $('draft-notes').value, state.custom);
    return [...new Set(detected.concat([...d.added]))].filter(id => !d.removed.has(id));
  }

  function renderDraft() {
    const d = state.draft;
    $('draft').hidden = !d;
    if (!d) return;
    $('draft-img').src = d.preview;
    $('draft-ai').hidden = !state.apiKey;
    $('draft-ai').disabled = !!d.busy;
    $('draft-ai').textContent = d.busy ? t('aiReading') : t('aiRead');
    const multi = Array.isArray(d.dishes) && d.dishes.length > 1;
    $('draft-single').hidden = multi;
    $('draft-multi').hidden = !multi;
    const catalog = P.buildCatalog(state.custom);
    if (multi) {
      $('draft-multi-list').innerHTML = d.dishes.map((x, i) => `
        <label class="dish-pick"><input type="checkbox" data-dish="${i}"${x.keep ? ' checked' : ''}>
          <span><b>${esc(x.titles[state.lang] || x.titles.zh || x.titles.en)}</b>
          <small>${x.foods.map(id => (catalog.get(id) || {}).emoji || '').join(' ')} ${esc(x.slots.length ? P.SLOTS[x.slots[0]][state.lang] : '')}</small></span></label>`).join('');
      $('draft-save').textContent = t('saveDishes')(d.dishes.filter(x => x.keep).length);
    } else {
      $('draft-save').textContent = t('savePhoto');
    }
    const shown = draftFoods();
    const off = [...d.removed].filter(id => catalog.get(id));
    $('draft-foods').innerHTML = shown.length || off.length
      ? shown.map(id => { const f = catalog.get(id); return f ? `<button type="button" class="chip" aria-pressed="true" data-draft-food="${esc(id)}"><span aria-hidden="true">${f.emoji}</span>${esc(foodName(f))}</button>` : ''; }).join('')
        + off.map(id => { const f = catalog.get(id); return `<button type="button" class="chip" aria-pressed="false" data-draft-food="${esc(id)}"><span aria-hidden="true">${f.emoji}</span>${esc(foodName(f))}</button>`; }).join('')
      : `<span class="hint small">${esc(t('noFoodsFound'))}</span>`;
    $('draft-slots').innerHTML = ['breakfast', 'lunch', 'dinner', 'snack1'].map(s => `<label><input type="checkbox" data-draft-slot="${s}"${d.slots.includes(s) ? ' checked' : ''}> ${esc(s === 'snack1' ? (state.lang === 'zh' ? '加餐' : 'Snack') : P.SLOTS[s][state.lang])}</label>`).join('');
    $('draft-who').innerHTML = state.profiles.map(p => `<label><input type="checkbox" data-draft-who="${esc(p.id)}"${d.who.includes(p.id) ? ' checked' : ''}> ${esc(p.name)}</label>`).join('');
  }

  function startDraft(draft, title, notes) {
    if (state.draft && state.draft.mode === 'new' && state.draft.preview) URL.revokeObjectURL(state.draft.preview);
    state.draft = { added: new Set(), removed: new Set(), slots: [], who: [state.active], titles: null, steps: null, missing: [], dishes: null, busy: false, ...draft };
    $('draft-title').value = title || '';
    $('draft-notes').value = notes || '';
    setStatus($('draft-status'), '');
    renderDraft();
    $('draft').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onDraftPhoto(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    startDraft({ mode: 'new', file, preview: URL.createObjectURL(file) });
    if (state.apiKey) runDraftAI();
    else $('draft-title').focus();
  }

  function editPhoto(id) {
    const g = state.photos.local.find(x => x.id === id);
    if (!g) return;
    startDraft({ mode: 'edit', id, preview: g.src, added: new Set(g.foods), slots: g.slots.filter(s => s !== 'snack2'), who: g.who.slice(), titles: g.titles, steps: g.steps, missing: g.missing || [] },
      photoTitle(g), g.steps && g.steps[state.lang] && g.steps[state.lang].length ? g.steps[state.lang].join('\n') : g.notes);
  }

  function applyDish(dish) {
    const d = state.draft;
    const title = dish.titles[state.lang] || dish.titles.zh || dish.titles.en;
    const steps = dish.steps[state.lang] && dish.steps[state.lang].length ? dish.steps[state.lang] : dish.steps.zh.length ? dish.steps.zh : dish.steps.en;
    $('draft-title').value = title;
    $('draft-notes').value = steps.join('\n');
    const detected = P.foodsInText(title + ' ' + steps.join(' '), state.custom);
    d.added = new Set(dish.foods);
    d.removed = new Set(detected.filter(id => !dish.foods.includes(id)));
    d.titles = dish.titles;
    d.steps = dish.steps;
    d.missing = dish.missing;
    if (dish.slots.length) d.slots = [dish.slots[0]];
    const who = kidsForAges(dish.ages);
    if (who.length) d.who = who;
  }

  async function runDraftAI() {
    const d = state.draft;
    if (!d || d.busy) return;
    d.busy = true;
    setStatus($('draft-status'), t('aiReading'));
    renderDraft();
    try {
      const dishes = await window.TDM_VISION.analyzeDishes(d.file || d.preview, state.apiKey, FOODS, AGE_GROUPS);
      if (state.draft !== d) return;
      if (!dishes.length) setStatus($('draft-status'), t('aiNone'), 'err');
      else if (dishes.length === 1) { applyDish(dishes[0]); setStatus($('draft-status'), t('aiDone'), 'ok'); }
      else { d.dishes = dishes.map(x => ({ ...x, keep: true })); setStatus($('draft-status'), t('aiFound')(dishes.length), 'ok'); }
    } catch (err) {
      setStatus($('draft-status'), t(aiErrorKey(err)), 'err');
      console.error(err);
    }
    d.busy = false;
    renderDraft();
  }

  function metaFromDish(x, fallbackWho) {
    const who = kidsForAges(x.ages);
    const slots = x.slots.includes('snack1') ? ['snack1', 'snack2'] : x.slots;
    return { title: x.titles.zh || x.titles.en, notes: '', titles: x.titles, steps: x.steps, missing: x.missing, foods: x.foods, slots, who: who.length ? who : fallbackWho };
  }

  async function saveDraft() {
    const d = state.draft;
    if (!d) return;
    const G = window.TDM_GALLERY;
    try {
      if (Array.isArray(d.dishes) && d.dishes.length > 1) {
        const keep = d.dishes.filter(x => x.keep);
        if (!keep.length) return;
        const blob = d.file ? await G.compress(d.file) : await (await fetch(d.preview)).blob();
        const metas = keep.map(x => metaFromDish(x, d.who));
        if (d.mode === 'edit') await G.updateLocal(d.id, metas.shift());
        for (const m of metas) await G.addLocal(null, m, blob);
        toast(t('photoSavedN')(keep.length));
      } else {
        const title = $('draft-title').value.trim();
        if (!title) { toast(t('needPhotoTitle')); return; }
        const notes = $('draft-notes').value.trim();
        // Keep the AI's bilingual name and steps only while they still match what is in the form.
        const aiTitle = d.titles && (d.titles[state.lang] || d.titles.zh || d.titles.en) === title;
        const aiSteps = d.steps && (d.steps[state.lang] || []).join('\n') === notes;
        const slots = d.slots.includes('snack1') ? d.slots.concat('snack2') : d.slots;
        const meta = { title, notes: aiSteps ? '' : notes, titles: aiTitle ? d.titles : null, steps: aiSteps ? d.steps : null, missing: d.missing || [], foods: draftFoods(), slots, who: d.who };
        if (d.mode === 'edit') await G.updateLocal(d.id, meta);
        else await G.addLocal(d.file, meta);
        toast(t('photoSaved'));
      }
    } catch (e) {
      toast(t('errImage'));
      return;
    }
    if (d.mode === 'new') URL.revokeObjectURL(d.preview);
    state.draft = null;
    await loadPhotos();
  }

  async function aiShared(baseId, btn) {
    const g = rawShared.find(x => x.id === baseId);
    if (!g) return;
    btn.disabled = true;
    btn.textContent = t('aiReading');
    try {
      const dishes = await window.TDM_VISION.analyzeDishes(g.src, state.apiKey, FOODS, AGE_GROUPS);
      if (!dishes.length) { toast(t('aiNone')); btn.disabled = false; btn.textContent = t('aiShort'); return; }
      const meta = sharedMeta();
      meta[baseId] = dishes;
      store.set('sharedMeta', meta);
      state.photos.shared = enrichShared(rawShared);
      toast(dishes.length > 1 ? t('aiFound')(dishes.length) : t('aiDone'));
      renderIdeas();
    } catch (err) {
      toast(t(aiErrorKey(err)));
      btn.disabled = false;
      btn.textContent = t('aiShort');
    }
  }

  function addDraftFood() {
    const input = $('draft-add-food');
    const res = P.parseFoodText(input.value, state.custom);
    res.matched.forEach(id => { state.draft.added.add(id); state.draft.removed.delete(id); });
    input.value = '';
    renderDraft();
  }

  // ---------- nutrition tab ----------
  function renderNutrition() {
    const p = prof();
    const age = P.ageGroup(p.age);
    const catName = id => (CATEGORIES.find(c => c.id === id) || {})[state.lang] || id;
    $('portion-scale').hidden = age.scale === 1;
    $('portion-scale').textContent = t('portionScale')(p.name, ageLabel(p), age.scale);
    $('portion-table').innerHTML = `<thead><tr><th>${esc(t('colGroup'))}</th><th>${esc(t('colAmount'))}</th><th>${esc(t('colExample'))}</th></tr></thead>
      <tbody>${t('portionRows').map(r => `<tr><th scope="row">${esc(catName(r[0]))}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody>`;
    $('portion-tips').innerHTML = t('portionTips').map(x => `<li>${esc(x)}</li>`).join('');
    const why = t('needsWhy');
    const needs = P.needsFor(p.age);
    $('needs-title').textContent = t('needsFor')(p.name, ageLabel(p));
    $('needs-table').innerHTML = `<thead><tr><th>${esc(t('colNutrient'))}</th><th>${esc(t('colPerDay'))}</th><th>${esc(t('colWhy'))}</th></tr></thead>
      <tbody>${NUTRIENTS.map((n, i) => (needs[i] ? `<tr><th scope="row">${esc(n[state.lang])}</th><td class="num">${needs[i]} ${n.unit}</td><td>${esc(why[n.id] || '')}</td></tr>` : '')).join('')}</tbody>`;
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
    const scale = P.ageGroup(prof().age).scale;
    let foods = FOODS.filter(f => !q || [f.en, f.zh, ...(f.aliases || [])].some(x => x.toLowerCase().includes(q)));
    if (idx >= 0) foods = foods.slice().sort((a, b) => b.n[idx] - a.n[idx]);
    else foods = foods.slice().sort((a, b) => foodName(a).localeCompare(foodName(b), state.lang === 'zh' ? 'zh-CN' : 'en'));
    const serve = f => (f.id === 'egg' ? esc(t('oneEgg')) : Math.round(f.portion * scale / 5) * 5 + ' g' + (P.isDry(f) ? ' ' + esc(t('dry')) : ''));
    const head = `<thead><tr><th>${esc(t('colName'))}</th><th>${esc(t('colServe'))}</th>${NUTRIENTS.map(n => `<th${n.id === sortKey ? ' class="sorted"' : ''}>${esc(n[state.lang])}<small>${n.unit}</small></th>`).join('')}</tr></thead>`;
    const body = foods.map(f => `<tr><th scope="row">${f.emoji} ${esc(foodName(f))}</th><td class="num">${serve(f)}</td>${f.n.map((v, i) => `<td class="num${NUTRIENTS[i].id === sortKey ? ' sorted' : ''}">${fmt(v, NUTRIENTS[i].dp)}</td>`).join('')}</tr>`).join('');
    $('facts-table').innerHTML = head + `<tbody>${body}</tbody>`;
  }

  // ---------- settings: children ----------
  function renderSettings() {
    const p = prof();
    const opts = (list, cur) => list.map(x => `<option value="${x.id}"${x.id === cur ? ' selected' : ''}>${esc(x[state.lang])}</option>`).join('');
    const tex = TEXTURES.find(x => x.id === p.texture) || TEXTURES[1];
    $('pair-box').hidden = state.profiles.length < 2;
    $('pair-toggle').checked = state.pairMode;
    $('profile-editor').innerHTML = `
      <div class="field"><label for="kid-name">${esc(t('kidName'))}</label><input id="kid-name" type="text" value="${esc(p.name)}" maxlength="20"></div>
      <div class="field"><label for="kid-age">${esc(t('kidAge'))}</label><select id="kid-age">${opts(AGE_GROUPS, p.age)}</select></div>
      <div class="field"><label for="kid-texture">${esc(t('kidTexture'))}</label><select id="kid-texture">${opts(TEXTURES, p.texture)}</select><p class="hint small">${esc(tex.hint[state.lang])}</p></div>
      <div class="field"><span class="field-label">${esc(t('kidMeals'))}</span><div class="checks">${SLOT_IDS.map(s => `<label><input type="checkbox" id="meal-${s}" data-meal="${s}"${p.meals.includes(s) ? ' checked' : ''}> ${esc(P.SLOTS[s][state.lang])}</label>`).join('')}</div></div>
      <div class="field"><span class="field-label">${esc(t('milkTitle'))}</span>
        <div class="row tight"><select id="milk-type">${opts(MILKS, p.milkType)}</select>
        <select id="milk-ml">${[0, 200, 300, 350, 400, 500, 600].map(v => `<option value="${v}"${v === +p.milkMl ? ' selected' : ''}>${v} ml</option>`).join('')}</select></div>
        <p class="hint small">${esc(t('milkHint'))}</p></div>
      <div class="field"><span class="field-label">${esc(t('allergyTitle'))}</span><p class="hint small">${esc(t('allergyHint'))}</p>
        <div class="checks">${ALLERGENS.map(a => `<label><input type="checkbox" id="alg-${a.id}" data-allergen="${a.id}"${p.exclude.includes(a.id) ? ' checked' : ''}> ${esc(a[state.lang])}</label>`).join('')}</div></div>
      <div class="row tight">
        <button type="button" class="btn btn-small btn-ghost" id="kid-add">${esc(t('addKid'))}</button>
        ${state.profiles.length > 1 ? `<button type="button" class="btn btn-small btn-ghost danger" id="kid-remove">${esc(t('removeKid'))}</button>` : ''}
      </div>`;
    $('api-key').value = state.apiKey;
  }

  function updateProfile(patch) {
    Object.assign(prof(), patch);
    save();
    renderKidBar();
    renderPantry();
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
    const kid = obj.k && typeof obj.k === 'object' ? obj.k : {};
    return {
      name: typeof kid.n === 'string' ? kid.n.slice(0, 20) : '',
      age: typeof kid.a === 'string' ? kid.a : null,
      texture: typeof kid.t === 'string' ? kid.t : null,
      plan: { mode: obj.d.length > 1 ? 'week' : 'day', startDate: String(obj.s || '').slice(0, 10), days: obj.d.map(meals => ({ meals: meals.map(m => ({ ...m, photo: undefined })) })), warnings: [] },
      custom: (Array.isArray(obj.c) ? obj.c : []).filter(c => c && typeof c.id === 'string' && c.id.startsWith('custom:')).map(c => ({ id: c.id, cat: c.cat, custom: true, form: c.cat === 'carb' ? 'mash' : undefined, en: String(c.en), zh: String(c.zh), emoji: c.emoji || '🍽️' })),
    };
  }

  async function shareMenu() {
    const plan = currentPlan();
    const p = prof();
    const base = isWebPage() ? location.href.split('#')[0] : siteBase();
    if (!base) {
      const text = planText();
      if (navigator.share) {
        try { await navigator.share({ title: t('shareText'), text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      return copyPlan();
    }
    const used = new Set(plan.days.flatMap(d => d.meals.flatMap(m => m.items)));
    const custom = customAll().filter(c => used.has(c.id)).map(c => ({ id: c.id, cat: c.cat, en: c.en, zh: c.zh, emoji: c.emoji }));
    const days = plan.days.map(d => d.meals.map(m => { const { photo, ...rest } = m; return rest; }));
    const code = await encodeShare({ v: 2, s: plan.startDate, d: days, c: custom, k: { n: p.name, a: p.age, t: p.texture } });
    const url = base + '#share=' + code;
    if (navigator.share) {
      try { await navigator.share({ title: t('menuForKid')(p.name), text: t('menuForKid')(p.name), url }); return; } catch (e) {
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
      // Show it under the child with the same name, if this phone has one.
      const match = state.profiles.find(p => p.name === state.shared.name);
      if (match) state.active = match.id;
      renderKidBar();
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
    $('make-btn').textContent = pairing() ? t('makeAll') : t('make');
  }

  function renderAll() {
    applyLang();
    renderViewOptions();
    renderKidBar();
    renderPantry();
    renderUnknown();
    renderMode();
    renderTab();
  }

  // ---------- events ----------
  const armed = new Set(); // two-tap confirmations (the viewer blocks confirm())
  function confirmTap(btn, key, label) {
    if (armed.has(key)) { armed.delete(key); return true; }
    armed.add(key);
    btn.textContent = label;
    setTimeout(() => armed.delete(key), 4000);
    return false;
  }

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
    const kid = el.closest('[data-kid]');
    if (kid) { if (state.shared) { state.shared = null; clearShareHash(); } switchKid(kid.dataset.kid); return; }
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
    const swk = el.closest('[data-swap-kid]');
    if (swk) { const [pid, di, mi] = swk.dataset.swapKid.split(':'); swap(+di, +mi, pid); return; }
    const vw = el.closest('[data-view]');
    if (vw) { state.view = vw.dataset.view; save(); renderMenu(); window.scrollTo({ top: 0 }); return; }
    const sw = el.closest('[data-swap]');
    if (sw) { const [di, mi] = sw.dataset.swap.split(':').map(Number); swap(di, mi); return; }
    const dayLink = el.closest('[data-day]');
    if (dayLink) { e.preventDefault(); $('day-' + dayLink.dataset.day).scrollIntoView({ behavior: 'smooth' }); return; }
    const addm = el.closest('[data-addmenu]');
    if (addm) { openAddToMenu(addm.dataset.addmenu); return; }
    const addDo = el.closest('[data-addmenu-do]');
    if (addDo) { doAddToMenu(addDo.dataset.addmenuDo); return; }
    const edit = el.closest('[data-editphoto]');
    if (edit) { editPhoto(edit.dataset.editphoto); return; }
    const ais = el.closest('[data-aishared]');
    if (ais) { aiShared(ais.dataset.aishared, ais); return; }
    const df = el.closest('[data-draft-food]');
    if (df && state.draft) {
      const id = df.dataset.draftFood;
      if (df.getAttribute('aria-pressed') === 'true') { state.draft.removed.add(id); state.draft.added.delete(id); } else { state.draft.removed.delete(id); state.draft.added.add(id); }
      renderDraft();
      return;
    }
    if (el.id === 'draft-ai') { runDraftAI(); return; }
    if (el.id === 'draft-add-food-btn') { addDraftFood(); return; }
    const del = el.closest('[data-delphoto]');
    if (del) {
      if (!confirmTap(del, 'del:' + del.dataset.delphoto, t('confirmRemove'))) return;
      window.TDM_GALLERY.removeLocal(del.dataset.delphoto).then(() => { toast(t('removed')); loadPhotos(); });
      return;
    }
    if (el.id === 'kid-add') {
      const id = 'kid' + Date.now().toString(36);
      state.profiles.push(newProfile(id, t('newKid') + (state.profiles.length + 1), 'm12'));
      switchKid(id);
      return;
    }
    if (el.id === 'kid-remove') {
      if (!confirmTap(el, 'kid:' + state.active, t('confirmRemoveKid'))) return;
      delete state.plans[state.active];
      state.profiles = state.profiles.filter(p => p.id !== state.active);
      switchKid(state.profiles[0].id);
    }
  });

  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.photo) { const [di, mi] = el.dataset.photo.split(':').map(Number); setMealPhoto(di, mi, el.value); return; }
    if (el.id === 'view-select') { state.view = el.value; save(); renderMenu(); return; }
    if (el.id === 'pair-toggle') { state.pairMode = el.checked; save(); renderMode(); return; }
    if (el.id === 'kid-age') {
      const age = P.ageGroup(el.value);
      updateProfile({ age: age.id, texture: age.texture, meals: age.meals.slice(), milkMl: age.milkMl });
      renderSettings();
      return;
    }
    if (el.id === 'kid-texture') { updateProfile({ texture: el.value }); renderSettings(); return; }
    if (el.dataset.meal) {
      const set = new Set(prof().meals);
      el.checked ? set.add(el.dataset.meal) : set.delete(el.dataset.meal);
      if (!set.size) { el.checked = true; return; }
      updateProfile({ meals: SLOT_IDS.filter(s => set.has(s)) });
      return;
    }
    if (el.id === 'milk-type') { updateProfile({ milkType: el.value }); return; }
    if (el.id === 'milk-ml') { updateProfile({ milkMl: +el.value }); return; }
    if (el.dataset.allergen) {
      const set = new Set(prof().exclude);
      el.checked ? set.add(el.dataset.allergen) : set.delete(el.dataset.allergen);
      updateProfile({ exclude: [...set] });
      return;
    }
    if (el.id === 'idea-rate') { state.ideaRate = +el.value; store.set('ideaRate', state.ideaRate); return; }
    if (el.dataset.dish && state.draft && state.draft.dishes) { state.draft.dishes[+el.dataset.dish].keep = el.checked; renderDraft(); return; }
    if (el.dataset.draftSlot && state.draft) {
      const set = new Set(state.draft.slots);
      el.checked ? set.add(el.dataset.draftSlot) : set.delete(el.dataset.draftSlot);
      state.draft.slots = [...set];
      return;
    }
    if (el.dataset.draftWho && state.draft) {
      const set = new Set(state.draft.who);
      el.checked ? set.add(el.dataset.draftWho) : set.delete(el.dataset.draftWho);
      state.draft.who = [...set];
    }
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'kid-name') {
      prof().name = e.target.value.trim() || t('newKid');
      save();
      renderKidBar();
    }
    if (e.target.id === 'draft-title' || e.target.id === 'draft-notes') renderDraft();
  });

  $('text-form').addEventListener('submit', onTextSubmit);
  $('photo-input').addEventListener('change', onPhoto);
  $('photo-review').addEventListener('click', onReviewClick);
  $('draft-input').addEventListener('change', onDraftPhoto);
  $('draft-save').addEventListener('click', () => { saveDraft(); });
  $('draft-cancel').addEventListener('click', () => { if (state.draft && state.draft.mode === 'new') URL.revokeObjectURL(state.draft.preview); state.draft = null; renderDraft(); });
  $('draft-add-food').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addDraftFood(); } });
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
    state.plans[state.active] = sh.plan;
    state.shared = null;
    clearShareHash();
    save();
    renderAll();
    toast(t('sharedSaved'));
  });
  $('shared-dismiss').addEventListener('click', () => { state.shared = null; clearShareHash(); renderMenu(); });
  $('install-close').addEventListener('click', () => { store.set('installTipDone', true); $('install-tip').hidden = true; });
  $('facts-search').addEventListener('input', renderFacts);
  $('facts-sort').addEventListener('change', renderFacts);
  $('print-btn').addEventListener('click', () => window.print());
  $('key-save').addEventListener('click', () => {
    state.apiKey = $('api-key').value.trim();
    store.set('apiKey', state.apiKey);
    setStatus($('key-status'), state.apiKey ? t('keySaved') : t('keyRemoved'), 'ok');
  });

  // Offline support when served over http(s) (not available in every host).
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && window.self === window.top) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  save();
  renderAll();
  maybeShowInstallTip();
  showTab(activePlan() && location.hash === '#menu' ? 'menu' : 'home');
  loadPhotos();
  loadSharedFromHash();
  window.addEventListener('hashchange', loadSharedFromHash);
})();
