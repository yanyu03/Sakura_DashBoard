import {SakuraIcon} from './SakuraIcon';
import type { ReactNode } from "react";

export function WorkspaceHero({
  title,
  description,
  eyebrow,
  icon,
  children,
}: {
  title: string;
  description: string;
  eyebrow: string;
  icon: string;
  children?: ReactNode;
}) {
  return (
    <header className="sakura-page-hero">
      <div className="sakura-hero-copy">
        <div className="sakura-eyebrow">
          <span className="sakura-section-mark" />
          <span>{eyebrow}</span>
        </div>
        <div className="sakura-hero-title">
          <SakuraIcon
            className="sakura-hero-icon material-symbols-outlined"
            aria-hidden="true"
          >
            {icon}
          </SakuraIcon>
          <h2>{title}</h2>
        </div>
        <p>{description}</p>
        {children ? (
          <div className="sakura-hero-actions">{children}</div>
        ) : null}
      </div>
      <div className="sakura-hero-art" aria-hidden="true">
        <svg viewBox="0 0 248 160" fill="none">
          <rect
            x="63"
            y="25"
            width="128"
            height="113"
            rx="12"
            fill="var(--sakura-surface-card)"
            stroke="var(--sakura-border-default)"
            transform="rotate(8 127 81)"
          />
          <path
            d="M46 43c29-8 54-1 77 13 23-14 49-21 78-13v83c-28-8-54-2-78 11-24-13-49-19-77-11V43Z"
            fill="var(--sakura-surface-card)"
            stroke="var(--sakura-text-brand)"
            strokeWidth="2"
          />
          <path
            d="M123 56v81M62 64l37 7M62 79l34 6M62 94l30 5M146 70l35-7M146 85l35-7M146 100l26-5"
            stroke="var(--sakura-border-hover)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M156 43v29l9-7 9 3V39"
            fill="var(--sakura-surface-accent)"
            stroke="var(--sakura-text-brand)"
            strokeWidth="1.5"
          />
          <g
            className="sakura-art-sprig"
            stroke="var(--sakura-text-brand)"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path
              d="M30 123C18 92 24 67 35 48M29 106c-13-1-19-9-18-18 13 0 18 8 18 18ZM27 86c11-1 18-9 17-17-13 0-18 8-17 17ZM32 66c-10-3-14-11-11-19 11 2 16 10 11 19Z"
              fill="var(--sakura-surface-accent)"
            />
          </g>
          <g
            className="sakura-art-spark"
            stroke="var(--sakura-text-brand)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M213 40v12m-6-6h12M49 21v9m-4.5-4.5h9M217 109v8m-4-4h8" />
            <circle cx="206" cy="81" r="3" />
            <circle cx="89" cy="14" r="2" />
          </g>
        </svg>
        <span className="sakura-art-caption">一点积累，慢慢生长</span>
      </div>
    </header>
  );
}

export function SectionTitle({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="sakura-section-heading">
      <div className="sakura-section-heading-copy">
        <SakuraIcon
          className="material-symbols-outlined sakura-section-icon"
          aria-hidden="true"
        >
          {icon}
        </SakuraIcon>
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="sakura-empty-state">
      <SakuraIcon
        className="sakura-empty-icon material-symbols-outlined"
        aria-hidden="true"
      >
        {icon}
      </SakuraIcon>
      <strong>{title}</strong>
      <p>{description}</p>
      {children}
    </div>
  );
}
