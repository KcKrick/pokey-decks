# PoKey Scan secure backend (not yet deployed)

The static GitHub Pages site cannot securely call a paid image-recognition API directly. This Cloudflare Worker provides a server-side endpoint at POST /scan.

## Deployment
1. Create a Cloudflare Worker and upload worker.js.
2. Configure the secret OPENAI_API_KEY (never put it in index.html, GitHub commits, or browser settings).
3. Set ALLOWED_ORIGIN=https://kckrick.github.io.
4. Deploy the Worker and enter its public HTTPS URL in the website's scanner configuration.
5. Test moderation rejection, non-deck rejection, image recognition, quantities, and printings before enabling public use.

## Security and accuracy
The Worker rejects oversized/non-image requests, checks origin, calls image moderation, rejects non-card scenes with a visual classifier, and returns unverified structured card candidates. It does not store images. The upstream AI provider still receives images for processing; review its data handling and privacy terms before production. CORS is not authentication or rate limiting: enable Cloudflare rate limiting, bot protection, and usage quotas before public release. Moderation cannot perfectly detect all inappropriate content.

The model's results are NEVER sufficient to approve a tournament export. A separate card database lookup and exact-printing validation must reconcile all entries and quantities. Uncertain or missing quantities must block export. Run tests with real images, including the Team Rocket 24-position example. This is scaffolding, not a tested production service.
