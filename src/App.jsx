import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { CustomerAuthProvider } from './context/CustomerAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public
import HomePage from './pages/public/HomePage';
import PlansPage from './pages/public/PlansPage';
import CoveragePage from './pages/public/CoveragePage';
import ContactPage from './pages/public/ContactPage';
import EnquiryPage from './pages/public/EnquiryPage';
import VerifyReceiptPage from './pages/public/VerifyReceiptPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';

// Customer
import DashboardPage from './pages/customer/DashboardPage';
import RechargePage from './pages/customer/RechargePage';
import HistoryPage from './pages/customer/HistoryPage';
import ReceiptPage from './pages/customer/ReceiptPage';
import ProfilePage from './pages/customer/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerAuthProvider queryClient={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/coverage" element={<CoveragePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/enquire" element={<EnquiryPage />} />
                <Route path="/verify/:receiptNo" element={<VerifyReceiptPage />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />

                {/* Customer (protected) */}
                <Route path="/me" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/me/recharge" element={<ProtectedRoute><RechargePage /></ProtectedRoute>} />
                <Route path="/me/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/me/receipt/:id" element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
                <Route path="/me/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/me/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </BrowserRouter>
      </CustomerAuthProvider>
    </QueryClientProvider>
  );
}
