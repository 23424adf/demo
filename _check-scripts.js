// 语法检查器：抽取 HTML 里的内联 <script>，用 new Function 编译（不执行）
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let bad = 0;

for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m, i = 0;
  while ((m = re.exec(html))) {
    i++;
    const code = m[1];
    try {
      new Function(code);
      console.log(`OK   ${f} script#${i}  (${code.length} chars)`);
    } catch (e) {
      bad++;
      console.log(`FAIL ${f} script#${i}: ${e.message}`);
    }
  }
}
console.log(bad ? `\n${bad} 个脚本有语法错误` : '\n全部通过');
process.exit(bad ? 1 : 0);
