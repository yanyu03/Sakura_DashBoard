import type { HTMLAttributes } from 'react';
import {
  Search, Bell, Leaf, CalendarDays, LayoutDashboard, Calendar, GraduationCap,
  ClipboardCheck, BookOpen, ChartNoAxesCombined, MessagesSquare, Presentation,
  Settings, ClipboardList, LogOut, Plus, X, ArrowRight, RefreshCw, User, Users,
  Pencil, Save, Flower2, Heart, Sparkles, KeyRound, HelpCircle, Menu,
} from 'lucide-react';

// Legacy design-token names now render bundled SVGs, independent of font loading.
const glyphs: Record<string, typeof Search> = {
  search: Search, notifications: Bell, eco: Leaf, calendar_month: CalendarDays,
  grid_view: LayoutDashboard, calendar_today: Calendar, school: GraduationCap,
  rate_review: ClipboardCheck, menu_book: BookOpen, analytics: ChartNoAxesCombined,
  forum: MessagesSquare, cast_for_education: Presentation, settings: Settings,
  assignment: ClipboardList, logout: LogOut, add: Plus, close: X,
  arrow_forward: ArrowRight, refresh: RefreshCw, person: User,
  local_florist: Flower2, favorite: Heart, auto_stories: BookOpen,
  edit_note: Pencil, event_available: CalendarDays, volunteer_activism: Heart,
  assignment_add: ClipboardList, assignment_turned_in: ClipboardCheck,
  query_stats: ChartNoAxesCombined, apps: LayoutDashboard, manage_accounts: Users,
  key: KeyRound, dashboard_customize: Settings, palette: Sparkles,
  restart_alt: RefreshCw, save: Save, menu: Menu,
};

type IconProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & { children: string };

export function SakuraIcon({ children, className = '', style, ...props }: IconProps) {
  const Glyph = glyphs[children.trim()] || HelpCircle;
  return (
    <span
      {...props}
      aria-hidden="true"
      className={`${className} sakura-svg-icon`}
      style={{ ...style, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '1em', height: '1em', minWidth: '1em', flexShrink: 0,
        verticalAlign: 'middle', lineHeight: 1 }}
    >
      <Glyph width="1em" height="1em" strokeWidth={1.8} />
    </span>
  );
}
