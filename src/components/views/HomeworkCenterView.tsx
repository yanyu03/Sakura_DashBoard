import { WorkspaceHero } from "../WorkspaceVisuals";
import { useEffect, useRef, useState } from "react";
import { sakuraApi } from "../../services/sakuraApiService";
type Row = Record<string, any>;
function submissionText(row: Row) {
  if (row.content) return row.content;
  try {
    const legacy = JSON.parse(row.payload_json);
    return (
      ["paragraph1", "paragraph2"]
        .map((key) =>
          [legacy[key]?.prefix, legacy[key]?.highlight, legacy[key]?.suffix]
            .filter((value) => typeof value === "string")
            .join(""),
        )
        .filter(Boolean)
        .join("\n\n") || "该历史记录没有保存正文。"
    );
  } catch {
    return "该历史记录没有保存正文。";
  }
}

const labels: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
  closed: "已截止",
  archived: "已归档",
  pending: "待批阅",
  "ai-pregraded": "待终核",
  graded: "已批阅",
  "needs-correction": "待订正",
};
export function HomeworkCenterView({
  showToast,
  focusAssignmentId,
  focusClassId,
}: {
  focusAssignmentId?: string;
  focusClassId?: string;
  showToast: (message: string) => void;
  onSelectStudentForProfile?: (id: string) => void;
}) {
  const [classes, setClasses] = useState<Row[]>([]),
    [classId, setClassId] = useState(""),
    [works, setWorks] = useState<Row[]>([]),
    [workId, setWorkId] = useState(""),
    [detail, setDetail] = useState<Row | null>(null),
    [selected, setSelected] = useState(""),
    [filter, setFilter] = useState("all"),
    [score, setScore] = useState(""),
    [feedback, setFeedback] = useState(""),
    [stamp, setStamp] = useState(""),
    [studentId, setStudentId] = useState(""),
    [content, setContent] = useState(""),
    [title, setTitle] = useState(""),
    [instructions, setInstructions] = useState(""),
    [maximum, setMaximum] = useState("100"),
    [due, setDue] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [history, setHistory] = useState<Row[] | null>(null);
  const sequence = useRef(0),
    listSequence = useRef(0);
  useEffect(() => {
    let current = true;
    void sakuraApi.academic.list("classes").then((r) => {
      if (!current) return;
      if (r.success) {
        setClasses(r.data);
        setClassId(
          (previous) => previous || focusClassId || r.data[0]?.id || "",
        );
      } else setError(r.message);
    });
    return () => {
      current = false;
    };
  }, []);
  const loadWorks = async (id: string, prefer?: string) => {
    const request = ++listSequence.current;
    const r = await sakuraApi.business.request(
      `/homework/assignments?classId=${encodeURIComponent(id)}`,
    );
    if (request !== listSequence.current) return;
    if (r.success) {
      setWorks(r.data);
      setWorkId(
        (previous) =>
          prefer ||
          (r.data.some((w: Row) => w.id === previous)
            ? previous
            : r.data[0]?.id || ""),
      );
    } else setError(r.message);
  };
  useEffect(() => {
    setDetail(null);
    setSelected("");
    setWorkId("");
    setWorks([]);
    if (classId)
      void loadWorks(
        classId,
        focusClassId === classId ? focusAssignmentId : undefined,
      );
  }, [classId, focusAssignmentId, focusClassId]);
  useEffect(() => {
    if (focusClassId) setClassId(focusClassId);
    if (focusAssignmentId) setWorkId(focusAssignmentId);
  }, [focusAssignmentId, focusClassId]);
  const loadDetail = async (id: string) => {
    const request = ++sequence.current;
    setLoading(true);
    const r = await sakuraApi.business.request(
      `/homework/assignments/${encodeURIComponent(id)}`,
    );
    if (request !== sequence.current) return;
    if (r.success) {
      setDetail(r.data);
      setSelected((previous) =>
        r.data.submissions.some((s: Row) => s.id === previous)
          ? previous
          : r.data.submissions[0]?.id || "",
      );
    } else {
      setDetail(null);
      setError(r.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    setDetail(null);
    setSelected("");
    setError("");
    if (workId) void loadDetail(workId);
    else sequence.current++;
  }, [workId]);
  const active = detail?.submissions.find((s: Row) => s.id === selected);
  useEffect(() => {
    setScore(
      active?.total_score === null || active?.total_score === undefined
        ? ""
        : String(active.total_score),
    );
    setFeedback(active?.feedback || "");
    setStamp(active?.stamp_type || "");
    setHistory(null);
  }, [active?.id, active?.version]);
  const mutate = async (
    path: string,
    method: string,
    payload: Row,
    after?: () => void,
  ) => {
    setBusy(true);
    setError("");
    const r = await sakuraApi.business.request(path, method, payload);
    if (r.success) {
      showToast(r.message);
      await loadWorks(classId);
      if (workId) await loadDetail(workId);
      after?.();
    } else setError(r.message);
    setBusy(false);
    return r;
  };
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dueDate = String(new FormData(e.currentTarget).get("due_at") || "");
    if (dueDate && !Number.isFinite(Date.parse(dueDate))) {
      setError("截止时间无效");
      return;
    }
    setBusy(true);
    setError("");
    const r = await sakuraApi.business.request(
      "/homework/assignments",
      "POST",
      {
        class_id: classId,
        title,
        instructions,
        max_score: Number(maximum),
        ...(dueDate ? { due_at: new Date(dueDate).toISOString() } : {}),
      },
    );
    if (r.success) {
      setTitle("");
      setInstructions("");
      setDue("");
      await loadWorks(classId, r.data.id);
      showToast(r.message);
    } else setError(r.message);
    setBusy(false);
  };
  const filtered = (detail?.submissions || []).filter(
    (s: Row) =>
      filter === "all" ||
      (filter === "pending"
        ? ["pending", "ai-pregraded"].includes(s.status)
        : filter === "model"
          ? s.is_model_essay
          : s.status === filter),
  );
  const grade = async (next: boolean) => {
    if (!active || score.trim() === "") {
      setError("请填写分数，零分可以直接输入 0。");
      return;
    }
    const position = filtered.findIndex((s: Row) => s.id === active.id);
    const nextId = [
      ...filtered.slice(position + 1),
      ...filtered.slice(0, position),
    ].find(
      (s: Row) =>
        s.id !== active.id && ["pending", "ai-pregraded"].includes(s.status),
    )?.id;
    await mutate(
      `/homework/submissions/${active.id}/grade`,
      "PATCH",
      {
        version: active.version,
        score: Number(score),
        feedback,
        stampType: stamp || null,
      },
      () => {
        if (next && nextId) setSelected(nextId);
      },
    );
  };
  const work = detail?.assignment,
    stats = detail?.stats;
  const changeState = (lifecycle: string) =>
    void mutate(`/homework/assignments/${work.id}`, "PATCH", {
      version: work.version,
      lifecycle,
    });
  return (
    <main className="sakura-workspace space-y-5 text-on-surface">
      <WorkspaceHero
        title="作业与人工批阅"
        description="每一份认真，都值得细致回应。布置作业、查看提交，在这里完成批阅与订正。"
        eyebrow="ASSIGNMENTS & FEEDBACK"
        icon="rate_review"
      />
      {error ? (
        <div
          role="alert"
          className="p-3 border border-error rounded-xl text-error"
        >
          {error}
          <button
            className="ml-3 underline"
            disabled={busy || !workId}
            onClick={() => void loadDetail(workId)}
          >
            重新加载作业
          </button>
        </div>
      ) : null}
      <label className="block">
        任教班级
        <select
          disabled={busy}
          className="sakura-input block"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          <option value="">请选择班级</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.class_name} · {c.actual_count} 人
            </option>
          ))}
        </select>
      </label>
      {!classes.length ? (
        <p>暂无可用班级，请由管理员建立班级及任教关系。</p>
      ) : null}
      <details className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <summary className="cursor-pointer font-bold">布置新作业</summary>
        <form className="mt-4 grid sm:grid-cols-2 gap-4" onSubmit={create}>
          <label>
            作业标题
            <input
              required
              className="sakura-input block"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            满分
            <input
              required
              type="number"
              min="1"
              max="10000"
              step="0.01"
              className="sakura-input block"
              value={maximum}
              onChange={(e) => setMaximum(e.target.value)}
            />
          </label>
          <label className="sm:col-span-2">
            作业要求
            <textarea
              className="sakura-input block min-h-24"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </label>
          <label>
            截止时间（可选）
            <input
              name="due_at"
              type="datetime-local"
              className="sakura-input block"
              value={due}
              onInput={(e) => setDue(e.currentTarget.value)}
            />
          </label>
          <div className="self-end">
            <button
              disabled={busy || !classId}
              className="sakura-btn sakura-btn-primary"
            >
              创建草稿
            </button>
          </div>
        </form>
      </details>
      <label className="block">
        当前作业
        <select
          disabled={busy}
          className="sakura-input block"
          value={workId}
          onChange={(e) => setWorkId(e.target.value)}
        >
          <option value="">请选择作业</option>
          {works.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title} · {labels[w.lifecycle]}
            </option>
          ))}
        </select>
      </label>
      {loading ? <p role="status">正在加载作业…</p> : null}
      {!workId ? <p>暂无作业，请创建第一份草稿。</p> : null}
      {work && stats ? (
        <>
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 space-y-3">
            <h3 className="font-bold text-lg">
              {work.title} · {labels[work.lifecycle]}
            </h3>
            <p className="whitespace-pre-wrap">
              {work.instructions || "未填写作业要求"}
            </p>
            <p className="text-sm">
              满分 {work.max_score} · 截止{" "}
              {work.due_at ? new Date(work.due_at).toLocaleString() : "未设置"}
            </p>
            <div className="flex flex-wrap gap-3">
              {work.lifecycle === "draft" ? (
                <button
                  disabled={busy}
                  className="sakura-btn sakura-btn-primary"
                  onClick={() => changeState("published")}
                >
                  发布作业
                </button>
              ) : null}
              {work.lifecycle === "published" ? (
                <button
                  disabled={busy}
                  className="sakura-btn sakura-btn-secondary"
                  onClick={() => changeState("closed")}
                >
                  截止收交
                </button>
              ) : null}
              {work.lifecycle !== "archived" ? (
                <button
                  disabled={busy}
                  className="sakura-btn sakura-btn-ghost"
                  onClick={() => changeState("archived")}
                >
                  归档作业
                </button>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["已提交", `${stats.submitted} / ${stats.total}`],
                ["待批阅", stats.pending],
                ["待订正", stats.correction],
                [
                  "班级均分",
                  stats.average === null
                    ? "暂无评分"
                    : Number(stats.average).toFixed(2),
                ],
                ["未提交", stats.unsubmitted],
                [
                  "优秀率（已批）",
                  stats.excellentRate === null
                    ? "暂无评分"
                    : `${(stats.excellentRate * 100).toFixed(1)}%`,
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-on-surface-variant">{label}</dt>
                  <dd className="text-lg font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          {work.lifecycle === "published" ||
          (work.lifecycle === "closed" &&
            detail.submissions.some(
              (s: Row) => s.status === "needs-correction",
            )) ? (
            <details className="rounded-xl border border-outline-variant p-4">
              <summary className="cursor-pointer font-bold">
                登记提交 / 订正重交
              </summary>
              <form
                className="mt-3 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const prior = detail.submissions.find(
                    (s: Row) => s.student_id === studentId,
                  );
                  void mutate(
                    `/homework/assignments/${work.id}/submissions`,
                    "POST",
                    {
                      student_id: studentId,
                      content,
                      ...(prior ? { version: prior.version } : {}),
                    },
                    () => setContent(""),
                  );
                }}
              >
                <label className="block">
                  学生
                  <select
                    required
                    className="sakura-input block"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  >
                    <option value="">请选择学生</option>
                    {detail.students.map((s: Row) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} · {s.student_no}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  提交正文
                  <textarea
                    required
                    className="sakura-input block min-h-40"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </label>
                <button
                  disabled={busy}
                  className="sakura-btn sakura-btn-primary"
                >
                  保存提交
                </button>
              </form>
            </details>
          ) : null}
          <div className="grid lg:grid-cols-[16rem_1fr] gap-4">
            <section className="rounded-xl border border-outline-variant p-4 space-y-3">
              <label>
                筛选提交
                <select
                  className="sakura-input block"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {[
                    ["all", "全部"],
                    ["pending", "待批阅"],
                    ["graded", "已批阅"],
                    ["needs-correction", "待订正"],
                    ["model", "优秀范文"],
                  ].map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {filtered.map((s: Row) => (
                <button
                  disabled={busy}
                  key={s.id}
                  aria-pressed={selected === s.id}
                  onClick={() => setSelected(s.id)}
                  className={`sakura-roster-button w-full text-left p-3 rounded-xl border ${selected === s.id ? "border-primary bg-primary/10" : "border-outline-variant"}`}
                >
                  <span className="sakura-roster-avatar" aria-hidden="true">
                    {s.student_name.slice(0, 1)}
                  </span>
                  <strong>{s.student_name}</strong>
                  <span className="block text-xs">
                    {labels[s.status]} ·{" "}
                    {s.status === "graded" ? `${s.total_score} 分` : "—"}
                  </span>
                </button>
              ))}
              {!filtered.length ? <p>暂无符合条件的提交。</p> : null}
            </section>
            <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 space-y-4">
              {active ? (
                <>
                  <h3 className="font-bold text-lg">
                    {active.student_name} 的作业
                  </h3>
                  <article className="whitespace-pre-wrap rounded-xl p-4 max-h-96 overflow-y-auto">
                    {submissionText(active)}
                  </article>
                  {work.lifecycle !== "archived" &&
                  work.lifecycle !== "draft" ? (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label>
                          最终分数
                          <input
                            type="number"
                            min="0"
                            max={work.max_score}
                            step="0.01"
                            className="sakura-input block"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                          />
                        </label>
                        <label>
                          印章
                          <select
                            className="sakura-input block"
                            value={stamp}
                            onChange={(e) => setStamp(e.target.value)}
                          >
                            <option value="">清除印章</option>
                            {[
                              "妙笔生花",
                              "见解独到",
                              "excellent",
                              "progress",
                              "neat",
                              "sakura",
                            ].map((s) => (
                              <option key={s} value={s}>
                                {(
                                  {
                                    excellent: "优秀",
                                    progress: "进步",
                                    neat: "工整",
                                    sakura: "樱花",
                                  } as Record<string, string>
                                )[s] || s}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label className="block">
                        批注 / 订正要求
                        <textarea
                          className="sakura-input block min-h-24"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={
                            busy || active.status === "needs-correction"
                          }
                          className="sakura-btn sakura-btn-primary"
                          onClick={() => void grade(false)}
                        >
                          保存评分
                        </button>
                        <button
                          disabled={
                            busy || active.status === "needs-correction"
                          }
                          className="sakura-btn sakura-btn-secondary"
                          onClick={() => void grade(true)}
                        >
                          保存并批下一份
                        </button>
                        <button
                          disabled={
                            busy || active.status === "needs-correction"
                          }
                          className="sakura-btn sakura-btn-secondary"
                          onClick={() =>
                            void mutate(
                              `/homework/submissions/${active.id}/review`,
                              "PATCH",
                              {
                                version: active.version,
                                action: "return",
                                feedback,
                              },
                            )
                          }
                        >
                          退回订正
                        </button>
                        <button
                          disabled={busy || active.status !== "graded"}
                          className="sakura-btn sakura-btn-ghost"
                          onClick={() =>
                            void mutate(
                              `/homework/submissions/${active.id}/review`,
                              "PATCH",
                              {
                                version: active.version,
                                action: "model",
                                enabled: !active.is_model_essay,
                              },
                            )
                          }
                        >
                          {active.is_model_essay ? "取消范文" : "标记范文"}
                        </button>
                      </div>
                    </>
                  ) : null}
                  <button
                    className="underline text-sm"
                    onClick={async () => {
                      const r = await sakuraApi.business.request(
                        `/homework/submissions/${active.id}/history`,
                      );
                      if (r.success) setHistory(r.data);
                      else setError(r.message);
                    }}
                  >
                    查看修改历史
                  </button>
                  {history ? (
                    <ul className="space-y-2 text-sm">
                      {history.map((h) => (
                        <li key={h.id}>
                          {new Date(h.created_at).toLocaleString()} ·{" "}
                          {(
                            {
                              submit: "首次提交",
                              grade: "评分前记录",
                              return: "退回前记录",
                              resubmit: "重交前记录",
                              stamp: "印章修改",
                              model: "范文修改",
                            } as Record<string, string>
                          )[h.action] || h.action}
                          <details>
                            <summary>查看留存内容</summary>
                            <pre className="whitespace-pre-wrap break-all">
                              {JSON.stringify(
                                JSON.parse(h.snapshot_json),
                                null,
                                2,
                              )}
                            </pre>
                          </details>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : (
                <p>选择一份提交开始批阅。</p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}
