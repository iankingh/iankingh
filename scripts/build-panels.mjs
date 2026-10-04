import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Original, self-contained vector artwork. No external fonts, images or scripts.
// Run `node scripts/build-panels.mjs` after editing the palette or panel content.
const output = new URL('../assets/rpg/', import.meta.url);
const c = {
  bg: '#10151d', panel: '#19212b', inset: '#121a23', border: '#465365',
  gold: '#deb875', goldDim: '#847151', text: '#f6efdf', muted: '#afbac9',
  green: '#88d8ae', cyan: '#88d6e0', purple: '#c1afe8', pink: '#e7a2a5',
};
const escape = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const text = (x, y, s, size = 22, fill = c.text, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${escape(s)}</text>`;
const mono = (x, y, s, size = 20, fill = c.muted, extra = '') => text(x, y, s, size, fill, `font-family="'SFMono-Regular',Consolas,'Liberation Mono',monospace" ${extra}`);
const diamond = (x, y, size = 5, fill = c.gold) => `<path d="M${x} ${y - size}l${size} ${size}-${size} ${size}-${size}-${size}Z" fill="${fill}"/>`;

function frame(w, h, accent = c.gold) {
  return rect(0, 0, w, h, c.bg) + rect(0, 0, w, h, 'url(#tiles)') +
    `<path d="M12 2H${w - 12}l10 10v${h - 24}l-10 10H12L2 ${h - 12}V12Z" fill="none" stroke="${accent}" stroke-width="2"/>` +
    `<path d="M16 10H${w - 16}l6 6v${h - 32}l-6 6H16l-6-6V16Z" fill="none" stroke="${c.goldDim}" opacity=".55"/>` +
    [diamond(12, 12, 4, accent), diamond(w - 12, 12, 4, accent), diamond(12, h - 12, 4, accent), diamond(w - 12, h - 12, 4, accent)].join('');
}

function svg(w, h, title, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
  <title id="title">${escape(title)}</title>
  <desc id="desc">Ian's original pixel RPG profile interface. All text and artwork are part of this SVG.</desc>
  <defs><pattern id="tiles" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0v32" fill="none" stroke="#75849a" stroke-opacity=".055"/></pattern></defs>
  <g font-family="'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif">${content}</g>
</svg>\n`;
}

function sprite(rows, palette, x, y, scale) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" shape-rendering="crispEdges">` + rows.map((row, yy) => [...row].map((v, xx) => palette[v] ? rect(xx, yy, 1, 1, palette[v]) : '').join('')).join('') + '</g>';
}

const adventurer = [
  '.......dddddddd.........', '......dttttttttd........', '.....dttttttttttd.......',
  '.....dttccccctttd.......', '....dttccccccttttd......', '....dtccggggcccttd......',
  '....dcccgwggwgcctd......', '....dcccsssscccttd......', '.....dcssssssctd........',
  '......dsssssstd.........', '.....dttsssssttd........', '....dttttggtttttd.......',
  '...dttttggggtttttd......', '...dtcttggggttcttd......', '..dtccctggggtcctttd.....',
  '..dccsctggggtcscccd.....', '..dccsctbbgbtcscccd.....', '..dccsctbbbgtcssccd.....',
  '...dccctggggtcccd.......', '....dtttggggtttd........', '....dtttggggtttd........',
  '...dttttggggttttd.......', '..dtttttggggtttttd......', '..dtttttggggtttttd......',
  '...dddttddddttddd.......', '.....dbbdbbdbbd.........', '.....dbbdbbdbbd.........',
  '....dbbbdbbdbbbd........', '....dddddddddddd........',
];
const palette = { d: '#0b1119', t: '#538f96', c: '#2c5665', g: '#ddb779', s: '#f0cda2', w: '#b6f1e5', b: '#655044' };

function portrait(x, y, size) {
  const scale = size / 244;
  let art = rect(x, y, size, size, c.inset, `stroke="${c.border}"`) + rect(x + 8, y + 8, size - 16, size - 16, 'url(#tiles)');
  art += `<g transform="translate(${x} ${y}) scale(${scale})">`;
  art += `<path d="M24 192V80h16V64h16V48h132v16h16v16h16v112" fill="#182731" stroke="#304651" stroke-width="2"/>`;
  art += rect(24, 192, 196, 8, '#2a3e46') + rect(16, 200, 212, 12, '#24333f');
  art += sprite(adventurer, palette, 58, 42, 5);
  // Floating code rune and a small companion make the class feel like a craft mage.
  art += rect(165, 101, 38, 30, '#324852', 'stroke="#88d8ae" stroke-width="2"') + mono(184, 122, '</>', 14, c.green, 'text-anchor="middle"');
  art += `<path d="M169 177h28v5h5v17h-38v-17h5Z" fill="#88d8ae"/><path d="M169 187h4v4h-4m16-4h4v4h-4" fill="#19212b"/>`;
  art += diamond(37, 108, 5, c.gold) + diamond(192, 66, 4, c.cyan) + diamond(46, 153, 3, c.green);
  return art + '</g>';
}

function bar(x, y, width, color, label, detail) {
  let s = mono(x, y, label, 18, color) + mono(x + width, y, detail, 17, c.muted, 'text-anchor="end"');
  s += rect(x, y + 12, width, 18, c.inset, `stroke="${c.border}"`);
  const step = (width - 8) / 20;
  for (let i = 0; i < 20; i++) s += rect(x + 4 + step * i, y + 16, step - 3, 10, color, `opacity="${i > 16 ? '.48' : '.85'}"`);
  return s;
}

function hero(mobile) {
  const w = mobile ? 600 : 1000;
  const h = mobile ? 830 : 466;
  let s = frame(w, h);
  s += mono(34, 44, "ADVENTURER'S LOG", mobile ? 23 : 19, c.gold, 'letter-spacing="2"');
  s += mono(w - 34, 44, 'SAVE 01', mobile ? 20 : 17, c.muted, 'text-anchor="end"');
  s += `<path d="M28 65H${w - 28}" stroke="${c.goldDim}"/>`;
  if (mobile) {
    s += portrait(188, 92, 224);
    s += mono(300, 352, 'PLAYER / @iankingh', 24, c.gold, 'text-anchor="middle"');
    s += mono(300, 428, 'IAN', 72, c.text, 'text-anchor="middle" font-weight="700" letter-spacing="8"');
    s += text(300, 476, '全端工匠 · 程式冒險者', 29, c.text, 'text-anchor="middle"');
    s += mono(300, 516, 'FULL-STACK ARTIFICER', 22, c.cyan, 'text-anchor="middle" letter-spacing="1"');
    s += bar(46, 564, 508, c.green, 'HP', 'BUILD · TEST · REPEAT');
    s += bar(46, 635, 508, c.cyan, 'MP', 'CURIOSITY · ALWAYS ON');
    s += `<path d="M28 694H572" stroke="${c.goldDim}"/>`;
    s += text(300, 744, '打造工具，探索技術，記錄冒險。', 26, c.text, 'text-anchor="middle"');
    s += mono(300, 789, 'NEXT LEVEL / KEEP LEARNING', 21, c.gold, 'text-anchor="middle"');
  } else {
    s += portrait(42, 94, 252);
    s += mono(168, 382, '@iankingh', 22, c.gold, 'text-anchor="middle"');
    s += mono(340, 112, 'CHARACTER / THE BUILDER', 18, c.gold, 'letter-spacing="1.5"');
    s += mono(336, 195, 'IAN', 84, c.text, 'font-weight="700" letter-spacing="8"');
    s += rect(792, 134, 160, 42, c.panel, `stroke="${c.goldDim}"`) + mono(872, 161, 'LV. UP ↗', 20, c.gold, 'text-anchor="middle"');
    s += text(340, 239, '全端工匠 · 程式冒險者', 29);
    s += mono(340, 272, 'FULL-STACK ARTIFICER', 21, c.cyan, 'letter-spacing="1"');
    s += bar(340, 310, 608, c.green, 'HP', 'BUILD · TEST · REPEAT');
    s += bar(340, 369, 608, c.cyan, 'MP', 'CURIOSITY · ALWAYS ON');
    s += `<path d="M28 416H972" stroke="${c.goldDim}"/>`;
    s += text(42, 446, '打造工具，探索技術，記錄冒險。', 21);
    s += mono(956, 446, 'NEXT LEVEL / KEEP LEARNING', 17, c.gold, 'text-anchor="end"');
  }
  return svg(w, h, 'Ian — 全端工匠的 RPG 角色面板', s);
}

function icon(type, x, y, size, accent) {
  const paths = {
    forge: '<path d="M2 9h24v5h-4l-5 6h-7l-4-6H2Zm8 11h7v4h4v3H6v-3h4ZM20 3h9v4h-9v5h-4V7h4Z"/>',
    tower: '<path d="M12 1h8v4h4v8h-4v4h-8v-4H8V5h4Zm2 16h4v5h7v4H7v-4h7ZM3 27h26v3H3Z"/>',
    tavern: '<path d="M1 13h30v4h-3v6h-4v4H8v-4H4v-6H1ZM4 28h24v3H4ZM8 1h3v4H8v4H5V5h3Zm8 0h3v4h-3v4h-3V4h3Zm8 1h3v4h-3v4h-3V5h3Z"/>',
    archive: '<path d="M1 5h11v3h3v22h-3v-3H1Zm18 0h12v22H20v3h-3V8h2ZM4 10h6v3H4Zm18 0h6v3h-6Z"/>',
    backend: '<path d="M4 3h24v7H4Zm0 10h24v7H4Zm0 10h24v7H4Z"/><path d="M7 5h3v3H7m0 8h3v3H7m0 8h3v3H7" fill="#10151d"/>',
    frontend: '<path d="M13 3h4L11 29H7ZM6 8h4l-6 8 6 8H6l-6-8Zm18 0h-4l6 8-6 8h4l6-8Z"/>',
    systems: '<path d="M11 1h10v10H11ZM1 21h10v10H1Zm20 0h10v10H21ZM14 11h4v5h10v5h-4v-2H8v2H4v-5h10Z"/>',
    passive: '<path d="M13 1h6v10h10v6H19v10h-6V17H3v-6h10ZM24 23h5v5h-5Z"/>',
  };
  return `<g transform="translate(${x} ${y}) scale(${size / 32})" fill="${accent}" shape-rendering="crispEdges">${paths[type]}</g>`;
}

const quests = [
  { file: 'forge', title: '工匠鍛造所', repo: 'java-tools', tag: '01 / THE FORGE', color: c.gold, line1: 'Java 21 多模組工具庫', line2: 'HTTP · Excel · Security · Redis · Jakarta', loot: 'LOOT / REUSABLE TOOLS', badge: 'JAVA 21' },
  { file: 'tower', title: '元件法師塔', repo: 'Angular-demo', tag: '02 / THE MAGE TOWER', color: c.cyan, line1: '表單、路由、HTTP、Material 與測試', line2: 'Standalone · Zoneless · Vitest', loot: 'LOOT / UI SPELLS', badge: 'ANGULAR' },
  { file: 'tavern', title: '冒險者食堂', repo: 'easy-eat', tag: '03 / THE TAVERN', color: c.green, line1: '訂餐流程、訂單與後台管理', line2: 'Vue 3 · TypeScript · Pinia · Mock API', loot: 'LOOT / PRODUCT FLOWS', badge: 'VUE 3' },
  { file: 'archive', title: '旅人藏書庫', repo: 'blog', tag: '04 / THE ARCHIVE', color: c.purple, line1: '繁體中文技術筆記與實作心得', line2: 'Hugo · NexT · Web · Java', loot: 'LOOT / SHARED KNOWLEDGE', badge: 'HUGO' },
];

function quest(q, mobile) {
  const w = mobile ? 600 : 1000;
  const h = mobile ? 348 : 224;
  let s = frame(w, h, q.color);
  if (mobile) {
    s += rect(28, 28, 92, 92, c.panel, `stroke="${c.border}"`) + icon(q.file, 48, 48, 52, q.color);
    s += mono(144, 47, q.tag, 19, q.color);
    s += text(144, 87, q.title, 33, c.text, 'font-weight="600"');
    s += mono(144, 116, q.repo, 23);
    s += text(32, 169, q.line1, 25);
    s += mono(32, 211, q.line2, q.file === 'forge' ? 18 : 20, c.muted);
    s += `<path d="M28 238H572" stroke="${c.border}"/>`;
    s += mono(32, 276, q.loot, 20, q.color);
    s += mono(32, 317, 'ENTER QUEST →', 18, c.text);
  } else {
    s += rect(30, 30, 144, 146, c.panel, `stroke="${c.border}"`) + icon(q.file, 64, 57, 76, q.color);
    s += mono(102, 160, q.badge, 16, q.color, 'text-anchor="middle"');
    s += mono(202, 42, q.tag, 17, q.color, 'letter-spacing="1"');
    s += text(202, 83, q.title, 34, c.text, 'font-weight="600"');
    s += mono(478, 81, q.repo, 25, c.muted);
    s += text(202, 121, q.line1, 24);
    s += mono(202, 153, q.line2, 20);
    s += `<path d="M202 169H964" stroke="${c.border}"/>`;
    s += mono(202, 203, q.loot, 16, q.color);
    s += mono(956, 203, 'ENTER QUEST →', 16, c.text, 'text-anchor="end"');
  }
  return svg(w, h, `${q.title} — ${q.repo}`, s);
}

const skills = [
  { type: 'backend', title: '後端鍛造', en: 'BACKEND', lines: ['Java · Spring Boot', 'Gradle · API design'], color: c.gold },
  { type: 'frontend', title: '前端法術', en: 'FRONTEND', lines: ['TypeScript', 'Angular · Vue'], color: c.cyan },
  { type: 'systems', title: '系統裝備', en: 'SYSTEMS', lines: ['Docker · Redis', 'Kafka · Integration'], color: c.green },
  { type: 'passive', title: '被動技能', en: 'PASSIVES', lines: ['Testing · Refactoring', 'Hugo · Tech notes'], color: c.purple },
];

function skillTree(mobile) {
  const w = mobile ? 600 : 1000;
  const h = mobile ? 564 : 260;
  let s = frame(w, h);
  s += mono(30, 40, 'SKILL TREE / EQUIPPED ABILITIES', mobile ? 21 : 18, c.gold);
  skills.forEach((skill, i) => {
    const x = mobile ? 28 + (i % 2) * 280 : 28 + i * 238;
    const y = mobile ? 66 + Math.floor(i / 2) * 236 : 62;
    const cw = mobile ? 264 : 230;
    const ch = mobile ? 220 : 170;
    s += rect(x, y, cw, ch, c.panel, `stroke="${c.border}"`);
    s += rect(x, y, cw, 3, skill.color);
    s += icon(skill.type, x + 18, y + 20, mobile ? 37 : 28, skill.color);
    s += mono(x + 67, y + 42, skill.en, mobile ? 21 : 17, skill.color);
    s += text(x + 18, y + (mobile ? 95 : 79), skill.title, mobile ? 29 : 26);
    s += mono(x + 18, y + (mobile ? 143 : 117), skill.lines[0], mobile ? 18 : 16);
    s += mono(x + 18, y + (mobile ? 177 : 145), skill.lines[1], mobile ? 18 : 16);
  });
  return svg(w, h, 'Ian 的四系技能樹', s);
}

await mkdir(output, { recursive: true });
for (const mobile of [false, true]) {
  const suffix = mobile ? '-mobile' : '';
  await writeFile(new URL(`character${suffix}.svg`, output), hero(mobile));
  await writeFile(new URL(`skills${suffix}.svg`, output), skillTree(mobile));
  for (const q of quests) await writeFile(new URL(`${q.file}${suffix}.svg`, output), quest(q, mobile));
}
console.log(`Generated 12 RPG panels in ${fileURLToPath(output)}`);
