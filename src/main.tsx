import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './shared/styles/globals.css';
import { PixelButton } from './shared/components/PixelButton';
import { PixelCard } from './shared/components/PixelCard';
import { PixelInput } from './shared/components/PixelInput';
import { StatusPill } from './shared/components/StatusPill';
import { EmptyState } from './shared/components/EmptyState';
import { Dock } from './shared/components/Dock';

function Placeholder() {
  return (
    <div className="min-h-screen p-6 pb-24">
      <h1 className="font-pixel text-2xl mb-4">8bitOS — components smoke test</h1>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <PixelCard>
          <p className="font-pixel text-sm mb-3">BUTTONS</p>
          <div className="flex gap-2 flex-wrap">
            <PixelButton>PRIMARY</PixelButton>
            <PixelButton variant="secondary">SECONDARY</PixelButton>
            <PixelButton variant="ghost">GHOST</PixelButton>
          </div>
        </PixelCard>
        <PixelCard>
          <p className="font-pixel text-sm mb-3">STATUS</p>
          <div className="flex gap-2">
            <StatusPill tone="on" label="ONLINE" />
            <StatusPill tone="off" label="OFFLINE" />
          </div>
        </PixelCard>
        <PixelCard>
          <p className="font-pixel text-sm mb-3">INPUT</p>
          <PixelInput label="EMAIL" type="email" placeholder="teacher@school.id" />
        </PixelCard>
        <PixelCard>
          <p className="font-pixel text-sm mb-3">EMPTY</p>
          <EmptyState
            title="NO NOTES"
            hint="Create your first note."
            action={<PixelButton variant="secondary">+ NEW</PixelButton>}
          />
        </PixelCard>
      </div>
      <Dock />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Placeholder />
    </HashRouter>
  </StrictMode>,
);
