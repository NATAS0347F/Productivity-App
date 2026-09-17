export interface ParsedTaskInput {
  name: string;
  duration: number; // in minutes
  deadline: string | null; // YYYY-MM-DD
  scheduledDate?: string; // YYYY-MM-DD
  recurrence: 'none' | 'daily' | 'weekdays' | 'weekly' | 'custom';
  customDays?: number[]; // 0=Sun..6=Sat
  intent: 'need' | 'want' | 'someday';
  category?: 'academic' | 'technical' | 'career' | 'creative' | 'personal' | 'admin';
  tokens: {
    durationStr?: string;
    deadlineStr?: string;
    recurrenceStr?: string;
    intentStr?: string;
  };
}

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getNextDayOfWeek(dayIndex: number, referenceDate: Date = new Date()): Date {
  const result = new Date(referenceDate);
  const currentDay = result.getDay();
  let distance = dayIndex - currentDay;
  if (distance <= 0) {
    distance += 7;
  }
  result.setDate(result.getDate() + distance);
  return result;
}

/**
 * Natural language task parser for Flow.
 * Handles dates, durations, recurrences, and intent smoothly without requiring external AI.
 */
export function parseNaturalLanguageTask(input: string): ParsedTaskInput {
  let text = input.trim();
  let duration = 30; // default 30 min
  let deadline: string | null = null;
  let scheduledDate: string | undefined = undefined;
  let recurrence: 'none' | 'daily' | 'weekdays' | 'weekly' | 'custom' = 'none';
  let customDays: number[] | undefined = undefined;
  let intent: 'need' | 'want' | 'someday' = 'want';

  const tokens: ParsedTaskInput['tokens'] = {};

  if (!text) {
    return {
      name: '',
      duration: 30,
      deadline: null,
      recurrence: 'none',
      intent: 'want',
      tokens: {},
    };
  }

  // 1. Recurrence pattern
  // "every tuesday and thursday", "every day", "every weekday", "daily"
  const multiDayRegex = /every\s+([a-z]+(?:\s+and\s+[a-z]+|\s*,\s*[a-z]+)*)/i;
  const multiMatch = text.match(multiDayRegex);
  if (multiMatch) {
    const rawDays = multiMatch[1].toLowerCase();
    if (rawDays.includes('day') && !rawDays.includes('weekday') && !rawDays.includes('monday')) {
      recurrence = 'daily';
      tokens.recurrenceStr = 'Every day';
    } else if (rawDays.includes('weekday')) {
      recurrence = 'weekdays';
      tokens.recurrenceStr = 'Weekdays';
    } else {
      const dayMatches = rawDays.match(/([a-z]+)/g) || [];
      const days = dayMatches
        .map((d) => DAY_MAP[d])
        .filter((idx) => idx !== undefined);
      if (days.length > 0) {
        recurrence = 'custom';
        customDays = Array.from(new Set(days)).sort();
        tokens.recurrenceStr = `Every ${customDays
          .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
          .join(', ')}`;
      }
    }
    text = text.replace(multiMatch[0], ' ').trim();
  } else if (/\bdaily\b/i.test(text)) {
    recurrence = 'daily';
    tokens.recurrenceStr = 'Daily';
    text = text.replace(/\bdaily\b/i, ' ').trim();
  } else if (/\bweekdays\b/i.test(text)) {
    recurrence = 'weekdays';
    tokens.recurrenceStr = 'Weekdays';
    text = text.replace(/\bweekdays\b/i, ' ').trim();
  }

  // 2. Duration pattern
  // "for 1 hour", "for 45 mins", "1h", "2 hrs", "30m", "1.5 hours", "90 min", "2h30m"
  const complexHourMin = /(\b\d+)\s*h(?:ours?|r)?\s*(\d+)\s*m(?:in(?:ute)?s?)?\b/i;
  const matchComplex = text.match(complexHourMin);
  if (matchComplex) {
    duration = parseInt(matchComplex[1], 10) * 60 + parseInt(matchComplex[2], 10);
    tokens.durationStr = `${duration} min`;
    text = text.replace(matchComplex[0], ' ').trim();
  } else {
    const durRegex = /(?:for\s+)?(\b\d+(?:\.\d+)?)\s*(hours?|hrs?|h|mins?|minutes?|m)\b/i;
    const durMatch = text.match(durRegex);
    if (durMatch) {
      const val = parseFloat(durMatch[1]);
      const unit = durMatch[2].toLowerCase();
      if (unit.startsWith('h')) {
        duration = Math.round(val * 60);
        tokens.durationStr = `${val} hr${val > 1 ? 's' : ''}`;
      } else {
        duration = Math.round(val);
        tokens.durationStr = `${duration} min`;
      }
      text = text.replace(durMatch[0], ' ').trim();
    }
  }

  // 3. Deadline / Date pattern
  // "due Sunday", "due tomorrow", "by Friday", "tomorrow", "due on Oct 12", "due 9/10"
  const now = new Date();

  // Check tomorrow
  if (/\b(?:due\s+)?tomorrow\b/i.test(text)) {
    const tom = new Date(now);
    tom.setDate(now.getDate() + 1);
    deadline = formatDate(tom);
    scheduledDate = deadline;
    tokens.deadlineStr = 'Tomorrow';
    text = text.replace(/\b(?:due\s+)?tomorrow\b/i, ' ').trim();
  } else if (/\b(?:due\s+)?today\b/i.test(text)) {
    deadline = formatDate(now);
    scheduledDate = deadline;
    tokens.deadlineStr = 'Today';
    text = text.replace(/\b(?:due\s+)?today\b/i, ' ').trim();
  } else {
    // Due [Day]
    const dueDayRegex = /(?:due\s+(?:on\s+)?|by\s+)(sunday|sun|monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thur|thurs|friday|fri|saturday|sat)\b/i;
    const dueMatch = text.match(dueDayRegex);
    if (dueMatch) {
      const dayName = dueMatch[1].toLowerCase();
      const targetIdx = DAY_MAP[dayName];
      if (targetIdx !== undefined) {
        const nextDate = getNextDayOfWeek(targetIdx, now);
        deadline = formatDate(nextDate);
        tokens.deadlineStr = nextDate.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
      }
      text = text.replace(dueMatch[0], ' ').trim();
    } else {
      // "on Sunday"
      const onDayRegex = /\bon\s+(sunday|sun|monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thur|thurs|friday|fri|saturday|sat)\b/i;
      const onMatch = text.match(onDayRegex);
      if (onMatch) {
        const dayName = onMatch[1].toLowerCase();
        const targetIdx = DAY_MAP[dayName];
        if (targetIdx !== undefined) {
          const nextDate = getNextDayOfWeek(targetIdx, now);
          scheduledDate = formatDate(nextDate);
          tokens.deadlineStr = nextDate.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
        }
        text = text.replace(onMatch[0], ' ').trim();
      }
    }
  }

  // 4. Intent detection
  const lowerAll = input.toLowerCase();
  if (
    lowerAll.includes('someday') ||
    lowerAll.includes('maybe') ||
    lowerAll.includes('eventually') ||
    lowerAll.includes('idea:')
  ) {
    intent = 'someday';
    tokens.intentStr = 'Maybe someday';
  } else if (
    deadline !== null ||
    lowerAll.includes('due') ||
    lowerAll.includes('finish') ||
    lowerAll.includes('submit') ||
    lowerAll.includes('assignment') ||
    lowerAll.includes('exam') ||
    lowerAll.includes('redo') ||
    lowerAll.includes('must') ||
    lowerAll.includes('need to') ||
    lowerAll.includes('pay') ||
    lowerAll.includes('urgent')
  ) {
    intent = 'need';
    tokens.intentStr = 'Need to do';
  } else {
    intent = 'want';
    tokens.intentStr = 'Want to do';
  }

  // Clean remaining text (remove trailing connectors like "by", "on", "due")
  let cleanName = text
    .replace(/\s+/g, ' ')
    .replace(/(?:^|\s)(?:due|by|on|at|for)\s*$/i, '')
    .trim();

  // If cleanName is empty, fall back to input
  if (!cleanName) {
    cleanName = input.trim();
  }

  // Auto category inference
  let category: ParsedTaskInput['category'] = 'admin';
  const cText = cleanName.toLowerCase();
  if (
    cText.includes('slide') ||
    cText.includes('psych') ||
    cText.includes('study') ||
    cText.includes('homework') ||
    cText.includes('exam') ||
    cText.includes('assignment') ||
    cText.includes('math') ||
    cText.includes('paper')
  ) {
    category = 'academic';
  } else if (
    cText.includes('python') ||
    cText.includes('code') ||
    cText.includes('coding') ||
    cText.includes('debug') ||
    cText.includes('repo') ||
    cText.includes('app') ||
    cText.includes('css') ||
    cText.includes('bug')
  ) {
    category = 'technical';
  } else if (
    cText.includes('resume') ||
    cText.includes('apply') ||
    cText.includes('interview') ||
    cText.includes('portfolio') ||
    cText.includes('job') ||
    cText.includes('client')
  ) {
    category = 'career';
  } else if (
    cText.includes('design') ||
    cText.includes('art') ||
    cText.includes('draw') ||
    cText.includes('write') ||
    cText.includes('music') ||
    cText.includes('video')
  ) {
    category = 'creative';
  } else if (
    cText.includes('exercise') ||
    cText.includes('workout') ||
    cText.includes('walk') ||
    cText.includes('gym') ||
    cText.includes('meditate') ||
    cText.includes('journal') ||
    cText.includes('sleep')
  ) {
    category = 'personal';
  }

  return {
    name: cleanName,
    duration,
    deadline,
    scheduledDate,
    recurrence,
    customDays,
    intent,
    category,
    tokens,
  };
}
