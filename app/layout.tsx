import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardShell from "@/components/DashboardShell";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevFlow | Developer Onboarding Control",
  description: "Streamline your software project management and developer onboarding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <ConfirmProvider>
            <DashboardShell>
              {children}
            </DashboardShell>
            <Toaster position="bottom-right" />
          </ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
