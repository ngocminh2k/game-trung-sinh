# Common MCP policy

`agents/mcp/registry.json` is the portable, secret-free source of truth. Every agent must expose the server name `codebase-memory` and the capabilities listed there before implementing non-trivial code changes.

## One-time local setup

Set `CODEBASE_MEMORY_MCP_COMMAND` to the local executable path. On this Windows workstation the installed executable is under the local `Programs\\codebase-memory-mcp` directory; each teammate sets their own path and never commits it.

Then configure each client from the registry:

| Client | Committed integration | Local action |
| --- | --- | --- |
| Codex | `AGENTS.md` tells it to use the server | Add the registry values to the user Codex MCP configuration and verify the tools appear. |
| Claude Code | `.mcp.json` uses the environment variable | Approve the project MCP server, then run `/mcp` or `claude mcp list`. |
| Cline | `.clinerules/00-agent-os.md` enforces the policy | Add the registry server to Cline's local MCP settings, then verify it in the MCP panel or `cline mcp`. |
| OpenCode | `opencode.json` contains the current server definition | Ensure its command matches the environment-selected executable and list available tools. |

Portable copy templates for Codex and Cline are in `agents/mcp/adapters/`. They deliberately use the executable name instead of a user path; put the executable on `PATH` or substitute the local path only in that tool's uncommitted user configuration.

Do not put API keys, machine-specific absolute paths, or a permissive remote MCP server into version control. Add a server by updating the registry, each committed adapter, this document, and `npm run agent:check` in the same change.

## Discovery order

For code definitions and relationships, use Codebase Memory in this order: `search_graph`, `trace_path`, `get_code_snippet`, `query_graph`, and then `get_architecture` for wide context. Use `search_code` or terminal search only for literal text, configuration, or gaps in the graph.
