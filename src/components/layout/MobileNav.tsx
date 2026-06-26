import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarDays, Sparkles, Wrench, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/portfolio', label: 'Portfolio', icon: Building2 },
  { to: '/buchungen', label: 'Buchungen', icon: CalendarDays },
  { to: '/reinigung', label: 'Reinigung', icon: Sparkles },
  { to: '/instandhaltung', label: 'Wartung', icon: Wrench },
  { to: '/immobilie', label: 'Daten', icon: Home },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface md:hidden">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]',
              isActive ? 'text-primary' : 'text-ink-soft',
            )
          }
        >
          <Icon size={20} aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
