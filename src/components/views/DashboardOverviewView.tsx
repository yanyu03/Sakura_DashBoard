import { useEffect, useState } from "react";
import { sakuraApi } from "../../services/sakuraApiService";
import { WorkspaceTab } from "../../types/sakura";
import { WorkspaceHero, SectionTitle, EmptyState } from "../WorkspaceVisuals";
type Row = Record<string, any>;
export function DashboardOverviewView({
  onNavigateTab,
}: {
  onNavigateTab: (tab: WorkspaceTab) => void;
  onOpenKnowledgeBase: () => void;
  showToast: (message: string) => void;
}) {
  const [data, setData] = useState<Row | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    setError("");
    const r = await sakuraApi.business.request("/workspace/overview");
    if (r.success) setData(r.data);
    else setError(r.message);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);
  const metrics = data
    ? [
        {
          label: "有效学生",
          value: data.students,
          icon: "school",
          note: "查看学生成长档案",
          tab: "student-profiles",
        },
        {
          label: "待批作业",
          value: data.pending,
          icon: "rate_review",
          note: "每一份认真都有回应",
          tab: "homework-center",
        },
        {
          label: "未读家长记录",
          value: data.unread,
          icon: "forum",
          note: "让家校沟通更有温度",
          tab: "school-home-communication",
        },
        {
          label: "可用教案",
          value: data.lessons,
          icon: "auto_stories",
          note: "收藏课堂中的好思路",
          tab: "lesson-plans",
        },
      ]
    : [];
  return (
    <main className="sakura-workspace space-y-5">
      <WorkspaceHero
        title="让教学日常，更从容"
        description="从一堂课的准备，到一份作业的回应，让每一件小事都有着落。今天，也一起陪伴学生慢慢成长。"
        eyebrow="YOUR TEACHING WORKSPACE"
        icon="local_florist"
      >
        <button
          className="sakura-btn sakura-btn-primary"
          onClick={() => onNavigateTab("homework-center")}
        >
          <span
            className="material-symbols-outlined text-base"
            aria-hidden="true"
          >
            edit_note
          </span>
          开始今日批阅
        </button>
        <button
          disabled={loading}
          className="sakura-btn sakura-btn-secondary"
          onClick={() => void load()}
        >
          <span
            className="material-symbols-outlined text-base"
            aria-hidden="true"
          >
            refresh
          </span>
          刷新数据
        </button>
        <span className="sakura-meta-badge">
          <span
            className="material-symbols-outlined text-sm"
            aria-hidden="true"
          >
            calendar_today
          </span>
          {data?.today || "今日"} · 北京时间
        </span>
      </WorkspaceHero>
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}
      {loading ? <p role="status">正在汇总教学记录…</p> : null}
      {data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <button
                key={metric.label}
                className="sakura-stat"
                onClick={() => onNavigateTab(metric.tab as WorkspaceTab)}
              >
                <span className="sakura-stat-top">
                  <span className="sakura-stat-label">{metric.label}</span>
                  <span
                    className="sakura-stat-icon material-symbols-outlined"
                    aria-hidden="true"
                  >
                    {metric.icon}
                  </span>
                </span>
                <strong className="sakura-stat-number">{metric.value}</strong>
                <span className="sakura-stat-footer">
                  <span>{metric.note}</span>
                  <span
                    className="material-symbols-outlined text-sm"
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </span>
              </button>
            ))}
          </div>
          <section aria-label="教学快捷入口">
            <div className="sakura-quick-grid">
              {[
                [
                  "edit_note",
                  "布置与批阅",
                  "开始一份教学回应",
                  "homework-center",
                ],
                ["menu_book", "准备一堂好课", "打开我的教案库", "lesson-plans"],
                [
                  "calendar_month",
                  "查看课程安排",
                  "协调接下来的课时",
                  "schedule-management",
                ],
                [
                  "favorite",
                  "记录一份关心",
                  "家校交流与关怀待办",
                  "school-home-communication",
                ],
              ].map(([icon, title, subtitle, tab]) => (
                <button
                  key={tab}
                  className="sakura-quick-action"
                  onClick={() => onNavigateTab(tab as WorkspaceTab)}
                >
                  <span
                    className="material-symbols-outlined sakura-section-icon"
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{subtitle}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
          <div className="sakura-dashboard-columns">
            <section className="sakura-panel">
              <SectionTitle
                icon="calendar_today"
                title="今日课表"
                subtitle="为每一堂课，提前留好位置"
                action={
                  <span className="sakura-meta-badge">
                    {data.schedules.length} 节课程
                  </span>
                }
              />
              {data.schedules.length ? (
                data.schedules.map((s: Row) => (
                  <article key={s.id} className="sakura-record-row">
                    <div>
                      <strong>
                        {s.class_name} · {s.course_name}
                      </strong>
                      <p>
                        {new Date(s.starts_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        —{" "}
                        {new Date(s.ends_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {s.room}
                      </p>
                    </div>
                    <span className="sakura-meta-badge">{s.full_name}</span>
                  </article>
                ))
              ) : (
                <EmptyState
                  icon="event_available"
                  title="今天的课表还很宽松"
                  description="暂无已安排的课程。可以查看接下来的课时，或提前准备一份教案。"
                >
                  <button
                    className="sakura-btn sakura-btn-ghost"
                    onClick={() => onNavigateTab("schedule-management")}
                  >
                    查看课程安排{" "}
                    <span
                      className="material-symbols-outlined text-sm"
                      aria-hidden="true"
                    >
                      arrow_forward
                    </span>
                  </button>
                </EmptyState>
              )}
              {data.schedules.length ? (
                <button
                  className="sakura-btn sakura-btn-ghost mt-3"
                  onClick={() => onNavigateTab("schedule-management")}
                >
                  查看完整课表
                </button>
              ) : null}
            </section>
            <section className="sakura-panel">
              <SectionTitle
                icon="favorite"
                title="我的关怀待办"
                subtitle="那些值得被记住的小事"
                action={
                  <span className="sakura-meta-badge">
                    {data.todos.length} 项待处理
                  </span>
                }
              />
              {data.todos.length ? (
                data.todos.map((t: Row) => (
                  <article key={t.id} className="sakura-record-row">
                    <div>
                      <strong>
                        {t.full_name} · {t.title}
                      </strong>
                      <p>{new Date(t.due_at).toLocaleString()}</p>
                    </div>
                    <span className="sakura-meta-badge">
                      {Date.parse(t.due_at) < Date.now() ? "已到期" : "待处理"}
                    </span>
                  </article>
                ))
              ) : (
                <EmptyState
                  icon="volunteer_activism"
                  title="每一份关心，都有回响"
                  description="目前没有待处理事项。记录一次交流，或为下一次家访留个提醒。"
                >
                  <button
                    className="sakura-btn sakura-btn-ghost"
                    onClick={() => onNavigateTab("school-home-communication")}
                  >
                    添加关怀记录{" "}
                    <span
                      className="material-symbols-outlined text-sm"
                      aria-hidden="true"
                    >
                      arrow_forward
                    </span>
                  </button>
                </EmptyState>
              )}
              {data.todos.length ? (
                <button
                  className="sakura-btn sakura-btn-ghost mt-3"
                  onClick={() => onNavigateTab("school-home-communication")}
                >
                  管理关怀待办
                </button>
              ) : null}
            </section>
          </div>
          <section className="sakura-panel">
            <SectionTitle
              icon="assignment"
              title="进行中的作业"
              subtitle="从布置到反馈，让教学形成完整的回路"
              action={
                <button
                  className="sakura-btn sakura-btn-ghost"
                  onClick={() => onNavigateTab("homework-center")}
                >
                  全部作业{" "}
                  <span
                    className="material-symbols-outlined text-sm"
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </button>
              }
            />
            {data.homework.length ? (
              <div>
                {data.homework.map((w: Row) => (
                  <article className="sakura-record-row" key={w.id}>
                    <div>
                      <strong>{w.title}</strong>
                      <p>
                        {w.due_at
                          ? `截止于 ${new Date(w.due_at).toLocaleString()}`
                          : "未设置截止时间"}
                      </p>
                    </div>
                    <span className="sakura-meta-badge">
                      {w.pending ? `待批 ${w.pending} 份` : "已完成当前批阅"}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="assignment_add"
                title="准备好下一份作业了吗"
                description="还没有进行中的作业。创建草稿，写下想与学生一起探索的问题。"
              />
            )}
          </section>
          <p className="sakura-feature-note">
            <span
              className="material-symbols-outlined text-lg"
              aria-hidden="true"
            >
              info
            </span>
            当前可使用人工教学流程及本地导出。AI、OCR、外部家长投递和投屏设备尚未连接。
          </p>
        </>
      ) : null}
    </main>
  );
}
