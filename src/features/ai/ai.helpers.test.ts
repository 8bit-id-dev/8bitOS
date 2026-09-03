import { describe, expect, it } from 'vitest';
import {
  AI_TEMPLATES,
  findTemplate,
  localFallbackResponse,
  type AiKind,
} from './ai.helpers';

describe('ai.helpers', () => {
  it('templates build prompt with context', () => {
    const t = findTemplate('modul_ajar');
    expect(t).toBeDefined();
    const prompt = t!.build('integral', 'XI IPA 1');
    expect(prompt).toContain('integral');
    expect(prompt).toContain('XI IPA 1');
    expect(prompt).toContain('Tujuan Pembelajaran');
  });

  it('templates work without context', () => {
    const t = findTemplate('soal')!;
    const prompt = t.build('5 soal PG turunan');
    expect(prompt).toContain('5 soal PG turunan');
    expect(prompt).not.toContain('Konteks kelas');
  });

  it('all template kinds unique', () => {
    const kinds = AI_TEMPLATES.map((t) => t.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it('findTemplate returns undefined for unknown kind', () => {
    expect(findTemplate('nope' as AiKind)).toBeUndefined();
  });

  it('localFallbackResponse produces structured outlines', () => {
    const modul = localFallbackResponse('modul_ajar', 'Integral XI');
    expect(modul).toContain('TUJUAN PEMBELAJARAN');
    expect(modul).toContain('Integral XI');

    const soal = localFallbackResponse('soal', 'turunan');
    expect(soal).toContain('PILIHAN GANDA');

    const refleksi = localFallbackResponse('refleksi', 'sesi integral');
    expect(refleksi).toContain('TINDAK LANJUT');

    const fallback = localFallbackResponse('rubrik', 'proyek');
    expect(fallback).toContain('HASIL');
  });
});
