import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6 md:py-8">
        {children}
      </main>
      <footer className="border-t bg-card/50 py-6 mt-12">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © 2024 Crisis Decision Support System
          </p>
          <p>
            Built for Consumer Electronics Safety Analysis
          </p>
        </div>
      </footer>
    </div>
  );
}
