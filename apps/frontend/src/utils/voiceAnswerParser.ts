export interface ParsedAnswer {
  score?: number;           // For Likert questions (1-5)
  isNA?: boolean;           // For "not applicable" responses
  selections?: string[];    // For multiple select questions
  text?: string;            // For open-ended or comments
  ranking?: Record<string, number>; // For ranking questions
}

// Number word mappings
const numberWords: Record<string, number> = {
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'first': 1,
  'second': 2,
  'third': 3,
  'fourth': 4,
  'fifth': 5,
};

// Sentiment mappings for Likert
const sentimentToScore: Record<string, number> = {
  'strongly disagree': 1,
  'disagree': 2,
  'neutral': 3,
  'agree': 4,
  'strongly agree': 5,
  'poor': 1,
  'fair': 2,
  'okay': 3,
  'good': 4,
  'excellent': 5,
  'very unlikely': 1,
  'unlikely': 2,
  'maybe': 3,
  'likely': 4,
  'very likely': 5,
};

// N/A detection patterns
const naPatterns = ['not applicable', 'n/a', 'na', 'does not apply', 'skip', "doesn't apply", 'does not apply'];

/**
 * Normalize transcript for parsing
 */
function normalizeTranscript(transcript: string): string {
  return transcript.toLowerCase().trim();
}

/**
 * Extract score from beginning of transcript
 */
function extractScore(normalized: string): { score?: number; remaining: string } {
  // Check for sentiment phrases first (longer matches)
  for (const [phrase, score] of Object.entries(sentimentToScore)) {
    if (normalized.startsWith(phrase)) {
      const remaining = normalized.slice(phrase.length).trim();
      // Remove leading punctuation
      const cleanRemaining = remaining.replace(/^[.,;:!?]\s*/, '');
      return { score, remaining: cleanRemaining };
    }
  }

  // Check for number words
  const firstWord = normalized.split(/\s+/)[0];
  if (firstWord && numberWords[firstWord]) {
    const remaining = normalized.slice(firstWord.length).trim();
    const cleanRemaining = remaining.replace(/^[.,;:!?]\s*/, '');
    return { score: numberWords[firstWord], remaining: cleanRemaining };
  }

  // Check for numeric digits
  const digitMatch = normalized.match(/^(\d+)/);
  if (digitMatch) {
    const num = parseInt(digitMatch[1]);
    if (num >= 1 && num <= 5) {
      const remaining = normalized.slice(digitMatch[0].length).trim();
      const cleanRemaining = remaining.replace(/^[.,;:!?]\s*/, '');
      return { score: num, remaining: cleanRemaining };
    }
  }

  return { remaining: normalized };
}

/**
 * Check if transcript indicates N/A
 */
function isNAResponse(normalized: string): boolean {
  return naPatterns.some(pattern => normalized.includes(pattern));
}

/**
 * Parse Likert scale answer (1-5)
 */
export function parseLikertAnswer(transcript: string): ParsedAnswer {
  const normalized = normalizeTranscript(transcript);
  const { score, remaining } = extractScore(normalized);

  return {
    score,
    text: remaining || undefined,
  };
}

/**
 * Parse Likert scale answer with N/A option
 */
export function parseLikertWithNAAnswer(transcript: string): ParsedAnswer {
  const normalized = normalizeTranscript(transcript);

  // Check for N/A first
  if (isNAResponse(normalized)) {
    return {
      isNA: true,
      text: undefined,
    };
  }

  // Otherwise parse as regular Likert
  const { score, remaining } = extractScore(normalized);

  return {
    score,
    isNA: false,
    text: remaining || undefined,
  };
}

/**
 * Parse multiple select answer
 * Looks for option names in the transcript
 */
export function parseMultipleSelectAnswer(transcript: string, options: string[]): ParsedAnswer {
  const normalized = normalizeTranscript(transcript);
  const selections: string[] = [];

  // Check each option to see if it's mentioned in the transcript
  for (const option of options) {
    const optionLower = option.toLowerCase();
    if (normalized.includes(optionLower)) {
      selections.push(option);
    }
  }

  // If no matches found, return the full transcript as text
  if (selections.length === 0) {
    return {
      selections: [],
      text: transcript,
    };
  }

  return {
    selections,
  };
}

/**
 * Parse single choice answer
 * Looks for the first matching option in the transcript
 */
export function parseSingleChoiceAnswer(transcript: string, options: string[]): ParsedAnswer {
  const normalized = normalizeTranscript(transcript);

  // Find the first option that appears in the transcript
  for (const option of options) {
    const optionLower = option.toLowerCase();
    if (normalized.includes(optionLower)) {
      return {
        text: option,
      };
    }
  }

  // If no match found, return the full transcript
  return {
    text: transcript,
  };
}

/**
 * Parse ranking answer
 * Expected format: "First [item], second [item], third [item]..." or
 * "[item] first, [item] second, [item] third..."
 */
export function parseRankingAnswer(transcript: string, items: string[]): ParsedAnswer {
  const normalized = normalizeTranscript(transcript);
  const ranking: Record<string, number> = {};

  // Try to match patterns like "first [item]" or "[item] first"
  const rankWords = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];

  for (let i = 0; i < rankWords.length && i < items.length; i++) {
    const rankWord = rankWords[i];
    const rankValue = i + 1;

    // Find which item is associated with this rank
    for (const item of items) {
      const itemLower = item.toLowerCase();

      // Check for "first [item]" or "[item] first" patterns
      const pattern1 = new RegExp(`${rankWord}\\s+${itemLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
      const pattern2 = new RegExp(`${itemLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+${rankWord}`);

      if (pattern1.test(normalized) || pattern2.test(normalized)) {
        ranking[item] = rankValue;
        break;
      }
    }
  }

  return {
    ranking: Object.keys(ranking).length > 0 ? ranking : undefined,
    text: Object.keys(ranking).length === 0 ? transcript : undefined,
  };
}

/**
 * Parse open-ended answer
 * Simply returns the full transcript as text
 */
export function parseOpenEndedAnswer(transcript: string): ParsedAnswer {
  return {
    text: transcript.trim(),
  };
}
