import type { Metadata } from "next";
import { K2D, Barlow } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

const k2d = K2D({
  subsets: ["latin"],
  variable: "--font-k2d",
  weight: ["300", "400", "500", "600", "700"],
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hệ thống KPI - Đại học Cần Thơ",
  description: "Hệ thống quản lý và đánh giá KPI theo mô hình MBO/BSC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${k2d.variable} ${barlow.variable} antialiased`}>
        <div className="flex min-h-screen">
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  );
}
