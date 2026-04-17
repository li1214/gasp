import type { Metadata } from "next";

import "./globals.css";

import { RootChrome } from "@/components/root-chrome";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "三国志战略版账号展示平台",
  description: "移动端优先的账号展示、发布与审核平台"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="zh-CN">
      <body>
        <RootChrome
          user={
            user
              ? {
                  id: user.id,
                  role: user.role
                }
              : null
          }
        >
          {children}
        </RootChrome>
      </body>
    </html>
  );
}