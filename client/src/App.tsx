import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";

// Pages
import NotFound from "@/pages/not-found";
import NewCasePage from "@/pages/new-case";
import CaseDetailsPage from "@/pages/case-details";
import HistoryPage from "@/pages/history";
import SettingsPage from "@/pages/settings";

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans dir-rtl">
      <Sidebar />
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-screen scroll-smooth">
        <AnimatePresence mode="wait">
          <Switch>
            <Route path="/" component={NewCasePage} />
            <Route path="/case/:id" component={CaseDetailsPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
