/**
 * Awesome DESIGN.md (VoltAgent/awesome-design-md) Green UI Theme Specification
 *
 * Verified Reference:
 * - Repository: VoltAgent/awesome-design-md (DESIGN.md standardized brand token schema)
 * - Green Systems Referenced:
 *   1. Mintlify / Wise / Supabase Emerald-Mint System ("awesome-green" - 森系青翠 · 护眼教研版)
 *   2. Starbucks Four-Tier Earth-Green System ("matcha-bamboo" - 竹韵抹茶 · 大地森系版)
 *   3. Sakura Blossom Restrained Radius Edition ("sakura-pink" - 樱花初绽 · 紧凑方圆版)
 * - Corner Geometry:
 *   Strict 4px–8px architectural radius scale (eliminating oversized 24px–48px / 9999px pills).
 */

export type UiThemeId = 'awesome-green' | 'matcha-bamboo' | 'sakura-pink';

export interface UiThemeMeta {
  id: UiThemeId;
  name: string;
  shortLabel: string;
  badge: string;
  sourceRef: string;
  description: string;
  primaryHex: string;
  secondaryHex: string;
  surfaceHex: string;
  radiusSpec: string;
}

export const AWESOME_DESIGN_THEMES: UiThemeMeta[] = [
  {
    id: 'awesome-green',
    name: '青翠森系 · Awesome Green',
    shortLabel: '青翠绿',
    badge: 'Awesome DESIGN.md · Mintlify/Wise 规范',
    sourceRef: 'VoltAgent/awesome-design-md (Mintlify & Wise Emerald System)',
    description:
      '基于 Awesome DESIGN.md 开源设计规范库中的 Mintlify / Wise 青翠松石绿体系构建，采用护眼微茗白画布 (#F5FAF7)、深林墨绿高对比正文 (#0A261D) 与 4px–8px 利落微圆角。',
    primaryHex: '#0D7A5F',
    secondaryHex: '#059669',
    surfaceHex: '#F5FAF7',
    radiusSpec: '卡片 6px-8px / 按钮与输入框 4px-6px / 标签 4px',
  },
  {
    id: 'matcha-bamboo',
    name: '竹韵抹茶 · Earth Green',
    shortLabel: '竹韵绿',
    badge: 'Awesome DESIGN.md · Starbucks 四阶大地绿',
    sourceRef: 'VoltAgent/awesome-design-md (Four-Tier Earth-Green System)',
    description:
      '参考 Awesome DESIGN.md 四阶大地绿与暖燕麦画布体系，深松墨绿 (#1E3932) 搭配竹叶抹茶绿 (#00754A)，温润沉稳，适合长时间排课与阅卷。',
    primaryHex: '#1E3932',
    secondaryHex: '#00754A',
    surfaceHex: '#F6F8F5',
    radiusSpec: '卡片 6px-8px / 按钮与输入框 4px-6px / 标签 4px',
  },
  {
    id: 'sakura-pink',
    name: '樱花初绽 · Sakura Classic',
    shortLabel: '樱花粉',
    badge: '原始配色 · 已纠正微圆角',
    sourceRef: 'SakuraEdu Design System (Restrained 4px–8px Radius)',
    description:
      '保留樱花教务云经典粉绛色调，彻底移除夸张胶囊圆角与超大卡片圆角，统一收敛至 4px–8px 现代高密度教务规范。',
    primaryHex: '#8F4953',
    secondaryHex: '#A43073',
    surfaceHex: '#FFF7FA',
    radiusSpec: '卡片 6px-8px / 按钮与输入框 4px-6px / 标签 4px',
  },
];
