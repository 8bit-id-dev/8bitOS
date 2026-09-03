import { NavLink } from 'react-router-dom';
import { IconClass, IconHome, IconSystem, IconTools, IconWork } from './icons';
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
  { to: '/work', label: 'WORK', enabled: false, Icon: IconWork },
  { to: '/tools', label: 'TOOLS', enabled: false, Icon: IconTools },
  { to: '/system', label: 'SYSTEM', enabled: false, Icon: IconSystem },
];

export function Dock() {
  return (
    <nav
      className="fixed top-0 left-0 bottom-0 w-sidebar bg-bg flex flex-col items-stretch z-40 border-r-2 border-fg"
      aria-label="Primary navigation"
    >
      <div className="h-header-h flex items-center justify-center border-b-2 border-fg">
        <span className="font-pixel text-h2" aria-label="8bitOS">
          8B
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
                <span className="font-pixel text-micro">{item.label}</span>
                <span className="font-pixel text-[8px]">[SOON]</span>
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
                  `h-full flex flex-col items-center justify-center gap-1 tap-target ${
                    isActive
                      ? 'bg-fg text-bg shadow-pixel-inset'
                      : 'text-fg hover:bg-gray-950'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon aria-hidden />
                    <span className="font-pixel text-micro">{item.label}</span>
                    {isActive && (
                      <span
                        className="block w-6 h-[2px] bg-bg"
                        aria-hidden
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="h-footer-h flex items-center justify-center border-t-2 border-fg">
        <span className="font-pixel text-[9px] text-gray-300" aria-label="Version">
          v0.1
        </span>
      </div>
    </nav>
  );
}
