# PoKey Decks

A mobile-first competitive Pokémon TCG deck-building application.

## Planned features
- Search historical English card printings with advanced filters
- Current Standard legality, including reprint equivalence and rotation updates
- Build, validate, save, and share 60-card decks
- Export text for Pokémon TCG Live and Limitless; verify RK9 format before enabling
- **PoKey Scan:** recognize cards and quantities in decklist screenshots, with manual review for uncertain matches

## Development principles
- Keep card data sources replaceable and respect data/image licensing.
- Never silently guess an uncertain card identification.
- Validate exports with real sample lists from each destination.
- Keep API keys and secrets out of the repository.
- Build the first release for mobile browsers and desktop.

## Status
Project repository initialized. Application code, database sync, scanner, and deployment are not yet implemented here.

## Proposed stack
TypeScript, React, PostgreSQL, server-side card ingestion, and an image-recognition service.

## Next milestone
Implement the card catalog schema and a searchable deck-building interface.
