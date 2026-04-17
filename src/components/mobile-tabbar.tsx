"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, UserCircle2 } from "lucide-react";

export function MobileTabbar({
  isLoggedIn
}: {
  isLoggedIn: boolean;
}) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "首页", icon: Home },
    { href: "/market", label: "检索", icon: Compass },
    { href: isLoggedIn ? "/my" : "/auth/login", label: "我的", icon: UserCircle2 }
  ];

  return (
    <div className="mobile-tabbar-shell" aria-hidden={false}>
      <nav className="mobile-tabbar" aria-label="底部导航">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={`tab-item ${active ? "active" : ""}`}
            >
              <span className="tab-item-icon">
                <Icon size={18} />
              </span>
              <span className="tab-item-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
