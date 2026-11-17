-- Apply to the active SakuraEdu TiDB schema after taking a database backup.
-- No account profile text is interpreted as an authorization relationship.
CREATE TABLE faculty_class_defaults (
  account_id VARCHAR(128) NOT NULL,
  class_id VARCHAR(128) NULL,
  updated_at LONGTEXT NOT NULL,
  PRIMARY KEY (account_id),
  KEY idx_class (class_id),
  CONSTRAINT faculty_class_defaults_account_fk
    FOREIGN KEY (account_id) REFERENCES faculty_users(id),
  CONSTRAINT faculty_class_defaults_class_fk
    FOREIGN KEY (class_id) REFERENCES academic_classes(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

CREATE TABLE schedule_task_pool (
  id VARCHAR(128) NOT NULL,
  owner_id VARCHAR(128) NOT NULL,
  title LONGTEXT NOT NULL,
  note LONGTEXT NOT NULL,
  preferred_class_id VARCHAR(128) NULL,
  status VARCHAR(128) NOT NULL DEFAULT 'open',
  submission_id VARCHAR(128) NULL,
  version BIGINT NOT NULL DEFAULT 1,
  created_at LONGTEXT NOT NULL,
  updated_at VARCHAR(128) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY idx_submission (submission_id),
  KEY idx_owner_status_updated (owner_id, status, updated_at),
  CONSTRAINT schedule_task_pool_title_check
    CHECK (CHAR_LENGTH(trim(title)) BETWEEN 1 AND 120),
  CONSTRAINT schedule_task_pool_status_check
    CHECK (status IN ('open','linked','cancelled')),
  CONSTRAINT schedule_task_pool_link_check
    CHECK ((status='linked' AND submission_id IS NOT NULL) OR (status<>'linked' AND submission_id IS NULL)),
  CONSTRAINT schedule_task_pool_owner_fk
    FOREIGN KEY (owner_id) REFERENCES faculty_users(id),
  CONSTRAINT schedule_task_pool_class_fk
    FOREIGN KEY (preferred_class_id) REFERENCES academic_classes(id),
  CONSTRAINT schedule_task_pool_submission_fk
    FOREIGN KEY (submission_id) REFERENCES schedule_submissions(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

INSERT INTO schema_migrations(version,name,checksum,applied_at)
VALUES (16,'private-schedule-task-pool','1910748368abdce6fb80c21dcbdd07dc6338c8480ab01597c6e9e9a7acbee05b',DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%dT%H:%i:%s.%fZ'));

