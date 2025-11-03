# LocalHub - ChatGPT App for Local Business Discovery

LocalHub is a conversational ChatGPT App that helps users discover nearby businesses and services by transforming natural language queries into rich, interactive map experiences.

## Features

### Core Functionality
- Natural language search for local businesses
- Interactive fullscreen map with up to 20 results
- Comprehensive business information (address, phone, ratings, reviews, hours)
- One-tap calling functionality
- Smart directions with route visualization
- Conversation-based search refinements

### Advanced Filters & Sorting
- Filter by minimum rating (e.g., "4+ stars")
- Filter to only open businesses
- Sort by relevance, rating, or distance
- Radius-based search (up to 50km)

### User Experience
- Inline summary cards with quick actions
- Responsive design for mobile and desktop
- WCAG AA accessibility compliance
- Session persistence for follow-up queries
- Performance-optimized with API caching

## Tech Stack

- **Framework:** Next.js 14+ with TypeScript
- **Protocol:** MCP (Model Context Protocol) with Streamable HTTP
- **APIs:** Google Maps Platform (Places, Directions, Maps JavaScript API, Geocoding)
- **Styling:** Tailwind CSS
- **Testing:** Jest with React Testing Library
- **Deployment:** Vercel with GitHub Actions CI/CD
- **Caching:** In-memory cache with TTL

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Maps Platform API key with the following APIs enabled:
  - Places API
  - Directions API
  - Maps JavaScript API
  - Geocoding API

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd localhub-app
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your Google Maps API key to `.env.local`:
```
GOOGLE_MAPS_API_KEY=your_api_key_here
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:3002](http://localhost:3002).

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run linting:
```bash
npm run lint
```

Build the application:
```bash
npm run build
```

## Project Structure

```
localhub-app/
├── app/                      # Next.js app directory
│   ├── api/mcp/             # MCP endpoint and tools
│   │   ├── route.ts         # Main MCP handler
│   │   └── tools/           # MCP tool implementations
│   ├── cards/               # Inline card pages
│   │   ├── search/          # Search summary cards
│   │   ├── place/           # Place detail cards
│   │   └── map/             # Map preview cards
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── PlaceCard.tsx        # Place result card
│   ├── SearchSummaryCard.tsx # Search results summary
│   ├── DirectionsCard.tsx   # Directions display
│   └── MapCard.tsx          # Map preview card
├── lib/                     # Core libraries
│   ├── mcp/                 # MCP server implementation
│   ├── google-maps/         # Google Maps API clients
│   ├── session/             # Session state management
│   └── utils/               # Utility functions
│       ├── cache.ts         # Response caching
│       ├── validation.ts    # Input validation
│       ├── parsing.ts       # Query parsing
│       └── errors.ts        # Error handling
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
│   ├── resources/           # Embedded HTML resources
│   └── ai-plugin.json       # ChatGPT app manifest
├── tests/                   # Test suites
│   ├── integration/         # Integration tests
│   └── unit/                # Unit tests
├── .github/workflows/       # CI/CD pipelines
└── DEPLOYMENT.md            # Deployment guide
```

## MCP Tools

LocalHub exposes 4 MCP tools:

### 1. search_places
Find local businesses by query and location with advanced filtering.

**Parameters:**
- `query` (required): Business type (e.g., "pizza", "pharmacy")
- `location_text` (required): Location (e.g., "Auckland", "near me")
- `origin`: User's coordinates for "near me" queries
- `radius_m`: Search radius in meters (default: 5000)
- `open_now`: Filter to open businesses (default: false)
- `min_rating`: Minimum rating (1-5)
- `sort_by`: Sort by "relevance", "rating", or "distance"
- `max_results`: Maximum results (max: 20)
- `state_id`: Previous state ID for refinements

### 2. get_place_details
Get detailed information for a specific business.

**Parameters:**
- `place_id` (required): Google Maps place ID

### 3. get_directions
Calculate route between origin and destination.

**Parameters:**
- `origin` (required): Starting coordinates
- `destination` (required): Destination coordinates
- `mode`: Travel mode (driving, walking, transit, bicycling)

### 4. compose_map_resource
Generate interactive fullscreen map with search results.

**Parameters:**
- `state_id` (required): Session state ID from search
- `route_polyline`: Optional encoded polyline for directions

## API Routes

- `GET /api/mcp` - Server information and capabilities
- `POST /api/mcp` - MCP tool calls and listing
- `GET /cards/search/[stateId]` - Search summary card
- `GET /cards/place/[placeId]` - Place details card
- `GET /cards/map/[stateId]` - Map preview card

## Environment Variables

- `GOOGLE_MAPS_API_KEY` - Your Google Maps Platform API key (required)
- `NEXT_PUBLIC_APP_URL` - Application URL (default: http://localhost:3002)
- `NODE_ENV` - Environment (development/production)

## Performance Optimizations

### API Response Caching
- Search results: 5 minutes TTL
- Place details: 5 minutes TTL
- Geocoding: 10 minutes TTL (addresses rarely change)

### Build Optimizations
- SWC minification enabled
- Console logs removed in production
- WebP/AVIF image formats
- Code splitting and lazy loading
- Compression enabled

### Performance Targets
- Search operations: ≤1.5s p50
- Details/directions: ≤1.0s p50
- Map resource composition: ≤0.5s p50

## Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables:
   - `GOOGLE_MAPS_API_KEY`
   - `NODE_ENV=production`
4. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### CI/CD Pipeline

GitHub Actions automatically:
- Runs linting and type checks on PRs
- Executes test suite
- Builds the application
- Deploys preview environments for PRs
- Deploys to production on merge to `main`

## Accessibility

LocalHub meets WCAG AA standards:
- Full keyboard navigation support
- Screen reader compatibility (VoiceOver, NVDA)
- High contrast text (4.5:1 minimum)
- Descriptive ARIA labels and roles
- Touch-friendly tap targets (44x44px minimum)
- Support for browser zoom up to 200%

## Security

- API keys stored in environment variables only
- Input validation on all tool parameters
- Rate limiting on API calls
- No logging of sensitive user data
- Session expiry after 30 minutes
- CORS headers properly configured
- HTTPS enforced in production

## Conversation Examples

LocalHub understands natural language queries:

```
User: "Find sushi restaurants near Ponsonby"
App: Returns 20 sushi restaurants with interactive map

User: "Filter to open now"
App: Refines results to show only open restaurants

User: "Sort by rating"
App: Re-sorts results showing highest rated first

User: "Show me closer options"
App: Sorts by distance from user location
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## Testing Strategy

- **Unit Tests**: Core business logic and utilities
- **Integration Tests**: API routes and tool execution
- **Golden Prompt Tests**: ChatGPT discovery scenarios
- **Accessibility Tests**: WCAG compliance verification

## License

ISC

## Support

For issues and questions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review test examples in `/tests` directory

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Tailwind CSS](https://tailwindcss.com/)
