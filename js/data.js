/*
 * Food database for a ~14-month-old with very few teeth.
 * Every item carries a bilingual name and a "prep" note that gets it to a
 * super-soft / puree texture. No salt, sugar or honey is ever added.
 *
 * cat:       carb | veg | fruit | protein | dairy | fat
 * form:      (carb only) porridge | noodle | pasta | mash — decides the dish template
 * allergen:  egg | dairy | fish | shellfish | wheat | soy | peanut | treenut | sesame
 * iron:      true for iron-rich foods (important at this age)
 * maxPerWeek: optional cap (e.g. liver)
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
    { id: 'rice', cat: 'carb', form: 'porridge', emoji: '🍚', en: 'Rice', zh: '大米', aliases: ['white rice', 'brown rice', '米', '白米', '米饭'],
      prep: { en: 'Cook rice with 8–10× water into a thick, very soft congee (about 40 min).', zh: '大米加8–10倍水熬成浓稠软烂的粥（约40分钟）。' } },
    { id: 'millet', cat: 'carb', form: 'porridge', emoji: '🌾', en: 'Millet', zh: '小米', aliases: ['小米粥'],
      prep: { en: 'Simmer millet with 8× water for 30–40 min until creamy.', zh: '小米加8倍水小火煮30–40分钟至绵软。' } },
    { id: 'oats', cat: 'carb', form: 'porridge', emoji: '🥣', en: 'Oats', zh: '燕麦', iron: true, aliases: ['oatmeal', 'rolled oats', 'baby oatmeal', '燕麦片', '麦片'],
      prep: { en: 'Blend oats into a powder, then cook with water or milk for 5 min until smooth.', zh: '燕麦打成粉，加水或奶煮5分钟至顺滑。' } },
    { id: 'quinoa', cat: 'carb', form: 'porridge', emoji: '🌾', en: 'Quinoa', zh: '藜麦', iron: true, aliases: [],
      prep: { en: 'Rinse well, cook with 3× water for 20 min until burst and soft.', zh: '充分淘洗，加3倍水煮20分钟至开花软烂。' } },
    { id: 'noodles', short: { en: 'noodles', zh: '面条' }, cat: 'carb', form: 'noodle', emoji: '🍜', en: 'Thin noodles', zh: '面条', allergen: 'wheat', aliases: ['noodle', 'baby noodles', '挂面', '宝宝面', '细面'],
      prep: { en: 'Use no-salt baby noodles. Break into 1 cm pieces and boil until very soft.', zh: '选无盐宝宝面，掰成1厘米小段，煮至软烂。' } },
    { id: 'pasta', short: { en: 'pasta', zh: '小意面' }, cat: 'carb', form: 'pasta', emoji: '🍝', en: 'Tiny pasta', zh: '小颗粒意面', allergen: 'wheat', aliases: ['pasta', 'orzo', 'macaroni', 'pastina', '意面', '通心粉'],
      prep: { en: 'Boil tiny pasta (orzo/pastina) 2–3 min longer than the packet says.', zh: '小颗粒意面比包装建议多煮2–3分钟，煮至软烂。' } },
    { id: 'couscous', cat: 'carb', form: 'porridge', emoji: '🌾', en: 'Couscous', zh: '古斯米', allergen: 'wheat', aliases: ['cous cous'],
      prep: { en: 'Pour 2× boiling water over couscous, cover 10 min, then fluff and mash.', zh: '古斯米加2倍开水焖10分钟，拌松后压软。' } },
    { id: 'potato', cat: 'carb', form: 'mash', emoji: '🥔', en: 'Potato', zh: '土豆', aliases: ['potatoes', '马铃薯', '洋芋'],
      prep: { en: 'Peel, cube and steam 20 min until a fork slides in easily.', zh: '去皮切块，蒸20分钟至筷子轻松插透。' } },
    { id: 'sweetpotato', cat: 'carb', form: 'mash', emoji: '🍠', en: 'Sweet potato', zh: '红薯', iron: false, aliases: ['sweet potatoes', 'yam (orange)', '地瓜', '番薯', '紫薯'],
      prep: { en: 'Peel, cube and steam 20 min until very soft.', zh: '去皮切块，蒸20分钟至软烂。' } },
    { id: 'chineseyam', cat: 'carb', form: 'mash', emoji: '🥢', en: 'Chinese yam', zh: '山药', aliases: ['yam', 'nagaimo', '铁棍山药', '淮山'],
      prep: { en: 'Wear gloves to peel (sap itches), slice and steam 15–20 min.', zh: '戴手套去皮（黏液会痒），切段蒸15–20分钟。' } },
    { id: 'taro', cat: 'carb', form: 'mash', emoji: '🥔', en: 'Taro', zh: '芋头', aliases: ['芋艿', '香芋'],
      prep: { en: 'Peel with gloves, cube and steam 25 min until floury and soft.', zh: '戴手套去皮切块，蒸25分钟至粉糯。' } },

    // ---------- Vegetables ----------
    { id: 'carrot', cat: 'veg', emoji: '🥕', en: 'Carrot', zh: '胡萝卜', aliases: ['carrots', '红萝卜'],
      prep: { en: 'Peel, dice small and steam 15–20 min until very soft.', zh: '去皮切小丁，蒸15–20分钟至软烂。' } },
    { id: 'pumpkin', short: { en: 'pumpkin', zh: '南瓜' }, cat: 'veg', emoji: '🎃', en: 'Pumpkin / squash', zh: '南瓜', aliases: ['pumpkin', 'squash', 'butternut squash', 'butternut', 'kabocha', '贝贝南瓜', '板栗南瓜'],
      prep: { en: 'Remove skin and seeds, steam chunks 15 min.', zh: '去皮去籽，切块蒸15分钟。' } },
    { id: 'broccoli', cat: 'veg', emoji: '🥦', en: 'Broccoli', zh: '西兰花', aliases: ['西蓝花', '花椰菜(绿)'],
      prep: { en: 'Use florets only, blanch then steam 8–10 min until very tender.', zh: '只取花朵部分，焯水后蒸8–10分钟至很软。' } },
    { id: 'cauliflower', cat: 'veg', emoji: '🥬', en: 'Cauliflower', zh: '花菜', aliases: ['菜花', '花椰菜'],
      prep: { en: 'Florets only, steam 10–12 min until they crush easily.', zh: '只取花朵，蒸10–12分钟至一压就碎。' } },
    { id: 'spinach', cat: 'veg', emoji: '🥬', en: 'Spinach', zh: '菠菜', iron: true, aliases: ['baby spinach'],
      prep: { en: 'Blanch leaves 1 min (removes oxalic acid), squeeze dry and chop very finely.', zh: '叶子焯水1分钟去草酸，挤干后剁成细末。' } },
    { id: 'bokchoy', cat: 'veg', emoji: '🥬', en: 'Bok choy', zh: '小白菜', aliases: ['pak choi', 'baby bok choy', '上海青', '青菜', '油菜'],
      prep: { en: 'Use tender leaves, blanch 1–2 min and chop very finely.', zh: '取嫩叶，焯水1–2分钟后剁成细末。' } },
    { id: 'napacabbage', cat: 'veg', emoji: '🥬', en: 'Napa cabbage', zh: '大白菜', aliases: ['chinese cabbage', 'cabbage', '白菜', '卷心菜', '包菜'],
      prep: { en: 'Use the soft leafy part, boil 5 min and chop very finely.', zh: '取软叶部分，煮5分钟后剁碎。' } },
    { id: 'zucchini', cat: 'veg', emoji: '🥒', en: 'Zucchini', zh: '西葫芦', aliases: ['courgette', 'squash (green)'],
      prep: { en: 'Peel, dice and steam 8 min; it turns silky.', zh: '去皮切丁，蒸8分钟即软滑。' } },
    { id: 'wintermelon', cat: 'veg', emoji: '🍈', en: 'Winter melon', zh: '冬瓜', aliases: ['wax gourd'],
      prep: { en: 'Peel, remove seeds, dice and simmer 10 min until translucent.', zh: '去皮去瓤，切丁煮10分钟至透明。' } },
    { id: 'luffa', short: { en: 'luffa', zh: '丝瓜' }, cat: 'veg', emoji: '🥒', en: 'Luffa (silk gourd)', zh: '丝瓜', aliases: ['loofah', 'silk squash', 'luffa'],
      prep: { en: 'Peel, dice and cook 5 min; it becomes very soft.', zh: '去皮切丁，煮5分钟即很软。' } },
    { id: 'peas', cat: 'veg', emoji: '🫛', en: 'Green peas', zh: '豌豆', iron: true, aliases: ['peas', 'frozen peas', '青豆'],
      prep: { en: 'Boil 10 min, then blend and sieve out the skins.', zh: '煮10分钟后打泥，过筛去皮。' } },
    { id: 'greenbeans', cat: 'veg', emoji: '🫛', en: 'Green beans', zh: '四季豆', aliases: ['string beans', '扁豆', '豆角'],
      prep: { en: 'Trim strings, boil thoroughly 15 min (must be fully cooked), then blend.', zh: '去筋，彻底煮熟15分钟（一定要熟透），再打泥。' } },
    { id: 'tomato', cat: 'veg', emoji: '🍅', en: 'Tomato', zh: '番茄', aliases: ['tomatoes', '西红柿'],
      prep: { en: 'Score an X, blanch 30 s, peel, deseed and cook down 5 min.', zh: '划十字烫30秒去皮去籽，小火煮5分钟成酱。' } },
    { id: 'eggplant', cat: 'veg', emoji: '🍆', en: 'Eggplant', zh: '茄子', aliases: ['aubergine'],
      prep: { en: 'Peel, dice and steam 12 min until creamy.', zh: '去皮切丁，蒸12分钟至绵软。' } },
    { id: 'mushroom', cat: 'veg', emoji: '🍄', en: 'Mushroom', zh: '蘑菇', aliases: ['mushrooms', 'shiitake', '香菇', '口蘑', '平菇'],
      prep: { en: 'Cook 8 min until soft, then mince very finely (rubbery if left in pieces).', zh: '煮8分钟后剁成极细的末（大块会有韧性）。' } },
    { id: 'beet', cat: 'veg', emoji: '🟣', en: 'Beetroot', zh: '甜菜根', aliases: ['beet', 'beets', '红菜头'],
      prep: { en: 'Peel, dice and steam 25 min; blend smooth (stains are normal in nappies).', zh: '去皮切丁蒸25分钟后打泥（大便变红属正常）。' } },
    { id: 'asparagus', short: { en: 'asparagus', zh: '芦笋' }, cat: 'veg', emoji: '🌱', en: 'Asparagus tips', zh: '芦笋尖', aliases: ['asparagus', '芦笋'],
      prep: { en: 'Use only the tender tips, steam 8 min and blend.', zh: '只取嫩尖，蒸8分钟后打泥。' } },
    { id: 'bellpepper', cat: 'veg', emoji: '🫑', en: 'Red bell pepper', zh: '红椒', aliases: ['bell pepper', 'capsicum', 'pepper', '甜椒', '彩椒'],
      prep: { en: 'Roast or steam until soft, peel the skin off and blend.', zh: '烤或蒸至软，剥掉外皮后打泥。' } },

    // ---------- Fruit ----------
    { id: 'banana', cat: 'fruit', emoji: '🍌', en: 'Banana', zh: '香蕉', aliases: ['bananas'],
      prep: { en: 'Choose a ripe spotty banana and mash with a fork.', zh: '选熟透带斑点的香蕉，用叉子压成泥。' } },
    { id: 'apple', cat: 'fruit', emoji: '🍎', en: 'Apple', zh: '苹果', aliases: ['apples'],
      prep: { en: 'Peel, core, dice and steam 10 min, then mash (raw apple is a choking risk).', zh: '去皮去核切丁，蒸10分钟后压泥（生苹果易噎）。' } },
    { id: 'pear', cat: 'fruit', emoji: '🍐', en: 'Pear', zh: '梨', aliases: ['pears', '雪梨', '鸭梨'],
      prep: { en: 'Peel, core and steam 8 min, then mash.', zh: '去皮去核，蒸8分钟后压泥。' } },
    { id: 'mango', cat: 'fruit', emoji: '🥭', en: 'Mango', zh: '芒果', aliases: ['mangoes'],
      prep: { en: 'Scoop ripe flesh and mash (introduce alone first; some babies get a rash).', zh: '取熟透的果肉压泥（首次单独添加，少数宝宝会过敏）。' } },
    { id: 'peach', cat: 'fruit', emoji: '🍑', en: 'Peach', zh: '桃子', aliases: ['peaches', 'nectarine', '水蜜桃', '油桃'],
      prep: { en: 'Peel a ripe peach, remove stone and mash (steam 3 min if firm).', zh: '熟桃去皮去核压泥（偏硬就蒸3分钟）。' } },
    { id: 'blueberry', short: { en: 'blueberry', zh: '蓝莓' }, cat: 'fruit', emoji: '🫐', en: 'Blueberries', zh: '蓝莓', aliases: ['blueberry'],
      prep: { en: 'Never whole: squash flat or simmer 3 min and mash.', zh: '切勿整颗给：压扁或煮3分钟后压泥。' } },
    { id: 'strawberry', short: { en: 'strawberry', zh: '草莓' }, cat: 'fruit', emoji: '🍓', en: 'Strawberries', zh: '草莓', aliases: ['strawberry'],
      prep: { en: 'Wash well, hull and mash finely.', zh: '洗净去蒂，压成细泥。' } },
    { id: 'papaya', cat: 'fruit', emoji: '🍈', en: 'Papaya', zh: '木瓜', aliases: [],
      prep: { en: 'Scoop ripe flesh, remove seeds and mash.', zh: '取熟透的果肉，去籽压泥。' } },
    { id: 'kiwi', cat: 'fruit', emoji: '🥝', en: 'Kiwi', zh: '猕猴桃', aliases: ['kiwifruit', '奇异果'],
      prep: { en: 'Scoop a ripe kiwi, mash; sieve the seeds if baby dislikes them.', zh: '熟猕猴桃挖出果肉压泥，介意籽可过筛。' } },
    { id: 'prune', short: { en: 'prune', zh: '西梅' }, cat: 'fruit', emoji: '🟤', en: 'Prunes / plums', zh: '西梅', aliases: ['prune', 'plum', 'plums', '李子', '梅子'],
      prep: { en: 'Soak/simmer pitted prunes 10 min and blend (helps with constipation).', zh: '去核西梅泡软或煮10分钟后打泥（帮助通便）。' } },
    { id: 'watermelon', cat: 'fruit', emoji: '🍉', en: 'Watermelon', zh: '西瓜', aliases: [],
      prep: { en: 'Remove every seed and mash the flesh.', zh: '把籽全部去掉，果肉压碎。' } },
    { id: 'dragonfruit', cat: 'fruit', emoji: '🐉', en: 'Dragon fruit', zh: '火龙果', aliases: ['pitaya', 'pitahaya', '红心火龙果'],
      prep: { en: 'Scoop and mash (red flesh can colour nappies red, that\'s normal).', zh: '挖出果肉压泥（红心的会让大便变红，正常）。' } },
    { id: 'apricot', cat: 'fruit', emoji: '🍑', en: 'Apricot', zh: '杏', aliases: ['apricots', '杏子'],
      prep: { en: 'Peel ripe apricots, remove stone, steam 3 min and mash.', zh: '熟杏去皮去核，蒸3分钟后压泥。' } },

    // ---------- Protein ----------
    { id: 'egg', cat: 'protein', emoji: '🥚', en: 'Egg', zh: '鸡蛋', iron: true, allergen: 'egg', aliases: ['eggs', 'egg yolk', '蛋', '蛋黄'],
      prep: { en: 'Cook until fully set (no runny yolk): steam as custard or hard-boil and mash.', zh: '必须全熟（蛋黄不流心）：蒸蛋羹或煮熟压碎。' } },
    { id: 'chicken', cat: 'protein', emoji: '🍗', en: 'Chicken', zh: '鸡肉', aliases: ['chicken breast', 'chicken thigh', '鸡胸肉', '鸡腿肉', '鸡'],
      prep: { en: 'Use thigh for softness. Poach 15 min until cooked through, then blend or mince very finely.', zh: '鸡腿肉更嫩。水煮15分钟至全熟，再打泥或剁成极细的末。' } },
    { id: 'beef', cat: 'protein', emoji: '🥩', en: 'Beef', zh: '牛肉', iron: true, aliases: ['ground beef', 'mince', 'minced beef', '牛肉末', '牛肉馅'],
      prep: { en: 'Soak in water 30 min to draw out blood, simmer 25 min, then blend with a little cooking liquid.', zh: '泡水30分钟去血水，煮25分钟，加少许原汤打成泥。' } },
    { id: 'pork', cat: 'protein', emoji: '🐖', en: 'Pork', zh: '猪肉', iron: true, aliases: ['pork tenderloin', 'ground pork', '猪里脊', '猪肉末', '肉末'],
      prep: { en: 'Use lean tenderloin, simmer 20 min until fully cooked, then blend very finely.', zh: '用瘦的里脊，煮20分钟至全熟，打成细泥。' } },
    { id: 'lamb', cat: 'protein', emoji: '🐑', en: 'Lamb', zh: '羊肉', iron: true, aliases: ['mutton'],
      prep: { en: 'Simmer lean lamb 30 min until tender and blend with cooking liquid.', zh: '瘦羊肉煮30分钟至软，加原汤打泥。' } },
    { id: 'turkey', cat: 'protein', emoji: '🦃', en: 'Turkey', zh: '火鸡肉', aliases: ['ground turkey'],
      prep: { en: 'Poach until cooked through, then blend finely with a little liquid.', zh: '煮至全熟，加少许汤打成细泥。' } },
    { id: 'liver', cat: 'protein', emoji: '🫀', en: 'Chicken liver', zh: '鸡肝', iron: true, maxPerWeek: 1, aliases: ['liver', 'pork liver', '猪肝', '肝'],
      prep: { en: 'Soak 30 min, boil 15 min until no pink, blend to a paste. Max once a week (very high vitamin A).', zh: '泡水30分钟，煮15分钟至无血色，打成泥。每周最多一次（维生素A很高）。' } },
    { id: 'salmon', cat: 'protein', emoji: '🐟', en: 'Salmon', zh: '三文鱼', allergen: 'fish', aliases: ['三文鱼', '鲑鱼'],
      prep: { en: 'Steam 10 min, then flake with your fingers and remove EVERY bone.', zh: '蒸10分钟，用手指碾碎并仔细去除所有鱼刺。' } },
    { id: 'cod', short: { en: 'white fish', zh: '鳕鱼' }, cat: 'protein', emoji: '🐟', en: 'Cod / white fish', zh: '鳕鱼', allergen: 'fish', aliases: ['cod', 'white fish', 'fish', 'basa', 'tilapia', 'sole', '龙利鱼', '鲈鱼', '鱼', '白鱼'],
      prep: { en: 'Steam 8–10 min until it flakes, check carefully for bones and mash.', zh: '蒸8–10分钟至能碾碎，仔细挑刺后压泥。' } },
    { id: 'shrimp', cat: 'protein', emoji: '🦐', en: 'Shrimp', zh: '虾', allergen: 'shellfish', aliases: ['prawn', 'prawns', '虾仁', '鲜虾'],
      prep: { en: 'Devein, boil 3 min until pink, then mince to a paste.', zh: '去虾线，煮3分钟至变红，剁成虾泥。' } },
    { id: 'tofu', short: { en: 'silken tofu', zh: '豆腐' }, cat: 'protein', emoji: '🧈', en: 'Silken tofu', zh: '嫩豆腐', allergen: 'soy', iron: true, aliases: ['tofu', 'soft tofu', '豆腐', '内酯豆腐'],
      prep: { en: 'Blanch 2 min, then mash — it is naturally silky.', zh: '焯水2分钟后压碎，本身就很嫩滑。' } },
    { id: 'lentils', cat: 'protein', emoji: '🫘', en: 'Red lentils', zh: '红扁豆', iron: true, aliases: ['lentils', 'lentil', '扁豆', '小扁豆'],
      prep: { en: 'Rinse and simmer red lentils 20 min until they collapse into a puree.', zh: '红扁豆洗净煮20分钟至化成泥。' } },
    { id: 'chickpeas', cat: 'protein', emoji: '🫘', en: 'Chickpeas', zh: '鹰嘴豆', iron: true, aliases: ['chickpea', 'garbanzo'],
      prep: { en: 'Use unsalted/rinsed chickpeas, cook until very soft, blend and sieve the skins.', zh: '用无盐的鹰嘴豆，煮至软烂，打泥后过筛去皮。' } },

    // ---------- Dairy ----------
    { id: 'yogurt', short: { en: 'yogurt', zh: '酸奶' }, cat: 'dairy', emoji: '🥛', en: 'Plain yogurt', zh: '原味酸奶', allergen: 'dairy', aliases: ['yogurt', 'yoghurt', 'greek yogurt', '酸奶', '无糖酸奶'],
      prep: { en: 'Full-fat, plain, unsweetened only. Serve at room temperature.', zh: '只用全脂、原味、无糖的酸奶，室温食用。' } },
    { id: 'ricotta', short: { en: 'soft cheese', zh: '软奶酪' }, cat: 'dairy', emoji: '🧀', en: 'Ricotta / cottage cheese', zh: '软奶酪', allergen: 'dairy', aliases: ['ricotta', 'cottage cheese', 'cheese', 'cream cheese', '奶酪', '芝士', '乳清奶酪'],
      prep: { en: 'Choose a low-sodium fresh cheese; stir in a spoonful.', zh: '选低钠的新鲜软奶酪，拌入一小勺。' } },
    { id: 'milk', short: { en: 'milk', zh: '奶' }, cat: 'dairy', emoji: '🍼', en: 'Whole milk / formula', zh: '全脂奶 / 配方奶', allergen: 'dairy', aliases: ['milk', 'formula', 'breast milk', '牛奶', '奶粉', '配方奶', '母乳'],
      prep: { en: 'Use to thin purees or cook porridge instead of water.', zh: '用来稀释果蔬泥或代替水煮粥。' } },

    // ---------- Healthy fats ----------
    { id: 'avocado', cat: 'fat', emoji: '🥑', en: 'Avocado', zh: '牛油果', aliases: ['avocados', '鳄梨'],
      prep: { en: 'Scoop ripe avocado and mash smooth; no cooking needed.', zh: '取熟透的牛油果压成泥，无需加热。' } },
    { id: 'oliveoil', cat: 'fat', emoji: '🫒', en: 'Olive oil', zh: '橄榄油', aliases: ['olive oil', 'oil', '食用油', '核桃油', '亚麻籽油'],
      prep: { en: 'Stir ½ tsp into the finished food for extra calories.', zh: '出锅后拌入半小勺，增加热量。' } },
    { id: 'butter', cat: 'fat', emoji: '🧈', en: 'Unsalted butter', zh: '无盐黄油', allergen: 'dairy', aliases: ['butter', '黄油'],
      prep: { en: 'Melt a small knob into warm porridge or mash.', zh: '在温热的粥或泥里化入一小块。' } },
    { id: 'peanutbutter', short: { en: 'peanut butter', zh: '花生酱' }, cat: 'fat', emoji: '🥜', en: 'Peanut butter (smooth)', zh: '花生酱（顺滑）', allergen: 'peanut', aliases: ['peanut butter', 'peanut', 'peanuts', '花生酱', '花生'],
      prep: { en: '100% peanut, no salt/sugar. Thin ½ tsp with warm water — never give it thick or as whole nuts.', zh: '选100%花生、无盐无糖。半小勺用温水调稀——切勿给浓稠的酱或整粒花生。' } },
    { id: 'tahini', cat: 'fat', emoji: '⚪', en: 'Sesame paste', zh: '芝麻酱', allergen: 'sesame', aliases: ['tahini', 'sesame', '芝麻'],
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
    'tofu', 'yogurt', 'avocado', 'oliveoil'];

  // Foods that are never suggested and trigger a warning if typed in.
  const BLOCKED = [
    { match: ['salt', 'soy sauce', 'sugar', 'honey', 'syrup', 'candy', 'chocolate', 'juice', 'ketchup', 'sausage', 'ham', 'bacon', 'chips', 'crisps', 'popcorn', 'whole nuts', 'grapes', 'grape', 'marshmallow', 'msg', 'stock cube', 'bouillon',
        '盐', '酱油', '糖', '蜂蜜', '糖浆', '糖果', '巧克力', '果汁', '番茄酱', '香肠', '火腿', '培根', '薯片', '爆米花', '坚果', '葡萄', '味精', '鸡精', '蚝油'],
      en: 'Not suitable for a 14-month-old (added salt/sugar or choking risk) — skipped.',
      zh: '不适合14个月宝宝（含盐/糖或有噎呛风险）——已跳过。' },
  ];

  const api = { CATEGORIES, FOODS, ALLERGENS, STARTER_PANTRY, BLOCKED };
  root.TDM_DATA = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
