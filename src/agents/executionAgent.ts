import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "langchain/prompts";
import { HumanMessage } from "langchain/schema";
import axios from "axios";
import { AgentContext, ExecutionResult, PlannerStep, PrmtrApiResponse } from "../types/evaluation";

export class ExecutionAgent {
  private model: ChatGoogleGenerativeAI;
  private evaluationPrompt: PromptTemplate;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      temperature: 0.1,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    this.evaluationPrompt = PromptTemplate.fromTemplate(`
You are an expert evaluation agent for assessing AI-generated business intelligence responses.

Context:
- Original Query: {originalQuery}
- AI Response: {aiResponse}
- Expected Analysis: {expectedAnalysis}

Evaluate the AI response based on:
1. Relevance to the original query
2. Accuracy of the information provided
3. Completeness of the analysis
4. Clarity and understandability
5. Actionability of insights

Provide a comprehensive assessment with:
- Overall quality score (1-10)
- Strengths of the response
- Areas for improvement
- Recommendations

Assessment:
`);
  }

  async executePlan(
    context: AgentContext,
    plan: PlannerStep[]
  ): Promise<ExecutionResult> {
    try {
      console.log("Starting execution of plan with", plan.length, "steps");

      // Step 1: Call Prmtr API
      const prmtrResponse = await this.callPrmtrAPI(context.prompt);
      console.log("Prmtr API response received");

      // Step 2: Evaluate the response
      const assessment = await this.evaluateResponse(
        context.prompt,
        prmtrResponse.response,
        plan
      );
      console.log("Response evaluation completed");

      return {
        success: true,
        result: prmtrResponse.response,
        assessment,
        metadata: {
          planSteps: plan.length,
          prmtrMetadata: prmtrResponse.metadata,
          executionTimestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Execution failed:", error);
      return {
        success: false,
        result: "",
        assessment: "Execution failed",
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          errorTimestamp: new Date().toISOString(),
        },
      };
    }
  }

  private async callPrmtrAPI(prompt: string): Promise<PrmtrApiResponse> {
    try {
      const url = process.env.PRMTR_API_URL?.endsWith("/query")
        ? process.env.PRMTR_API_URL
        : `${process.env.PRMTR_API_URL}/query`;
  
      const response = await axios.post(
        url,
        {
          query: prompt,
          context: "E-commerce analytics and business intelligence",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PRMTR_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
  
      return {
        response: response.data.response || response.data.answer || response.data.result || JSON.stringify(response.data),
        metadata: response.data.metadata || {},
      };
    } catch (error) {
      console.error("Prmtr API call failed:", error);
  
      if (process.env.NODE_ENV === "development") {
        return {
          response: `Simulated response for: "${prompt}"`,
          metadata: { fallback: true, timestamp: new Date().toISOString() },
        };
      }
  
      throw new Error(`Prmtr API call failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async evaluateResponse(
    originalQuery: string,
    aiResponse: string,
    plan: PlannerStep[]
  ): Promise<string> {
    try {
      const expectedAnalysis = plan
        .map(step => `${step.step}. ${step.action}: ${step.description}`)
        .join("\n");

      const formattedPrompt = await this.evaluationPrompt.format({
        originalQuery,
        aiResponse,
        expectedAnalysis,
      });

      const response = await this.model.invoke(formattedPrompt);

      return (response as any).content as string;
    } catch (error) {
      console.error("Evaluation failed:", error);
      return "Evaluation failed due to technical error";
    }
  }
}
