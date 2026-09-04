import { NavLink } from 'react-router-dom';
import {
  IconAi,
  IconAssess,
  IconClass,
  IconGrade,
  IconHome,
  IconNotes,
  IconPlan,
  IconTools,
} from './icons';
import type { ComponentType, SVGProps } from 'react';

interface DockItem {
  to: string;
  label: string;
  enabled: boolean;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const ITEMS: DockItem[] = [
  { to: '/', label: 'HOME', enabled: true, Icon: IconHome },
  { to: '/classroom', label: 'CLASS', enabled: true, Icon: IconClass },
  { to: '/planner', label: 'PLAN', enabled: true, Icon: IconPlan },
  { to: '/assessment', label: 'ASSESS', enabled: true, Icon: IconAssess },
  { to: '/gradebook', label: 'GRADE', enabled: true, Icon: IconGrade },
  { to: '/notes', label: 'NOTES', enabled: true, Icon: IconNotes },
  { to: '/tools', label: 'TOOLS', enabled: true, Icon: IconTools },
  { to: '#', label: 'SYS', enabled: false, Icon: IconAi },
];

export function Dock() {
  return (
    <nav
      className="fixed top-0 left-0 bottom-0 w-sidebar bg-bg border-r border-line flex flex-col items-stretch z-40"
      aria-label="Primary navigation"
    >
      <div className="h-header-h flex items-center justify-center border-b hairline">
        <span className="label-pixel font-bold text-pixel-md text-fg" aria-label="8bitOS">
          8b
        </span>
      </div>

      <ul className="flex-1 flex flex-col">
        {ITEMS.map((item) => {
          const { Icon } = item;
          if (!item.enabled) {
            return (
              <li
                key={item.to}
                className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-500 px-1"
                aria-disabled="true"
              >
                <Icon aria-hidden />
                <span className="micro-pixel">{item.label}</span>
                <span className="font-pixel text-[9px] text-line-strong">[soon]</span>
              </li>
            );
          }
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                aria-label={item.label}
                className={({ isActive }) =>
                  `h-full flex flex-col items-center justify-center gap-1 border-l-2 ${
                    isActive
                      ? 'bg-surface text-fg border-fg'
                      : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon aria-hidden />
                    <span className="micro-pixel">{item.label}</span>
                    {isActive && <span className="block w-5 h-[2px] bg-fg" aria-hidden />}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="h-footer-h flex items-center justify-center border-t hairline">
        <span className="micro-pixel text-gray-500" aria-label="Version">
          v0.2
        </span>
      </div>
    </nav>
  );
}
