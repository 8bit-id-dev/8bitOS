import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  createGradeComponents,
  deleteGradeComponent,
  listClassesForUser,
  listGradeComponents,
  listGradesByClass,
  listStudentsByClass,
  upsertGrade,
} from '@/shared/db/queries';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DEFAULT_COMPONENTS, finalScore, totalWeight } from './gradebook.helpers';

export function GradebookHome() {
  const { user } = useSession();

  const { data: classSummaries } = useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/gradebook
        </h1>
        <span className="font-sans text-pixel-sm text-gray-300">nilai per kelas</span>
      </header>

      {(classSummaries ?? []).length === 0 ? (
        <EmptyState title="BELUM ADA KELAS" hint="Buat kelas terlebih dahulu." />
      ) : (
        <div className="space-y-2">
          {(classSummaries ?? []).map((s) => (
            <Link
              key={s.classRow.id}
              to={`/gradebook/${s.classRow.id}`}
              className="panel block px-3 py-2 hover:border-fg transition-colors"
            >
              <p className="font-sans text-small text-fg">{s.classRow.name}</p>
              <p className="font-sans text-pixel-sm text-gray-300 mt-0.5">{s.studentCount} siswa</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export function GradebookClass() {
  const { classId = '' } = useParams<{ classId: string }>();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{ componentId: string; studentId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState('10');

  const { data: classSummaries } = useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const componentsQ = useQuery({
    queryKey: ['grade-components', classId],
    queryFn: () => listGradeComponents(classId),
    enabled: Boolean(classId),
  });

  const studentsQ = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => listStudentsByClass(classId),
    enabled: Boolean(classId),
  });

  const gradesQ = useQuery({
    queryKey: ['grades', classId],
    queryFn: () => listGradesByClass(classId),
    enabled: Boolean(classId),
  });

  const gradeMutation = useMutation({
    mutationFn: async (v: { componentId: string; studentId: string; score: number }) =>
      upsertGrade(user!.id, v.componentId, v.studentId, v.score),
    onSuccess: () => {
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['grades', classId] });
    },
  });

  const initDefaultsMutation = useMutation({
    mutationFn: () => createGradeComponents(user!.id, classId, DEFAULT_COMPONENTS),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['grade-components', classId] });
    },
  });

  const addComponentMutation = useMutation({
    mutationFn: () =>
      createGradeComponents(user!.id, classId, [{ name: newName, weight: Number(newWeight) || 0 }]),
    onSuccess: () => {
      setShowAdd(false);
      setNewName('');
      setNewWeight('10');
      void queryClient.invalidateQueries({ queryKey: ['grade-components', classId] });
    },
  });

  const deleteComponentMutation = useMutation({
    mutationFn: (id: string) => deleteGradeComponent(id),
    onSuccess: () => {
      setConfirmDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['grade-components', classId] });
      void queryClient.invalidateQueries({ queryKey: ['grades', classId] });
    },
  });

  const cls = (classSummaries ?? []).find((s) => s.classRow.id === classId)?.classRow;
  const components = componentsQ.data ?? [];
  const students = studentsQ.data ?? [];
  const grades = gradesQ.data ?? [];

  const gradeKey = (componentId: string, studentId: string) => `${componentId}::${studentId}`;
  const gradeMap = new Map(grades.map((g) => [gradeKey(g.component_id, g.student_id), g]));

  const startEdit = (componentId: string, studentId: string) => {
    const existing = gradeMap.get(gradeKey(componentId, studentId));
    setEditing({ componentId, studentId });
    setEditValue(existing ? String(existing.score) : '');
  };

  const commitEdit = async () => {
    if (!editing) return;
    const score = Number(editValue);
    if (Number.isNaN(score) || score < 0 || score > 100) return;
    await gradeMutation.mutateAsync({ ...editing, score });
  };

  const weight = totalWeight(components);

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/gradebook/{cls?.name.toLowerCase().replace(/\s+/g, '-') ?? '…'}
        </h1>
        <Link to="/gradebook" className="font-sans text-pixel-sm text-gray-300 hover:text-fg">
          ← daftar
        </Link>
      </header>

      {componentsQ.isLoading && <p className="font-sans text-pixel-sm text-gray-300">loading…</p>}

      {components.length === 0 && !componentsQ.isLoading && (
        <PixelCard title="komponen_nilai">
          <p className="font-sans text-pixel-sm text-gray-300 mb-2">
            belum ada komponen — pakai set default?
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {DEFAULT_COMPONENTS.map((c) => (
              <span
                key={c.name}
                className="font-sans micro-pixel px-1.5 py-0.5 border border-line-strong text-gray-300"
              >
                {c.name} {c.weight}%
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <PixelButton onClick={() => initDefaultsMutation.mutate()}>
              PAKAI DEFAULT
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => setShowAdd(true)}>
              + KOMPONEN
            </PixelButton>
          </div>
        </PixelCard>
      )}

      {showAdd && (
        <PixelCard title="komponen_baru">
          <div className="flex gap-2 items-end">
            <label className="flex-1">
              <span className="font-sans micro-pixel text-gray-300">NAMA</span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full mt-1 bg-bg text-fg border border-line-strong px-2 py-1 font-sans text-pixel-sm"
              />
            </label>
            <label>
              <span className="font-sans micro-pixel text-gray-300">BOBOT %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-20 mt-1 bg-bg text-fg border border-line-strong px-2 py-1 font-sans text-pixel-sm"
              />
            </label>
            <PixelButton
              onClick={() => addComponentMutation.mutate()}
              disabled={!newName.trim()}
            >
              SIMPAN
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => setShowAdd(false)}>
              BATAL
            </PixelButton>
          </div>
        </PixelCard>
      )}

      {components.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="font-sans text-pixel-sm text-gray-300">
              total bobot: <span className={weight === 100 ? 'text-fg' : 'text-fg'}>{weight}%</span>
              {weight !== 100 && <span className="text-gray-500"> (ideal 100%)</span>}
            </p>
            <PixelButton variant="secondary" onClick={() => setShowAdd(true)}>
              + KOMPONEN
            </PixelButton>
          </div>

          <PixelCard title={`grid nilai (${students.length} siswa)`}>
            <div className="overflow-x-auto">
              <table className="w-full font-sans text-pixel-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-gray-300 py-1 pr-2 border-b border-line-strong">SISWA</th>
                    {components.map((c) => (
                      <th
                        key={c.id}
                        className="text-center text-gray-300 py-1 px-2 border-b border-line-strong whitespace-nowrap"
                      >
                        <span className="text-fg">{c.name}</span>
                        <span className="text-gray-500"> {c.weight}%</span>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(c.id)}
                          className="ml-1 text-gray-500 hover:text-fg"
                          aria-label={`Hapus komponen ${c.name}`}
                        >
                          ×
                        </button>
                      </th>
                    ))}
                    <th className="text-center text-fg py-1 px-2 border-b border-line-strong">
                      AKHIR
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, si) => {
                    const studentGrades = grades.filter((g) => g.student_id === s.id);
                    const final = finalScore(components, studentGrades);
                    return (
                      <tr key={s.id} className={si % 2 === 1 ? 'bg-surface' : ''}>
                        <td className="py-1 pr-2 text-fg whitespace-nowrap">{s.full_name}</td>
                        {components.map((c) => {
                          const g = gradeMap.get(gradeKey(c.id, s.id));
                          const isEditing =
                            editing?.componentId === c.id && editing?.studentId === s.id;
                          return (
                            <td key={c.id} className="text-center px-1 py-0.5">
                              {isEditing ? (
                                <input
                                  autoFocus
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => void commitEdit()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') void commitEdit();
                                    if (e.key === 'Escape') setEditing(null);
                                  }}
                                  className="w-14 bg-bg text-fg border border-line-strong px-1 py-0.5 text-center"
                                  aria-label={`Nilai ${s.full_name} ${c.name}`}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startEdit(c.id, s.id)}
                                  className={`px-2 py-0.5 border border-transparent hover:border-line-strong ${
                                    g ? 'text-fg' : 'text-gray-500'
                                  }`}
                                  aria-label={`Edit nilai ${s.full_name} ${c.name}`}
                                >
                                  {g ? g.score : '—'}
                                </button>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-center px-2 py-0.5">
                          <span className={final.score != null ? 'text-fg font-bold' : 'text-gray-500'}>
                            {final.score ?? '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="font-sans micro-pixel text-gray-500 mt-2">
              tap cell untuk input · enter/blur simpan · nilai akhir = rata-rata tertimbang
            </p>
          </PixelCard>
        </>
      )}

      <ConfirmDialog
        open={confirmDelete != null}
        title="HAPUS KOMPONEN?"
        message="Komponen dan semua nilai di dalamnya akan dihapus."
        confirmLabel="HAPUS"
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteComponentMutation.mutate(confirmDelete)}
      />
    </main>
  );
}
