import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="shell py-6 max-w-xl pb-28 space-y-3">
      <section className="app-card hero-gradient p-5">
        <h1 className="text-xl font-bold text-white">注册账号</h1>
        <p className="text-sm text-white/85 mt-1">注册后可实名发布账号信息。</p>
      </section>
      <AuthForm mode="register" />
    </main>
  );
}