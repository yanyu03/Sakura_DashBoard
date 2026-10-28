import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { migrateDatabase } from '../server/database/migrations';
import { LEGACY_SCHEMA_SQL } from '../server/database/legacySchema';
import { installBusinessFixtures } from './test-fixtures';

fs.mkdirSync('.local-data',{recursive:true});
const directory=fs.mkdtempSync(path.resolve('.local-data','migration-test-'));
process.env.SAKURA_DATA_DIR=path.join(directory,'fresh');
const {sqliteDb:db,initAndSeedSqliteDatabase}=await import('../server/sqliteDb');
const checks:{name:string;status:string}[]=[];
function check(name:string,fn:()=>void){fn();checks.push({name,status:'PASS'});console.log(`PASS ${name}`);}
try{
  check('fresh database migrates and has enforceable foreign keys',()=>{
    assert.equal((db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get() as {n:number}).n,13);
    assert.ok((db.pragma('foreign_key_list(homework_submissions)') as unknown[]).length===2);
    assert.throws(()=>db.prepare("UPDATE student_profiles SET class_id='missing-class'").run(),/FOREIGN KEY/);
    assert.throws(()=>db.prepare('UPDATE homework_submissions SET total_score=-1').run(),/CHECK/);
    assert.deepEqual(db.pragma('foreign_key_check'),[]);
  });
  check('two-teacher two-class fixtures use distinct persisted relations',()=>{
    installBusinessFixtures(db);
    const rows=db.prepare("SELECT teacher_id,class_id FROM teaching_assignments WHERE teacher_id LIKE 'fixture-%' ORDER BY teacher_id").all();
    assert.equal(rows.length,2);
    assert.equal((db.prepare("SELECT COUNT(*) AS n FROM homework_assignments WHERE id LIKE 'fixture-%'").get() as {n:number}).n,2);
    assert.equal((db.prepare("SELECT COUNT(*) AS n FROM exam_analytics_batches WHERE id LIKE 'fixture-%'").get() as {n:number}).n,2);
  });
  check('repeated migration preserves fixtures and creates no duplicate history',()=>{
    initAndSeedSqliteDatabase(false);
    assert.equal((db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get() as {n:number}).n,13);
    assert.equal((db.prepare("SELECT COUNT(*) AS n FROM faculty_users WHERE id LIKE 'fixture-%'").get() as {n:number}).n,2);
  });
  const legacyFile=path.join(directory,'existing.sqlite');
  const legacy=new Database(legacyFile);legacy.exec(LEGACY_SCHEMA_SQL);
  legacy.prepare("INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role) VALUES ('custom-admin','custom','custom@example.test','not-a-real-password','历史用户','管理员')").run();
  check('legacy migration preserves custom rows and makes a restorable backup',()=>{
    migrateDatabase(legacy,legacyFile);
    assert.ok(legacy.prepare("SELECT id FROM faculty_users WHERE id='custom-admin'").get());
    assert.equal(legacy.prepare("SELECT id FROM faculty_users WHERE id='fac-admin'").get(),undefined);
    const backup=fs.readdirSync(path.join(directory,'migration-backups'))[0];
    const restored=new Database(path.join(directory,'migration-backups',backup),{readonly:true});
    assert.equal(restored.pragma('integrity_check',{simple:true}),'ok');
    assert.ok(restored.prepare("SELECT id FROM faculty_users WHERE id='custom-admin'").get());restored.close();
  });
  check('applied migration checksum protects history',()=>{
    legacy.prepare("UPDATE schema_migrations SET checksum='wrong' WHERE version=1").run();
    assert.throws(()=>migrateDatabase(legacy,legacyFile),/checksum mismatch/);
  });legacy.close();
  const orphanFile=path.join(directory,'orphan.sqlite');
  const orphan=new Database(orphanFile);orphan.exec(LEGACY_SCHEMA_SQL);
  orphan.prepare("INSERT INTO homework_assignments(id,title,course_tag,class_id) VALUES ('orphan','历史作业','语文','missing-class')").run();
  check('orphan data blocks upgrade without deleting original records',()=>{
    assert.throws(()=>migrateDatabase(orphan,orphanFile),/existing data preserved/);
    assert.equal((orphan.prepare('SELECT COUNT(*) AS n FROM homework_assignments').get() as {n:number}).n,1);
    assert.equal((orphan.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get() as {n:number}).n,0);
    assert.equal(orphan.pragma('integrity_check',{simple:true}),'ok');
  });orphan.close();
  check('explicit demo reset handles child relations before parent rows',()=>{
    initAndSeedSqliteDatabase(true);
    assert.equal((db.prepare('SELECT COUNT(*) AS n FROM faculty_users').get() as {n:number}).n,1);
    assert.equal((db.prepare('SELECT COUNT(*) AS n FROM class_enrollments').get() as {n:number}).n,1);
    assert.deepEqual(db.pragma('foreign_key_check'),[]);
  });
  fs.mkdirSync('docs/verification/business',{recursive:true});
  fs.writeFileSync('docs/verification/business/migrations.json',JSON.stringify({directory,checks},null,2));
}finally{db.close();}
