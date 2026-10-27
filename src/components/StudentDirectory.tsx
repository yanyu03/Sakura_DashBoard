import { WorkspaceHero } from "./WorkspaceVisuals";
import { useCallback, useEffect, useRef, useState } from "react";
import { sakuraApi } from "../services/sakuraApiService";
import { downloadCsv } from "../services/scoreCsv";
import StudentCarePanel from "./StudentCarePanel";
type Row = Record<string, any>;
export default function StudentDirectory({
  showToast,
  careOnly = false,
  focusStudentId,
}: {
  showToast: (message: string) => void;
  careOnly?: boolean;
  focusStudentId?: string;
}) {
  const [classes, setClasses] = useState<Row[]>([]),
    [classId, setClassId] = useState(""),
    [students, setStudents] = useState<Row[]>([]),
    [selected, setSelected] = useState(""),
    [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [profile, setProfile] = useState<Row | null>(null),
    [trajectory, setTrajectory] = useState<Row[]>([]),
    [tag, setTag] = useState("care"),
    [bio, setBio] = useState(""),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const listSeq = useRef(0),
    profileSeq = useRef(0);
  useEffect(() => {
    let current = true;
    void sakuraApi.academic.list("classes").then((r) => {
      if (!current) return;
      if (r.success) {
        setClasses(r.data);
        setClassId(r.data[0]?.id || "");
      } else setError(r.message);
    });
    return () => {
      current = false;
    };
  }, []);
  useEffect(() => {
    if (!focusStudentId) return;
    void sakuraApi.business
      .request(`/students/${focusStudentId}/profile`)
      .then((r) => {
        if (r.success) {
          setClassId(r.data.class_id);
          setQ(r.data.student_no);
          setPage(1);
        } else setError(r.message);
      });
  }, [focusStudentId]);
  useEffect(() => {
    const id = ++listSeq.current;
    if (!classId) {
      setStudents([]);
      return;
    }
    setLoading(true);
    const query = new URLSearchParams({
      q,
      page: String(page),
      pageSize: "20",
      classId,
    });
    void sakuraApi.academic.list("students", query.toString()).then((r) => {
      if (id !== listSeq.current) return;
      if (r.success) {
        setStudents(r.data.items);
        setTotal(r.data.total);
        setSelected((previous) =>
          r.data.items.some((s: Row) => s.id === previous)
            ? previous
            : r.data.items[0]?.id || "",
        );
      } else {
        setError(r.message);
        setStudents([]);
        setSelected("");
      }
      setLoading(false);
    });
    return () => {
      listSeq.current++;
    };
  }, [classId, q, page]);
  const loadProfile = useCallback(async () => {
    const id = ++profileSeq.current;
    setProfile(null);
    setTrajectory([]);
    if (!selected) return;
    const [p, t] = await Promise.all([
      sakuraApi.business.request(`/students/${selected}/profile`),
      sakuraApi.business.request(`/exams/students/${selected}/trajectory`),
    ]);
    if (id !== profileSeq.current) return;
    if (p.success) {
      setProfile(p.data);
      setTag(p.data.tag_category);
      setBio(p.data.bio);
    } else setError(p.message);
    if (t.success) setTrajectory(t.data);
    else setError(t.message);
  }, [selected]);
  useEffect(() => {
    void loadProfile();
    return () => {
      profileSeq.current++;
    };
  }, [loadProfile]);
  return (
    <main className="sakura-workspace space-y-5">
      <WorkspaceHero
        title={careOnly ? "家校记录与关怀" : "学生学情档案"}
        description={
          careOnly
            ? "让沟通多一点温度。连接每个家庭，记录每一次交流，把关心落实到日常。"
            : "看见每一个独特的孩子。串联考试、辅导与成长记录，让陪伴更加具体。"
        }
        eyebrow={careOnly ? "FAMILY & CONNECTION" : "STUDENTS & PROGRESS"}
        icon={careOnly ? "forum" : "school"}
      />
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      <div className="grid sm:grid-cols-2 gap-3">
        <label>
          选择班级
          <select
            disabled={busy}
            className="sakura-input block"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setQ("");
              setPage(1);
            }}
          >
            <option value="">请选择班级</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name} · {c.actual_count} 人
              </option>
            ))}
          </select>
        </label>
        <label>
          搜索姓名或学号
          <input
            disabled={busy}
            className="sakura-input block"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      {loading ? (
        <p role="status">正在加载学生…</p>
      ) : !students.length ? (
        <p>没有符合条件的学生。</p>
      ) : (
        <>
          <label className="block">
            当前学生
            <select
              disabled={busy}
              className="sakura-input block"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} · {s.student_no}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              className="sakura-btn sakura-btn-secondary"
              disabled={busy || page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              上一页
            </button>
            <span>
              第 {page} 页 · 共 {total} 人
            </span>
            <button
              className="sakura-btn sakura-btn-secondary"
              disabled={busy || page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </button>
            <button
              className="sakura-btn sakura-btn-ghost"
              onClick={() =>
                downloadCsv("sakura-students-current-page.csv", [
                  ["学号", "姓名", "班级"],
                  ...students.map((s) => [
                    s.student_no,
                    s.full_name,
                    s.class_name,
                  ]),
                ])
              }
            >
              导出当前页名单
            </button>
          </div>
        </>
      )}
      {profile ? (
        <>
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 space-y-4">
            <div className="sakura-profile-identity">
              <span className="sakura-person-avatar" aria-hidden="true">
                {profile.full_name.slice(0, 1)}
              </span>
              <div>
                <span className="sakura-eyebrow">STUDENT PROFILE</span>
                <h3 className="font-bold text-xl">{profile.full_name}</h3>
                <p>
                  {classes.find((c) => c.id === profile.class_id)?.class_name} ·
                  学号 {profile.student_no}
                </p>
              </div>
              <span className="sakura-meta-badge">成长档案</span>
            </div>
            {!careOnly ? (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label>
                    关注标签
                    <select
                      className="sakura-input block"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                    >
                      {[
                        ["focus", "重点关注"],
                        ["progress", "进步"],
                        ["coaching", "辅导"],
                        ["competition", "竞赛"],
                        ["care", "日常关怀"],
                      ].map(([key, title]) => (
                        <option key={key} value={key}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    学生简介
                    <textarea
                      className="sakura-input block"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </label>
                </div>
                <button
                  disabled={busy}
                  className="sakura-btn sakura-btn-primary"
                  onClick={async () => {
                    setBusy(true);
                    const r = await sakuraApi.business.request(
                      `/students/${selected}/profile`,
                      "PATCH",
                      { version: profile.version, tag_category: tag, bio },
                    );
                    if (r.success) {
                      await loadProfile();
                      showToast(r.message);
                    } else setError(r.message);
                    setBusy(false);
                  }}
                >
                  保存档案
                </button>
                <h4 className="font-bold">实际考试轨迹</h4>
                {trajectory.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr>
                          <th>考试</th>
                          <th>日期</th>
                          <th>成绩 / 满分</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trajectory.map((t) => (
                          <tr key={t.exam_id}>
                            <td className="p-2">{t.title}</td>
                            <td>{t.date}</td>
                            <td>
                              {t.total === null
                                ? (
                                    {
                                      absent: "缺考",
                                      ungraded: "未评分",
                                      missing: "未录入",
                                    } as Row
                                  )[t.status]
                                : `${t.total} / ${t.max_score}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>暂无考试记录。</p>
                )}
              </>
            ) : null}
          </section>
          <StudentCarePanel
            key={selected}
            studentId={selected}
            showToast={showToast}
          />
        </>
      ) : null}
    </main>
  );
}
