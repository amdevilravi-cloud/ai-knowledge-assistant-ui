/**
 * AI/LLM Mock Helper
 * Provides mock responses for AI API calls
 * Can be configured to use real AI responses via USE_REAL_AI environment variable
 */

const USE_REAL_AI = process.env.USE_REAL_AI === 'true';

export interface MockResponse {
  answer: string;
  isFromContext: boolean;
  retrievalCount: number;
  sourceDocuments?: any[];
}

export class AiMock {
  /**
   * Get simple chat response (no RAG)
   */
  static getSimpleChatResponse(message: string): string {
    if (USE_REAL_AI) {
      // Return null to indicate real AI should be used
      return null as any;
    }

    const responses: Record<string, string> = {
      'what is spring boot': 'Spring Boot is an open-source Java-based framework used to create microservices.',
      'hello': 'Hello! How can I help you today?',
      'default': 'This is a mock response for: ' + message,
    };

    const lowerMessage = message.toLowerCase();
    return responses[lowerMessage] || responses['default'];
  }

  /**
   * Get RAG chat response with document context
   */
  static getRagChatResponse(message: string, retrievedChunks: number = 3): MockResponse {
    if (USE_REAL_AI) {
      // Return null to indicate real AI should be used
      return null as any;
    }

    const responses: Record<string, MockResponse> = {
      'vacation policy': {
        answer: 'Based on the documents, the vacation policy allows 20 days of paid leave per year for full-time employees. Employees must request vacation at least 2 weeks in advance.',
        isFromContext: true,
        retrievalCount: retrievedChunks,
      },
      'sick leave': {
        answer: 'According to the employee handbook, sick leave provides 10 days per year. Medical documentation may be required for absences longer than 3 consecutive days.',
        isFromContext: true,
        retrievalCount: retrievedChunks,
      },
      'default': {
        answer: `Based on the retrieved documents, here is information about: ${message}. This is a mock RAG response simulating document-based answers.`,
        isFromContext: true,
        retrievalCount: retrievedChunks,
      },
    };

    const lowerMessage = message.toLowerCase();
    return responses[lowerMessage] || responses['default'];
  }

  /**
   * Get follow-up questions
   */
  static getFollowUpQuestions(conversationContext: string): string[] {
    if (USE_REAL_AI) {
      return null as any;
    }

    return [
      'Can you provide more details?',
      'What are the exceptions to this policy?',
      'How does this apply to part-time employees?',
    ];
  }

  /**
   * Get conversation continuation response
   */
  static getConversationResponse(message: string, history: any[]): MockResponse {
    if (USE_REAL_AI) {
      return null as any;
    }

    return {
      answer: `Based on our conversation history, here's my response to: ${message}. This is a mock response for multi-turn conversations.`,
      isFromContext: true,
      retrievalCount: 2,
    };
  }

  /**
   * Simulate AI API error
   */
  static simulateError(errorType: 'timeout' | 'rate_limit' | 'server_error'): Error {
    const errors = {
      timeout: new Error('AI API timeout'),
      rate_limit: new Error('AI API rate limit exceeded'),
      server_error: new Error('AI API server error'),
    };

    return errors[errorType];
  }

  /**
   * Check if real AI is enabled
   */
  static isRealAiEnabled(): boolean {
    return USE_REAL_AI;
  }
}
