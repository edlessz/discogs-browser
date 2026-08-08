# Discogs Browser

A modern, fast web application for browsing and exploring your Discogs record collection. Features intelligent caching, dual viewing modes, and rich filtering capabilities.

## Why This Project?

The official Discogs website doesn't support sorting collections the way I wanted to organize mine - by artist first, then by release year. So I built my own collection visualizer that gives me complete control over how I view and sort my records. This tool lets you sort your collection exactly how you want it, with a beautiful interface.

## Features

- **Dual View Modes**
  - **Table View**: Sortable columns
  - **Coverflow View**: Beautiful 3D carousel with keyboard and mouse wheel navigation

- **Rich Filtering**
  - Filter by format (Vinyl, CD, Cassette, etc.)
  - Real-time format frequency counts
  - Maintains filter state across view switches

- **Rate Limit Protection**
  - Built-in request queue to prevent API throttling
  - Automatic pause/resume based on Discogs rate limit headers

- **Modern UX**
  - Dark/Light theme support
  - Persistent username storage
  - Toast notifications for user feedback
  - Loading states and visual indicators

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 8 with SWC
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Table**: TanStack Table
- **Carousel**: Swiper
- **UI Components**: Radix UI primitives
- **Code Quality**: Biome (linter + formatter)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- A Discogs account with a public collection

### Installation

1. Clone the repository.

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Other Scripts

```bash
bun build       # Typecheck (tsc -b) + production build
bun lint        # Biome check (lint + format)
bun lint:fix    # Biome check with auto-fix
bun preview     # Preview the production build
```

## Usage

1. **Enter Username**: Type your Discogs username in the input field
2. **Load Collection**: Click "Load Collection" or press Enter
3. **Switch Views**: Toggle between Table and Coverflow views using the radio buttons
4. **Filter by Format**: Select a format to view only releases in that format
5. **Navigate Coverflow**: Use arrow keys, mouse wheel, or navigation buttons

## Project Structure

```
src/
├── api/
│   ├── queries/          # React Query hooks (useCollection)
│   ├── types/            # TypeScript type definitions
│   ├── constants.ts      # API configuration
│   ├── discogs.ts        # API methods (auto-paginates collection folders)
│   └── discogsClient.ts  # Axios client with rate limiting
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── CollectionTable.tsx
│   ├── CollectionCoverflow.tsx
│   └── ModeToggle.tsx    # ThemeProvider + dark/light toggle
├── lib/
│   └── utils.ts          # Utility functions (cn, filtering/sorting)
├── main.tsx              # Entry point
└── App.tsx               # Main application component
```

## Configuration

### API Rate Limiting

The app includes automatic rate limit protection. Configuration is in [src/api/discogsClient.ts](src/api/discogsClient.ts):

- Request queue when < 2 API calls remain
- 2-second throttle delay
- Automatic queue processing

## Known Limitations

- Public API access only (no authentication required, but rate limited)
- Fetches all pages automatically (may be slow for large collections)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Acknowledgments

- [Discogs API](https://www.discogs.com/developers) for providing the data
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Swiper](https://swiperjs.com/) for the coverflow carousel

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [Discogs API documentation](https://www.discogs.com/developers)
