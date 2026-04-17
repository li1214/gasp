import Link from "next/link";
import { redirect } from "next/navigation";

import { RealNameForm } from "@/components/realname-form";
import { requireUser } from "@/lib/session";

function safeRedirectPath(path?: string) {
  if (!path || !path.startsWith("/")) return "/publish";
  return path;
}

export default async function RealNamePage({
  searchParams
}: {
  searchParams: { redirect?: string };
}) {
  const user = await requireUser();
  const redirectTo = safeRedirectPath(searchParams?.redirect);

  if (user.verifiedAt && user.realName && user.idCardNo) {
    redirect(redirectTo);
  }

  return (
    <main className="shell max-w-xl space-y-4">
      <section className="app-card p-4 flex items-center justify-between">
        <h2 className="font-semibold">发布前实名认证</h2>
        <Link href="/my" className="icon-chip">
          返回我的
        </Link>
      </section>

      <RealNameForm initialRealName={user.realName} redirectTo={redirectTo} />
    </main>
  );
}
