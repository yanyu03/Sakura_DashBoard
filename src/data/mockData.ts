import {
  ParentChatThread,
  StudentAcademicProfile,
  StudentSubmission,
} from '../types/sakura';

/**
 * 基准参考数据集（每个核心功能区保留 1 组标准基准数据，与本地 SQLite 初始种子库同步）
 */
export const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'su-xiaomeng',
    name: '苏小萌',
    avatarChar: '萌',
    studentNo: '20230104',
    className: '高二(1)班',
    score: 98,
    questionScore: 24.5,
    questionMaxScore: 25,
    status: 'graded',
    statusBadge: '班级标杆卷',
    isModelEssay: true,
    submitTime: '今天 11:24 提交',
    neatness: 'A+',
    excerpt: '“物与我皆无尽也，此乃通达宇宙之旷达胸襟……”',
    stamp: '妙笔生花',
    paragraph1: {
      prefix:
        '苏轼在此处通过水与月之喻，构建起辩证的时空观。从变的角度审视，“天地曾不能以一瞬”；但若自其不变者而观之，',
      highlight: '“则物与我皆无尽也”',
      note: '引用精准，点睛之笔！',
      suffix:
        '。客之悲伤，源于执着于个体生命的“须臾”与长江的“无穷”这一绝对对立；而苏轼跳脱出世俗的得失计算，将生命归还于自然之化境。',
    },
    paragraph2: {
      prefix:
        '在哲学立意上，苏子外表托庇于老庄的“齐万物”、“同生死”，任凭轻舟泛于浩渺江海；',
      highlight: '然其精神内核终未归于绝望的虚无',
      note: '✎ “然”字承转突兀，建议加“实则”增强逻辑层递',
      suffix:
        '，而是以儒者的经世柔情，在黄州贬谪的困顿中完成了对日常烟火（山间明月、江上清风）的虔诚拥抱。这种“自适”不仅是解脱，更是对生命的极致肯定。',
    },
    audioNote: {
      duration: '00:38',
      transcript: '“小萌，这段儒道合流的解读非常有深度，文风雅致……”',
      reviewer: '林知夏',
      reviewTime: '2024-05-16 11:32',
    },
    aiDiagnostic: {
      rate: '98% (极优)',
      strengthTitle: '亮点萃取：思维深刻性与词藻',
      strengthDesc:
        '准确提炼老庄“齐物”与儒家“仁爱”在贬谪文学中的互渗，论证结构自成严密体系。',
      tipTitle: '提分锦囊：逻辑连词优化',
      tipDesc:
        '第二段文意转折可引用苏轼《定风波》互证，拓展纵深空间，已生成强化微课卡片。',
      recommendedPractice: '《前赤壁赋》与《后赤壁赋》心境对勘 3道题',
    },
  },
];

export const STUDENT_PROFILES: StudentAcademicProfile[] = [
  {
    id: 'su-xiaomeng',
    name: '苏小萌',
    studentNo: '20230104',
    shortNo: '04',
    className: '高二 (1) 班',
    role: '语文课代表',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCFxcqJe5BjtbtjGODcqz2rPJsxunDnbdYllTYS-EuPMj5DAlTsqRX6RrqOnbimB1_KMMjxkch23Lz9lhuMJuLlf80E16jmqn9th4zCdrTITpOlqabRsT3oLtTXzXm55jSg9ewMd1RXlHHst2drVfPC-xD9I274OkGhYDlDdw3QdzRt_ArmRfw3Z1YcXyU5dln4zyusDxjZvDd-1r7oj2ROeIwrnBoxLX4jxsH7DAAdFu5Mhm8H0Q',
    avatarChar: '萌',
    badgeText: '✨ 优选标杆',
    badgeType: 'preferred',
    tagCategory: 'focus',
    rankBadge: 'Top 1',
    trendText: '年级前5%',
    trendDir: 'up',
    dailyStatus: '今日状态：晨读全勤 · 活跃',
    bio: '文风温润细腻，文言古文领悟透彻，课堂专注度满格。近期正在开展先秦诸子拓展阅读。',
    sakuraMedals: [
      { icon: '🌱', label: '晨读领航之星', style: 'primary' },
      { icon: '🏅', label: '全勤月度标兵', style: 'secondary' },
      { icon: '📝', label: '笔耕不辍金奖', style: 'tertiary' },
    ],
    radarScores: {
      classical: 98,
      modern: 95,
      writing: 96,
      poetry: 94,
      basics: 92,
      overall: 96.2,
    },
    strengthModule: '文言实词 / 散文意境',
    potentialModule: '议论文论据厚度',
    examTrajectory: {
      rankChange: '排位: 18 ➔ 1名',
      points: [
        { exam: '第1次月考', score: 118 },
        { exam: '期中大考', score: 124 },
        { exam: '第2次月考', score: 129 },
        { exam: '最新联考', score: 136 },
      ],
      summary: '稳居年级领跑第一梯队',
      expectation: '超高标准期望',
    },
    presenceMetrics: {
      attendance: '100% 考勤全满',
      attendanceSub: '零迟到 · 零缺席记录',
      interaction: '98% 课堂互动',
      interactionSub: '深度探究主动发言 14次/周',
      quizSpeed: '随堂速测 No.1',
      quizSpeedSub: '答题均速提前8分钟交卷',
    },
    coachingJournals: [
      {
        id: 'j1',
        dateTitle: '4月10日 · 课后个别指导',
        tag: '深度研讨',
        content:
          '针对《古文观止》选篇探讨了先秦散文的设喻说理方式。苏小萌对《雷雨》戏剧中周朴园的人物双重性格挖掘极有洞察力，鼓励其投稿校刊文学专栏。',
        teacher: '林知夏 老师',
        statusText: '已下发建议书签',
      },
    ],
    parentMessages: [
      {
        id: 'pm1',
        sender: 'parent',
        senderLabel: '母',
        text: '林老师您好！小萌回家说您推荐的《古文观止》选本特别好看，孩子每天睡前都在读。另外她想报名本周末的国学演讲，不知您觉得合适吗？',
        time: '昨天 20:14',
      },
      {
        id: 'pm2',
        sender: 'teacher',
        senderLabel: '师',
        text: '特别合适！小萌台风稳健、吐字清澈，我已经帮她勾选了推荐名额，明后天午休我帮她把一把演讲稿的节奏~',
        time: '昨天 21:05 · 已读',
      },
    ],
    parentName: '苏小萌妈妈 (已实名互联)',
    careKitTitle: '精准培优强化包已生成',
    careKitSub: '包含：《思辨性议论文结构点拨》等拓展讲义',
  },
];

export const PARENT_CHAT_THREADS: ParentChatThread[] = [
  {
    id: 'thread-su',
    parentName: '苏小萌妈妈',
    studentName: '苏小萌',
    className: '高二(1)班',
    roleTag: '课代表家长',
    avatarChar: '苏',
    unreadCount: 1,
    category: 'unread',
    lastTime: '08:42',
    lastMessage: '收到老师推荐的书单，小萌每天都在认真读~',
    studentRank: '班级综合排位 No.1',
    intimacyScore: 98,
    motherInfo: {
      name: '母亲 · 赵静雅',
      title: '大学副教授 (中文系)',
      phone: '138****6621',
    },
    fatherInfo: {
      name: '父亲 · 苏明哲',
      title: '科技园架构顾问',
      phone: '139****9018',
    },
    stats: { visits: 2, chats: 18, medals: 5 },
    messages: [
      {
        id: 'm1',
        sender: 'parent',
        senderName: '苏小萌妈妈',
        time: '08:35',
        content:
          '林老师您好！小萌回家说您推荐的《古文观止》精编选本特别好看，孩子每天睡前都在津津有味地读。📖 另外她一直想报名参加本周末的「全市中学生国学演讲大赛」，不知您从老师的角度看合适吗？',
      },
      {
        id: 'm2',
        sender: 'teacher',
        senderName: '林知夏 老师',
        time: '08:40',
        content:
          '特别合适！小萌台风稳健、吐字清澈，文学底蕴也相当扎实。我已经直接帮她勾选了高二年级的首批校级推荐名额。明后天中午午休时间，我会抽空帮她把一把演讲稿的立意和情感节奏~',
        medalAttached: {
          title: '已赠送：【演讲之星】鼓励勋章',
          subtitle: '将在苏小萌成长主页同步点亮',
        },
      },
    ],
  },
];
