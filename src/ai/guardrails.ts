// Guardrails utility module - called from server actions, not a server action itself

/**
 * AI Guardrails Module for MediLexicon Assistant
 * 
 * Provides input and output validation to ensure safe, on-topic medical conversations.
 * 
 * INPUT GUARDRAILS:
 *  1. Topic Restriction - Only medical/health-related queries allowed
 *  2. Prompt Injection Detection - Blocks attempts to override system instructions
 *  3. PII Detection - Warns about sensitive personal information
 * 
 * OUTPUT GUARDRAILS:
 *  1. Harmful Content Filter - Blocks dangerous medical advice
 *  2. Medical Disclaimer - Ensures responses include appropriate disclaimers
 */

export interface GuardrailResult {
  passed: boolean;
  violations: GuardrailViolation[];
}

export interface GuardrailViolation {
  type: 'TOPIC_RESTRICTION' | 'PROMPT_INJECTION' | 'PII_DETECTED' | 'HARMFUL_CONTENT';
  severity: 'warning' | 'blocked';
  message: string;
}

// ============================
// INPUT GUARDRAILS
// ============================

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /forget\s+(all\s+)?(previous|prior|your)\s+(instructions?|rules?|programming)/i,
  /you\s+are\s+now\s+(a|an)\s+(?!doctor|nurse|medical|health)/i,
  /pretend\s+(to\s+be|you\s+are)\s+(?!a\s+(doctor|nurse|medical))/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /\<\|im_start\|\>/i,
  /override\s+(your|the)\s+(rules?|instructions?|guidelines?)/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /bypass\s+(your\s+)?(safety|filter|restriction|guardrail)/i,
];

const OFF_TOPIC_PATTERNS = [
  /write\s+(me\s+)?(a\s+)?(poem|story|song|essay|code|script|joke)/i,
  /tell\s+(me\s+)?(a\s+)?joke/i,
  /how\s+to\s+(hack|steal|break\s+into|cheat)/i,
  /generate\s+(a\s+)?password/i,
  /what\s+is\s+the\s+(weather|stock\s+price|score)/i,
  /help\s+me\s+with\s+(my\s+)?(homework|math|physics|chemistry\s+(?!drug|medicine))/i,
  /recipe\s+for\s+(?!medicine|remedy)/i,
  /play\s+a\s+game/i,
  /who\s+won\s+(the|last)\s+(game|match|election)/i,
];

const MEDICAL_KEYWORDS = [
  'symptom', 'disease', 'diagnosis', 'treatment', 'medicine', 'drug', 'prescription',
  'health', 'medical', 'doctor', 'patient', 'condition', 'therapy', 'clinical',
  'pain', 'fever', 'infection', 'chronic', 'acute', 'surgery', 'hospital',
  'ayurveda', 'unani', 'siddha', 'homeopathy', 'icd', 'dosage', 'side effect',
  'blood', 'heart', 'lung', 'liver', 'kidney', 'brain', 'bone', 'muscle',
  'diabetes', 'cancer', 'hypertension', 'asthma', 'allergy', 'vitamin',
  'nutrition', 'diet', 'exercise', 'mental health', 'anxiety', 'depression',
  'vaccine', 'immunity', 'inflammation', 'fracture', 'wound', 'burn',
  'headache', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'cough',
  'pregnant', 'pregnancy', 'wellness', 'remedy', 'herb', 'supplement',
  'jwara', 'dosha', 'vata', 'pitta', 'kapha', 'prameha', 'kushtha',
  'body', 'skin', 'eye', 'ear', 'nose', 'throat', 'chest', 'stomach',
  'hello', 'hi', 'hey', 'help', 'what can you do', 'who are you',
];

const PII_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/, label: 'SSN' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, label: 'email address' },
  { pattern: /\b\d{10,}\b/, label: 'phone number or long ID' },
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, label: 'credit card number' },
];

function checkTopicRestriction(input: string): GuardrailViolation | null {
  const lowerInput = input.toLowerCase();

  // Allow short greetings
  if (lowerInput.length < 20) {
    const greetings = ['hi', 'hello', 'hey', 'help', 'thanks', 'thank you', 'ok', 'yes', 'no'];
    if (greetings.some(g => lowerInput.includes(g))) return null;
  }

  // Check if explicitly off-topic
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(input)) {
      return {
        type: 'TOPIC_RESTRICTION',
        severity: 'blocked',
        message: 'This question appears to be outside the scope of medical assistance. I can only help with health and medicine-related questions.',
      };
    }
  }

  // Check if it contains medical keywords
  const hasMedicalContext = MEDICAL_KEYWORDS.some(keyword =>
    lowerInput.includes(keyword.toLowerCase())
  );

  // For longer messages without any medical context, flag them
  if (!hasMedicalContext && lowerInput.length > 30) {
    return {
      type: 'TOPIC_RESTRICTION',
      severity: 'blocked',
      message: 'I\'m a medical assistant and can only help with health-related questions. Please ask about symptoms, diagnoses, treatments, or medical systems like Ayurveda, Unani, or Siddha.',
    };
  }

  return null;
}

function checkPromptInjection(input: string): GuardrailViolation | null {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        type: 'PROMPT_INJECTION',
        severity: 'blocked',
        message: 'Your message was flagged as a potential prompt injection attempt. This input cannot be processed.',
      };
    }
  }
  return null;
}

function checkPII(input: string): GuardrailViolation | null {
  for (const { pattern, label } of PII_PATTERNS) {
    if (pattern.test(input)) {
      return {
        type: 'PII_DETECTED',
        severity: 'warning',
        message: `Your message appears to contain a ${label}. Please avoid sharing sensitive personal information.`,
      };
    }
  }
  return null;
}

export async function validateInput(input: string): Promise<GuardrailResult> {
  const violations: GuardrailViolation[] = [];

  // Check in order of severity
  const injectionViolation = checkPromptInjection(input);
  if (injectionViolation) violations.push(injectionViolation);

  const topicViolation = checkTopicRestriction(input);
  if (topicViolation) violations.push(topicViolation);

  const piiViolation = checkPII(input);
  if (piiViolation) violations.push(piiViolation);

  const hasBlockingViolation = violations.some(v => v.severity === 'blocked');

  return {
    passed: !hasBlockingViolation,
    violations,
  };
}

// ============================
// OUTPUT GUARDRAILS
// ============================

const HARMFUL_OUTPUT_PATTERNS = [
  /take\s+\d+\s+(pills?|tablets?|capsules?)\s+of/i,
  /inject\s+yourself\s+with/i,
  /overdose/i,
  /self[- ]?harm/i,
  /commit\s+suicide/i,
  /mix\s+.+\s+with\s+.+\s+to\s+(create|make)\s+(a\s+)?(poison|explosive|drug)/i,
];

const MEDICAL_DISCLAIMER = '\n\n⚕️ *Disclaimer: This is AI-generated medical information for educational purposes only. Always consult a qualified healthcare professional before making any medical decisions.*';

export async function validateOutput(output: string): Promise<{ sanitizedOutput: string; violations: GuardrailViolation[] }> {
  const violations: GuardrailViolation[] = [];

  for (const pattern of HARMFUL_OUTPUT_PATTERNS) {
    if (pattern.test(output)) {
      violations.push({
        type: 'HARMFUL_CONTENT',
        severity: 'blocked',
        message: 'The AI response contained potentially harmful content and was blocked.',
      });
      return {
        sanitizedOutput: 'I apologize, but I cannot provide that specific information as it could be harmful. Please consult a healthcare professional for guidance.',
        violations,
      };
    }
  }

  // Append medical disclaimer
  const sanitizedOutput = output + MEDICAL_DISCLAIMER;

  return { sanitizedOutput, violations };
}
