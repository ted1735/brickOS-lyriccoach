/**
 * brickos-rules.js - Nashville Executive Producer & Lyric Studio Rules
 * Grounded in the Nashville Truth Protocol from brickOS.
 */

export const FORBIDDEN_CLICHES = [
  "washed in the blood",
  "unconditional love",
  "fill this place",
  "just want to praise",
  "fall like rain",
  "chains are broken",
  "make a way",
  "hear my cry",
  "lift your name high",
  "set a fire",
  "wrap me in your arms",
  "oceans deep",
  "dry bones rattle",
  "mountains move"
];

export const VERTICAL_ANCHORS = [
  "god", "lord", "jesus", "christ", "holy", "king", "throne", "creator",
  "savior", "father", "sovereign", "almighty", "yahweh", "redeemer", "mind of christ"
];

export const HORIZONTAL_ANCHORS = [
  "struggle", "hurt", "pain", "coffee", "truck", "work", "sweat", "broken",
  "tired", "doctor", "bills", "anxiety", "concrete", "night", "clock", "kitchen",
  "rain", "dirt", "gravel", "highway", "tears", "hands", "fist", "quiet"
];

export const VOCAL_ARCHETYPES = [
  { name: "Brandon", role: "The Campfire Anchor", desc: "Gritty Country Mature / Raspy Male Vocal", bestFor: "Modern Folk Worship, Indie, Roots" },
  { name: "PATD", role: "The Soul Ballad Belter", desc: "Dynamic High Tenor / Emotive Deep Resonance", bestFor: "Soul Piano Ballad, Soaring Rock" },
  { name: "Kane", role: "Urban & Architectural", desc: "Tectonic Powerhouse / Sub-Sonic Steel", bestFor: "Hard Rock, CHH, Deep Worship, Neo-Soul" },
  { name: "Neon Gospel", role: "Boss Energy Female", desc: "High Alto Soprano / Hyper-Pop Shimmer", bestFor: "Aggressive K-Pop Fusion, Anthem" },
  { name: "Monica", role: "The Crossover Anchor", desc: "Gritty Soulful Raspy / High Energy", bestFor: "Hip-Hop, Trap, Gospel Fusion" },
  { name: "Ms T", role: "The Gospel Foundation", desc: "The Anointed Anthem / Raw Emotive Power", bestFor: "Soulful Gospel Anthem, B3 Organ" }
];

export const EP_MANDATES = [
  { title: "EP 1: Restoration", keywords: ["restoration", "heal", "mend", "ruin", "broken", "repair", "brick", "build", "redeem"], focus: "Refinement & Healing" },
  { title: "EP 2: Conflict Suite", keywords: ["conflict", "family", "home", "forgive", "fight", "peace", "reconcile", "love"], focus: "Family & Relationships" },
  { title: "EP 3: War Room Anthems", keywords: ["war", "battle", "armor", "stand", "pray", "power", "victory", "authority", "strike"], focus: "Spiritual Warfare" },
  { title: "EP 4: Surrender Sessions", keywords: ["surrender", "rest", "lay down", "trust", "quiet", "still", "peace", "wait", "rely"], focus: "Identity & Reliance" }
];

export function auditLyrics(lyrics, meta = {}) {
  if (!lyrics || !lyrics.trim()) {
    return { auditScore: 0, issues: ["No lyrics found to audit."] };
  }

  const lines = lyrics.split(/\r?\n/).filter(l => l.trim().length > 0);
  const lowerLyrics = lyrics.toLowerCase();
  const detectedCliches = [];

  // 1. Cliché Check (The Christianese Filter)
  FORBIDDEN_CLICHES.forEach(cliche => {
    if (lowerLyrics.includes(cliche)) {
      detectedCliches.push(cliche);
    }
  });

  // 2. Throne Room Pivot Check
  const bridgeMatch = lyrics.match(/\[Bridge[^\]]*\]([\s\S]*?)(?=\[|$)/i);
  let pivotDetected = false;
  let bridgeNotes = "";

  if (bridgeMatch) {
    const bridgeText = bridgeMatch[1].toLowerCase();
    const bridgeVerticals = VERTICAL_ANCHORS.filter(w => bridgeText.includes(w));
    pivotDetected = bridgeVerticals.length > 0;
    bridgeNotes = pivotDetected 
      ? `Throne Room Pivot Verified in Bridge (${bridgeVerticals.join(', ')})`
      : "Bridge found, but lacks vertical anchors addressing the Creator.";
  } else {
    const vHits = VERTICAL_ANCHORS.filter(w => lowerLyrics.includes(w));
    const hHits = HORIZONTAL_ANCHORS.filter(w => lowerLyrics.includes(w));
    pivotDetected = vHits.length >= 2 && hHits.length >= 1;
    bridgeNotes = "No explicit [Bridge] section found. Recommend adding one for the Throne Room Pivot.";
  }

  // 3. OBI Funnel Check
  const hasChorus = /\[Chorus[^\]]*\]/i.test(lyrics);
  const chorusMatches = lyrics.match(/\[Chorus[^\]]*\]([\s\S]*?)(?=\[|$)/gi);
  const chorusLinesCount = chorusMatches ? chorusMatches.join('\n').split('\n').filter(Boolean).length : 0;
  const obiFunnelPassed = hasChorus && chorusLinesCount >= 4;

  // 4. Calculate Score
  let score = 100;
  if (detectedCliches.length > 0) score -= (detectedCliches.length * 7);
  if (!pivotDetected) score -= 18;
  if (!obiFunnelPassed) score -= 12;
  if (lines.length < 8) score -= 15;
  score = Math.max(20, Math.min(100, score));

  // 5. Suno 4-Block Generation
  const archetype = meta.vocalArchetype || meta.vocal_archetype || "Brandon";
  const cleanTitle = (meta.title || "UntitledSong").replace(/\s+/g, '');
  const bmvTitle = `${cleanTitle}_${archetype.split(' ')[0]}_v1_BMV1`;

  const sunoBlocks = {
    bmvTitle,
    block1: `[Vocal Archetype: ${archetype}]\n[Delivery: 3:1 Sonic Scar, Proximity intimacy, authentic rasp]\n\n${lyrics.trim()}`,
    block2: `${meta.genre || 'Gospel Fusion'}, ${meta.bpm || 102} BPM, ${meta.mood || 'Authentic earnestness'}, organic acoustic and driving rhythm`,
    block3: `Sibilance, high-frequency hiss, piercing treble, digital artifacts, muddy bass, muffled vocals, lo-fi, autotune, MIDI strings, electronic synths, heavy reverb, wash, stadium echo, screaming, shouting, long atmospheric gaps`,
    block4: `Weirdness: 12 | Style Influence: 65 | Voice/Audio: 100`
  };

  return {
    auditScore: score,
    detectedCliches,
    pivotDetected,
    bridgeNotes,
    obiFunnelPassed,
    sunoBlocks
  };
}
