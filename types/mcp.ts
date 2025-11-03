/**
 * MCP (Model Context Protocol) Type Definitions
 * Types for MCP server implementation
 */

export interface MCPToolSchema {
  type: string;
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface MCPToolMetadata {
  component?: {
    display: 'inline' | 'fullscreen';
    title?: string;
    expand_to?: 'fullscreen';
  };
  embedded_resource?: {
    id: string;
    content_type: string;
    inline_html_path: string;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: MCPToolSchema;
  _meta?: MCPToolMetadata;
}

export interface MCPToolRequest {
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
}

export interface MCPToolResponse {
  content: Array<{
    type: string;
    text?: string;
    data?: unknown;
  }>;
  isError?: boolean;
}

export interface MCPListToolsResponse {
  tools: MCPTool[];
}

export interface MCPServerConfig {
  name: string;
  version: string;
  capabilities: {
    tools?: boolean;
    resources?: boolean;
  };
}

export type MCPToolHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput
) => Promise<TOutput>;
