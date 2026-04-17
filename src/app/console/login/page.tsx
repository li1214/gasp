import { Radar, ShieldCheck, Sparkles } from "lucide-react";

import { ConsoleLoginForm } from "@/components/console/console-login-form";

export default function ConsoleLoginPage() {
  return (
    <main className="console-login-wrap">
      <div className="console-login-grid" />
      <section className="console-login-panel">
        <header className="space-y-3">
          <p className="console-pill">SGZZ Console / Secure Access</p>
          <h1 className="text-3xl font-black tracking-wide text-white">后台指挥中心</h1>
          <p className="text-sm text-slate-300 leading-6">实时审核、用户权限管理、账号编辑、运营状态分析统一在此处理。</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="icon-chip !bg-white/10 !border-white/20 !text-blue-100"><Radar size={12} /> 实时监控</span>
            <span className="icon-chip !bg-white/10 !border-white/20 !text-blue-100"><ShieldCheck size={12} /> 权限校验</span>
            <span className="icon-chip !bg-white/10 !border-white/20 !text-blue-100"><Sparkles size={12} /> 图片压缩存储</span>
          </div>
        </header>

        <ConsoleLoginForm />
      </section>
    </main>
  );
}
