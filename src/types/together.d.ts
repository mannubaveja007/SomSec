declare module 'together' {
  export interface ChatCompletionMessage {
    role: string;
    content: string;
  }

  export interface ChatCompletionChoice {
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }

  export interface ChatCompletionResponse {
    id: string;
    choices: ChatCompletionChoice[];
    created: number;
    model: string;
    object: string;
  }

  export interface TogetherOptions {
    apiKey?: string;
  }

  export interface ResponseFormat {
    type: string;
  }

  export default class Together {
    constructor(options?: TogetherOptions);
    
    chat: {
      completions: {
        create(options: {
          model: string;
          messages: ChatCompletionMessage[];
          response_format?: ResponseFormat;
          temperature?: number;
          max_tokens?: number;
        }): Promise<ChatCompletionResponse>;
      };
    };
  }
}
