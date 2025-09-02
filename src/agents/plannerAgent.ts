import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "langchain/prompts";
import { AgentContext, PlannerStep } from "../types/evaluation";

export class PlannerAgent {
  private model: ChatGoogleGenerativeAI;
  private planningPrompt: PromptTemplate;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      temperature: 0.1,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    this.planningPrompt = PromptTemplate.fromTemplate(`
You are an expert planning agent for evaluating business intelligence queries using Prmtr AI.

Context:
- Meama Products: E-commerce analytics and business intelligence platform
- Prmtr AI: AI-powered analytics and insights platform
- User Query: {prompt}

Your task is to create a detailed step-by-step plan for evaluating this query using Prmtr AI.

Consider:
1. What specific data points need to be analyzed
2. How to structure the query for Prmtr AI
3. What metrics or KPIs are relevant
4. How to assess the quality and relevance of the response

Create a numbered list of steps that will guide the execution agent.

Response format:
1. Step 1: [Action] - [Description] - Expected: [Expected Output]
2. Step 2: [Action] - [Description] - Expected: [Expected Output]
...

Plan:
`);
  }

  async createPlan(context: AgentContext): Promise<PlannerStep[]> {
    try {
      const formattedPrompt = await this.planningPrompt.format({
        prompt: context.prompt,
      });

      const response = await this.model.invoke(formattedPrompt);

      const planText = (response as any).content[0]?.text || (response as any).text || "";
      return this.parsePlan(planText);
    } catch (error) {
      console.error("Error creating plan:", error);
      throw new Error("Failed to create evaluation plan");
    }
  }

  private parsePlan(planText: string): PlannerStep[] {
    const steps: PlannerStep[] = [];
    const lines = planText.split("\n").filter(line => line.trim());
  
    const stepRegex = /^(\d+)\.\s*Step\s*\d*:\s*(.+?)\s*-\s*(.+?)\s*-\s*Expected:\s*(.+)$/i;
  
    for (const line of lines) {
      const match = line.match(stepRegex);
      if (match) {
        steps.push({
          step: parseInt(match[1]),
          action: match[2].trim(),
          description: match[3].trim(),
          expectedOutput: match[4].trim(),
        });
      }
    }
  
    return steps.length > 0
      ? steps
      : [
          {
            step: 1,
            action: "Analyze Query",
            description: "Understand the business intelligence query requirements",
            expectedOutput: "Query analysis completed",
          },
          {
            step: 2,
            action: "Call Prmtr API",
            description: "Execute the query using Prmtr AI API",
            expectedOutput: "AI response received",
          },
          {
            step: 3,
            action: "Evaluate Response",
            description: "Assess the quality and relevance of the AI response",
            expectedOutput: "Response evaluation completed",
          },
        ];
  }
  
}
