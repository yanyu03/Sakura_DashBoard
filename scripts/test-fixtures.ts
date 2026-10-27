import type Database from 'better-sqlite3';
import { hashPassword } from '../server/passwords';

/** Install only into the disposable DB explicitly passed by a test. */
export function installBusinessFixtures(db:Database.Database){
  const copy=(table:string,overrides:Record<string,unknown>)=>{
    const original=db.prepare(`SELECT * FROM ${table} LIMIT 1`).get() as Record<string,unknown>;
    if(!original)throw new Error(`Fixture requires baseline ${table}`);
    const row={...original,...overrides};
    const columns=Object.keys(row);
    db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`).run(...columns.map(column=>row[column]));
  };
  db.transaction(()=>{
    for(const suffix of ['a','b']){
      const teacher=`fixture-teacher-${suffix}`,classId=`fixture-class-${suffix}`,student=`fixture-student-${suffix}`,assignment=`fixture-assignment-${suffix}`;
      copy('faculty_users',{id:teacher,faculty_code:`FIX-${suffix}`,email:`fixture-${suffix}@example.test`,phone:null,password_hash:hashPassword('fixture-only'),role:'teacher',full_name:`测试教师 ${suffix}`});
      copy('academic_classes',{id:classId,class_code:`FIX-CLASS-${suffix}`,class_name:`测试班级 ${suffix}`,head_teacher_id:teacher,student_count:1});
      const base=db.prepare('SELECT payload_json FROM student_profiles LIMIT 1').get() as {payload_json:string};
      const payload={...JSON.parse(base.payload_json),id:student,studentNo:`FIX-STU-${suffix}`,name:`测试学生 ${suffix}`,className:`测试班级 ${suffix}`};
      copy('student_profiles',{id:student,student_no:payload.studentNo,short_no:suffix,full_name:payload.name,class_id:classId,payload_json:JSON.stringify(payload)});
      copy('homework_assignments',{id:assignment,title:`测试作业 ${suffix}`,class_id:classId,total_students:1});
      const submission=db.prepare('SELECT payload_json FROM homework_submissions LIMIT 1').get() as {payload_json:string};
      copy('homework_submissions',{id:`fixture-submission-${suffix}`,assignment_id:assignment,student_id:student,student_name:payload.name,class_name:payload.className,payload_json:JSON.stringify({...JSON.parse(submission.payload_json),id:`fixture-submission-${suffix}`,name:payload.name,className:payload.className,studentNo:payload.studentNo})});
      copy('exam_analytics_batches',{id:`fixture-exam-${suffix}`,class_id:classId,exam_title:`测试考试 ${suffix}`});
      db.prepare('INSERT INTO teaching_assignments(teacher_id,class_id,course_id,term_id) VALUES (?,?,?,?)').run(teacher,classId,'course-chinese','term-2024-spring');
      db.prepare('INSERT INTO class_enrollments(student_id,class_id,term_id) VALUES (?,?,?)').run(student,classId,'term-2024-spring');
    }
  })();
}
