import { useCallback, useEffect, useRef, useState } from "react";
import { sakuraApi } from "../services/sakuraApiService";
type Row = Record<string, any>;
export default function StudentCarePanel({
  studentId,
  showToast,
}: {
  studentId: string;
  showToast: (message: string) => void;
}) {
  const [contacts, setContacts] = useState<Row[]>([]),
    [threads, setThreads] = useState<Row[]>([]),
    [threadId, setThreadId] = useState(""),
    [messages, setMessages] = useState<Row[]>([]),
    [todos, setTodos] = useState<Row[]>([]),
    [journals, setJournals] = useState<Row[]>([]),
    [name, setName] = useState(""),
    [relationship, setRelationship] = useState(""),
    [phone, setPhone] = useState(""),
    [content, setContent] = useState(""),
    [kind, setKind] = useState("note"),
    [todoTitle, setTodoTitle] = useState(""),
    [due, setDue] = useState(""),
    [journal, setJournal] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const seq = useRef(0),
    msgSeq = useRef(0),
    requestKey = useRef(crypto.randomUUID());
  const load = useCallback(async () => {
    const n = ++seq.current;
    setLoading(true);
    const responses = await Promise.all([
      sakuraApi.business.request(`/care/contacts?studentId=${studentId}`),
      sakuraApi.business.request(`/care/threads?studentId=${studentId}`),
      sakuraApi.business.request(`/care/todos?studentId=${studentId}`),
      sakuraApi.business.request(`/students/${studentId}/coaching-journals`),
    ]);
    if (n !== seq.current) return;
    const setters = [setContacts, setThreads, setTodos, setJournals];
    responses.forEach((r, i) => {
      if (r.success) setters[i](r.data);
      else setError(r.message);
    });
    setLoading(false);
  }, [studentId]);
  useEffect(() => {
    setThreadId("");
    setMessages([]);
    setContent("");
    requestKey.current = crypto.randomUUID();
    void load();
    return () => {
      seq.current++;
      msgSeq.current++;
    };
  }, [load]);
  const loadMessages = useCallback(async () => {
    const n = ++msgSeq.current;
    if (!threadId) {
      setMessages([]);
      return;
    }
    const r = await sakuraApi.business.request(
      `/care/threads/${threadId}/messages`,
    );
    if (n !== msgSeq.current) return;
    if (r.success) setMessages(r.data);
    else setError(r.message);
  }, [threadId]);
  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);
  const mutate = async (path: string, method: string, payload: Row) => {
    setBusy(true);
    setError("");
    const r = await sakuraApi.business.request(path, method, payload);
    if (r.success) {
      showToast(r.message);
      await load();
      await loadMessages();
    } else setError(r.message);
    setBusy(false);
    return r;
  };
  const active = threads.find((t) => t.id === threadId);
  return (
    <section className="space-y-4">
      <h3 className="font-bold text-xl">家校记录与学生关怀</h3>
      <p className="text-sm text-on-surface-variant">
        当前仅保存校内记录和待发送内容，尚未接入家长端或短信服务。家长来信为教师手工录入，不代表真实送达回执。
      </p>
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      {loading ? <p role="status">正在加载关怀记录…</p> : null}
      <details className="border border-outline-variant rounded-xl p-4">
        <summary>添加家长联系人</summary>
        <form
          className="mt-3 grid sm:grid-cols-3 gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await mutate("/care/contacts", "POST", {
              student_id: studentId,
              name,
              relationship,
              phone,
            });
            if (r.success) {
              setName("");
              setPhone("");
              setRelationship("");
            }
          }}
        >
          {[
            ["姓名", name, setName],
            ["与学生关系", relationship, setRelationship],
            ["电话（可选）", phone, setPhone],
          ].map(([label, value, setter]) => (
            <label key={String(label)}>
              {String(label)}
              <input
                required={label !== "电话（可选）"}
                className="sakura-input block"
                value={String(value)}
                onChange={(e) =>
                  (setter as (v: string) => void)(e.target.value)
                }
              />
            </label>
          ))}
          <button disabled={busy} className="sakura-btn sakura-btn-primary">
            保存联系人
          </button>
        </form>
      </details>
      <div className="flex flex-wrap gap-2">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="border border-outline-variant rounded-xl p-3"
          >
            <p>
              {c.name} · {c.relationship} {c.phone}
            </p>
            <button
              disabled={busy}
              className="sakura-btn sakura-btn-secondary"
              onClick={async () => {
                const r = await mutate("/care/threads", "POST", {
                  contact_id: c.id,
                });
                if (r.success) setThreadId(r.data.id);
              }}
            >
              打开我的会话
            </button>
            <button
              disabled={busy}
              className="sakura-btn sakura-btn-ghost"
              onClick={() =>
                void mutate(`/care/contacts/${c.id}`, "PATCH", {
                  version: c.version,
                  archived: true,
                })
              }
            >
              归档联系人
            </button>
          </div>
        ))}
      </div>
      {!contacts.length ? <p>暂无联系人。</p> : null}
      {threads.length ? (
        <label className="block">
          选择会话
          <select
            disabled={busy}
            className="sakura-input block"
            value={threadId}
            onChange={(e) => {
              setThreadId(e.target.value);
              setContent("");
              requestKey.current = crypto.randomUUID();
            }}
          >
            <option value="">请选择会话</option>
            {threads.map((t) => (
              <option key={t.id} value={t.id}>
                {t.contact_name} · 未读记录 {t.unread_count}
                {t.canWrite ? " · 我的会话" : " · 管理员查看"}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {threadId ? (
        <div className="border border-outline-variant rounded-xl p-4 space-y-3">
          <h4 className="font-bold">{active?.contact_name} 的会话</h4>
          <div className="max-h-80 overflow-y-auto space-y-3">
            {messages.map((m) => (
              <article
                key={m.id}
                className="bg-surface-container-low rounded-xl p-3"
              >
                <p className="text-xs text-on-surface-variant">
                  {
                    (
                      {
                        note: "站内备注",
                        outgoing: "待发送，未对外投递",
                        "incoming-record": "手工录入家长来信",
                      } as Row
                    )[m.kind]
                  }{" "}
                  · {new Date(m.created_at).toLocaleString()}
                </p>
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.status === "queued" ? (
                  <p className="text-xs">
                    通知可处理时间：{new Date(m.not_before).toLocaleString()}
                    （免打扰按北京时间）
                  </p>
                ) : null}
              </article>
            ))}
            {!messages.length ? <p>暂无消息。</p> : null}
          </div>
          {active?.canWrite ? (
            <>
              <button
                disabled={busy}
                className="sakura-btn sakura-btn-ghost"
                onClick={() =>
                  void mutate(`/care/threads/${threadId}/read`, "POST", {})
                }
              >
                标记记录已读
              </button>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const r = await mutate(
                    `/care/threads/${threadId}/messages`,
                    "POST",
                    { request_key: requestKey.current, kind, content },
                  );
                  if (r.success) {
                    setContent("");
                    requestKey.current = crypto.randomUUID();
                  }
                }}
              >
                <label className="block">
                  记录类型
                  <select
                    className="sakura-input block"
                    value={kind}
                    onChange={(e) => {
                      setKind(e.target.value);
                      requestKey.current = crypto.randomUUID();
                    }}
                  >
                    <option value="note">站内备注</option>
                    <option value="outgoing">保存待发送内容</option>
                    <option value="incoming-record">手工录入家长来信</option>
                  </select>
                </label>
                <label className="block">
                  消息正文
                  <textarea
                    required
                    className="sakura-input block min-h-24"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      requestKey.current = crypto.randomUUID();
                    }}
                  />
                </label>
                <button
                  disabled={busy}
                  className="sakura-btn sakura-btn-primary"
                >
                  保存站内记录
                </button>
              </form>
            </>
          ) : null}
        </div>
      ) : null}
      <details className="border border-outline-variant rounded-xl p-4">
        <summary>新增家访 / 关怀待办</summary>
        <form
          className="mt-3 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const date = String(new FormData(e.currentTarget).get("due_at"));
            if (!Number.isFinite(Date.parse(date))) {
              setError("请填写有效的到期时间");
              return;
            }
            const r = await mutate("/care/todos", "POST", {
              student_id: studentId,
              title: todoTitle,
              due_at: new Date(date).toISOString(),
            });
            if (r.success) {
              setTodoTitle("");
              setDue("");
            }
          }}
        >
          <label className="block">
            待办事项
            <input
              required
              className="sakura-input block"
              value={todoTitle}
              onChange={(e) => setTodoTitle(e.target.value)}
            />
          </label>
          <label className="block">
            到期时间
            <input
              name="due_at"
              required
              type="datetime-local"
              className="sakura-input block"
              value={due}
              onInput={(e) => setDue(e.currentTarget.value)}
            />
          </label>
          <button disabled={busy} className="sakura-btn sakura-btn-primary">
            保存待办
          </button>
        </form>
      </details>
      <ul className="space-y-2">
        {todos.map((t) => (
          <li
            key={t.id}
            className="border border-outline-variant rounded-xl p-3"
          >
            <p>
              {t.title} · {new Date(t.due_at).toLocaleString()} ·{" "}
              {
                (
                  { open: "待处理", done: "已完成", cancelled: "已取消" } as Row
                )[t.status]
              }
            </p>
            <div className="flex gap-2">
              {["open", "done", "cancelled"]
                .filter((s) => s !== t.status)
                .map((status) => (
                  <button
                    disabled={busy}
                    key={status}
                    className="sakura-btn sakura-btn-ghost"
                    onClick={() =>
                      void mutate(`/care/todos/${t.id}`, "PATCH", {
                        version: t.version,
                        status,
                      })
                    }
                  >
                    {
                      (
                        {
                          open: "重新打开",
                          done: "完成",
                          cancelled: "取消",
                        } as Row
                      )[status]
                    }
                  </button>
                ))}
            </div>
          </li>
        ))}
      </ul>
      <form
        className="border border-outline-variant rounded-xl p-4 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await mutate(
            `/students/${studentId}/coaching-journals`,
            "POST",
            { content: journal },
          );
          if (r.success) setJournal("");
        }}
      >
        <label className="block">
          新增辅导记录
          <textarea
            required
            className="sakura-input block min-h-24"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
          />
        </label>
        <button disabled={busy} className="sakura-btn sakura-btn-primary">
          保存辅导记录
        </button>
      </form>
      <div className="space-y-2">
        {journals.map((j) => (
          <article
            key={j.id}
            className="border border-outline-variant rounded-xl p-3"
          >
            <p className="text-xs">
              {j.teacher_name} · {j.date_title}
            </p>
            <p className="whitespace-pre-wrap">{j.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
