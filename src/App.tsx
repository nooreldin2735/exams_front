import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Routes, Route, Outlet } from "react-router-dom";
import LoginPage from "./core/Pages/Login_Page/login_page";
import SignUpPage from "./core/Pages/sign_up/sign_up_page";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import WelcomePage from "./core/Pages/Dashboard/WelcomePage";
import YearsPage from "./core/Pages/Years/YearsPage";
import CreateYearPage from "./core/Pages/Create_Year/CreateYearPage";
import TermsPage from "./core/Pages/Terms/TermsPage";
import CreateTermPage from "./core/Pages/Terms/CreateTermPage";
import SubjectsPage from "./core/Pages/Subjects/SubjectsPage";
import CreateSubjectPage from "./core/Pages/Subjects/CreateSubjectPage";
import LecturesPage from "./core/Pages/Lectures/LecturesPage";
import CreateLecturePage from "./core/Pages/Lectures/CreateLecturePage";
import QuestionsPage from "./core/Pages/Questions/QuestionsPage";
import CreateQuestionPage from "./core/Pages/Questions/CreateQuestionPage";

import { NavigationProvider } from "./context/NavigationContext";
import { Breadcrumbs } from "./components/Navigation/Breadcrumbs";

function App() {
  const DashboardLayout = () => (
    <NavigationProvider>
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
        <Sidebar onItemSelect={() => { }} />

        {/* Main Content Area */}
        <main className="flex-1 ml-14 lg:ml-14 transition-all duration-300 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <header className="space-y-4">
              <Breadcrumbs />
            </header>

            <Outlet />
          </div>
        </main>
      </div>
    </NavigationProvider>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<WelcomePage />} />
            <Route path="years" element={<YearsPage />} />
            <Route path="years/:yearId" element={<TermsPage />} />
            <Route path="years/:yearId/terms/:termId/subjects" element={<SubjectsPage />} />
            <Route path="years/:yearId/terms/:termId/subjects/:subjectId/lectures" element={<LecturesPage />} />
            <Route path="years/:yearId/terms/:termId/subjects/:subjectId/lectures/create" element={<CreateLecturePage />} />
            <Route path="years/:yearId/terms/:termId/subjects/:subjectId/lectures/:lectureId/questions" element={<QuestionsPage />} />
            <Route path="years/:yearId/terms/:termId/subjects/:subjectId/lectures/:lectureId/questions/create" element={<CreateQuestionPage />} />
            <Route path="create-year" element={<CreateYearPage />} />
            <Route path="create-term" element={<CreateTermPage />} />
            <Route path="create-subject" element={<CreateSubjectPage />} />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
