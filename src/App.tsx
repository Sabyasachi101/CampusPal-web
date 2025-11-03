import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { lazy, Suspense } from "react";

// Lazy load pages for faster initial load
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Feed = lazy(() => import("./pages/Feed"));
const Chat = lazy(() => import("./pages/Chat"));
const Events = lazy(() => import("./pages/Events"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Clubs = lazy(() => import("./pages/Clubs"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const StudyCorner = lazy(() => import("./pages/StudyCorner"));
const LostFound = lazy(() => import("./pages/LostFound"));
const Directory = lazy(() => import("./pages/Directory"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />}/>
              <Route path="/feed" element={<Feed />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/events" element={<Events />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/study-corner" element={<StudyCorner />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/admin" element={<Feed />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
