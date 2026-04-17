import Link from "next/link";

import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/session";

export default async function MyProfilePage() {
  const user = await requireUser();

  return (
    <main className="shell space-y-4">
      <section className="app-card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">修改个人信息</h1>
          <Link href="/my" className="icon-chip">返回我的</Link>
        </div>
      </section>

      <ProfileForm nickname={user.nickname} realName={user.realName} />
    </main>
  );
}