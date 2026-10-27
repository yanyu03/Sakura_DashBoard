import type {
  EssayDiagnosticRequest,
  EssayDiagnosticResponse,
  LessonCopilotRequest,
  LessonCopilotResponse,
  SakuraAIConfig,
} from "../types/sakura";
/** Reserved server integration boundary. Unconfigured AI never returns fabricated results. */
class SakuraAIService {
  private config: SakuraAIConfig = {
    enabled: false,
    endpoint: "/api/sakura-ai",
    modelAlias: "not-configured",
  };
  public configure(config: Partial<SakuraAIConfig>) {
    if (config.enabled)
      throw new Error("AI 服务尚未连接，请先配置真实的服务端提供方");
    this.config = { ...this.config, ...config, enabled: false };
  }
  public getConfig() {
    return { ...this.config };
  }
  public async diagnoseEssaySlice(
    _request: EssayDiagnosticRequest,
  ): Promise<EssayDiagnosticResponse> {
    throw new Error("AI 批阅尚未连接，请使用人工评分");
  }
  public async batchPreGradeEssays(
    _classId: string,
    _pendingCount: number,
  ): Promise<{
    processedCount: number;
    averageScore: number;
    summary: string;
  }> {
    throw new Error("OCR 与 AI 初批尚未连接");
  }
  public async generateLessonInspiration(
    _request: LessonCopilotRequest,
  ): Promise<LessonCopilotResponse> {
    throw new Error("AI 教案建议尚未连接，请使用文本教案编辑");
  }
  public async analyzeExamCohort(
    _examId: string,
  ): Promise<{
    confidence: string;
    coreConclusion: string;
    detailAnalysis: string;
    tacticalAdvice: string;
  }> {
    throw new Error("AI 成绩解读尚未连接，当前提供实际成绩统计");
  }
}
export const sakuraAIService = new SakuraAIService();
