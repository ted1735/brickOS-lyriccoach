/**
 * syllables.js - Algorithmic Syllable Counter & Rhyme Scheme Engine
 * Designed for real-time lyric cadence analysis and end-rhyme categorization.
 */

// Accurate English syllable counter heuristic
export function countSyllables(word) {
  if (!word) return 0;
  let w = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;

  // Specific word adjustments
  const specialWords = {
    'the': 1, 'fire': 1, 'hour': 1, 'our': 1, 'wire': 1, 'tire': 1,
    'quiet': 2, 'riot': 2, 'lion': 2, 'poem': 2, 'poetry': 3, 'iron': 2,
    'rhythm': 2, 'heaven': 2, 'seven': 2, 'even': 2, 'prayer': 1, 'prayers': 1,
    'higher': 2, 'tired': 1, 'inspired': 3, 'desire': 2, 'forever': 3
  };
  if (specialWords[w]) return specialWords[w];

  // Common prefix / suffix rules
  w = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  w = w.replace(/^y/, '');

  const matches = w.match(/[aeiouy]{1,2}/g);
  let count = matches ? matches.length : 1;
  return Math.max(1, count);
}

// Calculate total syllables for a full line of lyrics
export function countLineSyllables(line) {
  if (!line || line.trim().startsWith('[') || line.trim().startsWith('//')) {
    return null; // Skip section headers like [Chorus] or comments
  }
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  return words.reduce((acc, word) => acc + countSyllables(word), 0);
}

// Extract terminal rhyme sound / key phonetic ending
export function getRhymeEnding(word) {
  if (!word) return '';
  let clean = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!clean) return '';

  // Common phoneme mappings / sound endings
  const soundRules = [
    [/ight$/, 'ite'],
    [/ite$/, 'ite'],
    [/ay$/, 'ey'],
    [/ai$/, 'ey'],
    [/ey$/, 'ey'],
    [/eigh$/, 'ey'],
    [/eak$/, 'eek'],
    [/eek$/, 'eek'],
    [/own$/, 'own'],
    [/ound$/, 'ownd'],
    [/ear$/, 'eer'],
    [/eer$/, 'eer'],
    [/ier$/, 'eer'],
    [/air$/, 'air'],
    [/are$/, 'air'],
    [/oo$/, 'oo'],
    [/ue$/, 'oo'],
    [/ew$/, 'oo'],
    [/tion$/, 'shun'],
    [/sion$/, 'shun'],
    [/ing$/, 'ing'],
    [/all$/, 'awl'],
    [/aw$/, 'aw'],
    [/ought$/, 'awt'],
    [/aught$/, 'awt']
  ];

  for (const [pattern, phonetic] of soundRules) {
    if (pattern.test(clean)) return phonetic;
  }

  // Fallback: extract last vowel group + tail consonants
  const match = clean.match(/[aeiouy]+[^aeiouy]*$/);
  if (match) return match[0];
  return clean.slice(-3);
}

// Detect rhyme scheme across a set of lines
export function analyzeRhymeScheme(lines) {
  const tags = [];
  const rhymeMap = new Map(); // rhymeEnding -> letter
  let letterCode = 65; // 'A'

  const colorPalette = [
    '#10b981', // Emerald A
    '#8b5cf6', // Violet B
    '#f59e0b', // Amber C
    '#06b6d4', // Cyan D
    '#ec4899', // Pink E
    '#3b82f6', // Blue F
    '#14b8a6', // Teal G
    '#f97316'  // Orange H
  ];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw || raw.trim().startsWith('[') || raw.trim().startsWith('//') || raw.trim().length === 0) {
      tags.push(null);
      continue;
    }

    const words = raw.trim().split(/\s+/).filter(Boolean);
    const lastWord = words[words.length - 1];
    const ending = getRhymeEnding(lastWord);

    if (!rhymeMap.has(ending)) {
      const letter = String.fromCharCode(letterCode);
      const color = colorPalette[(letterCode - 65) % colorPalette.length];
      rhymeMap.set(ending, { letter, color });
      tags.push({ letter, color, word: lastWord });
      letterCode++;
    } else {
      const match = rhymeMap.get(ending);
      tags.push({ letter: match.letter, color: match.color, word: lastWord });
    }
  }

  return tags;
}
