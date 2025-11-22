export interface ToolCallFunction {
  name: string;
  arguments: string | Record<string, any>;
}

export interface ToolCall {
  id: string;
  function: ToolCallFunction;
}

export interface Message {
  toolCalls: ToolCall[];
}

export interface VapiRequest {
  message: Message;
}

export interface ToolCallResult {
  toolCallId: string;
  result: any;
}

export interface ApiResponse {
  results: ToolCallResult[];
}
