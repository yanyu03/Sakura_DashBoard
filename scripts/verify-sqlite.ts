import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import Database from 'better-sqlite3';
import { installBusinessFixtures } from './test-fixtures';

const root = process.cwd();
fs.mkdirSync(path.join(root, '.local-data'), { recursive: true });
const testDir = fs.mkdtempSync(path.join(root, '.local-data', 'sqlite-verification-'));
process.env.SAKURA_DATA_DIR = testDir;
const { sqliteDb: db, SQLITE_DB_PATH: dbPath, initAndSeedSqliteDatabase } = await import('../server/sqliteDb');
const evidenceDir = path.join(root, 'docs', 'verification', 'sqlite');
fs.mkdirSync(evidenceDir, { recursive: true });
const checks: { name: string; status: 'PASS' | 'FAIL'; detail?: unknown; error?: string }[] = [];
const observations: Record<string, unknown> = {};
let child: ChildProcess | undefined;
let inspector: Database.Database | undefined;

async function check(name: string, fn: () => unknown | Promise<unknown>) {
  try {
    const detail = await fn();
    checks.push({ name, status: 'PASS', ...(detail !== undefined ? { detail } : {}) });
    console.log(`PASS ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    checks.push({ name, status: 'FAIL', error: message });
    console.log(`FAIL ${name}: ${message}`);
  }
}

const tables = () => (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as { name: string }[]).map(r => r.name);
const markerId = 'verify-persistence';
const insertLesson = db.prepare('INSERT INTO lesson_plans (id, title, summary, author_name) VALUES (?, ?, ?, ?)');

try {
  await check('engine / initialization and migrated physical schema', () => {
    assert.equal(tables().length, 36); // 35 application tables + migration ledger.
    assert.equal(db.pragma('journal_mode', { simple: true }), 'wal');
    assert.equal(db.pragma('foreign_keys', { simple: true }), 1);
    return { version: db.prepare('SELECT sqlite_version() AS version').get(), tables: tables() };
  });
  await check('engine / integrity and foreign-key check', () => {
    assert.equal(db.pragma('integrity_check', { simple: true }), 'ok');
    assert.deepEqual(db.pragma('foreign_key_check'), []);
    observations.foreignKeyDefinitions = tables().flatMap(table => db.pragma(`foreign_key_list(${table})`)).length;
    observations.explicitIndexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all();
  });
  await check('engine / parameterized Unicode CRUD', () => {
    const text = "教案 O'Reilly：赤壁赋 🌸";
    insertLesson.run('verify-crud', text, '中文换行\n第二行', '验证教师');
    assert.equal((db.prepare('SELECT title FROM lesson_plans WHERE id=?').get('verify-crud') as { title: string }).title, text);
    assert.equal(db.prepare('UPDATE lesson_plans SET title=? WHERE id=?').run('修改后', 'verify-crud').changes, 1);
    assert.equal(db.prepare('DELETE FROM lesson_plans WHERE id=?').run('verify-crud').changes, 1);
    assert.equal(db.prepare('SELECT * FROM lesson_plans WHERE id=?').get('verify-crud'), undefined);
  });
  insertLesson.run(markerId, '跨进程持久化标记', '测试记录', '验证教师');
  await check('engine / primary-key and NOT NULL constraints', () => {
    assert.throws(() => insertLesson.run(markerId, '重复主键', '', '验证教师'), /UNIQUE/);
    assert.throws(() => insertLesson.run('verify-null', null, '', '验证教师'), /NOT NULL/);
  });
  await check('engine / transaction commit and rollback', () => {
    const update = db.prepare('UPDATE lesson_plans SET summary=? WHERE id=?');
    assert.throws(db.transaction(() => { update.run('不应提交', markerId); throw new Error('rollback sentinel'); }), /rollback sentinel/);
    assert.equal((db.prepare('SELECT summary FROM lesson_plans WHERE id=?').get(markerId) as { summary: string }).summary, '测试记录');
    db.transaction(() => update.run('已提交', markerId))();
    assert.equal((db.prepare('SELECT summary FROM lesson_plans WHERE id=?').get(markerId) as { summary: string }).summary, '已提交');
  });
  await check('engine / WAL concurrent reader and writer', () => {
    const reader = new Database(dbPath, { readonly: true });
    const writer = new Database(dbPath, { timeout: 30 });
    try {
      db.exec('BEGIN IMMEDIATE');
      db.prepare('UPDATE lesson_plans SET summary=? WHERE id=?').run('并发写入', markerId);
      assert.equal((reader.prepare('SELECT summary FROM lesson_plans WHERE id=?').get(markerId) as { summary: string }).summary, '已提交');
      assert.throws(() => writer.prepare('UPDATE lesson_plans SET summary=? WHERE id=?').run('第二写入者', markerId), /locked/);
      db.exec('COMMIT');
      assert.equal((reader.prepare('SELECT summary FROM lesson_plans WHERE id=?').get(markerId) as { summary: string }).summary, '并发写入');
    } finally {
      if (db.inTransaction) db.exec('ROLLBACK');
      reader.close(); writer.close();
    }
  });
  await check('engine / repeated initialization preserves records', () => {
    initAndSeedSqliteDatabase(false);
    assert.equal((db.prepare('SELECT summary FROM lesson_plans WHERE id=?').get(markerId) as { summary: string }).summary, '并发写入');
  });
  installBusinessFixtures(db);
  db.close();

  const portProbe = net.createServer();
  portProbe.listen(0, '127.0.0.1');
  await once(portProbe, 'listening');
  const port = (portProbe.address() as net.AddressInfo).port;
  await new Promise<void>((resolve, reject) => portProbe.close(error => error ? reject(error) : resolve()));
  const base = `http://127.0.0.1:${port}`;
  const logPath = path.join(testDir, 'server.log');
  const log = fs.openSync(logPath, 'a');
  const launch = async () => {
    const processHandle = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
      cwd: root,
      env: { ...process.env, NODE_ENV: 'test', DISABLE_HMR:'true', SAKURA_DEMO_MODE:'true', SAKURA_ALLOW_SQL_WRITES:'true', SAKURA_ALLOW_RESEED:'true', HOST: '127.0.0.1', PORT: String(port), SAKURA_DATA_DIR: testDir },
      stdio: ['ignore', log, log], windowsHide: true,
    });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (processHandle.exitCode !== null) throw new Error(fs.readFileSync(logPath, 'utf-8'));
      try { if ((await fetch(`${base}/api/v1/auth/env-check`, { signal: AbortSignal.timeout(500) })).ok) return processHandle; } catch { /* Starting. */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    processHandle.kill();
    throw new Error(`Server startup timeout: ${logPath}`);
  };
  const stop = async () => {
    if (!child || child.exitCode !== null) return;
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  };
  let cookie='',csrf='';
  const api = async (route: string, method = 'GET', body?: unknown, extraHeaders:Record<string,string>={}) => {
    const response = await fetch(`${base}/api/v1/${route}`, { method, headers: { 'Content-Type': 'application/json',Cookie:cookie,'X-CSRF-Token':csrf,...extraHeaders }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
    const json=await response.json() as any;
    const setCookie=response.headers.get('set-cookie');
    if(setCookie)cookie=setCookie.split(';')[0];
    if(json.data?.csrfToken)csrf=json.data.csrfToken;
    return { status: response.status, json, setCookie };
  };
  const login=async(account='admin',password='admin')=>{
    const cap=(await api('security/captcha')).json.data;
    assert.ok(cap.demoHint,'Test challenge requires explicit demo mode');
    const response=await api('auth/faculty-login','POST',{facultyId:account,password,loginType:'account',captchaId:cap.captchaId,captchaAnswer:cap.demoHint});
    return {...response,challenge:cap};
  };
  const query = (sql: string) => api('sqlite/query', 'POST', { sql });
  child = await launch();
  inspector = new Database(dbPath);

  await check('auth / anonymous requests cannot read or administer SQLite',async()=>{
    assert.equal((await api('sqlite/status')).status,401);
    assert.equal((await api('sqlite/query','POST',{sql:'SELECT 1'})).status,401);
    assert.equal((await api('auth/default-profile')).status,401);
  });
  await check('auth / actual credentials issue HttpOnly session without password disclosure',async()=>{
    const response=await login();assert.equal(response.status,200);assert.ok(response.setCookie?.includes('HttpOnly'));assert.ok(response.setCookie?.includes('SameSite=Strict'));
    assert.equal(response.json.data.password,undefined);assert.equal(response.json.data.password_hash,undefined);
    assert.equal((await api('auth/session')).json.data.role,'admin');
    const hash=(inspector!.prepare("SELECT password_hash FROM faculty_users WHERE id='fac-admin'").get() as {password_hash:string}).password_hash;
    assert.ok(hash.startsWith('scrypt$'));assert.notEqual(hash,'admin');
    assert.equal((await api('auth/faculty-login','POST',{facultyId:'admin',password:'admin',loginType:'account',captchaId:response.challenge.captchaId,captchaAnswer:response.challenge.demoHint})).status,422);
  });
  await check('auth / CSRF validation and expired challenges are enforced',async()=>{
    assert.equal((await api('sqlite/query','POST',{sql:'SELECT 1'},{'X-CSRF-Token':''})).status,403);
    const cap=(await api('security/captcha')).json.data;
    inspector!.prepare("UPDATE security_captchas SET expires_at='2000-01-01' WHERE captcha_id=?").run(cap.captchaId);
    assert.equal((await api('auth/faculty-login','POST',{facultyId:'admin',password:'admin',loginType:'account',captchaId:cap.captchaId,captchaAnswer:cap.demoHint})).status,422);
    assert.equal((await login('admin','wrong-password')).status,401);
  });
  await check('auth / teacher scope prevents cross-class access and administration',async()=>{
    assert.equal((await login('FIX-a','fixture-only')).status,200);
    assert.equal((await api('sqlite/status')).status,403);
    assert.equal((await api('students?classId=fixture-class-a')).json.data.length,1);
    assert.equal((await api('students?classId=fixture-class-b')).json.data.length,0);
    assert.equal((await api('homework/submissions/fixture-submission-b/grade','PATCH',{score:80})).status,403);
    assert.equal((await api('students/fixture-student-b/coaching-journals','POST',{content:'not allowed'})).status,403);
    assert.equal((await login()).status,200);
  });
  await check('auth / logout invalidates server session',async()=>{
    assert.equal((await api('auth/logout','POST')).status,200);
    assert.equal((await api('auth/session')).status,401);
    assert.equal((await login()).status,200);
  });
  await check('academic / create master records and persist linked student data',async()=>{
    const term=await api('academic/terms','POST',{code:'VERIFY-TERM',name:'验证学期',starts_on:'2026-09-01',ends_on:'2027-01-31'});assert.equal(term.status,200);
    const faculty=await api('academic/faculty','POST',{faculty_code:'VERIFY-TEACHER',full_name:'验证新教师',email:'new-teacher@example.test',password:'fixture-password'});assert.equal(faculty.status,200);
    const klass=await api('academic/classes','POST',{class_code:'VERIFY-CLASS',class_name:'验证新班级',grade_level:'高一',head_teacher_id:faculty.json.data.id});assert.equal(klass.status,200);
    const student=await api('academic/students','POST',{student_no:'VERIFY-STUDENT',full_name:'验证学生',class_id:klass.json.data.id,term_id:term.json.data.id});assert.equal(student.status,200);
    const students=(await api('academic/students?q=VERIFY-STUDENT')).json.data;assert.equal(students.total,1);assert.equal(students.items[0].full_name,'验证学生');
    const classRow=(await api('academic/classes')).json.data.find((r:any)=>r.id===klass.json.data.id);assert.equal(classRow.actual_count,1);
    const updated=await api(`academic/students/${student.json.data.id}`,'PATCH',{version:1,full_name:'修改后的验证学生'});assert.equal(updated.status,200);
    assert.equal((await api(`students?classId=${klass.json.data.id}`)).json.data[0].name,'修改后的验证学生');
    assert.equal((await api(`academic/students/${student.json.data.id}`,'PATCH',{version:1,full_name:'旧版本覆盖'})).status,409);
    assert.equal((await api(`academic/classes/${klass.json.data.id}`,'PATCH',{version:1,archived:true})).status,409);
    assert.equal((await login('VERIFY-TEACHER','fixture-password')).status,200);
    assert.equal((await api('academic/classes')).json.data.length,1);
    assert.equal((await api('academic/students')).json.data.items[0].full_name,'修改后的验证学生');
    assert.equal((await api('academic/classes','POST',{class_code:'forbidden',class_name:'forbidden',grade_level:'高一'})).status,403);
    assert.equal((await login()).status,200);
    assert.equal((await api(`academic/students/${student.json.data.id}`,'PATCH',{version:2,archived:true})).status,200);
    assert.equal((await api(`academic/classes/${klass.json.data.id}`,'PATCH',{version:1,archived:true})).status,200);
    assert.equal((await api('academic/students?q=VERIFY-STUDENT')).json.data.total,0);
  });

  await check('API / independent process reads persisted data', async () => {
    const { json } = await api('lessons/unit-plans');
    assert.equal(json.success, true);
    assert.ok(json.data.some((lesson: any) => lesson.id === markerId));
  });
  await check('API / actual database path and journal mode', async () => {
    const { json } = await api('sqlite/status');
    assert.equal(path.resolve(root, json.data.dbPath), dbPath);
    assert.equal(json.data.journalMode.toLowerCase(), inspector!.pragma('journal_mode', { simple: true }));
    assert.equal(json.data.walSizeBytes, fs.statSync(`${dbPath}-wal`).size);
    return { engine: json.data.engine, dbPath: json.data.dbPath, fileSizeBytes: json.data.fileSizeBytes, walSizeBytes: json.data.walSizeBytes, totalSizeBytes: json.data.totalSizeBytes };
  });
  await check('API / SELECT and PRAGMA return physical rows', async () => {
    for (const sql of ['SELECT COUNT(*) AS n FROM student_profiles', 'PRAGMA integrity_check']) {
      const { json } = await query(sql);
      assert.equal(json.success, true); assert.equal(json.data.mode, 'SELECT'); assert.equal(json.data.rows.length, 1);
    }
  });
  await check('API / CTE and comment-prefixed SELECT return rows', async () => {
    for (const sql of ['WITH sample AS (SELECT 42 AS answer) SELECT answer FROM sample', '-- read-only query\nSELECT 42 AS answer']) {
      const { json } = await query(sql);
      assert.equal(json.success, true); assert.equal(json.data.mode, 'SELECT'); assert.equal(json.data.rows[0].answer, 42);
    }
  });
  await check('API / isolated SQL CRUD and RETURNING', async () => {
    assert.equal((await query('CREATE TABLE verifier_sql (id TEXT PRIMARY KEY, note TEXT NOT NULL)')).json.success, true);
    const { json } = await query("INSERT INTO verifier_sql VALUES ('one', '参数返回 🌸') RETURNING id, note");
    assert.equal(json.success, true); assert.equal(json.data.rows[0].id, 'one');
    assert.equal(json.data.mode, 'MUTATION'); assert.equal(json.data.changes, 1); assert.equal(json.data.returnsRows, true);
    const update = (await query("UPDATE verifier_sql SET note='修改后' WHERE id='one'")).json.data;
    assert.equal(update.rowCount, 1); assert.equal(update.changes, 1);
    assert.equal((await query("DELETE FROM verifier_sql WHERE id='one'")).json.data.rowCount, 1);
  });
  await check('API / invalid and empty SQL fail without damaging connection', async () => {
    for (const sql of ['', 'SELECT FROM no_such_table']) {
      const response = await query(sql);
      assert.equal(response.status, 400); assert.equal(response.json.success, false);
    }
    assert.equal((await query('SELECT 1 AS ok')).json.data.rows[0].ok, 1);
  });
  await check('API / common JSON errors and unknown endpoints are structured', async () => {
    const missing=await api('not-an-api');
    assert.equal(missing.status,404);assert.equal(missing.json.success,false);assert.equal(missing.json.data,null);assert.ok(missing.json.traceId);
    const malformed=await fetch(`${base}/api/v1/lessons/unit-plans`,{method:'PUT',headers:{'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf},body:'{broken'});
    assert.equal(malformed.status,400);assert.equal((await malformed.json()).success,false);
  });
  await check('API / grading rejects missing records and invalid scores without writing', async () => {
    const row=inspector!.prepare('SELECT id,total_score FROM homework_submissions LIMIT 1').get() as {id:string;total_score:number};
    assert.equal((await api('homework/submissions/no-such-submission/grade','PATCH',{score:80})).status,404);
    for(const score of [-1,10001,null,'90']) assert.equal((await api(`homework/submissions/${row.id}/grade`,'PATCH',{score})).status,422);
    assert.equal((inspector!.prepare('SELECT total_score FROM homework_submissions WHERE id=?').get(row.id) as {total_score:number}).total_score,row.total_score);
  });
  await check('academic / audit failure rolls back a master-data mutation',async()=>{
    inspector!.exec("CREATE TRIGGER fail_academic_audit BEFORE INSERT ON sql_audit_logs WHEN NEW.fn_name='academic.POST' BEGIN SELECT RAISE(FAIL,'audit unavailable'); END");
    try{assert.equal((await api('academic/courses','POST',{code:'ROLLBACK-COURSE',name:'不应存在'})).json.success,false);assert.equal(inspector!.prepare("SELECT id FROM courses WHERE code='ROLLBACK-COURSE'").get(),undefined);}finally{inspector!.exec('DROP TRIGGER fail_academic_audit');}
  });
  let workflowId='';
  await check('homework / draft publish submit grade return resubmit and statistics',async()=>{
    let r=await api('homework/assignments','POST',{class_id:'fixture-class-a',title:'人工批阅闭环',max_score:20,instructions:''});assert.equal(r.status,200);workflowId=r.json.data.id;
    assert.equal((await api(`homework/assignments/${workflowId}/submissions`,'POST',{student_id:'fixture-student-a',content:'草稿不能提交'})).status,409);
    r=await api(`homework/assignments/${workflowId}`,'PATCH',{version:1,lifecycle:'published'});assert.equal(r.status,200);
    assert.equal((await api(`homework/assignments/${workflowId}`,'PATCH',{version:1,lifecycle:'closed'})).status,409);
    assert.equal((await api(`homework/assignments/${workflowId}/submissions`,'POST',{student_id:'fixture-student-b',content:'跨班提交'})).status,422);
    r=await api(`homework/assignments/${workflowId}/submissions`,'POST',{student_id:'fixture-student-a',content:'第一次提交正文'});assert.equal(r.status,200);const id=r.json.data.id;
    let d=(await api(`homework/assignments/${workflowId}`)).json.data;assert.equal(d.stats.submitted,1);assert.equal(d.stats.total,1);assert.equal(d.stats.average,null);assert.equal(d.stats.pending,1);
    assert.equal((await api(`homework/assignments/${workflowId}/submissions`,'POST',{student_id:'fixture-student-a',content:'重复提交',version:1})).status,409);
    for(const score of [20.01,1.001])assert.equal((await api(`homework/submissions/${id}/grade`,'PATCH',{version:1,score})).status,422);
    r=await api(`homework/submissions/${id}/grade`,'PATCH',{version:1,score:0,feedback:'零分也是真实成绩',stampType:'sakura'});assert.equal(r.status,200);assert.equal(r.json.data.stats.average,0);
    assert.equal((await api(`homework/submissions/${id}/grade`,'PATCH',{version:1,score:20})).status,409);
    assert.equal((await api(`homework/submissions/${id}/stamp`,'PATCH',{version:2,stampType:null})).status,200);
    r=await api(`homework/submissions/${id}/review`,'PATCH',{version:3,action:'return',feedback:'请补充论据'});assert.equal(r.status,200);
    d=(await api(`homework/assignments/${workflowId}`)).json.data;assert.equal(d.stats.average,null);assert.equal(d.stats.correction,1);
    r=await api(`homework/assignments/${workflowId}/submissions`,'POST',{student_id:'fixture-student-a',content:'订正后的正文',version:4});assert.equal(r.status,200);assert.equal(r.json.data.total_score,null);assert.equal(r.json.data.status,'pending');
    r=await api(`homework/submissions/${id}/grade`,'PATCH',{version:5,score:18.5,feedback:'论据充分'});assert.equal(r.status,200);assert.equal(r.json.data.stats.average,18.5);assert.equal(r.json.data.stats.excellentRate,1);
    assert.equal((await api(`homework/submissions/${id}/review`,'PATCH',{version:6,action:'model',enabled:true})).status,200);
    const h=(await api(`homework/submissions/${id}/history`)).json.data;assert.equal(h.length,7);assert.ok(h.some((x:any)=>JSON.parse(x.snapshot_json).content==='第一次提交正文'));
    r=await api(`homework/assignments/${workflowId}`,'PATCH',{version:2,lifecycle:'closed'});assert.equal(r.status,200);
    assert.equal((await api(`homework/assignments/${workflowId}/submissions`,'POST',{student_id:'fixture-student-a',content:'截止后提交',version:7})).status,409);
    assert.equal((await api(`homework/submissions/${id}/review`,'PATCH',{version:7,action:'return',feedback:'截止后继续订正'})).status,200);
    assert.equal((await api(`homework/assignments/${workflowId}/submissions`,'POST',{student_id:'fixture-student-a',content:'订正后的正文',version:8})).status,200);
    assert.equal((await api(`homework/submissions/${id}/grade`,'PATCH',{version:9,score:18.5})).status,200);
    assert.equal((await login('FIX-b','fixture-only')).status,200);assert.equal((await api(`homework/assignments/${workflowId}`)).status,403);assert.equal((await api(`homework/submissions/${id}/history`)).status,403);await login();
  });
  await check('homework / audit failure rolls back creation',async()=>{
    inspector!.exec("CREATE TRIGGER fail_work_audit BEFORE INSERT ON sql_audit_logs WHEN NEW.fn_name='business.POST' BEGIN SELECT RAISE(FAIL,'audit unavailable'); END");
    try{assert.equal((await api('homework/assignments','POST',{class_id:'fixture-class-a',title:'ROLLBACK-HOMEWORK',max_score:100})).json.success,false);assert.equal(inspector!.prepare("SELECT id FROM homework_assignments WHERE title='ROLLBACK-HOMEWORK'").get(),undefined);}finally{inspector!.exec('DROP TRIGGER fail_work_audit');}
  });
  let lessonApiId='';
  await check('API / lesson write is visible in SQLite and subsequent reads', async () => {
    const title = "验证教案 O'Reilly 🌸";
    const result = await api('lessons/plans', 'POST', { title, body: '接口真实落盘', visibility:'school' });
    assert.equal(result.json.success, true);lessonApiId=result.json.data.id;
    assert.equal((inspector!.prepare('SELECT title FROM lesson_plans WHERE id=?').get(lessonApiId) as { title: string }).title, title);
    assert.equal((await api('lessons/unit-plans')).json.data.find((p: any) => p.id === lessonApiId).title, title);
    assert.ok(inspector!.prepare("SELECT id FROM sql_audit_logs WHERE fn_name='business.POST'").get());
  });
  await check('lessons / owner privacy revisions links archive and stale edits',async()=>{
    assert.equal((await login('FIX-a','fixture-only')).status,200);
    let r=await api('lessons/plans','POST',{title:'私有教案',body:'第一版教案正文',tags:['写作'],visibility:'private'});assert.equal(r.status,200);const id=r.json.data.id;
    assert.equal((await api(`lessons/plans/${id}`,'PATCH',{version:1,body:'第二版正文'})).status,200);
    assert.equal((await api(`lessons/plans/${id}`,'PATCH',{version:1,body:'过期覆盖'})).status,409);
    let history=(await api(`lessons/plans/${id}/revisions`)).json.data;assert.equal(JSON.parse(history[0].snapshot_json).body,'第一版教案正文');
    assert.equal((await api(`lessons/plans/${id}/links`,'POST',{version:2,assignment_id:workflowId})).status,200);
    assert.equal((await api(`lessons/plans/${id}/links`,'POST',{version:3,assignment_id:'fixture-assignment-b'})).status,403);
    await login('FIX-b','fixture-only');assert.equal((await api('lessons/plans?q=私有教案')).json.data.length,0);assert.equal((await api(`lessons/plans/${id}/revisions`)).status,403);assert.equal((await api(`lessons/plans/${id}`,'PATCH',{version:3,body:'越权'})).status,403);
    await login('FIX-a','fixture-only');assert.equal((await api(`lessons/plans/${id}`,'PATCH',{version:3,visibility:'school'})).status,200);
    await login('FIX-b','fixture-only');assert.equal((await api('lessons/plans?q=私有教案')).json.data.length,1);assert.equal((await api(`lessons/plans/${id}`,'PATCH',{version:4,body:'共享不等于可编辑'})).status,403);
    await login('FIX-a','fixture-only');assert.equal((await api(`lessons/plans/${id}`,'PATCH',{version:4,archived:true})).status,200);assert.equal((await api('lessons/plans?q=私有教案')).json.data.length,0);
    assert.equal((await api('lessons/unit-plans','PUT',{lessonId:id,title:'不能覆盖',description:'不能绕过版本'})).status,409);await login();
  });
  await check('schedule / conflict validation and approval are atomic',async()=>{
    const scheduleBase={lesson_id:lessonApiId,class_id:'fixture-class-a',teacher_id:'fixture-teacher-a',course_id:'course-chinese',starts_at:'2026-11-01T01:00:00.000Z',ends_at:'2026-11-01T02:00:00.000Z',room:'验证教室A'};
    let r=await api('schedules/entries','POST',scheduleBase);assert.equal(r.status,200);const id=r.json.data.id;
    assert.equal((await api('schedules/entries','POST',{...scheduleBase,teacher_id:'fixture-teacher-b',class_id:'fixture-class-b'})).status,409);
    assert.equal((await api('schedules/entries','POST',{...scheduleBase,room:'别的教室',class_id:'fixture-class-b'})).status,409);
    assert.equal((await api('schedules/entries','POST',{...scheduleBase,room:'别的教室',teacher_id:'fixture-teacher-b'})).status,409);
    await login('FIX-a','fixture-only');
    r=await api('schedules/changes','POST',{entry_id:id,version:1,reason:'调课验证',target:{starts_at:'2026-11-01T03:00:00.000Z',ends_at:'2026-11-01T04:00:00.000Z'}});assert.equal(r.status,200);const changeId=r.json.data.id;
    assert.equal((inspector!.prepare('SELECT starts_at FROM schedule_entries WHERE id=?').get(id) as any).starts_at,scheduleBase.starts_at);
    assert.equal((await api(`schedules/changes/${changeId}`,'PATCH',{version:1,status:'approved'})).status,403);
    await login();
    r=await api('schedules/entries','POST',{...scheduleBase,teacher_id:'fixture-teacher-b',class_id:'fixture-class-b',starts_at:'2026-11-01T03:00:00.000Z',ends_at:'2026-11-01T04:00:00.000Z'});assert.equal(r.status,200);const blocker=r.json.data.id;
    assert.equal((await api(`schedules/changes/${changeId}`,'PATCH',{version:1,status:'approved'})).status,409);
    assert.equal((inspector!.prepare('SELECT status FROM schedule_changes WHERE id=?').get(changeId) as any).status,'pending');
    assert.equal((inspector!.prepare('SELECT starts_at FROM schedule_entries WHERE id=?').get(id) as any).starts_at,scheduleBase.starts_at);
    assert.equal((await api(`schedules/entries/${blocker}`,'PATCH',{version:1,cancelled:true})).status,200);
    assert.equal((await api(`schedules/changes/${changeId}`,'PATCH',{version:1,status:'approved',review_note:'通过'})).status,200);
    assert.equal((inspector!.prepare('SELECT starts_at FROM schedule_entries WHERE id=?').get(id) as any).starts_at,'2026-11-01T03:00:00.000Z');
    assert.equal((await api(`schedules/changes/${changeId}`,'PATCH',{version:1,status:'rejected'})).status,409);
    await login('FIX-b','fixture-only');assert.equal((await api('schedules/entries?from=2026-11-01&to=2026-11-03')).json.data.length,0);
    await login('FIX-a','fixture-only');
    const calendar=await fetch(`${base}/api/v1/schedules/calendar.ics?from=2026-11-01&to=2026-11-03`,{headers:{Cookie:cookie}});
    assert.equal(calendar.status,200);const ics=await calendar.text();assert.ok(ics.includes('BEGIN:VCALENDAR'));assert.ok(ics.includes('DTSTART:20261101T030000Z'));assert.ok(ics.includes(`UID:${id}@sakura.local`));
    await login();
  });
  let examWorkflowId='';
  await check('exams / preview import statistics missing scores and duplicate requests',async()=>{
    for(const no of ['EXAM-2','EXAM-3','EXAM-4'])assert.equal((await api('academic/students','POST',{student_no:no,full_name:`考试学生${no}`,class_id:'fixture-class-a',term_id:'term-2024-spring'})).status,200);
    let r=await api('exams/batches','POST',{title:'真实考试样本',exam_date:'2026-11-02',class_id:'fixture-class-a',course_id:'course-chinese',questions:[{title:'阅读',max_score:40},{title:'写作',max_score:60}]});assert.equal(r.status,200);examWorkflowId=r.json.data.id;
    let d=(await api(`exams/batches/${examWorkflowId}`)).json.data;assert.equal(d.stats.expected,4);assert.equal(d.stats.missing,4);assert.equal(d.stats.average,null);
    const rows=[{student_no:'FIX-STU-a',status:'scored',scores:[0,0]},{student_no:'EXAM-2',status:'scored',scores:[40,50]},{student_no:'EXAM-3',status:'absent',scores:[]},{student_no:'EXAM-4',status:'ungraded',scores:[]}];
    for(const invalid of [[...rows,rows[0]],[{...rows[0],scores:[41,10]}],[{...rows[0],student_no:'FIX-STU-b'}],[{...rows[0],scores:[null,0]}]])assert.equal((await api(`exams/batches/${examWorkflowId}/import-preview`,'POST',{version:1,rows:invalid})).status,422);
    r=await api(`exams/batches/${examWorkflowId}/import-preview`,'POST',{version:1,rows});assert.equal(r.status,200);assert.equal((inspector!.prepare('SELECT COUNT(*) AS n FROM assessment_results WHERE exam_id=?').get(examWorkflowId) as any).n,0);
    const payload={version:1,rows,previewHash:r.json.data.previewHash,request_key:'verify-import-1'};
    r=await api(`exams/batches/${examWorkflowId}/import`,'POST',payload);assert.equal(r.status,200);assert.equal(r.json.data.imported,4);
    assert.equal((await api(`exams/batches/${examWorkflowId}/import`,'POST',payload)).status,200);
    assert.equal((await api(`exams/batches/${examWorkflowId}/import`,'POST',{...payload,rows:rows.slice(1)})).status,409);
    assert.equal((await api(`exams/batches/${examWorkflowId}/import`,'POST',{...payload,request_key:'new-stale-import'})).status,409);
    d=(await api(`exams/batches/${examWorkflowId}`)).json.data;assert.equal(d.stats.average,45);assert.equal(d.stats.scored,2);assert.equal(d.stats.absent,1);assert.equal(d.stats.ungraded,1);assert.equal(d.stats.passRate,0.5);assert.equal(d.stats.excellentRate,0.5);assert.deepEqual(d.stats.distribution.map((b:any)=>b.count),[1,0,0,1]);assert.equal(d.stats.questionAverages[0].average,20);
    const trajectory=(await api('exams/students/fixture-student-a/trajectory')).json.data;assert.equal(trajectory[0].total,0);
    await login('FIX-b','fixture-only');assert.equal((await api(`exams/batches/${examWorkflowId}`)).status,403);assert.equal((await api('exams/batches')).json.data.length,0);await login();
    const {parseScoreCsv}=await import('../src/services/scoreCsv');assert.deepEqual(parseScoreCsv('student_no,status,Q1,Q2\r\n"a",scored,0,10\r\n"b",absent,,').map(r=>r.scores),[[0,10],[]]);assert.throws(()=>parseScoreCsv('student_no,status,Q1\na,scored,'));
  });
  await check('care / shared contacts messages unread todos and journal ownership',async()=>{
    await login('FIX-a','fixture-only');let r=await api('care/contacts','POST',{student_id:'fixture-student-a',name:'测试家长',relationship:'父亲',phone:'fixture-only'});assert.equal(r.status,200);const contact=r.json.data.id;
    r=await api('care/threads','POST',{contact_id:contact});assert.equal(r.status,200);const thread=r.json.data.id;assert.equal((await api('care/threads','POST',{contact_id:contact})).json.data.id,thread);
    const payload={content:'手工记录的家长来信',kind:'incoming-record',request_key:'care-message-1'};
    assert.equal((await api(`care/threads/${thread}/messages`,'POST',payload)).status,200);assert.equal((await api(`care/threads/${thread}/messages`,'POST',payload)).status,200);
    assert.equal((await api(`care/threads/${thread}/messages`,'POST',{...payload,content:'不同内容复用标识'})).status,409);
    let list=(await api('care/threads?studentId=fixture-student-a')).json.data;assert.equal(list[0].unread_count,1);assert.equal(list[0].last_message,payload.content);
    assert.equal((await api(`care/threads/${thread}/read`,'POST')).status,200);assert.equal((await api('care/threads?studentId=fixture-student-a')).json.data[0].unread_count,0);
    r=await api(`care/threads/${thread}/messages`,'POST',{content:'给家长的待发送内容',kind:'outgoing',request_key:'care-message-2'});assert.equal(r.status,200);assert.equal(r.json.data.status,'queued');
    inspector!.exec("CREATE TRIGGER fail_care_audit BEFORE INSERT ON sql_audit_logs WHEN NEW.fn_name='business.POST' BEGIN SELECT RAISE(FAIL,'audit failed'); END");
    try{assert.equal((await api(`care/threads/${thread}/messages`,'POST',{content:'事务不能只保存摘要',kind:'note',request_key:'care-rollback'})).json.success,false);assert.equal((inspector!.prepare('SELECT last_message FROM care_threads WHERE id=?').get(thread) as any).last_message,'给家长的待发送内容');assert.equal(inspector!.prepare("SELECT id FROM care_messages WHERE request_key='care-rollback'").get(),undefined);}finally{inspector!.exec('DROP TRIGGER fail_care_audit');}
    r=await api('care/todos','POST',{student_id:'fixture-student-a',title:'家访测试',due_at:'2026-11-03T08:00:00Z'});assert.equal(r.status,200);const todo=r.json.data.id;assert.equal((await api(`care/todos/${todo}`,'PATCH',{version:1,status:'done'})).status,200);assert.equal((await api(`care/todos/${todo}`,'PATCH',{version:1,status:'cancelled'})).status,409);
    assert.equal((await api('students/fixture-student-a/coaching-journals','POST',{content:'来自真实登录教师的辅导记录',teacherId:'fac-admin'})).status,200);const journals=(await api('students/fixture-student-a/coaching-journals')).json.data;assert.equal(journals[0].teacher_id,'fixture-teacher-a');assert.equal(journals[0].teacher_name,'测试教师 a');
    await login('FIX-b','fixture-only');assert.equal((await api(`care/threads/${thread}/messages`)).status,403);assert.equal((await api('care/contacts?studentId=fixture-student-a')).status,403);
    const {notificationTime}=await import('../server/care');assert.equal(notificationTime({dnd_enabled:1,dnd_start_time:'18:00'},new Date('2026-11-01T12:00:00Z')),'2026-11-02T00:00:00.000Z');assert.equal(notificationTime({dnd_enabled:1,dnd_start_time:'18:00'},new Date('2026-11-01T01:00:00Z')),'2026-11-01T01:00:00.000Z');await login();
  });
  await check('workspace / aggregates search and notification state are scoped',async()=>{
    inspector!.prepare("UPDATE faculty_users SET dnd_enabled=0 WHERE id='fixture-teacher-a'").run();
    await login('FIX-a','fixture-only');
    let overview=(await api('workspace/overview')).json.data;assert.equal(overview.students,4);assert.equal(overview.classes.length,1);assert.equal(overview.pending,0);assert.equal(overview.unread,0);
    assert.equal((await api('workspace/search?q=FIX-STU-b')).json.data.length,0);
    let found=(await api('workspace/search?q=人工批阅闭环')).json.data;assert.equal(found[0].id,workflowId);assert.equal(found[0].class_id,'fixture-class-a');
    const student=(await api('students/fixture-student-a/profile')).json.data;
    assert.equal((await api('students/fixture-student-a/profile','PATCH',{version:student.version,bio:'全局档案修改',tag_category:'progress'})).status,200);
    let notices=(await api('workspace/notifications')).json.data;const notice=notices.find((n:any)=>n.title==='档案已保存');assert.ok(notice);assert.equal(notice.read_at,null);
    assert.equal((await api('workspace/notifications/read','POST',{id:notice.id})).status,200);assert.ok((await api('workspace/notifications')).json.data.find((n:any)=>n.id===notice.id).read_at);
    const duplicates=(inspector!.prepare("SELECT COUNT(*) AS n FROM business_notifications WHERE user_id='fixture-teacher-a' AND event_key LIKE '%care-message-1'").get() as any).n;assert.equal(duplicates,1);
    await login('FIX-b','fixture-only');assert.equal((await api('workspace/notifications/read','POST',{id:notice.id})).status,404);assert.equal((await api('workspace/search?q=人工批阅闭环')).json.data.length,0);overview=(await api('workspace/overview')).json.data;assert.equal(overview.students,1);assert.equal(overview.classes.length,1);await login();
  });
  await check('API / grading persists in physical columns and list response', async () => {
    const original = inspector!.prepare('SELECT id,class_name FROM homework_submissions LIMIT 1').get() as { id: string; class_name:string };
    assert.equal((await api(`homework/submissions/${original.id}/grade`, 'PATCH', { score: 87.5, version: 1 })).json.success, true);
    assert.equal((inspector!.prepare('SELECT total_score FROM homework_submissions WHERE id=?').get(original.id) as { total_score: number }).total_score, 87.5);
    assert.equal((await api(`homework/submissions?className=${encodeURIComponent(original.class_name)}`)).json.data.find((s: any) => s.id === original.id).score, 87.5);
  });
  await check('API / process restart preserves successful writes', async () => {
    const oldPid = child!.pid;
    inspector!.close(); inspector = undefined;
    await stop(); child = await launch(); inspector = new Database(dbPath);
    assert.notEqual(child.pid, oldPid);
    assert.equal((await api(`exams/batches/${examWorkflowId}`)).json.data.stats.average,45);
    const work=(await api(`homework/assignments/${workflowId}`)).json.data;assert.equal(work.stats.average,18.5);assert.equal(work.submissions[0].content,'订正后的正文');
    assert.equal((await api('lessons/unit-plans')).json.data.find((p: any) => p.id === lessonApiId).title, "验证教案 O'Reilly 🌸");
    return { stoppedPid: oldPid, restartedPid: child.pid };
  });

  const backupCheck = async (label: string, concurrent: boolean) => {
    const id = concurrent ? 'verify-backup-reader' : 'verify-backup-normal';
    if (concurrent) { inspector!.exec('BEGIN'); inspector!.prepare('SELECT COUNT(*) FROM lesson_plans').get(); }
    try {
      const saved=await api('lessons/plans','POST',{title:id,body:'备份完整性标记',visibility:'school'});assert.equal(saved.json.success,true);const savedId=saved.json.data.id;
      const response = await fetch(`${base}/api/v1/sqlite/backup-download`, { headers:{Cookie:cookie},signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 200);
      const file = path.join(testDir, `${label}.sqlite`);
      fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
      const backup = new Database(file, { readonly: true });
      try {
        assert.equal(backup.pragma('integrity_check', { simple: true }), 'ok');
        assert.ok(backup.prepare('SELECT id FROM lesson_plans WHERE id=?').get(savedId), 'Committed row absent from downloaded backup');
      } finally { backup.close(); }
      return { bytes: fs.statSync(file).size };
    } finally { if (inspector!.inTransaction) inspector!.exec('ROLLBACK'); }
  };
  await check('backup / downloaded database integrity and committed writes', () => backupCheck('backup-normal', false));
  await check('backup / active WAL reader does not lose committed writes', () => backupCheck('backup-active-reader', true));
  await check('backup / concurrent requests produce independent valid snapshots', async () => {
    const copies = await Promise.all(Array.from({ length: 3 }, async (_, index) => {
      const response = await fetch(`${base}/api/v1/sqlite/backup-download`,{headers:{Cookie:cookie}});
      assert.equal(response.status, 200);
      const target = path.join(testDir, `backup-concurrent-${index}.sqlite`);
      fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
      const snapshot = new Database(target, { readonly: true });
      try {
        assert.equal(snapshot.pragma('integrity_check', { simple: true }), 'ok');
        assert.ok(snapshot.prepare('SELECT id FROM lesson_plans WHERE id=?').get(lessonApiId));
      } finally { snapshot.close(); }
      return fs.statSync(target).size;
    }));
    return { copies: copies.length, bytes: copies };
  });
  await check('client / unavailable SQLite never reports fake successful operations', async () => {
    const { sakuraApi } = await import('../src/services/sakuraApiService');
    sakuraApi.configure({ baseUrl: 'http://127.0.0.1:1/api/v1', useRemoteBackend: true, timeoutMs: 100 });
    for (const operation of [() => sakuraApi.sqlite.getStatus(), () => sakuraApi.sqlite.executeQuery('SELECT 1'), () => sakuraApi.sqlite.reseedDatabase()]) {
      const response = await operation();
      assert.equal(response.success, false); assert.equal(response.code, 503); assert.equal(response.data, null);
    }
  });

  await check('external / unconfigured AI rejects instead of fabricating results',async()=>{
    const {sakuraAIService}=await import('../src/services/aiService');assert.equal(sakuraAIService.getConfig().enabled,false);
    await assert.rejects(()=>sakuraAIService.batchPreGradeEssays('fixture-class-a',1),/尚未连接/);await assert.rejects(()=>sakuraAIService.analyzeExamCohort(examWorkflowId),/尚未连接/);assert.throws(()=>sakuraAIService.configure({enabled:true}),/尚未连接/);
  });
  // Capture schema/application limitations without altering the user's database.
  observations.anonymousSqlConsole = (await api('sqlite/query','POST',{sql:'SELECT 1'},{Cookie:''})).status;
  observations.missingGradeResponse = await api('homework/submissions/verify-missing-id/grade', 'PATCH', { score: 80 });
  observations.filterNonexistentClassCount = (await api('homework/submissions?className=verify-nonexistent-class&status=pending')).json.data.length;
  observations.documentationDdlDialect = 'Runtime authority: server/database/legacySchema.ts plus checksum-verified migrations 1-11. src/database/schema.sql is retained historical reference only.';

  await check('API / isolated reseed restores baseline and remains consistent', async () => {
    const { json } = await api('sqlite/reseed', 'POST');
    assert.equal(json.success, true);
    assert.equal(inspector!.prepare('SELECT * FROM lesson_plans WHERE id=?').get(markerId), undefined);
    assert.equal((inspector!.prepare('SELECT COUNT(*) AS n FROM student_profiles').get() as { n: number }).n, 1);
    assert.equal(inspector!.pragma('integrity_check', { simple: true }), 'ok');
  });
  inspector.close(); inspector = undefined;
  await stop(); child = undefined;
  fs.closeSync(log);
} finally {
  if (inspector?.open) inspector.close();
  if (db.open) db.close();
  if (child && child.exitCode === null) child.kill();
  const result = { testedAt: new Date().toISOString(), testDirectory: testDir, checks, observations, passed: checks.filter(c => c.status === 'PASS').length, failed: checks.filter(c => c.status === 'FAIL').length };
  fs.writeFileSync(path.join(evidenceDir, 'results.json'), JSON.stringify(result, null, 2));
  console.log(`SQLite verification: ${result.passed} passed, ${result.failed} failed. Isolated artifacts: ${testDir}`);
  if (result.failed) process.exitCode = 1;
}
