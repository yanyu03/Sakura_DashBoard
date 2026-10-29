import fs from 'node:fs';
import path from 'node:path';
const files = [
  'README.md', 'README.en.md', 'CONTRIBUTING.md', 'SECURITY.md', 'NOTICE.md', 'CHANGELOG.md',
  ...['README', 'GETTING-STARTED', 'ARCHITECTURE', 'API', 'DEPLOYMENT', 'TESTING', 'PORTFOLIO', 'ROADMAP'].map(name => 'docs/' + name + '.md'),
];
const scripts = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts;
let localLinks = 0, commands = 0;
const failures = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split(/\s+"/)[0].replace(/^<|>$/g, '');
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target.split('#')[0]));
    localLinks++;
    if (!fs.existsSync(resolved)) failures.push(file + ': missing relative target ' + target);
  }
  for (const match of content.matchAll(/npm run ([a-z0-9:._-]+)/g)) {
    commands++;
    if (!Object.hasOwn(scripts, match[1])) failures.push(file + ': missing npm script ' + match[1]);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ documents: files.length, localLinks, npmCommands: commands, passed: true }));
}
