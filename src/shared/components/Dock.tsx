import { NavLink } from 'react-router-dom';

interface DockItem {
  to: string;
  label: string;
  enabled: boolean;
}

const ITEMS: DockItem[] = [
  { to: '/', label: 'HOME', enabled: true },
  { to: '/classroom', label: 'CLASS', enabled: true },
  { to: '/work', label: 'WORK', enabled: false },
  { to: '/tools', label: 'TOOLS', enabled: false },
  { to: '/system', label: 'SYSTEM', enabled: false },
];

export function Dock() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 border-t-2 border-fg bg-bg flex items-stretch z-40"
      aria-label="Primary"
    >
      {ITEMS.map((item) => {
        if (!item.enabled) {
          return (
            <div
              key={item.to}
              className="flex-1 flex flex-col items-center justify-center font-pixel text-xs text-gray-500 border-r-2 border-fg last:border-r-0"
              aria-disabled="true"
            >
              <span>{item.label}</span>
              <span className="text-[10px]">[ SOON ]</span>
            </div>
          );
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center font-pixel text-xs border-r-2 border-fg last:border-r-0 ${
                isActive
                  ? 'bg-fg text-bg shadow-[inset_0_4px_0_0_#000]'
                  : 'bg-bg text-fg hover:bg-gray-700'
              }`
            }
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
