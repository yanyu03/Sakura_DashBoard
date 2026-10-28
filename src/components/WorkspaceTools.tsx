import {SakuraIcon} from './SakuraIcon';
import { useEffect, useRef, useState } from "react";
import { sakuraApi } from "../services/sakuraApiService";
import { WorkspaceTab } from "../types/sakura";
export type NavigationTarget = {
  id: string;
  tab: WorkspaceTab;
  type: string;
  class_id?: string;
  title?: string;
  subtitle?: string;
};
type Row = Record<string, any>;
export default function WorkspaceTools({
  onNavigate,
}: {
  onNavigate: (target: NavigationTarget) => void;
}) {
  const [mode, setMode] = useState<"search" | "notifications" | null>(null),
    [query, setQuery] = useState(""),
    [results, setResults] = useState<Row[]>([]),
    [notices, setNotices] = useState<Row[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [searched, setSearched] = useState(false);
  const dialog = useRef<HTMLDivElement>(null),
    opener = useRef<HTMLElement | null>(null);
  const loadNotices = async () => {
    setBusy(true);
    setError("");
    const r = await sakuraApi.business.request("/workspace/notifications");
    if (r.success) setNotices(r.data);
    else setError(r.message);
    setBusy(false);
  };
  const open = (value: "search" | "notifications") => {
    opener.current = document.activeElement as HTMLElement;
    setMode(value);
    setError("");
    if (value === "notifications") void loadNotices();
  };
  useEffect(() => {
    if (!mode) return;
    const node = dialog.current;
    node?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode(null);
      if (e.key === "Tab") {
        const items = node?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,a[href]",
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === node)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      opener.current?.focus();
    };
  }, [mode]);
  return (
    <>
      <button
        className="w-8 h-8 rounded bg-surface-container-lowest border border-outline-variant/30"
        type="button"
        aria-label="全局搜索"
        onClick={() => open("search")}
      >
        <SakuraIcon className="material-symbols-outlined text-base">search</SakuraIcon>
      </button>
      <button
        className="w-8 h-8 rounded bg-surface-container-lowest border border-outline-variant/30"
        type="button"
        aria-label="站内通知"
        onClick={() => open("notifications")}
      >
        <SakuraIcon className="material-symbols-outlined text-base">
          notifications
        </SakuraIcon>
      </button>
      {mode ? (
        <div className="fixed inset-0 z-[210] bg-black/30 flex items-start sm:items-center justify-center p-4">
          <div
            ref={dialog}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={mode === "search" ? "全局搜索" : "站内通知"}
            className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-xl bg-surface-container-lowest border border-outline-variant p-5 space-y-4 shadow-xl"
          >
            <header className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                {mode === "search" ? "全局搜索" : "站内通知"}
              </h2>
              <button
                className="sakura-btn sakura-btn-ghost"
                onClick={() => setMode(null)}
              >
                关闭
              </button>
            </header>
            {error ? (
              <p role="alert" className="text-error">
                {error}
              </p>
            ) : null}
            {mode === "search" ? (
              <>
                <form
                  className="flex gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    setError("");
                    const r = await sakuraApi.business.request(
                      `/workspace/search?q=${encodeURIComponent(query)}`,
                    );
                    if (r.success) {
                      setResults(r.data);
                      setSearched(true);
                    } else setError(r.message);
                    setBusy(false);
                  }}
                >
                  <input
                    aria-label="搜索关键词"
                    required
                    className="sakura-input min-w-0"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSearched(false);
                    }}
                    placeholder="学生、学号、作业、教案或考试"
                  />
                  <button
                    disabled={busy}
                    className="sakura-btn sakura-btn-primary"
                  >
                    搜索
                  </button>
                </form>
                {searched && !results.length ? (
                  <p>没有找到权限范围内的记录。</p>
                ) : null}
                {searched
                  ? results.map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        className="w-full text-left rounded-xl border border-outline-variant p-3"
                        onClick={() => {
                          onNavigate(item as NavigationTarget);
                          setMode(null);
                        }}
                      >
                        <strong>{item.title}</strong>
                        <span className="block text-xs text-on-surface-variant">
                          {item.subtitle}
                        </span>
                      </button>
                    ))
                  : null}
              </>
            ) : (
              <>
                <p className="text-sm">
                  仅显示真实操作事件。免打扰期间的通知到期后可见，当前最多显示
                  100 条。
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={busy}
                    className="sakura-btn sakura-btn-secondary"
                    onClick={() => void loadNotices()}
                  >
                    刷新通知
                  </button>
                  <button
                    disabled={busy || !notices.some((n) => !n.read_at)}
                    className="sakura-btn sakura-btn-ghost"
                    onClick={async () => {
                      setBusy(true);
                      const r = await sakuraApi.business.request(
                        "/workspace/notifications/read",
                        "POST",
                        {},
                      );
                      if (r.success) await loadNotices();
                      else setError(r.message);
                      setBusy(false);
                    }}
                  >
                    全部已读
                  </button>
                </div>
                {!notices.length ? (
                  <p>暂无到达提醒时间的通知。</p>
                ) : (
                  notices.map((n) => (
                    <article
                      key={n.id}
                      className="border border-outline-variant rounded-xl p-3 space-y-2"
                    >
                      <strong>{n.title}</strong>
                      <p className="text-xs">
                        {new Date(n.created_at).toLocaleString()} ·{" "}
                        {n.read_at ? "已读" : "未读"}
                      </p>
                      {!n.read_at ? (
                        <button
                          className="sakura-btn sakura-btn-ghost"
                          onClick={async () => {
                            const r = await sakuraApi.business.request(
                              "/workspace/notifications/read",
                              "POST",
                              { id: n.id },
                            );
                            if (r.success) await loadNotices();
                            else setError(r.message);
                          }}
                        >
                          标记已读
                        </button>
                      ) : null}
                    </article>
                  ))
                )}
              </>
            )}
            {busy ? <p role="status">正在加载…</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
