import { useState } from 'react';
import { PixelModal } from '@/shared/components/PixelModal';
import { PixelButton } from '@/shared/components/PixelButton';
import { PixelInput } from '@/shared/components/PixelInput';
import type { StudentDraft } from '@/shared/db/queries';

export interface StudentFormProps {
  open: boolean;
  initial?: { full_name: string; nisn: string; gender: 'L' | 'P' };
  onSubmit: (draft: StudentDraft) => Promise<void>;
  onCancel: () => void;
  pending?: boolean;
}

export function StudentForm({ open, initial, onSubmit, onCancel, pending }: StudentFormProps) {
  const [fullName, setFullName] = useState(initial?.full_name ?? '');
  const [nisn, setNisn] = useState(initial?.nisn ?? '');
  const [gender, setGender] = useState<'L' | 'P'>(initial?.gender ?? 'L');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!fullName.trim()) {
      setError('Nama wajib diisi');
      return;
    }
    setError('');
    await onSubmit({ class_id: '', full_name: fullName.trim(), nisn: nisn.trim(), gender });
  };

  return (
    <PixelModal open={open} onClose={onCancel} title="TAMBAH SISWA">
      <div className="space-y-3">
        <PixelInput label="NAMA LENGKAP" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <PixelInput label="NISN" value={nisn} onChange={(e) => setNisn(e.target.value)} />
        <div>
          <p className="font-sans micro-pixel label-pixel text-gray-300 mb-1">GENDER</p>
          <div className="flex gap-1">
            {(['L', 'P'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`font-sans text-pixel-sm px-3 py-1 border ${
                  gender === g
                    ? 'bg-fg text-bg border-fg '
                    : 'bg-transparent text-gray-300 border-line-strong'
                }`}
              >
                {g === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="font-sans text-pixel-sm text-fg">ERROR: {error}</p>}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <PixelButton variant="secondary" onClick={onCancel}>
          BATAL
        </PixelButton>
        <PixelButton onClick={() => void submit()} disabled={pending}>
          {pending ? 'MENYIMPAN…' : 'SIMPAN'}
        </PixelButton>
      </div>
    </PixelModal>
  );
}
