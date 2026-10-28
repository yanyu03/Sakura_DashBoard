import { WorkspaceHero } from "../WorkspaceVisuals";
import { ScheduleDepartmentSettings } from "../ScheduleDepartmentSettings";
import { StaffDispatchDirectory } from "../StaffDispatchDirectory";
import { useCallback, useEffect, useRef, useState } from "react";
import { sakuraApi } from "../../services/sakuraApiService";
type Row = Record<string, any>;
const localTime = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
const when = (value: string) => new Date(value).toLocaleString();
const labels: Record<string, string> = {
  draft: "个人草稿",
  submitted: "教研室待审批",
  approved: "已通过",
  rejected: "已退回",
  withdrawn: "已撤回",
  pending: "待审批",
  cancelled: "已取消",
};
const initialOptions = {
  teachers: [],
  courses: [],
  classes: [],
  assignments: [],
  departments: [],
  canAdmin: false,
  userId: "",
};

export function ScheduleManagementView({
  showToast,
}: {
  showToast: (message: string) => void;
}) {
  const [organizationRevision, setOrganizationRevision] = useState(0);
  const [entries, setEntries] = useState<Row[]>([]),
    [submissions, setSubmissions] = useState<Row[]>([]),
    [changes, setChanges] = useState<Row[]>([]);
  const [options, setOptions] = useState<Row>(initialOptions),
    [form, setForm] = useState<Record<string, string>>({}),
    [editing, setEditing] = useState<Row | null>(null);
  const [proposal, setProposal] = useState<Row | null>(null),
    [reason, setReason] = useState(""),
    [reviewNote, setReviewNote] = useState("");
  const [from, setFrom] = useState(
      new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10),
    ),
    [to, setTo] = useState(
      new Date(Date.now() + 31 * 86400000 + 8 * 3600000)
        .toISOString()
        .slice(0, 10),
    );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [view, setView] = useState("all");
  const sequence = useRef(0);
  const query = new URLSearchParams({ from, to }).toString();
  const load = useCallback(async () => {
    const request = ++sequence.current;
    setLoading(true);
    setError("");
    const results = await Promise.all(
      [
        "options",
        `entries?${new URLSearchParams({ from, to })}`,
        `submissions?${new URLSearchParams({ from, to })}`,
        "changes",
      ].map((path) => sakuraApi.business.request("/schedules/" + path)),
    );
    if (request !== sequence.current) return;
    const failed = results.find((r) => !r.success);
    if (failed) setError(failed.message);
    setOptions(results[0].success ? results[0].data : initialOptions);
    setEntries(results[1].success ? results[1].data : []);
    setSubmissions(results[2].success ? results[2].data : []);
    setChanges(results[3].success ? results[3].data : []);
    setLoading(false);
  }, [from, to]);
  useEffect(() => {
    void load();
    return () => {
      sequence.current++;
    };
  }, [load]);
  const mutate = async (path: string, method: string, body: Row) => {
    setBusy(true);
    setError("");
    try {
      const r = await sakuraApi.business.request(
        "/schedules/" + path,
        method,
        body,
      );
      if (r.success) {
        await load();
        showToast(r.message);
      } else setError(r.message);
      return r;
    } finally {
      setBusy(false);
    }
  };
  const set = (key: string, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const ownClasses = Array.from(
    new Map((options.assignments as Row[]).map((a) => [a.id, a])).values(),
  );
  const ownCourses = (options.courses as Row[]).filter((c) =>
    options.assignments.some(
      (a: Row) => a.id === form.class_id && a.course_id === c.id,
    ),
  );
  const memberDepartments = (options.departments as Row[]).filter(
    (d) => d.canSubmit,
  );
  const editingAllowed = ownClasses.length > 0;
  const edit = (row: Row) => {
    setEditing(row);
    setForm({
      class_id: row.class_id,
      course_id: row.course_id,
      unit_id: row.unit_id || "",
      starts_at: localTime(row.starts_at),
      ends_at: localTime(row.ends_at),
      room: row.room,
      note: row.note,
    });
  };
  const filteredSubmissions = submissions.filter(
    (r) => view === "all" || r.owner_id === options.userId,
  );
  return (
    <main className="sakura-workspace space-y-5 text-on-surface">
      <WorkspaceHero
        title="课表提交与协同排课"
        eyebrow="TEACHING CALENDAR"
        icon="calendar_month"
        description="先整理自己的课时，再提交到教研室共同协调。负责人审批后进入正式课表，提交与审批时都会检查时间冲突。"
      />
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      <div className="grid sm:grid-cols-4 gap-3">
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
        <label>
          提交视图
          <select
            className="sakura-input block"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="all">全部可见 · 我的与教研室共享</option>
            <option value="mine">仅我的提交</option>
          </select>
        </label>
        <a
          className="sakura-btn sakura-btn-secondary self-end"
          href={`/api/v1/schedules/calendar.ics?${query}`}
          download
        >
          导出可见正式课表
        </a>
      </div>
      <div className="sakura-workspace-card border border-outline-variant rounded-xl p-4 space-y-2">
        <p className="font-bold">当前共享范围</p>
        <p className="text-sm">
          {options.departments.length
            ? options.departments
                .map(
                  (d: Row) =>
                    `${d.label || d.name}${d.canManage ? "（负责人）" : ""}`,
                )
                .join("、")
            : "尚未分配教研室，可保存个人草稿；共享前请联系管理员确认任职。"}
        </p>
        <p className="text-sm">
          同室教师可查看已提交与已通过的排课信息；负责人可审批。本人的草稿、其他业务资料与私人教案保持各自权限。
        </p>
      </div>
      {options.canAdmin ? (
        <ScheduleDepartmentSettings
          onChanged={() => {
            void load();
            setOrganizationRevision((value) => value + 1);
          }}
        />
      ) : null}
      <StaffDispatchDirectory
        refreshKey={organizationRevision}
        target={
          proposal?.unit_id
            ? { unitId: proposal.unit_id, courseId: proposal.course_id }
            : undefined
        }
        onPick={
          proposal
            ? (accountId) => {
                setProposal((previous) => ({
                  ...previous,
                  teacher_id: accountId,
                }));
                showToast("已选为当前代课申请的教师，请继续提交审批");
              }
            : undefined
        }
      />
      <details
        open={editing ? true : undefined}
        className="sakura-workspace-card border border-outline-variant rounded-xl p-4"
      >
        <summary className="font-bold cursor-pointer">
          {editing ? "编辑我的提交" : "新增课表提交 / 个人草稿"}
        </summary>
        {!editingAllowed ? (
          <p className="mt-3">
            当前没有有效任课关系。请让管理员在基础资料中分配班级与课程。
          </p>
        ) : (
          <form
            className="grid sm:grid-cols-2 gap-3 mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const action =
                (e.nativeEvent as SubmitEvent).submitter?.getAttribute(
                  "value",
                ) || "draft";
              const starts = Date.parse(form.starts_at),
                ends = Date.parse(form.ends_at);
              if (!Number.isFinite(starts) || !Number.isFinite(ends)) {
                setError("请填写有效的开始与结束时间");
                return;
              }
              const payload = {
                ...form,
                starts_at: new Date(starts).toISOString(),
                ends_at: new Date(ends).toISOString(),
                action: editing
                  ? action === "submit"
                    ? "submit"
                    : "save"
                  : action,
                ...(editing ? { version: editing.version } : {}),
              };
              const r = await mutate(
                editing ? `submissions/${editing.id}` : "submissions",
                editing ? "PATCH" : "POST",
                payload,
              );
              if (r.success) {
                setEditing(null);
                setForm({});
              }
            }}
          >
            <label>
              任课班级
              <select
                required
                className="sakura-input block"
                value={form.class_id || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    class_id: e.target.value,
                    course_id: "",
                  }))
                }
              >
                <option value="">请选择</option>
                {ownClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              任课课程
              <select
                required
                className="sakura-input block"
                value={form.course_id || ""}
                onChange={(e) => set("course_id", e.target.value)}
              >
                <option value="">请选择</option>
                {ownCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              提交的教研室
              <select
                className="sakura-input block"
                value={form.unit_id || ""}
                onChange={(e) => set("unit_id", e.target.value)}
              >
                <option value="">暂不选择 · 仅可保存草稿</option>
                {memberDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label || d.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              教室
              <input
                required
                maxLength={80}
                className="sakura-input block"
                value={form.room || ""}
                onChange={(e) => set("room", e.target.value)}
              />
            </label>
            {(
              [
                ["starts_at", "开始时间"],
                ["ends_at", "结束时间"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  required
                  type="datetime-local"
                  className="sakura-input block"
                  value={form[key] || ""}
                  onInput={(e) => set(key, e.currentTarget.value)}
                />
              </label>
            ))}
            <label className="sm:col-span-2">
              排课说明（提交后在教研室共享）
              <textarea
                maxLength={1000}
                className="sakura-input block"
                value={form.note || ""}
                onChange={(e) => set("note", e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                disabled={busy}
                value="draft"
                className="sakura-btn sakura-btn-secondary"
              >
                保存个人草稿
              </button>
              <button
                disabled={busy || !form.unit_id}
                value="submit"
                className="sakura-btn sakura-btn-primary"
              >
                提交并共享到教研室
              </button>
              {editing ? (
                <button
                  type="button"
                  className="sakura-btn sakura-btn-ghost"
                  onClick={() => {
                    setEditing(null);
                    setForm({});
                  }}
                >
                  取消编辑
                </button>
              ) : null}
            </div>
          </form>
        )}
      </details>
      <section className="space-y-3" aria-label="课表提交与审批">
        <h3 className="text-lg font-bold">课表提交与审批</h3>
        {options.departments.some((d: Row) => d.canManage) ? (
          <label className="block">
            审批意见（提交人及负责人可见）
            <input
              maxLength={1000}
              className="sakura-input block"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </label>
        ) : null}
        {loading ? (
          <p role="status">正在加载课表提交…</p>
        ) : !filteredSubmissions.length ? (
          <p>所选日期范围暂无可见提交。</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {filteredSubmissions.map((row) => (
              <article
                key={row.id}
                className="sakura-workspace-card border border-outline-variant rounded-xl p-4 space-y-2 bg-surface-container-lowest"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <h4 className="font-bold">
                    {row.class_name} · {row.course_name}
                  </h4>
                  <span className="sakura-meta-badge">
                    {labels[row.status]}
                  </span>
                </div>
                <p>
                  {row.full_name || row.faculty_code} ·{" "}
                  {row.unit_name || "未共享"}
                </p>
                <p>
                  {when(row.starts_at)} — {when(row.ends_at)} · {row.room}
                </p>
                {row.note ? (
                  <p className="whitespace-pre-wrap">排课说明：{row.note}</p>
                ) : null}
                {row.review_note ? <p>审批意见：{row.review_note}</p> : null}
                <div className="flex flex-wrap gap-2">
                  {row.canEdit ? (
                    <>
                      <button
                        disabled={busy}
                        className="sakura-btn sakura-btn-secondary"
                        onClick={() => edit(row)}
                      >
                        编辑 / 重新提交
                      </button>
                      {row.unit_id ? (
                        <button
                          disabled={busy}
                          className="sakura-btn sakura-btn-primary"
                          onClick={() =>
                            void mutate(`submissions/${row.id}`, "PATCH", {
                              version: row.version,
                              action: "submit",
                            })
                          }
                        >
                          提交到教研室
                        </button>
                      ) : null}
                    </>
                  ) : null}
                  {row.canWithdraw ? (
                    <button
                      disabled={busy}
                      className="sakura-btn sakura-btn-secondary"
                      onClick={() =>
                        void mutate(`submissions/${row.id}`, "PATCH", {
                          version: row.version,
                          action: "withdraw",
                        })
                      }
                    >
                      撤回后修改
                    </button>
                  ) : null}
                  {row.canReview
                    ? ["approve", "reject"].map((action) => (
                        <button
                          key={action}
                          disabled={busy}
                          className={`sakura-btn ${action === "approve" ? "sakura-btn-primary" : "sakura-btn-secondary"}`}
                          onClick={() =>
                            void mutate(`submissions/${row.id}`, "PATCH", {
                              version: row.version,
                              action,
                              review_note: reviewNote,
                            })
                          }
                        >
                          {action === "approve"
                            ? "批准并生成正式课时"
                            : "退回修改"}
                        </button>
                      ))
                    : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="space-y-3" aria-label="正式课表">
        <h3 className="text-lg font-bold">正式课表 · 我的与已共享课时</h3>
        {loading ? (
          <p role="status">正在加载正式课表…</p>
        ) : !entries.length ? (
          <p>所选日期范围暂无可见正式课时。</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {entries.map((row) => (
              <article
                key={row.id}
                className="sakura-workspace-card border border-outline-variant rounded-xl p-4 space-y-2 bg-surface-container-lowest"
              >
                <h4 className="font-bold">
                  {row.class_name} · {row.course_name}
                </h4>
                <p>
                  {when(row.starts_at)} — {when(row.ends_at)}
                </p>
                <p>
                  {row.full_name} · {row.room} · {row.unit_name || "个人可见"}
                </p>
                {row.canShare ? (
                  <label className="block text-sm">
                    课时共享范围
                    <select
                      disabled={busy}
                      className="sakura-input block"
                      value={row.unit_id || ""}
                      onChange={(e) =>
                        void mutate(`entries/${row.id}/sharing`, "PATCH", {
                          version: row.version,
                          unit_id: e.target.value || null,
                        })
                      }
                    >
                      <option value="">个人可见</option>
                      {memberDepartments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label || d.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {row.canRequestChange ? (
                    <button
                      disabled={busy}
                      className="sakura-btn sakura-btn-secondary"
                      onClick={() => {
                        setProposal({
                          ...row,
                          starts_at: localTime(row.starts_at),
                          ends_at: localTime(row.ends_at),
                        });
                        setReason("");
                      }}
                    >
                      申请调代课
                    </button>
                  ) : null}
                  {row.canCancel ? (
                    <button
                      disabled={busy}
                      className="sakura-btn sakura-btn-ghost"
                      onClick={() =>
                        void mutate(`entries/${row.id}`, "PATCH", {
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
      </section>
      {proposal ? (
        <form
          className="sakura-workspace-card border border-outline-variant rounded-xl p-4 grid sm:grid-cols-2 gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await mutate("changes", "POST", {
              entry_id: proposal.id,
              version: proposal.version,
              reason,
              target: {
                teacher_id: proposal.teacher_id,
                room: proposal.room,
                starts_at: new Date(proposal.starts_at).toISOString(),
                ends_at: new Date(proposal.ends_at).toISOString(),
              },
            });
            if (r.success) setProposal(null);
          }}
        >
          <h3 className="font-bold sm:col-span-2">
            调代课申请 · {proposal.class_name}
          </h3>
          <label>
            代课教师
            <select
              required
              className="sakura-input block"
              value={proposal.teacher_id}
              onChange={(e) =>
                setProposal((p) => ({ ...p, teacher_id: e.target.value }))
              }
            >
              {options.teachers.map((t: Row) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          </label>
          <label>
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
          {(
            [
              ["starts_at", "目标开始"],
              ["ends_at", "目标结束"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                required
                type="datetime-local"
                className="sakura-input block"
                value={proposal[key]}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  setProposal((p) => ({ ...p, [key]: value }));
                }}
              />
            </label>
          ))}
          <label className="sm:col-span-2">
            申请原因
            <textarea
              required
              maxLength={2000}
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
        <h3 className="text-lg font-bold">调代课记录 · 本人申请与负责范围</h3>
        {!changes.length ? (
          <p>暂无申请。</p>
        ) : (
          changes.map((row) => (
            <article
              key={row.id}
              className="border border-outline-variant rounded-xl p-4 space-y-2"
            >
              <p>
                {row.applicant_name} · {labels[row.status]}
              </p>
              <p>{row.reason}</p>
              <p>
                目标：{when(row.target.starts_at)} · {row.target.room}
              </p>
              {row.review_note ? <p>审批意见：{row.review_note}</p> : null}
              {row.status === "pending" ? (
                <div className="flex gap-2">
                  {[
                    ...(row.canReview ? ["approved", "rejected"] : []),
                    ...(row.canWithdraw ? ["cancelled"] : []),
                  ].map((status) => (
                    <button
                      key={status}
                      disabled={busy}
                      className="sakura-btn sakura-btn-secondary"
                      onClick={() =>
                        void mutate(`changes/${row.id}`, "PATCH", {
                          version: row.version,
                          status,
                          review_note: reviewNote,
                        })
                      }
                    >
                      {
                        {
                          approved: "批准",
                          rejected: "驳回",
                          cancelled: "撤销",
                        }[status]
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
