import { useEffect, useRef, useState } from 'react';
import { AWESOME_DESIGN_THEMES, type UiThemeId } from '../data/awesomeDesignTheme';

/** Isolated fixture: exercises the actual standard classes without business writes. */
export default function DesignStandardPreview() {
  const [theme, setTheme] = useState<UiThemeId>('sakura-milk');
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(true);
  const [state, setState] = useState<'entering' | 'entered' | 'leaving'>('entered');
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => setBusy(false), 1500);
    return () => window.clearTimeout(timer);
  }, [busy]);

  useEffect(() => {
    if (!visible || state === 'entered') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      if (state === 'leaving') setVisible(false);
      else setState('entered');
    }, reduced ? 0 : state === 'leaving' ? 180 : 260);
    return () => window.clearTimeout(timer);
  }, [visible, state]);

  function togglePanel() {
    if (visible) {
      trigger.current?.focus();
      setState('leaving');
    } else {
      setState('entering');
      setVisible(true);
    }
  }

  return (
    <div data-design-standard="1.0Sakura" data-theme={theme} className="h-dvh overflow-y-auto bg-background text-on-surface p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold">Sakura · 组件与动效预览</h1><p className="text-sm text-on-surface-variant">1.0Sakura</p></div>
          <label className="flex items-center gap-2">主题
            <select aria-label="预览主题" className="sakura-input" value={theme} onChange={event => setTheme(event.target.value as UiThemeId)}>
              {AWESOME_DESIGN_THEMES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        </header>
        <section className="sakura-card gap-4">
          <h2 className="sakura-card-title">操作与输入</h2>
          <div className="flex flex-wrap gap-3">
            <button className="sakura-btn sakura-btn-primary" type="button" disabled={busy} aria-busy={busy} onClick={() => setBusy(true)}>
              {busy ? <span className="sakura-spinner" aria-hidden="true" /> : null}
              {busy ? '正在保存' : '演示加载'}
            </button>
            <button className="sakura-btn sakura-btn-secondary" type="button">辅助操作</button>
            <button className="sakura-btn sakura-btn-ghost" type="button">行内操作</button>
            <button className="sakura-btn sakura-btn-primary" type="button" disabled>暂不可用</button>
          </div>
          <p role="status" className="text-sm">{busy ? '正在保存，请稍候。' : '等待操作'}</p>
          <label className="space-y-2">教案标题<input className="sakura-input block" placeholder="输入教学任务标题" /></label>
          <label className="space-y-2">验证示例<input className="sakura-input block" aria-invalid="true" aria-describedby="preview-error" defaultValue="标题过短" /></label>
          <p id="preview-error" className="text-sm text-error">请补充完整的教学任务标题。</p>
          <div className="flex flex-wrap gap-2">
            <span className="sakura-badge sakura-badge-primary">教学任务</span>
            <span className="sakura-badge sakura-badge-success">已完成</span>
            <span className="sakura-badge sakura-badge-warning">待确认</span>
            <span className="sakura-badge sakura-badge-danger">需关注</span>
          </div>
        </section>
        <section className="sakura-card gap-4">
          <h2 className="sakura-card-title">内容进出场</h2>
          <button ref={trigger} className="sakura-btn sakura-btn-secondary self-start" type="button" onClick={togglePanel} disabled={visible && state === 'leaving'}>{visible ? '收起任务' : '显示任务'}</button>
          {visible ? <div className="sakura-motion sakura-motion-rise" data-state={state} inert={state === 'leaving'} onAnimationEnd={event => {
            if (event.target !== event.currentTarget) return;
            if (state === 'leaving') setVisible(false);
            else setState('entered');
          }}><article className="sakura-card"><h3 className="sakura-card-title">教学任务已就绪</h3><p>进入与退出只改变透明度和小幅位移。</p></article></div> : null}
        </section>
        <section className="sakura-card gap-4">
          <h2 className="sakura-card-title">列表错峰与骨架占位</h2>
          <div className="sakura-motion-stagger grid sm:grid-cols-3 gap-3">
            {['备课','批阅','归档'].map(label => <div key={label} className="sakura-motion sakura-motion-rise" data-state="entering"><div className="sakura-card">{label}</div></div>)}
          </div>
          <div aria-hidden="true" className="space-y-2"><div className="sakura-skeleton h-5 w-2/3" /><div className="sakura-skeleton h-16 w-full" /></div>
          <p className="text-sm text-on-surface-variant">骨架示例预留内容尺寸；系统减少动态效果时显示为静态占位。</p>
        </section>
        <nav className="flex gap-4 text-sm"><a href="/?design=1.0Sakura">打开新标准工作台</a><a href="/">打开原版</a></nav>
      </div>
    </div>
  );
}
