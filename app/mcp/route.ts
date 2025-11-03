/**
 * MCP Alias Route
 * Provides /mcp as an alias to /api/mcp for compatibility
 */

import { GET as ApiGet, POST as ApiPost, OPTIONS as ApiOptions } from '../api/mcp/route';

export { ApiGet as GET, ApiPost as POST, ApiOptions as OPTIONS };
