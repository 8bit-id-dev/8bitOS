import { Outlet } from 'react-router-dom';
import { Dock } from '@/shared/components/Dock';

export function AppLayout() {
  return (
    <div className="min-h-screen pl-sidebar">
      <Outlet />
      <Dock />
    </div>
  );
}
