import { SAKURA_API_ENDPOINTS } from "../types/api";
const guide = `# SakuraEdu 本地业务使用说明\n\n1. 管理员先建立学期、课程、班级、学生与任教关系。\n2. 作业先创建草稿，再发布；登记正文后人工评分。退回订正保留历史。\n3. 教案支持文本、标签、私有/校内共享与修改历史，可关联作业与课时。\n4. 新课表使用具体日期；调代课提交后等待管理员审批，审批时再次检查冲突。\n5. 建立考试后下载 CSV 模板，校验预览，再确认导入。缺考与未评分不计入均分。\n6. 学生档案与家校页共用联系人、站内记录、辅导与关怀待办。\n7. 顶部搜索查询实际资源；通知来自真实操作，并遵循北京时间的免打扰窗口。\n\n未连接：AI、OCR、外部家长投递、扫码/短信登录、投屏设备。当前不提供这些能力的模拟成功。\n\n个人功能面板展示当前账号信息。真实模式请求失败时保留输入并显示错误；版本冲突需刷新后核对。\n`;
export function KnowledgeBaseView({
  onReturnToWorkspace,
  onOpenSqlBlueprint,
}: {
  onReturnToWorkspace: () => void;
  onOpenSqlBlueprint?: () => void;
  showToast: (message: string) => void;
}) {
  const download = () => {
    const url = URL.createObjectURL(
        new Blob([guide], { type: "text/markdown;charset=utf-8" }),
      ),
      link = document.createElement("a");
    link.href = url;
    link.download = "SakuraEdu-business-guide.md";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <main className="h-screen overflow-y-auto bg-background text-on-surface p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-bold text-2xl">SakuraEdu 业务说明</h1>
          <button
            className="sakura-btn sakura-btn-secondary"
            onClick={onReturnToWorkspace}
          >
            返回
          </button>
        </header>
        <article className="border border-outline-variant rounded-xl p-5 whitespace-pre-wrap leading-relaxed">
          {guide}
        </article>
        <div className="flex flex-wrap gap-3">
          <button className="sakura-btn sakura-btn-primary" onClick={download}>
            下载使用说明 MD
          </button>
          {onOpenSqlBlueprint ? (
            <button
              className="sakura-btn sakura-btn-secondary"
              onClick={onOpenSqlBlueprint}
            >
              打开个人功能
            </button>
          ) : null}
        </div>
        <h2 className="text-xl font-bold">当前核心接口</h2>
        {SAKURA_API_ENDPOINTS.map((endpoint) => (
          <details
            key={endpoint.id}
            className="border border-outline-variant rounded-xl p-4"
          >
            <summary className="font-semibold cursor-pointer">
              {endpoint.module} · {endpoint.method} {endpoint.path}
            </summary>
            <p className="mt-3">{endpoint.summary}</p>
            <p className="text-sm break-all">请求：{endpoint.requestSchema}</p>
            <p className="text-sm break-all">数据：{endpoint.boundTable}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
