import {
  EssayDiagnosticRequest,
  EssayDiagnosticResponse,
  LessonCopilotRequest,
  LessonCopilotResponse,
  SakuraAIConfig,
} from '../types/sakura';

/**
 * SakuraAIService
 * 预留的 AI 教研与学情诊断服务接口层（先留接口，不写配置）
 * 后续对接真实大模型时，只需在 configure() 或环境变量中接入即可，无需改动业务组件调用代码。
 */
class SakuraAIService {
  private config: SakuraAIConfig = {
    enabled: false,
    endpoint: '/api/sakura-ai',
    modelAlias: 'reserved-sakura-edu-model',
  };

  /**
   * 预留配置注入入口（当前默认不启用外部请求，直接返回高保真教研结构化数据）
   */
  public configure(nextConfig: Partial<SakuraAIConfig>): void {
    this.config = { ...this.config, ...nextConfig };
  }

  public getConfig(): Readonly<SakuraAIConfig> {
    return this.config;
  }

  /**
   * 1. 作业批阅工坊：单篇答卷切片诊断接口
   */
  public async diagnoseEssaySlice(
    request: EssayDiagnosticRequest
  ): Promise<EssayDiagnosticResponse> {
    // 预留真实接口调用点：if (this.config.enabled) { ... }
    await new Promise((resolve) => setTimeout(resolve, 350));

    return {
      suggestedScore: Math.min(request.rubricMaxScore, 98),
      overallRate: '98% (极优)',
      strengthTitle: '亮点萃取：思维深刻性与词藻',
      strengthDetail:
        '准确提炼老庄“齐物”与儒家“仁爱”在贬谪文学中的互渗，论证结构自成严密体系。',
      improvementTitle: '提分锦囊：逻辑连词优化',
      improvementDetail:
        '第二段文意转折可引用苏轼《定风波》互证，拓展纵深空间，已生成强化微课卡片。',
      recommendedPractice: '《前赤壁赋》与《后赤壁赋》心境对勘 3道题',
    };
  }

  /**
   * 2. 作业批阅工坊：AI 智能批量初批接口
   */
  public async batchPreGradeEssays(
    classId: string,
    pendingCount: number
  ): Promise<{ processedCount: number; averageScore: number; summary: string }> {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return {
      processedCount: pendingCount,
      averageScore: 89.2,
      summary: `${classId} 剩余 ${pendingCount} 份主观卷已完成 OCR 语义切片与初批赋分，标出 2 份高潜范文与 1 份建议面批卷。`,
    };
  }

  /**
   * 3. 备课教案库：Sakura-Copilot 备课灵感生成接口
   */
  public async generateLessonInspiration(
    request: LessonCopilotRequest
  ): Promise<LessonCopilotResponse> {
    await new Promise((resolve) => setTimeout(resolve, 380));

    const promptText = request.prompt.trim();
    if (promptText.includes('角色扮演') || promptText.includes('分工')) {
      return {
        title: '小组角色扮演任务单',
        highlightText: '周朴园 · 鲁侍萍 · 周萍 · 繁漪 四维人物潜台词实验剧场',
        summary:
          '已生成 15 分钟课堂微剧场分工卡：包含台词重音标注、舞台走位图解及同伴互评量表（契合审美鉴赏核心素养）。',
        tags: ['# 戏剧张力演练', '# 小组任务单'],
        generatedAt: '刚刚',
      };
    }

    if (promptText.includes('文言') || promptText.includes('虚词')) {
      return {
        title: '文言情境虚词通关题组',
        highlightText: '【滚绣球】与《促织》高频虚词“向、方、顾、乃”语境辨析',
        summary:
          '已结合高考一轮真题语料库，生成 4 道情境化对比微测题，附带字源演变助记卡与课堂投屏解析页。',
        tags: ['# 文言实虚词', '# 随堂微测'],
        generatedAt: '刚刚',
      };
    }

    return {
      title: '今日灵感推荐',
      highlightText: `《${request.unitTitle || '雷雨'}》核心矛盾冲突思维导图与导入设计`,
      summary: promptText
        ? `针对指令「${promptText}」：已生成沉浸式课堂导入语与 3 组递进式主问题链，可直接插入当前主备教案。`
        : '已为您生成《雷雨》核心矛盾冲突思维导图：周朴园(伪善专制) ⚔️ 繁漪(雷雨式暴烈)，包含3组引导提问。',
      tags: ['# 核心素养·审美鉴赏', '# 课堂导入链'],
      generatedAt: '刚刚',
    };
  }

  /**
   * 4. 考务与成绩分析：Sakura-Insight 学情推演接口
   */
  public async analyzeExamCohort(examId: string): Promise<{
    confidence: string;
    coreConclusion: string;
    detailAnalysis: string;
    tacticalAdvice: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    void examId;
    return {
      confidence: '98.4%',
      coreConclusion: '核心结论：文言断句通假实词为最大阻滞点',
      detailAnalysis:
        '全班在第 11-13 题文言实词推断（尤其是「数、伐、存、除」等多义词语境判断）平均得分率低于年级 7.2 个百分点；导致第 14 题文意概括连带扣分。',
      tacticalAdvice:
        '💡 战术建议：未来两周晨读启动《古文观止》选篇精练，每天专项训练 2 道断句与虚词通关题。',
    };
  }
}

export const sakuraAIService = new SakuraAIService();
