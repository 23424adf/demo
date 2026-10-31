/* ===== 共用逻辑：数据层 + 小工具（齿间口腔版） =====
   全部存 localStorage。真交付时把 Store 换成接口，页面不用动。 */

const DB_KEY = 'cq_dental_v1';
const CHANNELS = ['抖音', '大众点评', '朋友圈', '老客转介绍', '百度'];
const STATUS = {
  new:     { label: '待跟进', cls: 'new' },
  doing:   { label: '已联系', cls: 'doing' },
  visited: { label: '已到院', cls: 'doing' },
  done:    { label: '已成交', cls: 'done' },
  lost:    { label: '已流失', cls: 'lost' },
};

/* 固定种子，保证演示数据每次一样 */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const SURNAME = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
const PROJECTS = ['种植牙', '隐形正畸', '牙齿美白', '洗牙洁牙', '根管治疗', '儿童齿科'];
const PRICES = [800, 1500, 3000, 6000, 12000, 25000];
const NOTES = ['缺两颗，问种植','想整牙，比过价','问美白多久见效','周末想洗牙','带孩子看牙','牙疼，急'];

function seedData() {
  const rnd = mulberry32(20261101);
  const out = [];
  const today = new Date();
  for (let i = 0; i < 58; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(rnd() * 30));
    const r = rnd();
    const status = r > 0.86 ? 'done' : r > 0.68 ? 'visited' : r > 0.44 ? 'doing' : r > 0.2 ? 'new' : 'lost';
    out.push({
      id: 'CJ' + String(1000 + i),
      date: d.toISOString().slice(0, 10),
      name: SURNAME[Math.floor(rnd() * SURNAME.length)] + (rnd() > 0.45 ? '先生' : '女士'),
      phone: '1' + (3 + Math.floor(rnd() * 6)) + String(Math.floor(100000000 + rnd() * 899999999)),
      community: PROJECTS[Math.floor(rnd() * PROJECTS.length)],
      budget: PRICES[Math.floor(rnd() * PRICES.length)],
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
    } catch (e) { /* 坏了就重置 */ }
    const data = seedData();
    this.save(data);
    return data;
  },
  save(list) { localStorage.setItem(DB_KEY, JSON.stringify(list)); },
  add(rec) {
    const list = this.all();
    rec.id = 'CJ' + String(2000 + list.length);
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
  remove(id) { this.save(this.all().filter(r => r.id !== id)); },
  reset() { localStorage.removeItem(DB_KEY); return this.all(); },
};

const fmtMoney = n => '¥' + Number(n).toLocaleString('zh-CN');
const fmtWan = n => n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, '') + '万' : Number(n).toLocaleString('zh-CN');
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgo = n => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const maskPhone = p => p.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
