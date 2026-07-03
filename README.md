Advanced Sentiment Engine
A lexicon-based sentiment analysis engine in pure JavaScript (no external NLP
dependencies), deployable as a Vercel serverless API.
Features
Word-level lexicon (~150 weighted terms, -5 to +5)
Negation handling ("not good" flips polarity)
Intensifiers ("very", "extremely", "slightly", etc.)
Emoji sentiment scoring
ALL-CAPS and exclamation-mark emphasis boosts
Sentence-level breakdown + overall score/comparative/magnitude
Batch analysis support
Zero dependencies — runs anywhere Node runs
Project structure
```
sentiment-engine/
├── api/
│   └── sentiment.js       # Vercel serverless function (the HTTP endpoint)
├── lib/
│   ├── lexicon.js          # Word/emoji/negation/intensifier dictionaries
│   └── sentimentEngine.js  # Core SentimentEngine class
├── test.js                 # Local test script
├── package.json
└── vercel.json
```
Deploy to Vercel
Push this folder to a GitHub repo (or run from local folder).
Install the Vercel CLI if you don't have it:
```bash
   npm i -g vercel
   ```
From inside the `sentiment-engine` folder:
```bash
   vercel
   ```
Follow the prompts (link/create project). Vercel auto-detects the `api/`
folder and deploys `api/sentiment.js` as a serverless function at:
```
   https://<your-project>.vercel.app/api/sentiment
   ```
No build step or extra config is required — `vercel.json` just sets memory/timeout.
API usage
GET (quick single-text check)
```
GET /api/sentiment?text=I%20absolutely%20love%20this!
```
POST (single text)
```bash
curl -X POST https://<your-project>.vercel.app/api/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "This product is amazing but the shipping was slow."}'
```
POST (batch)
```bash
curl -X POST https://<your-project>.vercel.app/api/sentiment \
  -H "Content-Type: application/json" \
  -d '{"texts": ["I love it!", "This is terrible.", "It was okay."]}'
```
Response shape
```json
{
  "text": "This product is amazing but the shipping was slow.",
  "score": 1.5,
  "comparative": 0.15,
  "magnitude": 5.5,
  "label": "positive",
  "sentences": [
    {
      "sentence": "This product is amazing but the shipping was slow.",
      "score": 1.5,
      "comparative": 0.15,
      "tokens": 10,
      "label": "positive",
      "details": [
        { "word": "amazing", "base": 4, "applied": 4 },
        { "word": "slow", "base": -1, "applied": -1 }
      ]
    }
  ]
}
```
Run locally
```bash
npm install       # no deps, but sets up the project
node test.js       # runs sample texts through the engine
vercel dev         # run the API locally at http://localhost:3000/api/sentiment
```
Customizing the engine
`SentimentEngine` accepts options for extending the lexicon without editing
the source files:
```js
const { SentimentEngine } = require('./lib/sentimentEngine');

const engine = new SentimentEngine({
  customWords: { 'game-changer': 3, mid: -1 },
  customIntensifiers: { insanely: 2 },
  positiveThreshold: 0.1,
  negativeThreshold: -0.1,
});

console.log(engine.analyze("This is an insanely good game-changer."));
```
Notes & limitations
This is a rule-based (lexicon) engine, not a trained ML model — it's fast,
free to run, and needs no API keys, but it won't match transformer-based
accuracy on sarcasm or highly domain-specific language.
Extend `lib/lexicon.js` with domain-specific vocabulary (e.g. product
names, industry jargon) to improve accuracy for your use case.
For higher accuracy at the cost of latency/cost, you could swap `api/sentiment.js`
to call an LLM (e.g. the Anthropic API) instead of/alongside this engine.
