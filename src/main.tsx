import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/styles/globals.css';

function Placeholder() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="font-pixel text-2xl">8bitOS</h1>
      <p className="text-gray-300 mt-2">Design tokens active.</p>
      <div className="mt-4 pixel-card pixel-cut p-4 max-w-sm">
        <p className="font-pixel text-sm">PIXEL CARD</p>
        <p className="text-gray-300 text-xs mt-1">Hard border + hard shadow + pixel-cut corners.</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Placeholder />
  </StrictMode>,
);