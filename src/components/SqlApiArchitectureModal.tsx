import React, { useCallback, useEffect, useState } from 'react';
import { SAKURA_SQL_TABLES } from '../database/sqlSchema';
import { sakuraAIService } from '../services/aiService';
import { sakuraApi } from '../services/sakuraApiService';
import {
  SAKURA_API_ENDPOINTS,
  SqliteQueryResultDTO,
  SqliteStatusDTO,
} from '../types/api';

interface SqlApiArchitectureModalProps {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

const PRESET_SQLITE_QUERIES = [
  {
    label: '查询教师账户表 (faculty_users)',
    sql: 'SELECT id, faculty_code, full_name, title_role, department, status FROM faculty_users;',
  },
  {
    label: '查询学生五维档案 (student_profiles)',
    sql: 'SELECT id, student_no, full_name, role_badge, rank_label, tag_label, composite_score FROM student_profiles ORDER BY student_no;',
  },
  {
    label: '查询作业批阅记录 (homework_submissions)',
    sql: 'SELECT id, student_name, total_score, status, tag_text, stamp_type, submitted_at FROM homework_submissions;',
  },
  {
    label: '查询验证码签发核销记录 (security_captchas)',
    sql: 'SELECT captcha_id, mode, answer_hash, verified, expires_at, created_at FROM security_captchas ORDER BY created_at DESC LIMIT 8;',
  },
  {
    label: '查询 SQLite 审计日志 (sql_audit_logs)',
    sql: 'SELECT id, trace_id, fn_name, http_method, endpoint, created_at FROM sql_audit_logs ORDER BY id DESC LIMIT 10;',
  },
];

export const SqlApiArchitectureModal: React.FC<SqlApiArchitectureModalProps> = ({
  open,
  onClose,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'sqlite' | 'sql' | 'api' | 'functions' | 'logs'
  >('sqlite');
  const [selectedTable, setSelectedTable] = useState(
    SAKURA_SQL_TABLES[0].tableName
  );
  const [, setLogRefreshTick] = useState(0);

  // Live SQLite backup status & interactive console state
  const [sqliteStatus, setSqliteStatus] = useState<SqliteStatusDTO | null>(null);
  const [customSql, setCustomSql] = useState<string>(
    PRESET_SQLITE_QUERIES[1].sql
  );
  const [queryResult, setQueryResult] = useState<SqliteQueryResultDTO | null>(
    null
  );
  const [queryLoading, setQueryLoading] = useState(false);

  const refreshSqliteStatus = useCallback(async () => {
    const res = await sakuraApi.sqlite.getStatus();
    if (res.success && res.data) {
      setSqliteStatus(res.data);
    }
  }, []);

  const handleExecuteLiveSql = useCallback(
    async (sqlToRun: string = customSql) => {
      if (!sqlToRun.trim()) return;
      setQueryLoading(true);
      try {
        const res = await sakuraApi.sqlite.executeQuery(sqlToRun);
        if (res.success && res.data) {
          setQueryResult(res.data);
          showToast(res.message);
          refreshSqliteStatus();
        } else {
          showToast(res.message || 'SQL 执行异常');
        }
      } finally {
        setQueryLoading(false);
        setLogRefreshTick((t) => t + 1);
      }
    },
    [customSql, refreshSqliteStatus, showToast]
  );

  useEffect(() => {
    if (open) {
      refreshSqliteStatus();
      handleExecuteLiveSql(PRESET_SQLITE_QUERIES[1].sql);
    }
  }, [open, refreshSqliteStatus, handleExecuteLiveSql]);

  if (!open) return null;

  const currentTable =
    SAKURA_SQL_TABLES.find((t) => t.tableName === selectedTable) ||
    SAKURA_SQL_TABLES[0];

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(`已复制 ${label} 至剪贴板`);
  };

  const handleReseedSqlite = async () => {
    const res = await sakuraApi.sqlite.reseedDatabase();
    if (res.success) {
      showToast(res.message);
      await refreshSqliteStatus();
      await handleExecuteLiveSql(customSql);
    }
  };

  const handleDryRunEndpoint = async (endpointId: string) => {
    if (endpointId === 'security-captcha') {
      await sakuraApi.security.generateCaptcha('graphic');
    } else if (endpointId === 'sqlite-status') {
      await sakuraApi.sqlite.getStatus();
    } else if (endpointId === 'auth-login') {
      await sakuraApi.auth.loginWithCredentials({
        facultyId: 'T880421@sakura.edu.cn',
        loginType: 'account',
      });
    } else if (endpointId === 'schedule-matrix') {
      await sakuraApi.schedule.getWeeklyTimetable(12, 'my-schedule');
    } else if (endpointId === 'schedule-swap') {
      await sakuraApi.schedule.submitCourseSwap({
        applicantTeacherId: 'fac-lin-zhixia',
        targetTeacherName: '李老师 (英语组)',
        sourcePeriodDesc: '周五 上午第 3-4 节',
        targetPeriodDesc: '周三 下午第 5 节',
        reason: '参加市级高中语文大单元公开课教研研讨',
      });
    } else if (endpointId === 'homework-list') {
      await sakuraApi.homework.getClassSubmissions('高二(1)班', 'all');
    } else if (endpointId === 'homework-grade') {
      await sakuraApi.homework.submitGrade({
        submissionId: 'su-xiaomeng',
        assignmentId: 'assign-chibifu-04',
        studentId: 'su-xiaomeng',
        score: 98,
        stamp: '妙笔生花',
      });
    } else if (endpointId === 'student-panorama') {
      await sakuraApi.student.getStudentProfiles('G2-201', 'all');
    } else if (endpointId === 'student-journal') {
      await sakuraApi.student.addCoachingJournal(
        'su-xiaomeng',
        '苏小萌',
        '文言实词掌握扎实，建议拓展先秦诸子散文阅读'
      );
    } else if (endpointId === 'lesson-save') {
      await sakuraApi.lesson.saveLessonPlan({
        unitCode: 'u2',
        title: '《雷雨》四幕戏结构深度剖析与话语潜台词',
        description: '聚焦周朴园与鲁侍萍重逢场景，双线探究任务单',
        authorName: '林知夏',
      });
    } else if (endpointId === 'exam-slices') {
      await sakuraApi.exam.getBatchAnalytics(
        '2023-2024学年第二学期 高二年级期中联合大考 (语文)'
      );
    } else if (endpointId === 'comm-message') {
      await sakuraApi.comm.sendParentMessage({
        threadId: 'thread-su',
        content: '小萌近期课堂表现极佳，特发喜报！',
        withSakuraMedal: true,
      });
    }
    await refreshSqliteStatus();
    setLogRefreshTick((t) => t + 1);
    setActiveTab('logs');
    showToast('已执行真实 SQLite 接口函数调用并记录 SQL 审计日志');
  };

  const recentLogs = sakuraApi.getRecentCallLogs();

  return (
    <div className="fixed inset-0 z-[70] bg-inverse-surface/55 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="bg-surface-container-lowest rounded-lg w-full max-w-5xl max-h-[92vh] shadow-2xl border border-outline-variant/35 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-surface-container-low/80 border-b border-outline-variant/25 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded bg-primary text-on-primary flex items-center justify-center shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-lg">database</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold">
                  SakuraEdu 纯本地 SQLite 备件库 · 验证码安全网关与接口总览
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px] font-semibold">
                  data/sakura_edu.sqlite · WAL Mode
                </span>
              </div>
              <p className="text-xs text-on-surface-variant truncate mt-0.5">
                默认使用本地 SQLite3 嵌入式数据库作为全量持久化备件，集成开源 svg-captcha 验证码核销体系
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={sakuraApi.sqlite.getBackupDownloadUrl()}
              download="sakura_edu_backup.sqlite"
              className="px-3 py-1.5 rounded bg-secondary text-on-secondary font-label-sm text-xs flex items-center gap-1 hover:opacity-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>下载 .sqlite 本地备件包</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded bg-surface-container-lowest border border-outline-variant/25 flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 py-2 bg-surface border-b border-outline-variant/20 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {[
              {
                id: 'sqlite',
                icon: 'hard_drive',
                label: '本地 SQLite 备件库 & 实时 SQL 终端',
              },
              {
                id: 'sql',
                icon: 'table_chart',
                label: 'SQL 建表 DDL & 查询模板',
              },
              {
                id: 'api',
                icon: 'api',
                label: `REST 接口契约 (${SAKURA_API_ENDPOINTS.length}端点)`,
              },
              {
                id: 'functions',
                icon: 'functions',
                label: '前端业务与 AI 函数层',
              },
              {
                id: 'logs',
                icon: 'terminal',
                label: `实时 SQL 审计栈 (${recentLogs.length})`,
              },
            ].map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`px-3 py-1.5 rounded font-label-sm text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-primary text-on-primary font-semibold shadow-2xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
          {/* TAB 0: Live Local SQLite Backup Engine & Interactive SQL Runner */}
          {activeTab === 'sqlite' && (
            <div className="space-y-4">
              {/* Top Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 space-y-1">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>本地数据库备件引擎</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  </div>
                  <div className="font-mono text-sm font-bold text-on-surface truncate">
                    better-sqlite3 (WAL)
                  </div>
                  <div className="font-mono text-[11px] text-primary truncate">
                    {sqliteStatus?.dbPath || 'data/sakura_edu.sqlite'}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 space-y-1">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>物理备件体积 / 表数量</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-primary font-mono text-[10px] font-bold">
                      READY
                    </span>
                  </div>
                  <div className="font-headline-sm text-lg font-bold text-secondary">
                    {sqliteStatus?.fileSizeFormatted || '96.0 KB'} ·{' '}
                    {sqliteStatus?.totalTables || 14} 张表
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    支持离线单文件迁移与热备份下载
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 space-y-1">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>开源安全验证码表</span>
                    <span className="font-mono text-[10px] text-secondary">
                      svg-captcha
                    </span>
                  </div>
                  <div className="font-headline-sm text-lg font-bold text-on-surface">
                    {sqliteStatus?.tableCounts?.security_captchas ?? 1} 条票据
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    支持图形噪点 / 算术矢量 / 滑块轨迹
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between">
                  <div className="text-xs text-on-surface-variant">
                    备件库维护动作
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleReseedSqlite}
                      className="flex-1 py-1.5 px-2.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs flex items-center justify-center gap-1 border border-outline-variant/30 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">
                        restart_alt
                      </span>
                      <span>重置初始种子数据</span>
                    </button>
                    <button
                      type="button"
                      onClick={refreshSqliteStatus}
                      className="py-1.5 px-2.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-xs cursor-pointer"
                    >
                      刷新
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Row Counts Matrix */}
              {sqliteStatus?.tableCounts && (
                <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">
                        dataset
                      </span>
                      本地 SQLite 14 张物理表实时数据行数 (点击表名可直接查询)
                    </span>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      PRAGMA journal_mode = {sqliteStatus.journalMode}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {Object.entries(sqliteStatus.tableCounts).map(
                      ([tblName, count]) => (
                        <button
                          key={tblName}
                          type="button"
                          onClick={() => {
                            const nextSql = `SELECT * FROM ${tblName} LIMIT 20;`;
                            setCustomSql(nextSql);
                            handleExecuteLiveSql(nextSql);
                          }}
                          className="p-2 rounded bg-surface-container-low hover:bg-primary-fixed/50 border border-outline-variant/25 text-left transition-all cursor-pointer"
                        >
                          <div className="font-mono text-[11px] font-bold text-primary truncate">
                            {tblName}
                          </div>
                          <div className="text-xs font-semibold text-on-surface mt-0.5">
                            {count} 行记录
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Interactive Live SQLite Terminal */}
              <div className="p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">
                      terminal
                    </span>
                    <span className="font-headline-sm text-xs sm:text-sm font-bold text-on-surface">
                      SQLite 实时 SQL 查询与写入终端 (直连 data/sakura_edu.sqlite)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {PRESET_SQLITE_QUERIES.map((q) => (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => {
                          setCustomSql(q.sql);
                          handleExecuteLiveSql(q.sql);
                        }}
                        className="px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-[11px] font-label-sm cursor-pointer border border-outline-variant/20"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    rows={2}
                    value={customSql}
                    onChange={(e) => setCustomSql(e.target.value)}
                    className="flex-1 p-2.5 rounded bg-[#14231A] text-[#DCFCE7] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="输入 SELECT / INSERT / UPDATE 语句直接操作本地 SQLite 备件库..."
                  />
                  <button
                    type="button"
                    disabled={queryLoading}
                    onClick={() => handleExecuteLiveSql(customSql)}
                    className="px-4 py-2 rounded bg-primary text-on-primary font-headline-sm text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 hover:opacity-95"
                  >
                    <span className="material-symbols-outlined text-base">
                      play_arrow
                    </span>
                    <span>{queryLoading ? '执行中...' : '执行 SQLite 语句'}</span>
                  </button>
                </div>

                {/* Live Query Result Table */}
                {queryResult && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>
                        执行模式:{' '}
                        <strong className="font-mono text-primary">
                          {queryResult.mode}
                        </strong>
                      </span>
                      <span>
                        {queryResult.mode === 'SELECT'
                          ? `返回 ${queryResult.rowCount ?? 0} 行记录`
                          : `受影响行数: ${queryResult.changes ?? 0}`}
                      </span>
                    </div>

                    {queryResult.rows && queryResult.rows.length > 0 ? (
                      <div className="overflow-x-auto rounded border border-outline-variant/30 max-h-60">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface">
                              {Object.keys(queryResult.rows[0]).map((col) => (
                                <th
                                  key={col}
                                  className="py-2 px-2.5 font-bold whitespace-nowrap"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                            {queryResult.rows.map((row, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-surface-container-low/50"
                              >
                                {Object.values(row).map((val, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="py-1.5 px-2.5 text-on-surface-variant max-w-xs truncate"
                                  >
                                    {val === null
                                      ? 'NULL'
                                      : typeof val === 'object'
                                      ? JSON.stringify(val)
                                      : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-3 rounded bg-surface-container-low text-xs font-mono text-on-surface-variant">
                        {JSON.stringify(queryResult)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: SQL Schema */}
          {activeTab === 'sql' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Table Selector */}
              <div className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                {SAKURA_SQL_TABLES.map((tbl) => {
                  const active = tbl.tableName === currentTable.tableName;
                  return (
                    <button
                      key={tbl.tableName}
                      type="button"
                      onClick={() => setSelectedTable(tbl.tableName)}
                      className={`p-3 rounded-lg border text-left transition-all shrink-0 w-60 lg:w-full cursor-pointer ${
                        active
                          ? 'bg-primary-fixed/45 border-primary shadow-2xs'
                          : 'bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-secondary">
                          {tbl.tableName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-surface-container text-[10px] text-on-surface-variant whitespace-nowrap">
                          {tbl.moduleName}
                        </span>
                      </div>
                      <div className="font-headline-sm text-xs text-on-surface font-semibold mt-1">
                        {tbl.chineseTitle}
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                        {tbl.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Right DDL & Sample Query */}
              <div className="lg:col-span-8 flex flex-col gap-3">
                <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/25 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-secondary">
                        {currentTable.tableName}
                      </span>
                      <span className="ml-2 font-headline-sm text-sm text-on-surface font-bold">
                        {currentTable.chineseTitle}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          currentTable.ddl,
                          `${currentTable.tableName} DDL`
                        )
                      }
                      className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">
                        content_copy
                      </span>
                      复制建表语句
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {currentTable.description}
                  </p>
                  <pre className="p-3.5 rounded bg-[#14231A] text-[#DCFCE7] font-mono text-xs overflow-x-auto leading-relaxed">
                    {currentTable.ddl}
                  </pre>
                </div>

                <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-xs text-on-surface font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        query_stats
                      </span>
                      高频业务参数化 SQL 查询 / 更新模板
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          currentTable.sampleQuery,
                          `${currentTable.tableName} 查询模板`
                        )
                      }
                      className="text-xs text-secondary hover:underline cursor-pointer"
                    >
                      复制 SQL
                    </button>
                  </div>
                  <pre className="p-3 rounded bg-surface-container-low text-on-surface font-mono text-xs overflow-x-auto">
                    {currentTable.sampleQuery}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REST API Endpoints */}
          {activeTab === 'api' && (
            <div className="space-y-2.5">
              {SAKURA_API_ENDPOINTS.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                          ep.method === 'GET'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ep.method === 'POST'
                            ? 'bg-secondary text-on-secondary'
                            : 'bg-primary-container text-on-primary-container'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-on-surface">
                        {ep.path}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px]">
                        {ep.module}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary-fixed/40 text-primary font-mono text-[11px]">
                        SQLite表: {ep.boundTable}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">{ep.summary}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-outline">
                      <span>调用函数: {ep.functionName}</span>
                      <span>返回契约: {ep.responseSchema}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDryRunEndpoint(ep.id)}
                      className="px-3 py-1.5 rounded bg-secondary text-on-secondary font-label-sm text-xs flex items-center gap-1 shadow-2xs hover:opacity-95 cursor-pointer whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-sm">
                        play_arrow
                      </span>
                      <span>实测调用本地 SQLite</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Frontend Service & AI Function System */}
          {activeTab === 'functions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-sm text-on-surface font-bold">
                    1. 本地 SQLite & 开源验证码服务体系 (sakuraApi)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                    默认直连 SQLite
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  位于 <code className="font-mono text-secondary">src/services/sakuraApiService.ts</code> 与 <code className="font-mono text-secondary">server/sqliteDb.ts</code>：
                </p>
                <pre className="p-3 rounded bg-[#14231A] text-[#DCFCE7] font-mono text-xs overflow-x-auto leading-relaxed">
{`// 0. 开源 svg-captcha 验证码生成与核销：
await sakuraApi.security.generateCaptcha('graphic' | 'math' | 'slider');
await sakuraApi.security.verifyCaptcha(captchaId, userAnswer, mode);

// 1. 纯本地 SQLite 备件库运维与实时查询：
await sakuraApi.sqlite.getStatus();
await sakuraApi.sqlite.executeQuery('SELECT * FROM student_profiles;');
await sakuraApi.sqlite.reseedDatabase();
sakuraApi.sqlite.getBackupDownloadUrl(); // 下载 .sqlite 物理文件

// 2. 教务核心业务持久化方法：
await sakuraApi.auth.loginWithCredentials(payload);
await sakuraApi.schedule.submitCourseSwap(swapPayload);
await sakuraApi.homework.submitGrade(gradePayload);
await sakuraApi.student.addCoachingJournal(stuId, name, text);
await sakuraApi.lesson.saveLessonPlan(lessonPayload);
await sakuraApi.comm.sendParentMessage(msgPayload);`}
                </pre>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-sm text-on-surface font-bold">
                    2. 教研大模型接口函数层 (sakuraAIService)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary text-[11px] font-semibold">
                    {sakuraAIService.getConfig().enabled ? '远程AI已开启' : '预留接口就绪'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  位于 <code className="font-mono text-secondary">src/services/aiService.ts</code>，遵循「先留接口，不写配置」原则：
                </p>
                <pre className="p-3 rounded bg-[#14231A] text-[#DCFCE7] font-mono text-xs overflow-x-auto leading-relaxed">
{`// 注入大模型网关配置：
sakuraAIService.configure({
  enabled: true,
  endpoint: '/api/sakura-ai',
  modelAlias: 'sakura-edu-llm-v4',
});

// 1. 单篇主观题答卷切片诊断
await sakuraAIService.diagnoseEssaySlice({
  assignmentId: 'chibifu-04',
  studentId: 'su-xiaomeng',
  essayContent: '...',
  rubricMaxScore: 25,
});

// 2. 全班未检答卷 AI 批量初批
await sakuraAIService.batchPreGradeEssays('高二(1)班', 7);`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Live Call & SQL Trace Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">
                  每一次前端交互均真实落盘至 <code className="font-mono text-primary">data/sakura_edu.sqlite</code> 并记录在 <code className="font-mono text-primary">sql_audit_logs</code> 表中：
                </span>
                <button
                  type="button"
                  onClick={() => handleDryRunEndpoint('security-captcha')}
                  className="px-3 py-1 rounded bg-surface-container-low hover:bg-surface-container text-secondary font-label-sm text-xs cursor-pointer whitespace-nowrap"
                >
                  + 触发一次 SQLite 验证码生成
                </button>
              </div>

              {recentLogs.length === 0 ? (
                <div className="p-8 rounded-lg bg-surface-container-lowest border border-dashed border-outline-variant/40 text-center space-y-2">
                  <span className="material-symbols-outlined text-3xl text-secondary">
                    terminal
                  </span>
                  <div className="font-headline-sm text-sm text-on-surface">
                    暂无实时接口调用日志
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/25 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary font-mono text-[10px] font-bold">
                            {log.method}
                          </span>
                          <span className="font-mono font-bold text-on-surface">
                            {log.fn}
                          </span>
                          <span className="font-mono text-on-surface-variant text-[11px]">
                            {log.endpoint}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-outline">
                          [{log.time}] {log.engine || 'SQLite3'} · {log.id}
                        </span>
                      </div>
                      <pre className="p-2 rounded bg-[#14231A] text-[#DCFCE7] font-mono text-[11px] overflow-x-auto">
                        {log.sql}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-surface-container-low/60 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
          <span>
            本地持久化备件：data/sakura_edu.sqlite (better-sqlite3) + 开源验证码：svg-captcha
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-secondary text-on-secondary font-label-sm text-xs cursor-pointer"
          >
            关闭控制台
          </button>
        </div>
      </div>
    </div>
  );
};
