import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/styles/globals.css';
function Placeholder() {
    return (_jsxs("div", { className: "min-h-screen p-6", children: [_jsx("h1", { className: "font-pixel text-2xl", children: "8bitOS" }), _jsx("p", { className: "text-gray-300 mt-2", children: "Design tokens active." }), _jsxs("div", { className: "mt-4 pixel-card pixel-cut p-4 max-w-sm", children: [_jsx("p", { className: "font-pixel text-sm", children: "PIXEL CARD" }), _jsx("p", { className: "text-gray-300 text-xs mt-1", children: "Hard border + hard shadow + pixel-cut corners." })] })] }));
}
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(Placeholder, {}) }));
