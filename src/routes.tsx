import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { RequireAuth } from './app/RequireAuth';
import { SignIn } from './features/auth/SignIn';
import { SignUp } from './features/auth/SignUp';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { ClassList } from './features/classroom/ClassList';
import { ClassHub } from './features/classroom/ClassHub';
import { AttendanceSheet } from './features/classroom/AttendanceSheet';
import { SessionReport } from './features/classroom/SessionReport';
import { StudentDetail } from './features/classroom/StudentDetail';
import { PlannerScreen } from './features/planner/PlannerScreen';
import { NotesScreen } from './features/notes/NotesScreen';
import { PixelLoading } from './shared/components/PixelLoading';

// Lazy-load fitur berat (Doc 09 §42): browser, board, assessment,
// gradebook, documents, launcher — di luar jalur KBM harian.
const LauncherHome = lazy(() =>
  import('./features/launcher/LauncherHome').then((m) => ({ default: m.LauncherHome })),
);
const AssessmentList = lazy(() =>
  import('./features/assessment/AssessmentList').then((m) => ({ default: m.AssessmentList })),
);
const AssessmentBuilder = lazy(() =>
  import('./features/assessment/AssessmentBuilder').then((m) => ({ default: m.AssessmentBuilder })),
);
const AssessmentRun = lazy(() =>
  import('./features/assessment/AssessmentRun').then((m) => ({ default: m.AssessmentRun })),
);
const AssessmentResult = lazy(() =>
  import('./features/assessment/AssessmentResult').then((m) => ({ default: m.AssessmentResult })),
);
const GradebookHome = lazy(() =>
  import('./features/gradebook/Gradebook').then((m) => ({ default: m.GradebookHome })),
);
const GradebookClass = lazy(() =>
  import('./features/gradebook/Gradebook').then((m) => ({ default: m.GradebookClass })),
);
const Whiteboard = lazy(() =>
  import('./features/whiteboard/Whiteboard').then((m) => ({ default: m.Whiteboard })),
);
const Browser = lazy(() =>
  import('./features/browser/Browser').then((m) => ({ default: m.Browser })),
);
const Documents = lazy(() =>
  import('./features/documents/Documents').then((m) => ({ default: m.Documents })),
);
const ToolsHome = lazy(() =>
  import('./features/tools/ToolsHome').then((m) => ({ default: m.ToolsHome })),
);

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route
        path="/launcher"
        element={
          <Suspense fallback={<PixelLoading label="LAUNCHER" />}>
            <LauncherHome />
          </Suspense>
        }
      />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/classroom" element={<ClassList />} />
          <Route path="/classroom/:classId" element={<ClassHub />} />
          <Route path="/classroom/:classId/attendance/:sessionId" element={<AttendanceSheet />} />
          <Route path="/classroom/:classId/session/:sessionId/report" element={<SessionReport />} />
          <Route path="/classroom/:classId/students/:studentId" element={<StudentDetail />} />
          <Route path="/planner" element={<PlannerScreen />} />
          <Route path="/notes" element={<NotesScreen />} />
          <Route
            path="/assessment"
            element={
              <Suspense fallback={<PixelLoading label="ASESMEN" />}>
                <AssessmentList />
              </Suspense>
            }
          />
          <Route
            path="/assessment/new"
            element={
              <Suspense fallback={<PixelLoading label="ASESMEN" />}>
                <AssessmentBuilder />
              </Suspense>
            }
          />
          <Route
            path="/assessment/:assessmentId/edit"
            element={
              <Suspense fallback={<PixelLoading label="ASESMEN" />}>
                <AssessmentBuilder />
              </Suspense>
            }
          />
          <Route
            path="/assessment/:assessmentId/run"
            element={
              <Suspense fallback={<PixelLoading label="ASESMEN" />}>
                <AssessmentRun />
              </Suspense>
            }
          />
          <Route
            path="/assessment/:assessmentId/result"
            element={
              <Suspense fallback={<PixelLoading label="ASESMEN" />}>
                <AssessmentResult />
              </Suspense>
            }
          />
          <Route
            path="/gradebook"
            element={
              <Suspense fallback={<PixelLoading label="GRADEBOOK" />}>
                <GradebookHome />
              </Suspense>
            }
          />
          <Route
            path="/gradebook/:classId"
            element={
              <Suspense fallback={<PixelLoading label="GRADEBOOK" />}>
                <GradebookClass />
              </Suspense>
            }
          />
          <Route
            path="/whiteboard"
            element={
              <Suspense fallback={<PixelLoading label="BOARD" />}>
                <Whiteboard />
              </Suspense>
            }
          />
          <Route
            path="/browser"
            element={
              <Suspense fallback={<PixelLoading label="BROWSER" />}>
                <Browser />
              </Suspense>
            }
          />
          <Route
            path="/documents"
            element={
              <Suspense fallback={<PixelLoading label="DOKUMEN" />}>
                <Documents />
              </Suspense>
            }
          />
          <Route
            path="/classroom/:classId/documents"
            element={
              <Suspense fallback={<PixelLoading label="DOKUMEN" />}>
                <Documents />
              </Suspense>
            }
          />
          <Route
            path="/tools"
            element={
              <Suspense fallback={<PixelLoading label="TOOLS" />}>
                <ToolsHome />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
