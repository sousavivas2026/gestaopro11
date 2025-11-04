import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { FloatingAISearch } from "./FloatingAISearch";
import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-2"
              onClick={() => setShowFloatingSearch(!showFloatingSearch)}
            >
              <Sparkles className="h-4 w-4" />
              Pesquisa Inteligente
            </Button>
          </header>
          <div className="p-6">{children}</div>
        </main>
        
        {/* Floating AI Search - Global */}
        {showFloatingSearch && (
          <FloatingAISearch onClose={() => setShowFloatingSearch(false)} />
        )}
        
        {/* Floating Search Button */}
        {!showFloatingSearch && (
          <Button 
            onClick={() => setShowFloatingSearch(true)}
            className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50"
            variant="default"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        )}
      </div>
    </SidebarProvider>
  );
}
