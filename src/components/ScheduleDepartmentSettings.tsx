import { useCallback, useEffect, useState } from "react";
import { sakuraApi } from "../services/sakuraApiService";
type Row = Record<string, any>;
const roleNames: Record<string, string> = {
  director: "负责人",
  teacher: "教师 / 成员",
  homeroom_teacher: "班主任",
  subject_member: "学科组成员",
  mentor: "导师",
  counselor: "辅导员",
};
const initial = {
  institutions: [],
  units: [],
  types: [],
  parentRules: [],
  subjects: [],
  subjectCourses: [],
  courses: [],
  users: [],
  members: [],
  classLinks: [],
  classes: [],
  qualifications: [],
};
function Pick({
  name,
  label,
  items,
  display,
  required = true,
  ...props
}: {
  name: string;
  label: string;
  items: Row[];
  display: (row: Row) => string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className="min-w-0">
      {label}
      <select
        name={name}
        required={required}
        className="sakura-input block min-w-0 max-w-full"
        {...props}
      >
        <option value="">请选择</option>
        {items.map((r) => (
          <option key={r.id} value={r.id}>
            {display(r)}
          </option>
        ))}
      </select>
    </label>
  );
}
function Field({
  name,
  label,
  type = "text",
  required = true,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="min-w-0">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        maxLength={80}
        className="sakura-input block"
      />
    </label>
  );
}
export function ScheduleDepartmentSettings({
  onChanged,
}: {
  onChanged: () => void;
}) {
  const [data, setData] = useState<Row>(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [unitType, setUnitType] = useState("party_committee"),
    [parentId, setParentId] = useState(""),
    [appointedUnit, setAppointedUnit] = useState(""),
    [qualifiedAppointment, setQualifiedAppointment] = useState("");
  const load = useCallback(async () => {
    const result = await sakuraApi.business.request("/organization/admin");
    if (result.success) setData(result.data);
    else setError(result.message);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const save = async (path: string, method: string, body: Row) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await sakuraApi.business.request(path, method, body);
      if (!r.success) {
        setError(r.message);
        return false;
      }
      await load();
      onChanged();
      setMessage(r.message);
      return true;
    } finally {
      setBusy(false);
    }
  };
  const submit =
    (path: string) => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      await save(path, "POST", Object.fromEntries(new FormData(form)));
    };
  const unitName = (unit: Row) =>
    `${unit.path || unit.name} (${data.institutions.find((i: Row) => i.id === unit.institution_id)?.code}/${unit.code})`;
  const parent = data.units.find((u: Row) => u.id === parentId),
    selectedUnit = data.units.find((u: Row) => u.id === appointedUnit);
  const appointment = data.members.find(
      (a: Row) => a.id === qualifiedAppointment,
    ),
    qualificationUnit = data.units.find(
      (u: Row) => u.id === appointment?.unit_id,
    );
  const roles =
    selectedUnit?.unit_type === "subject_group"
      ? ["subject_member", "director", "teacher", "mentor"]
      : ["homeroom", "class"].includes(selectedUnit?.unit_type)
        ? ["homeroom_teacher", "teacher", "director"]
        : ["director", "teacher", "mentor", "counselor"];
  const activeUnits = data.units.filter(
    (u: Row) => u.status === "active" && u.pathActive,
  );
  const activeGroupMembers = data.members.filter(
    (m: Row) =>
      activeUnits.some(
        (u: Row) => u.id === m.unit_id && u.unit_type === "subject_group",
      ) &&
      ["subject_member", "teacher", "director", "mentor"].includes(m.role_code),
  );
  return (
    <details className="sakura-workspace-card border border-outline-variant rounded-xl p-4 space-y-4">
      <summary className="font-bold cursor-pointer">
        组织架构与兼任配置 · 管理员
      </summary>
      <p className="text-sm">
        先建学校与学科，再建立组织链、班级归属和人员任职。同一账号可兼任班主任与学科组成员，候选目录按有效任职和任教资格展示。
      </p>
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      {message ? <p role="status">{message}</p> : null}
      <details>
        <summary className="cursor-pointer font-bold">
          1. 学校与学科目录
        </summary>
        <form
          className="grid sm:grid-cols-3 gap-3 mt-3"
          onSubmit={submit("/organization/schools")}
        >
          <Field name="code" label="新学校代码" />
          <Field name="name" label="新学校名称" />
          <button
            disabled={busy}
            className="sakura-btn sakura-btn-secondary self-end"
          >
            创建学校根节点
          </button>
        </form>
        <form
          className="grid sm:grid-cols-4 gap-3 mt-3"
          onSubmit={submit("/organization/subjects")}
        >
          <Pick
            name="institution_id"
            label="学科所属学校"
            items={data.institutions}
            display={(r) => `${r.name} (${r.code})`}
          />
          <Field name="code" label="学科代码" />
          <Field name="name" label="学科名称" />
          <button
            disabled={busy}
            className="sakura-btn sakura-btn-secondary self-end"
          >
            建立学科
          </button>
        </form>
        <form
          className="grid sm:grid-cols-3 gap-3 mt-3"
          onSubmit={submit("/organization/subject-courses")}
        >
          <Pick
            name="subject_id"
            label="学科"
            items={data.subjects.filter((s: Row) => s.status === "active")}
            display={(r) =>
              `${r.name} (${data.institutions.find((i: Row) => i.id === r.institution_id)?.code}/${r.code})`
            }
          />
          <Pick
            name="course_id"
            label="学科下的课程"
            items={data.courses}
            display={(r) => `${r.name} (${r.code})`}
          />
          <button
            disabled={busy}
            className="sakura-btn sakura-btn-secondary self-end"
          >
            关联课程
          </button>
        </form>
        <p className="text-sm mt-2">
          课程可先在“基础资料管理”建立。一个学科可包含多门课程，学科归属不自动授予任教资格。
        </p>
      </details>
      <section className="space-y-3">
        <h4 className="font-bold">2. 组织节点与上下级</h4>
        <form
          className="grid sm:grid-cols-2 gap-3"
          onSubmit={submit("/organization/units")}
        >
          <Pick
            name="unit_type"
            label="节点类型"
            value={unitType}
            onChange={(e) => {
              setUnitType(e.target.value);
              setParentId("");
            }}
            items={data.types
              .filter(
                (t: Row) =>
                  !["school", "grade", "class", "group"].includes(t.code),
              )
              .map((t: Row) => ({ ...t, id: t.code }))}
            display={(r) => r.label}
          />
          <Pick
            name="parent_id"
            label="归属上级"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            items={activeUnits.filter((u: Row) =>
              data.parentRules.some(
                (r: Row) =>
                  r.parent_type === u.unit_type && r.child_type === unitType,
              ),
            )}
            display={unitName}
          />
          <Field name="code" label="节点代码" />
          <Field name="name" label="节点名称" />
          {unitType === "subject_group" ? (
            <Pick
              name="subject_id"
              label="学科组对应学科"
              items={data.subjects.filter(
                (s: Row) =>
                  s.institution_id === parent?.institution_id &&
                  s.status === "active",
              )}
              display={(s) => `${s.name} (${s.code})`}
            />
          ) : null}
          <button
            disabled={busy}
            className="sakura-btn sakura-btn-primary self-end"
          >
            建立组织节点
          </button>
        </form>
        <p className="text-sm">
          模板支持：学校 → 校党委 → 教务处 → 年级部 → 年级办公室 →
          班级；年级部下可并设学科组。
        </p>
        <ul className="space-y-2">
          {data.units.map((u: Row) => (
            <li
              key={u.id}
              className="border-t border-outline-variant pt-2 text-sm flex flex-wrap justify-between gap-2"
            >
              <span>
                {unitName(u)} · {u.type_label}
                {!u.pathActive ? " · 已归档或上级已归档" : ""}
                {u.subject_name ? ` · ${u.subject_name}` : ""}
              </span>
              {u.pathActive ? (
                <button
                  disabled={busy}
                  className="sakura-btn sakura-btn-ghost"
                  onClick={() =>
                    void save(`/organization/units/${u.id}`, "PATCH", {
                      archived: true,
                    })
                  }
                >
                  归档节点
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <h4 className="font-bold">3. 人员任职与兼任</h4>
        <form
          className="grid sm:grid-cols-3 gap-3"
          onSubmit={submit("/organization/appointments")}
        >
          <Pick
            name="unit_id"
            label="任职单位"
            value={appointedUnit}
            onChange={(e) => setAppointedUnit(e.target.value)}
            items={activeUnits}
            display={unitName}
          />
          <Pick
            name="account_id"
            label="人员账号"
            items={data.users}
            display={(u) =>
              `${u.faculty_code} · ${u.full_name || "未登记姓名"}`
            }
          />
          <Pick
            name="role_code"
            label="岗位身份"
            items={roles.map((role) => ({ id: role, name: roleNames[role] }))}
            display={(r) => r.name}
          />
          <Field
            name="starts_on"
            label="任职开始（选填，默认今天）"
            type="date"
            required={false}
          />
          <Field
            name="ends_on"
            label="任职结束（选填，含当天）"
            type="date"
            required={false}
          />
          <Pick
            name="supervisor_appointment_id"
            label="直属上级任职（选填）"
            required={false}
            items={data.members.filter(
              (a: Row) => a.institution_id === selectedUnit?.institution_id,
            )}
            display={(a) =>
              `${a.faculty_code} · ${roleNames[a.role_code] || a.role_code} · ${data.units.find((u: Row) => u.id === a.unit_id)?.name || ""}`
            }
          />
          <button disabled={busy} className="sakura-btn sakura-btn-primary">
            确认新增任职
          </button>
        </form>
        <ul className="space-y-2">
          {data.members.map((a: Row) => (
            <li
              key={a.id}
              className="border-t border-outline-variant pt-2 text-sm flex flex-wrap justify-between gap-2"
            >
              <span>
                {a.faculty_code} · {a.full_name || "未登记姓名"} ·{" "}
                {roleNames[a.role_code] || a.role_code} ·{" "}
                {data.units.find((u: Row) => u.id === a.unit_id)?.path ||
                  a.unit_id}{" "}
                · {a.starts_on} 至 {a.ends_on || "长期"}
              </span>
              <button
                disabled={busy}
                className="sakura-btn sakura-btn-ghost"
                onClick={() =>
                  void save(`/schedules/appointments/${a.id}`, "PATCH", {
                    revoked: true,
                  })
                }
              >
                撤销任职
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <h4 className="font-bold">4. 班级归属</h4>
        <form
          className="grid sm:grid-cols-3 gap-3"
          onSubmit={submit("/organization/class-links")}
        >
          <Pick
            name="unit_id"
            label="班级组织节点"
            items={activeUnits.filter(
              (u: Row) =>
                ["homeroom", "class"].includes(u.unit_type) &&
                !data.classLinks.some((l: Row) => l.unit_id === u.id),
            )}
            display={unitName}
          />
          <Pick
            name="class_id"
            label="教务班级"
            items={data.classes.filter(
              (c: Row) =>
                !data.classLinks.some((l: Row) => l.class_id === c.id),
            )}
            display={(c) => `${c.class_name} (${c.class_code})`}
          />
          <button
            disabled={busy}
            className="sakura-btn sakura-btn-secondary self-end"
          >
            确认班级归属
          </button>
        </form>
        <p className="text-sm">
          绑定后，班主任权限以班级节点的有效班主任任职为准。学科组成员资格不自动开放班级学生资料。
        </p>
        <ul className="text-sm space-y-1">
          {data.classLinks.map((l: Row) => (
            <li key={l.class_id}>
              {l.class_name} →{" "}
              {data.units.find((u: Row) => u.id === l.unit_id)?.path}
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <h4 className="font-bold">5. 可协调课程资格</h4>
        <form
          className="grid sm:grid-cols-2 gap-3"
          onSubmit={submit("/organization/qualifications")}
        >
          <Pick
            name="appointment_id"
            label="学科组任职"
            value={qualifiedAppointment}
            onChange={(e) => setQualifiedAppointment(e.target.value)}
            items={activeGroupMembers}
            display={(a) =>
              `${a.faculty_code} · ${roleNames[a.role_code]} · ${data.units.find((u: Row) => u.id === a.unit_id)?.path}`
            }
          />
          <Pick
            name="course_id"
            label="确认可任教课程"
            items={data.courses.filter((c: Row) =>
              data.subjectCourses.some(
                (s: Row) =>
                  s.subject_id === qualificationUnit?.subject_id &&
                  s.course_id === c.id,
              ),
            )}
            display={(c) => `${c.name} (${c.code})`}
          />
          <Field
            name="starts_on"
            label="资格开始（选填）"
            type="date"
            required={false}
          />
          <Field
            name="ends_on"
            label="资格结束（选填）"
            type="date"
            required={false}
          />
          <button disabled={busy} className="sakura-btn sakura-btn-primary">
            确认任教资格
          </button>
        </form>
        <ul className="space-y-2">
          {data.qualifications.map((q: Row) => (
            <li
              key={q.id}
              className="text-sm flex flex-wrap justify-between gap-2"
            >
              <span>
                {
                  data.members.find((m: Row) => m.id === q.appointment_id)
                    ?.faculty_code
                }{" "}
                · {q.course_name} · {q.starts_on} 至 {q.ends_on || "长期"}
              </span>
              <button
                disabled={busy}
                className="sakura-btn sakura-btn-ghost"
                onClick={() =>
                  void save(`/organization/qualifications/${q.id}`, "PATCH", {
                    version: q.version,
                    revoked: true,
                  })
                }
              >
                撤销资格
              </button>
            </li>
          ))}
        </ul>
      </section>
    </details>
  );
}
