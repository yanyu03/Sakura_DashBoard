import React, { useEffect, useState } from 'react';
import { INITIAL_SUBMISSIONS } from '../../data/mockData';
import { sakuraAIService } from '../../services/aiService';
import { sakuraApi } from '../../services/sakuraApiService';
import { StudentSubmission } from '../../types/sakura';

interface HomeworkCenterViewProps {
  showToast: (msg: string) => void;
  onSelectStudentForProfile?: (studentId: string) => void;
}

export const HomeworkCenterView: React.FC<HomeworkCenterViewProps> = ({
  showToast,
}) => {
  const [submissions, setSubmissions] =
    useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedClass, setSelectedClass] = useState<'高二(1)班' | '高二(3)班' | '高一实验班'>('高二(1)班');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'excellent' | 'correction'>('all');
  const [selectedId, setSelectedId] = useState<string>('su-xiaomeng');
  const [activeBrush, setActiveBrush] = useState<'pen' | 'highlight' | 'note' | 'mic'>('pen');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [scoreInput, setScoreInput] = useState<string>('98');
  const [isPreGrading, setIsPreGrading] = useState(false);
  const [pageIdx, setPageIdx] = useState<1 | 2>(1);
  const [mobilePanel, setMobilePanel] = useState<'roster' | 'canvas' | 'insights'>('canvas');

  useEffect(() => {
    sakuraApi.homework.getClassSubmissions(selectedClass, 'all').then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSubmissions(res.data);
        setSelectedId(res.data[0].id);
        setScoreInput(String(res.data[0].score ?? 98));
      }
    });
  }, [selectedClass]);

  const activeStudent =
    submissions.find((s) => s.id === selectedId) || submissions[0];

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === 'pending') return s.status === 'pending' || s.status === 'ai-pregraded';
    if (statusFilter === 'excellent') return (s.score ?? 0) >= 90;
    if (statusFilter === 'correction') return s.status === 'needs-correction';
    return true;
  });

  const handleSelectStudent = (student: StudentSubmission) => {
    setSelectedId(student.id);
    setScoreInput(String(student.score ?? 90));
    setIsPlayingAudio(false);
    setMobilePanel('canvas');
  };

  const handleApplyStamp = async (stamp: '妙笔生花' | '见解独到') => {
    const nextStamp = activeStudent.stamp === stamp ? null : stamp;
    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === activeStudent.id
          ? { ...item, stamp: nextStamp }
          : item
      )
    );
    const res = await sakuraApi.homework.applySakuraStamp(
      activeStudent.id,
      activeStudent.name,
      nextStamp
    );
    showToast(res.message);
  };

  const handleBatchAIPreGrade = async () => {
    setIsPreGrading(true);
    const res = await sakuraAIService.batchPreGradeEssays(selectedClass, 7);
    setIsPreGrading(false);
    showToast(res.summary);
  };

  const handleSubmitAndNext = async () => {
    const numericScore = Number(scoreInput) || 95;
    await sakuraApi.homework.submitGrade({
      submissionId: activeStudent.id,
      assignmentId: 'assign-chibifu-04',
      studentId: activeStudent.id,
      score: numericScore,
      stamp: activeStudent.stamp,
    });
    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === activeStudent.id
          ? {
              ...item,
              score: numericScore,
              status: 'graded',
              statusBadge: numericScore >= 92 ? '🌸 优秀论述' : '已评阅',
            }
          : item
      )
    );
    const currentIndex = filteredSubmissions.findIndex(
      (s) => s.id === activeStudent.id
    );
    const nextStudent =
      filteredSubmissions[(currentIndex + 1) % filteredSubmissions.length];
    if (nextStudent) {
      setSelectedId(nextStudent.id);
      setScoreInput(String(nextStudent.score ?? 91));
      showToast(
        `${activeStudent.name} (${numericScore}分) 已写入归档库，自动切换至 ${nextStudent.name}`
      );
    }
  };

  const handleReturnForRevision = () => {
    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === activeStudent.id
          ? {
              ...item,
              status: 'needs-correction',
              statusBadge: '建议面批订正',
            }
          : item
      )
    );
    showToast(`已将 ${activeStudent.name} 的答卷标记为「打回重订」并附批注推送到学生平板`);
  };

  return (
    <div className="flex flex-col w-full h-full p-3 sm:p-4 gap-3 overflow-y-auto lg:overflow-hidden box-border">
      {/* Top Controller Bar: Title, Class Pills, Overall Metrics, Quick Action Pods */}
      <div className="flex-none bg-surface-container-lowest/95 backdrop-blur-xl rounded-xl p-3 px-3.5 sm:px-4 shadow-[0_4px_20px_rgba(143,73,83,0.05)] border border-outline-variant/20 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 relative overflow-hidden">
        {/* Ambient Cherry Glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-8 right-1/4 w-40 h-40 bg-secondary-fixed/30 rounded-full blur-xl pointer-events-none"></div>

        {/* Left: Assignment Title & Class Selectors */}
        <div className="flex items-center gap-3 flex-wrap z-10 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-container to-secondary-fixed flex items-center justify-center text-secondary shadow-xs shrink-0">
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stylus_note
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-headline-sm text-base text-on-surface tracking-tight font-bold whitespace-nowrap">
                  作业批阅工坊
                </span>
                <span className="font-label-sm text-xs px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-container whitespace-nowrap">
                  🌸 必修下 · 文言核心课
                </span>
              </div>
              <div className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1.5 truncate mt-0.5">
                <span className="truncate">
                  《赤壁赋》文言主旨与哲学拓展思考 · 第四课时主观卷
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant shrink-0"></span>
                <span className="font-label-sm text-xs text-primary whitespace-nowrap shrink-0">
                  满分 100 分制
                </span>
              </div>
            </div>
          </div>

          {/* Class Switching Pills */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/15 gap-1 shrink-0">
            {(
              [
                { name: '高二(1)班', sub: '43/45交' },
                { name: '高二(3)班', sub: '40/42交' },
                { name: '高一实验班', sub: '' },
              ] as const
            ).map((cls) => {
              const active = selectedClass === cls.name;
              return (
                <button
                  key={cls.name}
                  type="button"
                  onClick={async () => {
                    setSelectedClass(cls.name);
                    await sakuraApi.homework.getClassSubmissions(cls.name, statusFilter);
                    showToast(`已切换至 ${cls.name} 作业批阅池`);
                  }}
                  className={`px-3 py-1 rounded-md font-label-sm text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  )}
                  <span>{cls.name}</span>
                  {cls.sub && (
                    <span
                      className={`font-label-sm text-[11px] px-1.5 py-0.2 rounded ${
                        active
                          ? 'text-secondary bg-secondary-fixed/50'
                          : 'text-on-surface-variant/70'
                      }`}
                    >
                      {cls.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Micro Metrics Indicators */}
        <div className="hidden 2xl:flex items-center gap-3 bg-surface-container-low/70 px-3.5 py-1.5 rounded-lg border border-outline-variant/15 z-10 shrink-0">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="flex flex-col text-left">
              <span className="font-label-sm text-[11px] text-on-surface-variant leading-none">
                批阅进度
              </span>
              <span className="font-headline-sm text-sm text-secondary font-bold leading-tight mt-0.5">
                38
                <span className="text-xs font-normal text-on-surface-variant">
                  /45
                </span>
              </span>
            </div>
            <div className="w-12 h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-container to-secondary rounded-full"
                style={{ width: '84.4%' }}
              ></div>
            </div>
          </div>
          <div className="h-5 w-px bg-outline-variant/40"></div>
          <div className="flex flex-col text-left whitespace-nowrap">
            <span className="font-label-sm text-[11px] text-on-surface-variant leading-none">
              班级均分
            </span>
            <span className="font-headline-sm text-sm text-on-surface font-bold leading-tight mt-0.5">
              88.5{' '}
              <span className="font-label-sm text-[11px] text-secondary">
                分
              </span>
            </span>
          </div>
          <div className="h-5 w-px bg-outline-variant/40"></div>
          <div className="flex flex-col text-left whitespace-nowrap">
            <span className="font-label-sm text-[11px] text-on-surface-variant leading-none">
              优秀率 (A+)
            </span>
            <span className="font-headline-sm text-sm text-primary font-bold leading-tight mt-0.5">
              34.2%
            </span>
          </div>
        </div>

        {/* Right: Operational Pods */}
        <div className="flex items-center gap-2 z-10 shrink-0">
          <button
            type="button"
            onClick={handleBatchAIPreGrade}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-fixed text-on-primary-container font-label-sm text-xs font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_fix_high
            </span>
            <span>
              {isPreGrading ? 'AI 切片诊断中...' : 'AI 智能初批 (7份)'}
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('已开启批量批注模式：可对全班共性失分点一键下发微课订正卡')
            }
            className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs transition-all flex items-center gap-1 border border-outline-variant/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-secondary">
              checklist_rtl
            </span>
            <span>批量批注</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('已向未交作业的 2 位同学发送平板与家校端温馨提醒')
            }
            className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-error transition-all flex items-center gap-1 border border-outline-variant/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              notifications_active
            </span>
            <span>一键催交(2人)</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('正在导出《赤壁赋》第四课时主观卷全班批阅归档报告...')
            }
            className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all border border-outline-variant/20 shrink-0 cursor-pointer"
            title="导出批阅归档报告"
          >
            <span className="material-symbols-outlined text-base">download</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Panel Switcher (Visible on < lg) */}
      <div className="lg:hidden grid grid-cols-3 gap-1.5 bg-surface-container-lowest p-1.5 rounded-xl border border-outline-variant/20 flex-none">
        {[
          { id: 'roster', icon: 'people', label: `提交名录 (${filteredSubmissions.length})` },
          { id: 'canvas', icon: 'rate_review', label: `批阅：${activeStudent.name}` },
          { id: 'insights', icon: 'donut_small', label: '全班学情洞察' },
        ].map((tab) => {
          const active = mobilePanel === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobilePanel(tab.id as typeof mobilePanel)}
              className={`py-2 px-2 rounded-lg font-label-sm text-xs flex items-center justify-center gap-1 transition-all ${
                active
                  ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:overflow-hidden min-h-0">
        {/* Column 1 (Left): Student Submission Flow (3 Cols on lg) */}
        <section
          className={`${
            mobilePanel === 'roster' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-3 bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-3 flex-col shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 lg:overflow-hidden`}
        >
          <div className="flex-none pb-space-xs flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  提交名录
                </span>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed">
                  {submissions.length} 人 (基准)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => showToast('已按提交时间与赋分潜能自动筛选')}
                  className="w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    filter_list
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissions((prev) => [...prev].reverse());
                    showToast('已切换学生名录排序方向');
                  }}
                  className="w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    swap_vert
                  </span>
                </button>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-surface-container-low rounded-full text-center">
              {[
                { id: 'all', label: `全部(${submissions.length})` },
                { id: 'pending', label: '待批' },
                { id: 'excellent', label: '优秀' },
                { id: 'correction', label: '订正' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setStatusFilter(tab.id as typeof statusFilter)
                  }
                  className={`py-1 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Student Roster */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 pt-1">
            {filteredSubmissions.map((student) => {
              const isSelected = student.id === activeStudent.id;
              return (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className={`p-space-sm rounded-lg cursor-pointer relative overflow-hidden transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-fixed/50 via-surface-container-low to-surface-container-lowest shadow-[0_4px_16px_rgba(164,48,115,0.12)] scale-[1.01]'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low shadow-sm'
                  }`}
                >
                  {student.isModelEssay && (
                    <div className="absolute top-0 right-0 w-12 h-12 bg-secondary-fixed/50 rounded-bl-full flex items-start justify-end p-1.5">
                      <span
                        className="material-symbols-outlined text-secondary text-xs"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-space-xs">
                    <div className="relative">
                      {isSelected ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary-container to-primary-container p-0.5">
                          <div className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary font-headline-sm text-sm font-bold">
                            {student.avatarChar}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-headline-sm text-sm font-bold ${
                            student.status === 'pending'
                              ? 'bg-secondary-fixed-dim/60 text-on-secondary-fixed'
                              : 'bg-surface-container-high text-on-surface'
                          }`}
                        >
                          {student.avatarChar}
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-surface-container-lowest"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                          {student.name}
                        </span>
                        {student.status === 'pending' ? (
                          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                            待批阅
                          </span>
                        ) : (
                          <span
                            className={`font-headline-sm text-headline-sm font-bold ${
                              student.isModelEssay ? 'mr-4' : ''
                            } ${
                              (student.score ?? 0) >= 90
                                ? 'text-secondary'
                                : (student.score ?? 0) < 80
                                ? 'text-error'
                                : 'text-primary'
                            }`}
                          >
                            {student.score}
                            <span className="text-xs font-normal">分</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`font-label-sm text-label-sm px-1.5 py-0.2 rounded-full ${
                            student.status === 'needs-correction'
                              ? 'bg-error-container text-on-error-container'
                              : student.status === 'ai-pregraded'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                              : student.status === 'pending'
                              ? 'bg-primary-fixed text-on-primary-fixed-variant'
                              : (student.score ?? 0) >= 90
                              ? 'bg-secondary-fixed text-on-secondary-container'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {student.statusBadge}
                        </span>
                        <span className="font-body-sm text-label-sm text-on-surface-variant truncate">
                          {student.submitTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-1 italic bg-surface-container-lowest/80 px-2 py-1 rounded-md">
                      {student.excerpt}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Column 2 (Center): Core Grading Canvas & AI Copilot Inspection (6 Cols on lg) */}
        <main
          className={`${
            mobilePanel === 'canvas' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-6 flex-col gap-3 lg:overflow-hidden min-h-0`}
        >
          {/* Student Answer Paper Workspace */}
          <div className="flex-1 bg-surface-container-lowest rounded-xl p-3.5 sm:p-4 shadow-[0_4px_24px_rgba(143,73,83,0.05)] border border-outline-variant/20 flex flex-col lg:overflow-hidden relative">
            {/* Top Tool Belt: Annotation Tools & Sakura Badges */}
            <div className="flex-none flex flex-wrap items-center justify-between gap-2 bg-surface-container-low/70 p-2 px-3 rounded-xl">
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant px-2">
                  批改笔刷：
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBrush('pen');
                    showToast('已切换至：朱砂红笔批注模式');
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    activeBrush === 'pen'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                  }`}
                  title="朱砂红笔"
                >
                  <span className="material-symbols-outlined text-base">
                    edit
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBrush('highlight');
                    showToast('已切换至：樱花高光记号笔');
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    activeBrush === 'highlight'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
                  }`}
                  title="樱花高光记号"
                >
                  <span className="material-symbols-outlined text-base">
                    brush
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBrush('note');
                    showToast('可在答卷任意文句上方插入气泡便签');
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    activeBrush === 'note'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                  }`}
                  title="文本框便签"
                >
                  <span className="material-symbols-outlined text-base">
                    note_add
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBrush('mic');
                    showToast('已就绪：长按或点击即可录制林知夏老师的温情语音评语');
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    activeBrush === 'mic'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                  }`}
                  title="语音批阅评语录音"
                >
                  <span className="material-symbols-outlined text-base">
                    mic
                  </span>
                </button>
                <div className="w-px h-4 bg-outline-variant/60 mx-1"></div>
                {/* Sakura Stamp Shortcuts */}
                <button
                  type="button"
                  onClick={() => handleApplyStamp('妙笔生花')}
                  className={`px-2.5 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1 transition-all cursor-pointer ${
                    activeStudent.stamp === '妙笔生花'
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'bg-primary-fixed-dim/60 hover:bg-primary-fixed text-on-primary-fixed'
                  }`}
                >
                  <span>🌸 妙笔生花</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyStamp('见解独到')}
                  className={`px-2.5 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1 transition-all cursor-pointer ${
                    activeStudent.stamp === '见解独到'
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'bg-secondary-fixed hover:bg-secondary-container text-on-secondary-fixed'
                  }`}
                >
                  <span>✨ 见解独到</span>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => showToast('已放大答卷字迹至 125% 高清视图')}
                  className="w-7 h-7 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    zoom_in
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPageIdx((p) => (p === 1 ? 2 : 1))}
                  className="w-7 h-7 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container cursor-pointer"
                  title="切换答卷页码"
                >
                  <span className="material-symbols-outlined text-base">
                    fullscreen
                  </span>
                </button>
                <span
                  onClick={() => setPageIdx((p) => (p === 1 ? 2 : 1))}
                  className="font-label-sm text-label-sm px-2 text-on-surface-variant font-medium cursor-pointer"
                >
                  第 {pageIdx}/2 页
                </span>
              </div>
            </div>

            {/* The Paper: Authentic Student Essay & Visual Teacher Annotations */}
            <div className="flex-1 overflow-y-auto mt-space-sm pr-2 relative bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-inner">
              {/* Floating Sakura Stamp Mark on the Paper Top-Right */}
              {activeStudent.stamp && (
                <div className="absolute top-4 right-6 rotate-12 pointer-events-none select-none z-20">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-secondary/40 flex flex-col items-center justify-center text-secondary/80 bg-secondary-fixed/20 backdrop-blur-xs p-1">
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                    <span className="font-headline-sm text-xs font-bold tracking-widest mt-0.5">
                      {activeStudent.stamp}
                    </span>
                    <span className="font-label-sm text-[10px]">
                      高二语文组 · 荐
                    </span>
                  </div>
                </div>
              )}

              {/* Section 1: Question Stem */}
              <div className="mb-space-md bg-surface-container-low/70 p-space-sm rounded-xl">
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary text-on-secondary">
                  【大题 03 · 拓展探究】
                </span>
                <p className="font-body-md text-body-md text-on-surface mt-1.5 leading-relaxed font-semibold">
                  苏轼在《赤壁赋》中由“客之悲”转向“苏子之喜”，试结合“逝者如斯，而未尝往也；盈虚者如彼，而卒莫消长也”一句，谈谈作者是如何在有限生命与无限造化中建立精神安顿的？并简析其道家与儒家哲学的合流。（共25分）
                </p>
              </div>

              {/* Section 2: Student Handwriting / Transcription with Marks */}
              <div className="space-y-space-sm relative">
                <div className="flex items-center justify-between pb-1 border-b border-surface-container-high">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-primary">
                      draw
                    </span>{' '}
                    学生原答卷（{activeStudent.name} · 卷面整洁度{' '}
                    {activeStudent.neatness}）
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                    得分：{activeStudent.questionScore} /{' '}
                    {activeStudent.questionMaxScore}
                  </span>
                </div>

                {/* Paragraph 1 */}
                <div className="relative group bg-surface/50 p-2.5 rounded-xl transition-colors">
                  <p className="font-body-md text-body-md text-on-surface leading-loose tracking-wide">
                    {activeStudent.paragraph1.prefix}
                    <span className="relative inline-block bg-primary-container/40 px-1 rounded mx-0.5 text-on-surface font-medium cursor-help">
                      {activeStudent.paragraph1.highlight}
                      {/* Floating Teacher Note Bubble */}
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary font-label-sm text-[11px] px-2 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">
                          favorite
                        </span>{' '}
                        {activeStudent.paragraph1.note}
                      </span>
                    </span>
                    {activeStudent.paragraph1.suffix}
                  </p>
                </div>

                {/* Paragraph 2 */}
                <div className="relative bg-surface/50 p-2.5 rounded-xl">
                  <p className="font-body-md text-body-md text-on-surface leading-loose tracking-wide">
                    {activeStudent.paragraph2.prefix}
                    <span className="relative inline-block bg-amber-200/60 px-1 rounded mx-0.5 border-b-2 border-dashed border-amber-500 cursor-pointer">
                      {activeStudent.paragraph2.highlight}
                      <span className="absolute -top-7 right-0 bg-amber-700 text-surface-container-lowest font-label-sm text-[11px] px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                        {activeStudent.paragraph2.note}
                      </span>
                    </span>
                    {activeStudent.paragraph2.suffix}
                  </p>
                </div>

                {/* Bottom Teacher Handwritten Stamp & Audio Note */}
                <div className="mt-4 p-space-sm bg-gradient-to-r from-secondary-fixed/30 to-primary-fixed/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlayingAudio(!isPlayingAudio);
                        if (!isPlayingAudio) {
                          showToast(
                            `正在播放林知夏老师对 ${activeStudent.name} 的语音评语 (${activeStudent.audioNote.duration})`
                          );
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {isPlayingAudio ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                        林知夏老师的语音评语{' '}
                        <span className="text-xs text-primary font-normal">
                          ({activeStudent.audioNote.duration})
                        </span>
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {activeStudent.audioNote.transcript}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm px-2 py-1 rounded-full bg-surface-container-lowest text-secondary font-semibold shadow-xs">
                      批阅者：{activeStudent.audioNote.reviewer}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {activeStudent.audioNote.reviewTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Copilot Diagnostic Card */}
          <div className="flex-none min-h-[168px] bg-surface-container-lowest rounded-xl p-3.5 shadow-[0_4px_24px_rgba(143,73,83,0.05)] border border-outline-variant/20 flex flex-col sm:flex-row gap-3.5 overflow-hidden relative">
            <div className="hidden sm:block w-1.5 rounded-full bg-gradient-to-b from-primary via-secondary to-primary-container shrink-0"></div>
            {/* Left: Diagnostic Summary */}
            <div className="flex-1 flex flex-col justify-between min-w-0 gap-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <div className="w-6 h-6 rounded-md bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined text-sm">
                      smart_toy
                    </span>
                  </div>
                  <span className="font-headline-sm text-sm text-on-surface font-bold whitespace-nowrap">
                    Sakura-AI 答卷诊断切片报告
                  </span>
                  <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-md bg-primary-container/50 text-on-primary-container whitespace-nowrap">
                    高中语文新课标素养
                  </span>
                </div>
                <span className="font-label-sm text-xs text-secondary font-semibold whitespace-nowrap">
                  综合得分率：{activeStudent.aiDiagnostic.rate}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-container-low/80 p-2.5 rounded-lg flex flex-col justify-center">
                  <span className="font-label-sm text-xs text-primary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">
                      star
                    </span>
                    <span className="truncate">
                      {activeStudent.aiDiagnostic.strengthTitle}
                    </span>
                  </span>
                  <p className="text-on-surface-variant text-[11px] mt-0.5 line-clamp-2 leading-snug">
                    {activeStudent.aiDiagnostic.strengthDesc}
                  </p>
                </div>
                <div className="bg-surface-container-low/80 p-2.5 rounded-lg flex flex-col justify-center">
                  <span className="font-label-sm text-xs text-secondary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">
                      tips_and_updates
                    </span>
                    <span className="truncate">
                      {activeStudent.aiDiagnostic.tipTitle}
                    </span>
                  </span>
                  <p className="text-on-surface-variant text-[11px] mt-0.5 line-clamp-2 leading-snug">
                    {activeStudent.aiDiagnostic.tipDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-label-sm text-[11px] text-on-surface-variant whitespace-nowrap">
                    推荐拓展：
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface text-[11px] truncate">
                    {activeStudent.aiDiagnostic.recommendedPractice}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `已将「${activeStudent.aiDiagnostic.recommendedPractice}」推送至 ${activeStudent.name} 的个人学习端`
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-primary-container hover:bg-primary hover:text-on-primary text-on-primary-container font-label-sm text-xs font-semibold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>推送巩固包</span>
                  <span className="material-symbols-outlined text-xs">send</span>
                </button>
              </div>
            </div>

            {/* Right: Stamp Score & Fast Grade Input Controller */}
            <div className="w-full sm:w-44 shrink-0 bg-gradient-to-br from-surface-container-low to-secondary-fixed/25 p-2.5 rounded-lg border border-outline-variant/15 flex flex-col items-center justify-between text-center">
              <span className="font-label-sm text-xs text-on-surface-variant whitespace-nowrap">
                快速终核打分
              </span>
              <div className="flex items-baseline gap-1 my-1">
                <input
                  className="w-16 h-10 text-center font-headline-sm text-2xl font-bold text-secondary bg-surface-container-lowest rounded-lg shadow-inner border border-outline-variant/25 focus:ring-2 focus:ring-secondary focus:outline-none"
                  type="text"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                />
                <span className="text-xs text-on-surface-variant font-medium">
                  / 100
                </span>
              </div>
              <div className="w-full flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReturnForRevision}
                  className="flex-1 py-1.5 px-2 rounded-md bg-surface-container-lowest text-on-surface font-label-sm text-[11px] hover:bg-surface-container border border-outline-variant/20 whitespace-nowrap cursor-pointer"
                >
                  打回重订
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAndNext}
                  className="flex-1 py-1.5 px-2 rounded-md bg-secondary text-on-secondary font-label-sm text-[11px] shadow-xs hover:opacity-95 whitespace-nowrap cursor-pointer"
                >
                  提交下一个
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Column 3 (Right): Cohort Insights & Model Essays Board (3 Cols on lg) */}
        <aside
          className={`${
            mobilePanel === 'insights' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-3 bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-3 flex-col gap-3 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 lg:overflow-hidden`}
        >
          <div className="flex-none flex items-center justify-between pb-1 border-b border-surface-container-high">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm">
                  donut_small
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                全班学情洞察
              </span>
            </div>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-container">
              {selectedClass}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-space-sm pr-1">
            {/* 1. Score Distribution Chart Card */}
            <div className="bg-surface-container-low/70 p-space-sm rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  分数段分布阶梯
                </span>
                <span className="font-label-sm text-label-sm text-secondary">
                  中位数: 89.0
                </span>
              </div>
              <div className="w-full h-24 flex items-end justify-between px-2 pt-2 pb-1 bg-surface-container-lowest rounded-lg">
                <div className="flex flex-col items-center gap-1 w-1/4">
                  <span className="text-[10px] text-secondary font-bold">
                    15人
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-secondary to-primary-container rounded-t-md"
                    style={{ height: '58px' }}
                  ></div>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    90-100
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 w-1/4">
                  <span className="text-[10px] text-primary font-bold">
                    22人
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-primary to-primary-fixed rounded-t-md"
                    style={{ height: '76px' }}
                  ></div>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    80-89
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 w-1/4">
                  <span className="text-[10px] text-on-surface-variant font-bold">
                    6人
                  </span>
                  <div
                    className="w-full bg-surface-container-high rounded-t-md"
                    style={{ height: '28px' }}
                  ></div>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    70-79
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 w-1/4">
                  <span className="text-[10px] text-error font-bold">2人</span>
                  <div
                    className="w-full bg-error-container rounded-t-md"
                    style={{ height: '12px' }}
                  ></div>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    &lt;70
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Frequent Error Points / Pedagogical Heatmap */}
            <div className="bg-surface-container-low/70 p-space-sm rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-error">
                    warning
                  </span>{' '}
                  高频失分点排查
                </span>
                <span className="font-label-sm text-xs text-on-surface-variant">
                  失分率
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-on-surface font-medium truncate">
                      1. 虚词“然”字转折与指代辨析
                    </span>
                    <span className="text-error font-bold font-label-sm">
                      41.8%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-error rounded-full"
                      style={{ width: '41.8%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-on-surface font-medium truncate">
                      2. 儒道合流哲学立意辨证表述
                    </span>
                    <span className="text-primary font-bold font-label-sm">
                      28.4%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{ width: '28.4%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-on-surface font-medium truncate">
                      3. 赋体散文的句式偶偶相生格律
                    </span>
                    <span className="text-on-surface-variant font-bold font-label-sm">
                      16.2%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full"
                      style={{ width: '16.2%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Sakura Model Essay Showcase Wall (范文墙) */}
            <div className="bg-gradient-to-br from-primary-fixed/30 to-secondary-fixed/30 p-space-sm rounded-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1">
                  <span>🌸 优秀范文展示墙</span>
                  <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded-full bg-secondary text-on-secondary">
                    已选2篇
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    showToast('已开启苏小萌、陆天宇优秀范文教室智慧黑板轮播')
                  }
                  className="text-xs text-secondary hover:underline flex items-center gap-0.5 font-label-sm cursor-pointer"
                >
                  <span>大屏联播</span>
                  <span className="material-symbols-outlined text-xs">tv</span>
                </button>
              </div>
              <div className="bg-surface-container-lowest p-2.5 rounded-lg shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    苏小萌 (98分卷)
                  </span>
                  <span className="text-[10px] text-secondary font-semibold">
                    全班推优率 96%
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2 italic">
                  “将生命归还于自然之化境，以儒者的经世柔情拥抱日常烟火……”
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-primary">
                    标签：思辨立意极佳
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('已将苏小萌 98分卷关联至《赤壁赋》备课教案样卷库')
                    }
                    className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-container text-[11px] font-label-sm hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer"
                  >
                    设为教案样卷
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action: Export & Class Broadcast Button */}
          <div className="flex-none pt-space-xs">
            <button
              type="button"
              onClick={() =>
                showToast(
                  `正在将 ${activeStudent.name} 的答卷及批注无线投屏至高二(1)班多媒体一体机...`
                )
              }
              className="w-full py-2 rounded-full bg-gradient-to-r from-secondary to-primary text-on-secondary font-label-md text-label-md shadow-[0_4px_16px_rgba(164,48,115,0.25)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                co_present
              </span>
              <span>一键投影到教室一体机讲评</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
