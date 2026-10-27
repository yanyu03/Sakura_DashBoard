export interface SqlTableDefinition {
  tableName: string;
  chineseTitle: string;
  moduleName: string;
  primaryKey: string;
  indexes: string[];
  description: string;
  ddl: string;
  sampleQuery: string;
}

export const SAKURA_SQL_TABLES: SqlTableDefinition[] = [
  {
    tableName: 'faculty_users',
    chineseTitle: '教师与教工统一认证表',
    moduleName: '教师统一认证 / 系统设置',
    primaryKey: 'id (VARCHAR 64)',
    indexes: ['UNIQUE(faculty_code)', 'UNIQUE(email)', 'UNIQUE(phone)'],
    description: '存储教师账号、校园邮箱、班主任/教研组身份以及下班防打扰时段配置。',
    ddl: `CREATE TABLE faculty_users (
  id VARCHAR(64) PRIMARY KEY,
  faculty_code VARCHAR(32) NOT NULL UNIQUE,
  email VARCHAR(128) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(64) NOT NULL,
  title_role VARCHAR(64) NOT NULL,
  department VARCHAR(64) NOT NULL DEFAULT '高中语文教研组',
  dnd_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  dnd_start_time VARCHAR(10) NOT NULL DEFAULT '20:30',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`,
    sampleQuery: `SELECT id, faculty_code, full_name, title_role, dnd_enabled
FROM faculty_users
WHERE faculty_code = 'T880421' AND status = 'ACTIVE';`,
  },
  {
    tableName: 'timetable_schedules',
    chineseTitle: '排课与课表矩阵表',
    moduleName: '课表与排课管理',
    primaryKey: 'id (VARCHAR 64)',
    indexes: ['idx_timetable_teacher_week (teacher_id, semester, week_num)'],
    description: '存储标准周课表网格数据，支持按任教班级(201/203)、教研公开课、晚自习值班与教室视角查询。',
    ddl: `CREATE TABLE timetable_schedules (
  id VARCHAR(64) PRIMARY KEY,
  semester VARCHAR(32) NOT NULL DEFAULT '2024-SPRING',
  week_num INT NOT NULL DEFAULT 12,
  day_of_week INT NOT NULL, -- 0=周一 .. 5=周末
  period_id VARCHAR(32) NOT NULL,
  period_name VARCHAR(32) NOT NULL,
  time_range VARCHAR(32) NOT NULL,
  teacher_id VARCHAR(64) NOT NULL REFERENCES faculty_users(id),
  class_group VARCHAR(16) NOT NULL DEFAULT 'both',
  course_title VARCHAR(128) NOT NULL,
  course_subtitle VARCHAR(255),
  room_name VARCHAR(64) NOT NULL,
  tag_label VARCHAR(32) NOT NULL,
  card_type VARCHAR(24) NOT NULL DEFAULT 'chinese-main',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`,
    sampleQuery: `SELECT period_id, day_of_week, course_title, room_name, tag_label, card_type
FROM timetable_schedules
WHERE teacher_id = :teacherId AND semester = '2024-SPRING' AND week_num = 12
ORDER BY period_id, day_of_week ASC;`,
  },
  {
    tableName: 'homework_submissions',
    chineseTitle: '作业提交与AI切片诊断表',
    moduleName: '作业批改中心',
    primaryKey: 'id (VARCHAR 64)',
    indexes: ['idx_submissions_assignment_status (assignment_id, status)'],
    description: '存储学生主观题答卷转写段落、红笔批注气泡、樱花鼓励印章、教师语音评语及 Sakura-AI 诊断报告。',
    ddl: `CREATE TABLE homework_submissions (
  id VARCHAR(64) PRIMARY KEY,
  assignment_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  total_score DECIMAL(5,2) NULL,
  question_score DECIMAL(5,2) NOT NULL DEFAULT 24.50,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  status_badge VARCHAR(64) NOT NULL,
  is_model_essay BOOLEAN NOT NULL DEFAULT FALSE,
  stamp_type VARCHAR(32) NULL, -- '妙笔生花' | '见解独到'
  essay_paragraphs JSON NOT NULL,
  audio_note_json JSON NOT NULL,
  ai_diagnostic_json JSON NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP NULL
);`,
    sampleQuery: `UPDATE homework_submissions
SET total_score = :score,
    stamp_type = :stamp,
    status = 'graded',
    graded_at = CURRENT_TIMESTAMP
WHERE id = :submissionId;`,
  },
  {
    tableName: 'student_profiles',
    chineseTitle: '学生学籍与五维能力全景表',
    moduleName: '学生学情档案',
    primaryKey: 'id (VARCHAR 64)',
    indexes: ['UNIQUE(student_no)', 'idx_student_profiles_class (class_id, tag_category)'],
    description: '存储学生 360° 全景学情、语文学科五维能力雷达分值、考勤互动指标及分层关怀标签。',
    ddl: `CREATE TABLE student_profiles (
  id VARCHAR(64) PRIMARY KEY,
  student_no VARCHAR(32) NOT NULL UNIQUE,
  full_name VARCHAR(64) NOT NULL,
  class_id VARCHAR(64) NOT NULL,
  role_title VARCHAR(64),
  tag_category VARCHAR(24) NOT NULL DEFAULT 'focus',
  radar_classical DECIMAL(5,2) NOT NULL,
  radar_modern DECIMAL(5,2) NOT NULL,
  radar_writing DECIMAL(5,2) NOT NULL,
  radar_poetry DECIMAL(5,2) NOT NULL,
  radar_basics DECIMAL(5,2) NOT NULL,
  radar_overall DECIMAL(5,2) NOT NULL,
  strength_module VARCHAR(128),
  potential_module VARCHAR(128),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`,
    sampleQuery: `SELECT student_no, full_name, radar_overall, strength_module, potential_module
FROM student_profiles
WHERE class_id = 'G2-201' AND tag_category = 'coaching'
ORDER BY radar_overall ASC;`,
  },
  {
    tableName: 'lesson_plans',
    chineseTitle: '大单元备课教案与资源库表',
    moduleName: '备课教案库',
    primaryKey: 'id (VARCHAR 64)',
    indexes: ['idx_lesson_unit_cat (unit_code, category)'],
    description: '存储大单元教案、配套课件PPT、名师视频、音频诵读切片及组内教研反思记录。',
    ddl: `CREATE TABLE lesson_plans (
  id VARCHAR(64) PRIMARY KEY,
  textbook_version VARCHAR(64) NOT NULL DEFAULT '统编高中语文 · 必修下册',
  unit_code VARCHAR(16) NOT NULL,
  title VARCHAR(128) NOT NULL,
  summary TEXT NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'ppt',
  author_name VARCHAR(64) NOT NULL,
  citation_count INT NOT NULL DEFAULT 0,
  tags_json JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`,
    sampleQuery: `SELECT id, title, author_name, citation_count, tags_json
FROM lesson_plans
WHERE unit_code = 'u2' AND (category = :category OR :category = 'all')
ORDER BY citation_count DESC;`,
  },
  {
    tableName: 'exam_analytics_batches',
    chineseTitle: '考务场次与大题得分率切片表',
    moduleName: '考务与成绩分析',
    primaryKey: 'id (VARCHAR 64)',
    indexes: ['idx_exam_class (class_id, exam_date)'],
    description: '存储期中/月考班级均分、优秀率、及格率、位次跃迁动向、大题得分率切片及 Sakura-Insight 学情书。',
    ddl: `CREATE TABLE exam_analytics_batches (
  id VARCHAR(64) PRIMARY KEY,
  exam_title VARCHAR(128) NOT NULL,
  class_id VARCHAR(64) NOT NULL,
  class_avg_score DECIMAL(5,2) NOT NULL,
  grade_avg_score DECIMAL(5,2) NOT NULL,
  excellent_rate DECIMAL(5,2) NOT NULL,
  pass_rate DECIMAL(5,2) NOT NULL,
  question_slices JSON NOT NULL,
  ai_insight_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`,
    sampleQuery: `SELECT exam_title, class_avg_score, excellent_rate, question_slices, ai_insight_json
FROM exam_analytics_batches
WHERE class_id = 'G2-201'
ORDER BY created_at DESC LIMIT 1;`,
  },
  {
    tableName: 'home_school_messages',
    chineseTitle: '家校协同会话与私信流水表',
    moduleName: '家校沟通社区',
    primaryKey: 'id (VARCHAR 64)',
    indexes: ['idx_messages_thread_time (thread_id, created_at)'],
    description: '存储教师与实名认证家长的私信往来、学情切片附件、鼓励樱花勋章及防打扰留言记录。',
    ddl: `CREATE TABLE home_school_messages (
  id VARCHAR(64) PRIMARY KEY,
  thread_id VARCHAR(64) NOT NULL REFERENCES home_school_threads(id),
  sender_role VARCHAR(16) NOT NULL, -- 'parent' | 'teacher'
  sender_name VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  medal_attached_json JSON NULL,
  sent_time_label VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`,
    sampleQuery: `INSERT INTO home_school_messages (id, thread_id, sender_role, sender_name, content, medal_attached_json, sent_time_label)
VALUES (:id, :threadId, 'teacher', '林知夏 老师', :content, :medalJson, '刚刚');`,
  },
];
