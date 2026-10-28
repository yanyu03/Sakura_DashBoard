import { useCallback, useEffect, useState } from "react";
import { sakuraApi } from "../services/sakuraApiService";
type Row = Record<string, any>;

export function ScheduleDepartmentSettings({
  onChanged,
}: {
  onChanged: () => void;
}) {
  const [data, setData] = useState<Row>({
    institutions: [],
    departments: [],
    users: [],
    members: [],
  });
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const result = await sakuraApi.business.request(
      "/schedules/department-admin",
    );
    if (result.success) setData(result.data);
    else setError(result.message);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const save = async (path: string, method: string, body: Row) => {
    setBusy(true);
    setError("");
    try {
      const result = await sakuraApi.business.request(path, method, body);
      if (!result.success) {
        setError(result.message);
        return false;
      }
      await load();
      onChanged();
      return true;
    } finally {
      setBusy(false);
    }
  };
  return (
    <details className="sakura-workspace-card border border-outline-variant rounded-xl p-4 space-y-3">
      <summary className="font-bold cursor-pointer">
        教研室与任职配置 · 管理员
      </summary>
      <p className="text-sm">
        按不可修改的用户名核对账号，再绑定教研室与身份。负责人可协调本室排课；私人草稿仅本人可见。
      </p>
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      <form
        className="grid sm:grid-cols-4 gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget,
            fields = new FormData(form);
          if (
            await save(
              "/schedules/departments",
              "POST",
              Object.fromEntries(fields),
            )
          )
            form.reset();
        }}
      >
        <label>
          所属学校
          <select name="institution_id" className="sakura-input block">
            <option value="">
              {data.institutions.length ? "请选择学校" : "首次创建将建立“本校”"}
            </option>
            {data.institutions.map((i: Row) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          教研室代码
          <input
            required
            maxLength={40}
            name="code"
            className="sakura-input block"
            placeholder="例如 CHINESE"
          />
        </label>
        <label>
          教研室名称
          <input
            required
            maxLength={80}
            name="name"
            className="sakura-input block"
            placeholder="例如语文教研室"
          />
        </label>
        <button
          disabled={busy}
          className="sakura-btn sakura-btn-secondary self-end"
        >
          创建教研室
        </button>
      </form>
      <form
        className="grid sm:grid-cols-4 gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fields = new FormData(e.currentTarget),
            unit = String(fields.get("unit_id"));
          await save(
            `/schedules/departments/${encodeURIComponent(unit)}/members`,
            "POST",
            {
              account_id: fields.get("account_id"),
              role_code: fields.get("role_code"),
            },
          );
        }}
      >
        <label>
          教研室
          <select required name="unit_id" className="sakura-input block">
            <option value="">请选择</option>
            {data.departments.map((d: Row) => (
              <option key={d.id} value={d.id}>
                {d.institution_name} · {d.name} ({d.institution_code}/{d.code})
              </option>
            ))}
          </select>
        </label>
        <label>
          账号
          <select required name="account_id" className="sakura-input block">
            <option value="">请选择</option>
            {data.users.map((u: Row) => (
              <option key={u.id} value={u.id}>
                {u.faculty_code} · {u.full_name || "未登记姓名"}
              </option>
            ))}
          </select>
        </label>
        <label>
          身份
          <select name="role_code" className="sakura-input block">
            <option value="teacher">教师</option>
            <option value="director">教研室负责人（主任）</option>
          </select>
        </label>
        <button
          disabled={busy}
          className="sakura-btn sakura-btn-primary self-end"
        >
          确认任职
        </button>
      </form>
      <ul className="space-y-2">
        {data.members.map((m: Row) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-2 text-sm"
          >
            <span>
              {m.unit_name} ({m.institution_code}/{m.unit_code}) ·{" "}
              {m.faculty_code} · {m.full_name} ·{" "}
              {m.role_code === "director"
                ? "负责人"
                : m.role_code === "mentor"
                  ? "导师"
                  : "教师"}
              {m.ends_on ? ` · 至 ${m.ends_on}` : ""}
            </span>
            <button
              disabled={busy}
              className="sakura-btn sakura-btn-ghost"
              onClick={() =>
                void save(
                  `/schedules/appointments/${encodeURIComponent(m.id)}`,
                  "PATCH",
                  { revoked: true },
                )
              }
            >
              撤销任职
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
