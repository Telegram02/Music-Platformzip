import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import ResetPassword from "@/pages/admin/ResetPassword";
import { useEffect, useRef } from "react";

const queryClient = new QueryClient();

function VisitTracker() {
  const [location] = useLocation();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (location.startsWith("/admin")) return;
    if (lastTracked.current === location) return;
    lastTracked.current = location;
    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location, referrer: document.referrer }),
    }).catch(() => {});
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <VisitTracker />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/reset-password" component={ResetPassword} />
        <Route path="/admin" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
