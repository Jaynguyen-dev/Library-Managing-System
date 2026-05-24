import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ReaderDashboard from "./pages/ReaderDashboard";
import BookListPage from "./pages/BookListPage";
import BookFormPage from "./pages/BookFormPage";
import UserListPage from "./pages/UserListPage";
import UserFormPage from "./pages/UserFormPage";
import BorrowListPage from "./pages/BorrowListPage";
import BorrowFormPage from "./pages/BorrowFormPage";
import ReturnPage from "./pages/ReturnPage";
import FineListPage from "./pages/FineListPage";
import BillingPage from "./pages/BillingPage";
import WalletPage from "./pages/WalletPage";
import StudentHistoryPage from "./pages/StudentHistoryPage";
import MyReservationsPage from "./pages/MyReservationsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { borderRadius: "9999px", padding: "12px 20px", fontSize: "15px" },
          }} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              element={
                <ProtectedRoute roles={["admin", "librarian", "student"]}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<ProtectedRoute roles={["admin", "librarian"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/my-dashboard" element={<ProtectedRoute roles={["student"]}><ReaderDashboard /></ProtectedRoute>} />
              <Route path="/books" element={<BookListPage />} />
              <Route path="/books/new" element={<ProtectedRoute roles={["admin", "librarian"]}><BookFormPage /></ProtectedRoute>} />
              <Route path="/books/:id/edit" element={<ProtectedRoute roles={["admin", "librarian"]}><BookFormPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute roles={["admin"]}><UserListPage /></ProtectedRoute>} />
              <Route path="/users/new" element={<ProtectedRoute roles={["admin"]}><UserFormPage /></ProtectedRoute>} />
              <Route path="/borrows" element={<ProtectedRoute roles={["admin", "librarian"]}><BorrowListPage /></ProtectedRoute>} />
              <Route path="/borrows/new" element={<ProtectedRoute roles={["admin", "librarian"]}><BorrowFormPage /></ProtectedRoute>} />
              <Route path="/borrows/:id/return" element={<ProtectedRoute roles={["admin", "librarian"]}><ReturnPage /></ProtectedRoute>} />
              <Route path="/fines" element={<ProtectedRoute roles={["admin", "librarian"]}><FineListPage /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute roles={["admin"]}><BillingPage /></ProtectedRoute>} />
              <Route path="/fines/my" element={<ProtectedRoute roles={["student"]}><FineListPage /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute roles={["student"]}><WalletPage /></ProtectedRoute>} />
              <Route path="/profile/history" element={<ProtectedRoute roles={["student"]}><StudentHistoryPage /></ProtectedRoute>} />
              <Route path="/reservations" element={<ProtectedRoute roles={["student"]}><MyReservationsPage /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
