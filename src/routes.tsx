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
import { AssessmentList } from './features/assessment/AssessmentList';
import { AssessmentBuilder } from './features/assessment/AssessmentBuilder';
import { AssessmentRun } from './features/assessment/AssessmentRun';
import { AssessmentResult } from './features/assessment/AssessmentResult';
import { GradebookHome, GradebookClass } from './features/gradebook/Gradebook';
import { Whiteboard } from './features/whiteboard/Whiteboard';
import { Browser } from './features/browser/Browser';
import { ToolsHome } from './features/tools/ToolsHome';
import { Documents } from './features/documents/Documents';
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
          <Route path="/assessment" element={<AssessmentList />} />
          <Route path="/assessment/new" element={<AssessmentBuilder />} />
          <Route path="/assessment/:assessmentId/edit" element={<AssessmentBuilder />} />
          <Route path="/assessment/:assessmentId/run" element={<AssessmentRun />} />
          <Route path="/assessment/:assessmentId/result" element={<AssessmentResult />} />
          <Route path="/gradebook" element={<GradebookHome />} />
          <Route path="/gradebook/:classId" element={<GradebookClass />} />
          <Route path="/whiteboard" element={<Whiteboard />} />
          <Route path="/browser" element={<Browser />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/classroom/:classId/documents" element={<Documents />} />
          <Route path="/tools" element={<ToolsHome />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
