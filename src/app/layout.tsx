import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";

export const metadata: Metadata = {
  title: "Real-Time Chat App",
  description: "A modern real-time chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </AuthProvider>
  );
}