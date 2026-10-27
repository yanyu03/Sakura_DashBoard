import React, { useState } from 'react';
import { sakuraApi } from '../../services/sakuraApiService';

interface ScheduleManagementViewProps {
  showToast: (msg: string) => void;
}

interface TimetableCellData {
  id: string;
  dayIndex: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Weekend
  title: string;
  subtitle: string;
  room: string;
  tag: string;
  tagStyle: 'primary' | 'secondary' | 'tertiary' | 'emerald' | 'neutral';
  cardType: 'active-now' | 'chinese-main' | 'research' | 'duty' | 'swap' | 'empty';
  classGroup?: '201' | '203' | 'both' | 'none';
  extraMeta?: string;
  actionLabel?: string;
}

interface TimetableRow {
  periodId: string;
  periodName: string;
  timeRange: string;
  periodBadge?: string;
  isBreakRow?: boolean;
  cells?: TimetableCellData[];
}

const TIMETABLE_ROWS: TimetableRow[] = [
  {
    periodId: 'morning-read',
    periodName: '早读',
    timeRange: '07:40 - 08:15',
    periodBadge: '晨诵',
    cells: [
      {
        id: 'mr-mon',
        dayIndex: 0,
        title: '高二(3)班 古诗文晨诵',
        subtitle: '《赤壁赋》《归去来兮辞》齐诵',
        room: '行知楼 303',
        tag: '常规',
        tagStyle: 'neutral',
        cardType: 'chinese-main',
        classGroup: '203',
      },
      {
        id: 'mr-tue',
        dayIndex: 1,
        title: '自由晨读',
        subtitle: '科任教师自主巡班',
        room: '各班教室',
        tag: '自习',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'none',
      },
      {
        id: 'mr-wed',
        dayIndex: 2,
        title: '高二(1)班 现代文语感',
        subtitle: '《古文观止》选篇与时评精读',
        room: '行知楼 301',
        tag: '领读',
        tagStyle: 'primary',
        cardType: 'chinese-main',
        classGroup: '201',
      },
      {
        id: 'mr-thu',
        dayIndex: 3,
        title: '高二(3)班 班主任巡堂',
        subtitle: '应到 42 人 / 实到 42 人',
        room: '行知楼 303',
        tag: '已完成',
        tagStyle: 'emerald',
        cardType: 'duty',
        classGroup: '203',
      },
      {
        id: 'mr-fri',
        dayIndex: 4,
        title: '英语晨读交换',
        subtitle: '与英语组李老师早读轮换',
        room: '行知楼 303',
        tag: '交换',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: '203',
      },
      {
        id: 'mr-wk',
        dayIndex: 5,
        title: '周六阅读打卡',
        subtitle: '名著整本书自主研读',
        room: '线上社群',
        tag: '拓展',
        tagStyle: 'primary',
        cardType: 'duty',
        classGroup: 'both',
      },
    ],
  },
  {
    periodId: 'am-12',
    periodName: '上午 1-2 节',
    timeRange: '08:30 - 10:10',
    periodBadge: '连堂正课',
    cells: [
      {
        id: 'am12-mon',
        dayIndex: 0,
        title: '升旗集会与主题班会',
        subtitle: '高二年级春季学风建设周会',
        room: '大操场 / 303',
        tag: '德育',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: '203',
      },
      {
        id: 'am12-tue',
        dayIndex: 1,
        title: '高二(3)班 语文',
        subtitle: '期中综合卷现代文主观题剖析',
        room: '行知楼 303',
        tag: '讲评',
        tagStyle: 'primary',
        cardType: 'chinese-main',
        classGroup: '203',
        extraMeta: '课件 v3.2 · 42人',
      },
      {
        id: 'am12-wed',
        dayIndex: 2,
        title: '语文组 大单元教研',
        subtitle: '跨学科融合研讨 · 林知夏召集',
        room: '行政楼 402',
        tag: '教研',
        tagStyle: 'tertiary',
        cardType: 'research',
        classGroup: 'both',
      },
      {
        id: 'am12-thu',
        dayIndex: 3,
        title: '高二(1)班 语文',
        subtitle: '《长恨歌》艺术构思与悲剧美',
        room: '录播教室 B204',
        tag: '正在进行',
        tagStyle: 'secondary',
        cardType: 'active-now',
        classGroup: '201',
        extraMeta: '互动板书已投屏',
        actionLabel: '开启随堂测',
      },
      {
        id: 'am12-fri',
        dayIndex: 4,
        title: '高二(3)班 语文',
        subtitle: '文言虚词实战微专题突破',
        room: '多媒体西阶一',
        tag: '正课',
        tagStyle: 'primary',
        cardType: 'chinese-main',
        classGroup: '203',
      },
      {
        id: 'am12-wk',
        dayIndex: 5,
        title: '周末休整',
        subtitle: '无排课安排',
        room: '-',
        tag: '休息',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'none',
      },
    ],
  },
  {
    periodId: 'am-34',
    periodName: '上午 3-4 节',
    timeRange: '10:25 - 12:00',
    periodBadge: '核心时段',
    cells: [
      {
        id: 'am34-mon',
        dayIndex: 0,
        title: '高二(1)班 语文',
        subtitle: '白居易叙事长诗结构与声韵节奏',
        room: '行知楼 301',
        tag: '文本细读',
        tagStyle: 'primary',
        cardType: 'chinese-main',
        classGroup: '201',
      },
      {
        id: 'am34-tue',
        dayIndex: 1,
        title: '备课与作业精批',
        subtitle: '必修下第三单元导学案校印',
        room: '语文教研室',
        tag: '自主教研',
        tagStyle: 'neutral',
        cardType: 'duty',
        classGroup: 'both',
      },
      {
        id: 'am34-wed',
        dayIndex: 2,
        title: '教研公开课观摩',
        subtitle: '《红楼梦大单元情境化》苏若水',
        room: '学术报告厅',
        tag: '学术听课',
        tagStyle: 'secondary',
        cardType: 'research',
        classGroup: 'both',
      },
      {
        id: 'am34-thu',
        dayIndex: 3,
        title: '自习值守 / 课内面批',
        subtitle: '高二(3)班 议论文结构个别指导',
        room: '行知楼 303',
        tag: '已约6人',
        tagStyle: 'primary',
        cardType: 'duty',
        classGroup: '203',
      },
      {
        id: 'am34-fri',
        dayIndex: 4,
        title: '调课：英语 (李老师)',
        subtitle: '原周五第3节语文与英语互换',
        room: '行知楼 303',
        tag: '调课已生效',
        tagStyle: 'emerald',
        cardType: 'swap',
        classGroup: '203',
      },
      {
        id: 'am34-wk',
        dayIndex: 5,
        title: '自由研修',
        subtitle: '-',
        room: '-',
        tag: '休息',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'none',
      },
    ],
  },
  {
    periodId: 'noon-break',
    periodName: '午间静校',
    timeRange: '12:00 - 14:00',
    isBreakRow: true,
  },
  {
    periodId: 'pm-56',
    periodName: '下午 5-6 节',
    timeRange: '14:00 - 15:40',
    periodBadge: '下午正课',
    cells: [
      {
        id: 'pm56-mon',
        dayIndex: 0,
        title: '高二(3)班 语文',
        subtitle: '微写作与议论文立意升格指导',
        room: '行知楼 303',
        tag: '写作讲评',
        tagStyle: 'primary',
        cardType: 'chinese-main',
        classGroup: '203',
      },
      {
        id: 'pm56-tue',
        dayIndex: 1,
        title: '高二(1)班 语文',
        subtitle: '《琵琶行》音乐描写技法精讲',
        room: '行知楼 301',
        tag: '新授课',
        tagStyle: 'primary',
        cardType: 'chinese-main',
        classGroup: '201',
      },
      {
        id: 'pm56-wed',
        dayIndex: 2,
        title: '学科组集体备课',
        subtitle: '下阶段教学进度与期中复盘规划',
        room: '行政楼 402',
        tag: '备课组',
        tagStyle: 'tertiary',
        cardType: 'research',
        classGroup: 'both',
      },
      {
        id: 'pm56-thu',
        dayIndex: 3,
        title: '高二(3)班 作业讲评',
        subtitle: '古代文人志趣比较赏析讲评',
        room: '多媒体西阶一',
        tag: '14:00 待上课',
        tagStyle: 'secondary',
        cardType: 'chinese-main',
        classGroup: '203',
        extraMeta: '42人 · 课件就绪',
      },
      {
        id: 'pm56-fri',
        dayIndex: 4,
        title: '周测命题分析研讨',
        subtitle: '周末统考试卷组题与赋分评审',
        room: '高二教研室',
        tag: '命题组',
        tagStyle: 'tertiary',
        cardType: 'research',
        classGroup: 'both',
      },
      {
        id: 'pm56-wk',
        dayIndex: 5,
        title: '社团读书沙龙',
        subtitle: '樱花文学社经典戏剧围读指导',
        room: '图书馆二楼',
        tag: '社团指导',
        tagStyle: 'primary',
        cardType: 'research',
        classGroup: 'both',
      },
    ],
  },
  {
    periodId: 'pm-78',
    periodName: '延时辅导',
    timeRange: '16:00 - 18:00',
    periodBadge: '培优答疑',
    cells: [
      {
        id: 'pm78-mon',
        dayIndex: 0,
        title: '答疑自由窗口',
        subtitle: '古诗文背诵通关与随堂抽背',
        room: '办公室 208',
        tag: '开放答疑',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'both',
      },
      {
        id: 'pm78-tue',
        dayIndex: 1,
        title: '卓越语文拔尖培优',
        subtitle: '高二整本书思辨读写专题讲座',
        room: '博学楼 103',
        tag: '精品小班',
        tagStyle: 'secondary',
        cardType: 'research',
        classGroup: 'both',
        extraMeta: '12人已预约',
      },
      {
        id: 'pm78-wed',
        dayIndex: 2,
        title: '体育大课间 / 教师运动',
        subtitle: '教工羽毛球馆活动日',
        room: '艺体中心',
        tag: '活力健康',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'none',
      },
      {
        id: 'pm78-thu',
        dayIndex: 3,
        title: '个别化学法面批',
        subtitle: '高二(3)班 临界生文言帮扶对谈',
        room: '办公室 208',
        tag: '4位学生',
        tagStyle: 'primary',
        cardType: 'duty',
        classGroup: '203',
      },
      {
        id: 'pm78-fri',
        dayIndex: 4,
        title: '周末安全离校清点',
        subtitle: '高二(3)班 离校总结与家校签收',
        room: '行知楼 303',
        tag: '班务',
        tagStyle: 'primary',
        cardType: 'duty',
        classGroup: '203',
      },
      {
        id: 'pm78-wk',
        dayIndex: 5,
        title: '-',
        subtitle: '无延时排课',
        room: '-',
        tag: '休息',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'none',
      },
    ],
  },
  {
    periodId: 'evening-study',
    periodName: '晚自习值班',
    timeRange: '18:40 - 21:30',
    periodBadge: '静校督导',
    cells: [
      {
        id: 'ev-mon',
        dayIndex: 0,
        title: '非值班日',
        subtitle: '正常下班休整',
        room: '-',
        tag: '休整',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'none',
      },
      {
        id: 'ev-tue',
        dayIndex: 1,
        title: '非值班日',
        subtitle: '正常下班休整',
        room: '-',
        tag: '休整',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'none',
      },
      {
        id: 'ev-wed',
        dayIndex: 2,
        title: '非值班日',
        subtitle: '正常下班休整',
        room: '-',
        tag: '休整',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'none',
      },
      {
        id: 'ev-thu',
        dayIndex: 3,
        title: '高二年级 晚自习统筹',
        subtitle: '高二(1)班 & 高二(3)班 巡查答疑',
        room: '立言楼 102',
        tag: '本周值班',
        tagStyle: 'tertiary',
        cardType: 'duty',
        classGroup: 'both',
      },
      {
        id: 'ev-fri',
        dayIndex: 4,
        title: '周末放学离校',
        subtitle: '住校生周末留校移交宿管部',
        room: '-',
        tag: '离校',
        tagStyle: 'neutral',
        cardType: 'empty',
        classGroup: 'none',
      },
      {
        id: 'ev-wk',
        dayIndex: 5,
        title: '家校线上答疑窗',
        subtitle: '周日晚 19:30 返校收心提醒',
        room: '企业微信',
        tag: '线上',
        tagStyle: 'primary',
        cardType: 'duty',
        classGroup: 'both',
      },
    ],
  },
];

const WEEK_DAYS = [
  { label: '周一', date: '04/15', note: '常规课程', isToday: false },
  { label: '周二', date: '04/16', note: '双班连堂', isToday: false },
  { label: '周三', date: '04/17', note: '教研开放日', isToday: false },
  { label: '周四', date: '04/18', note: '今日在席', isToday: true },
  { label: '周五', date: '04/19', note: '培优复盘', isToday: false },
  { label: '周末拓展', date: '04/20-21', note: '名著研修', isToday: false },
];

export const ScheduleManagementView: React.FC<ScheduleManagementViewProps> = ({
  showToast,
}) => {
  const [weekNum, setWeekNum] = useState(12);
  const [viewFilter, setViewFilter] = useState<
    'my-schedule' | 'class-203' | 'class-201' | 'open-class' | 'room-view'
  >('my-schedule');
  const [mobileDayIdx, setMobileDayIdx] = useState<number>(3); // Default Thursday (Today)
  const [mobileDisplayMode, setMobileDisplayMode] = useState<'day-list' | 'full-grid'>('day-list');
  const [selectedLessonSnapshot, setSelectedLessonSnapshot] = useState<{
    title: string;
    subtitle: string;
    room: string;
    status: string;
  } | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  const weekRanges: Record<number, string> = {
    11: '4月08日 (周一) - 4月14日 (周日)',
    12: '4月15日 (周一) - 4月21日 (周日)',
    13: '4月22日 (周一) - 4月28日 (周日)',
  };

  const handleWeekChange = async (nextWeek: number) => {
    setWeekNum(nextWeek);
    await sakuraApi.schedule.getWeeklyTimetable(nextWeek, viewFilter);
  };

  const handleFilterChange = async (
    nextFilter: typeof viewFilter,
    label: string
  ) => {
    setViewFilter(nextFilter);
    await sakuraApi.schedule.getWeeklyTimetable(weekNum, nextFilter);
    showToast(`已切换课表视角：${label}`);
  };

  const isCellDimmed = (cell: TimetableCellData) => {
    if (viewFilter === 'my-schedule' || viewFilter === 'room-view') return false;
    if (viewFilter === 'class-203') {
      return cell.classGroup !== '203' && cell.classGroup !== 'both';
    }
    if (viewFilter === 'class-201') {
      return cell.classGroup !== '201' && cell.classGroup !== 'both';
    }
    if (viewFilter === 'open-class') {
      return cell.cardType !== 'research' && cell.cardType !== 'active-now';
    }
    return false;
  };

  const getCardStyle = (cell: TimetableCellData) => {
    switch (cell.cardType) {
      case 'active-now':
        return 'bg-gradient-to-br from-primary-fixed via-secondary-fixed/90 to-primary-fixed border-secondary/40 shadow-sm ring-1 ring-secondary/20';
      case 'chinese-main':
        return 'bg-primary-fixed/35 hover:bg-primary-fixed/55 border-primary-container/50';
      case 'research':
        return 'bg-secondary-fixed/35 hover:bg-secondary-fixed/55 border-secondary-container/40';
      case 'duty':
        return 'bg-tertiary-fixed/35 hover:bg-tertiary-fixed/55 border-tertiary-container/50';
      case 'swap':
        return 'bg-emerald-50/90 hover:bg-emerald-100/80 border-emerald-300/60';
      default:
        return 'bg-surface-container-low/30 hover:bg-surface-container-low/60 border-outline-variant/20';
    }
  };

  const getTagBadgeStyle = (style: TimetableCellData['tagStyle']) => {
    switch (style) {
      case 'secondary':
        return 'bg-secondary text-on-secondary';
      case 'primary':
        return 'bg-surface-container-lowest text-primary border border-primary-container/40';
      case 'tertiary':
        return 'bg-tertiary-fixed text-on-tertiary-fixed';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto lg:overflow-hidden p-3 sm:p-4 gap-3 bg-background select-none">
      {/* Top Control Header */}
      <header className="flex-none w-full bg-surface-container-lowest/95 backdrop-blur-md rounded-xl px-3 sm:px-4 py-2.5 shadow-[0_2px_16px_rgba(131,24,67,0.04)] border border-outline-variant/20 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Week Switcher & Date Range */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant/15">
            <button
              type="button"
              onClick={() => handleWeekChange(Math.max(11, weekNum - 1))}
              className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest transition-all cursor-pointer"
              title="上一教学周"
            >
              <span className="material-symbols-outlined text-base">
                chevron_left
              </span>
            </button>
            <div className="px-2 flex items-center gap-1.5 whitespace-nowrap">
              <span
                className="material-symbols-outlined text-secondary text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                event_note
              </span>
              <span className="font-headline-sm text-xs sm:text-sm text-on-surface font-bold">
                第 {weekNum} 周
              </span>
              <span className="px-1.5 py-0.5 rounded bg-secondary-container/25 text-on-secondary-container font-label-sm text-[10px]">
                {weekNum === 12 ? '当前周' : '周历'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleWeekChange(Math.min(13, weekNum + 1))}
              className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest transition-all cursor-pointer"
              title="下一教学周"
            >
              <span className="material-symbols-outlined text-base">
                chevron_right
              </span>
            </button>
          </div>

          <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-xs whitespace-nowrap">
            <span className="material-symbols-outlined text-sm text-primary">
              calendar_today
            </span>
            <span>{weekRanges[weekNum] || '4月15日 (周一) - 4月21日 (周日)'}</span>
          </div>

          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-label-sm text-xs whitespace-nowrap">
            <span
              className="material-symbols-outlined text-sm text-emerald-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span>排课无冲突</span>
          </div>
        </div>

        {/* Center: Segmented View Filter Bar */}
        <div className="flex items-center bg-surface-container-low p-1 rounded-lg gap-1 overflow-x-auto max-w-full">
          {[
            { id: 'my-schedule', label: '我的任教课表' },
            { id: 'class-203', label: '高二(3)班' },
            { id: 'class-201', label: '高二(1)班' },
            { id: 'open-class', label: '公开课/教研' },
            { id: 'room-view', label: '教室视角', icon: 'meeting_room' },
          ].map((pill) => {
            const active = viewFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() =>
                  handleFilterChange(pill.id as typeof viewFilter, pill.label)
                }
                className={`px-2.5 sm:px-3 py-1.5 rounded-md font-label-sm text-xs transition-all flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                )}
                {pill.icon && (
                  <span className="material-symbols-outlined text-sm">
                    {pill.icon}
                  </span>
                )}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Operational Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSwapModalOpen(true)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs transition-all border border-outline-variant/20 whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-primary">
              published_with_changes
            </span>
            <span>申请调代课</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('正在生成第 12 周高二语文办公桌垫版 A4 周历打印预览...')
            }
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs transition-all border border-outline-variant/20 whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-on-surface-variant">
              print
            </span>
            <span>周历打印</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              const res = await sakuraApi.schedule.syncCalendarToDevice(weekNum);
              showToast(res.message);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label-sm text-xs font-semibold shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">ios_share</span>
            <span>同步日程</span>
          </button>
        </div>
      </header>

      {/* Mobile Day Switcher & Mode Toggle (Visible on < md) */}
      <div className="md:hidden flex flex-col gap-2 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-xs font-bold text-on-surface">
            移动端排课视图切换
          </span>
          <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setMobileDisplayMode('day-list')}
              className={`px-2.5 py-1 rounded-md ${
                mobileDisplayMode === 'day-list'
                  ? 'bg-surface-container-lowest text-secondary font-bold shadow-xs'
                  : 'text-on-surface-variant'
              }`}
            >
              单日卡片流
            </button>
            <button
              type="button"
              onClick={() => setMobileDisplayMode('full-grid')}
              className={`px-2.5 py-1 rounded-md ${
                mobileDisplayMode === 'full-grid'
                  ? 'bg-surface-container-lowest text-secondary font-bold shadow-xs'
                  : 'text-on-surface-variant'
              }`}
            >
              全周网格表
            </button>
          </div>
        </div>

        {mobileDisplayMode === 'day-list' && (
          <div className="grid grid-cols-6 gap-1">
            {WEEK_DAYS.map((day, idx) => {
              const active = mobileDayIdx === idx;
              return (
                <button
                  key={day.label}
                  type="button"
                  onClick={() => setMobileDayIdx(idx)}
                  className={`py-1.5 px-1 rounded-lg flex flex-col items-center text-center transition-all ${
                    active
                      ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                      : day.isToday
                      ? 'bg-primary-fixed/50 text-primary font-semibold'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <span className="text-[11px] leading-tight">
                    {day.label.replace('拓展', '')}
                  </span>
                  <span className="text-[9px] opacity-80">{day.date}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Split: Structured CSS Grid Timetable + Right Telemetry Sidebar */}
      <div className="flex-1 w-full flex flex-col lg:flex-row gap-3 lg:overflow-hidden min-h-0">
        {/* Left: Structured Timetable Matrix Container */}
        <section className="flex-1 lg:h-full flex flex-col bg-surface-container-lowest rounded-xl shadow-[0_2px_20px_rgba(131,24,67,0.03)] border border-outline-variant/25 overflow-hidden min-w-0">
          {/* Mobile Single-Day Card List View (shown on < md when mobileDisplayMode === 'day-list') */}
          <div
            className={`${
              mobileDisplayMode === 'day-list' ? 'block md:hidden' : 'hidden'
            } p-3 space-y-2.5`}
          >
            {TIMETABLE_ROWS.map((row) => {
              if (row.isBreakRow) {
                return (
                  <div
                    key={row.periodId}
                    className="p-2.5 rounded-lg bg-surface-container-low/60 border border-outline-variant/20 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-on-surface">
                      {row.periodName} ({row.timeRange})
                    </span>
                    <span className="text-secondary text-[11px]">
                      午间静校 · 13:20 顾明朗答疑
                    </span>
                  </div>
                );
              }
              const cell = row.cells?.[mobileDayIdx];
              if (!cell) return null;
              return (
                <div
                  key={row.periodId}
                  onClick={() =>
                    cell.cardType !== 'empty' &&
                    setSelectedLessonSnapshot({
                      title: cell.title,
                      subtitle: cell.subtitle,
                      room: cell.room,
                      status: cell.tag,
                    })
                  }
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${getCardStyle(
                    cell
                  )}`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-mono text-[11px] font-bold">
                        {row.periodName} · {row.timeRange}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-label-sm ${getTagBadgeStyle(
                          cell.tagStyle
                        )}`}
                      >
                        {cell.tag}
                      </span>
                    </div>
                    <div className="font-headline-sm text-sm text-on-surface font-bold">
                      {cell.title}
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {cell.subtitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0 text-xs text-primary font-medium">
                    {cell.room}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop & Full-Grid Scrollable Matrix Wrapper */}
          <div
            className={`${
              mobileDisplayMode === 'day-list' ? 'hidden md:block' : 'block'
            } flex-1 overflow-auto`}
          >
            <div className="min-w-[820px] h-full flex flex-col">
              {/* Sticky Column Headers */}
              <div className="sticky top-0 z-20 grid grid-cols-[100px_repeat(5,minmax(125px,1fr))_125px] bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant/30">
                <div className="p-2.5 flex flex-col items-center justify-center border-r border-outline-variant/25 text-center">
                  <span className="font-label-sm text-xs text-on-surface font-semibold">
                    节次 / 时段
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    标准作息表
                  </span>
                </div>
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day.label}
                    className={`p-2 flex flex-col items-center justify-center border-r last:border-r-0 border-outline-variant/25 ${
                      day.isToday
                        ? 'bg-primary-container/25'
                        : 'bg-surface-container-low/50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className={`font-headline-sm text-xs font-bold ${
                          day.isToday ? 'text-secondary' : 'text-on-surface'
                        }`}
                      >
                        {day.label}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        ({day.date})
                      </span>
                      {day.isToday && (
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-0.5 px-2 py-0.2 rounded-full ${
                        day.isToday
                          ? 'bg-secondary text-on-secondary font-semibold'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {day.note}
                    </span>
                  </div>
                ))}
              </div>

              {/* Timetable Rows */}
              <div className="flex-1 flex flex-col divide-y divide-outline-variant/25">
                {TIMETABLE_ROWS.map((row) => {
                  if (row.isBreakRow) {
                    return (
                      <div
                        key={row.periodId}
                        className="grid grid-cols-[100px_1fr] bg-surface-container-low/35 min-h-[42px]"
                      >
                        <div className="p-2 flex flex-col items-center justify-center border-r border-outline-variant/25 text-center">
                          <span className="font-label-sm text-xs text-on-surface font-semibold">
                            {row.periodName}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">
                            {row.timeRange}
                          </span>
                        </div>
                        <div className="px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                              <span className="material-symbols-outlined text-sm text-secondary">
                                coffee
                              </span>
                              午间静校与教师心语氧吧
                            </span>
                            <span className="text-outline-variant">|</span>
                            <span className="text-on-surface">
                              今日值守：王主任 (高二年级组)
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-surface-container-lowest text-primary text-[11px] font-medium border border-primary-container/40">
                              今日预约答疑：13:20 顾明朗 (古诗词鉴赏辅导)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                            <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                            <span>午休静音模式 12:40 - 13:40</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={row.periodId}
                      className="flex-1 grid grid-cols-[100px_repeat(5,minmax(125px,1fr))_125px] min-h-[88px]"
                    >
                      {/* Row Header Cell */}
                      <div className="p-2 bg-surface-container-low/30 border-r border-outline-variant/25 flex flex-col items-center justify-center text-center gap-0.5">
                        <span className="font-headline-sm text-xs text-on-surface font-bold">
                          {row.periodName}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {row.timeRange}
                        </span>
                        {row.periodBadge && (
                          <span className="mt-0.5 px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant text-[10px]">
                            {row.periodBadge}
                          </span>
                        )}
                      </div>

                      {/* Day Cells */}
                      {row.cells?.map((cell) => {
                        const dimmed = isCellDimmed(cell);
                        const isTodayCol = cell.dayIndex === 3;

                        return (
                          <div
                            key={cell.id}
                            className={`p-1.5 border-r last:border-r-0 border-outline-variant/25 flex flex-col transition-opacity ${
                              isTodayCol ? 'bg-primary-fixed/10' : ''
                            } ${dimmed ? 'opacity-30' : 'opacity-100'}`}
                          >
                            {cell.cardType === 'empty' ? (
                              <div className="w-full h-full rounded-lg border border-dashed border-outline-variant/30 bg-surface-container-low/15 p-2 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-medium text-on-surface-variant/60">
                                  {cell.title}
                                </span>
                                {cell.subtitle && cell.subtitle !== '-' && (
                                  <span className="text-[10px] text-on-surface-variant/45 mt-0.5 line-clamp-1">
                                    {cell.subtitle}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div
                                onClick={() =>
                                  setSelectedLessonSnapshot({
                                    title: cell.title,
                                    subtitle: cell.subtitle,
                                    room: cell.room,
                                    status: cell.tag,
                                  })
                                }
                                className={`w-full h-full rounded-lg border p-2 flex flex-col justify-between transition-all cursor-pointer ${getCardStyle(
                                  cell
                                )}`}
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <span className="font-headline-sm text-xs text-on-surface font-bold leading-snug line-clamp-1">
                                    {viewFilter === 'room-view' && cell.room !== '-'
                                      ? cell.room
                                      : cell.title}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-label-sm whitespace-nowrap shrink-0 ${getTagBadgeStyle(
                                      cell.tagStyle
                                    )}`}
                                  >
                                    {cell.tag}
                                  </span>
                                </div>

                                <p className="text-[11px] text-on-surface-variant leading-snug line-clamp-2 my-1">
                                  {viewFilter === 'room-view'
                                    ? `${cell.title} · ${cell.subtitle}`
                                    : cell.subtitle}
                                </p>

                                <div className="flex items-center justify-between gap-1 pt-1 border-t border-outline-variant/15 text-[10px]">
                                  <span className="text-on-surface-variant flex items-center gap-0.5 truncate">
                                    <span className="material-symbols-outlined text-[12px] text-primary shrink-0">
                                      location_on
                                    </span>
                                    <span className="truncate">{cell.room}</span>
                                  </span>

                                  {cell.actionLabel ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        showToast(
                                          `已向 ${cell.room} 全班学生终端下发《长恨歌》随堂限时微测`
                                        );
                                      }}
                                      className="px-2 py-0.5 rounded bg-secondary text-on-secondary font-semibold hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer"
                                    >
                                      {cell.actionLabel}
                                    </button>
                                  ) : cell.extraMeta ? (
                                    <span className="text-primary font-medium whitespace-nowrap shrink-0">
                                      {cell.extraMeta}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timetable Footer Legend */}
          <footer className="flex-none px-4 py-2 bg-surface-container-low/50 border-t border-outline-variant/25 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap font-label-sm text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary-container"></span>
                日常语文正课
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-secondary-container"></span>
                教研 / 公开课
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-tertiary-container"></span>
                晚自习 / 辅导值守
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
                已生效调代课
              </span>
            </div>
            <span className="text-secondary font-label-sm text-[11px] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">
                touch_app
              </span>
              单击任意课程卡片可调阅配套教案与课堂考勤快照
            </span>
          </footer>
        </section>

        {/* Right: Telemetry, Swap Approval & Weekly Hours Sidebar (Full width on mobile/tablet, w-80 on desktop) */}
        <aside className="w-full lg:w-80 xl:w-84 shrink-0 lg:h-full flex flex-col gap-3 lg:overflow-y-auto pr-0.5">
          {/* Card 1: Upcoming Class Live Pod */}
          <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-[0_2px_16px_rgba(131,24,67,0.04)] border border-outline-variant/20 flex flex-col gap-2.5 flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                <span className="font-headline-sm text-sm text-on-surface font-bold">
                  即将开启 · 下一节课堂
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-primary-container/30 text-on-primary-container font-label-sm text-[11px] whitespace-nowrap">
                下午 14:00
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low/70 border border-outline-variant/15 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-headline-sm text-sm text-on-surface font-bold">
                    高二(3)班 · 作业讲评课
                  </div>
                  <div className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm text-secondary">
                      domain
                    </span>
                    多媒体西阶一教室
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-headline-sm text-lg text-secondary font-bold leading-none">
                    38{' '}
                    <span className="text-xs text-on-surface-variant font-normal">
                      分钟后
                    </span>
                  </div>
                  <span className="inline-block font-label-sm text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded mt-1">
                    教案已同步
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center font-label-sm text-[11px]">
                <div className="bg-surface-container-lowest p-1.5 rounded-md border border-outline-variant/15 flex flex-col items-center">
                  <span className="text-on-surface-variant text-[10px]">
                    室内温度
                  </span>
                  <span className="font-semibold text-on-surface mt-0.5 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs text-primary">
                      device_thermostat
                    </span>
                    22.4°C
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-1.5 rounded-md border border-outline-variant/15 flex flex-col items-center">
                  <span className="text-on-surface-variant text-[10px]">
                    投影系统
                  </span>
                  <span className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">
                      cast
                    </span>
                    待机就绪
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-1.5 rounded-md border border-outline-variant/15 flex flex-col items-center">
                  <span className="text-on-surface-variant text-[10px]">
                    电子点名
                  </span>
                  <span className="font-semibold text-secondary mt-0.5 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">
                      how_to_reg
                    </span>
                    预载42人
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  showToast('已将《古代文人志趣比较赏析》讲评课件预投屏至多媒体西阶一')
                }
                className="py-2 px-3 rounded-lg bg-secondary text-on-secondary font-label-sm text-xs flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 transition-all whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  present_to_all
                </span>
                <span>投屏备课讲义</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  showToast('已开启高二(3)班 42 人人脸与电子胸牌无感签到')
                }
                className="py-2 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs flex items-center justify-center gap-1.5 border border-outline-variant/20 transition-all whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-secondary">
                  checklist
                </span>
                <span>发起课前签到</span>
              </button>
            </div>
          </div>

          {/* Card 2: Swap Class Approval Status */}
          <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-[0_2px_16px_rgba(131,24,67,0.03)] border border-outline-variant/20 flex flex-col gap-2 flex-none">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-sm text-on-surface font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary">
                  swap_horiz
                </span>
                调代课快讯与审批
              </span>
              <button
                type="button"
                onClick={() => setSwapModalOpen(true)}
                className="font-label-sm text-xs text-primary hover:underline cursor-pointer"
              >
                发起新申请
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low/60 border border-outline-variant/15 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-on-surface">
                  与 李老师 (英语组) 课时对调
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-label-sm text-[10px] whitespace-nowrap">
                  教研组长已核准 ✓
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>换出：周五第3节 (语文)</span>
                <span className="material-symbols-outlined text-xs text-outline">
                  trending_flat
                </span>
                <span>换入：周三第4节 (高二3班)</span>
              </div>
              <div className="w-full bg-surface-container-lowest rounded-full h-1.5 overflow-hidden mt-0.5">
                <div className="bg-secondary h-full rounded-full w-full"></div>
              </div>
            </div>
          </div>

          {/* Card 3: Teaching Progress Meter & Memo Notepad */}
          <div className="flex-1 bg-surface-container-lowest rounded-xl p-3.5 shadow-[0_2px_16px_rgba(131,24,67,0.03)] border border-outline-variant/20 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-sm text-on-surface font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-secondary">
                    donut_small
                  </span>
                  本周授课学时进度
                </span>
                <span className="font-label-sm text-xs text-on-surface-variant">
                  已完成 8 / 14 课时
                </span>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-low/60 p-2.5 rounded-lg border border-outline-variant/15">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg
                    className="w-12 h-12 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-surface-container"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.8"
                    ></path>
                    <path
                      className="text-secondary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="57, 100"
                      strokeLinecap="round"
                      strokeWidth="3.8"
                    ></path>
                  </svg>
                  <span className="absolute font-headline-sm text-xs font-bold text-secondary">
                    57%
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">常规正课：</span>
                    <span className="font-semibold text-on-surface">
                      6 节已结
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">培优与答疑：</span>
                    <span className="font-semibold text-on-surface">
                      2 节已结
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">待授课时：</span>
                    <span className="font-bold text-primary">6 节待授</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">
                教研活动备忘
              </span>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-tertiary-fixed/25 border border-tertiary-container/30">
                <span className="material-symbols-outlined text-tertiary text-base mt-0.5 shrink-0">
                  co_present
                </span>
                <div className="min-w-0">
                  <div className="font-headline-sm text-xs text-on-surface font-semibold truncate">
                    周五下午：语文备课组命题研讨
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    主讲：陈铭特级教师 · 15:40 行政楼报告厅
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-gradient-to-r from-primary-fixed/55 via-secondary-fixed/45 to-primary-fixed/35 border border-primary-container/30 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-secondary text-sm">
                  favorite
                </span>
              </div>
              <p className="font-label-sm text-[11px] leading-snug text-on-surface">
                <span className="font-bold text-secondary">樱花备忘：</span>
                明日第2节高二(1)班有教学督导随堂听课，请携带纸质教案手册 🌸
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Lesson Snapshot Modal */}
      {selectedLessonSnapshot && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">
                    menu_book
                  </span>
                </span>
                <div>
                  <span className="text-xs text-secondary font-semibold">
                    {selectedLessonSnapshot.status}
                  </span>
                  <h3 className="font-headline-sm text-base text-on-surface font-bold">
                    {selectedLessonSnapshot.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLessonSnapshot(null)}
                className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">课题内容：</span>
                <span className="font-semibold text-on-surface">
                  {selectedLessonSnapshot.subtitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">授课地点：</span>
                <span className="font-semibold text-primary">
                  {selectedLessonSnapshot.room}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">教案与学情准备：</span>
                <span className="font-semibold text-emerald-700">
                  已关联《统编高中语文必修下》云端课件
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedLessonSnapshot(null);
                  showToast('已打开对应课时导学案与板书投屏预览');
                }}
                className="flex-1 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm text-xs font-semibold cursor-pointer"
              >
                调阅本课教案与名单
              </button>
              <button
                type="button"
                onClick={() => setSelectedLessonSnapshot(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Swap Request Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-base text-on-surface font-bold">
                发起智能避让调代课申请
              </h3>
              <button
                type="button"
                onClick={() => setSwapModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-on-surface-variant block mb-1">
                  拟换出节次
                </span>
                <div className="font-semibold text-on-surface">
                  第 12 周 · 周五 上午第 3-4 节 (高二3班 语文)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-on-surface-variant block mb-1">
                  系统推荐无冲突互换教师
                </span>
                <div className="font-semibold text-secondary">
                  李老师 (英语组) · 周三 下午第 5 节 可平滑对调
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                setSwapModalOpen(false);
                const res = await sakuraApi.schedule.submitCourseSwap({
                  applicantTeacherId: 'fac-lin-zhixia',
                  targetTeacherName: '李老师 (英语组)',
                  sourcePeriodDesc: '周五 上午第 3-4 节',
                  targetPeriodDesc: '周三 下午第 5 节',
                  reason: '教研活动调课',
                });
                showToast(res.message);
              }}
              className="w-full py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-xs font-semibold cursor-pointer"
            >
              确认提交调课申请
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
