import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <Navbar />
      <main className="flex-1 container py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}