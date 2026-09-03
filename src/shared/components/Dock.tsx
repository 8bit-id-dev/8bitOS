import { NavLink } from 'react-router-dom';
import { IconClass, IconHome, IconNotes, IconSystem, IconWork } from './icons';
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
  { to: '/planner', label: 'PLAN', enabled: true, Icon: IconWork },
  { to: '/notes', label: 'NOTES', enabled: true, Icon: IconNotes },
  { to: '/tools', label: 'TOOLS', enabled: true, Icon: IconSystem },
];

export function Dock() {
  return (
    <nav
      className="fixed top-0 left-0 bottom-0 w-sidebar bg-bg border-r border-line-strong flex flex-col items-stretch z-40"
      aria-label="Primary navigation"
    >
      <div className="h-header-h flex items-center justify-center border-b border-line-strong">
        <span className="font-mono font-bold text-md text-accent text-glow" aria-label="8bitOS">
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
                className="flex-1 flex flex-col items-center justify-center gap-1 text-dimmer px-1"
                aria-disabled="true"
              >
                <Icon aria-hidden width={20} height={20} />
                <span className="font-mono text-micro-label">{item.label}</span>
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
                      ? 'bg-bg-raised text-accent border-accent'
                      : 'text-dim border-transparent hover:text-fg hover:bg-bg-raised'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon aria-hidden width={20} height={20} className={isActive ? 'accent-glow' : ''} />
                    <span className="font-mono text-micro-label">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="h-footer-h flex items-center justify-center border-t border-line-strong">
        <span className="font-mono text-micro-label text-dimmer" aria-label="Version">
          v0.1
        </span>
      </div>
    </nav>
  );
}
