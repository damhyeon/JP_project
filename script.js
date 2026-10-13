/* MOGU — allergen check for Japan travellers
   A Korean / English speaker ticks every food they are allergic to, presses 完了,
   and a Japanese person reads the result to see what the person cannot eat. */

// [ 한국어, English, 日本語, allergen? ]
const FOODS = {
  seafood: { ko:'해산물', en:'Seafood', ja:'海産物', items:[
    ['새우','Shrimp','エビ','えび'], ['게','Crab','カニ','かに'],
    ['전복','Abalone','アバロネ','貝類'], ['오징어','Squid','イカ','貝類'],
    ['연어 알','Salmon roe','サケいくら','卵'], ['연어','Salmon','サケ'],
    ['고등어','Mackerel','サバ'], ['참치','Tuna','マグロ']
  ]},
  meat: { ko:'육류', en:'Meat', ja:'肉類', items:[
    ['소고기','Beef','牛肉','牛肉'], ['돼지고기','Pork','豚肉','豚肉'],
    ['양고기','Lamb','羊肉','羊肉'], ['닭고기','Chicken','鶏肉','鶏肉'],
    ['오리고기','Duck','アヒル肉','鴨肉']
  ]},
  grain: { ko:'곡류', en:'Grains', ja:'穀類', items:[
    ['밀','Wheat','小麦','小麦'], ['메밀','Buckwheat','そば','そば'],
    ['보리','Barley','大麦'], ['쌀','Rice','コメ'],
    ['현미','Brown rice','玄米'], ['옥수수','Corn','トウモロコシ'],
    ['참깨','Sesame','胡麻','ごま']
  ]},
  nuts: { ko:'견과 및 콩류', en:'Nuts & beans', ja:'ナッツ・豆類', items:[
    ['아몬드','Almond','アーモンド','アーモンド'], ['땅콩','Peanut','ピーナッツ','落花生'],
    ['호두','Walnut','クルミ','くるみ'], ['캐슈넛','Cashew','カシューナッツ','ピーナッツ'],
    ['대두','Soybean','大豆','大豆'], ['완두콩','Pea','エンドウ豆']
  ]},
  fruit: { ko:'과일', en:'Fruits', ja:'果物', items:[
    ['사과','Apple','リンゴ'], ['배','Pear','ナシ'], ['딸기','Strawberry','イチゴ'],
    ['포도','Grape','ブドウ'], ['복숭아','Peach','モモ','桃'],
    ['키위','Kiwi','キウイ'], ['오렌지','Orange','オレンジ'], ['바나나','Banana','バナナ']
  ]},
  dairy: { ko:'유제품 및 계란', en:'Dairy & eggs', ja:'乳製品・卵', items:[
    ['우유','Milk','牛乳','乳'], ['치즈','Cheese','チーズ','乳'],
    ['요거트','Yogurt','ヨーグルト','乳'], ['버터','Butter','バター','乳'],
    ['생크림','Cream','クリーム','乳'], ['계란','Egg','卵','卵'],
    ['마요네즈','Mayonnaise','マヨネーズ','卵']
  ]}
};

/* Japan's mandatory allergen labelling order */
const ORDER = ['えび','かに','くるみ','小麦','そば','卵','乳','落花生','大豆','ごま',
               'アーモンド','ピーナッツ','牛肉','豚肉','羊肉','鶏肉','鴨肉','貝類','桃'];

const LANGS = ['한국어','English'];

/* UI strings follow the picker's language */
const T = {
  '한국어':{
    sub:'알레르기가 있는 식품을 모두 선택해 주세요', done:'완료',
    clear:'전체 해제', langTitle:'언어설정', langOk:'확인', close:'닫기',
    sel:n=>`${n}개 선택`,
    vOk:'알겠습니다', vNg:'어려울 것 같습니다'
  },
  'English':{
    sub:'Tick every food you are allergic to', done:'Done',
    clear:'Clear all', langTitle:'Language', langOk:'Confirm', close:'Close',
    sel:n=>`${n} selected`,
    vOk:'Understood', vNg:'It seems difficult'
  }
};

/* the result card is read by a Japanese person (Figma 카드 / 카드수락 / 카드거절) */
const JA = {
  hit1:'アレルギーがあります',
  hit2:'除外できますか？',
  none:'選択した食品にアレルギー成分はありません',
  close:'閉じる',
  ok:'承知しました',
  ng:'難しいと思われます'
};

const $ = s => document.querySelector(s);
const UI      = { '한국어':0, 'English':1 };
const CATNAME = { '한국어':'ko', 'English':'en' };

let cat = 'seafood';
let lang = '한국어';
const picked = new Set();
/* the restaurant staff's answer: null | 'ok' | 'ng'.
   It turns the result card into the answer — title in the user's language and
   the list recoloured — and resets whenever the selection changes, because a
   new selection is a new question. */
let verdict = null;
let resultHasAllergen = false;

const nameOf = item => item[UI[lang]];
const catOf  = c => c[CATNAME[lang]];

/* ---- render ---- */
function renderTags(){
  $('#tags').innerHTML = Object.keys(FOODS).map(k => {
    const n = FOODS[k].items.filter(it => picked.has(it[0])).length;
    return `<button class="tag${k===cat?' on':''}" data-cat="${k}">${catOf(FOODS[k])}` +
           `${n ? `<i>${n}</i>` : ''}</button>`;
  }).join('');
}

/* ---- card artwork ----
   Drop a file into img/<slug>.webp and add its slug to IMAGES.
   Cards NOT listed here render the emoji instead, so a missing file never
   produces a 404 or a broken-image box. */
const EMOJI = {
  '새우':'🦐','게':'🦀','전복':'🐚','오징어':'🦑','연어 알':'🟠','연어':'🍣',
  '고등어':'🐠','참치':'🍙',
  '소고기':'🥩','돼지고기':'🥓','양고기':'🍖','닭고기':'🍗','오리고기':'🦆',
  '밀':'🌾','메밀':'🌾','보리':'🌾','쌀':'🍚','현미':'🍚','옥수수':'🌽','참깨':'🫘',
  '아몬드':'🌰','땅콩':'🥜','호두':'🌰','캐슈넛':'🌰','대두':'🫘','완두콩':'🫛',
  '사과':'🍎','배':'🍐','딸기':'🍓','포도':'🍇','복숭아':'🍑','키위':'🥝','오렌지':'🍊','바나나':'🍌',
  '우유':'🥛','치즈':'🧀','요거트':'🥣','버터':'🧈','생크림':'🍮','계란':'🥚','마요네즈':'🧴'
};
const IMAGES = [];   // e.g. ['shrimp','crab','abalone']
const slugOf  = en => en.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const hasImg  = en => IMAGES.indexOf(slugOf(en)) !== -1;

function renderGrid(){
  $('#grid').innerHTML = FOODS[cat].items.map(it =>
    `<button class="food${picked.has(it[0])?' on':''}" data-food="${it[0]}">` +
      `<span class="food-emoji" aria-hidden="true">${EMOJI[it[0]] || '🍽'}</span>` +
      (hasImg(it[1]) ? `<img class="food-img" src="img/${slugOf(it[1])}.webp" alt="" loading="lazy" decoding="async">` : '') +
      `<b>${nameOf(it)}</b></button>`
  ).join('');
  renderBar();
}

function renderBar(){
  $('#count').textContent = T[lang].sel(picked.size);
  $('#clear').disabled = !picked.size;
}

function renderLangList(){
  $('#langList').innerHTML = LANGS.map(l =>
    `<li class="${l===lang?'on':''}" data-lang="${l}">${l}</li>`).join('');
}

function applyLang(){
  const t = T[lang];
  $('#subtitle').textContent = t.sub;
  $('#done').textContent = t.done;
  $('#clear').textContent = t.clear;
  $('#langOk').textContent = t.langOk;
  $('#langTitle').textContent = t.langTitle;
  document.title = 'MOGU — ' + t.sub;
  document.querySelectorAll('.modal-close')
    .forEach(b => b.setAttribute('aria-label', t.close));
  renderTags();
  renderGrid();
  renderLangList();
  /* keep an open result card in sync when the language is switched */
  if (!$('#result').hidden) showResult();
}

/* ---- result card: one card, three states (Figma 카드 / 카드수락 / 카드거절)
        • no verdict yet — the Japanese question, orange list, two buttons
        • after 承知しました — title in the user's language, list blue
        • after 難しいと思われます — title in the user's language, list red ---- */
function showResult(){
  const rows = Object.keys(FOODS)
    .flatMap(k => FOODS[k].items.filter(it => picked.has(it[0])));
  resultHasAllergen = rows.some(r => r[3]);

  /* the staff was only asked about the foods that carry an allergen */
  const items = resultHasAllergen ? rows.filter(r => r[3]) : rows;
  $('#resultList').innerHTML = items.map(r => `<li>${r[2]}</li>`).join('');

  if (!resultHasAllergen){                       // nothing the staff can decide
    $('#resultTitle').textContent = JA.none;
    $('#ok').textContent = JA.close;
    $('#ok').className = 'btn btn-primary';
    $('#ng').hidden = true;
  } else {
    $('#resultTitle').innerHTML = verdict
      ? T[lang][verdict === 'ok' ? 'vOk' : 'vNg']
      : JA.hit1 + '<br>' + JA.hit2;
    $('#ok').textContent = JA.ok;
    $('#ok').className = 'btn btn-blue';
    $('#ng').textContent = JA.ng;
    $('#ng').hidden = false;
  }

  const card = $('#resultCard');
  card.classList.toggle('is-ok', verdict === 'ok');
  card.classList.toggle('is-ng', verdict === 'ng');
  $('#result').hidden = false;
}

/* ---- actions ---- */
$('#tags').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  cat = b.dataset.cat;
  renderTags();
  renderGrid();
});

$('#grid').addEventListener('click', e => {
  const b = e.target.closest('[data-food]');
  if (!b) return;
  const n = b.dataset.food;
  picked.has(n) ? picked.delete(n) : picked.add(n);
  verdict = null;            // a new selection invalidates the staff's answer
  renderTags();
  renderGrid();
});

/* Belt-and-braces: image load errors do not bubble, so listen in the capture
   phase. If a listed file goes missing the emoji layer shows through. */
$('#grid').addEventListener('error', e => {
  const img = e.target.closest && e.target.closest('.food-img');
  if (img) img.remove();
}, true);

$('#clear').addEventListener('click', () => {
  picked.clear();
  verdict = null;
  renderTags();
  renderGrid();
});

$('#done').addEventListener('click', showResult);

$('#langOpen').addEventListener('click', () => { renderLangList(); $('#lang').hidden = false; });

$('#langList').addEventListener('click', e => {
  const b = e.target.closest('[data-lang]');
  if (!b) return;
  lang = b.dataset.lang;
  applyLang();
});

/* a staff button turns the SAME card into the answer — the list recolours and
   the title switches to the user's language, and the card stays open so the
   person can read it out */
$('#ok').addEventListener('click', () => {
  if (!resultHasAllergen){             // plain acknowledgement, nothing to decide
    $('#result').hidden = true;
    verdict = null;
    return;
  }
  verdict = 'ok';
  showResult();
});

$('#ng').addEventListener('click', () => {
  verdict = 'ng';
  showResult();
});

document.addEventListener('click', e => {
  const c = e.target.closest('[data-close]');
  if (c){
    $('#' + c.dataset.close).hidden = true;
    if (c.dataset.close === 'result') verdict = null;
  }
  if (e.target.classList.contains('overlay')){
    e.target.hidden = true;
    if (e.target.id === 'result') verdict = null;
  }
});

applyLang();
