import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote, logSessionActivity } from '@/shared/db/queries';
import type { NoteKind } from '@/shared/db/types';
import { useSession } from '@/features/auth/useSession';
import { useSessionContext } from '@/features/classroom/sessionContext';
import { PixelModal } from '@/shared/components/PixelModal';
import { PixelButton } from '@/shared/components/PixelButton';
import { useToast } from '@/shared/components/Toast';

// Quick Capture (Dokumen 06 §18): ide spontan dalam hitungan detik,
// otomatis diberi konteks session aktif bila ada.
export function QuickCapture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useSession();
  const { toast } = useToast();
  const activeSession = useSessionContext((s) => s.active);
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [savedLabel, setSavedLabel] = useState('');

  useEffect(() => {
    if (open) {
      setText('');
      setSavedLabel('');
    }
  }, [open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('NO_AUTH');
      const firstLine = text.trim().split('\n')[0] ?? '';
      const title = firstLine.length > 0 ? firstLine.slice(0, 60) : 'Quick capture';
      const contextPrefix = activeSession
        ? `[${activeSession.subjectName} — ${activeSession.className}] `
        : '';
      const kind: NoteKind = activeSession ? 'session' : 'personal';
      return createNote(user.id, {
        kind,
        title: `${contextPrefix}${title}`,
        body: text.trim(),
        class_id: activeSession?.classId ?? null,
        session_id: activeSession?.sessionId ?? null,
      });
    },
    onSuccess: (_note) => {
      setSavedLabel('● tersimpan ke notes');
      toast('✓ CAPTURE TERSIMPAN');
      // Timeline (Doc 10 §17): capture dalam sesi tercatat sebagai aktivitas note
      if (user && activeSession) {
        void logSessionActivity(
          user.id,
          activeSession.sessionId,
          'note',
          text.trim().split('\n')[0]?.slice(0, 60) || 'Quick capture',
        ).catch(() => undefined);
      }
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
      setTimeout(() => {
        onClose();
        setSavedLabel('');
      }, 700);
    },
  });

  return (
    <PixelModal open={open} onClose={onClose} title="QUICK CAPTURE">
      <div className="space-y-3">
        {activeSession && (
          <p className="micro-pixel text-gray-300">
            KONTEKS: {activeSession.subjectName.toUpperCase()} · {activeSession.className}
          </p>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
              autoFocus
          placeholder="tulis ide, catatan, atau pengingat…"
          className="w-full bg-bg text-fg border border-line-strong px-3 py-2 font-sans text-body focus-visible:border-fg resize-y"
          aria-label="Isi quick capture"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && text.trim()) {
              saveMutation.mutate();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <span className="micro-pixel text-gray-500" aria-live="polite">
            {savedLabel || 'ctrl+enter untuk simpan'}
          </span>
          <PixelButton
            onClick={() => saveMutation.mutate()}
            disabled={!text.trim() || saveMutation.isPending}
          >
            {saveMutation.isPending ? 'MENYIMPAN…' : 'SIMPAN'}
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
}
