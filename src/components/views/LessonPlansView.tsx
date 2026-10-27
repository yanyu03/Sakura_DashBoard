import { WorkspaceHero } from "../WorkspaceVisuals";
import { useCallback, useEffect, useRef, useState } from "react";
import { sakuraApi } from "../../services/sakuraApiService";
type Row = Record<string, any>;
export function LessonPlansView({
  showToast,
  focusLessonId,
}: {
  focusLessonId?: string;
  showToast: (message: string) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]),
    [q, setQ] = useState(""),
    [editing, setEditing] = useState<Row | null>(null),
    [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [unit, setUnit] = useState(""),
    [tags, setTags] = useState(""),
    [visibility, setVisibility] = useState("private"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [revisions, setRevisions] = useState<Row[] | null>(null),
    [works, setWorks] = useState<Row[]>([]),
    [work, setWork] = useState("");
  const seq = useRef(0);
  const load = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    const r = await sakuraApi.business.request(
      `/lessons/plans?q=${encodeURIComponent(q)}`,
    );
    if (id !== seq.current) return;
    if (r.success) setRows(r.data);
    else setError(r.message);
    setLoading(false);
  }, [q]);
  useEffect(() => {
    void load();
    return () => {
      seq.current++;
    };
  }, [load]);
  useEffect(() => {
    void sakuraApi.business.request("/homework/assignments").then((r) => {
      if (r.success) setWorks(r.data);
    });
  }, []);
  const edit = (row: Row | null) => {
    setEditing(row);
    setTitle(row?.title || "");
    setBody(row?.body || "");
    setUnit(row?.unit_code || "");
    setTags((row?.tags || []).join("，"));
    setVisibility(row?.visibility || "private");
    setRevisions(null);
    setError("");
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await sakuraApi.business.request(
      `/lessons/plans${editing ? `/${editing.id}` : ""}`,
      editing ? "PATCH" : "POST",
      {
        title,
        body,
        unit_code: unit,
        tags: tags
          .split(/[,，]/)
          .map((t) => t.trim())
          .filter(Boolean),
        visibility,
        ...(editing ? { version: editing.version } : {}),
      },
    );
    if (r.success) {
      showToast(r.message);
      edit(null);
      await load();
    } else setError(r.message);
    setBusy(false);
  };
  const archive = async (row: Row) => {
    setBusy(true);
    const r = await sakuraApi.business.request(
      `/lessons/plans/${row.id}`,
      "PATCH",
      { version: row.version, archived: true },
    );
    if (r.success) {
      if (editing?.id === row.id) edit(null);
      await load();
      showToast(r.message);
    } else setError(r.message);
    setBusy(false);
  };
  return (
    <main className="sakura-workspace space-y-5 text-on-surface">
      <WorkspaceHero
        title="备课教案库"
        description="把灵感写进课堂。整理教学思路、积累课程素材，让每一次备课都有迹可循。"
        eyebrow="LESSON STUDIO"
        icon="auto_stories"
      />
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      <details
        className="sakura-editor-shell border border-outline-variant rounded-xl p-4"
        open={editing !== null}
      >
        <summary>{editing ? "编辑当前教案" : "新建一份教案"}</summary>
        <form
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-4"
          onSubmit={save}
        >
          <h3 className="font-bold">{editing ? "编辑教案" : "新建教案"}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <label>
              教案标题
              <input
                required
                className="sakura-input block"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              单元
              <input
                className="sakura-input block"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </label>
            <label>
              标签（逗号分隔）
              <input
                className="sakura-input block"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </label>
            <label>
              可见范围
              <select
                className="sakura-input block"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="private">仅作者与管理员</option>
                <option value="school">校内共享</option>
              </select>
            </label>
          </div>
          <label className="block">
            教案正文
            <textarea
              required
              className="sakura-input block min-h-64"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button disabled={busy} className="sakura-btn sakura-btn-primary">
              保存教案
            </button>
            {editing ? (
              <button
                type="button"
                className="sakura-btn sakura-btn-secondary"
                onClick={() => edit(null)}
              >
                取消编辑
              </button>
            ) : null}
          </div>
        </form>
      </details>
      <label className="block">
        搜索标题、摘要或标签
        <input
          className="sakura-input block"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      {loading ? (
        <p role="status">正在加载…</p>
      ) : !rows.length ? (
        <p>暂无匹配教案。</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((row) => (
            <article
              key={row.id}
              className="sakura-workspace-card sakura-lesson-card bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3"
            >
              <div className="sakura-lesson-cover" aria-hidden="true">
                <span className="material-symbols-outlined">auto_stories</span>
                <span>{row.unit_code || "我的教学笔记"}</span>
                <i>LESSON NOTES</i>
              </div>
              <h3 className="font-bold">{row.title}</h3>
              <p className="text-xs text-on-surface-variant">
                {row.author_name} · 第 {row.version} 版 ·{" "}
                {row.visibility === "private" ? "个人" : "校内共享"} ·{" "}
                {row.tags.join(" / ")}
              </p>
              <details open={focusLessonId === row.id}>
                <summary>查看正文</summary>
                <p className="whitespace-pre-wrap mt-2">{row.body}</p>
              </details>
              <p className="text-sm">
                关联作业：
                {row.links
                  .map(
                    (l: Row) =>
                      works.find((w) => w.id === l.assignment_id)?.title,
                  )
                  .filter(Boolean)
                  .join("、") || "暂无权限内关联作业"}
              </p>
              <p className="text-sm">
                关联课时：
                {row.schedules?.length
                  ? row.schedules
                      .map((s: Row) => new Date(s.starts_at).toLocaleString())
                      .join("、")
                  : "暂无"}
              </p>
              {row.canEdit ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={busy}
                    className="sakura-btn sakura-btn-secondary"
                    onClick={() => edit(row)}
                  >
                    编辑
                  </button>
                  <button
                    disabled={busy}
                    className="sakura-btn sakura-btn-ghost"
                    onClick={() => void archive(row)}
                  >
                    归档
                  </button>
                  <button
                    className="sakura-btn sakura-btn-ghost"
                    onClick={async () => {
                      const r = await sakuraApi.business.request(
                        `/lessons/plans/${row.id}/revisions`,
                      );
                      if (r.success) {
                        setEditing(row);
                        setRevisions(r.data);
                        setTitle(row.title);
                        setBody(row.body);
                        setUnit(row.unit_code);
                        setTags(row.tags.join("，"));
                        setVisibility(row.visibility);
                      } else setError(r.message);
                    }}
                  >
                    修改历史
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
      {editing ? (
        <section className="border border-outline-variant rounded-xl p-4 space-y-3">
          <h3 className="font-bold">为「{editing.title}」关联作业</h3>
          <select
            aria-label="关联作业"
            className="sakura-input"
            value={work}
            onChange={(e) => setWork(e.target.value)}
          >
            <option value="">请选择</option>
            {works.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            {[false, true].map((remove) => (
              <button
                key={String(remove)}
                disabled={busy || !work}
                className="sakura-btn sakura-btn-secondary"
                onClick={async () => {
                  setBusy(true);
                  const r = await sakuraApi.business.request(
                    `/lessons/plans/${editing.id}/links`,
                    "POST",
                    { version: editing.version, assignment_id: work, remove },
                  );
                  if (r.success) {
                    setEditing({ ...editing, ...r.data });
                    await load();
                    showToast(r.message);
                  } else setError(r.message);
                  setBusy(false);
                }}
              >
                {remove ? "解除关联" : "保存关联"}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {revisions ? (
        <section className="space-y-2">
          <h3 className="font-bold">历史版本</h3>
          {revisions.length ? (
            revisions.map((r) => (
              <details
                className="border border-outline-variant rounded-xl p-3"
                key={r.id}
              >
                <summary>
                  {new Date(r.created_at).toLocaleString()} · 第{" "}
                  {JSON.parse(r.snapshot_json).version} 版
                </summary>
                <p className="whitespace-pre-wrap">
                  {JSON.parse(r.snapshot_json).body}
                </p>
              </details>
            ))
          ) : (
            <p>暂无修改历史。</p>
          )}
        </section>
      ) : null}
    </main>
  );
}
