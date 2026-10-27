export type AppShell = 'auth' | 'workspace' | 'knowledge-base';

export type WorkspaceTab =
  | 'dashboard-overview'
  | 'schedule-management'
  | 'student-profiles'
  | 'homework-center'
  | 'lesson-plans'
  | 'exam-analytics'
  | 'school-home-communication';

export interface StudentSubmission {
  id: string;
  name: string;
  avatarChar: string;
  avatarUrl?: string;
  studentNo: string;
  className: string;
  score: number | null;
  questionScore: number;
  questionMaxScore: number;
  status: 'graded' | 'ai-pregraded' | 'needs-correction' | 'pending';
  statusBadge: string;
  isModelEssay?: boolean;
  submitTime: string;
  neatness: string;
  excerpt: string;
  stamp?: '妙笔生花' | '见解独到' | null;
  paragraph1: {
    prefix: string;
    highlight: string;
    note: string;
    suffix: string;
  };
  paragraph2: {
    prefix: string;
    highlight: string;
    note: string;
    suffix: string;
  };
  audioNote: {
    duration: string;
    transcript: string;
    reviewer: string;
    reviewTime: string;
  };
  aiDiagnostic: {
    rate: string;
    strengthTitle: string;
    strengthDesc: string;
    tipTitle: string;
    tipDesc: string;
    recommendedPractice: string;
  };
}

export interface StudentAcademicProfile {
  id: string;
  name: string;
  studentNo: string;
  shortNo: string;
  className: string;
  role: string;
  avatarUrl?: string;
  avatarChar: string;
  badgeText: string;
  badgeType: 'preferred' | 'warning' | 'progress' | 'leave' | 'normal';
  tagCategory: 'focus' | 'progress' | 'coaching' | 'competition' | 'care';
  rankBadge: string;
  trendText: string;
  trendDir: 'up' | 'down' | 'flat';
  dailyStatus: string;
  bio: string;
  sakuraMedals: { icon: string; label: string; style: 'primary' | 'secondary' | 'tertiary' }[];
  radarScores: {
    classical: number; // 文言理解
    modern: number;    // 现代主旨
    writing: number;   // 写作立意
    poetry: number;    // 诗词鉴赏
    basics: number;    // 基础字词
    overall: number;
  };
  strengthModule: string;
  potentialModule: string;
  examTrajectory: {
    rankChange: string;
    points: { exam: string; score: number }[];
    summary: string;
    expectation: string;
  };
  presenceMetrics: {
    attendance: string;
    attendanceSub: string;
    interaction: string;
    interactionSub: string;
    quizSpeed: string;
    quizSpeedSub: string;
  };
  coachingJournals: {
    id: string;
    dateTitle: string;
    tag: string;
    content: string;
    teacher: string;
    statusText?: string;
  }[];
  parentMessages: {
    id: string;
    sender: 'parent' | 'teacher';
    senderLabel: string;
    text: string;
    time: string;
  }[];
  parentName: string;
  careKitTitle: string;
  careKitSub: string;
}

export interface ParentChatThread {
  topicTag?: string;
  id: string;
  parentName: string;
  studentName: string;
  className: string;
  roleTag: string;
  avatarChar: string;
  isOfficialChannel?: boolean;
  unreadCount: number;
  category: 'all' | 'unread' | 'praise' | 'visit';
  lastTime: string;
  lastMessage: string;
  studentRank: string;
  intimacyScore: number;
  motherInfo: { name: string; title: string; phone: string };
  fatherInfo: { name: string; title: string; phone: string };
  stats: { visits: number; chats: number; medals: number };
  messages: {
    id: string;
    sender: 'parent' | 'teacher';
    senderName: string;
    time: string;
    content: string;
    medalAttached?: { title: string; subtitle: string };
  }[];
}

/**
 * 预留的 AI 教研大模型接口契约 (先留接口，不写配置)
 */
export interface SakuraAIConfig {
  endpoint?: string;
  modelAlias?: string;
  enabled?: boolean;
}

export interface EssayDiagnosticRequest {
  assignmentId: string;
  studentId: string;
  essayContent: string;
  rubricMaxScore: number;
}

export interface EssayDiagnosticResponse {
  suggestedScore: number;
  overallRate: string;
  strengthTitle: string;
  strengthDetail: string;
  improvementTitle: string;
  improvementDetail: string;
  recommendedPractice: string;
}

export interface LessonCopilotRequest {
  unitTitle: string;
  prompt: string;
  gradeLevel?: string;
}

export interface LessonCopilotResponse {
  title: string;
  highlightText: string;
  summary: string;
  tags: string[];
  generatedAt: string;
}
