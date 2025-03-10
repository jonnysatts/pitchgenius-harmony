
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services/api/queryClient";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Dashboard from "@/pages/Dashboard";
import ProjectDetail from "@/pages/ProjectDetail";
import NewProject from "@/pages/NewProject";
import NotFound from "@/pages/NotFound";
import Diagnostics from "@/pages/Diagnostics";

// Providers
import { AuthProvider } from "@/context/AuthContext";

import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Standardize on /project/:id for project details */}
              <Route path="/project/:id" element={<ProjectDetail />} />
              
              {/* Support legacy /projects/:id for compatibility */}
              <Route path="/projects/:id" element={<ProjectDetail />} />
              
              {/* New project routes */}
              <Route path="/new-project" element={<NewProject />} />
              <Route path="/projects/new" element={<Navigate to="/new-project" replace />} />
              
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
          <SonnerToaster position="bottom-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
