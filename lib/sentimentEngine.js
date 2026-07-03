// lib/sentimentEngine.js
const { WORDS, NEGATIONS, INTENSIFIERS, EMOJI } = require('./lexicon');

const NEGATION_WINDOW = 3; // how many tokens ahead a negation affects

class SentimentEngine {
  constructor(options = {}) {
    this.words = { ...WORDS, ...(options.customWords || {}) };
    this.negations = new Set([...NEGATIONS, ...(options.customNegations || [])]);
    this.intensifiers = { ...INTENSIFIERS, ...(options.customIntensifiers || {}) };
    this.emoji = { ...EMOJI, ...(options.customEmoji || {}) };
    this.positiveThreshold = options.positiveThreshold ?? 0.15;
    this.negativeThreshold = options.negativeThreshold ?? -0.15;
  }

  // Split text into sentences for sentence-level breakdown
  _splitSentences(text) {
    return text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Tokenize a sentence into words + emoji, preserving punctuation signals
  _tokenize(text) {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    const emojis = text.match(emojiRegex) || [];
    const cleaned = text.replace(emojiRegex, ' ');
    const rawTokens = cleaned
      .toLowerCase()
      .replace(/[“”"‘’]/g, '')
      .match(/[a-z']+/g) || [];
    return { tokens: rawTokens, emojis };
  }

  _hasExclamation(text) {
    const count = (text.match(/!/g) || []).length;
    return Math.min(count * 0.15, 0.6); // capped boost
  }

  _hasAllCapsWord(word) {
    return word.length > 2 && word === word.toUpperCase() && /[A-Z]/.test(word);
  }

  _scoreSentence(sentence) {
    const { tokens, emojis } = this._tokenize(sentence);
    const details = [];
    let score = 0;
    let intensityMultiplier = 1;
    let negateCounter = 0;

    // Detect ALL CAPS words in original (pre-lowercase) text for emphasis
    const capsWords = (sentence.match(/\b[A-Z]{3,}\b/g) || []).length;
    const capsBoost = 1 + Math.min(capsWords * 0.1, 0.4);

    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];

      if (this.negations.has(word)) {
        negateCounter = NEGATION_WINDOW;
        continue;
      }

      if (this.intensifiers[word] !== undefined) {
        intensityMultiplier = this.intensifiers[word];
        continue;
      }

      if (this.words[word] !== undefined) {
        let wordScore = this.words[word] * intensityMultiplier;

        if (negateCounter > 0) {
          wordScore *= -0.85; // flip and slightly dampen
        }

        wordScore *= capsBoost;

        score += wordScore;
        details.push({ word, base: this.words[word], applied: +wordScore.toFixed(2) });

        // reset per-word modifiers after use
        intensityMultiplier = 1;
      }

      if (negateCounter > 0) negateCounter--;
    }

    // Emoji contribution
    for (const e of emojis) {
      if (this.emoji[e] !== undefined) {
        score += this.emoji[e];
        details.push({ word: e, base: this.emoji[e], applied: this.emoji[e] });
      }
    }

    // Exclamation mark emphasis (amplifies existing polarity, doesn't create it)
    const exclamationBoost = this._hasExclamation(sentence);
    if (exclamationBoost && score !== 0) {
      score += Math.sign(score) * exclamationBoost * Math.abs(score) * 0.3;
    }

    const tokenCount = tokens.length + emojis.length || 1;
    const comparative = score / tokenCount;

    return {
      sentence,
      score: +score.toFixed(3),
      comparative: +comparative.toFixed(3),
      tokens: tokenCount,
      details,
      label: this._classify(comparative),
    };
  }

  _classify(comparative) {
    if (comparative > this.positiveThreshold) return 'positive';
    if (comparative < this.negativeThreshold) return 'negative';
    return 'neutral';
  }

  /**
   * Analyze a block of text.
   * Returns overall score/comparative/label plus per-sentence breakdown.
   */
  analyze(text) {
    if (!text || typeof text !== 'string' || !text.trim()) {
      return {
        text: '',
        score: 0,
        comparative: 0,
        magnitude: 0,
        label: 'neutral',
        sentences: [],
      };
    }

    const sentences = this._splitSentences(text);
    const sentenceResults = sentences.map((s) => this._scoreSentence(s));

    const totalScore = sentenceResults.reduce((sum, r) => sum + r.score, 0);
    const totalTokens = sentenceResults.reduce((sum, r) => sum + r.tokens, 0) || 1;
    const comparative = totalScore / totalTokens;
    const magnitude = sentenceResults.reduce(
      (sum, r) => sum + r.details.reduce((s, d) => s + Math.abs(d.applied), 0),
      0
    );

    return {
      text,
      score: +totalScore.toFixed(3),
      comparative: +comparative.toFixed(3),
      magnitude: +magnitude.toFixed(3),
      label: this._classify(comparative),
      sentences: sentenceResults,
    };
  }

  /** Convenience: analyze many texts at once */
  analyzeBatch(texts = []) {
    return texts.map((t) => this.analyze(t));
  }
}

module.exports = { SentimentEngine };
