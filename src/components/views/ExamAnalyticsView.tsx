import React, { useState } from 'react';
import { sakuraAIService } from '../../services/aiService';
import { sakuraApi } from '../../services/sakuraApiService';

interface ExamAnalyticsViewProps {
  showToast: (msg: string) => void;
}

export const ExamAnalyticsView: React.FC<ExamAnalyticsViewProps> = ({
  showToast,
}) => {
  const [selectedExam, setSelectedExam] = useState(
    '2023-2024学年第二学期 高二年级期中联合大考 (语文)'
  );
  const [aiInsight, setAiInsight] = useState({
    confidence: '98.4%',
    coreConclusion: '核心结论：文言断句通假实词为最大阻滞点',
    detailAnalysis:
      '全班在第 11-13 题文言实词推断（尤其是「数、伐、存、除」等多义词语境判断）平均得分率低于年级 7.2 个百分点；导致第 14 题文意概括连带扣分。',
    tacticalAdvice:
      '💡 战术建议：未来两周晨读启动《古文观止》选篇精练，每天专项训练 2 道断句与虚词通关题。',
  });
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);

  const handleRefreshAIInsight = async () => {
    setIsRefreshingAI(true);
    const res = await sakuraAIService.analyzeExamCohort(selectedExam);
    setAiInsight(res);
    setIsRefreshingAI(false);
    showToast('Sakura-Insight AI 已完成知识图谱重推演 🌸');
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto lg:overflow-hidden p-3 sm:p-4 gap-3 bg-background">
      {/* Top Bar */}
      <div className="flex-none bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-2.5 px-3.5 sm:px-4 shadow-[0_2px_16px_rgba(143,73,83,0.05)] border border-outline-variant/20 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <button
            type="button"
            onClick={async () => {
              const next =
                selectedExam.includes('期中')
                  ? '2023-2024学年第二学期 高二年级第2次月考 (语文)'
                  : '2023-2024学年第二学期 高二年级期中联合大考 (语文)';
              setSelectedExam(next);
              const res = await sakuraApi.exam.getBatchAnalytics(next);
              showToast(res.message);
            }}
            className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/15 text-on-surface cursor-pointer whitespace-nowrap shrink-0 max-w-full"
          >
            <span className="material-symbols-outlined text-secondary text-base">
              fact_check
            </span>
            <span className="font-headline-sm text-xs text-on-surface font-bold truncate max-w-md">
              {selectedExam}
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">
              expand_more
            </span>
          </button>

          <div className="hidden 2xl:flex items-center gap-3 text-xs font-body-sm text-on-surface-variant whitespace-nowrap">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm">
                event
              </span>
              <span>4月10日 (第10周)</span>
            </div>
            <span className="text-outline-variant">·</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm">
                groups
              </span>
              <span>本班 45人 / 年级 180人</span>
            </div>
            <span className="text-outline-variant">·</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm">
                scoreboard
              </span>
              <span>满分 150分</span>
            </div>
            <span className="text-outline-variant">·</span>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed">
              <span className="material-symbols-outlined text-sm">
                emoji_events
              </span>
              <span className="font-label-sm text-xs">
                年级桂冠：苏小萌 (138分·本班)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              showToast('正在导出《高二(1)班期中联考质量分析诊断 PDF》...')
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-sm text-xs border border-outline-variant/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-primary">
              picture_as_pdf
            </span>
            <span>诊断PDF</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('已通过一对一私密通道向 45 位学生家长推送个人成绩单')
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-sm text-xs border border-outline-variant/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-secondary">
              send_to_mobile
            </span>
            <span>推送成绩</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('已打开下阶段模拟大考教学楼西区第 3 考场监考座次表')
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-sm text-xs border border-outline-variant/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-tertiary">
              chair
            </span>
            <span>监考座次</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('已为全班 45 人生成千人千面《期中语文靶向智能错题集》')
            }
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-label-sm text-xs font-semibold shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              auto_fix_high
            </span>
            <span>智能错题集</span>
          </button>
        </div>
      </div>

      {/* Main Content 12-Col Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 lg:overflow-hidden">
        {/* Left 8 Cols */}
        <div className="lg:col-span-8 flex flex-col gap-3 lg:h-full min-h-0">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 flex-none">
            <div className="bg-surface-container-lowest rounded-2xl p-space-sm flex flex-col justify-between shadow-[0_4px_16px_rgba(143,73,83,0.04)] relative overflow-hidden">
              <div className="absolute -right-3 -bottom-3 text-primary-fixed/20 pointer-events-none">
                <span className="material-symbols-outlined text-6xl">
                  insights
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  班级平均分
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">
                    military_tech
                  </span>
                  第1名
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-headline-lg text-primary leading-none">
                  108.6
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">
                  +4.2 超年级均分
                </span>
              </div>
              <div className="mt-2 text-on-surface-variant font-body-sm text-xs flex justify-between">
                <span>年级平均：104.4</span>
                <span className="text-secondary font-medium">
                  离散度 8.4 (稳固)
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-sm flex flex-col justify-between shadow-[0_4px_16px_rgba(143,73,83,0.04)] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  优秀率 (≥120分)
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm flex items-center">
                  <span className="material-symbols-outlined text-xs">
                    trending_up
                  </span>
                  +6.8%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-headline-lg text-on-surface leading-none">
                  31.1%
                </span>
                <span className="font-body-sm text-xs text-on-surface-variant">
                  14 / 45人
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full"
                  style={{ width: '31.1%' }}
                ></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-sm flex flex-col justify-between shadow-[0_4px_16px_rgba(143,73,83,0.04)] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  及格率 (≥90分)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-tertiary font-label-sm text-label-sm">
                  44人达标
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-headline-lg text-on-surface leading-none">
                  97.8%
                </span>
                <span className="font-body-sm text-xs text-error font-medium flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">
                    warning
                  </span>
                  仅1人临界
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-primary-container h-full rounded-full"
                  style={{ width: '97.8%' }}
                ></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-sm flex flex-col justify-between shadow-[0_4px_16px_rgba(143,73,83,0.04)] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  位次跃迁动向
                </span>
                <span className="font-label-sm text-label-sm text-primary font-semibold">
                  赋分提升
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-secondary leading-none">
                    28
                  </span>
                  <span className="text-xs text-on-surface-variant mt-0.5">
                    进步 🚀
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-md text-headline-md text-on-surface leading-none">
                    11
                  </span>
                  <span className="text-xs text-on-surface-variant mt-0.5">
                    持平
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-headline-md text-headline-md text-primary leading-none">
                    6
                  </span>
                  <span className="text-xs text-on-surface-variant mt-0.5">
                    后退
                  </span>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-on-surface-variant truncate">
                最大单人升位：+24名 (许嘉琪)
              </div>
            </div>
          </div>

          {/* Middle Section: Question Slices & Score Distribution Ladder */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 min-h-0">
            <div className="md:col-span-7 bg-surface-container-lowest rounded-xl p-3.5 flex flex-col shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 overflow-hidden">
              <div className="flex items-center justify-between flex-none mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    大题得分率切片与小问诊断
                  </span>
                </div>
                <span className="text-xs font-label-sm text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">
                  卷面总得分率：72.4%
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-around py-1">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-on-surface">
                      一、现代文阅读 I (信息类/论述类) · 19分
                    </span>
                    <span className="font-semibold text-secondary">
                      88% (16.7分)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-secondary-container h-full rounded-full"
                      style={{ width: '88%' }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-on-surface">
                      二、现代文阅读 II (文学类小说精读) · 16分
                    </span>
                    <span className="font-semibold text-primary">
                      72% (11.5分)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-primary-container h-full rounded-full"
                      style={{ width: '72%' }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-0.5 bg-primary-fixed/20 p-1.5 rounded-xl">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      三、文言文断句与词义翻译 · 20分 【⚠️全班核心痛点】
                    </span>
                    <span className="font-bold text-primary">64% (12.8分)</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden flex mt-1">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: '64%' }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-primary/80 mt-1 leading-tight">
                    虚词"以/乃"用法混淆严重，实词推断第11题得分率仅46.6%
                  </p>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-on-surface">
                      四、古代诗歌鉴赏与名篇默写 · 15分
                    </span>
                    <span className="font-semibold text-secondary">
                      78% (11.7分)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-secondary-container h-full rounded-full"
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-on-surface">
                      五、语言文字运用与微写作 · 20分
                    </span>
                    <span className="font-semibold text-secondary">
                      91% (18.2分)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-secondary-container h-full rounded-full"
                      style={{ width: '91%' }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-on-surface">
                      六、新材料作文 (思辨立论) · 60分
                    </span>
                    <span className="font-semibold text-primary">
                      82% (49.2分)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-primary-container h-full rounded-full"
                      style={{ width: '82%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Distribution Ladder */}
            <div className="md:col-span-5 bg-surface-container-lowest rounded-xl p-3.5 flex flex-col shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 overflow-hidden">
              <div className="flex items-center justify-between flex-none mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    成绩区间分布阶梯
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-1.5 rounded-full bg-primary"></span>
                    本班
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-1.5 rounded-full bg-outline-variant"></span>
                    年级
                  </span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end pt-2 pb-1 relative">
                <div className="h-36 w-full flex items-end justify-between px-2 gap-3 relative">
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none stroke-secondary"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                  >
                    <path
                      d="M 12 70 Q 38 15 62 45 T 88 88"
                      stroke="currentColor"
                      strokeDasharray="2 2"
                      strokeWidth="1.5"
                    ></path>
                  </svg>
                  <div className="flex-1 flex flex-col items-center gap-1 z-10">
                    <div className="text-[11px] font-semibold text-primary">
                      6人 (13%)
                    </div>
                    <div className="w-full flex items-end justify-center gap-1 h-24">
                      <div
                        className="w-4 rounded-t-lg bg-primary shadow-sm"
                        style={{ height: '48%' }}
                      ></div>
                      <div
                        className="w-3 rounded-t-lg bg-surface-container"
                        style={{ height: '32%' }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-medium text-on-surface">
                      130-150分
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      拔尖层
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1 z-10">
                    <div className="text-[11px] font-semibold text-secondary">
                      22人 (49%)
                    </div>
                    <div className="w-full flex items-end justify-center gap-1 h-24">
                      <div
                        className="w-4 rounded-t-lg bg-secondary shadow-sm"
                        style={{ height: '95%' }}
                      ></div>
                      <div
                        className="w-3 rounded-t-lg bg-surface-container"
                        style={{ height: '60%' }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-medium text-on-surface">
                      110-129分
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      中坚主力
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1 z-10">
                    <div className="text-[11px] font-semibold text-primary">
                      16人 (36%)
                    </div>
                    <div className="w-full flex items-end justify-center gap-1 h-24">
                      <div
                        className="w-4 rounded-t-lg bg-primary-container shadow-sm"
                        style={{ height: '72%' }}
                      ></div>
                      <div
                        className="w-3 rounded-t-lg bg-surface-container"
                        style={{ height: '80%' }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-medium text-on-surface">
                      90-109分
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      提升区
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1 z-10">
                    <div className="text-[11px] font-semibold text-error">
                      1人 (2%)
                    </div>
                    <div className="w-full flex items-end justify-center gap-1 h-24">
                      <div
                        className="w-4 rounded-t-lg bg-error shadow-sm"
                        style={{ height: '8%' }}
                      ></div>
                      <div
                        className="w-3 rounded-t-lg bg-surface-container"
                        style={{ height: '25%' }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-medium text-on-surface">
                      &lt;90分
                    </span>
                    <span className="text-[10px] text-error">待扶持</span>
                  </div>
                </div>
                <div className="mt-2 p-2 rounded-xl bg-surface-container-low flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">
                    正态拟合峰值偏高区：
                    <strong className="text-primary">116.5分</strong>
                  </span>
                  <span className="text-secondary font-semibold">
                    优秀梯队厚度年级第一
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Focus Matrix */}
          <div className="bg-surface-container-lowest rounded-xl p-3.5 flex flex-col shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 flex-1 min-h-0">
            <div className="flex items-center justify-between mb-1.5 flex-none">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-lg">
                  flag_circle
                </span>
                <span className="font-headline-sm text-sm text-on-surface font-bold">
                  临界生 · 突破生 · 拔尖生焦点矩阵
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">
                按赋分潜能指数自动筛选
              </span>
            </div>
            <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-2 rounded-xl bg-primary-fixed/20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
                      萌
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">
                        苏小萌{' '}
                        <span className="text-[10px] font-normal text-on-surface-variant">
                          (年级第1)
                        </span>
                      </div>
                      <div className="text-[11px] text-primary font-semibold">
                        138分 · 重点特优生
                      </div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold">
                    拔尖冲顶
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  作文56分(标杆范文)。诗歌小题略有微暇，建议拓展课外晚唐律诗格律深度。
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-primary/10 text-[10px]">
                  <span className="text-secondary">目标：清北拔尖营</span>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('已向苏小萌下发《晚唐律诗格律与比较鉴赏拓展卷》')
                    }
                    className="text-primary font-bold underline cursor-pointer"
                  >
                    布置拓展卷
                  </button>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-surface-container-high/60 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-xs">
                      涵
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">
                        周子涵{' '}
                        <span className="text-[10px] font-normal text-on-surface-variant">
                          (年级92名)
                        </span>
                      </div>
                      <div className="text-[11px] text-secondary font-semibold">
                        96分 · 一本特控临界
                      </div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                    重点提分
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  文言文仅拿7分，失分极重；现代文发挥稳定。文言翻译若提8分即可跃入105分段。
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-secondary/10 text-[10px]">
                  <span className="text-error font-semibold">
                    文言实词专项辅导
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('已为周子涵安排周四大课间导师一对一文言特训约谈')
                    }
                    className="text-secondary font-bold underline cursor-pointer"
                  >
                    指派导师约谈
                  </button>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-tertiary-fixed/40 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary font-bold text-xs">
                      琪
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">
                        许嘉琪{' '}
                        <span className="text-[10px] font-normal text-on-surface-variant">
                          (年级35名)
                        </span>
                      </div>
                      <div className="text-[11px] text-on-tertiary-fixed-variant font-semibold">
                        119分 · 最大黑马 🌟
                      </div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">
                    ↑ 提升24名
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  现代文阅读从上期的58%跃升至86%，结构梳理题拿全分，答题格式极具示范性。
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-tertiary/10 text-[10px]">
                  <span className="text-on-surface-variant">
                    推荐为答卷展示范本
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('已将许嘉琪现代文满分答卷切片加入下节课投屏表扬队列')
                    }
                    className="text-tertiary font-bold underline cursor-pointer"
                  >
                    投屏表扬
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols */}
        <div className="lg:col-span-4 flex flex-col gap-3 lg:h-full min-h-0">
          {/* Sakura-Insight AI Card */}
          <div className="flex-1 bg-surface-container-lowest rounded-xl p-3.5 flex flex-col shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
                  <span className="material-symbols-outlined text-base">
                    psychology
                  </span>
                </div>
                <div>
                  <span className="font-headline-sm text-label-md text-on-surface block leading-tight">
                    Sakura-Insight AI 智能学情书
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    知识图谱全量推演生成
                  </span>
                </div>
              </div>
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-secondary">
                置信度 {aiInsight.confidence}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface leading-relaxed flex flex-col gap-1.5 mb-2">
              <div className="flex items-center gap-1 font-semibold text-primary">
                <span className="material-symbols-outlined text-sm">
                  lightbulb
                </span>
                <span>{aiInsight.coreConclusion}</span>
              </div>
              <p className="text-on-surface-variant text-[11px] leading-normal">
                {aiInsight.detailAnalysis}
              </p>
              <div className="mt-0.5 p-2 rounded-lg bg-surface-container-lowest text-[11px] text-secondary font-medium">
                {aiInsight.tacticalAdvice}
              </div>
            </div>

            <div className="space-y-1.5 mb-2 flex-1">
              <div className="text-[11px] font-semibold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-secondary">
                  checklist
                </span>
                干预行动路径建议
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span className="text-on-surface">
                    配套补偿集:《高中文言实词120例冲刺》
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    showToast('已向全班 45 人分发《高中文言实词120例冲刺》晨读包')
                  }
                  className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-medium cursor-pointer"
                >
                  一键分发
                </button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="text-on-surface">
                    薄弱点推送: 向周子涵等 6 人派发巩固卡
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    showToast('已向周子涵等 6 位同学定向派发《文言实词与断句》靶向任务卡')
                  }
                  className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary text-[10px] font-medium cursor-pointer"
                >
                  指派任务
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() =>
                  showToast('正在生成高二(1)班文言实词与断句靶向补偿卷 (A4排版)...')
                }
                className="flex-1 py-1.5 px-3 rounded-full bg-secondary text-on-secondary font-label-sm text-xs flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                生成补偿作业卷 (A4版)
              </button>
              <button
                type="button"
                onClick={handleRefreshAIInsight}
                className="py-1.5 px-3 rounded-full bg-surface-container-high text-on-surface font-label-sm text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                {isRefreshingAI ? '推演中' : '调参'}
              </button>
            </div>
          </div>

          {/* Exam Coordination & Grading Progress */}
          <div className="flex-1 bg-surface-container-lowest rounded-2xl p-space-sm flex flex-col justify-between shadow-[0_4px_16px_rgba(143,73,83,0.04)] overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 flex-none">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">
                  event_available
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  考务协同与阅卷进度
                </span>
              </div>
              <span className="text-[11px] font-semibold text-secondary flex items-center gap-0.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                运行中
              </span>
            </div>

            <div className="p-2 rounded-xl bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center leading-none">
                  <span className="text-[9px] uppercase font-bold">周六</span>
                  <span className="font-bold text-xs mt-0.5">13</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    下阶段模拟大考 · 现场监考
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    09:00 - 11:30 | 教学楼西区 第3考场 (主考)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-primary px-2 py-0.5 bg-primary-fixed rounded-full">
                已确认
              </span>
            </div>

            <div className="space-y-1 my-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    rate_review
                  </span>
                  现代文主观题组网阅进度
                </span>
                <span className="font-bold text-secondary">
                  240 / 300 份 (80%)
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-secondary h-full rounded-full transition-all duration-500"
                  style={{ width: '80%' }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-on-surface-variant">
                <span>双评差值吻合度: 94.2%</span>
                <span>距截止时间还剩 5 小时</span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-surface-container flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-primary">
                  mark_chat_unread
                </span>
                <span>家长成绩申诉通道:</span>
                <strong className="text-on-surface">0 条待复核</strong>
              </div>
              <button
                type="button"
                onClick={() =>
                  showToast('正在进入高二语文组双评网阅工作台 (剩余 60 份)...')
                }
                className="text-secondary font-bold text-xs hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                进入阅卷台
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
