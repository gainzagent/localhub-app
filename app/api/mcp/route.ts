/**
 * MCP API Route
 * Main endpoint for Model Context Protocol server
 */

import { NextRequest, NextResponse } from 'next/server';
import { allTools } from '@/lib/mcp/schemas';
import { searchPlaces } from './tools/searchPlaces';
import { getPlaceDetails } from './tools/getPlaceDetails';
import { getDirections } from './tools/getDirections';
import { composeMapResource } from './tools/composeMapResource';
import { handleAPIError } from '@/lib/utils/errors';
import type { MCPToolRequest, MCPToolResponse } from '@/types/mcp';

/**
 * Tool handlers map
 */
const toolHandlers: Record<string, (input: unknown) => Promise<unknown>> = {
  search_places: searchPlaces,
  get_place_details: getPlaceDetails,
  get_directions: getDirections,
  compose_map_resource: composeMapResource,
};

/**
 * Handle MCP tool requests
 */
export async function POST(request: NextRequest) {
  try {
    // Add timeout for reading request body
    const bodyPromise = request.json();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request body read timeout')), 4000)
    );

    const body = (await Promise.race([
      bodyPromise,
      timeoutPromise,
    ])) as MCPToolRequest;

    console.log('[MCP] Received request:', {
      method: body.method,
      toolName: body.method === 'tools/call' ? body.params?.name : undefined,
    });

    // Handle initialize request
    if (body.method === 'initialize') {
      const response = NextResponse.json({
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {},
          },
          serverInfo: {
            name: 'LocalHub MCP Server',
            version: '1.0.0',
          },
        },
      });
      response.headers.set('Access-Control-Allow-Origin', 'https://chat.openai.com');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // Handle tools/list request
    if (body.method === 'tools/list') {
      const response = NextResponse.json({
        result: {
          tools: allTools,
        },
      });
      response.headers.set('Access-Control-Allow-Origin', 'https://chat.openai.com');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // Handle tools/call request
    if (body.method === 'tools/call') {
      const toolName = body.params?.name;
      const toolArgs = body.params?.arguments;

      if (!toolName) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_REQUEST',
              message: 'Tool name is required',
            },
          },
          { status: 400 }
        );
      }

      const handler = toolHandlers[toolName];
      if (!handler) {
        return NextResponse.json(
          {
            error: {
              code: 'TOOL_NOT_FOUND',
              message: `Tool not found: ${toolName}`,
            },
          },
          { status: 404 }
        );
      }

      try {
        const result = await handler(toolArgs);

        const response = {
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          },
        };

        const jsonResponse = NextResponse.json(response);
        jsonResponse.headers.set('Access-Control-Allow-Origin', 'https://chat.openai.com');
        jsonResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        jsonResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        jsonResponse.headers.set('Access-Control-Allow-Credentials', 'true');
        return jsonResponse;
      } catch (error) {
        console.error(`Tool execution error (${toolName}):`, error);

        const response = {
          result: {
            content: [
              {
                type: 'text',
                text: error instanceof Error ? error.message : 'Unknown error',
              },
            ],
            isError: true,
          },
        };

        return NextResponse.json(response, { status: 500 });
      }
    }

    // Unknown method
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_METHOD',
          message: `Unknown method: ${body.method}`,
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('MCP request error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests (for health check)
 */
export async function GET() {
  const response = NextResponse.json({
    name: 'LocalHub MCP Server',
    version: '1.0.0',
    capabilities: {
      tools: true,
      resources: true,
    },
    tools: allTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
    })),
  });
  response.headers.set('Access-Control-Allow-Origin', 'https://chat.openai.com');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', 'https://chat.openai.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}
