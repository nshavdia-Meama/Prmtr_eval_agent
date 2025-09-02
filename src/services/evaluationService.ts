import { prisma } from "../db/prisma";
import { PlannerAgent } from "../agents/plannerAgent";
import { ExecutionAgent } from "../agents/executionAgent";
import {
  EvaluationRequest,
  EvaluationResponse,
  AgentContext,
} from "../types/evaluation";

export class EvaluationService {
  private plannerAgent: PlannerAgent;
  private executionAgent: ExecutionAgent;

  constructor() {
    this.plannerAgent = new PlannerAgent();
    this.executionAgent = new ExecutionAgent();
  }

  // Run planner → execution → persist → return DTO
  async evaluateQuery(request: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      console.log("Starting evaluation for prompt:", request.prompt);

      // Agent context
      const context: AgentContext = {
        prompt: request.prompt,
        meamaContext: this.getMeamaContext(),
        prmtrContext: this.getPrmtrContext(),
      };

      // 1) Plan
      console.log("Creating evaluation plan…");
      const plan = await this.plannerAgent.createPlan(context);
      console.log("Plan created with", Array.isArray(plan) ? plan.length : 0, "steps");

      // 2) Execute
      console.log("Executing evaluation plan…");
      const executionResult = await this.executionAgent.executePlan(context, plan);
      console.log("Execution completed:", executionResult.success ? "success" : "failure");

      if (!executionResult.success) {
        // Optional: persist failure (requires schema fields), or just throw:
        throw new Error(executionResult.error || "Execution failed");
      }

      // 3) Persist in DB
      console.log("Storing result in database…");
      const evaluationResult = await prisma.evaluationResult.create({
        data: {
          prompt: request.prompt,
          result: executionResult.result || "", // result is required by schema
          assessment: executionResult.assessment ?? null,
          // ensure JSON-serializable object (Prisma.JsonValue)
          metadata: (executionResult.metadata as any) ?? {},
        },
      });

      console.log("Evaluation completed successfully");

      return {
        id: evaluationResult.id,
        prompt: evaluationResult.prompt,
        result: evaluationResult.result,
        assessment: evaluationResult.assessment ?? undefined,
        metadata: (evaluationResult.metadata as Record<string, unknown>) ?? undefined,
        createdAt: evaluationResult.createdAt,
      };
    } catch (error) {
      console.error("Evaluation service error:", error);
      throw new Error(
        `Evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getEvaluationHistory(limit = 10): Promise<EvaluationResponse[]> {
    try {
      const results = await prisma.evaluationResult.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      return results.map((r) => ({
        id: r.id,
        prompt: r.prompt,
        result: r.result,
        assessment: r.assessment ?? undefined,
        metadata: (r.metadata as Record<string, unknown>) ?? undefined,
        createdAt: r.createdAt,
      }));
    } catch (error) {
      console.error("Error fetching evaluation history:", error);
      throw new Error("Failed to fetch evaluation history");
    }
  }

  async getEvaluationById(id: string): Promise<EvaluationResponse | null> {
    try {
      const r = await prisma.evaluationResult.findUnique({ where: { id } });
      if (!r) return null;

      return {
        id: r.id,
        prompt: r.prompt,
        result: r.result,
        assessment: r.assessment ?? undefined,
        metadata: (r.metadata as Record<string, unknown>) ?? undefined,
        createdAt: r.createdAt,
      };
    } catch (error) {
      console.error("Error fetching evaluation by ID:", error);
      throw new Error("Failed to fetch evaluation");
    }
  }

  private getMeamaContext(): string {
    return `
Meama is a comprehensive e-commerce analytics and business intelligence platform that helps businesses:
- Track sales performance and revenue metrics
- Analyze customer behavior and segmentation
- Monitor inventory and supply chain metrics
- Generate actionable insights for business growth
- Provide real-time dashboards and reporting
- Support multi-channel e-commerce operations
    `.trim();
  }

  private getPrmtrContext(): string {
    return `
Prmtr AI is an advanced analytics platform that provides:
- Natural language querying of business data
- AI-powered insights and recommendations
- Automated data analysis and reporting
- Integration with various data sources
- Real-time analytics and visualization
- Predictive analytics capabilities
    `.trim();
  }

  // Optional: call from process signal handlers in index.ts
  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}
