// Frozen pre-migration bootstrap schema. Current upgrades live in migrations.ts.
export const LEGACY_SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS security_captchas (
      captcha_id TEXT PRIMARY KEY,
      mode TEXT NOT NULL DEFAULT 'graphic',
      captcha_mode TEXT NOT NULL DEFAULT 'graphic',
      question_label TEXT NOT NULL DEFAULT '',
      answer_hash TEXT NOT NULL DEFAULT '',
      answer_text TEXT NOT NULL DEFAULT '',
      svg_markup TEXT NOT NULL DEFAULT '',
      verified INTEGER NOT NULL DEFAULT 0,
      client_ip TEXT DEFAULT '127.0.0.1',
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS faculty_users (
      id TEXT PRIMARY KEY,
      faculty_code TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      phone TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      title_role TEXT NOT NULL,
      department TEXT NOT NULL DEFAULT '高中语文教研组',
      default_tab TEXT NOT NULL DEFAULT 'homework-center',
      default_theme TEXT NOT NULL DEFAULT 'awesome-green',
      default_class_name TEXT NOT NULL DEFAULT '高二(1)班',
      semester_label TEXT NOT NULL DEFAULT '2024 春季学期 · 第 12 周',
      dnd_enabled INTEGER NOT NULL DEFAULT 1,
      dnd_start_time TEXT NOT NULL DEFAULT '20:30',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS academic_classes (
      id TEXT PRIMARY KEY,
      class_code TEXT NOT NULL UNIQUE,
      class_name TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      head_teacher_id TEXT,
      student_count INTEGER NOT NULL DEFAULT 45,
      room_location TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      student_no TEXT NOT NULL UNIQUE,
      short_no TEXT NOT NULL,
      full_name TEXT NOT NULL,
      avatar_char TEXT NOT NULL,
      avatar_url TEXT,
      class_id TEXT NOT NULL,
      role_badge TEXT DEFAULT '',
      rank_label TEXT DEFAULT '',
      tag_label TEXT DEFAULT '',
      badge_type TEXT DEFAULT '',
      trend_text TEXT DEFAULT '',
      trend_dir TEXT DEFAULT 'up',
      daily_status TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      tag_category TEXT NOT NULL DEFAULT 'focus',
      radar_classical REAL NOT NULL DEFAULT 90,
      radar_modern REAL NOT NULL DEFAULT 90,
      radar_writing REAL NOT NULL DEFAULT 90,
      radar_poetry REAL NOT NULL DEFAULT 90,
      radar_basics REAL NOT NULL DEFAULT 90,
      composite_score REAL NOT NULL DEFAULT 90,
      strength_module TEXT DEFAULT '',
      potential_module TEXT DEFAULT '',
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS timetable_schedules (
      id TEXT PRIMARY KEY,
      semester TEXT NOT NULL DEFAULT '2024-SPRING',
      week_num INTEGER NOT NULL DEFAULT 12,
      day_of_week INTEGER NOT NULL,
      period_id TEXT NOT NULL,
      period_name TEXT NOT NULL,
      time_range TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      class_group TEXT NOT NULL DEFAULT 'both',
      course_title TEXT NOT NULL,
      course_subtitle TEXT DEFAULT '',
      room_name TEXT NOT NULL,
      tag_label TEXT NOT NULL,
      card_type TEXT NOT NULL DEFAULT 'chinese-main',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS course_swap_requests (
      id TEXT PRIMARY KEY,
      applicant_teacher_id TEXT NOT NULL,
      target_teacher_name TEXT NOT NULL,
      source_period_desc TEXT NOT NULL,
      target_period_desc TEXT NOT NULL,
      reason TEXT NOT NULL,
      approval_status TEXT NOT NULL DEFAULT 'APPROVED',
      approved_by TEXT DEFAULT '陈铭 (语文教研组长)',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS homework_assignments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      course_tag TEXT NOT NULL,
      class_id TEXT NOT NULL,
      max_score REAL NOT NULL DEFAULT 100,
      submitted_count INTEGER NOT NULL DEFAULT 1,
      total_students INTEGER NOT NULL DEFAULT 1,
      graded_count INTEGER NOT NULL DEFAULT 1,
      avg_score REAL NOT NULL DEFAULT 98.0,
      excellent_rate REAL NOT NULL DEFAULT 100.0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS homework_submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      class_name TEXT NOT NULL DEFAULT '高二(1)班',
      total_score REAL,
      question_score REAL NOT NULL DEFAULT 24.5,
      status TEXT NOT NULL DEFAULT 'graded',
      tag_text TEXT NOT NULL DEFAULT '',
      status_badge TEXT NOT NULL DEFAULT '',
      is_model_essay INTEGER NOT NULL DEFAULT 0,
      stamp_type TEXT,
      payload_json TEXT NOT NULL,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      graded_at TEXT
    );

    CREATE TABLE IF NOT EXISTS lesson_plans (
      id TEXT PRIMARY KEY,
      unit_code TEXT NOT NULL DEFAULT 'u2',
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'all',
      badge_text TEXT DEFAULT '',
      author_name TEXT NOT NULL,
      citation_count INTEGER NOT NULL DEFAULT 120,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS exam_analytics_batches (
      id TEXT PRIMARY KEY,
      exam_title TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      class_id TEXT NOT NULL,
      class_avg REAL NOT NULL,
      grade_avg REAL NOT NULL,
      excellent_rate REAL NOT NULL,
      pass_rate REAL NOT NULL,
      ai_confidence REAL NOT NULL DEFAULT 98.4,
      core_conclusion TEXT NOT NULL,
      tactical_advice TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS coaching_journals (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      teacher_id TEXT NOT NULL DEFAULT 'fac-admin',
      date_title TEXT NOT NULL,
      tag TEXT NOT NULL,
      content TEXT NOT NULL,
      teacher_name TEXT NOT NULL DEFAULT '林知夏 老师',
      status_text TEXT NOT NULL DEFAULT '已同步成长档案',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS home_school_threads (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      class_name TEXT NOT NULL DEFAULT '高二(1)班',
      role_tag TEXT NOT NULL DEFAULT '',
      topic_tag TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'all',
      unread_count INTEGER NOT NULL DEFAULT 0,
      last_time TEXT NOT NULL DEFAULT '',
      last_message TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS home_school_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      content TEXT NOT NULL,
      medal_attached_json TEXT,
      sent_time_label TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS sql_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trace_id TEXT NOT NULL,
      fn_name TEXT NOT NULL,
      http_method TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      sql_text TEXT NOT NULL,
      rows_affected INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
`;
