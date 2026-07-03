const { SentimentEngine } = require('./lib/sentimentEngine');
const engine = new SentimentEngine();

const samples = [
  "I absolutely love this product! It's amazing and works perfectly.",
  "This is the worst experience I've ever had. Totally broken and useless.",
  "It's not bad, actually pretty good for the price.",
  "The service was okay, nothing special.",
  "I'm not happy with this at all, very disappointing 😞",
  "WOW this is INCREDIBLE!!! 🔥🔥",
  "The app crashed twice but support was helpful and fixed it quickly.",
];

for (const s of samples) {
  const r = engine.analyze(s);
  console.log(`\nTEXT: ${s}`);
  console.log(`→ label: ${r.label} | score: ${r.score} | comparative: ${r.comparative} | magnitude: ${r.magnitude}`);
}
