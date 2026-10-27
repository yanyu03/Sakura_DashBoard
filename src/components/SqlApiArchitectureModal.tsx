import { useCallback, useEffect, useState } from "react";
import { sakuraApi } from "../services/sakuraApiService";
import {
  SAKURA_API_ENDPOINTS,
  type SqliteStatusDTO,
  type SqliteQueryResultDTO,
} from "../types/api";
import { useModalFocus } from "./useModalFocus";
export function SqlApiArchitectureModal({
  open,
  onClose,
  showToast,
}: {
  open: boolean;
  onClose: () => void;
  showToast: (message: string) => void;
}) {
  const [status, setStatus] = useState<SqliteStatusDTO | null>(null),
    [sql, setSql] = useState(
      "SELECT name,sql FROM sqlite_master WHERE type='table' ORDER BY name",
    ),
    [result, setResult] = useState<SqliteQueryResultDTO | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("status");
  const ref = useModalFocus(open, onClose);
  const load = useCallback(async () => {
    setBusy(true);
    const r = await sakuraApi.sqlite.getStatus();
    if (r.success && r.data) setStatus(r.data);
    else setError(r.message);
    setBusy(false);
  }, []);
  useEffect(() => {
    if (open) {
      setError("");
      void load();
    }
  }, [open, load]);
  if (!open) return null;
  const execute = async () => {
    setBusy(true);
    setError("");
    const r = await sakuraApi.sqlite.executeQuery(sql);
    if (r.success) {
      setResult(r.data);
      showToast(r.message);
    } else {
      setError(r.message);
      setResult(null);
    }
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 z-[220] bg-black/30 p-3 sm:p-6 flex items-center justify-center">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="SQLite 与接口控制台"
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-background text-on-surface rounded-xl border border-outline-variant p-4 sm:p-6 space-y-4"
      >
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">SQLite 与接口控制台</h2>
          <button className="sakura-btn sakura-btn-secondary" onClick={onClose}>
            关闭
          </button>
        </header>
        <p className="text-sm">
          仅管理员可访问。结构与计数直接读取当前 SQLite；任意写 SQL 默认关闭。
        </p>
        <nav className="flex flex-wrap gap-2">
          {[
            ["status", "数据库状态"],
            ["query", "SQL 查询"],
            ["api", "核心接口"],
            ["audit", "最近审计"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={tab === id}
              className={`sakura-btn ${tab === id ? "sakura-btn-primary" : "sakura-btn-secondary"}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        {error ? (
          <p role="alert" className="text-error">
            {error}
          </p>
        ) : null}
        {busy ? <p role="status">正在读取本地数据库…</p> : null}
        {tab === "status" ? (
          <>
            <div className="flex flex-wrap gap-3">
              <button
                disabled={busy}
                className="sakura-btn sakura-btn-secondary"
                onClick={() => void load()}
              >
                刷新状态
              </button>
              <a
                className="sakura-btn sakura-btn-primary"
                href="/api/v1/sqlite/backup-download"
                download
              >
                下载在线 SQLite 备份
              </a>
            </div>
            {status ? (
              <>
                <dl className="grid sm:grid-cols-2 gap-3">
                  {[
                    ["引擎", status.engine],
                    ["数据库路径", status.dbPath],
                    ["日志模式", status.journalMode],
                    ["主文件", status.fileSizeFormatted],
                    ["WAL 字节", status.walSizeBytes ?? 0],
                    ["应用表数量", status.totalTables],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-on-surface-variant">
                        {label}
                      </dt>
                      <dd className="font-mono break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-sm">
                  应用表数量不含 schema_migrations 和 SQLite 内部表；使用 SQL
                  查询可查看完整物理结构。
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(status.tableCounts).map(([name, count]) => (
                    <button
                      className="text-left border border-outline-variant rounded-xl p-3"
                      key={name}
                      onClick={() => {
                        setSql(`SELECT * FROM "${name}" LIMIT 100`);
                        setTab("query");
                      }}
                    >
                      <span className="font-mono text-sm">{name}</span>
                      <strong className="ml-3">{count}</strong>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : null}
        {tab === "query" ? (
          <section className="space-y-3">
            <label className="block">
              SQL 语句
              <textarea
                className="sakura-input block min-h-40 font-mono text-sm"
                value={sql}
                onChange={(e) => setSql(e.target.value)}
              />
            </label>
            <div className="flex gap-2">
              <button
                disabled={busy || !sql.trim()}
                className="sakura-btn sakura-btn-primary"
                onClick={() => void execute()}
              >
                执行查询
              </button>
              <button
                className="sakura-btn sakura-btn-secondary"
                onClick={() =>
                  setSql(
                    "SELECT version,name,checksum,applied_at FROM schema_migrations ORDER BY version",
                  )
                }
              >
                查看迁移记录
              </button>
            </div>
            {result ? (
              <>
                <p>
                  返回 {result.rowCount ?? 0} 行 · 修改 {result.changes ?? 0} 行
                  · 最多显示 100 行
                </p>
                <pre className="bg-surface-container-low rounded-xl p-4 overflow-x-auto text-xs">
                  {JSON.stringify(result.rows ?? result, null, 2)}
                </pre>
              </>
            ) : null}
          </section>
        ) : null}
        {tab === "api" ? (
          <section className="space-y-2">
            {SAKURA_API_ENDPOINTS.map((endpoint) => (
              <details
                key={endpoint.id}
                className="border border-outline-variant rounded-xl p-3"
              >
                <summary className="cursor-pointer font-semibold break-all">
                  {endpoint.method} {endpoint.path}
                </summary>
                <p>{endpoint.summary}</p>
                <p className="font-mono text-xs break-all">
                  {endpoint.requestSchema}
                </p>
              </details>
            ))}
          </section>
        ) : null}
        {tab === "audit" ? (
          <div className="space-y-2">
            {status?.recentAuditLogs.length ? (
              status.recentAuditLogs.map((log) => (
                <article
                  key={log.id}
                  className="border border-outline-variant rounded-xl p-3 text-sm"
                >
                  <p>
                    {log.created_at} · {log.http_method} {log.endpoint}
                  </p>
                  <p className="font-mono text-xs break-all">{log.trace_id}</p>
                </article>
              ))
            ) : (
              <p>暂无审计记录。</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
