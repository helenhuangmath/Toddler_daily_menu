/*
 * Food database for a ~14-month-old with very few teeth.
 * Every item carries a bilingual name and a "prep" note that gets it to a
 * super-soft / puree texture. No salt, sugar or honey is ever added.
 *
 * cat:       carb | veg | fruit | protein | dairy | fat
 * form:      (carb only) porridge | noodle | pasta | mash | bread | flour — decides the dish template
 * minStage:  lowest texture stage (see TEXTURES) the food suits, e.g. toast needs soft bites
 * allergen:  egg | dairy | fish | shellfish | wheat | soy | peanut | treenut | sesame
 * iron:      true for iron-rich foods (important at this age)
 * maxPerWeek: optional cap (e.g. liver)
 * portion:   suggested amount in one main meal, in grams of raw (or dry) food
 * n:         nutrients per 100 g raw/dry, in the order of NUTRIENTS below
 */
(function (root) {
  const CATEGORIES = [
    { id: 'carb', en: 'Grains & starches', zh: '主食', emoji: '🍚' },
    { id: 'veg', en: 'Vegetables', zh: '蔬菜', emoji: '🥕' },
    { id: 'fruit', en: 'Fruit', zh: '水果', emoji: '🍐' },
    { id: 'protein', en: 'Protein', zh: '蛋白质', emoji: '🥚' },
    { id: 'dairy', en: 'Dairy', zh: '奶制品', emoji: '🥛' },
    { id: 'fat', en: 'Healthy fats', zh: '健康油脂', emoji: '🥑' },
  ];

  const FOODS = [
    // ---------- Grains & starches ----------
    { id: 'rice', portion: 20, n: [365, 7.1, 0.7, 80, 1.3, 0.8, 28, 0, 0], cat: 'carb', form: 'porridge', emoji: '🍚', en: 'Rice', zh: '大米', aliases: ['white rice', 'brown rice', '米', '白米', '米饭'],
      prep: { en: 'Cook rice with 8–10× water into a thick, very soft congee (about 40 min).', zh: '大米加8–10倍水熬成浓稠软烂的粥（约40分钟）。' } },
    { id: 'millet', portion: 20, n: [378, 11, 4.2, 73, 8.5, 3.0, 8, 0, 0], cat: 'carb', form: 'porridge', emoji: '🌾', en: 'Millet', zh: '小米', aliases: ['小米粥'],
      prep: { en: 'Simmer millet with 8× water for 30–40 min until creamy.', zh: '小米加8倍水小火煮30–40分钟至绵软。' } },
    { id: 'oats', portion: 20, n: [379, 13.2, 6.5, 67.7, 10.1, 4.3, 52, 0, 0], cat: 'carb', form: 'porridge', emoji: '🥣', en: 'Oats', zh: '燕麦', iron: true, aliases: ['oatmeal', 'rolled oats', 'baby oatmeal', '燕麦片', '麦片'],
      prep: { en: 'Blend oats into a powder, then cook with water or milk for 5 min until smooth.', zh: '燕麦打成粉，加水或奶煮5分钟至顺滑。' } },
    { id: 'quinoa', portion: 20, n: [368, 14.1, 6.1, 64.2, 7, 4.6, 47, 1, 0], cat: 'carb', form: 'porridge', emoji: '🌾', en: 'Quinoa', zh: '藜麦', iron: true, aliases: [],
      prep: { en: 'Rinse well, cook with 3× water for 20 min until burst and soft.', zh: '充分淘洗，加3倍水煮20分钟至开花软烂。' } },
    { id: 'noodles', portion: 25, n: [355, 11, 1.2, 74, 2.7, 1.5, 20, 0, 0], short: { en: 'noodles', zh: '面条' }, cat: 'carb', form: 'noodle', emoji: '🍜', en: 'Thin noodles', zh: '面条', allergen: 'wheat', aliases: ['noodle', 'baby noodles', '挂面', '宝宝面', '细面'],
      prep: { en: 'Use no-salt baby noodles. Break into 1 cm pieces and boil until very soft.', zh: '选无盐宝宝面，掰成1厘米小段，煮至软烂。' } },
    { id: 'pasta', portion: 25, n: [371, 13, 1.5, 75, 3.2, 1.3, 21, 0, 0], short: { en: 'pasta', zh: '小意面' }, cat: 'carb', form: 'pasta', emoji: '🍝', en: 'Tiny pasta', zh: '小颗粒意面', allergen: 'wheat', aliases: ['pasta', 'orzo', 'macaroni', 'pastina', '意面', '通心粉'],
      prep: { en: 'Boil tiny pasta (orzo/pastina) 2–3 min longer than the packet says.', zh: '小颗粒意面比包装建议多煮2–3分钟，煮至软烂。' } },
    { id: 'couscous', portion: 20, n: [376, 12.8, 0.6, 77.4, 5, 1.1, 24, 0, 0], cat: 'carb', form: 'porridge', emoji: '🌾', en: 'Couscous', zh: '古斯米', allergen: 'wheat', aliases: ['cous cous'],
      prep: { en: 'Pour 2× boiling water over couscous, cover 10 min, then fluff and mash.', zh: '古斯米加2倍开水焖10分钟，拌松后压软。' } },
    { id: 'flour', portion: 20, n: [364, 10.3, 1, 76, 2.7, 1.2, 15, 0, 0], short: { en: 'flour', zh: '面粉' }, cat: 'carb', form: 'flour', emoji: '🥟', en: 'Flour / dumpling wrappers', zh: '面粉 / 饺子皮', allergen: 'wheat', aliases: ['flour', 'wheat flour', 'dumpling wrappers', 'wonton wrappers', '面粉', '饺子皮', '馄饨皮', '面皮'],
      prep: { en: 'Used for soft pancakes, wontons and dumplings.', zh: '用来做软饼、小馄饨和饺子。' } },
    { id: 'mantou', short: { en: 'steamed bun', zh: '馒头' }, portion: 30, n: [223, 7, 1.1, 47, 1.3, 1.8, 38, 0, 0], cat: 'carb', form: 'bread', minStage: 1, emoji: '🫓', en: 'Steamed bun (mantou)', zh: '馒头', allergen: 'wheat', aliases: ['mantou', 'steamed bun', 'steamed buns', '花卷', '小馒头'],
      prep: { en: 'Choose plain buns and steam until soft. For babies, tear into tiny pieces or soak in soup.', zh: '选原味馒头蒸软。给小宝撕成小块或泡在汤里。' } },
    { id: 'bread', short: { en: 'toast', zh: '面包' }, portion: 30, n: [252, 12.4, 3.5, 43, 6, 2.5, 107, 0, 0], cat: 'carb', form: 'bread', minStage: 3, emoji: '🍞', en: 'Whole-wheat bread', zh: '全麦面包', allergen: 'wheat', aliases: ['bread', 'toast', 'whole wheat bread', 'wholemeal bread', '吐司', '面包'],
      prep: { en: 'Pick a low-salt, no-sugar loaf. Toast lightly and cut into strips.', zh: '选低盐无糖的面包，稍微烤一下切成条。' } },
    { id: 'potato', portion: 60, n: [77, 2, 0.1, 17.5, 2.2, 0.8, 12, 0, 19.7], cat: 'carb', form: 'mash', emoji: '🥔', en: 'Potato', zh: '土豆', aliases: ['potatoes', '马铃薯', '洋芋'],
      prep: { en: 'Peel, cube and steam 20 min until a fork slides in easily.', zh: '去皮切块，蒸20分钟至筷子轻松插透。' } },
    { id: 'sweetpotato', portion: 60, n: [86, 1.6, 0.1, 20.1, 3, 0.6, 30, 709, 2.4], cat: 'carb', form: 'mash', emoji: '🍠', en: 'Sweet potato', zh: '红薯', iron: false, aliases: ['sweet potatoes', 'yam (orange)', '地瓜', '番薯', '紫薯'],
      prep: { en: 'Peel, cube and steam 20 min until very soft.', zh: '去皮切块，蒸20分钟至软烂。' } },
    { id: 'chineseyam', portion: 60, n: [57, 1.9, 0.2, 12.4, 0.8, 0.3, 16, 3, 5], cat: 'carb', form: 'mash', emoji: '🥢', en: 'Chinese yam', zh: '山药', aliases: ['yam', 'nagaimo', '铁棍山药', '淮山'],
      prep: { en: 'Wear gloves to peel (sap itches), slice and steam 15–20 min.', zh: '戴手套去皮（黏液会痒），切段蒸15–20分钟。' } },
    { id: 'taro', portion: 60, n: [112, 1.5, 0.2, 26.5, 4.1, 0.6, 43, 4, 4.5], cat: 'carb', form: 'mash', emoji: '🥔', en: 'Taro', zh: '芋头', aliases: ['芋艿', '香芋'],
      prep: { en: 'Peel with gloves, cube and steam 25 min until floury and soft.', zh: '戴手套去皮切块，蒸25分钟至粉糯。' } },

    // ---------- Vegetables ----------
    { id: 'carrot', portion: 30, n: [41, 0.9, 0.2, 9.6, 2.8, 0.3, 33, 835, 5.9], cat: 'veg', emoji: '🥕', en: 'Carrot', zh: '胡萝卜', aliases: ['carrots', '红萝卜'],
      prep: { en: 'Peel, dice small and steam 15–20 min until very soft.', zh: '去皮切小丁，蒸15–20分钟至软烂。' } },
    { id: 'pumpkin', portion: 30, n: [45, 1, 0.1, 11.7, 2, 0.7, 48, 532, 21], short: { en: 'pumpkin', zh: '南瓜' }, cat: 'veg', emoji: '🎃', en: 'Pumpkin / squash', zh: '南瓜', aliases: ['pumpkin', 'squash', 'butternut squash', 'butternut', 'kabocha', '贝贝南瓜', '板栗南瓜'],
      prep: { en: 'Remove skin and seeds, steam chunks 15 min.', zh: '去皮去籽，切块蒸15分钟。' } },
    { id: 'broccoli', portion: 30, n: [34, 2.8, 0.4, 6.6, 2.6, 0.7, 47, 31, 89], cat: 'veg', emoji: '🥦', en: 'Broccoli', zh: '西兰花', aliases: ['西蓝花', '花椰菜(绿)'],
      prep: { en: 'Use florets only, blanch then steam 8–10 min until very tender.', zh: '只取花朵部分，焯水后蒸8–10分钟至很软。' } },
    { id: 'cauliflower', portion: 30, n: [25, 1.9, 0.3, 5, 2, 0.4, 22, 0, 48], cat: 'veg', emoji: '🥬', en: 'Cauliflower', zh: '花菜', aliases: ['菜花', '花椰菜'],
      prep: { en: 'Florets only, steam 10–12 min until they crush easily.', zh: '只取花朵，蒸10–12分钟至一压就碎。' } },
    { id: 'spinach', portion: 20, n: [23, 2.9, 0.4, 3.6, 2.2, 2.7, 99, 469, 28], cat: 'veg', emoji: '🥬', en: 'Spinach', zh: '菠菜', iron: true, aliases: ['baby spinach'],
      prep: { en: 'Blanch leaves 1 min (removes oxalic acid), squeeze dry and chop very finely.', zh: '叶子焯水1分钟去草酸，挤干后剁成细末。' } },
    { id: 'bokchoy', portion: 20, n: [13, 1.5, 0.2, 2.2, 1, 0.8, 105, 223, 45], cat: 'veg', emoji: '🥬', en: 'Bok choy', zh: '小白菜', aliases: ['pak choi', 'baby bok choy', '上海青', '青菜', '油菜'],
      prep: { en: 'Use tender leaves, blanch 1–2 min and chop very finely.', zh: '取嫩叶，焯水1–2分钟后剁成细末。' } },
    { id: 'napacabbage', portion: 30, n: [16, 1.2, 0.2, 3.2, 1.2, 0.3, 77, 16, 27], cat: 'veg', emoji: '🥬', en: 'Napa cabbage', zh: '大白菜', aliases: ['chinese cabbage', 'cabbage', '白菜', '卷心菜', '包菜'],
      prep: { en: 'Use the soft leafy part, boil 5 min and chop very finely.', zh: '取软叶部分，煮5分钟后剁碎。' } },
    { id: 'zucchini', portion: 30, n: [17, 1.2, 0.3, 3.1, 1, 0.4, 16, 10, 18], cat: 'veg', emoji: '🥒', en: 'Zucchini', zh: '西葫芦', aliases: ['courgette', 'squash (green)'],
      prep: { en: 'Peel, dice and steam 8 min; it turns silky.', zh: '去皮切丁，蒸8分钟即软滑。' } },
    { id: 'wintermelon', portion: 30, n: [13, 0.4, 0.2, 3, 2.9, 0.4, 19, 0, 13], cat: 'veg', emoji: '🍈', en: 'Winter melon', zh: '冬瓜', aliases: ['wax gourd'],
      prep: { en: 'Peel, remove seeds, dice and simmer 10 min until translucent.', zh: '去皮去瓤，切丁煮10分钟至透明。' } },
    { id: 'luffa', portion: 30, n: [20, 1.2, 0.2, 4.4, 1.1, 0.4, 20, 25, 12], short: { en: 'luffa', zh: '丝瓜' }, cat: 'veg', emoji: '🥒', en: 'Luffa (silk gourd)', zh: '丝瓜', aliases: ['loofah', 'silk squash', 'luffa'],
      prep: { en: 'Peel, dice and cook 5 min; it becomes very soft.', zh: '去皮切丁，煮5分钟即很软。' } },
    { id: 'peas', portion: 25, n: [81, 5.4, 0.4, 14.5, 5.1, 1.5, 25, 38, 40], cat: 'veg', emoji: '🫛', en: 'Green peas', zh: '豌豆', aliases: ['peas', 'frozen peas', '青豆'],
      prep: { en: 'Boil 10 min, then blend and sieve out the skins.', zh: '煮10分钟后打泥，过筛去皮。' } },
    { id: 'greenbeans', portion: 30, n: [31, 1.8, 0.2, 7, 2.7, 1, 37, 35, 12], cat: 'veg', emoji: '🫛', en: 'Green beans', zh: '四季豆', aliases: ['string beans', '扁豆', '豆角'],
      prep: { en: 'Trim strings, boil thoroughly 15 min (must be fully cooked), then blend.', zh: '去筋，彻底煮熟15分钟（一定要熟透），再打泥。' } },
    { id: 'tomato', portion: 30, n: [18, 0.9, 0.2, 3.9, 1.2, 0.3, 10, 42, 14], cat: 'veg', emoji: '🍅', en: 'Tomato', zh: '番茄', aliases: ['tomatoes', '西红柿'],
      prep: { en: 'Score an X, blanch 30 s, peel, deseed and cook down 5 min.', zh: '划十字烫30秒去皮去籽，小火煮5分钟成酱。' } },
    { id: 'eggplant', portion: 30, n: [25, 1, 0.2, 5.9, 3, 0.2, 9, 1, 2.2], cat: 'veg', emoji: '🍆', en: 'Eggplant', zh: '茄子', aliases: ['aubergine'],
      prep: { en: 'Peel, dice and steam 12 min until creamy.', zh: '去皮切丁，蒸12分钟至绵软。' } },
    { id: 'mushroom', portion: 15, n: [22, 3.1, 0.3, 3.3, 1, 0.5, 3, 0, 2], cat: 'veg', emoji: '🍄', en: 'Mushroom', zh: '蘑菇', aliases: ['mushrooms', 'shiitake', '香菇', '口蘑', '平菇'],
      prep: { en: 'Cook 8 min until soft, then mince very finely (rubbery if left in pieces).', zh: '煮8分钟后剁成极细的末（大块会有韧性）。' } },
    { id: 'beet', portion: 25, n: [43, 1.6, 0.2, 9.6, 2.8, 0.8, 16, 2, 4.9], cat: 'veg', emoji: '🟣', en: 'Beetroot', zh: '甜菜根', aliases: ['beet', 'beets', '红菜头'],
      prep: { en: 'Peel, dice and steam 25 min; blend smooth (stains are normal in nappies).', zh: '去皮切丁蒸25分钟后打泥（大便变红属正常）。' } },
    { id: 'asparagus', portion: 20, n: [20, 2.2, 0.1, 3.9, 2.1, 2.1, 24, 38, 5.6], short: { en: 'asparagus', zh: '芦笋' }, cat: 'veg', emoji: '🌱', en: 'Asparagus tips', zh: '芦笋尖', aliases: ['asparagus', '芦笋'],
      prep: { en: 'Use only the tender tips, steam 8 min and blend.', zh: '只取嫩尖，蒸8分钟后打泥。' } },
    { id: 'bellpepper', portion: 25, n: [31, 1, 0.3, 6, 2.1, 0.4, 7, 157, 128], cat: 'veg', emoji: '🫑', en: 'Red bell pepper', zh: '红椒', aliases: ['bell pepper', 'capsicum', 'pepper', '甜椒', '彩椒'],
      prep: { en: 'Roast or steam until soft, peel the skin off and blend.', zh: '烤或蒸至软，剥掉外皮后打泥。' } },

    // ---------- Fruit ----------
    { id: 'banana', portion: 50, n: [89, 1.1, 0.3, 22.8, 2.6, 0.3, 5, 3, 8.7], cat: 'fruit', emoji: '🍌', en: 'Banana', zh: '香蕉', aliases: ['bananas'],
      prep: { en: 'Choose a ripe spotty banana and mash with a fork.', zh: '选熟透带斑点的香蕉，用叉子压成泥。' } },
    { id: 'apple', portion: 50, n: [48, 0.3, 0.1, 12.8, 1.3, 0.1, 5, 2, 4], cat: 'fruit', emoji: '🍎', en: 'Apple', zh: '苹果', aliases: ['apples'],
      prep: { en: 'Peel, core, dice and steam 10 min, then mash (raw apple is a choking risk).', zh: '去皮去核切丁，蒸10分钟后压泥（生苹果易噎）。' } },
    { id: 'pear', portion: 50, n: [57, 0.4, 0.1, 15.2, 3.1, 0.2, 9, 1, 4.3], cat: 'fruit', emoji: '🍐', en: 'Pear', zh: '梨', aliases: ['pears', '雪梨', '鸭梨'],
      prep: { en: 'Peel, core and steam 8 min, then mash.', zh: '去皮去核，蒸8分钟后压泥。' } },
    { id: 'mango', portion: 50, n: [60, 0.8, 0.4, 15, 1.6, 0.2, 11, 54, 36], cat: 'fruit', emoji: '🥭', en: 'Mango', zh: '芒果', aliases: ['mangoes'],
      prep: { en: 'Scoop ripe flesh and mash (introduce alone first; some babies get a rash).', zh: '取熟透的果肉压泥（首次单独添加，少数宝宝会过敏）。' } },
    { id: 'peach', portion: 50, n: [39, 0.9, 0.3, 9.5, 1.5, 0.3, 6, 16, 6.6], cat: 'fruit', emoji: '🍑', en: 'Peach', zh: '桃子', aliases: ['peaches', 'nectarine', '水蜜桃', '油桃'],
      prep: { en: 'Peel a ripe peach, remove stone and mash (steam 3 min if firm).', zh: '熟桃去皮去核压泥（偏硬就蒸3分钟）。' } },
    { id: 'blueberry', portion: 40, n: [57, 0.7, 0.3, 14.5, 2.4, 0.3, 6, 3, 9.7], short: { en: 'blueberry', zh: '蓝莓' }, cat: 'fruit', emoji: '🫐', en: 'Blueberries', zh: '蓝莓', aliases: ['blueberry'],
      prep: { en: 'Never whole: squash flat or simmer 3 min and mash.', zh: '切勿整颗给：压扁或煮3分钟后压泥。' } },
    { id: 'strawberry', portion: 40, n: [32, 0.7, 0.3, 7.7, 2, 0.4, 16, 1, 58.8], short: { en: 'strawberry', zh: '草莓' }, cat: 'fruit', emoji: '🍓', en: 'Strawberries', zh: '草莓', aliases: ['strawberry'],
      prep: { en: 'Wash well, hull and mash finely.', zh: '洗净去蒂，压成细泥。' } },
    { id: 'papaya', portion: 50, n: [43, 0.5, 0.3, 10.8, 1.7, 0.3, 20, 47, 61], cat: 'fruit', emoji: '🍈', en: 'Papaya', zh: '木瓜', aliases: [],
      prep: { en: 'Scoop ripe flesh, remove seeds and mash.', zh: '取熟透的果肉，去籽压泥。' } },
    { id: 'kiwi', portion: 40, n: [61, 1.1, 0.5, 14.7, 3, 0.3, 34, 4, 92.7], cat: 'fruit', emoji: '🥝', en: 'Kiwi', zh: '猕猴桃', aliases: ['kiwifruit', '奇异果'],
      prep: { en: 'Scoop a ripe kiwi, mash; sieve the seeds if baby dislikes them.', zh: '熟猕猴桃挖出果肉压泥，介意籽可过筛。' } },
    { id: 'prune', portion: 15, n: [240, 2.2, 0.4, 63.9, 7.1, 0.9, 43, 39, 0.6], short: { en: 'prune', zh: '西梅' }, cat: 'fruit', emoji: '🟤', en: 'Prunes / plums', zh: '西梅', aliases: ['prune', 'plum', 'plums', '李子', '梅子'],
      prep: { en: 'Soak/simmer pitted prunes 10 min and blend (helps with constipation).', zh: '去核西梅泡软或煮10分钟后打泥（帮助通便）。' } },
    { id: 'watermelon', portion: 60, n: [30, 0.6, 0.2, 7.6, 0.4, 0.2, 7, 28, 8.1], cat: 'fruit', emoji: '🍉', en: 'Watermelon', zh: '西瓜', aliases: [],
      prep: { en: 'Remove every seed and mash the flesh.', zh: '把籽全部去掉，果肉压碎。' } },
    { id: 'dragonfruit', portion: 50, n: [57, 1.1, 0.4, 13, 2, 0.4, 8, 0, 5], cat: 'fruit', emoji: '🐉', en: 'Dragon fruit', zh: '火龙果', aliases: ['pitaya', 'pitahaya', '红心火龙果'],
      prep: { en: 'Scoop and mash (red flesh can colour nappies red, that\'s normal).', zh: '挖出果肉压泥（红心的会让大便变红，正常）。' } },
    { id: 'apricot', portion: 50, n: [48, 1.4, 0.4, 11.1, 2, 0.4, 13, 96, 10], cat: 'fruit', emoji: '🍑', en: 'Apricot', zh: '杏', aliases: ['apricots', '杏子'],
      prep: { en: 'Peel ripe apricots, remove stone, steam 3 min and mash.', zh: '熟杏去皮去核，蒸3分钟后压泥。' } },

    // ---------- Protein ----------
    { id: 'egg', portion: 50, n: [143, 12.6, 9.5, 0.7, 0, 1.8, 56, 160, 0], cat: 'protein', emoji: '🥚', en: 'Egg', zh: '鸡蛋', iron: true, allergen: 'egg', aliases: ['eggs', 'egg yolk', '蛋', '蛋黄'],
      prep: { en: 'Cook until fully set (no runny yolk): steam as custard or hard-boil and mash.', zh: '必须全熟（蛋黄不流心）：蒸蛋羹或煮熟压碎。' } },
    { id: 'chicken', portion: 30, n: [121, 19.7, 4.1, 0, 0, 0.8, 9, 16, 0], cat: 'protein', emoji: '🍗', en: 'Chicken', zh: '鸡肉', aliases: ['chicken breast', 'chicken thigh', '鸡胸肉', '鸡腿肉', '鸡'],
      prep: { en: 'Use thigh for softness. Poach 15 min until cooked through, then blend or mince very finely.', zh: '鸡腿肉更嫩。水煮15分钟至全熟，再打泥或剁成极细的末。' } },
    { id: 'beef', portion: 30, n: [136, 22, 5, 0, 0, 2.3, 5, 0, 0], cat: 'protein', emoji: '🥩', en: 'Beef', zh: '牛肉', iron: true, aliases: ['ground beef', 'mince', 'minced beef', '牛肉末', '牛肉馅'],
      prep: { en: 'Soak in water 30 min to draw out blood, simmer 25 min, then blend with a little cooking liquid.', zh: '泡水30分钟去血水，煮25分钟，加少许原汤打成泥。' } },
    { id: 'pork', portion: 30, n: [109, 21, 2.2, 0, 0, 1, 5, 2, 0.6], cat: 'protein', emoji: '🐖', en: 'Pork', zh: '猪肉', iron: true, aliases: ['pork tenderloin', 'ground pork', '猪里脊', '猪肉末', '肉末'],
      prep: { en: 'Use lean tenderloin, simmer 20 min until fully cooked, then blend very finely.', zh: '用瘦的里脊，煮20分钟至全熟，打成细泥。' } },
    { id: 'lamb', portion: 30, n: [134, 20.3, 5.3, 0, 0, 1.8, 10, 0, 0], cat: 'protein', emoji: '🐑', en: 'Lamb', zh: '羊肉', iron: true, aliases: ['mutton'],
      prep: { en: 'Simmer lean lamb 30 min until tender and blend with cooking liquid.', zh: '瘦羊肉煮30分钟至软，加原汤打泥。' } },
    { id: 'turkey', portion: 30, n: [114, 23.7, 1.5, 0.1, 0, 0.7, 11, 0, 0], cat: 'protein', emoji: '🦃', en: 'Turkey', zh: '火鸡肉', aliases: ['ground turkey'],
      prep: { en: 'Poach until cooked through, then blend finely with a little liquid.', zh: '煮至全熟，加少许汤打成细泥。' } },
    { id: 'liver', portion: 15, n: [119, 16.9, 4.8, 0.7, 0, 9, 8, 3296, 17.9], cat: 'protein', emoji: '🫀', en: 'Chicken liver', zh: '鸡肝', iron: true, maxPerWeek: 1, aliases: ['liver', 'pork liver', '猪肝', '肝'],
      prep: { en: 'Soak 30 min, boil 15 min until no pink, blend to a paste. Max once a week (very high vitamin A).', zh: '泡水30分钟，煮15分钟至无血色，打成泥。每周最多一次（维生素A很高）。' } },
    { id: 'salmon', portion: 30, n: [208, 20.4, 13.4, 0, 0, 0.3, 9, 58, 3.9], cat: 'protein', emoji: '🐟', en: 'Salmon', zh: '三文鱼', allergen: 'fish', aliases: ['三文鱼', '鲑鱼'],
      prep: { en: 'Steam 10 min, then flake with your fingers and remove EVERY bone.', zh: '蒸10分钟，用手指碾碎并仔细去除所有鱼刺。' } },
    { id: 'cod', portion: 35, n: [82, 17.8, 0.7, 0, 0, 0.4, 16, 12, 1], short: { en: 'white fish', zh: '鳕鱼' }, cat: 'protein', emoji: '🐟', en: 'Cod / white fish', zh: '鳕鱼', allergen: 'fish', aliases: ['cod', 'white fish', 'fish', 'basa', 'tilapia', 'sole', '龙利鱼', '鲈鱼', '鱼', '白鱼'],
      prep: { en: 'Steam 8–10 min until it flakes, check carefully for bones and mash.', zh: '蒸8–10分钟至能碾碎，仔细挑刺后压泥。' } },
    { id: 'shrimp', portion: 30, n: [85, 20.1, 0.5, 0, 0, 0.5, 64, 0, 0], cat: 'protein', emoji: '🦐', en: 'Shrimp', zh: '虾', allergen: 'shellfish', aliases: ['prawn', 'prawns', '虾仁', '鲜虾'],
      prep: { en: 'Devein, boil 3 min until pink, then mince to a paste.', zh: '去虾线，煮3分钟至变红，剁成虾泥。' } },
    { id: 'tofu', portion: 50, n: [55, 4.8, 2.7, 2.9, 0.1, 0.8, 31, 0, 0], short: { en: 'silken tofu', zh: '豆腐' }, cat: 'protein', emoji: '🧈', en: 'Silken tofu', zh: '嫩豆腐', allergen: 'soy', aliases: ['tofu', 'soft tofu', '豆腐', '内酯豆腐'],
      prep: { en: 'Blanch 2 min, then mash — it is naturally silky.', zh: '焯水2分钟后压碎，本身就很嫩滑。' } },
    { id: 'lentils', portion: 20, n: [358, 24, 2.2, 63, 10.8, 7.4, 48, 3, 1.7], cat: 'protein', emoji: '🫘', en: 'Red lentils', zh: '红扁豆', iron: true, aliases: ['lentils', 'lentil', '扁豆', '小扁豆'],
      prep: { en: 'Rinse and simmer red lentils 20 min until they collapse into a puree.', zh: '红扁豆洗净煮20分钟至化成泥。' } },
    { id: 'chickpeas', portion: 35, n: [139, 7, 2.8, 22.5, 7.6, 1.3, 43, 1, 0], cat: 'protein', emoji: '🫘', en: 'Chickpeas', zh: '鹰嘴豆', aliases: ['chickpea', 'garbanzo'],
      prep: { en: 'Use unsalted/rinsed chickpeas, cook until very soft, blend and sieve the skins.', zh: '用无盐的鹰嘴豆，煮至软烂，打泥后过筛去皮。' } },

    // ---------- Dairy ----------
    { id: 'yogurt', portion: 70, n: [61, 3.5, 3.3, 4.7, 0, 0.1, 121, 27, 0.5], short: { en: 'yogurt', zh: '酸奶' }, cat: 'dairy', emoji: '🥛', en: 'Plain yogurt', zh: '原味酸奶', allergen: 'dairy', aliases: ['yogurt', 'yoghurt', 'greek yogurt', '酸奶', '无糖酸奶'],
      prep: { en: 'Full-fat, plain, unsweetened only. Serve at room temperature.', zh: '只用全脂、原味、无糖的酸奶，室温食用。' } },
    { id: 'ricotta', portion: 20, n: [174, 11.3, 13, 3, 0, 0.4, 207, 120, 0], short: { en: 'soft cheese', zh: '软奶酪' }, cat: 'dairy', emoji: '🧀', en: 'Ricotta / cottage cheese', zh: '软奶酪', allergen: 'dairy', aliases: ['ricotta', 'cottage cheese', 'cheese', 'cream cheese', '奶酪', '芝士', '乳清奶酪'],
      prep: { en: 'Choose a low-sodium fresh cheese; stir in a spoonful.', zh: '选低钠的新鲜软奶酪，拌入一小勺。' } },
    { id: 'milk', portion: 100, n: [61, 3.2, 3.3, 4.8, 0, 0, 113, 46, 0], short: { en: 'milk', zh: '奶' }, cat: 'dairy', emoji: '🍼', en: 'Whole milk / formula', zh: '全脂奶 / 配方奶', allergen: 'dairy', aliases: ['milk', 'formula', 'breast milk', '牛奶', '奶粉', '配方奶', '母乳'],
      prep: { en: 'Use to thin purees or cook porridge instead of water.', zh: '用来稀释果蔬泥或代替水煮粥。' } },

    // ---------- Healthy fats ----------
    { id: 'avocado', portion: 20, n: [160, 2, 14.7, 8.5, 6.7, 0.6, 12, 7, 10], cat: 'fat', emoji: '🥑', en: 'Avocado', zh: '牛油果', aliases: ['avocados', '鳄梨'],
      prep: { en: 'Scoop ripe avocado and mash smooth; no cooking needed.', zh: '取熟透的牛油果压成泥，无需加热。' } },
    { id: 'oliveoil', portion: 3, n: [884, 0, 100, 0, 0, 0.6, 1, 0, 0], cat: 'fat', emoji: '🫒', en: 'Olive oil', zh: '橄榄油', aliases: ['olive oil', 'oil', '食用油', '核桃油', '亚麻籽油'],
      prep: { en: 'Stir ½ tsp into the finished food for extra calories.', zh: '出锅后拌入半小勺，增加热量。' } },
    { id: 'butter', portion: 3, n: [717, 0.9, 81, 0.1, 0, 0, 24, 684, 0], cat: 'fat', emoji: '🧈', en: 'Unsalted butter', zh: '无盐黄油', allergen: 'dairy', aliases: ['butter', '黄油'],
      prep: { en: 'Melt a small knob into warm porridge or mash.', zh: '在温热的粥或泥里化入一小块。' } },
    { id: 'peanutbutter', portion: 5, n: [598, 22.2, 51.4, 22.3, 5, 1.7, 49, 0, 0], short: { en: 'peanut butter', zh: '花生酱' }, cat: 'fat', emoji: '🥜', en: 'Peanut butter (smooth)', zh: '花生酱（顺滑）', allergen: 'peanut', aliases: ['peanut butter', 'peanut', 'peanuts', '花生酱', '花生'],
      prep: { en: '100% peanut, no salt/sugar. Thin ½ tsp with warm water — never give it thick or as whole nuts.', zh: '选100%花生、无盐无糖。半小勺用温水调稀——切勿给浓稠的酱或整粒花生。' } },
    { id: 'tahini', portion: 5, n: [595, 17, 53.8, 21.2, 9.3, 9, 426, 3, 0], cat: 'fat', emoji: '⚪', en: 'Sesame paste', zh: '芝麻酱', allergen: 'sesame', aliases: ['tahini', 'sesame', '芝麻'],
      prep: { en: 'Pure sesame paste, no salt. Thin ½ tsp with warm water before stirring in.', zh: '选纯芝麻酱、无盐。半小勺用温水调开后拌入。' } },
  ];

  const ALLERGENS = [
    { id: 'egg', en: 'Egg', zh: '鸡蛋' },
    { id: 'dairy', en: 'Dairy', zh: '奶制品' },
    { id: 'fish', en: 'Fish', zh: '鱼' },
    { id: 'shellfish', en: 'Shellfish', zh: '虾蟹贝类' },
    { id: 'wheat', en: 'Wheat / gluten', zh: '小麦 / 麸质' },
    { id: 'soy', en: 'Soy', zh: '大豆' },
    { id: 'peanut', en: 'Peanut', zh: '花生' },
    { id: 'sesame', en: 'Sesame', zh: '芝麻' },
  ];

  // A reasonable "typical kitchen" set so the app can be tried in one tap.
  const STARTER_PANTRY = ['rice', 'oats', 'noodles', 'sweetpotato', 'potato', 'carrot', 'pumpkin', 'broccoli',
    'spinach', 'tomato', 'zucchini', 'banana', 'apple', 'pear', 'blueberry', 'egg', 'chicken', 'beef', 'cod',
    'tofu', 'yogurt', 'avocado', 'oliveoil', 'flour'];

  // Foods that are never suggested and trigger a warning if typed in.
  const BLOCKED = [
    { match: ['salt', 'soy sauce', 'sugar', 'honey', 'syrup', 'candy', 'chocolate', 'juice', 'ketchup', 'sausage', 'ham', 'bacon', 'chips', 'crisps', 'popcorn', 'whole nuts', 'grapes', 'grape', 'marshmallow', 'msg', 'stock cube', 'bouillon',
        '盐', '酱油', '糖', '蜂蜜', '糖浆', '糖果', '巧克力', '果汁', '番茄酱', '香肠', '火腿', '培根', '薯片', '爆米花', '坚果', '葡萄', '味精', '鸡精', '蚝油'],
      en: 'Not suitable for a 14-month-old (added salt/sugar or choking risk) — skipped.',
      zh: '不适合14个月宝宝（含盐/糖或有噎呛风险）——已跳过。' },
  ];

  // Nutrient order used by every `n` array above: values per 100 g of raw (or dry) edible food.
  // Approximate figures from USDA FoodData Central and the China Food Composition Tables.
  // `need` is the daily reference for children aged 1–3 (US Dietary Reference Intakes);
  // energy is an estimate for a ~10 kg 14-month-old. null = no single daily target.
  const NUTRIENTS = [
    { id: 'kcal', en: 'Energy', zh: '能量', unit: 'kcal', need: 800, dp: 0 },
    { id: 'protein', en: 'Protein', zh: '蛋白质', unit: 'g', need: 13, dp: 1 },
    { id: 'fat', en: 'Fat', zh: '脂肪', unit: 'g', need: null, dp: 1 },
    { id: 'carb', en: 'Carbohydrate', zh: '碳水化合物', unit: 'g', need: null, dp: 0 },
    { id: 'fiber', en: 'Fibre', zh: '膳食纤维', unit: 'g', need: null, dp: 1 },
    { id: 'iron', en: 'Iron', zh: '铁', unit: 'mg', need: 7, dp: 1 },
    { id: 'calcium', en: 'Calcium', zh: '钙', unit: 'mg', need: 700, dp: 0 },
    { id: 'vitA', en: 'Vitamin A', zh: '维生素A', unit: 'µg', need: 300, dp: 0 },
    { id: 'vitC', en: 'Vitamin C', zh: '维生素C', unit: 'mg', need: 15, dp: 0 },
  ];

  // Milk drunk alongside meals, per 100 ml. Formula varies by brand; this is a typical follow-on formula.
  const MILKS = [
    { id: 'whole', en: 'Whole cow\'s milk', zh: '全脂牛奶', n: [61, 3.2, 3.3, 4.8, 0, 0.03, 113, 46, 0] },
    { id: 'breast', en: 'Breast milk', zh: '母乳', n: [70, 1.0, 4.4, 6.9, 0, 0.03, 32, 61, 5] },
    { id: 'formula', en: 'Formula', zh: '配方奶', n: [66, 1.4, 3.5, 7.3, 0, 1.0, 60, 60, 9] },
  ];

  // Age groups. `needs` follows NUTRIENTS order (null = no single target); 1–3 year DRIs apply until the
  // 4th birthday, 4–8 year DRIs after. `scale` multiplies the 12–24 month portions.
  const AGE_GROUPS = [
    { id: 'm12', en: '12–24 months', zh: '1–2岁', scale: 1, texture: 'mash', meals: ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'], milkMl: 400,
      needs: [800, 13, null, null, null, 7, 700, 300, 15] },
    { id: 'y2', en: '2–3 years', zh: '2–3岁', scale: 1.3, texture: 'bites', meals: ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'], milkMl: 400,
      needs: [1000, 13, null, null, null, 7, 700, 300, 15] },
    { id: 'y3', en: '3–4 years', zh: '3–4岁', scale: 1.5, texture: 'family', meals: ['breakfast', 'dinner'], milkMl: 350,
      needs: [1150, 13, null, null, null, 7, 700, 300, 15] },
    { id: 'y4', en: '4–5 years', zh: '4–5岁', scale: 1.7, texture: 'family', meals: ['breakfast', 'dinner'], milkMl: 350,
      needs: [1300, 19, null, null, null, 10, 1000, 400, 25] },
  ];

  // Texture stages, from smoothest to family food. Stage decides which cooking methods are offered.
  const TEXTURES = [
    { id: 'puree', stage: 0, en: 'Smooth puree', zh: '细腻泥糊', hint: { en: 'Blended completely smooth.', zh: '完全打成顺滑的泥。' } },
    { id: 'mash', stage: 1, en: 'Soft mash', zh: '软烂压泥', hint: { en: 'Fork-mashed with tiny soft lumps, to practise gum-chewing.', zh: '用叉子压成带小软粒的泥，练习用牙床咀嚼。' } },
    { id: 'minced', stage: 2, en: 'Finely chopped', zh: '碎末软食', hint: { en: 'Soft food chopped into 2–3 mm bits, soft rice and small meatballs.', zh: '切成2–3毫米的碎末，软饭、小肉丸。' } },
    { id: 'bites', stage: 3, en: 'Soft bites & finger food', zh: '软块手指食物', hint: { en: 'Soft pieces that squash between two fingers, for self-feeding.', zh: '两根手指一捏就烂的软块，让孩子自己抓着吃。' } },
    { id: 'family', stage: 4, en: 'Family food, cut small', zh: '家常饭菜（切小块）', hint: { en: 'Everyday dishes with little salt, cut into bite-sized pieces.', zh: '少盐的家常菜，切成一口大小。' } },
  ];

  // Cooking methods beyond boiling and mixed purees, shown on the Ideas tab. minStage = earliest texture stage.
  const COOKING_IDEAS = [
    { id: 'steam', minStage: 0, emoji: '♨️', en: 'Steam instead of boil', zh: '蒸代替煮',
      body: { en: 'Steaming keeps more vitamin C and colour than boiling. Steam veg over the rice pot to save time.', zh: '蒸比水煮保留更多维生素C和颜色。可以在煮饭的锅上架蒸屉，一起蒸。' } },
    { id: 'separate', minStage: 0, emoji: '🍱', en: 'Serve foods separately', zh: '分开装，不全混在一起',
      body: { en: 'Put 2–3 purees side by side instead of one mixed puree, so your child learns each taste and colour.', zh: '把2–3种泥分开放在盘里，不全部混合，孩子能认识每种食物的味道和颜色。' } },
    { id: 'roast', minStage: 1, emoji: '🔥', en: 'Oven-roast', zh: '烤箱烤',
      body: { en: 'Roast sweet potato, pumpkin or carrot at 200°C for 25–35 min with a little oil. Sweeter and nuttier; mash or cut into soft sticks.', zh: '红薯、南瓜、胡萝卜刷少许油，200°C烤25–35分钟。味道更香甜，可以压泥或切软条。' } },
    { id: 'braise', minStage: 0, emoji: '🍲', en: 'Slow braise or stew', zh: '慢炖',
      body: { en: 'Simmer beef, pork or lamb with tomato and root veg for 1–1.5 hours until it falls apart. Much softer than boiled meat.', zh: '牛肉、猪肉或羊肉加番茄和根茎类蔬菜小火炖1–1.5小时，炖到一碰就散，比白煮的肉嫩很多。' } },
    { id: 'custard', minStage: 0, emoji: '🥚', en: 'Steamed egg custard', zh: '蒸蛋羹',
      body: { en: 'Egg + 1.5× warm water + finely chopped veg or fish, steamed 10–12 min. Silky enough for no teeth.', zh: '鸡蛋加1.5倍温水，拌入菜末或鱼泥，蒸10–12分钟，嫩滑不用牙。' } },
    { id: 'meatball', minStage: 1, emoji: '🧆', en: 'Steamed meatballs and fish balls', zh: '蒸肉丸、鱼丸',
      body: { en: 'Blend meat or fish with veg and a spoon of starch or oats, roll small balls and steam 12–15 min. Soft enough to squash.', zh: '肉或鱼加蔬菜和一勺淀粉或燕麦打成泥，搓小丸子蒸12–15分钟，软到一压就烂。' } },
    { id: 'pancake', minStage: 1, emoji: '🥞', en: 'Soft veggie pancakes', zh: '蔬菜软饼',
      body: { en: 'Egg + flour or oats + grated veg, cooked on low heat in a non-stick pan. Tear into pieces for baby, whole for big kids.', zh: '鸡蛋加面粉或燕麦粉，再加擦丝的蔬菜，不粘锅小火煎熟。给小宝撕小块，大宝整块吃。' } },
    { id: 'steamcake', minStage: 1, emoji: '🧁', en: 'No-sugar steamed cakes', zh: '无糖蒸糕',
      body: { en: 'Oat flour + mashed banana or apple + egg, steamed 20 min. Sweetened only by fruit.', zh: '燕麦粉加香蕉泥或苹果泥和鸡蛋，蒸20分钟，只用水果的甜味。' } },
    { id: 'softrice', minStage: 2, emoji: '🍚', en: 'Soft rice and risotto', zh: '软饭、烩饭',
      body: { en: 'Cook rice with 3–4× water so it is soft but not soupy, then stir in chopped veg and meat. The step between congee and normal rice.', zh: '米加3–4倍水煮成软饭（比粥稠），拌入菜末和肉末。是从粥到普通米饭的过渡。' } },
    { id: 'wonton', minStage: 2, emoji: '🥟', en: 'Tiny wontons', zh: '小馄饨',
      body: { en: 'Wrap a little minced meat and veg in thin wrappers and boil 5 min. Cut in half for little ones.', zh: '用薄馄饨皮包少许肉末和菜末，煮5分钟。给小宝剪成两半。' } },
    { id: 'finger', minStage: 3, emoji: '✋', en: 'Finger foods', zh: '手指食物',
      body: { en: 'Steamed carrot or broccoli sticks, tofu cubes, omelette strips and banana spears. Soft enough to squash between two fingers.', zh: '蒸熟的胡萝卜条、西兰花、豆腐块、鸡蛋饼条、香蕉条，软到两根手指能捏烂。' } },
  ];

  const api = { CATEGORIES, FOODS, ALLERGENS, STARTER_PANTRY, BLOCKED, NUTRIENTS, MILKS, AGE_GROUPS, TEXTURES, COOKING_IDEAS };
  root.TDM_DATA = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
