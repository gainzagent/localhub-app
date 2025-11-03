/**
 * MCP API Integration Tests
 * Tests for the MCP API route and tool execution
 */

// Mock Next.js server components before importing
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    url,
    method: options?.method || 'GET',
    json: async () => JSON.parse(options?.body || '{}'),
    headers: new Map(),
  })),
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: new Map(),
    }),
  },
}));

describe('MCP API Route - Schema Tests', () => {
  describe('Tool Schema Validation', () => {
    it('should have 4 tools defined', () => {
      const { allTools } = require('@/lib/mcp/schemas');
      expect(allTools).toHaveLength(4);
    });

    it('should have search_places tool', () => {
      const { allTools } = require('@/lib/mcp/schemas');
      const searchTool = allTools.find((t: any) => t.name === 'search_places');

      expect(searchTool).toBeDefined();
      expect(searchTool.description).toContain('local businesses');
      expect(searchTool.inputSchema.required).toContain('query');
      expect(searchTool.inputSchema.required).toContain('location_text');
    });

    it('should have get_place_details tool', () => {
      const { allTools } = require('@/lib/mcp/schemas');
      const detailsTool = allTools.find(
        (t: any) => t.name === 'get_place_details'
      );

      expect(detailsTool).toBeDefined();
      expect(detailsTool.description).toContain('detailed information');
      expect(detailsTool.inputSchema.required).toContain('place_id');
    });

    it('should have get_directions tool', () => {
      const { allTools } = require('@/lib/mcp/schemas');
      const directionsTool = allTools.find(
        (t: any) => t.name === 'get_directions'
      );

      expect(directionsTool).toBeDefined();
      expect(directionsTool.description).toContain('directions');
      expect(directionsTool.inputSchema.required).toContain('origin');
      expect(directionsTool.inputSchema.required).toContain('destination');
    });

    it('should have compose_map_resource tool', () => {
      const { allTools } = require('@/lib/mcp/schemas');
      const mapTool = allTools.find(
        (t: any) => t.name === 'compose_map_resource'
      );

      expect(mapTool).toBeDefined();
      expect(mapTool.description).toContain('map');
      expect(mapTool.inputSchema.required).toContain('state_id');
      expect(mapTool._meta).toBeDefined();
      expect(mapTool._meta.embedded_resource).toBeDefined();
    });
  });

  describe('Tool Parameters', () => {
    it('search_places should have filter parameters', () => {
      const { searchPlacesSchema } = require('@/lib/mcp/schemas');

      expect(searchPlacesSchema.inputSchema.properties).toHaveProperty(
        'open_now'
      );
      expect(searchPlacesSchema.inputSchema.properties).toHaveProperty(
        'min_rating'
      );
      expect(searchPlacesSchema.inputSchema.properties).toHaveProperty(
        'sort_by'
      );
      expect(searchPlacesSchema.inputSchema.properties).toHaveProperty(
        'radius_m'
      );
    });

    it('sort_by should have enum values', () => {
      const { searchPlacesSchema } = require('@/lib/mcp/schemas');
      const sortBy = searchPlacesSchema.inputSchema.properties.sort_by;

      expect(sortBy.enum).toEqual(['relevance', 'rating', 'distance']);
    });

    it('get_directions should support multiple travel modes', () => {
      const { getDirectionsSchema } = require('@/lib/mcp/schemas');
      const mode = getDirectionsSchema.inputSchema.properties.mode;

      expect(mode.enum).toContain('driving');
      expect(mode.enum).toContain('walking');
      expect(mode.enum).toContain('transit');
      expect(mode.enum).toContain('bicycling');
    });
  });

  describe('Tool Descriptions', () => {
    it('all tools should have meaningful descriptions', () => {
      const { allTools } = require('@/lib/mcp/schemas');

      allTools.forEach((tool: any) => {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(20);
      });
    });

    it('all parameters should have descriptions', () => {
      const { allTools } = require('@/lib/mcp/schemas');

      allTools.forEach((tool: any) => {
        Object.values(tool.inputSchema.properties).forEach((prop: any) => {
          expect(prop.description).toBeDefined();
          expect(prop.description.length).toBeGreaterThan(5);
        });
      });
    });
  });
});

describe('Session Management', () => {
  it('should generate unique state IDs', () => {
    const { sessionStore } = require('@/lib/session/store');

    const id1 = sessionStore.generateStateId();
    const id2 = sessionStore.generateStateId();

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it('should store and retrieve session data', () => {
    const { sessionStore } = require('@/lib/session/store');

    const stateId = sessionStore.generateStateId();
    const sessionData = {
      state_id: stateId,
      search_results: [],
      center: { lat: 0, lng: 0 },
      bounds: { ne: { lat: 0, lng: 0 }, sw: { lat: 0, lng: 0 } },
      last_query: 'test',
      timestamp: Date.now(),
    };

    sessionStore.set(sessionData);
    const retrieved = sessionStore.get(stateId);

    expect(retrieved).toEqual(sessionData);
  });

  it('should delete session data', () => {
    const { sessionStore } = require('@/lib/session/store');

    const stateId = sessionStore.generateStateId();
    const sessionData = {
      state_id: stateId,
      search_results: [],
      center: { lat: 0, lng: 0 },
      bounds: { ne: { lat: 0, lng: 0 }, sw: { lat: 0, lng: 0 } },
      last_query: 'test',
      timestamp: Date.now(),
    };

    sessionStore.set(sessionData);
    expect(sessionStore.get(stateId)).toBeDefined();

    sessionStore.delete(stateId);
    expect(sessionStore.get(stateId)).toBeUndefined();
  });
});
