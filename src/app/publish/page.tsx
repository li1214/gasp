import { redirect } from "next/navigation";
import { BadgeCheck, Images, ShieldCheck, WandSparkles } from "lucide-react";

import { PublishForm } from "@/components/publish-form";
import { requireUser } from "@/lib/session";

export default async function PublishPage() {
  const user = await requireUser();

  if (!user.verifiedAt || !user.realName || !user.idCardNo) {
    redirect("/realname?redirect=/publish");
  }

  return (
    <main className="shell py-4 pb-28 max-w-5xl space-y-4">
      <section className="publish-hero">
        <div className="publish-hero-bg" />
        <div className="publish-hero-content">
          <p className="publish-hero-kicker">发布中心</p>
          <h1 className="publish-hero-title">三国志战略版账号发布</h1>
          <p className="publish-hero-desc">
            信息填写越完整，曝光与咨询转化越高。请确保封面清晰、详情图真实、联系方式可用。
          </p>
          <div className="publish-hero-list">
            <div className="publish-hero-item">
              <ShieldCheck size={16} />
              实名认证账号可发布
            </div>
            <div className="publish-hero-item">
              <Images size={16} />
              图片自动压缩存储
            </div>
            <div className="publish-hero-item">
              <WandSparkles size={16} />
              支持详情图替换与追加
            </div>
            <div className="publish-hero-item">
              <BadgeCheck size={16} />
              发布后进入审核流程
            </div>
          </div>
        </div>
      </section>

      <PublishForm />
    </main>
  );
}
