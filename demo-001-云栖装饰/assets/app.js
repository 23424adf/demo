/* ===== 共用逻辑：数据层 + 小工具 =====
   全部存 localStorage，换浏览器/清缓存就回到初始演示数据。
   真交付时，这一层换成后端接口即可，页面不用动。 */

const DB_KEY = 'yq_decoration_v1';
const CHANNELS = ['抖音', '百度', '朋友圈', '转介绍', '小红书'];
const STATUS = {
  new:   { label: '待跟进', cls: 'new' },
  doing: { label: '已联系', cls: 'doing' },
  done:  { label: '已成交', cls: 'done' },
  lost:  { label: '已流失', cls: 'lost' },
};

/* 固定种子的伪随机，保证每次打开演示数据一样 */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const SURNAME = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
const COMMUNITY = ['锦绣江南', '西溪诚园', '万科城', '金色蓝湾', '阳光水岸', '中梁首府', '翡翠公馆', '香樟里'];
const BUDGETS = [80000, 120000, 150000, 180000, 220000, 260000, 300000, 380000];
const NOTES = ['三室两厅，想全包', '旧房翻新，重点改厨卫', '婚房，预算可谈', '只做硬装', '看了两家在比价', '想要北欧风', ''];

function seedData() {
  const rnd = mulberry32(20261031);
  const out = [];
  const today = new Date();
  for (let i = 0; i < 64; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(rnd() * 30));
    const statusRoll = rnd();
    const status = statusRoll > 0.82 ? 'done' : statusRoll > 0.58 ? 'doing' : statusRoll > 0.24 ? 'new' : 'lost';
    out.push({
      id: 'YQ' + String(1000 + i),
      date: d.toISOString().slice(0, 10),
      name: SURNAME[Math.floor(rnd() * SURNAME.length)] + (rnd() > 0.5 ? '先生' : '女士'),
      phone: '1' + (3 + Math.floor(rnd() * 6)) + String(Math.floor(100000000 + rnd() * 899999999)),
      community: COMMUNITY[Math.floor(rnd() * COMMUNITY.length)],
      budget: BUDGETS[Math.floor(rnd() * BUDGETS.length)],
      channel: CHANNELS[Math.floor(rnd() * CHANNELS.length)],
      status,
      note: NOTES[Math.floor(rnd() * NOTES.length)],
    });
  }
  out.sort((a, b) => b.date.localeCompare(a.date));
  return out;
}

const Store = {
  all() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* 数据坏了就重置 */ }
    const data = seedData();
    this.save(data);
    return data;
  },
  save(list) {
    localStorage.setItem(DB_KEY, JSON.stringify(list));
  },
  add(rec) {
    const list = this.all();
    rec.id = 'YQ' + String(2000 + list.length);
    rec.date = rec.date || new Date().toISOString().slice(0, 10);
    list.unshift(rec);
    this.save(list);
    return rec;
  },
  update(id, patch) {
    const list = this.all();
    const i = list.findIndex(r => r.id === id);
    if (i > -1) { list[i] = { ...list[i], ...patch }; this.save(list); }
  },
  remove(id) {
    this.save(this.all().filter(r => r.id !== id));
  },
  reset() {
    localStorage.removeItem(DB_KEY);
    return this.all();
  },
};

/* ---- 小工具 ---- */
const fmtMoney = n => '¥' + Number(n).toLocaleString('zh-CN');
const fmtWan = n => (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgo = n => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const maskPhone = p => p.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
