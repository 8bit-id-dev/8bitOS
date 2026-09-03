import { HashRouter } from 'react-router-dom';
import { Providers } from './Providers';
import { OrientationGuard } from './OrientationGuard';
import { AppRoutes } from '@/routes';

export function AppShell() {
  return (
    <Providers>
      <HashRouter>
        <OrientationGuard>
          <AppRoutes />
        </OrientationGuard>
      </HashRouter>
    </Providers>
  );
}
