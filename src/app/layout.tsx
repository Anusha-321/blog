'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { PostsProvider, usePosts } from "@/context/PostsContext";
import { Loader2 } from "lucide-react";
import Auth from "@/components/Auth";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopNav from "@/components/TopNav";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = usePosts();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth modal only for create/edit pages
  const requiresAuth = pathname?.startsWith('/create') || pathname?.startsWith('/edit');

  if (!user && requiresAuth) {
    return <Auth />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />
      <TopNav />
      <main className="flex-1 md:ml-64 transition-all duration-300 pt-20 md:pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Blogu - Share Your Story</title>
        <meta name="description" content="A modern blog platform powered by AI" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <PostsProvider>
          <AppContent>{children}</AppContent>
        </PostsProvider>
      </body>
    </html>
  );
}
