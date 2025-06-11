import { Toaster } from "@/components/ui/toaster"; // For shadcn/ui toast
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // For sonner toasts
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Assuming these pages exist or will be created
// For this task, we only care about adding CodePreviewPage
// import Index from "./pages/Index"; // Example of an existing page
import NotFound from "./pages/NotFound"; // Must Include
import CodePreviewPage from "./pages/CodePreviewPage"; // Newly generated page

const queryClient = new QueryClient();

const App = () => {
  console.log("App.tsx loaded");
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster /> {/* For shadcn/ui toasts */}
      <SonnerToaster richColors position="top-right" /> {/* For Sonner toasts */}
      <BrowserRouter>
        <Routes>
          {/* Default route, can be a Homepage or a specific landing page */}
          {/* For now, let's assume CodePreviewPage can be a direct entry or the main page for this module */}
          <Route path="/" element={<CodePreviewPage />} /> 
          <Route path="/code-preview-page" element={<CodePreviewPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} /> {/* Always Include This Line As It Is. */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;