# Discogs Browser

A modern, fast web application for browsing and exploring your Discogs record collection. Features intelligent caching, dual viewing modes, and rich filtering capabilities.

## Why This Project?

The official Discogs website doesn't support sorting collections the way I wanted to organize mine - by artist first, then by master release year. So I built my own collection visualizer that gives me complete control over how I view and sort my records. This tool lets you sort your collection exactly how you want it, with a beautiful interface and smart caching to make browsing fast and enjoyable.

## Features

- **Dual View Modes**
  - **Table View**: Sortable columns with master release data fetching
  - **Coverflow View**: Beautiful 3D carousel with keyboard and mouse wheel navigation

- **Smart Caching**
  - Two-tier caching strategy (React Query + IndexedDB)
  - Persistent master release data across sessions
  - Automatic background enrichment with release years

- **Rich Filtering**
  - Filter by format (Vinyl, CD, Cassette, etc.)
  - Real-time format frequency counts
  - Maintains filter state across view switches

- **Rate Limit Protection**
  - Built-in request queue to prevent API throttling
  - Automatic retry and throttling management

- **Modern UX**
  - Dark/Light theme support
  - Persistent username storage
  - Toast notifications for user feedback
  - Loading states and visual indicators

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7 with SWC
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Database**: Dexie (IndexedDB wrapper)
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

## Usage

1. **Enter Username**: Type your Discogs username in the input field
2. **Load Collection**: Click "Load Collection" or press Enter
3. **Switch Views**: Toggle between Table and Coverflow views using the radio buttons
4. **Filter by Format**: Select a format to view only releases in that format
5. **Fetch Master Data**: In Table view, click the download icon to fetch master release year
6. **Navigate Coverflow**: Use arrow keys, mouse wheel, or navigation buttons

## Project Structure

```
src/
├── api/
│   ├── queries/          # React Query hooks
│   ├── types/            # TypeScript type definitions
│   ├── constants.ts      # API configuration
│   ├── discogs.ts        # API methods
│   └── discogsClient.ts  # Axios client with rate limiting
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── CollectionTable.tsx
│   ├── CollectionCoverflow.tsx
│   └── ModeToggle.tsx
├── db/
│   ├── schema.ts         # Dexie database schema
│   └── masterReleaseService.ts
├── lib/
│   └── utils.ts          # Utility functions
└── App.tsx               # Main application component
```

## Configuration

### API Rate Limiting

The app includes automatic rate limit protection. Configuration is in [src/api/discogsClient.ts](src/api/discogsClient.ts):

- Request queue when < 2 API calls remain
- 2-second throttle delay
- Automatic queue processing

### Caching Strategy

Master release data is cached in IndexedDB with:
- 90-day default retention
- Last accessed tracking
- Bulk retrieval optimization

## Known Limitations

- Public API access only (no authentication required, but rate limited)
- Fetches all pages automatically (may be slow for large collections)
- Master release fetching is manual (click download icon in Table view)

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
