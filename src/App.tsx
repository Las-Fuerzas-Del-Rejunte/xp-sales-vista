import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { AppProvider } from './contexts/SupabaseAppContext';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BootScreen from './pages/BootScreen';

const queryClient = new QueryClient();

const App = () => {
  const [bootDone, setBootDone] = useState(false);

  if (!bootDone) {
    return <BootScreen onFinish={() => setBootDone(true)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
