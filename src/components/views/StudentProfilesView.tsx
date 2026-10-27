import React, { useEffect, useState } from 'react';
import { STUDENT_PROFILES } from '../../data/mockData';
import { sakuraApi } from '../../services/sakuraApiService';
import { StudentAcademicProfile } from '../../types/sakura';

interface StudentProfilesViewProps {
  showToast: (msg: string) => void;
  onNavigateToChat?: () => void;
}

export const StudentProfilesView: React.FC<StudentProfilesViewProps> = ({
  showToast,
  onNavigateToChat,
}) => {
  const [profiles, setProfiles] =
    useState<StudentAcademicProfile[]>(STUDENT_PROFILES);
  const [selectedId, setSelectedId] = useState<string>('su-xiaomeng');
  const [searchText, setSearchText] = useState<string>('苏小萌 20230104');
  const [activeTag, setActiveTag] = useState<'all' | 'progress' | 'coaching' | 'competition' | 'care'>('all');
  const [sortMode, setSortMode] = useState<'focus' | 'no'>('focus');
  const [quickReply, setQuickReply] = useState<string>('');
  const [newJournalModal, setNewJournalModal] = useState(false);
  const [newJournalText, setNewJournalText] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'roster' | 'panorama' | 'coaching'>('panorama');

  useEffect(() => {
    sakuraApi.student.getStudentProfiles('G2-201', 'all').then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setProfiles(res.data);
        setSelectedId(res.data[0].id);
        setSearchText(`${res.data[0].name} ${res.data[0].studentNo}`);
      }
    });
  }, []);

  const activeProfile =
    profiles.find((p) => p.id === selectedId) || profiles[0];

  const filteredProfiles = profiles
    .filter((p) => {
      if (activeTag !== 'all' && p.tagCategory !== activeTag) return false;
      return true;
    })
    .sort((a, b) =>
      sortMode === 'no' ? a.studentNo.localeCompare(b.studentNo) : 0
    );

  const handleSelectProfile = async (p: StudentAcademicProfile) => {
    setSelectedId(p.id);
    setSearchText(`${p.name} ${p.studentNo}`);
    setMobilePanel('panorama');
    await sakuraApi.student.getStudentProfiles('G2-201', p.tagCategory);
  };

  const handleSendParentQuickMsg = async () => {
    if (!quickReply.trim()) {
      showToast('请输入给家长的快速留言内容');
      return;
    }
    await sakuraApi.comm.sendParentMessage({
      threadId: `thread-${activeProfile.id}`,
      content: quickReply.trim(),
    });
    const newMsg = {
      id: `pm-${Date.now()}`,
      sender: 'teacher' as const,
      senderLabel: '师',
      text: quickReply.trim(),
      time: '刚刚 · 已送达',
    };
    setProfiles((prev) =>
      prev.map((item) =>
        item.id === activeProfile.id
          ? { ...item, parentMessages: [...item.parentMessages, newMsg] }
          : item
      )
    );
    setQuickReply('');
    showToast(`已向 ${activeProfile.name} 家长发送家校协同留言 🌸`);
  };

  const handleAddJournal = async () => {
    if (!newJournalText.trim()) return;
    const res = await sakuraApi.student.addCoachingJournal(
      activeProfile.id,
      activeProfile.name,
      newJournalText.trim()
    );
    const entry = {
      id: res.data.journalId,
      dateTitle: res.data.dateTitle,
      tag: '最新批注',
      content: newJournalText.trim(),
      teacher: '林知夏 老师',
      statusText: '已同步成长档案',
    };
    setProfiles((prev) =>
      prev.map((item) =>
        item.id === activeProfile.id
          ? { ...item, coachingJournals: [entry, ...item.coachingJournals] }
          : item
      )
    );
    setNewJournalText('');
    setNewJournalModal(false);
    showToast(res.message);
  };

  // Compute radar polygon points dynamically from activeProfile.radarScores
  const r = activeProfile.radarScores;
  const topY = 100 - (r.classical / 100) * 82;
  const trX = 100 + (r.modern / 100) * 74;
  const trY = 95 - (r.modern / 100) * 24;
  const brX = 100 + (r.writing / 100) * 46;
  const brY = 95 + (r.writing / 100) * 64;
  const blX = 100 - (r.poetry / 100) * 46;
  const blY = 95 + (r.poetry / 100) * 62;
  const tlX = 100 - (r.basics / 100) * 75;
  const tlY = 95 - (r.basics / 100) * 20;
  const radarPolygonPoints = `${100},${topY.toFixed(0)} ${trX.toFixed(0)},${trY.toFixed(0)} ${brX.toFixed(0)},${brY.toFixed(0)} ${blX.toFixed(0)},${blY.toFixed(0)} ${tlX.toFixed(0)},${tlY.toFixed(0)}`;

  return (
    <div className="flex flex-col w-full h-full p-3 sm:p-4 gap-3 overflow-y-auto lg:overflow-hidden box-border">
      {/* Top Global Action Bar */}
      <header className="flex-none w-full bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-2.5 px-3.5 sm:px-4 shadow-[0_2px_16px_rgba(143,73,83,0.05)] border border-outline-variant/20 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
          {/* Class Selector Pill */}
          <button
            type="button"
            onClick={() => showToast('当前查看：高二(1)班 全员45人学情全景库')}
            className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/15 cursor-pointer hover:bg-surface-container transition-all whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-secondary text-base">
              supervised_user_circle
            </span>
            <span className="font-headline-sm text-xs text-on-surface font-bold">
              高二 (1) 班
            </span>
            <span className="font-label-sm text-[11px] text-secondary bg-surface-container-highest px-1.5 py-0.2 rounded">
              45人
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">
              expand_more
            </span>
          </button>

          {/* Quick Search Bar */}
          <div className="relative w-52 shrink-0">
            <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-sm">
              search
            </span>
            <input
              className="w-full bg-surface-container-low pl-8 pr-3 py-1.5 rounded-lg border border-outline-variant/20 font-body-sm text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all"
              placeholder="搜索姓名/学号..."
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Tag Filter Pills */}
          <div className="hidden xl:flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTag('all')}
              className={`px-2.5 py-1 rounded-md font-label-sm text-xs flex items-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTag === 'all'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                auto_awesome
              </span>
              全部重点 (12)
            </button>
            <button
              type="button"
              onClick={() => setActiveTag('progress')}
              className={`px-2.5 py-1 rounded-md font-label-sm text-xs flex items-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTag === 'progress'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              进步之星 (6)
            </button>
            <button
              type="button"
              onClick={() => setActiveTag('coaching')}
              className={`px-2.5 py-1 rounded-md font-label-sm text-xs flex items-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTag === 'coaching'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              需面批 (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTag('competition')}
              className={`px-2.5 py-1 rounded-md font-label-sm text-xs flex items-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTag === 'competition'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
              竞赛特训 (2)
            </button>
            <button
              type="button"
              onClick={() => setActiveTag('care')}
              className={`px-2.5 py-1 rounded-md font-label-sm text-xs flex items-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTag === 'care'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              日常关怀 (4)
            </button>
          </div>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              showToast(`正在导出《${activeProfile.name} · 2024春季学期个人成长手册 PDF》...`)
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs border border-outline-variant/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-secondary">
              menu_book
            </span>
            <span>导出成长手册</span>
          </button>
          <button
            type="button"
            onClick={() => {
              showToast(`正在为您打开与 ${activeProfile.name} 家长的协同沟通通道`);
              onNavigateToChat?.();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs border border-outline-variant/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-primary">
              forum
            </span>
            <span>发起家校面谈</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast(`已为 ${activeProfile.name} 等重点学生批量颁发本周樱花成长勋章 🌸`)
            }
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm text-xs font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              military_tech
            </span>
            <span>批量颁发樱花成就</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Panel Switcher (Visible on < lg) */}
      <div className="lg:hidden grid grid-cols-3 gap-1.5 bg-surface-container-lowest p-1.5 rounded-xl border border-outline-variant/20 flex-none">
        {[
          { id: 'roster', icon: 'people', label: `学生名册 (${filteredProfiles.length})` },
          { id: 'panorama', icon: 'radar', label: `画像：${activeProfile.name}` },
          { id: 'coaching', icon: 'book_2', label: '面批手账与家校' },
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

      {/* 3-Column Linked Academic Dashboard Canvas */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 lg:overflow-hidden">
        {/* LEFT COLUMN: Student Registry & Care Triage (3 Cols on lg) */}
        <section
          className={`${
            mobilePanel === 'roster' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-3 lg:h-full flex-col bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-3 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 lg:overflow-hidden`}
        >
          <div className="flex items-center justify-between px-space-xs py-1 mb-space-xs flex-none">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-4 bg-secondary rounded-full"></div>
              <span className="font-headline-sm text-label-md text-on-surface">
                关怀速查名册
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                ({profiles.length}人 · 基准)
              </span>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setSortMode('focus')}
                className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm cursor-pointer ${
                  sortMode === 'focus'
                    ? 'bg-surface-container-lowest text-secondary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                高关注
              </button>
              <button
                type="button"
                onClick={() => setSortMode('no')}
                className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm cursor-pointer ${
                  sortMode === 'no'
                    ? 'bg-surface-container-lowest text-secondary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                按学号
              </button>
            </div>
          </div>

          {/* Student Card List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredProfiles.map((stu) => {
              const isSelected = stu.id === activeProfile.id;
              return (
                <div
                  key={stu.id}
                  onClick={() => handleSelectProfile(stu)}
                  className={`p-2.5 rounded-2xl cursor-pointer transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-fixed-dim/30 to-secondary-fixed/30 shadow-[0_4px_16px_rgba(164,48,115,0.12)] transform scale-[1.01]'
                      : 'bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -right-3 -top-3 w-12 h-12 bg-secondary/10 rounded-full blur-sm"></div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-none">
                      {stu.avatarUrl ? (
                        <img
                          referrerPolicy="no-referrer"
                          src={stu.avatarUrl}
                          alt={stu.name}
                          className={`${
                            isSelected ? 'w-12 h-12' : 'w-11 h-11'
                          } rounded-full object-cover shadow-[0_2px_8px_rgba(143,73,83,0.2)]`}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-headline-sm text-body-md">
                          {stu.avatarChar}
                        </div>
                      )}
                      {stu.badgeType === 'preferred' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] shadow-sm">
                          🌸
                        </span>
                      )}
                      {stu.badgeType === 'warning' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-error text-on-error flex items-center justify-center text-[8px]">
                          !
                        </span>
                      )}
                      {stu.badgeType === 'progress' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[9px]">
                          ✦
                        </span>
                      )}
                      {stu.badgeType === 'leave' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center text-[9px]">
                          ✎
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm text-label-md text-on-surface truncate">
                          {stu.name}
                        </span>
                        <span
                          className={`font-label-sm text-[11px] px-2 py-0.5 rounded-full ${
                            stu.badgeType === 'preferred'
                              ? 'bg-secondary text-on-secondary shadow-sm'
                              : stu.badgeType === 'warning'
                              ? 'bg-error-container text-on-error-container'
                              : stu.badgeType === 'progress'
                              ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                              : stu.badgeType === 'leave'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {stu.badgeText}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-on-surface-variant mt-0.5">
                        <span className="font-body-sm text-label-sm truncate">
                          {stu.id === 'su-xiaomeng'
                            ? `${stu.role} · 学号 ${stu.shortNo}`
                            : stu.dailyStatus}
                        </span>
                        <span
                          className={`font-label-sm text-label-sm flex items-center ${
                            stu.trendDir === 'down'
                              ? 'text-error'
                              : stu.trendDir === 'flat'
                              ? 'text-tertiary'
                              : 'text-secondary font-semibold'
                          }`}
                        >
                          {stu.trendText}
                          {stu.trendDir !== 'flat' && (
                            <span className="material-symbols-outlined text-xs">
                              {stu.trendDir === 'up'
                                ? 'trending_up'
                                : 'trending_down'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2 pt-1.5 border-t border-secondary-fixed/40 flex items-center justify-between text-label-sm">
                      <span className="text-on-surface-variant font-label-sm">
                        {stu.dailyStatus}
                      </span>
                      <span className="text-secondary font-label-sm bg-surface-container-lowest/80 px-1.5 py-0.5 rounded-full">
                        当前查看 ➔
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Triage Bottom Pod */}
          <div className="mt-space-xs p-2.5 rounded-2xl bg-surface-container-low flex items-center justify-between flex-none">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm">alarm</span>
              </div>
              <div>
                <div className="font-label-sm text-on-surface leading-tight">
                  今日待面批提醒
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">
                  大课间：周子涵 (议论文结构)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const zzh = profiles.find((p) => p.id === 'zhou-zihan');
                if (zzh) handleSelectProfile(zzh);
                showToast('已为您切换至周子涵的学情档案与面批手账');
              }}
              className="w-6 h-6 rounded-full bg-surface-container-lowest text-secondary flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">
                arrow_forward
              </span>
            </button>
          </div>
        </section>

        {/* MIDDLE COLUMN: 360° Academic Panorama (5 Cols on lg) */}
        <section
          className={`${
            mobilePanel === 'panorama' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-5 lg:h-full flex-col gap-3 lg:overflow-hidden min-h-0`}
        >
          {/* Top Panorama Header Card */}
          <div className="flex-none bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-4 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-gradient-to-br from-primary-container/20 to-secondary-container/20 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-space-md">
                <div className="relative">
                  {activeProfile.avatarUrl ? (
                    <img
                      referrerPolicy="no-referrer"
                      src={
                        activeProfile.id === 'su-xiaomeng'
                          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR6DHXZfa0Eefv_vJxffAk7sC1PPRqyJ1LNC7jT5yysZtyzc4Y0doVtOff05JEYCj0Ys5TXW7bSPGDh0-QeXcqMS4-XfMkK2mwxnrPAj07DyvL_ZZZRn026o9BH2LdEFVeYsIzyuEEamff7tDd13TKw3B5qgLvsed4TIz0bir2uPgDE41o5sLBeBi2RCDb36pic5o8s_N63-xatoFZowWBBhvS0KUtmtDSGlJyIr6Zgr8umhz2ZQ'
                          : activeProfile.avatarUrl
                      }
                      alt={activeProfile.name}
                      className="w-16 h-16 rounded-lg object-cover shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-headline-md font-bold">
                      {activeProfile.avatarChar}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-label-sm flex items-center shadow-xs">
                    {activeProfile.rankBadge}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-lg text-headline-sm text-on-surface">
                      {activeProfile.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-xs">
                      {activeProfile.role}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-xs">
                      学号 {activeProfile.studentNo}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {activeProfile.bio}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  showToast(`已打开 ${activeProfile.name} 的个性化成长标签编辑器`)
                }
                className="px-3 py-1.5 rounded-md bg-surface-container-low hover:bg-surface-container text-secondary font-label-sm text-label-sm flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-sm">
                  edit_note
                </span>
                编辑画像
              </button>
            </div>

            {/* Sakura Badges Showcase */}
            <div className="mt-space-sm pt-space-xs border-t border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  已斩获学业勋章 ({activeProfile.sakuraMedals.length + 2}枚):
                </span>
                {activeProfile.sakuraMedals.map((medal) => (
                  <span
                    key={medal.label}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-label-sm text-xs ${
                      medal.style === 'primary'
                        ? 'bg-primary-fixed/50 text-on-primary-fixed-variant'
                        : medal.style === 'secondary'
                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                        : 'bg-tertiary-fixed/60 text-on-tertiary-fixed'
                    }`}
                  >
                    <span>{medal.icon}</span> {medal.label}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  showToast(`查看 ${activeProfile.name} 本学期全部荣誉勋章墙`)
                }
                className="font-label-sm text-label-sm text-secondary hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                全部勋章{' '}
                <span className="material-symbols-outlined text-xs">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Center Data Grid: Radar Analysis & Trajectory Chart */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0">
            {/* Radar & Competency Matrix Card */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-lg p-3 flex flex-col justify-between shadow-xs border border-outline-variant/30">
              <div className="flex items-center justify-between flex-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-3.5 bg-primary rounded-xs"></div>
                  <span className="font-headline-sm text-label-md text-on-surface">
                    语文学科五维能力
                  </span>
                </div>
                <span className="font-label-sm text-[11px] px-2 py-0.5 rounded bg-surface-container-low text-secondary font-semibold">
                  综合 {r.overall} 分
                </span>
              </div>

              {/* SVG Visual Radar Component (Theme-aware CSS Variables) */}
              <div className="relative w-full flex-1 flex items-center justify-center my-1 overflow-visible">
                <svg
                  className="w-52 h-44 overflow-visible"
                  viewBox="-25 0 250 190"
                >
                  <polygon
                    fill="none"
                    points="100,15 176,70 147,160 53,160 24,70"
                    stroke="var(--color-surface-container-highest)"
                    strokeDasharray="2 2"
                    strokeWidth="1.2"
                  ></polygon>
                  <polygon
                    fill="none"
                    points="100,38 153,77 133,140 67,140 47,77"
                    stroke="var(--color-surface-container-highest)"
                    strokeWidth="1"
                  ></polygon>
                  <polygon
                    fill="none"
                    points="100,61 130,84 118,120 82,120 70,84"
                    stroke="var(--color-surface-container-highest)"
                    strokeWidth="1"
                  ></polygon>

                  <polygon
                    fill="url(#sakuraRadarGrad)"
                    fillOpacity="0.55"
                    points={radarPolygonPoints}
                    stroke="var(--color-secondary)"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  ></polygon>

                  <circle
                    cx="100"
                    cy={topY}
                    fill="var(--color-secondary)"
                    r="3.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  ></circle>
                  <circle
                    cx={trX}
                    cy={trY}
                    fill="var(--color-secondary)"
                    r="3.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  ></circle>
                  <circle
                    cx={brX}
                    cy={brY}
                    fill="var(--color-secondary)"
                    r="3.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  ></circle>
                  <circle
                    cx={blX}
                    cy={blY}
                    fill="var(--color-secondary)"
                    r="3.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  ></circle>
                  <circle
                    cx={tlX}
                    cy={tlY}
                    fill="var(--color-secondary)"
                    r="3.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  ></circle>

                  <text
                    fill="var(--color-on-surface-variant)"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                    x="100"
                    y="10"
                  >
                    文言理解 {r.classical}
                  </text>
                  <text
                    fill="var(--color-on-surface-variant)"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="start"
                    x="176"
                    y="73"
                  >
                    现代主旨 {r.modern}
                  </text>
                  <text
                    fill="var(--color-on-surface-variant)"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                    x="145"
                    y="172"
                  >
                    写作立意 {r.writing}
                  </text>
                  <text
                    fill="var(--color-on-surface-variant)"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                    x="45"
                    y="172"
                  >
                    诗词鉴赏 {r.poetry}
                  </text>
                  <text
                    fill="var(--color-on-surface-variant)"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="end"
                    x="22"
                    y="73"
                  >
                    基础字词 {r.basics}
                  </text>
                  <defs>
                    <linearGradient
                      id="sakuraRadarGrad"
                      x1="0%"
                      x2="100%"
                      y1="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="var(--color-secondary-container)"></stop>
                      <stop offset="100%" stopColor="var(--color-primary-container)"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-1.5 flex-none bg-surface-container-low p-1.5 rounded-md">
                <div className="text-center">
                  <span className="font-body-sm text-[11px] text-on-surface-variant block">
                    核心优势模块
                  </span>
                  <span className="font-headline-sm text-label-sm text-secondary font-semibold">
                    {activeProfile.strengthModule}
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-body-sm text-[11px] text-on-surface-variant block">
                    进阶增分潜力
                  </span>
                  <span className="font-headline-sm text-label-sm text-primary font-semibold">
                    {activeProfile.potentialModule}
                  </span>
                </div>
              </div>
            </div>

            {/* Trajectory Trends Line Card */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-lg p-3 flex flex-col justify-between shadow-xs border border-outline-variant/30">
              <div className="flex items-center justify-between flex-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-3.5 bg-secondary rounded-xs"></div>
                  <span className="font-headline-sm text-label-md text-on-surface">
                    历次大考走势
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">
                    {activeProfile.examTrajectory.rankChange}
                  </span>
                </div>
              </div>

              <div className="relative w-full flex-1 flex flex-col justify-center px-1">
                <svg
                  className="w-full h-24 overflow-visible"
                  viewBox="0 0 220 100"
                >
                  <line
                    stroke="var(--color-surface-container)"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    x1="10"
                    x2="210"
                    y1="20"
                    y2="20"
                  ></line>
                  <line
                    stroke="var(--color-surface-container)"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    x1="10"
                    x2="210"
                    y1="50"
                    y2="50"
                  ></line>
                  <line
                    stroke="var(--color-surface-container)"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    x1="10"
                    x2="210"
                    y1="80"
                    y2="80"
                  ></line>
                  <path
                    d="M 20,72 Q 65,65 110,48 T 200,22 L 200,88 L 20,88 Z"
                    fill="url(#scoreCurveGrad)"
                    opacity="0.25"
                  ></path>
                  <path
                    d="M 20,72 Q 65,65 110,48 T 200,22"
                    fill="none"
                    stroke="var(--color-secondary)"
                    strokeLinecap="round"
                    strokeWidth="3"
                  ></path>
                  <g>
                    {activeProfile.examTrajectory.points.map((pt, idx) => {
                      const cx = 20 + idx * 60;
                      const cy = [72, 58, 42, 22][idx] || 40;
                      const isLast = idx === 3;
                      return (
                        <React.Fragment key={pt.exam}>
                          <circle
                            cx={cx}
                            cy={cy}
                            fill={isLast ? 'var(--color-secondary)' : '#FFFFFF'}
                            r={isLast ? '5' : '4'}
                            stroke={isLast ? '#FFFFFF' : 'var(--color-secondary)'}
                            strokeWidth="2"
                          ></circle>
                          <text
                            fill={isLast ? 'var(--color-secondary)' : 'var(--color-on-surface-variant)'}
                            fontSize={isLast ? '9' : '8'}
                            fontWeight={isLast ? '700' : '400'}
                            textAnchor="middle"
                            x={cx}
                            y={idx >= 2 ? cy - 8 : cy + 13}
                          >
                            {pt.score}分
                          </text>
                          <text
                            fill={isLast ? 'var(--color-secondary)' : 'var(--color-outline)'}
                            fontSize="7"
                            fontWeight={isLast ? '600' : '400'}
                            textAnchor="middle"
                            x={cx}
                            y="94"
                          >
                            {pt.exam}
                          </text>
                        </React.Fragment>
                      );
                    })}
                  </g>
                  <defs>
                    <linearGradient
                      id="scoreCurveGrad"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="var(--color-secondary)"></stop>
                      <stop offset="100%" stopColor="var(--color-surface)"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="flex-none bg-surface-container-low px-2.5 py-1.5 rounded-md flex items-center justify-between">
                <span className="font-body-sm text-label-sm text-on-surface">
                  {activeProfile.examTrajectory.summary}
                </span>
                <span className="font-label-sm text-xs text-secondary font-semibold bg-surface-container-highest px-2 py-0.5 rounded">
                  {activeProfile.examTrajectory.expectation}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Classroom Presence & Pulse Indicators */}
          <div className="flex-none bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-3 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="flex items-center gap-2.5 bg-surface-container-low p-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-lg">
                  event_available
                </span>
              </div>
              <div>
                <div className="font-headline-sm text-label-md text-on-surface">
                  {activeProfile.presenceMetrics.attendance}
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">
                  {activeProfile.presenceMetrics.attendanceSub}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-surface-container-low p-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-lg">
                  hand_gesture
                </span>
              </div>
              <div>
                <div className="font-headline-sm text-label-md text-on-surface">
                  {activeProfile.presenceMetrics.interaction}
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">
                  {activeProfile.presenceMetrics.interactionSub}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-surface-container-low p-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-lg">bolt</span>
              </div>
              <div>
                <div className="font-headline-sm text-label-md text-on-surface">
                  {activeProfile.presenceMetrics.quizSpeed}
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">
                  {activeProfile.presenceMetrics.quizSpeedSub}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Personalized Coaching Journal & Home-School Portal (4 Cols on lg) */}
        <section
          className={`${
            mobilePanel === 'coaching' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-4 lg:h-full flex-col gap-3 lg:overflow-hidden min-h-0`}
        >
          {/* 1. Teacher Coaching Journal */}
          <div className="flex-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-3 shadow-[0_2px_16px_rgba(143,73,83,0.04)] border border-outline-variant/20 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between flex-none mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-4 bg-primary-container rounded-full"></div>
                <span className="font-headline-sm text-label-md text-on-surface">
                  教师面批手账备忘录
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNewJournalModal(true)}
                className="flex items-center gap-0.5 text-xs text-secondary font-label-sm hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                新建批注
              </button>
            </div>

            <div className="flex-1 bg-gradient-to-b from-surface-container-low to-surface-container-lowest rounded-2xl p-2.5 overflow-y-auto relative border border-secondary-fixed/50">
              <div className="w-12 h-2.5 bg-primary-fixed/80 mx-auto -mt-1 rounded-sm shadow-sm opacity-80 mb-2"></div>
              <div className="space-y-2">
                {activeProfile.coachingJournals.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-surface-container-lowest p-2 rounded-xl shadow-[0_2px_8px_rgba(143,73,83,0.04)]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-1">
                      <span className="font-label-sm text-primary font-semibold">
                        {entry.dateTitle}
                      </span>
                      <span className="bg-surface-container px-1.5 py-0.2 rounded-full">
                        {entry.tag}
                      </span>
                    </div>
                    <p className="font-body-sm text-label-sm text-on-surface leading-snug">
                      {entry.content}
                    </p>
                    {entry.statusText && (
                      <div className="mt-1 flex items-center justify-between text-[10px] text-outline">
                        <span>面批人：{entry.teacher}</span>
                        <span className="text-secondary font-semibold">
                          {entry.statusText}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Home-School Interactive Synergy Card */}
          <div className="flex-1 bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl p-space-sm shadow-[0_4px_24px_rgba(143,73,83,0.04)] flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between flex-none mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-4 bg-secondary-container rounded-full"></div>
                <span className="font-headline-sm text-label-md text-on-surface">
                  家校协同留言
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface-variant">
                {activeProfile.parentName}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 text-label-sm">
              {activeProfile.parentMessages.map((msg) =>
                msg.sender === 'parent' ? (
                  <div key={msg.id} className="flex gap-2 items-start">
                    <div className="w-7 h-7 rounded-full bg-secondary-fixed flex-none flex items-center justify-center text-secondary text-[11px] font-bold">
                      {msg.senderLabel}
                    </div>
                    <div className="bg-surface-container-low p-2 rounded-2xl rounded-tl-none max-w-[85%] text-on-surface text-[12px] leading-relaxed">
                      {msg.text}
                      <span className="block text-[9px] text-outline text-right mt-0.5">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className="flex gap-2 items-start justify-end"
                  >
                    <div className="bg-primary-container/40 p-2 rounded-2xl rounded-tr-none max-w-[85%] text-on-surface text-[12px] leading-relaxed">
                      {msg.text}
                      <span className="block text-[9px] text-outline text-right mt-0.5">
                        {msg.time}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-primary flex-none flex items-center justify-center text-on-primary text-[10px] font-bold">
                      {msg.senderLabel}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Fast Quick-reply Capsule Bar */}
            <div className="flex-none pt-1.5 flex items-center gap-1.5">
              <input
                className="flex-1 bg-surface-container-low pl-3 pr-2 py-1.5 rounded-full text-body-sm text-[12px] text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container"
                placeholder="给家长快速留言反馈..."
                type="text"
                value={quickReply}
                onChange={(e) => setQuickReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendParentQuickMsg();
                }}
              />
              <button
                type="button"
                onClick={handleSendParentQuickMsg}
                className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>

          {/* 3. Smart Academic Care Kit Recommendation Pill */}
          <div className="flex-none bg-gradient-to-r from-primary-fixed/40 to-surface-container-high/60 rounded-3xl p-2.5 shadow-[0_4px_16px_rgba(143,73,83,0.04)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-base">
                  auto_fix_high
                </span>
              </div>
              <div>
                <div className="font-headline-sm text-label-sm text-on-surface">
                  {activeProfile.careKitTitle}
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">
                  {activeProfile.careKitSub}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                showToast(`已将「${activeProfile.careKitTitle}」一键推送至 ${activeProfile.name} 的学习平板`)
              }
              className="px-2.5 py-1 rounded-full bg-surface-container-lowest text-secondary font-label-sm text-[11px] shadow-sm hover:bg-surface-container transition-all cursor-pointer shrink-0"
            >
              一键推送
            </button>
          </div>
        </section>
      </div>

      {/* New Coaching Journal Modal */}
      {newJournalModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-space-lg max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                新建面批手账批注 · {activeProfile.name}
              </h3>
              <button
                type="button"
                onClick={() => setNewJournalModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={newJournalText}
              onChange={(e) => setNewJournalText(e.target.value)}
              placeholder="记录本次课后个别指导或阶段习作面批要点..."
              className="w-full rounded-2xl bg-surface-container-low p-3 text-body-sm text-on-surface focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewJournalModal(false)}
                className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddJournal}
                className="px-5 py-2 rounded-full bg-secondary text-on-secondary font-label-sm"
              >
                保存至手账
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
