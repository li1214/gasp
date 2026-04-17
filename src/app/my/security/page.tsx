import Link from "next/link";

import { PasswordForm } from "@/components/password-form";
import { requireUser } from "@/lib/session";

export default async function MySecurityPage() {
  await requireUser();

  return (
    <main className="shell space-y-4">
      <section className="app-card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">修改密码</h1>
          <Link href="/my" className="icon-chip">返回我的</Link>
        </div>
      </section>

      <PasswordForm />
    </main>
  );
}