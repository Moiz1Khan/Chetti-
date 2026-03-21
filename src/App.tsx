import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/use-theme";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import ChatbotsPage from "./pages/dashboard/ChatbotsPage";
import ChatbotBuilderPage from "./pages/dashboard/ChatbotBuilderPage";
import KnowledgeBasePage from "./pages/dashboard/KnowledgeBasePage";
import ChatPage from "./pages/dashboard/ChatPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import ApiKeysPage from "./pages/dashboard/ApiKeysPage";
import ApiDocsPage from "./pages/dashboard/ApiDocsPage";
import BillingPage from "./pages/dashboard/BillingPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import AdminPage from "./pages/dashboard/AdminPage";
import NotFound from "./pages/NotFound";
import PublicChatbot from "./pages/PublicChatbot";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import ChangelogPage from "./pages/ChangelogPage";
import DocumentationPage from "./pages/DocumentationPage";
import ApiReferencePage from "./pages/ApiReferencePage";
import BlogPage from "./pages/BlogPage";
import CommunityPage from "./pages/CommunityPage";
import AboutPage from "./pages/AboutPage";
import CareersPage from "./pages/CareersPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import MissingSupabaseConfig from "@/components/MissingSupabaseConfig";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!isSupabaseConfigured ? (
          <MissingSupabaseConfig />
        ) : (
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="/api-reference" element={<ApiReferencePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/chatbot/:chatbotId" element={<PublicChatbot />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="chatbots" element={<ChatbotsPage />} />
                <Route path="chatbots/builder/:id" element={<ChatbotBuilderPage />} />
                <Route path="chatbots/chat/:chatbotId" element={<ChatPage />} />
                <Route path="knowledge" element={<KnowledgeBasePage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="api-keys" element={<ApiKeysPage />} />
                <Route path="api-docs" element={<ApiDocsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="admin" element={<AdminPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        )}
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
