import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "./toaster";
import { TooltipProvider } from "./tooltip";
import { ThemeProvider } from "./theme-provider";
import { useAuth } from "./useAuth";
import type { User } from "./schema";
import { OfflineBanner } from "./offline-banner";

const Landing = lazy(() => import("./landing"));
const Login = lazy(() => import("./login"));
const Home = lazy(() => import("./home"));
const Principal = lazy(() => import("./principal"));
const CyclesSettings = lazy(() => import("./cycles-settings"));
const Onboarding = lazy(() => import("./onboarding"));
const NotFound = lazy(() => import("./not-found"));

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
}

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
    return <AppLoader />;
  }

  return (
    <Suspense fallback={<AppLoader />}>
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
    </Suspense>
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
