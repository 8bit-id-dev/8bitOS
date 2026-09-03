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
import { LauncherHome } from './features/launcher/LauncherHome';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/launcher" element={<LauncherHome />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
