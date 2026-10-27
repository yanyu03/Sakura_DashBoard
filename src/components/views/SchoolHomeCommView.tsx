import React, { useEffect, useState } from 'react';
import { PARENT_CHAT_THREADS } from '../../data/mockData';
import { sakuraApi } from '../../services/sakuraApiService';
import { ParentChatThread } from '../../types/sakura';

interface SchoolHomeCommViewProps {
  showToast: (msg: string) => void;
  onNavigateToStudentProfile?: () => void;
}

export const SchoolHomeCommView: React.FC<SchoolHomeCommViewProps> = ({
  showToast,
  onNavigateToStudentProfile,
}) => {
  const [threads, setThreads] =
    useState<ParentChatThread[]>(PARENT_CHAT_THREADS);
  const [activeChannel, setActiveChannel] = useState<'c1' | 'c2' | 'c3'>('c1');
  const [selectedThreadId, setSelectedThreadId] = useState<string>('thread-su');
  const [tabFilter, setTabFilter] = useState<
    'all' | 'unread' | 'praise' | 'visit'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [momentLikes, setMomentLikes] = useState(42);
  const [momentLiked, setMomentLiked] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'threads' | 'chat' | 'family'>('chat');
  const [todos, setTodos] = useState([
    {
      id: 't1',
      icon: 'schedule',
      color: 'text-primary',
      title: '周五 16:30 阶段学习与国学演讲比赛电话沟通',
      badge: '待执行',
      badgeStyle: 'bg-primary-fixed text-on-primary-fixed-variant',
      desc: '对象：苏小萌妈妈 · 针对国学演讲大赛初稿试讲及参赛安排',
    },
  ]);

  useEffect(() => {
    sakuraApi.comm.getThreads().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setThreads(res.data);
        setSelectedThreadId(res.data[0].id);
      }
    });
  }, []);

  const activeThread =
    threads.find((t) => t.id === selectedThreadId) || threads[0];

  const filteredThreads = threads.filter((t) => {
    if (tabFilter === 'unread' && t.unreadCount === 0) return false;
    if (tabFilter === 'praise' && t.category !== 'praise') return false;
    if (tabFilter === 'visit' && t.category !== 'visit') return false;
    if (
      searchQuery.trim() &&
      !t.parentName.includes(searchQuery.trim()) &&
      !t.studentName.includes(searchQuery.trim())
    ) {
      return false;
    }
    return true;
  });

  const handleSendMessage = async (customText?: string, withMedal?: boolean) => {
    const content = (customText ?? replyText).trim();
    if (!content) {
      showToast('请输入给家长的温馨回复内容');
      return;
    }
    const res = await sakuraApi.comm.sendParentMessage({
      threadId: activeThread.id,
      content,
      withSakuraMedal: withMedal,
    });
    const newMsg = {
      id: res.data.messageId,
      sender: 'teacher' as const,
      senderName: '林知夏 老师',
      time: res.data.sentTime,
      content,
      ...(withMedal
        ? {
            medalAttached: {
              title: '已赠送：【樱花飞扬·笃学之星】鼓励勋章',
              subtitle: `将在 ${activeThread.studentName} 成长主页同步点亮`,
            },
          }
        : {}),
    };
    setThreads((prev) =>
      prev.map((item) =>
        item.id === activeThread.id
          ? {
              ...item,
              unreadCount: 0,
              lastTime: '刚刚',
              lastMessage: content,
              messages: [...item.messages, newMsg],
            }
          : item
      )
    );
    if (!customText) setReplyText('');
    showToast(`已向 ${activeThread.parentName} 发送家校协同消息 🌸`);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto lg:overflow-hidden">
      {/* 顶部沟通管控综合栏 */}
      <header className="flex-none px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/20 z-20">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          {/* 班级频道切换 */}
          <div className="flex items-center p-1 bg-surface-container-low rounded-lg border border-outline-variant/15 gap-1">
            {[
              { id: 'c1', icon: 'groups', label: '高二(1)班 家长会互动群' },
              { id: 'c2', icon: 'forum', label: '高二(3)班 语文答疑圈' },
              {
                id: 'c3',
                icon: 'volunteer_activism',
                label: '家校协同委员会',
              },
            ].map((ch) => {
              const active = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setActiveChannel(ch.id as typeof activeChannel);
                    showToast(`已切换至「${ch.label}」`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label-sm text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {ch.icon}
                  </span>
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>

          {/* 状态微标签群 */}
          <div className="hidden 2xl:flex items-center gap-2 whitespace-nowrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-on-secondary-container font-label-sm text-xs">
              <span className="material-symbols-outlined text-secondary text-sm">
                verified_user
              </span>
              45户已实名认证
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-xs font-semibold">
              <span className="material-symbols-outlined text-primary text-sm">
                mark_chat_unread
              </span>
              待回复 3 条
            </span>
          </div>
        </div>

        {/* 顶部快捷动作组 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              showToast('已打开发布班级通知与期中表彰喜报模板编辑器')
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs border border-outline-variant/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-secondary text-base">
              campaign
            </span>
            <span>发布班级通知</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('已发起本周五晚 19:30 高二(1)班春季线上家长会预约回执')
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs border border-outline-variant/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-base">
              videocam
            </span>
            <span>预约线上家长会</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('已向全班 45 户家庭批量派发《第12周樱花成长电子相册》🌸')
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs hover:bg-secondary-fixed-dim transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-secondary text-base">
              auto_awesome
            </span>
            <span>成长电子相册</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('已生成并发送《高二(1)班第12周温情周总结家校信》')
            }
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-xs font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-primary text-base">
              mail
            </span>
            <span>发送周总结信</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Panel Switcher (Visible on < lg) */}
      <div className="lg:hidden grid grid-cols-3 gap-1.5 bg-surface-container-lowest p-1.5 mx-3 mt-2 rounded-xl border border-outline-variant/20 flex-none">
        {[
          { id: 'threads', icon: 'forum', label: `会话列表 (${filteredThreads.length})` },
          { id: 'chat', icon: 'chat', label: `对话：${activeThread.parentName}` },
          { id: 'family', icon: 'family_restroom', label: '家庭画像与待办' },
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

      {/* 主体工作台：三栏式沉浸式协同通讯体系 */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden p-3 sm:p-4 gap-3 bg-background">
        {/* 【左侧栏 (26%)：家校消息流与分类列表】 */}
        <section
          className={`${
            mobilePanel === 'threads' ? 'flex' : 'hidden lg:flex'
          } w-full lg:w-[26%] lg:h-full flex-col bg-surface-container-lowest rounded-xl shadow-[0_2px_16px_rgba(131,24,67,0.04)] border border-outline-variant/20 overflow-hidden`}
        >
          <div className="p-space-md pb-space-sm flex flex-col gap-space-sm flex-none">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-space-md text-on-surface-variant text-lg">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-space-md py-2 rounded-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                placeholder="搜索家长姓名、学生或聊天记录..."
                type="text"
              />
            </div>

            <div className="flex items-center justify-between p-1 bg-surface-container-low rounded-full">
              <button
                type="button"
                onClick={() => setTabFilter('all')}
                className={`flex-1 py-1.5 rounded-full font-label-sm text-label-sm text-center transition-all cursor-pointer ${
                  tabFilter === 'all'
                    ? 'bg-surface-container-lowest text-on-surface shadow-[0_1px_4px_rgba(131,24,67,0.06)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                全部私信
              </button>
              <button
                type="button"
                onClick={() => setTabFilter('unread')}
                className={`flex-1 py-1.5 rounded-full font-label-sm text-label-sm text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  tabFilter === 'unread'
                    ? 'bg-surface-container-lowest text-secondary font-semibold shadow-xs'
                    : 'text-secondary font-semibold hover:text-on-surface'
                }`}
              >
                <span>待办/未读</span>
                <span className="w-4 h-4 rounded-full bg-secondary text-on-secondary text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTabFilter('praise')}
                className={`flex-1 py-1.5 rounded-full font-label-sm text-label-sm text-center transition-all cursor-pointer ${
                  tabFilter === 'praise'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                喜报表彰
              </button>
              <button
                type="button"
                onClick={() => setTabFilter('visit')}
                className={`flex-1 py-1.5 rounded-full font-label-sm text-label-sm text-center transition-all cursor-pointer ${
                  tabFilter === 'visit'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                家访备忘
              </button>
            </div>
          </div>

          {/* 消息列表滚动区 */}
          <div className="flex-1 overflow-y-auto px-space-sm space-y-2 pb-space-md">
            {filteredThreads.map((thread) => {
              const active = thread.id === activeThread.id;
              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setSelectedThreadId(thread.id);
                    setMobilePanel('chat');
                  }}
                  className={`p-space-md rounded-2xl cursor-pointer transition-all ${
                    active
                      ? 'bg-surface-container-high shadow-[0_2px_12px_rgba(131,24,67,0.06)]'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start gap-space-sm">
                    <div className="relative flex-none">
                      {thread.isOfficialChannel ? (
                        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline-sm text-headline-sm flex-none">
                          <span className="material-symbols-outlined text-2xl">
                            campaign
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-sm text-headline-sm ${
                            active
                              ? 'bg-secondary-fixed shadow-inner text-on-secondary-fixed'
                              : thread.id === 'thread-lin'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : 'bg-surface-container text-primary'
                          }`}
                        >
                          {thread.avatarChar}
                        </div>
                      )}
                      {thread.unreadCount > 0 && (
                        <span
                          className={`absolute -top-0.5 -right-0.5 rounded-full ${
                            thread.id === 'thread-su'
                              ? 'w-3.5 h-3.5 bg-error border-2 border-surface-container-lowest'
                              : 'w-3 h-3 bg-secondary-container'
                          }`}
                        ></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm text-body-md text-on-surface truncate font-semibold">
                          {thread.parentName}
                        </span>
                        <span
                          className={`font-label-sm text-label-sm ${
                            active
                              ? 'text-primary font-bold'
                              : 'text-on-surface-variant/70'
                          }`}
                        >
                          {thread.lastTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {!thread.isOfficialChannel && (
                          <span
                            className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] leading-tight ${
                              active
                                ? 'bg-surface-container-lowest text-secondary font-medium'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {thread.className}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] leading-tight ${
                            active
                              ? 'bg-primary-fixed text-on-primary-fixed-variant'
                              : thread.id === 'thread-lin'
                              ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                              : 'bg-surface-container-low text-secondary'
                          }`}
                        >
                          {thread.roleTag}
                        </span>
                      </div>
                      <p
                        className={`font-body-sm text-body-sm mt-2 truncate ${
                          active ? 'text-on-surface' : 'text-on-surface-variant'
                        }`}
                      >
                        {thread.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 【中央栏 (44%)：当前私信会话与协同看板】 */}
        <section
          className={`${
            mobilePanel === 'chat' ? 'flex' : 'hidden lg:flex'
          } flex-1 lg:h-full flex-col bg-surface-container-lowest rounded-xl shadow-[0_2px_16px_rgba(131,24,67,0.04)] border border-outline-variant/20 overflow-hidden min-h-[480px] lg:min-h-0`}
        >
          {/* 顶部当前对话对象档案条 */}
          <div className="h-20 px-gutter flex-none flex items-center justify-between bg-surface-container-lowest border-b-0 shadow-[0_1px_8px_rgba(131,24,67,0.03)]">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant font-headline-sm text-headline-sm shadow-[0_2px_8px_rgba(143,73,83,0.15)]">
                {activeThread.avatarChar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {activeThread.parentName}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-sm">
                      verified
                    </span>
                    家校互联官方认证
                  </span>
                </div>
                <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                  <span>
                    在校学生:{' '}
                    <strong className="text-on-surface font-semibold">
                      {activeThread.studentName}
                    </strong>{' '}
                    ({activeThread.className})
                  </span>
                  <span>·</span>
                  <span className="text-secondary font-medium">
                    {activeThread.roleTag}
                  </span>
                  <span>·</span>
                  <span className="text-primary font-medium">
                    {activeThread.studentRank}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={() =>
                  showToast(
                    `正在通过校园隐私保护专线呼叫 ${activeThread.parentName}...`
                  )
                }
                className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-secondary transition-all cursor-pointer"
                title="电话直连 (加密专线)"
              >
                <span className="material-symbols-outlined text-xl">
                  phone_in_talk
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  showToast(`已向 ${activeThread.parentName} 发起线上微视频家访邀请`)
                }
                className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-secondary transition-all cursor-pointer"
                title="发起双人微视频辅导"
              >
                <span className="material-symbols-outlined text-xl">
                  video_call
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`正在调阅 ${activeThread.studentName} 的 360° 全景学情档案`);
                  onNavigateToStudentProfile?.();
                }}
                className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-all cursor-pointer"
                title="调阅个人学情总览"
              >
                <span className="material-symbols-outlined text-xl">
                  assignment_ind
                </span>
              </button>
            </div>
          </div>

          {/* 聊天消息流区域 */}
          <div className="flex-1 overflow-y-auto p-gutter space-y-5 bg-surface/50">
            <div className="flex items-center justify-center">
              <span className="px-space-md py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                今天 08:35
              </span>
            </div>

            {activeThread.messages.map((msg) =>
              msg.sender === 'parent' ? (
                <div
                  key={msg.id}
                  className="flex items-start gap-space-sm max-w-[85%]"
                >
                  <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary font-label-md text-label-md flex-none shadow-sm">
                    家
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {msg.senderName} · {msg.time}
                    </span>
                    <div className="p-space-md rounded-2xl rounded-tl-xs bg-surface-container-lowest text-on-surface shadow-[0_2px_12px_rgba(131,24,67,0.04)] font-body-md text-body-md leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className="flex items-start gap-space-sm max-w-[85%] ml-auto flex-row-reverse"
                >
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-md text-label-md flex-none shadow-sm">
                    林
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {msg.senderName} · {msg.time}
                    </span>
                    <div className="p-space-md rounded-2xl rounded-tr-xs bg-primary text-on-primary shadow-[0_4px_16px_rgba(143,73,83,0.22)] font-body-md text-body-md leading-relaxed">
                      {msg.content}
                    </div>
                    {msg.medalAttached && (
                      <div className="flex items-center gap-space-sm px-space-md py-2 rounded-xl bg-surface-container-high text-on-surface shadow-sm mt-1">
                        <span className="material-symbols-outlined text-secondary text-2xl">
                          local_florist
                        </span>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-label-md font-bold text-secondary">
                            {msg.medalAttached.title}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {msg.medalAttached.subtitle}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* 底部富文本沟通输入舱与智能扩展工具 */}
          <div className="p-space-md bg-surface-container-lowest shadow-[0_-4px_20px_rgba(131,24,67,0.03)] flex-none flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs pb-1">
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `已为您附送 ${activeThread.studentName} 本周《赤壁赋》主观题答卷诊断与五维能力雷达切片报告 📊`
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary font-label-sm text-label-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  pie_chart
                </span>
                <span>学情报告切片</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `孩子近期课堂专注度与文学思辨表现极佳，特颁发一枚樱花表扬勋章！🌸`,
                    true
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary font-label-sm text-label-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  military_tech
                </span>
                <span>发放鼓励樱花勋章</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  showToast(`已向 ${activeThread.parentName} 发送周五放学后 17:30 校园接待室面谈预约卡`)
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary font-label-sm text-label-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  event_upcoming
                </span>
                <span>预约放学后面谈</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `已向您发送《古文观止·高二春季拓展晨读选编 PDF》，供孩子周末自主品读 📖`
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary font-label-sm text-label-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  attachment
                </span>
                <span>发送课后拓展讲义</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setReplyText(
                    '感谢家长的悉心配合！孩子的点滴进步离不开我们家校同心同行，明天早读我再来听孩子试讲初稿~ 🌸'
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm ml-auto transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  sentiment_satisfied
                </span>
                <span>常用温情寄语</span>
              </button>
            </div>

            <div className="relative flex items-end bg-surface-container-low rounded-2xl p-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-transparent border-0 px-space-sm py-1 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none resize-none"
                placeholder="在此输入给家长的温馨回复，按 Enter 键快速发送（支持粘贴学生图文作业批语）..."
                rows={2}
              ></textarea>
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="h-10 px-space-md rounded-full bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-[0_2px_8px_rgba(143,73,83,0.3)] transition-all cursor-pointer"
              >
                <span>发送</span>
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-on-surface-variant/70 font-label-sm text-[12px] px-1 pt-1">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-secondary">
                  bedtime
                </span>
                <span>
                  已开启家校防打扰模式：非工作时段将自动转入温馨留言箱，保障教师静心研课
                </span>
              </div>
              <span>支持 Markdown 文本格式</span>
            </div>
          </div>
        </section>

        {/* 【右侧栏 (30%)：学生家庭档案与家校共育记录簿】 */}
        <section
          className={`${
            mobilePanel === 'family' ? 'flex' : 'hidden lg:flex'
          } w-full lg:w-[30%] lg:h-full flex-col gap-3 lg:overflow-y-auto`}
        >
          {/* 学生及家庭全景画像卡片 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_20px_rgba(131,24,67,0.04)] flex flex-col gap-space-sm flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-xl">
                  family_restroom
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  家庭画像与亲密度
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm font-semibold">
                亲密度 {activeThread.intimacyScore}/100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-space-xs mt-1">
              <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {activeThread.motherInfo.name}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium mt-0.5">
                  {activeThread.motherInfo.title}
                </span>
                <span className="font-label-sm text-label-sm text-secondary mt-1">
                  {activeThread.motherInfo.phone}
                </span>
              </div>
              <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {activeThread.fatherInfo.name}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium mt-0.5">
                  {activeThread.fatherInfo.title}
                </span>
                <span className="font-label-sm text-label-sm text-secondary mt-1">
                  {activeThread.fatherInfo.phone}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-surface-container">
                <span className="font-headline-md text-headline-md text-primary font-bold block">
                  {activeThread.stats.visits} 次
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  教师深入面访
                </span>
              </div>
              <div className="p-2 rounded-xl bg-secondary-fixed">
                <span className="font-headline-md text-headline-md text-secondary font-bold block">
                  {activeThread.stats.chats} 次
                </span>
                <span className="font-label-sm text-label-sm text-on-secondary-fixed-variant">
                  即时家校互通
                </span>
              </div>
              <div className="p-2 rounded-xl bg-surface-container-high">
                <span className="font-headline-md text-headline-md text-on-surface font-bold block">
                  {activeThread.stats.medals} 枚
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-medium">
                  累计表彰勋章
                </span>
              </div>
            </div>
          </div>

          {/* 近期重要家校待办 & 访谈手账 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_20px_rgba(131,24,67,0.04)] flex flex-col gap-space-sm flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-xl">
                  event_note
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  家访手账 &amp; 重点待办
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTodos((prev) => [
                    ...prev,
                    {
                      id: `t-${Date.now()}`,
                      icon: 'verified',
                      color: 'text-secondary',
                      title: '周六 10:00 国学演讲大赛赛前鼓励电访',
                      badge: '新增待办',
                      badgeStyle: 'bg-primary-fixed text-on-primary-fixed-variant',
                      desc: '对象：苏小萌家长 · 确认比赛出场顺序与礼服准备',
                    },
                  ]);
                  showToast('已新增一条家访手账待办提醒 🌸');
                }}
                className="text-secondary font-label-sm text-label-sm hover:underline flex items-center cursor-pointer"
              >
                <span>+ 新增待办</span>
              </button>
            </div>
            <div className="space-y-2 mt-1">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => showToast(`已标记待办事项「${todo.title}」`)}
                  className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-xs cursor-pointer hover:bg-surface-container transition-colors"
                >
                  <span
                    className={`material-symbols-outlined ${todo.color} text-lg mt-0.5 flex-none`}
                  >
                    {todo.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-body-sm text-on-surface font-semibold truncate">
                        {todo.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] ${todo.badgeStyle}`}
                      >
                        {todo.badge}
                      </span>
                    </div>
                    <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                      {todo.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 班级家校温情相册墙 & 班级圈瞬间 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_20px_rgba(131,24,67,0.04)] flex flex-col gap-space-sm flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-xl">
                  auto_stories
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  班级温情互动圈
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                共 24 条家长热评
              </span>
            </div>
            <div className="space-y-3 mt-1 overflow-y-auto pr-1">
              {/* 动态 1 */}
              <div className="p-space-sm rounded-2xl bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed text-xs font-bold">
                    班
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    春季戏剧节汇演现场展播
                  </span>
                  <span className="text-on-surface-variant font-label-sm text-xs ml-auto">
                    昨天 17:30
                  </span>
                </div>
                <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-sm">
                  <img
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    alt="戏剧《兰亭集序》彩排瞬间"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2Uvex_QCElSSqAAj-R9pSMfG4xBCZB6lfx9ocD7gY11-Kk3TPWc46j1uYmnY43mJUKV_l1FHUxHlHMib2FUO8VM-fXm1MmAS9c9Lflw_Z5H4Qb4bFc1gOiV_zXg2IJWkHRZTfoZyRDbpq9J0KZjFTDDsAlPDgGyqSLI1PYuVsu_obROYXoPN-GFHZKVu-EkAgodnJb0hInxRQHlNjB-1KUaseoN6OhnspjyRSmGNr2Oxef4B0ww"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-inverse-surface/75 text-inverse-on-surface font-label-sm text-[11px] backdrop-blur-sm">
                    戏剧《兰亭集序》彩排瞬间
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMomentLiked(!momentLiked);
                      setMomentLikes((c) => (momentLiked ? c - 1 : c + 1));
                    }}
                    className="text-secondary font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      favorite
                    </span>
                    {momentLikes}位家长已暖心点赞
                  </button>
                  <span className="text-on-surface-variant">
                    “孩子们演得真传神！”等 8 条新评论
                  </span>
                </div>
              </div>

              {/* 动态 2 */}
              <div className="p-space-sm rounded-2xl bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold">
                    诵
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    今日晨读古典诗词优胜小组
                  </span>
                  <span className="text-on-surface-variant font-label-sm text-xs ml-auto">
                    今早 08:10
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface leading-snug px-1">
                  第一大组以整齐洪亮的《归去来兮辞》吟诵赢得今日班级之星，小萌、子涵配合领读超赞！✨
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
