// Lists the family dish photos in gallery/ into gallery/index.json for the app.
//
// File name = dish name, with optional tags in square brackets:
//   "番茄炒蛋 [晚餐 大宝].jpg"   → title "番茄炒蛋", tags ["晚餐", "大宝"]
// An optional text file with the same name ("番茄炒蛋 [晚餐 大宝].txt") holds the recipe notes.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'gallery');
const IMAGE = /\.(jpe?g|png|webp|gif)$/i;

function parseName(file) {
  const base = file.replace(/\.[^.]+$/, '');
  const tags = [];
  const title = base.replace(/[[【]([^\]】]*)[\]】]/g, (_, inner) => {
    inner.split(/[\s,，、]+/).filter(Boolean).forEach(x => tags.push(x));
    return ' ';
  }).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return { title: title || base, tags };
}

function build() {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const files = fs.readdirSync(dir).filter(f => IMAGE.test(f)).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const list = files.map(file => {
    const { title, tags } = parseName(file);
    const notesFile = path.join(dir, file.replace(/\.[^.]+$/, '.txt'));
    const notes = fs.existsSync(notesFile) ? fs.readFileSync(notesFile, 'utf8').trim() : '';
    return { file, title, tags, notes };
  });
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(list, null, 2) + '\n');
  return list;
}

if (require.main === module) {
  const list = build();
  console.log(`gallery/index.json: ${list.length} photo${list.length === 1 ? '' : 's'}`);
}
module.exports = { parseName, build };
