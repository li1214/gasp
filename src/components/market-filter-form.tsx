"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

type Props = {
  keyword?: string;
  accountType?: string;
  supportBargain?: string;
  hasBigTransfer?: string;
  minPrice?: string;
  maxPrice?: string;
  serverName?: string;
};

export function MarketFilterForm(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="app-card p-4 space-y-3">
      <div>
        <h1 className="text-xl font-semibold">账号检索</h1>
        <p className="text-sm text-slate-500 mt-1">默认仅显示关键词，点击筛选图标展开更多条件。</p>
      </div>

      <form className="space-y-3" action="/market" method="get">
        <div className="search-top-row">
          <div className="search-keyword-wrap">
            <Search size={16} className="text-slate-400" />
            <input
              className="search-keyword-input"
              name="keyword"
              defaultValue={props.keyword || ""}
              placeholder="输入标题关键词"
            />
          </div>

          <button
            type="button"
            className={`icon-chip ${open ? "is-open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="更多筛选"
          >
            <SlidersHorizontal size={15} />
          </button>

          <button className="btn !px-4" type="submit">搜索</button>
        </div>

        {open ? (
          <div className="search-advanced-grid">
            <select className="field" name="accountType" defaultValue={props.accountType || ""}>
              <option value="">账号类型</option>
              <option value="LINGXI_OFFICIAL">灵犀官服</option>
              <option value="CHANNEL">渠道服</option>
            </select>

            <input className="field" name="serverName" defaultValue={props.serverName || ""} placeholder="所在服务器" />

            <select className="field" name="supportBargain" defaultValue={props.supportBargain || ""}>
              <option value="">砍价</option>
              <option value="true">可砍价</option>
              <option value="false">不议价</option>
            </select>

            <select className="field" name="hasBigTransfer" defaultValue={props.hasBigTransfer || ""}>
              <option value="">大跨</option>
              <option value="true">有大跨</option>
              <option value="false">无大跨</option>
            </select>

            <input className="field" name="minPrice" defaultValue={props.minPrice || ""} placeholder="最低价" />
            <input className="field" name="maxPrice" defaultValue={props.maxPrice || ""} placeholder="最高价" />
          </div>
        ) : (
          <>
            {props.accountType ? <input type="hidden" name="accountType" value={props.accountType} /> : null}
            {props.serverName ? <input type="hidden" name="serverName" value={props.serverName} /> : null}
            {props.supportBargain ? <input type="hidden" name="supportBargain" value={props.supportBargain} /> : null}
            {props.hasBigTransfer ? <input type="hidden" name="hasBigTransfer" value={props.hasBigTransfer} /> : null}
            {props.minPrice ? <input type="hidden" name="minPrice" value={props.minPrice} /> : null}
            {props.maxPrice ? <input type="hidden" name="maxPrice" value={props.maxPrice} /> : null}
          </>
        )}
      </form>
    </section>
  );
}
