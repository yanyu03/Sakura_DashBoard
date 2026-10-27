import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import Database from 'better-sqlite3';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const baselineDir = path.join(root, '.local-data', 'baselines', stamp);
fs.mkdirSync(baselineDir, { recursive: true });
const dbSource = path.resolve(root, process.env.SAKURA_DATA_DIR || '.local-data', 'sakura_edu.sqlite');
const db = new Database(dbSource, { readonly: true, fileMustExist: true });
const backupPath = path.join(baselineDir, 'database.sqlite');
await db.backup(backupPath); db.close();
const restoredPath = path.join(baselineDir, 'restore-check.sqlite');
fs.copyFileSync(backupPath, restoredPath);
const restored = new Database(restoredPath, { readonly: true });
const integrity = restored.pragma('integrity_check', { simple: true });
if (integrity !== 'ok') throw new Error('Baseline restore integrity check failed');
const tables = restored.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as {name:string}[];
const counts = Object.fromEntries(tables.map(({name}) => [name, (restored.prepare(`SELECT COUNT(*) AS n FROM "${name}"`).get() as {n:number}).n]));
restored.close();
const hash = (file: string) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourceFiles = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {cwd:root,encoding:'utf8'}).split('\0').filter(Boolean))];
const manifest = sourceFiles.filter(file => fs.existsSync(path.join(root,file)) && fs.statSync(path.join(root,file)).isFile()).map(file => {
  const destination = path.join(baselineDir,'source',file);
  fs.mkdirSync(path.dirname(destination),{recursive:true}); fs.copyFileSync(path.join(root,file),destination);
  return {path:file,sha256:hash(destination)};
});
fs.writeFileSync(path.join(baselineDir,'working-tree.patch'),execFileSync('git',['diff','--binary'],{cwd:root}));
const events: {id:string;file:string;line:number;event:string;label:string;handler:string;classification:string}[] = [];
for(const file of sourceFiles.filter(file=>file.startsWith('src/')&&file.endsWith('.tsx'))){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  for(const match of text.matchAll(/\b(onClick|onSubmit|onChange|onDoubleClick|onKeyDown)\s*=\s*/g)){
    const start=match.index!+match[0].length;
    let end=start;
    if(text[start]==='{'){
      let depth=0; let quote='';
      for(;end<text.length;end++){
        const ch=text[end];
        if(quote){ if(ch==='\\'){end++;continue;} if(ch===quote)quote='';continue; }
        if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
        if(ch==='{')depth++;
        if(ch==='}'&&--depth===0){end++;break;}
      }
    } else end=text.indexOf(' ',start);
    const handler=text.slice(start,end);
    const label=text.slice(Math.max(0,text.lastIndexOf('<',match.index)),Math.min(text.length,end+100)).replace(/\s+/g,' ').slice(0,250);
    const classification=/showToast\(/.test(handler)&&!/(sakuraApi|await |set[A-Z])/.test(handler)?'演示/未完成':
      /(sakuraApi|handle[A-Z])/.test(handler)?'已接线，业务规则待验收':
      /set[A-Z]|onChangeTheme|onClose|onReturn|scrollTo|onNavigate|onOpen/.test(handler)?'真实界面交互':'演示/未完成';
    events.push({id:`UI-${String(events.length+1).padStart(3,'0')}`,file,line:text.slice(0,match.index).split('\n').length,event:match[1],label,handler,classification});
  }
}
const server=fs.readFileSync(path.join(root,'server.ts'),'utf8');
const endpoints=[...server.matchAll(/app\.(get|post|put|patch|delete)\('([^']+)'/g)].map((match,index)=>({id:`API-${String(index+1).padStart(3,'0')}`,method:match[1].toUpperCase(),path:match[2],line:server.slice(0,match.index).split('\n').length,classification:'真实 SQLite 接口；权限/业务规则见阶段待办'}));
const metadata={createdAt:new Date().toISOString(),baselineDirectory:baselineDir,databaseSource:dbSource,backupSha256:hash(backupPath),restoreIntegrity:integrity,tableCounts:counts,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),sourceFiles:manifest};
fs.writeFileSync(path.join(baselineDir,'manifest.json'),JSON.stringify(metadata,null,2));
fs.mkdirSync(path.join(root,'docs','verification','business'),{recursive:true});
fs.writeFileSync(path.join(root,'docs','verification','business','baseline.json'),JSON.stringify({...metadata,sourceFiles:manifest.length},null,2));
fs.writeFileSync(path.join(root,'docs','verification','business','inventory.json'),JSON.stringify({events,endpoints},null,2));
const escape=(text:string)=>text.replace(/\|/g,'\\|').replace(/`/g,"'");
let md='# 阶段 0：入口与接口清单\n\n按源码提取 JSX 事件声明；动态列表按声明位置记录，运行时实例不重复计数。分类是保守的源码分流，不能把“已接线”解释为业务已验收。业务完成状态以 BUSINESS-PROGRESS.md 的阶段验收为准。\n\n';
md+=`数据库恢复检查：${integrity}。${manifest.length} 个源文件已保存到本地基线目录；完整路径见 verification/business/baseline.json。\n\n`;
md+='## 接口\n\n| ID | 方法 | 路由 | 源码位置 | 当前状态 |\n|---|---|---|---|---|\n';
for(const endpoint of endpoints)md+=`| ${endpoint.id} | ${endpoint.method} | ${endpoint.path} | server.ts:${endpoint.line} | ${endpoint.classification} |\n`;
md+='\n## 页面事件\n\n| ID | 源码位置 | 事件 | 分类 | 声明摘要 |\n|---|---|---|---|---|\n';
for(const event of events)md+=`| ${event.id} | ${event.file}:${event.line} | ${event.event} | ${event.classification} | ${escape(event.label)} |\n`;
fs.writeFileSync(path.join(root,'docs','BUSINESS-INVENTORY.md'),md);
console.log(JSON.stringify({baselineDir,integrity,sourceFiles:manifest.length,events:events.length,endpoints:endpoints.length},null,2));
