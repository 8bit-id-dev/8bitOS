import { describe, expect, it, vi, beforeEach } from 'vitest';
import { exportCsv, exportAttendanceCsv } from './exportCsv';

const clickSpy = vi.fn();
const revokeSpy = vi.fn();

beforeEach(() => {
  clickSpy.mockClear();
  revokeSpy.mockClear();
  // jsdom: stub URL + anchor
  Object.defineProperty(globalThis, 'URL', {
    value: class {
      static createObjectURL = vi.fn(() => 'blob:mock');
      static revokeObjectURL = revokeSpy;
    },
    writable: true,
  });
  Object.defineProperty(globalThis.document, 'createElement', {
    value: (tag: string) =>
      tag === 'a'
        ? ({ click: clickSpy, href: '', download: '' } as unknown as HTMLAnchorElement)
        : (globalThis.document.createElement.bind(globalThis.document) as (t: string) => HTMLElement)(tag),
    writable: true,
  });
});

describe('exportCsv', () => {
  it('downloads a blob with BOM + semicolon separators', () => {
    exportCsv('test', [['a', 'b'], ['1;2', 'x']]);
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalled();
  });
});

describe('exportAttendanceCsv', () => {
  it('builds rows with hadir count in header', () => {
    exportAttendanceCsv('XI IPA 1', '2026-09-04', [
      { no: 1, name: 'Ahmad', nisn: '001', status: 'hadir' },
      { no: 2, name: 'Budi;Santoso', nisn: '002', status: null },
    ]);
    expect(clickSpy).toHaveBeenCalled();
  });
});
