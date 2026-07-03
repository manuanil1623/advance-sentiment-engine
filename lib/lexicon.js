// lib/lexicon.js
// Word-level sentiment scores range from -5 (very negative) to +5 (very positive)

const WORDS = {
  // Strong positive
  amazing: 4, awesome: 4, excellent: 4, fantastic: 4, wonderful: 4,
  brilliant: 4, outstanding: 4, superb: 4, perfect: 4, incredible: 4,
  love: 3.5, loved: 3.5, loving: 3.5, delighted: 4, thrilled: 4,
  ecstatic: 4.5, phenomenal: 4.5, exceptional: 4,

  // Moderate positive
  good: 2.5, great: 3, nice: 2, happy: 2.5, glad: 2, pleased: 2.5,
  satisfied: 2, enjoy: 2.5, enjoyed: 2.5, enjoying: 2.5, positive: 2,
  helpful: 2, useful: 2, beautiful: 3, cool: 1.5, fun: 2, funny: 1.5,
  impressive: 3, recommend: 2.5, recommended: 2.5, works: 1, best: 3.5,
  better: 2, improve: 1.5, improved: 2, improving: 1.5, success: 2.5,
  successful: 2.5, win: 2, winning: 2, grateful: 3, thanks: 1.5,
  thankful: 2.5, appreciate: 2, appreciated: 2,

  // Mild positive
  okay: 0.5, fine: 0.8, decent: 1, fair: 0.5, alright: 0.5,

  // Mild negative
  bad: -2.5, poor: -2, boring: -2, meh: -1, mediocre: -1.5,
  disappointing: -2.5, disappointed: -2.5, annoying: -2, annoyed: -2,
  confusing: -1.5, confused: -1.5, slow: -1, expensive: -1,
  difficult: -1.5, hard: -0.8, weird: -0.5, strange: -0.5,

  // Strong negative
  terrible: -4, awful: -4, horrible: -4, worst: -4.5, hate: -3.5,
  hated: -3.5, hating: -3.5, disgusting: -4, pathetic: -3.5,
  useless: -3, broken: -2.5, garbage: -3.5, trash: -3, sucks: -3,
  sucked: -3, fail: -2.5, failed: -2.5, failure: -3, angry: -3,
  furious: -4, frustrated: -2.5, frustrating: -2.5, disaster: -3.5,
  scam: -4, fraud: -4, rude: -2.5, unacceptable: -3, broken_promise: -3,
  crash: -2, crashed: -2, crashes: -2, bug: -1.5, bugs: -1.5,
  glitch: -1.5, glitchy: -1.5,

  // Neutral-ish but carry slight weight
  issue: -1, issues: -1, problem: -1.5, problems: -1.5, complaint: -2,
  complaints: -2, error: -1.5, errors: -1.5,
};

const NEGATIONS = new Set([
  'not', "n't", 'no', 'never', 'none', 'nobody', 'nothing', 'neither',
  'nowhere', 'cannot', "can't", "won't", "don't", "doesn't", "didn't",
  "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't",
  "wouldn't", "shouldn't", "couldn't", 'without', 'lack', 'lacking',
]);

// Multipliers applied to the following word(s)
const INTENSIFIERS = {
  very: 1.5, extremely: 1.8, incredibly: 1.8, really: 1.3, so: 1.3,
  totally: 1.5, absolutely: 1.7, completely: 1.6, utterly: 1.7,
  highly: 1.4, super: 1.5, deeply: 1.5, particularly: 1.3,
  slightly: 0.5, somewhat: 0.6, barely: 0.4, kind_of: 0.6,
  a_bit: 0.5, mostly: 0.8, fairly: 0.7, pretty: 1.2,
};

const EMOJI = {
  '😀': 3, '😃': 3, '😄': 3.5, '😁': 3, '😆': 3, '😊': 3, '🙂': 1.5,
  '😍': 4, '🥰': 4, '😘': 3, '🤩': 4, '👍': 2.5, '👏': 2.5, '🎉': 3,
  '❤️': 3.5, '💕': 3, '✨': 1.5, '🔥': 2, '💯': 2.5,
  '😢': -3, '😭': -3.5, '😞': -2.5, '😔': -2, '😡': -4, '🤬': -4.5,
  '😠': -3, '👎': -2.5, '💔': -3, '😕': -1.5, '🙄': -1.5, '😒': -2,
  '😩': -2.5, '😫': -2.5, '🤢': -3, '🤮': -3.5, '😱': -2,
};

module.exports = { WORDS, NEGATIONS, INTENSIFIERS, EMOJI };
