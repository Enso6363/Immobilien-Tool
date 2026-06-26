import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarDays, Sparkles, Wrench, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/portfolio', label: 'Portfolio', icon: Building2 },
  { to: '/buchungen', label: 'Kalender & Buchungen', icon: CalendarDays },
  { to: '/reinigung', label: 'Reinigung', icon: Sparkles },
  { to: '/instandhaltung', label: 'Instandhaltung', icon: Wrench },
  { to: '/immobilie', label: 'Stammdaten', icon: Home },
];

export function Sidebar() {
  return (
    <aside className="hidden h-full w-64 flex-col bg-primary text-white md:flex">
      <div className="px-5 py-6">
        <span className="font-display text-lg tracking-tight">Concierge</span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary-deep font-medium text-white'
                  : 'text-white/75 hover:bg-primary-deep/60 hover:text-white',
              )
            }
          >
            <Icon size={18} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
