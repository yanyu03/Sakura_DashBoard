-- =============================================================================
-- SakuraEdu 樱花教务云 · 教师端专属空间 (v4.2 LTS)
-- 核心业务数据库建表脚本 (PostgreSQL 15+ / MySQL 8.0+ 兼容标准 DDL)
-- 包含：教师认证、班级学籍、五维学情、排课课表、调代课、作业批改、备课教案、考务分析、家校沟通
-- =============================================================================

-- 1. 教师与教工统一认证表 (faculty_users)
CREATE TABLE IF NOT EXISTS faculty_users (
    id                  VARCHAR(64) PRIMARY KEY,
    faculty_code        VARCHAR(32) NOT NULL UNIQUE COMMENT '教工号，如 T880421',
    email               VARCHAR(128) NOT NULL UNIQUE COMMENT '校园邮箱',
    phone               VARCHAR(20) UNIQUE COMMENT '预留手机号',
    password_hash       VARCHAR(255) NOT NULL,
    full_name           VARCHAR(64) NOT NULL COMMENT '教师姓名，如 林知夏',
    title_role          VARCHAR(64) NOT NULL COMMENT '职务描述，如 高二(3)班班主任 · 语文组',
    department          VARCHAR(64) NOT NULL DEFAULT '高中语文教研组',
    avatar_url          VARCHAR(512),
    dnd_enabled         BOOLEAN NOT NULL DEFAULT TRUE COMMENT '下班免打扰模式开关',
    dnd_start_time      VARCHAR(10) NOT NULL DEFAULT '20:30',
    dnd_end_time        VARCHAR(10) NOT NULL DEFAULT '07:30',
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login_at       TIMESTAMP NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 行政班级与教学班表 (academic_classes)
CREATE TABLE IF NOT EXISTS academic_classes (
    id                  VARCHAR(64) PRIMARY KEY,
    class_code          VARCHAR(32) NOT NULL UNIQUE COMMENT '班级编码，如 G2-201, G2-203',
    class_name          VARCHAR(64) NOT NULL COMMENT '班级名称，如 高二(1)班',
    grade_level         VARCHAR(32) NOT NULL COMMENT '年级，如 高二',
    head_teacher_id     VARCHAR(64) REFERENCES faculty_users(id),
    chinese_teacher_id  VARCHAR(64) REFERENCES faculty_users(id),
    student_count       INT NOT NULL DEFAULT 45,
    room_location       VARCHAR(64) NOT NULL COMMENT '固定教室，如 行知楼 301',
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 学生学籍与五维能力全景档案表 (student_profiles)
CREATE TABLE IF NOT EXISTS student_profiles (
    id                  VARCHAR(64) PRIMARY KEY,
    student_no          VARCHAR(32) NOT NULL UNIQUE COMMENT '学号，如 20230104',
    short_no            VARCHAR(16) NOT NULL COMMENT '班内短学号，如 04',
    full_name           VARCHAR(64) NOT NULL,
    class_id            VARCHAR(64) NOT NULL REFERENCES academic_classes(id),
    role_title          VARCHAR(64) DEFAULT '班级成员' COMMENT '如 语文课代表',
    avatar_char         VARCHAR(8) NOT NULL,
    avatar_url          VARCHAR(512),
    badge_text          VARCHAR(64) NOT NULL COMMENT '如 ✨ 樱花优选 / ⚠️ 偏科预警',
    badge_type          VARCHAR(24) NOT NULL DEFAULT 'normal' COMMENT 'preferred|warning|progress|leave|normal',
    tag_category        VARCHAR(24) NOT NULL DEFAULT 'focus' COMMENT 'focus|progress|coaching|competition|care',
    rank_badge          VARCHAR(32) COMMENT '如 Top 4',
    trend_text          VARCHAR(32) COMMENT '如 年级前5% / +18分',
    trend_dir           VARCHAR(12) NOT NULL DEFAULT 'up' COMMENT 'up|down|flat',
    daily_status        VARCHAR(128) COMMENT '今日在校状态',
    bio                 TEXT COMMENT '教师学情评语画像',
    -- 语文学科五维能力评分 (0-100)
    radar_classical     DECIMAL(5,2) NOT NULL DEFAULT 85.00 COMMENT '文言理解',
    radar_modern        DECIMAL(5,2) NOT NULL DEFAULT 85.00 COMMENT '现代主旨',
    radar_writing       DECIMAL(5,2) NOT NULL DEFAULT 85.00 COMMENT '写作立意',
    radar_poetry        DECIMAL(5,2) NOT NULL DEFAULT 85.00 COMMENT '诗词鉴赏',
    radar_basics        DECIMAL(5,2) NOT NULL DEFAULT 85.00 COMMENT '基础字词',
    radar_overall       DECIMAL(5,2) NOT NULL DEFAULT 85.00 COMMENT '五维综合得分',
    strength_module     VARCHAR(128) COMMENT '核心优势模块',
    potential_module    VARCHAR(128) COMMENT '进阶增分潜力模块',
    attendance_metric   VARCHAR(64) DEFAULT '100% 考勤全满',
    interaction_metric  VARCHAR(64) DEFAULT '95% 课堂互动',
    quiz_speed_metric   VARCHAR(64) DEFAULT '随堂速测 Top 5',
    parent_name         VARCHAR(64),
    care_kit_title      VARCHAR(128),
    care_kit_sub        VARCHAR(255),
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_profiles_class ON student_profiles(class_id, tag_category);

-- 4. 排课与课表矩阵表 (timetable_schedules)
CREATE TABLE IF NOT EXISTS timetable_schedules (
    id                  VARCHAR(64) PRIMARY KEY,
    semester            VARCHAR(32) NOT NULL DEFAULT '2024-SPRING',
    week_num            INT NOT NULL DEFAULT 12,
    day_of_week         INT NOT NULL COMMENT '0=周一, 1=周二, 2=周三, 3=周四, 4=周五, 5=周末拓展',
    period_id           VARCHAR(32) NOT NULL COMMENT 'morning-read|am-12|am-34|pm-56|pm-78|evening-study',
    period_name         VARCHAR(32) NOT NULL,
    time_range          VARCHAR(32) NOT NULL,
    teacher_id          VARCHAR(64) NOT NULL REFERENCES faculty_users(id),
    class_group         VARCHAR(16) NOT NULL DEFAULT 'both' COMMENT '201|203|both|none',
    course_title        VARCHAR(128) NOT NULL,
    course_subtitle     VARCHAR(255),
    room_name           VARCHAR(64) NOT NULL,
    tag_label           VARCHAR(32) NOT NULL,
    tag_style           VARCHAR(24) NOT NULL DEFAULT 'primary',
    card_type           VARCHAR(24) NOT NULL DEFAULT 'chinese-main' COMMENT 'active-now|chinese-main|research|duty|swap|empty',
    extra_meta          VARCHAR(64),
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timetable_teacher_week ON timetable_schedules(teacher_id, semester, week_num);

-- 5. 调代课申请与审批记录表 (course_swap_requests)
CREATE TABLE IF NOT EXISTS course_swap_requests (
    id                      VARCHAR(64) PRIMARY KEY,
    applicant_teacher_id    VARCHAR(64) NOT NULL REFERENCES faculty_users(id),
    target_teacher_name     VARCHAR(64) NOT NULL COMMENT '对调教师，如 李老师 (英语组)',
    source_period_desc      VARCHAR(128) NOT NULL COMMENT '换出节次描述',
    target_period_desc      VARCHAR(128) NOT NULL COMMENT '换入节次描述',
    reason                  VARCHAR(255) NOT NULL,
    approval_status         VARCHAR(24) NOT NULL DEFAULT 'APPROVED' COMMENT 'PENDING|APPROVED|REJECTED',
    approver_name           VARCHAR(64) DEFAULT '高二语文教研组长',
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. 作业批次表 (homework_assignments)
CREATE TABLE IF NOT EXISTS homework_assignments (
    id                  VARCHAR(64) PRIMARY KEY,
    title               VARCHAR(128) NOT NULL COMMENT '如 《赤壁赋》文言主旨与哲学拓展思考',
    subtitle            VARCHAR(128) NOT NULL DEFAULT '第四课时主观卷',
    course_badge        VARCHAR(64) NOT NULL DEFAULT '🌸 必修下 · 文言核心课',
    class_id            VARCHAR(64) NOT NULL REFERENCES academic_classes(id),
    max_score           DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    question_stem       TEXT NOT NULL,
    total_students      INT NOT NULL DEFAULT 45,
    submitted_count     INT NOT NULL DEFAULT 43,
    graded_count        INT NOT NULL DEFAULT 38,
    average_score       DECIMAL(5,2) NOT NULL DEFAULT 88.50,
    excellent_rate      DECIMAL(5,2) NOT NULL DEFAULT 34.20,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. 学生作业提交与 AI 诊断切片表 (homework_submissions)
CREATE TABLE IF NOT EXISTS homework_submissions (
    id                  VARCHAR(64) PRIMARY KEY,
    assignment_id       VARCHAR(64) NOT NULL REFERENCES homework_assignments(id),
    student_id          VARCHAR(64) NOT NULL REFERENCES student_profiles(id),
    total_score         DECIMAL(5,2) NULL COMMENT '终核总分',
    question_score      DECIMAL(5,2) NOT NULL DEFAULT 24.50,
    question_max_score  DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    status              VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'graded|ai-pregraded|needs-correction|pending',
    status_badge        VARCHAR(64) NOT NULL,
    is_model_essay      BOOLEAN NOT NULL DEFAULT FALSE,
    neatness_rating     VARCHAR(16) NOT NULL DEFAULT 'A+',
    stamp_type          VARCHAR(32) NULL COMMENT '妙笔生花|见解独到|NULL',
    excerpt             VARCHAR(255),
    essay_paragraphs    JSON NOT NULL COMMENT '段落原文与红笔批注气泡结构',
    audio_note_json     JSON NOT NULL COMMENT '教师语音评语时长、转写文本与落款时间',
    ai_diagnostic_json  JSON NOT NULL COMMENT 'Sakura-AI 答卷诊断亮点、提分锦囊与推荐练习',
    submitted_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    graded_at           TIMESTAMP NULL
);

CREATE INDEX idx_submissions_assignment_status ON homework_submissions(assignment_id, status);

-- 8. 备课教案与教学资源库表 (lesson_plans)
CREATE TABLE IF NOT EXISTS lesson_plans (
    id                  VARCHAR(64) PRIMARY KEY,
    textbook_version    VARCHAR(64) NOT NULL DEFAULT '统编高中语文 · 必修下册',
    unit_code           VARCHAR(16) NOT NULL COMMENT 'u1|u2|u3',
    unit_title          VARCHAR(128) NOT NULL,
    title               VARCHAR(128) NOT NULL,
    summary             TEXT NOT NULL,
    category            VARCHAR(32) NOT NULL DEFAULT 'ppt' COMMENT 'ppt|video|audio|worksheet',
    honor_badge         VARCHAR(64),
    resource_meta       VARCHAR(64) COMMENT '如 45页配套PPT',
    author_name         VARCHAR(64) NOT NULL,
    citation_count      INT NOT NULL DEFAULT 0,
    rating_score        DECIMAL(3,1) NOT NULL DEFAULT 4.9,
    tags_json           JSON NOT NULL,
    updated_label       VARCHAR(64) NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. 考务场次与大题切片分析表 (exam_analytics_batches)
CREATE TABLE IF NOT EXISTS exam_analytics_batches (
    id                  VARCHAR(64) PRIMARY KEY,
    exam_title          VARCHAR(128) NOT NULL,
    exam_date           VARCHAR(32) NOT NULL,
    class_id            VARCHAR(64) NOT NULL REFERENCES academic_classes(id),
    class_avg_score     DECIMAL(5,2) NOT NULL,
    grade_avg_score     DECIMAL(5,2) NOT NULL,
    excellent_rate      DECIMAL(5,2) NOT NULL,
    pass_rate           DECIMAL(5,2) NOT NULL,
    progress_count      INT NOT NULL DEFAULT 28,
    stable_count        INT NOT NULL DEFAULT 11,
    decline_count       INT NOT NULL DEFAULT 6,
    question_slices     JSON NOT NULL COMMENT '六大题型得分率与痛点诊断 JSON',
    ai_insight_json     JSON NOT NULL COMMENT 'Sakura-Insight 学情书结论与干预建议',
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. 教师面批手账备忘录表 (coaching_journals)
CREATE TABLE IF NOT EXISTS coaching_journals (
    id                  VARCHAR(64) PRIMARY KEY,
    student_id          VARCHAR(64) NOT NULL REFERENCES student_profiles(id),
    teacher_id          VARCHAR(64) NOT NULL REFERENCES faculty_users(id),
    date_title          VARCHAR(64) NOT NULL,
    tag                 VARCHAR(32) NOT NULL,
    content             TEXT NOT NULL,
    status_text         VARCHAR(64) DEFAULT '已同步成长档案',
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. 家校协同会话与私信消息表 (home_school_threads & home_school_messages)
CREATE TABLE IF NOT EXISTS home_school_threads (
    id                  VARCHAR(64) PRIMARY KEY,
    student_id          VARCHAR(64) REFERENCES student_profiles(id),
    parent_name         VARCHAR(64) NOT NULL,
    student_name        VARCHAR(64) NOT NULL,
    class_name          VARCHAR(64) NOT NULL,
    role_tag            VARCHAR(64) NOT NULL,
    avatar_char         VARCHAR(8) NOT NULL,
    is_official_channel BOOLEAN NOT NULL DEFAULT FALSE,
    unread_count        INT NOT NULL DEFAULT 0,
    category            VARCHAR(24) NOT NULL DEFAULT 'all' COMMENT 'all|unread|praise|visit',
    intimacy_score      INT NOT NULL DEFAULT 95,
    mother_info_json    JSON NOT NULL,
    father_info_json    JSON NOT NULL,
    interaction_stats   JSON NOT NULL,
    last_message        VARCHAR(255),
    last_time_label     VARCHAR(32),
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_school_messages (
    id                  VARCHAR(64) PRIMARY KEY,
    thread_id           VARCHAR(64) NOT NULL REFERENCES home_school_threads(id),
    sender_role         VARCHAR(16) NOT NULL COMMENT 'parent|teacher',
    sender_name         VARCHAR(64) NOT NULL,
    content             TEXT NOT NULL,
    medal_attached_json JSON NULL COMMENT '附带颁发的樱花勋章 JSON',
    sent_time_label     VARCHAR(32) NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
