import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

/** One turn of a conversation, in the shape Claude expects. */
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * The ONLY place in the backend that talks to Claude.
 * Every other module (classifier, chat, ...) calls this service, so if we ever
 * switch provider or model, we change one file.
 */
@Injectable()
export class LlmService {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: ConfigService) {
    // The SDK would also read ANTHROPIC_API_KEY itself; we pass it explicitly so it is obvious where it comes from.
    this.client = new Anthropic({ apiKey: config.get<string>('ANTHROPIC_API_KEY') });
    this.model = config.get<string>('CLAUDE_MODEL') ?? 'claude-haiku-5-5';
  }

  /**
   * Free-text answer (used for chat replies).
   * @param system  instructions that define the assistant's behaviour
   * @param turns   the conversation so far (must end with a user turn)
   */
  async chat(system: string, turns: ChatTurn[], maxTokens = 2000): Promise<string> {
    const response = await this.call(() =>
      this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        // "low" effort = fast + cheap; plenty for conversational IT support.
        output_config: { effort: 'low' },
        system,
        messages: turns,
      }),
    );

    // response.content is a list of blocks (text, thinking, ...). We only want the text ones.
    return response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('')
      .trim();
  }

  /**
   * Answer as JSON that is GUARANTEED to match a Zod schema (used for classification).
   * Claude is constrained to the schema, so we never have to parse messy text.
   */
  async chatStructured<T extends z.ZodType>(
    system: string,
    turns: ChatTurn[],
    schema: T,
    maxTokens = 2000,
  ): Promise<z.infer<T>> {
    const response = await this.call(() =>
      this.client.messages.parse({
        model: this.model,
        max_tokens: maxTokens,
        output_config: { effort: 'low', format: zodOutputFormat(schema) },
        system,
        messages: turns,
      }),
    );

    if (!response.parsed_output) {
      // Happens if the model refused or the reply was cut off by max_tokens.
      throw new BadGatewayException('The AI did not return a valid structured answer.');
    }
    return response.parsed_output;
  }

  /**
   * Runs an SDK call and converts SDK errors into clean HTTP errors for our API.
   * Most specific error first, as recommended by the SDK docs.
   */
  private async call<R>(fn: () => Promise<R>): Promise<R> {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) {
        throw new ServiceUnavailableException('AI service rejected the API key. Check ANTHROPIC_API_KEY.');
      }
      if (err instanceof Anthropic.RateLimitError) {
        throw new ServiceUnavailableException('AI service is rate-limited. Try again in a moment.');
      }
      if (err instanceof Anthropic.APIConnectionError) {
        throw new ServiceUnavailableException('Could not reach the AI service.');
      }
      if (err instanceof Anthropic.APIError) {
        // e.g. 400 (bad request) or 402/credit problems; message comes from Anthropic.
        throw new BadGatewayException(`AI service error: ${err.message}`);
      }
      throw err;
    }
  }
}
