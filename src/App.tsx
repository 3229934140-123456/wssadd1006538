import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Layout } from "@/components/layout/Layout";
import Login from "@/pages/Login";
import Board from "@/pages/Board";
import PatientList from "@/pages/PatientList";
import PatientDetail from "@/pages/PatientDetail";
import Appointments from "@/pages/Appointments";
import Statistics from "@/pages/Statistics";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/board" replace />} />
          <Route path="board" element={<Board />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patient/:id" element={<PatientDetail />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>

        <Route path="*" element={<Navigate to="/board" replace />} />
      </Routes>
    </Router>
  );
}
