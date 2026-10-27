import { useModalFocus } from "./useModalFocus";
import { useCallback, useEffect, useState, useRef } from "react";
import { sakuraApi } from "../services/sakuraApiService";

const resources = [
  ["terms", "学期"],
  ["courses", "课程"],
  ["faculty", "教师"],
  ["classes", "班级"],
  ["students", "学生"],
  ["teaching-assignments", "任教关系"],
] as const;
type Resource = (typeof resources)[number][0];
type Field = {
  key: string;
  label: string;
  type?: string;
  source?: string;
  optional?: boolean;
};
const fields: Record<Resource, Field[]> = {
  terms: [
    { key: "code", label: "学期代码" },
    { key: "name", label: "学期名称" },
    { key: "starts_on", label: "开始日期", type: "date" },
    { key: "ends_on", label: "结束日期", type: "date" },
  ],
  courses: [
    { key: "code", label: "课程代码" },
    { key: "name", label: "课程名称" },
  ],
  faculty: [
    { key: "faculty_code", label: "教工号" },
    { key: "full_name", label: "教师姓名" },
    { key: "email", label: "邮箱", type: "email" },
    { key: "password", label: "初始密码（至少 8 位）", type: "password" },
    { key: "department", label: "部门", optional: true },
    { key: "title_role", label: "职务", optional: true },
  ],
  classes: [
    { key: "class_code", label: "班级代码" },
    { key: "class_name", label: "班级名称" },
    { key: "grade_level", label: "年级" },
    {
      key: "head_teacher_id",
      label: "班主任",
      source: "faculty",
      optional: true,
    },
    { key: "room_location", label: "教室", optional: true },
  ],
  students: [
    { key: "student_no", label: "学号" },
    { key: "full_name", label: "学生姓名" },
    { key: "class_id", label: "所在班级", source: "classes" },
    { key: "term_id", label: "学期", source: "terms" },
  ],
  "teaching-assignments": [
    { key: "teacher_id", label: "任课教师", source: "faculty" },
    { key: "class_id", label: "任教班级", source: "classes" },
    { key: "course_id", label: "课程", source: "courses" },
    { key: "term_id", label: "学期", source: "terms" },
  ],
};

export default function AcademicAdminView({
  onClose,
}: {
  onClose: () => void;
}) {
  const [resource, setResource] = useState<Resource>("classes"),
    [form, setForm] = useState<Record<string, string>>({}),
    [records, setRecords] = useState<Record<string, any>[]>([]),
    [options, setOptions] = useState<Record<string, Record<string, any>[]>>({}),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [saving, setSaving] = useState(false),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [editing, setEditing] = useState<Record<string, any> | null>(null);
  const dialogRef = useModalFocus(true, onClose);
  const loadId = useRef(0);
  const load = useCallback(async () => {
    const requestId = ++loadId.current;
    setLoading(true);
    const response = await sakuraApi.academic.list(
      resource,
      resource === "students"
        ? new URLSearchParams({
            q: search,
            page: String(page),
            pageSize: "20",
          }).toString()
        : "",
    );
    if (requestId !== loadId.current) return;
    if (response.success && response.data) {
      setRecords(
        Array.isArray(response.data)
          ? response.data
          : response.data.items || [],
      );
      setTotal(response.data.total || 0);
    } else {
      setError(response.message);
      setRecords([]);
    }
    setLoading(false);
  }, [resource, search, page]);
  useEffect(() => {
    void load();
    return () => {
      loadId.current++;
    };
  }, [load]);
  const loadOptions = useCallback(async () => {
    const result = await Promise.all(
      ["terms", "courses", "faculty", "classes"].map(async (key) => {
        const response = await sakuraApi.academic.list(key);
        return [
          key,
          response.success && Array.isArray(response.data) ? response.data : [],
        ] as const;
      }),
    );
    setOptions(Object.fromEntries(result));
  }, []);
  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...form,
      ...(resource === "terms" ? { active: form.active === "1" } : {}),
      ...(editing ? { version: editing.version } : {}),
    };
    const response = await sakuraApi.academic.save(
      resource,
      payload,
      editing?.id,
    );
    if (response.success) {
      setForm({});
      setEditing(null);
      setNotice(response.message);
      await Promise.all([load(), loadOptions()]);
    } else setError(response.message);
    setSaving(false);
  };
  const archive = async (row: Record<string, any>) => {
    setError("");
    const response = await sakuraApi.academic.save(
      resource,
      { version: row.version, archived: true },
      row.id,
    );
    if (response.success) {
      setNotice(response.message);
      await Promise.all([load(), loadOptions()]);
    } else setError(response.message);
  };
  const edit = (row: Record<string, any>) => {
    setEditing(row);
    setForm(
      Object.fromEntries(
        fields[resource].map((field) => [
          field.key,
          String(row[field.key] ?? ""),
        ]),
      ),
    );
    setError("");
    setNotice("");
  };
  return (
    <div
      className="fixed inset-0 z-[200] bg-background text-on-surface overflow-y-auto p-4 sm:p-8"
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="基础资料管理"
    >
      <div className="max-w-5xl mx-auto space-y-5">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">基础资料管理</h2>
            <p className="text-sm text-on-surface-variant">
              先建立学期与班级，再添加学生和任教关系。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sakura-btn sakura-btn-secondary"
          >
            返回工作台
          </button>
        </header>
        <nav className="flex flex-wrap gap-2">
          {resources.map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-pressed={resource === key}
              onClick={() => {
                setResource(key);
                setForm({});
                setEditing(null);
                setSearch("");
                setPage(1);
                setError("");
                setNotice("");
              }}
              className={`sakura-btn ${resource === key ? "sakura-btn-primary" : "sakura-btn-secondary"}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <form
          onSubmit={submit}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-4"
        >
          <h3 className="font-bold">
            {editing ? "编辑" : "新增"}
            {resources.find(([key]) => key === resource)?.[1]}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {fields[resource]
              .filter(
                (field) =>
                  !editing ||
                  ![
                    "student_no",
                    "class_code",
                    "code",
                    "faculty_code",
                    "password",
                    "email",
                  ].includes(field.key),
              )
              .map((field) => (
                <label key={field.key} className="text-sm space-y-1 block">
                  {field.label}
                  {field.source ? (
                    <select
                      required={
                        !field.optional &&
                        !(
                          editing &&
                          resource === "students" &&
                          field.key === "term_id"
                        )
                      }
                      className="sakura-input block"
                      value={form[field.key] || ""}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                    >
                      <option value="">请选择</option>
                      {(options[field.source] || []).map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.name || row.full_name || row.class_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={
                        !field.optional &&
                        !(
                          editing &&
                          resource === "students" &&
                          field.key === "term_id"
                        )
                      }
                      type={field.type || "text"}
                      className="sakura-input block"
                      value={form[field.key] || ""}
                      onInput={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: event.currentTarget.value,
                        }))
                      }
                    />
                  )}
                </label>
              ))}
          </div>
          {resource === "terms" ? (
            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={form.active === "1"}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    active: e.target.checked ? "1" : "0",
                  }))
                }
              />
              设为当前学期
            </label>
          ) : null}
          {error ? (
            <p role="alert" className="text-error">
              {error}
            </p>
          ) : null}
          {notice ? <p role="status">{notice}</p> : null}
          <div className="flex gap-3">
            <button
              disabled={saving}
              type="submit"
              className="sakura-btn sakura-btn-primary"
            >
              {saving ? "正在保存" : "保存资料"}
            </button>
            {editing ? (
              <button
                type="button"
                className="sakura-btn sakura-btn-secondary"
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
        {resource === "students" ? (
          <label className="block text-sm">
            搜索姓名或学号
            <input
              className="sakura-input block"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
        ) : null}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 overflow-x-auto">
          {loading ? (
            <p role="status">正在加载资料…</p>
          ) : records.length ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="p-2">名称 / 代码</th>
                  <th className="p-2">关联 / 状态</th>
                  <th className="p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="border-t border-outline-variant"
                  >
                    <td className="p-2">
                      {row.name ||
                        row.full_name ||
                        row.class_name ||
                        row.teacher_id}
                      <span className="block text-xs text-on-surface-variant">
                        {row.code ||
                          row.faculty_code ||
                          row.student_no ||
                          row.class_code}
                      </span>
                    </td>
                    <td className="p-2">
                      {resource === "classes"
                        ? `${row.actual_count ?? 0} 名学生`
                        : row.class_name ||
                          row.class_id ||
                          row.role ||
                          row.starts_on ||
                          "—"}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="sakura-btn sakura-btn-ghost"
                          onClick={() => edit(row)}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="sakura-btn sakura-btn-ghost"
                          onClick={() => void archive(row)}
                        >
                          归档
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>暂无资料，请先创建。</p>
          )}
        </section>
        {resource === "students" ? (
          <div className="flex gap-3 items-center">
            <button
              className="sakura-btn sakura-btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              上一页
            </button>
            <span>
              第 {page} 页 · 共 {total} 人
            </span>
            <button
              className="sakura-btn sakura-btn-secondary"
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
