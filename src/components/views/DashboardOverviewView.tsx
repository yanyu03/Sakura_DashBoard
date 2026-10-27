import React from 'react';
import { WorkspaceTab } from '../../types/sakura';

interface DashboardOverviewViewProps {
  onNavigateTab: (tab: WorkspaceTab) => void;
  onOpenKnowledgeBase: () => void;
  showToast: (msg: string) => void;
}

export const DashboardOverviewView: React.FC<DashboardOverviewViewProps> = ({
  onNavigateTab,
  onOpenKnowledgeBase,
  showToast,
}) => {
  return (
    <div className="flex flex-col w-full h-full p-3 sm:p-4 gap-3 overflow-y-auto lg:overflow-hidden box-border select-none">
      {/* Top Welcome Banner */}
      <div className="flex-none bg-surface-container-lowest/95 backdrop-blur-xl rounded-xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(143,73,83,0.05)] border border-outline-variant/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-56 h-56 bg-primary-container/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 right-1/3 w-48 h-48 bg-secondary-fixed/35 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-start sm:items-center gap-3 z-10 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-primary-container to-secondary-fixed flex items-center justify-center text-secondary shadow-xs shrink-0">
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_florist
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-md text-base sm:text-lg text-on-surface font-bold">
                早安，林知夏老师 🌸 祝您今日授课愉快
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-container font-label-sm text-xs whitespace-nowrap">
                高二(3)班班主任 · 语文备课组长
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              今日共有 4 节在教日程 · 《赤壁赋》第四课时主观卷已完成 38/45 份初批 ·
              大课间已预约周子涵 1对1 文言面批
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap z-10 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('homework-center')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-gradient-to-r from-primary-container to-secondary-fixed text-on-primary-container font-label-sm text-xs font-semibold shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">
              rate_review
            </span>
            <span>继续批阅《赤壁赋》(剩7份)</span>
          </button>
          <button
            type="button"
            onClick={onOpenKnowledgeBase}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary font-label-sm text-xs border border-outline-variant/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">
              library_books
            </span>
            <span>教务知识库 SOP</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Pods (Responsive 1 -> 2 -> 4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 flex-none">
        <div
          onClick={() => onNavigateTab('schedule-management')}
          className="bg-surface-container-lowest rounded-xl p-3.5 shadow-[0_2px_12px_rgba(143,73,83,0.04)] border border-outline-variant/20 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="font-label-sm text-xs text-on-surface-variant">
              今日授课与值班
            </span>
            <div className="font-headline-md text-xl text-secondary font-bold mt-0.5">
              4 节{' '}
              <span className="text-xs font-normal text-on-surface-variant">
                / 14节周课时
              </span>
            </div>
            <span className="text-[11px] text-primary">
              下一节：14:00 高二(3)班讲评
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-xl">
              calendar_today
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('homework-center')}
          className="bg-surface-container-lowest rounded-xl p-3.5 shadow-[0_2px_12px_rgba(143,73,83,0.04)] border border-outline-variant/20 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="font-label-sm text-xs text-on-surface-variant">
              智能批阅工坊进度
            </span>
            <div className="font-headline-md text-xl text-primary font-bold mt-0.5">
              84.4%{' '}
              <span className="text-xs font-normal text-on-surface-variant">
                (38/45份)
              </span>
            </div>
            <span className="text-[11px] text-secondary">
              班级均分 88.5 · 标杆卷：苏小萌
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">
              stylus_note
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('exam-analytics')}
          className="bg-surface-container-lowest rounded-xl p-3.5 shadow-[0_2px_12px_rgba(143,73,83,0.04)] border border-outline-variant/20 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="font-label-sm text-xs text-on-surface-variant">
              期中联考本班表现
            </span>
            <div className="font-headline-md text-xl text-on-surface font-bold mt-0.5">
              108.6分{' '}
              <span className="text-xs font-normal text-secondary">年级第1</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">
              28人名次跃升 · 黑马：许嘉琪
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-xl">
              analytics
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('school-home-communication')}
          className="bg-surface-container-lowest rounded-xl p-3.5 shadow-[0_2px_12px_rgba(143,73,83,0.04)] border border-outline-variant/20 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="font-label-sm text-xs text-on-surface-variant">
              家校协同与待办留言
            </span>
            <div className="font-headline-md text-xl text-secondary font-bold mt-0.5">
              3 条{' '}
              <span className="text-xs font-normal text-on-surface-variant">
                待回复私信
              </span>
            </div>
            <span className="text-[11px] text-primary">
              苏小萌妈妈、周子涵爸爸等来信
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-container/60 flex items-center justify-center text-on-primary-container shrink-0">
            <span className="material-symbols-outlined text-xl">forum</span>
          </div>
        </div>
      </div>

      {/* Main 12-Col Bento Matrix */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 lg:overflow-hidden">
        {/* Left 7 Cols: Module Quick Portals */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0">
            {/* Portal 1: Homework Grading */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-secondary font-label-sm text-[11px]">
                    高频核心工作台
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    《赤壁赋》主观卷
                  </span>
                </div>
                <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold mt-2">
                  作业批改中心 · 智能切片工坊
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                  支持朱砂红笔与樱花高光记号批注，一键加盖「妙笔生花」「见解独到」鼓励印章，内置
                  Sakura-AI 答卷诊断与语音评语。
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-surface-container">
                <span className="text-xs text-primary font-medium">
                  苏小萌 98分 · 周子涵 89分
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('homework-center')}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm text-xs cursor-pointer whitespace-nowrap"
                >
                  进入批改台 ➔
                </button>
              </div>
            </div>

            {/* Portal 2: Student Profiles */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-label-sm text-[11px]">
                    360° 全景学情
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    高二(1)班 45人
                  </span>
                </div>
                <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold mt-2">
                  学生学情档案 · 五维能力雷达
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                  实时追踪文言理解、现代主旨、写作立意、诗词鉴赏、基础字词五维能力与历次大考走势，联动教师面批手账。
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-surface-container">
                <span className="text-xs text-secondary font-medium">
                  重点关怀 12 人 · 偏科预警 1 人
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('student-profiles')}
                  className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-xs cursor-pointer whitespace-nowrap"
                >
                  查阅档案库 ➔
                </button>
              </div>
            </div>

            {/* Portal 3: Lesson Plans */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-label-sm text-[11px]">
                    统编高中语文 · 必修下
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    92% 备课组进度
                  </span>
                </div>
                <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold mt-2">
                  备课教案库 · Sakura-Copilot
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                  汇聚《雷雨》《窦娥冤》《哈姆莱特》《促织》精品教案与课件切片，支持课堂闪念随手记与备课组实时网盘共研。
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-surface-container">
                <span className="text-xs text-on-surface-variant">
                  4位老师在线协同中
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('lesson-plans')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-xs cursor-pointer whitespace-nowrap"
                >
                  打开教案库 ➔
                </button>
              </div>
            </div>

            {/* Portal 4: Exam Analytics */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-secondary font-label-sm text-[11px]">
                    期中联合大考
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    置信度 98.4%
                  </span>
                </div>
                <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold mt-2">
                  考务与成绩分析 · 焦点生矩阵
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                  多维透视大题得分率切片与正态分布拟合阶梯，精准锁定文言实词阻滞点，自动筛选拔尖生、临界生与突破黑马。
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-surface-container">
                <span className="text-xs text-primary font-medium">
                  网阅进度 240/300 (80%)
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('exam-analytics')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-xs cursor-pointer whitespace-nowrap"
                >
                  查看考务分析 ➔
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Today's Live Timeline & Quick Care Actions */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              <span className="font-headline-sm text-sm sm:text-base text-on-surface font-bold">
                今日周四 (4/18) 教学日程流
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('schedule-management')}
              className="text-xs text-secondary font-label-sm hover:underline cursor-pointer whitespace-nowrap"
            >
              完整周课表 ➔
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 my-2.5 pr-1">
            <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-label-sm text-xs shrink-0">
                  07:40
                </span>
                <div className="min-w-0">
                  <div className="font-headline-sm text-xs text-on-surface font-bold truncate">
                    高二(3)班 班主任早读巡堂
                  </div>
                  <div className="text-[11px] text-on-surface-variant truncate">
                    行知楼 303 · 应到42 / 实到42人
                  </div>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-semibold whitespace-nowrap shrink-0">
                已完成 ✓
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-gradient-to-r from-primary-fixed/60 to-secondary-fixed/50 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2 py-1 rounded-md bg-secondary text-on-secondary font-label-sm text-xs shrink-0">
                  08:30
                </span>
                <div className="min-w-0">
                  <div className="font-headline-sm text-xs text-on-surface font-bold truncate">
                    高二(1)班 语文 ·《长恨歌》艺术构思与悲剧美
                  </div>
                  <div className="text-[11px] text-on-surface-variant truncate">
                    录播教室 B204 · 互动板书已投屏
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-label-sm whitespace-nowrap shrink-0">
                正在进行
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2 py-1 rounded-md bg-primary-fixed text-primary font-label-sm text-xs shrink-0">
                  14:00
                </span>
                <div className="min-w-0">
                  <div className="font-headline-sm text-xs text-on-surface font-bold truncate">
                    高二(3)班 作业讲评 · 古代文人志趣比较赏析
                  </div>
                  <div className="text-[11px] text-on-surface-variant truncate">
                    多媒体西阶一 · 教案同步就绪
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  showToast('已预加载 14:00 高二(3)班讲评课件与优秀范文墙')
                }
                className="px-2.5 py-1 rounded-md bg-surface-container-lowest text-secondary font-label-sm text-[11px] shadow-xs cursor-pointer whitespace-nowrap shrink-0"
              >
                预览讲义
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2 py-1 rounded-md bg-tertiary-fixed text-tertiary font-label-sm text-xs shrink-0">
                  18:40
                </span>
                <div className="min-w-0">
                  <div className="font-headline-sm text-xs text-on-surface font-bold truncate">
                    高二年级 晚自习统筹值班
                  </div>
                  <div className="text-[11px] text-on-surface-variant truncate">
                    总值班室：立言楼 102 · 1班&amp;3班巡查
                  </div>
                </div>
              </div>
              <span className="text-xs text-tertiary whitespace-nowrap shrink-0">
                今晚待值守
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-primary-fixed/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-base">
                favorite
              </span>
              <span className="font-label-sm text-xs text-on-surface">
                今日备课心情：元气满满 · 23°C 晴朗微风
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('school-home-communication')}
              className="text-xs font-label-sm text-secondary underline cursor-pointer whitespace-nowrap"
            >
              回复家长留言 (3)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
