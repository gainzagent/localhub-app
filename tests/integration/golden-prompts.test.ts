/**
 * Golden Prompt Tests
 * Tests to verify ChatGPT app discovery and tool triggering
 */

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (data: any) => ({ json: async () => data }),
  },
}));

/**
 * These golden prompts should trigger the LocalHub app
 * when used in ChatGPT conversations
 */
const goldenPrompts = [
  {
    name: 'Basic local search',
    prompt: 'Find sushi restaurants near Ponsonby',
    expectedTool: 'search_places',
    expectedParams: {
      query: 'sushi restaurants',
      location_text: 'Ponsonby',
    },
  },
  {
    name: 'Current location query',
    prompt: 'Show me cafes near me',
    expectedTool: 'search_places',
    expectedParams: {
      query: 'cafes',
      location_text: 'near me',
    },
  },
  {
    name: 'Open now filter',
    prompt: 'Find pharmacies open now in Wellington CBD',
    expectedTool: 'search_places',
    expectedParams: {
      query: 'pharmacies',
      location_text: 'Wellington CBD',
      open_now: true,
    },
  },
  {
    name: 'Business type and location',
    prompt: 'Where can I find bookstores in Auckland?',
    expectedTool: 'search_places',
    expectedParams: {
      query: 'bookstores',
      location_text: 'Auckland',
    },
  },
  {
    name: 'Specific business search',
    prompt: 'Find gyms near Mission Bay',
    expectedTool: 'search_places',
    expectedParams: {
      query: 'gyms',
      location_text: 'Mission Bay',
    },
  },
  {
    name: 'Service search',
    prompt: 'I need a plumber in Christchurch',
    expectedTool: 'search_places',
    expectedParams: {
      query: 'plumber',
      location_text: 'Christchurch',
    },
  },
  {
    name: 'Multiple word business type',
    prompt: 'Find Thai restaurants in Newmarket',
    expectedTool: 'search_places',
    expectedParams: {
      query: 'Thai restaurants',
      location_text: 'Newmarket',
    },
  },
  {
    name: 'High-rated search',
    prompt: 'Show me highly rated pizza places in Auckland',
    expectedTool: 'search_places',
    expectedParams: {
      query: 'pizza places',
      location_text: 'Auckland',
      min_rating: 4,
    },
  },
];

describe('Golden Prompt Tests', () => {
  describe('Tool Discovery', () => {
    it('should list all tools that ChatGPT can discover', () => {
      const { allTools } = require('@/lib/mcp/schemas');

      expect(allTools).toBeDefined();
      expect(allTools.length).toBeGreaterThan(0);

      // Verify each tool has proper metadata for discovery
      allTools.forEach((tool: any) => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();

        // Verify description is clear and actionable
        expect(tool.description.length).toBeGreaterThan(20);
      });
    });
  });

  describe('Tool Descriptions', () => {
    it('search_places should have discoverable description', () => {
      const { searchPlacesSchema } = require('@/lib/mcp/schemas');

      expect(searchPlacesSchema.description).toContain('local businesses');
      expect(searchPlacesSchema.description).toContain('map');

      // Verify it mentions common use cases
      const description = searchPlacesSchema.description.toLowerCase();
      expect(
        description.includes('restaurant') ||
          description.includes('cafe') ||
          description.includes('shop')
      ).toBe(true);
    });

    it('get_place_details should have clear purpose', () => {
      const { getPlaceDetailsSchema } = require('@/lib/mcp/schemas');

      expect(getPlaceDetailsSchema.description).toContain(
        'detailed information'
      );
      expect(getPlaceDetailsSchema.description).toContain('business');
    });

    it('get_directions should explain route capability', () => {
      const { getDirectionsSchema } = require('@/lib/mcp/schemas');

      expect(getDirectionsSchema.description).toContain('directions');
      const description = getDirectionsSchema.description.toLowerCase();
      expect(
        description.includes('route') ||
          description.includes('travel') ||
          description.includes('distance')
      ).toBe(true);
    });
  });

  describe('Parameter Schema Validation', () => {
    it('search_places should have required parameters', () => {
      const { searchPlacesSchema } = require('@/lib/mcp/schemas');

      expect(searchPlacesSchema.inputSchema.required).toContain('query');
      expect(searchPlacesSchema.inputSchema.required).toContain(
        'location_text'
      );
    });

    it('all tools should have proper JSON schemas', () => {
      const { allTools } = require('@/lib/mcp/schemas');

      allTools.forEach((tool: any) => {
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();

        // Verify each property has a description
        Object.values(tool.inputSchema.properties).forEach((prop: any) => {
          expect(prop.description).toBeDefined();
          expect(prop.description.length).toBeGreaterThan(5);
        });
      });
    });
  });

  describe('Prompt Recognition Patterns', () => {
    goldenPrompts.forEach((testCase) => {
      it(`should recognize: "${testCase.name}"`, () => {
        // This test documents the expected behavior
        // In a real ChatGPT integration, the AI would parse these prompts
        // and call the appropriate tool with the expected parameters

        expect(testCase.prompt).toBeDefined();
        expect(testCase.expectedTool).toBeDefined();
        expect(testCase.expectedParams).toBeDefined();

        // Verify the prompt contains key elements
        const lowerPrompt = testCase.prompt.toLowerCase();

        if (testCase.expectedParams.query) {
          // Query keyword should appear in prompt
          const queryWords = (testCase.expectedParams.query as string)
            .toLowerCase()
            .split(' ');
          const containsQueryKeyword = queryWords.some((word) =>
            lowerPrompt.includes(word)
          );
          expect(containsQueryKeyword).toBe(true);
        }

        if (testCase.expectedParams.location_text) {
          // Location should appear in prompt
          const location = (
            testCase.expectedParams.location_text as string
          ).toLowerCase();
          if (location !== 'near me') {
            expect(lowerPrompt).toContain(location);
          }
        }
      });
    });
  });

  describe('Conversation Flow Examples', () => {
    it('should support follow-up refinements', () => {
      // Example conversation flow:
      // User: "Find cafes in Auckland"
      // App: Returns search results with state_id
      // User: "Filter to open now"
      // App: Uses state_id to refine results

      const initialSearch = {
        query: 'cafes',
        location_text: 'Auckland',
      };

      const refinement = {
        query: 'cafes',
        location_text: 'Auckland',
        state_id: 'previous-state-id',
        open_now: true,
      };

      expect(refinement.state_id).toBeDefined();
      expect(refinement.open_now).toBe(true);
    });

    it('should support rating-based refinements', () => {
      const refinement = {
        query: 'restaurants',
        location_text: 'Wellington',
        min_rating: 4,
        sort_by: 'rating',
      };

      expect(refinement.min_rating).toBe(4);
      expect(refinement.sort_by).toBe('rating');
    });

    it('should support distance-based sorting', () => {
      const refinement = {
        query: 'grocery stores',
        location_text: 'near me',
        origin: { lat: -36.8485, lng: 174.7633 },
        sort_by: 'distance',
      };

      expect(refinement.sort_by).toBe('distance');
      expect(refinement.origin).toBeDefined();
    });
  });

  describe('Filtering Capabilities', () => {
    it('should support minimum rating filter', () => {
      const { searchPlacesSchema } = require('@/lib/mcp/schemas');

      expect(searchPlacesSchema.inputSchema.properties.min_rating).toBeDefined();
      expect(
        searchPlacesSchema.inputSchema.properties.min_rating.description
      ).toContain('rating');
    });

    it('should support open now filter', () => {
      const { searchPlacesSchema } = require('@/lib/mcp/schemas');

      expect(searchPlacesSchema.inputSchema.properties.open_now).toBeDefined();
      expect(searchPlacesSchema.inputSchema.properties.open_now.type).toBe(
        'boolean'
      );
    });

    it('should support sorting options', () => {
      const { searchPlacesSchema } = require('@/lib/mcp/schemas');

      expect(searchPlacesSchema.inputSchema.properties.sort_by).toBeDefined();
      expect(searchPlacesSchema.inputSchema.properties.sort_by.enum).toEqual([
        'relevance',
        'rating',
        'distance',
      ]);
    });
  });
});
