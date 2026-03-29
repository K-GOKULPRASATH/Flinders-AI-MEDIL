'use server';

/**
 * Medical chatbot flow powered by OpenAI GPT-4o with guardrails.
 */

import { openai } from '@/ai/anthropic';
import { validateInput, validateOutput, type GuardrailViolation } from '@/ai/guardrails';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  guardrailViolations: GuardrailViolation[];
  blocked: boolean;
}

const SYSTEM_PROMPT = `You are MediLexicon Assistant, a specialized medical AI chatbot for healthcare practitioners.

YOUR ROLE:
- Help medical practitioners with diagnosis queries, ICD-11 code lookups, and treatment information
- Support traditional medicine systems: Ayurveda, Unani, Siddha, Homeopathy
- Map traditional medicine concepts to modern ICD-11 codes (MMS and TM2)
- Provide evidence-based medical information

STRICT RULES:
1. ONLY answer medical and health-related questions
2. NEVER prescribe specific medications or dosages - always recommend consulting a specialist
3. NEVER provide instructions for self-harm or creating harmful substances
4. Always clarify that your responses are informational and not a substitute for professional medical advice
5. If asked about non-medical topics, politely decline and redirect to medical queries
6. When uncertain, clearly state your uncertainty rather than guessing
7. For emergency situations, always advise calling emergency services immediately

RESPONSE FORMAT:
- Be concise but thorough
- Use medical terminology appropriately with explanations
- Structure longer responses with bullet points or numbered lists
- When providing ICD codes, always include both the code and its description`;

export async function chat(
  message: string,
  history: ChatMessage[]
): Promise<ChatResponse> {
  // ========== INPUT GUARDRAILS ==========
  const inputValidation = await validateInput(message);

  if (!inputValidation.passed) {
    return {
      reply: inputValidation.violations.find(v => v.severity === 'blocked')?.message
        || 'Your message was blocked by our safety system.',
      guardrailViolations: inputValidation.violations,
      blocked: true,
    };
  }

  // ========== AI CALL ==========
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    });

    const rawReply = completion.choices[0]?.message?.content;
    if (!rawReply) {
      throw new Error('No response from AI.');
    }

    // ========== OUTPUT GUARDRAILS ==========
    const outputValidation = await validateOutput(rawReply);

    return {
      reply: outputValidation.sanitizedOutput,
      guardrailViolations: [
        ...inputValidation.violations, // Include any warnings (like PII)
        ...outputValidation.violations,
      ],
      blocked: outputValidation.violations.some(v => v.severity === 'blocked'),
    };
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}
