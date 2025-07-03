import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { FirebaseChatProvider } from "@/contexts/FirebaseChatContext";

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
    <html lang="en">
      <body>
        <AuthProvider>
          <FirebaseChatProvider>
            {children}
          </FirebaseChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}