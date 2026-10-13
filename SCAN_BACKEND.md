# Deploy PoKey Scan — owner checklist

The frontend is live on GitHub Pages, but the scanner backend is **not deployed**. The old OCR has been retired.

## 1. Cloudflare Worker
1. Open https://dash.cloudflare.com/ and sign in.
2. Go to **Workers & Pages** and create a Worker.
3. Replace the Worker source with the repository's `worker.js` file, then deploy.
4. In Worker **Settings → Variables and Secrets**, create a **secret** named `OPENAI_API_KEY` with an API key you create in your own OpenAI API account. Never share this key in chat, commit it, or put it in the website.
5. Add a plain-text variable named `ALLOWED_ORIGIN` with the exact value `https://kckrick.github.io`.
6. Set rate limits, usage limits, and abuse protection. Do not launch publicly before these are active.
7. Copy the public Worker HTTPS URL and append `/scan`.

## 2. Connect the website
1. Open https://kckrick.github.io/pokey-decks/
2. Expand **Advanced tools and card database**.
3. Paste the Worker URL ending in `/scan` into **Scanner service URL**, then tap **Connect scanner**.
4. Reload the website. The scanner can now call the Worker.

## 3. Verify before real use
- Test rejection of unrelated images, explicit content, oversized images, and non-deck screenshots. Automated moderation is imperfect.
- Test the Team Rocket screenshot; reconcile all 24 entries and 60 total cards, including each quantity and exact printing.
- Validate against a card database independently. The Worker currently returns unverified AI guesses; the website deliberately blocks importing them.
- Confirm actual PTCGL import compatibility and tournament-format legality.
- Do not describe the app as tournament-ready until these tests pass.

## Privacy and cost
The frontend does not upload images while no Worker is configured. Once connected, the image is transmitted to your Worker and the configured AI provider for processing. The Worker code does not intentionally store uploaded images, but you must review Cloudflare and provider logging, data retention, and privacy terms before public launch. The service may incur usage charges. Origin/CORS checks are not sufficient to prevent abuse; require server-side rate limiting and authentication or equivalent abuse protections.

## Known technical limitations
- The current intake only supports wide 8-by-3 grid screenshots; other decklist layouts need separate support.
- Visual model output is not proof of exact card identity, quantity, printing, or legality.
- Missing quantity and uncertain printing must remain blocked from tournament export.
- No deployed Worker or live end-to-end tests have been completed yet.
