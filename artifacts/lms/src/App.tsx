import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { PageLoader } from "@/components/page-loader";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VerifyEmail from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import PreTest from "@/pages/pre-test";
import PreTestResult from "@/pages/pre-test-result";
import Packages from "@/pages/packages";
import PackageDetail from "@/pages/package-detail";

// Student
import StudentDashboard from "@/pages/student-dashboard";
import MyPackages from "@/pages/my-packages";
import PackageLearn from "@/pages/package-learn";
import PackageQuizzes from "@/pages/package-quizzes";
import QuizDetail from "@/pages/quiz-detail";
import PackageTryouts from "@/pages/package-tryouts";
import TryoutResult from "@/pages/tryout-result";
import StudentOrders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import CBTTryout from "@/pages/cbt-tryout";
import Profile from "@/pages/profile";

// Admin
import AdminDashboard from "@/pages/admin-dashboard";
import AdminOrders from "@/pages/admin-orders";
import AdminPackages from "@/pages/admin-packages";
import AdminQuestions from "@/pages/admin-questions";
import AdminTryouts from "@/pages/admin-tryouts";
import AdminQuizzes from "@/pages/admin-quizzes";
import AdminUsers from "@/pages/admin-users";
import AdminBankAccounts from "@/pages/admin-bank-accounts";
import AdminPaymentSettings from "@/pages/admin-payment-settings";
import DashboardAdmin from "@/pages/dashboard-admin";

// Referral
import FormReferal from "@/pages/form-referal";
import DashboardReferalHolder from "@/pages/dashboard-referal-holder";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function roleHome(role: string | undefined): string {
  if (role === 'admin') return '/dashboard-admin';
  if (role === 'referral_holder') return '/dashboard-referal-holder';
  return '/dashboard';
}

function ProtectedRoute({ component: Component, adminOnly = false, holderOnly = false, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Redirect to={roleHome(user.role)} />;
  }

  if (holderOnly && user.role !== 'referral_holder') {
    return <Redirect to={roleHome(user.role)} />;
  }

  return <Component {...rest} />;
}

function GuestRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (user) {
    return <Redirect to={roleHome(user.role)} />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Landing} />
      <Route path="/login">{(params) => <GuestRoute component={Login} {...params} />}</Route>
      <Route path="/register">{(params) => <GuestRoute component={Register} {...params} />}</Route>
      <Route path="/form-referal">{(params) => <GuestRoute component={FormReferal} {...params} />}</Route>
      <Route path="/packages" component={Packages} />
      <Route path="/packages/:id" component={PackageDetail} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/pre-test" component={PreTest} />
      <Route path="/pre-test/result" component={PreTestResult} />
      
      {/* Shared Protected */}
      <Route path="/profile">{(params) => <ProtectedRoute component={Profile} {...params} />}</Route>
      
      {/* Student Area */}
      <Route path="/dashboard">{(params) => <ProtectedRoute component={StudentDashboard} {...params} />}</Route>
      <Route path="/my-packages">{(params) => <ProtectedRoute component={MyPackages} {...params} />}</Route>
      <Route path="/packages/:id/learn">{(params) => <ProtectedRoute component={PackageLearn} {...params} />}</Route>
      <Route path="/packages/:id/quizzes">{(params) => <ProtectedRoute component={PackageQuizzes} {...params} />}</Route>
      <Route path="/quiz/:id">{(params) => <ProtectedRoute component={QuizDetail} {...params} />}</Route>
      <Route path="/packages/:id/tryouts">{(params) => <ProtectedRoute component={PackageTryouts} {...params} />}</Route>
      <Route path="/tryout/:id">{(params) => <ProtectedRoute component={CBTTryout} {...params} />}</Route>
      <Route path="/tryout/:id/result/:attemptId">{(params) => <ProtectedRoute component={TryoutResult} {...params} />}</Route>
      <Route path="/orders">{(params) => <ProtectedRoute component={StudentOrders} {...params} />}</Route>
      <Route path="/orders/:id">{(params) => <ProtectedRoute component={OrderDetail} {...params} />}</Route>
      
      {/* Referral Holder */}
      <Route path="/dashboard-referal-holder">{(params) => <ProtectedRoute component={DashboardReferalHolder} holderOnly {...params} />}</Route>

      {/* Admin Area */}
      <Route path="/dashboard-admin">{(params) => <ProtectedRoute component={DashboardAdmin} adminOnly {...params} />}</Route>
      <Route path="/admin">{(params) => <ProtectedRoute component={AdminDashboard} adminOnly {...params} />}</Route>
      <Route path="/admin/orders">{(params) => <ProtectedRoute component={AdminOrders} adminOnly {...params} />}</Route>
      <Route path="/admin/packages">{(params) => <ProtectedRoute component={AdminPackages} adminOnly {...params} />}</Route>
      <Route path="/admin/questions">{(params) => <ProtectedRoute component={AdminQuestions} adminOnly {...params} />}</Route>
      <Route path="/admin/tryouts">{(params) => <ProtectedRoute component={AdminTryouts} adminOnly {...params} />}</Route>
      <Route path="/admin/quizzes">{(params) => <ProtectedRoute component={AdminQuizzes} adminOnly {...params} />}</Route>
      <Route path="/admin/users">{(params) => <ProtectedRoute component={AdminUsers} adminOnly {...params} />}</Route>
      <Route path="/admin/bank-accounts">{(params) => <ProtectedRoute component={AdminBankAccounts} adminOnly {...params} />}</Route>
      <Route path="/admin/payment-settings">{(params) => <ProtectedRoute component={AdminPaymentSettings} adminOnly {...params} />}</Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
