import { WorkspaceHero } from "../WorkspaceVisuals";
import { useCallback, useEffect, useState, useRef } from "react";
import { sakuraApi } from "../../services/sakuraApiService";
type Row = Record<string, any>;
const iso = (value: string) => new Date(value).toISOString();
const local = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
export function ScheduleManagementView({
  showToast,
}: {
  showToast: (text: string) => void;
}) {
  const [entries, setEntries] = useState<Row[]>([]),
    [changes, setChanges] = useState<Row[]>([]),
    [options, setOptions] = useState<Row>({
      teachers: [],
      lessons: [],
      courses: [],
      canAdmin: false,
    }),
    [classes, setClasses] = useState<Row[]>([]),
    [form, setForm] = useState<Row>({}),
    [proposal, setProposal] = useState<Row | null>(null),
    [reason, setReason] = useState(""),
    [note, setNote] = useState(""),
    [from, setFrom] = useState(new Date().toISOString().slice(0, 10)),
    [to, setTo] = useState(
      new Date(Date.now() + 31 * 86400000).toISOString().slice(0, 10),
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const loadSeq = useRef(0);
  const query = new URLSearchParams({ from, to }).toString();
  const load = useCallback(async () => {
    const request = ++loadSeq.current;
    setLoading(true);
    const results = await Promise.all([
      sakuraApi.business.request(
        `/schedules/entries?${new URLSearchParams({ from, to })}`,
      ),
      sakuraApi.business.request("/schedules/changes"),
    ]);
    if (request !== loadSeq.current) return;
    if (results[0].success) setEntries(results[0].data);
    else {
      setEntries([]);
      setError(results[0].message);
    }
    if (results[1].success) setChanges(results[1].data);
    else setError(results[1].message);
    setLoading(false);
  }, [from, to]);
  useEffect(() => {
    let current = true;
    void Promise.all([
      sakuraApi.academic.list("classes"),
      sakuraApi.business.request("/schedules/options"),
    ]).then(([c, o]) => {
      if (!current) return;
      if (c.success) setClasses(c.data);
      else setError(c.message);
      if (o.success) setOptions(o.data);
      else setError(o.message);
    });
    return () => {
      current = false;
    };
  }, []);
  useEffect(() => {
    void load();
    return () => {
      loadSeq.current++;
    };
  }, [load]);
  const mutate = async (path: string, method: string, payload: Row) => {
    setBusy(true);
    setError("");
    const r = await sakuraApi.business.request(path, method, payload);
    if (r.success) {
      await load();
      showToast(r.message);
    } else setError(r.message);
    setBusy(false);
    return r;
  };
  const set = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));
  return (
    <main className="sakura-workspace space-y-5 text-on-surface">
      <WorkspaceHero
        title="课表与调代课"
        description="给教学日常留一份从容。查看课程安排，协调课时变动，让每个课堂有序衔接。"
        eyebrow="TEACHING CALENDAR"
        icon="calendar_month"
      />
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      <div className="grid sm:grid-cols-3 gap-3">
        <label>
          开始日期
          <input
            className="sakura-input block"
            type="date"
            value={from}
            onInput={(e) => setFrom(e.currentTarget.value)}
          />
        </label>
        <label>
          结束日期（不含）
          <input
            className="sakura-input block"
            type="date"
            value={to}
            onInput={(e) => setTo(e.currentTarget.value)}
          />
        </label>
        <a
          className="sakura-btn sakura-btn-secondary self-end"
          href={`/api/v1/schedules/calendar.ics?${query}`}
          download
        >
          下载 ICS 日历
        </a>
      </div>
      {options.canAdmin ? (
        <details className="border border-outline-variant rounded-xl p-4">
          <summary>新增课时</summary>
          <form
            className="grid sm:grid-cols-2 gap-3 mt-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const fields = new FormData(e.currentTarget),
                start = String(fields.get("starts_at")),
                end = String(fields.get("ends_at"));
              if (
                !Number.isFinite(Date.parse(start)) ||
                !Number.isFinite(Date.parse(end))
              ) {
                setError("请填写有效的开始与结束时间");
                return;
              }
              const r = await mutate("/schedules/entries", "POST", {
                ...form,
                starts_at: iso(start),
                ends_at: iso(end),
              });
              if (r.success) setForm({});
            }}
          >
            {(
              [
                ["class_id", "班级", classes, "class_name"],
                ["teacher_id", "教师", options.teachers, "full_name"],
                ["course_id", "课程", options.courses, "name"],
              ] as [string, string, Row[], string][]
            ).map(([key, label, items, title]) => (
              <label key={key}>
                {label}
                <select
                  required
                  className="sakura-input block"
                  value={form[key] || ""}
                  onChange={(e) => set(key, e.target.value)}
                >
                  <option value="">请选择</option>
                  {items.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r[title]}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label>
              关联教案（可选）
              <select
                className="sakura-input block"
                value={form.lesson_id || ""}
                onChange={(e) => set("lesson_id", e.target.value)}
              >
                <option value="">不关联</option>
                {(options.lessons || []).map((lesson: Row) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              教室
              <input
                required
                className="sakura-input block"
                value={form.room || ""}
                onChange={(e) => set("room", e.target.value)}
              />
            </label>
            {[
              ["starts_at", "开始时间"],
              ["ends_at", "结束时间"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  name={key}
                  required
                  type="datetime-local"
                  className="sakura-input block"
                  value={form[key] || ""}
                  onInput={(e) => set(key, e.currentTarget.value)}
                />
              </label>
            ))}
            <button disabled={busy} className="sakura-btn sakura-btn-primary">
              保存课时
            </button>
          </form>
        </details>
      ) : null}
      {loading ? (
        <p role="status">正在加载课表…</p>
      ) : !entries.length ? (
        <p>
          所选时间范围暂无课时。历史周次演示数据保留在旧表中，未猜测为新的日期课表。
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {entries.map((row) => (
            <article
              key={row.id}
              className="sakura-workspace-card border border-outline-variant rounded-xl p-4 space-y-3 bg-surface-container-lowest"
            >
              <h3 className="font-bold">
                {row.class_name} · {row.course_name}
              </h3>
              <p>
                {new Date(row.starts_at).toLocaleString()} —{" "}
                {new Date(row.ends_at).toLocaleTimeString()}
              </p>
              <p>
                {row.full_name} · {row.room}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={busy}
                  className="sakura-btn sakura-btn-secondary"
                  onClick={() => {
                    setProposal({
                      ...row,
                      starts_at: local(row.starts_at),
                      ends_at: local(row.ends_at),
                    });
                    setReason("");
                  }}
                >
                  申请调代课
                </button>
                {options.canAdmin ? (
                  <button
                    disabled={busy}
                    className="sakura-btn sakura-btn-ghost"
                    onClick={() =>
                      void mutate(`/schedules/entries/${row.id}`, "PATCH", {
                        version: row.version,
                        cancelled: true,
                      })
                    }
                  >
                    取消课时
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
      {proposal ? (
        <form
          className="border border-outline-variant rounded-xl p-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const fields = new FormData(e.currentTarget),
              start = String(fields.get("starts_at")),
              end = String(fields.get("ends_at"));
            if (
              !Number.isFinite(Date.parse(start)) ||
              !Number.isFinite(Date.parse(end))
            ) {
              setError("请填写有效的目标时间");
              return;
            }
            const r = await mutate("/schedules/changes", "POST", {
              entry_id: proposal.id,
              version: proposal.version,
              reason,
              target: {
                teacher_id: proposal.teacher_id,
                room: proposal.room,
                starts_at: iso(start),
                ends_at: iso(end),
              },
            });
            if (r.success) setProposal(null);
          }}
        >
          <h3 className="font-bold">调代课申请 · {proposal.class_name}</h3>
          <label className="block">
            代课教师
            <select
              required
              className="sakura-input block"
              value={proposal.teacher_id}
              onChange={(e) =>
                setProposal((p) => ({ ...p, teacher_id: e.target.value }))
              }
            >
              {options.teachers.map((r: Row) => (
                <option key={r.id} value={r.id}>
                  {r.full_name}
                </option>
              ))}
            </select>
          </label>
          {[
            ["starts_at", "目标开始"],
            ["ends_at", "目标结束"],
          ].map(([key, label]) => (
            <label className="block" key={key}>
              {label}
              <input
                name={key}
                required
                type="datetime-local"
                className="sakura-input block"
                value={proposal[key]}
                onInput={(e) =>
                  setProposal((p) => ({ ...p, [key]: e.currentTarget.value }))
                }
              />
            </label>
          ))}
          <label className="block">
            目标教室
            <input
              required
              className="sakura-input block"
              value={proposal.room}
              onChange={(e) =>
                setProposal((p) => ({ ...p, room: e.target.value }))
              }
            />
          </label>
          <label className="block">
            申请原因
            <textarea
              required
              className="sakura-input block"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button disabled={busy} className="sakura-btn sakura-btn-primary">
              提交待审申请
            </button>
            <button
              type="button"
              className="sakura-btn sakura-btn-secondary"
              onClick={() => setProposal(null)}
            >
              取消填写
            </button>
          </div>
        </form>
      ) : null}
      <section className="space-y-3">
        <h3 className="font-bold text-lg">调代课记录</h3>
        <label className="block">
          审批意见（可选）
          <input
            className="sakura-input block"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {!changes.length ? (
          <p>暂无申请。</p>
        ) : (
          changes.map((row) => (
            <article
              key={row.id}
              className="border border-outline-variant rounded-xl p-4 space-y-2"
            >
              <p>
                {row.applicant_name} ·{" "}
                {
                  (
                    {
                      pending: "待审批",
                      approved: "已通过",
                      rejected: "已驳回",
                      cancelled: "已取消",
                    } as Row
                  )[row.status]
                }
              </p>
              <p>{row.reason}</p>
              <p className="text-sm">
                目标：{new Date(row.target.starts_at).toLocaleString()} ·{" "}
                {row.target.room}
              </p>
              {row.review_note ? <p>审批意见：{row.review_note}</p> : null}
              {row.status === "pending" ? (
                <div className="flex flex-wrap gap-2">
                  {(options.canAdmin
                    ? ["approved", "rejected", "cancelled"]
                    : ["cancelled"]
                  ).map((status) => (
                    <button
                      key={status}
                      disabled={busy}
                      className="sakura-btn sakura-btn-secondary"
                      onClick={() =>
                        void mutate(`/schedules/changes/${row.id}`, "PATCH", {
                          version: row.version,
                          status,
                          review_note: note,
                        })
                      }
                    >
                      {
                        (
                          {
                            approved: "批准",
                            rejected: "驳回",
                            cancelled: "撤销",
                          } as Row
                        )[status]
                      }
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
