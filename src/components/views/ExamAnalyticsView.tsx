import { WorkspaceHero } from "../WorkspaceVisuals";
import { useEffect, useRef, useState } from "react";
import { sakuraApi } from "../../services/sakuraApiService";
import { parseScoreCsv, downloadCsv } from "../../services/scoreCsv";
type Row = Record<string, any>;
export function ExamAnalyticsView({
  showToast,
  focusExamId,
}: {
  focusExamId?: string;
  showToast: (message: string) => void;
}) {
  const [exams, setExams] = useState<Row[]>([]),
    [selected, setSelected] = useState(""),
    [detail, setDetail] = useState<Row | null>(null),
    [classes, setClasses] = useState<Row[]>([]),
    [courses, setCourses] = useState<Row[]>([]),
    [form, setForm] = useState<Row>({
      pass_ratio: "0.6",
      excellent_ratio: "0.9",
    }),
    [questions, setQuestions] = useState("总分,100"),
    [csv, setCsv] = useState(""),
    [preview, setPreview] = useState<Row | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false);
  const seq = useRef(0);
  const list = async (prefer?: string) => {
    const r = await sakuraApi.business.request("/exams/batches");
    if (r.success) {
      setExams(r.data);
      setSelected(
        (previous) =>
          prefer ||
          (r.data.some((e: Row) => e.id === previous)
            ? previous
            : r.data[0]?.id || ""),
      );
    } else setError(r.message);
  };
  const load = async (id: string) => {
    const n = ++seq.current;
    setLoading(true);
    const r = await sakuraApi.business.request(`/exams/batches/${id}`);
    if (n !== seq.current) return;
    if (r.success) setDetail(r.data);
    else {
      setDetail(null);
      setError(r.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    void list(focusExamId);
    void Promise.all([
      sakuraApi.academic.list("classes"),
      sakuraApi.academic.list("courses"),
    ]).then(([c, k]) => {
      if (c.success) setClasses(c.data);
      if (k.success) setCourses(k.data);
    });
  }, []);
  useEffect(() => {
    setPreview(null);
    setDetail(null);
    setCsv("");
    if (selected) void load(selected);
    else seq.current++;
  }, [selected]);
  useEffect(() => {
    if (focusExamId) setSelected(focusExamId);
  }, [focusExamId]);
  const set = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));
  const template = () => {
    if (!detail) return;
    downloadCsv("sakura-score-template.csv", [
      [
        "student_no",
        "status",
        ...detail.questions.map((_: Row, i: number) => `Q${i + 1}`),
      ],
      ...detail.students.map((s: Row) => [
        s.student_no,
        "ungraded",
        ...detail.questions.map(() => ""),
      ]),
    ]);
  };
  return (
    <main className="sakura-workspace space-y-5 text-on-surface">
      <WorkspaceHero
        title="考试与成绩分析"
        description="看见分数背后的成长。从成绩录入到学情回顾，用真实记录支持下一步教学。"
        eyebrow="ASSESSMENT & GROWTH"
        icon="query_stats"
      />
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      <details className="rounded-xl border border-outline-variant p-4">
        <summary>建立考试</summary>
        <form
          className="grid sm:grid-cols-2 gap-3 mt-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const formFields = new FormData(e.currentTarget);
            setBusy(true);
            setError("");
            try {
              const qs = questions
                .split(/\r?\n/)
                .filter((t) => t.trim())
                .map((line) => {
                  const [title, max] = line.split(/[,，]/);
                  return { title, max_score: Number(max) };
                });
              const r = await sakuraApi.business.request(
                "/exams/batches",
                "POST",
                {
                  ...form,
                  exam_date: formFields.get("exam_date"),
                  pass_ratio: Number(form.pass_ratio),
                  excellent_ratio: Number(form.excellent_ratio),
                  questions: qs,
                },
              );
              if (r.success) {
                await list(r.data.id);
                showToast(r.message);
              } else setError(r.message);
            } catch {
              setError("题目格式无效，请每行填写“题目名称,满分”。");
            }
            setBusy(false);
          }}
        >
          <label>
            考试名称
            <input
              required
              className="sakura-input block"
              value={form.title || ""}
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label>
            考试日期
            <input
              name="exam_date"
              required
              type="date"
              className="sakura-input block"
              value={form.exam_date || ""}
              onInput={(e) => set("exam_date", e.currentTarget.value)}
            />
          </label>
          {(
            [
              ["class_id", "考试班级", classes, "class_name"],
              ["course_id", "考试课程", courses, "name"],
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
          {[
            ["pass_ratio", "及格比例（0—1）"],
            ["excellent_ratio", "优秀比例（0—1）"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                required
                className="sakura-input block"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </label>
          ))}
          <label className="sm:col-span-2">
            题目（每行：名称,满分）
            <textarea
              required
              className="sakura-input block min-h-24"
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
            />
          </label>
          <button disabled={busy} className="sakura-btn sakura-btn-primary">
            创建考试
          </button>
        </form>
      </details>
      <label className="block">
        选择考试
        <select
          disabled={busy}
          className="sakura-input block"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">请选择</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.exam_date} · {exam.title} · {exam.class_name}
            </option>
          ))}
        </select>
      </label>
      {loading ? <p role="status">正在加载成绩…</p> : null}
      {!selected ? <p>暂无考试，请先建立考试并配置题目。</p> : null}
      {detail ? (
        <>
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-lg">
              {detail.exam.title} · 满分 {detail.exam.max_score}
            </h3>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["应考", detail.stats.expected],
                ["已评分", detail.stats.scored],
                ["缺考", detail.stats.absent],
                ["未评分", detail.stats.ungraded],
                ["未录入", detail.stats.missing],
                [
                  "均分",
                  detail.stats.average === null
                    ? "暂无"
                    : detail.stats.average.toFixed(2),
                ],
                [
                  "及格率",
                  detail.stats.passRate === null
                    ? "暂无"
                    : `${(detail.stats.passRate * 100).toFixed(1)}%`,
                ],
                [
                  "优秀率",
                  detail.stats.excellentRate === null
                    ? "暂无"
                    : `${(detail.stats.excellentRate * 100).toFixed(1)}%`,
                ],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs text-on-surface-variant">{key}</dt>
                  <dd className="font-bold text-xl">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-4 text-sm">
              {detail.stats.distribution.map((d: Row) => (
                <p key={d.label}>
                  {d.label}：{d.count} 人
                </p>
              ))}
            </div>
            <p className="text-sm">
              题目均分：
              {detail.stats.questionAverages
                .map(
                  (q: Row) =>
                    `${q.title} ${q.average === null ? "暂无" : q.average.toFixed(2)} / ${q.max_score}`,
                )
                .join("；")}
            </p>
          </section>
          <section className="rounded-xl border border-outline-variant p-4 space-y-3">
            <h3 className="font-bold">成绩导入</h3>
            <p className="text-sm">
              下载模板后填写：scored 为已评分，absent 为缺考，ungraded
              为未评分。后两种状态的题目分数留空。导入会替换文件内学生的成绩。
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className="sakura-btn sakura-btn-secondary"
                onClick={template}
              >
                下载 CSV 模板
              </button>
              <label className="sakura-btn sakura-btn-secondary">
                读取 CSV 文件
                <input
                  className="sr-only"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 4000000) {
                        setError("CSV 文件不能超过 4 MB");
                        return;
                      }
                      setCsv(await file.text());
                      setPreview(null);
                    }
                  }}
                />
              </label>
            </div>
            <label className="block">
              CSV 内容
              <textarea
                className="sakura-input block min-h-36 font-mono text-sm"
                value={csv}
                onChange={(e) => {
                  setCsv(e.target.value);
                  setPreview(null);
                }}
              />
            </label>
            <button
              disabled={busy || !csv}
              className="sakura-btn sakura-btn-primary"
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  const rows = parseScoreCsv(csv),
                    r = await sakuraApi.business.request(
                      `/exams/batches/${selected}/import-preview`,
                      "POST",
                      { version: detail.exam.version, rows },
                    );
                  if (r.success)
                    setPreview({
                      ...r.data,
                      sourceRows: rows,
                      request_key: crypto.randomUUID(),
                    });
                  else setError(r.message);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "CSV 格式无效");
                }
                setBusy(false);
              }}
            >
              校验并预览
            </button>
            {preview ? (
              <div className="space-y-3">
                <p>已校验 {preview.rows.length} 行；保存后替换对应学生成绩。</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th>学号</th>
                        <th>姓名</th>
                        <th>状态</th>
                        <th>总分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((r: Row) => (
                        <tr key={r.student_id}>
                          <td>{r.student_no}</td>
                          <td>{r.full_name}</td>
                          <td>{r.status}</td>
                          <td>{r.total ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  disabled={busy}
                  className="sakura-btn sakura-btn-primary"
                  onClick={async () => {
                    setBusy(true);
                    const r = await sakuraApi.business.request(
                      `/exams/batches/${selected}/import`,
                      "POST",
                      {
                        version: preview.version,
                        rows: preview.sourceRows,
                        previewHash: preview.previewHash,
                        request_key: preview.request_key,
                      },
                    );
                    if (r.success) {
                      await load(selected);
                      setPreview(null);
                      showToast(r.message);
                    } else setError(r.message);
                    setBusy(false);
                  }}
                >
                  确认导入这些成绩
                </button>
              </div>
            ) : null}
          </section>
          <section className="rounded-xl border border-outline-variant p-4 overflow-x-auto space-y-3">
            <h3 className="font-bold">成绩名册</h3>
            <button
              className="sakura-btn sakura-btn-secondary"
              onClick={() =>
                downloadCsv("sakura-exam-results.csv", [
                  [
                    "学号",
                    "姓名",
                    "状态",
                    ...detail.questions.map((q: Row) => q.title),
                    "总分",
                  ],
                  ...detail.students.map((s: Row) => [
                    s.student_no,
                    s.full_name,
                    s.status,
                    ...s.scores,
                    s.total,
                  ]),
                ])
              }
            >
              导出当前考试 CSV
            </button>
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  <th>学号</th>
                  <th>姓名</th>
                  <th>状态</th>
                  <th>总分</th>
                </tr>
              </thead>
              <tbody>
                {detail.students.map((s: Row) => (
                  <tr className="border-t border-outline-variant" key={s.id}>
                    <td className="p-2">{s.student_no}</td>
                    <td>{s.full_name}</td>
                    <td>
                      {
                        (
                          {
                            scored: "已评分",
                            absent: "缺考",
                            ungraded: "未评分",
                            missing: "未录入",
                          } as Row
                        )[s.status]
                      }
                    </td>
                    <td>{s.total ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : null}
    </main>
  );
}
