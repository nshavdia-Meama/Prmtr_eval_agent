export interface EvaluationRequest {
  prompt: string;
  context?: string;
}

export interface EvaluationResponse {
  id: string;
  prompt: string;
  result: string;
  assessment?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface PrmtrApiResponse {
  response: string;
  metadata?: Record<string, any>;
}

export interface PlannerStep {
  step: number;
  action: string;
  description: string;
  expectedOutput: string;
}

export interface ExecutionResult {
  success: boolean;
  result: string;
  assessment: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface AgentContext {
  prompt: string;
  meamaContext: string;
  prmtrContext: string;
}

// LangChain message types
export interface LangChainMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
