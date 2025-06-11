interface LLMResponse {
    content: string;
    model: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }
  
  export interface LLMProvider {
    name: string;
    models: string[];
    sendMessage: (messages: Array<{role: 'user' | 'assistant', content: string}>, model: string) => Promise<LLMResponse>;
  }
  
  class OpenAIProvider implements LLMProvider {
    name = 'OpenAI';
    models = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  
    async sendMessage(messages: Array<{role: 'user' | 'assistant', content: string}>, model: string): Promise<LLMResponse> {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }
  
      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
      };
    }
  }
  
  class AnthropicProvider implements LLMProvider {
    name = 'Anthropic';
    models = ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'];
  
    async sendMessage(messages: Array<{role: 'user' | 'assistant', content: string}>, model: string): Promise<LLMResponse> {
      // Convert messages to Anthropic format
      const anthropicMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
  
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          messages: anthropicMessages,
        }),
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${error}`);
      }
  
      const data = await response.json();
      return {
        content: data.content[0].text,
        model: data.model,
        usage: data.usage ? {
          prompt_tokens: data.usage.input_tokens,
          completion_tokens: data.usage.output_tokens,
          total_tokens: data.usage.input_tokens + data.usage.output_tokens,
        } : undefined,
      };
    }
  }
  
  class GeminiProvider implements LLMProvider {
    name = 'Google';
    models = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
  
    async sendMessage(messages: Array<{role: 'user' | 'assistant', content: string}>, model: string): Promise<LLMResponse> {
      // Convert messages to Gemini format
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
  
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
      }
  
      const data = await response.json();
      return {
        content: data.candidates[0].content.parts[0].text,
        model,
        usage: data.usageMetadata ? {
          prompt_tokens: data.usageMetadata.promptTokenCount || 0,
          completion_tokens: data.usageMetadata.candidatesTokenCount || 0,
          total_tokens: data.usageMetadata.totalTokenCount || 0,
        } : undefined,
      };
    }
  }
  
  export const providers: Record<string, LLMProvider> = {
    'gpt-4': new OpenAIProvider(),
    'gpt-4-turbo': new OpenAIProvider(),
    'gpt-3.5-turbo': new OpenAIProvider(),
    'claude-3-5-sonnet-20241022': new AnthropicProvider(),
    'claude-3-haiku-20240307': new AnthropicProvider(),
    'claude-3-opus-20240229': new AnthropicProvider(),
    'gemini-1.5-pro': new GeminiProvider(),
    'gemini-1.5-flash': new GeminiProvider(),
    'gemini-pro': new GeminiProvider(),
  };
  
  export function getProvider(model: string): LLMProvider {
    const provider = providers[model];
    if (!provider) {
      throw new Error(`Unsupported model: ${model}`);
    }
    return provider;
  }
  
  export async function generateTitle(userMessage: string, assistantResponse: string): Promise<string> {
    const titleProvider = providers['gpt-3.5-turbo']; // Use fast model for title generation
    
    try {
      const response = await titleProvider.sendMessage([
        {
          role: 'user',
          content: `Based on this conversation, generate a concise title (4 words maximum):
  
  User: ${userMessage}
  Assistant: ${assistantResponse}
  
  Title:`
        }
      ], 'gpt-3.5-turbo');
      
      return response.content.trim().replace(/^["']|["']$/g, '').substring(0, 50);
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Chat';
    }
  }