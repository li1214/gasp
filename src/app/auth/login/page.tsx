import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="shell py-6 max-w-xl pb-28 space-y-3">
      <section className="app-card hero-gradient p-5">
        <h1 className="text-xl font-bold text-white">用户登录</h1>
        <p className="text-sm text-white/85 mt-1">登录后可收藏、砍价、发布账号。</p>
      </section>
      <AuthForm mode="login" />
    </main>
  );
}