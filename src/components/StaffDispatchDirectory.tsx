import { useEffect, useState } from "react";
import { sakuraApi } from "../services/sakuraApiService";
type Row = Record<string, any>;
const names: Record<string, string> = {
  director: "负责人",
  teacher: "教师",
  homeroom_teacher: "班主任",
  subject_member: "学科组成员",
  mentor: "导师",
  counselor: "辅导员",
};
export function StaffDispatchDirectory({
  refreshKey = 0,
  target,
  onPick,
}: {
  refreshKey?: number;
  target?: { unitId: string; courseId: string };
  onPick?: (accountId: string) => void;
}) {
  const [scope, setScope] = useState<Row>({
      units: [],
      subjects: [],
      courses: [],
    }),
    [unit, setUnit] = useState(""),
    [course, setCourse] = useState(""),
    [teachers, setTeachers] = useState<Row[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    void sakuraApi.business.request("/organization/scope").then((r) => {
      if (!current) return;
      if (r.success) {
        setScope(r.data);
        setUnit((previous) =>
          r.data.units.some((u: Row) => u.id === previous)
            ? previous
            : r.data.units.find((u: Row) => u.unit_type === "subject_group")
                ?.id ||
              r.data.units.find((u: Row) => u.canManage)?.id ||
              "",
        );
      } else setError(r.message);
    });
    return () => {
      current = false;
    };
  }, [refreshKey]);
  useEffect(() => {
    let current = true;
    if (!unit) {
      setTeachers([]);
      return;
    }
    setBusy(true);
    setError("");
    setTeachers([]);
    void sakuraApi.business
      .request(
        "/organization/dispatchable-teachers?" +
          new URLSearchParams({
            unit_id: unit,
            ...(course ? { course_id: course } : {}),
          }),
      )
      .then((r) => {
        if (!current) return;
        if (r.success) setTeachers(r.data.teachers);
        else setError(r.message);
        setBusy(false);
      });
    return () => {
      current = false;
    };
  }, [unit, course, refreshKey]);
  return (
    <details className="sakura-workspace-card border border-outline-variant rounded-xl p-4 space-y-3">
      <summary className="font-bold cursor-pointer">
        可协调教师 · 组织与学科目录
      </summary>
      <p className="text-sm">
        按有效任职发现本组或负责范围内的任教资格候选。同一人兼任班主任与学科组员时合并展示，空闲时间和实际课时安排仍需确认。
      </p>
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      {!scope.units.length ? (
        <p>尚无可用组织任职，请联系管理员确认岗位。</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="min-w-0">
            查找范围
            <select
              className="sakura-input block min-w-0 max-w-full"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="">请选择负责单位或学科组</option>
              {scope.units
                .filter(
                  (u: Row) => u.unit_type === "subject_group" || u.canManage,
                )
                .map((u: Row) => (
                  <option key={u.id} value={u.id}>
                    {u.path} ({u.code})
                  </option>
                ))}
            </select>
          </label>
          <label className="min-w-0">
            任教课程筛选
            <select
              className="sakura-input block min-w-0 max-w-full"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              <option value="">全部已确认课程</option>
              {scope.courses.map((c: Row) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {busy ? (
        <p role="status">正在核对任职与任教资格…</p>
      ) : unit && !teachers.length ? (
        <p>当前范围与课程下暂无有效候选。</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {teachers.map((t) => (
            <article
              key={t.person_id}
              className="border border-outline-variant rounded-xl p-4 space-y-2 bg-surface-container-lowest"
            >
              <h4 className="font-bold">
                {t.full_name} · {t.faculty_code}
              </h4>
              <p className="text-sm">候选资格已核对 · 空闲时间待确认</p>
              <ul className="text-sm space-y-1">
                {t.qualifications.map((q: Row) => (
                  <li key={q.unit_id + q.course_id}>
                    {q.course_name} · {q.unit_name} ·{" "}
                    {q.evidence === "confirmed"
                      ? "管理员已确认资格"
                      : "当前有效任课"}
                  </li>
                ))}
              </ul>
              <p className="font-bold text-sm">当前兼任</p>
              <ul className="text-sm space-y-1">
                {t.appointments.map((a: Row) => (
                  <li key={a.id}>
                    {names[a.role_code] || a.role_code} · {a.path}
                  </li>
                ))}
              </ul>
              {target &&
              onPick &&
              t.qualifications.some(
                (q: Row) =>
                  q.unit_id === target.unitId &&
                  q.course_id === target.courseId,
              ) ? (
                <button
                  type="button"
                  className="sakura-btn sakura-btn-secondary"
                  onClick={() => onPick(t.account_id)}
                >
                  选择为当前申请的代课教师
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </details>
  );
}
