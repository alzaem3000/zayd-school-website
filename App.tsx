import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "./toaster";
import { TooltipProvider } from "./tooltip";
import { ThemeProvider } from "./theme-provider";
import { useAuth } from "./useAuth";
import Landing from "./landing";
import Login from "./login";
import Home from "./home";
import Principal from "./principal";
import CyclesSettings from "./cycles-settings";
import Onboarding from "./onboarding";
import NotFound from "./not-found";
import type { User } from "./schema";
import { useEffect } from "react";
import { OfflineBanner } from "./offline-banner";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: isAuthenticated,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const isAdminOrCreator = user.role === "admin" || user.role === "creator";
      const needsOnboarding = user.role === "teacher" && !user.onboardingCompleted;

      if (needsOnboarding && location !== "/onboarding") {
        setLocation("/onboarding");
      } else if (!needsOnboarding && location === "/onboarding") {
        setLocation("/home");
      } else if (isAdminOrCreator && location === "/home") {
        setLocation("/principal");
      } else if (!isAdminOrCreator && location === "/principal") {
        setLocation("/home");
      }
    }
  }, [isLoading, isAuthenticated, user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/principal" component={Principal} />
          <Route path="/principal/cycles" component={CyclesSettings} />
          <Route path="/onboarding" component={Onboarding} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="school-ui-theme">
        <TooltipProvider>
          <OfflineBanner />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
