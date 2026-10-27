import React, { useEffect, useState } from 'react';
import { sakuraAIService } from '../../services/aiService';
import { sakuraApi } from '../../services/sakuraApiService';

interface LessonPlansViewProps {
  showToast: (msg: string) => void;
}

interface LessonPlanItem {
  id: string;
  unitCode: string;
  title: string;
  summary: string;
  authorName: string;
  badgeText: string;
  slidesCount: number;
  citationCount: number;
  tags: string[];
  updatedAt: string;
}

export const LessonPlansView: React.FC<LessonPlansViewProps> = ({
  showToast,
}) => {
  const [lessonPlans, setLessonPlans] = useState<LessonPlanItem[]>([
    {
      id: 'lp-leiyu-01',
      unitCode: 'u2',
      title: '《雷雨》四幕戏结构深度剖析与话语潜台词',
      summary:
        '聚焦周朴园与鲁侍萍重逢场景，设计“舞台走位复盘”与“核心潜台词戏剧张力”双线探究任务单，融入微课情境演练。',
      authorName: '林知夏',
      badgeText: '樱花教研特优',
      slidesCount: 45,
      citationCount: 238,
      tags: ['# 核心素养·审美鉴赏', '# 任务驱动型导学', '基准示范教案'],
      updatedAt: '基准教案',
    },
  ]);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'ppt' | 'video' | 'audio' | 'worksheet'
  >('all');
  const [activeUnit, setActiveUnit] = useState<'u1' | 'u2' | 'u3'>('u2');
  const [searchInput, setSearchInput] = useState('');
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotSuggestion, setCopilotSuggestion] = useState({
    highlight: '周朴园(伪善专制) ⚔️ 繁漪(雷雨式暴烈)',
    summary:
      '已为您生成《雷雨》核心矛盾冲突思维导图：周朴园(伪善专制) ⚔️ 繁漪(雷雨式暴烈)，包含3组引导提问。',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [memoNote, setMemoNote] = useState(
    '“今天讲到周冲死亡的那场戏，3班学生对理想主义的幻灭讨论极为热烈！下次讲第二课时前，可以组织一场5分钟即兴无准备辩论：周冲的纯洁是对现实的救赎还是退缩？”'
  );
  const [editingLesson, setEditingLesson] = useState<{
    id?: string;
    title: string;
    desc: string;
    author: string;
  } | null>(null);

  useEffect(() => {
    sakuraApi.lesson.getLessonPlans().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setLessonPlans(res.data);
      }
    });
  }, []);

  const filteredLessonPlans = lessonPlans.filter((lp) => {
    if (
      searchInput.trim() &&
      !lp.title.includes(searchInput.trim()) &&
      !lp.summary.includes(searchInput.trim()) &&
      !lp.authorName.includes(searchInput.trim())
    ) {
      return false;
    }
    return true;
  });

  const handleCopilotAsk = async (promptText?: string) => {
    const query = promptText ?? copilotPrompt;
    setIsGenerating(true);
    const res = await sakuraAIService.generateLessonInspiration({
      unitTitle: '雷雨',
      prompt: query,
    });
    setCopilotSuggestion({
      highlight: res.highlightText,
      summary: res.summary,
    });
    setIsGenerating(false);
    setCopilotPrompt('');
    showToast(`Sakura-Copilot 已生成「${res.title}」备课建议 🌸`);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto lg:overflow-hidden p-3 sm:p-4 gap-3 bg-background select-none">
      {/* 顶部资源检索与分类 Bar */}
      <div className="flex-none bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-3 px-3.5 sm:px-4 shadow-[0_2px_16px_rgba(143,73,83,0.05)] border border-outline-variant/20 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 学科/教材版本与面包屑 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                showToast('当前教材版本：统编高中语文 · 必修下册 (2024春季版)')
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                auto_stories
              </span>
              <span className="font-headline-sm text-xs font-bold tracking-tight">
                统编高中语文
              </span>
              <span className="text-outline-variant">·</span>
              <span className="font-label-sm text-xs">必修下册</span>
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                showToast('已切换预览：选择性必修上册（备课组联合共研库）')
              }
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-xs hover:bg-surface-container whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-secondary">
                swap_horiz
              </span>
              <span>切换至：选择性必修上册</span>
            </button>
          </div>

          {/* 搜索框 */}
          <div className="flex-1 min-w-[220px] max-w-xl relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-secondary text-base">
              search_spark
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-14 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-xs focus:outline-none focus:bg-surface-container-lowest transition-all"
              placeholder="检索教案题目、新课标核心素养、反思批注或主备人..."
              type="text"
            />
            <span className="absolute right-2.5 px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px]">
              ⌘K
            </span>
          </div>

          {/* 动作按钮区 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setEditingLesson({
                  title: '新建大单元情境化教案 · 统编必修下册',
                  desc: '请在此录入大单元核心素养目标、情境任务单及课时切片...',
                  author: '林知夏',
                })
              }
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-xs font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                add_circle
              </span>
              <span>新建大单元教案</span>
            </button>
            <button
              type="button"
              onClick={() =>
                showToast('支持拖拽上传 PPTX、Word 导学案、朗诵音频及微课视频')
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs border border-outline-variant/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-secondary">
                cloud_upload
              </span>
              <span>批量导入素材</span>
            </button>
            <button
              type="button"
              onClick={() =>
                showToast('已与高二语文备课组云端网盘完成双向增量同步 (34.2GB)')
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary font-label-sm text-xs border border-outline-variant/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                sync_saved_locally
              </span>
              <span>同步组内网盘</span>
            </button>
          </div>
        </div>

        {/* 分类标签过滤器 */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-outline-variant/15">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[
              { id: 'all', icon: 'done_all', label: '全部教案 (18)', color: '' },
              {
                id: 'ppt',
                icon: 'slideshow',
                label: '精品课件PPT (26)',
                color: 'text-primary',
              },
              {
                id: 'video',
                icon: 'smart_display',
                label: '名师公开课视频 (9)',
                color: 'text-secondary',
              },
              {
                id: 'audio',
                icon: 'graphic_eq',
                label: '课文音频与诵读 (14)',
                color: 'text-tertiary',
              },
              {
                id: 'worksheet',
                icon: 'assignment',
                label: '导学案与随堂练 (31)',
                color: 'text-primary-container',
              },
            ].map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                  className={`px-3 py-1 rounded-md font-label-sm text-xs flex items-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-xs ${
                      active ? '' : cat.color
                    }`}
                  >
                    {cat.icon}
                  </span>
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-on-surface-variant font-label-sm text-xs whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>云端实时保存 · 10:42 已同步</span>
          </div>
        </div>
      </div>

      {/* 主体工作区网格 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* 左侧 8 cols 核心教案索引与卡片阵列 */}
        <div className="lg:col-span-8 flex flex-col gap-3 lg:h-full min-h-0">
          {/* 单元横轴选择卡与备课组进度状态 */}
          <div className="flex-none bg-surface-container-lowest/90 backdrop-blur-sm p-3 rounded-xl border border-outline-variant/20 shadow-[0_2px_16px_rgba(143,73,83,0.04)] flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-x-auto min-w-0">
                <span className="font-headline-sm text-xs text-on-surface font-bold flex items-center gap-1 whitespace-nowrap shrink-0">
                  <span className="material-symbols-outlined text-primary text-base">
                    folder_special
                  </span>
                  单元导引
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    {
                      id: 'u1',
                      label: '第一单元《侍坐》《齐桓晋文之事》',
                    },
                    { id: 'u2', label: '第二单元《雷雨》《窦娥冤》' },
                    { id: 'u3', label: '第三单元《短歌行》《归园田居》' },
                  ].map((u) => {
                    const active = activeUnit === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setActiveUnit(u.id as typeof activeUnit);
                          showToast(`已切换单元导引：${u.label}`);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-primary-fixed-dim text-on-primary-fixed-variant font-headline-sm text-xs font-bold flex items-center gap-1 shadow-xs'
                            : 'bg-surface-container-low text-on-surface-variant font-label-sm text-xs hover:bg-surface-container'
                        }`}
                      >
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        )}
                        {u.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  showToast('已打开 2024 春季学期高二语文全册大单元教学大纲总表')
                }
                className="flex items-center gap-1 text-secondary font-label-sm text-xs hover:opacity-80 transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>大纲大表</span>
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* 教学进度条 */}
            <div className="px-space-sm py-1.5 rounded-full bg-surface-container-low flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-xs flex-none">
                <span className="material-symbols-outlined text-secondary text-sm">
                  flag
                </span>
                <span className="font-label-md text-on-surface">
                  高二备课组统一进度：
                </span>
                <span>戏剧人物冲突与美学建构 (本周教学核心)</span>
              </div>
              <div className="flex-1 flex items-center gap-space-sm max-w-sm">
                <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary-container via-primary-container to-secondary rounded-full"
                    style={{ width: '92%' }}
                  ></div>
                </div>
                <span className="font-headline-sm text-xs text-secondary flex-none">
                  92% 完成
                </span>
              </div>
            </div>
          </div>

          {/* 核心教案卡片网格 (移动端1列，桌面端自适应，默认1条基准示范教案，支持新建与编辑) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0 overflow-y-auto pr-0.5">
            {filteredLessonPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_16px_rgba(143,73,83,0.05)] border border-outline-variant/20 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group gap-3"
              >
                <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-secondary-container/10 pointer-events-none"></div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-sm flex-none">
                        <span className="material-symbols-outlined text-lg">
                          theater_comedy
                        </span>
                      </span>
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px]">
                          <span className="material-symbols-outlined text-[12px] text-secondary">
                            workspace_premium
                          </span>{' '}
                          {plan.badgeText || '基准示范教案'}
                        </span>
                        <span className="text-on-surface-variant font-label-sm text-[11px] ml-1">
                          {plan.slidesCount || 45}页配套PPT
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-base">
                        bookmark_heart
                      </span>
                      <span className="font-label-sm text-[11px]">
                        {plan.citationCount || 238}次引用
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors line-clamp-1">
                      {plan.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant/80 line-clamp-2 mt-1 leading-relaxed">
                      {plan.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {(plan.tags?.length
                      ? plan.tags
                      : ['# 核心素养·审美鉴赏', '# 任务驱动型导学', '基准教案']
                    ).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-surface-container text-on-secondary-container font-label-sm text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t-0">
                  <span className="font-label-sm text-on-surface-variant/70 text-[11px]">
                    主备人：{plan.authorName} · {plan.updatedAt || '基准教案'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`已将《${plan.title}》分享至高二语文备课组群`)
                      }
                      className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-all cursor-pointer"
                      title="分享至备课组"
                    >
                      <span className="material-symbols-outlined text-base">
                        share
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`已启动《${plan.title}》配套PPT教室一体机无线投屏`)
                      }
                      className="px-space-sm py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm hover:opacity-90 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">tv</span>{' '}
                      投屏授课
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingLesson({
                          id: plan.id,
                          title: plan.title,
                          desc: plan.summary,
                          author: plan.authorName,
                        })
                      }
                      className="px-space-md py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md hover:opacity-90 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        edit_document
                      </span>{' '}
                      在线编辑
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* 快捷新增教案引导卡 */}
            <div
              onClick={() =>
                setEditingLesson({
                  title: '《窦娥冤》悲剧精神建构与元曲文言虚实字词速记',
                  desc: '以【滚绣球】曲牌为抓手，拆解古代戏剧天地人神共鸣的超现实浪漫主义，配套词频对比表格与高考常考变体题库。',
                  author: '林知夏',
                })
              }
              className="bg-surface-container-low/50 hover:bg-surface-container-low rounded-xl p-4 border border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all min-h-[180px]"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">
                  post_add
                </span>
              </div>
              <div>
                <h4 className="font-headline-sm text-sm text-on-surface font-bold">
                  + 点击新建大单元示范教案
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  当前已加载 {lessonPlans.length} 份基准教案，新建或修改将实时保存生效
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧 4 cols 教学素材与灵感手账工作舱 */}
        <div className="lg:col-span-4 flex flex-col gap-3 lg:h-full min-h-0">
          {/* 上部: AI 智能备课助手 (Sakura-Copilot) */}
          <div className="flex-1 bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_16px_rgba(143,73,83,0.05)] border border-outline-variant/20 flex flex-col justify-between min-h-0 relative overflow-hidden gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm animate-pulse">
                  <span className="material-symbols-outlined text-base">
                    psychology_alt
                  </span>
                </div>
                <div>
                  <span className="font-headline-sm text-sm text-on-surface block leading-tight">
                    Sakura-Copilot
                  </span>
                  <span className="font-label-sm text-[10px] text-secondary">
                    AI 教学智能体 · 深度学习高中语文课标
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[10px]">
                GPT-4 驱动
              </span>
            </div>

            {/* 智能产出示例卡 */}
            <div className="p-space-sm rounded-xl bg-surface-container-low shadow-[inset_0_1px_4px_rgba(143,73,83,0.04)] flex flex-col gap-1.5 my-1">
              <div className="flex items-center justify-between text-secondary font-label-sm text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">
                    auto_awesome
                  </span>
                  {isGenerating ? '灵感推演中...' : '今日灵感推荐'}
                </span>
                <span className="text-on-surface-variant/70 text-[10px]">
                  一键直插
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface leading-snug">
                {copilotSuggestion.summary.split('：')[0]}：
                <span className="text-secondary font-medium">
                  {copilotSuggestion.highlight}
                </span>
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    showToast('已将该 AI 思维导图与提问链插入《雷雨》主备教案第2课时')
                  }
                  className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[10px] flex items-center gap-1 hover:opacity-90 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    add_box
                  </span>{' '}
                  插入当前教案
                </button>
                <button
                  type="button"
                  onClick={() => handleCopilotAsk('重新提炼')}
                  className="px-2 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-sm text-[10px] hover:text-on-surface cursor-pointer"
                >
                  重新提炼
                </button>
              </div>
            </div>

            {/* 快速 Prompt 气泡与输入框 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                <button
                  type="button"
                  onClick={() => handleCopilotAsk('生成小组角色扮演分工单')}
                  className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-[10px] whitespace-nowrap hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  ⚡ 生成小组角色扮演分工单
                </button>
                <button
                  type="button"
                  onClick={() => handleCopilotAsk('提炼文言情境虚词题')}
                  className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-[10px] whitespace-nowrap hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  📝 提炼文言情境虚词题
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCopilotAsk();
                  }}
                  className="w-full pl-3 pr-8 py-1.5 rounded-full bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-xs focus:outline-none focus:ring-1 focus:ring-secondary"
                  placeholder="向 Sakura AI 发送备课指令（如：写一段《雷雨》导入语）..."
                  type="text"
                />
                <button
                  type="button"
                  onClick={() => handleCopilotAsk()}
                  className="absolute right-1.5 w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:opacity-90 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">
                    send
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 中部: 备课组集体共研与资料共享池 */}
          <div className="flex-1 bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_20px_rgba(143,73,83,0.06)] flex flex-col justify-between min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-lg">
                  group_work
                </span>
                <span className="font-headline-sm text-sm text-on-surface">
                  高二备课组协作池
                </span>
              </div>
              <span className="font-label-sm text-on-surface-variant text-[11px]">
                4位老师在线
              </span>
            </div>
            <div className="flex flex-col gap-1.5 overflow-hidden">
              <div className="flex items-center justify-between px-space-sm py-1.5 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-xs">
                    林
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs text-on-surface leading-tight">
                      高二期中语文答题技巧母题.docx
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">
                      林知夏 刚刚上传更新
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    showToast('已开始下载《高二期中语文答题技巧母题.docx》')
                  }
                  className="w-7 h-7 rounded-full bg-surface-container-lowest text-secondary flex items-center justify-center hover:bg-surface-container cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    download
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between px-space-sm py-1.5 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-headline-sm text-xs">
                    张
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs text-on-surface leading-tight">
                      《雷雨》人物谱系高清白板图.png
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">
                      张晓琳 正在编辑中...
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    showToast('已同步张晓琳老师最新绘制的《雷雨》人物谱系白板图')
                  }
                  className="w-7 h-7 rounded-full bg-surface-container-lowest text-on-surface-variant flex items-center justify-center hover:bg-surface-container cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    sync
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-label-sm text-[11px] text-on-surface-variant">
                云存储空间已用 34.2 GB / 500 GB
              </span>
              <button
                type="button"
                onClick={() => showToast('正在打开高二语文备课组共享网盘...')}
                className="font-label-sm text-[11px] text-secondary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>进入网盘</span>
                <span className="material-symbols-outlined text-xs">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* 底部: 教师个人备课手账 & 灵感便签 */}
          <div className="flex-1 bg-secondary-fixed/50 backdrop-blur-sm rounded-lg p-space-md shadow-[0_4px_20px_rgba(143,73,83,0.06)] flex flex-col justify-between min-h-0 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-base">
                  edit_note
                </span>
                <span className="font-headline-sm text-sm text-on-surface">
                  林老师的备课手账与课堂闪念
                </span>
              </div>
              <span className="text-secondary font-label-sm text-xs">
                🌸 随手记
              </span>
            </div>
            <div className="bg-surface-container-lowest/90 p-space-sm rounded-2xl shadow-sm flex flex-col gap-1 border-0">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[10px]">
                  3班课后反思批注
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant/70">
                  周三 下午第2节
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                {memoNote}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-[10px]">
                <span className="material-symbols-outlined text-xs text-secondary">
                  check_circle
                </span>{' '}
                已沉淀到《雷雨》教案备忘录
              </div>
              <button
                type="button"
                onClick={() => {
                  setMemoNote(
                    '“今日高二(1)班对《雷雨》潜台词的舞台走位复盘非常投入，苏小萌与林沐风的即兴对白展现了极佳的戏剧张力！”'
                  );
                  showToast('已添加一条新的课堂闪念便签 🌸');
                }}
                className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-[11px] hover:opacity-90 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">add</span>{' '}
                添新便签
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Online Editor Modal */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-space-lg max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">
                    edit_document
                  </span>
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  在线教案协同编辑器
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={editingLesson.title}
                onChange={(e) =>
                  setEditingLesson({ ...editingLesson, title: e.target.value })
                }
                className="w-full px-4 py-2 rounded-2xl bg-surface-container-low font-headline-sm text-sm text-on-surface outline-none"
              />
              <textarea
                rows={4}
                value={editingLesson.desc}
                onChange={(e) =>
                  setEditingLesson({ ...editingLesson, desc: e.target.value })
                }
                className="w-full p-3 rounded-2xl bg-surface-container-low font-body-sm text-xs text-on-surface outline-none"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-on-surface-variant">
                主备人：{editingLesson.author} · 云端自动保存中
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-xs"
                >
                  关闭
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await sakuraApi.lesson.saveLessonPlan({
                      lessonId: editingLesson.id,
                      unitCode: activeUnit,
                      title: editingLesson.title,
                      description: editingLesson.desc,
                      authorName: editingLesson.author,
                    });
                    const listRes = await sakuraApi.lesson.getLessonPlans();
                    if (listRes.success && Array.isArray(listRes.data)) {
                      setLessonPlans(listRes.data);
                    }
                    showToast(res.message);
                    setEditingLesson(null);
                  }}
                  className="px-5 py-2 rounded-full bg-secondary text-on-secondary font-label-sm text-xs cursor-pointer"
                >
                  保存并同步全组
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
