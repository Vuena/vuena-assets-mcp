# vuena-assets

[![vuena-assets MCP server](https://glama.ai/mcp/servers/Vuena/vuena-assets-mcp/badge)](https://glama.ai/mcp/servers/Vuena/vuena-assets-mcp)

A free MCP server that lets AI coding assistants (Claude Code, Cursor, Claude Desktop and any other MCP client) **search and download 76 free CC0 low-poly 3D models** straight into your game project.

- 76 models as GLB: rigged characters, animals, toy cars, Halloween and winter props, PSX-style horror props, and store / gas station / factory / apartment items.
- **CC0 (public domain).** Commercial use is fine, no credit needed.
- No account, no API key.
- Works with three.js, Babylon.js, Godot, Unity (via glTF importers), Unreal (via Interchange / glTF plugin) and anything else that reads glTF 2.0.

> **AI disclosure:** The models are generated procedurally by code written with AI assistance. No AI image or 3D generators were used for the meshes.

Live worker: <https://vuena-assets.test-games.workers.dev> (browse the models, `llms.txt`, `manifest.json`, `catalog.json`).

## Install

There are two ways to run it. Both expose the same search tools.

| | Remote (hosted) | Local (npx, stdio) |
|---|---|---|
| Install | nothing to install | needs Node 18+ |
| `search_assets`, `get_asset`, `list_packs` | yes | yes |
| `download_asset` (saves the file into your project) | no (use the `glb_url` it returns) | yes |

### Claude Code

Remote:

```bash
claude mcp add --transport http vuena-assets https://vuena-assets.test-games.workers.dev/mcp
```

Local (with `download_asset`):

```bash
claude mcp add vuena-assets -- npx -y vuena-assets-mcp
```

### Cursor

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global).

Remote:

```json
{
  "mcpServers": {
    "vuena-assets": { "url": "https://vuena-assets.test-games.workers.dev/mcp" }
  }
}
```

Local:

```json
{
  "mcpServers": {
    "vuena-assets": { "command": "npx", "args": ["-y", "vuena-assets-mcp"] }
  }
}
```

### Claude Desktop

Edit `claude_desktop_config.json` (Settings > Developer > Edit Config):

```json
{
  "mcpServers": {
    "vuena-assets": { "command": "npx", "args": ["-y", "vuena-assets-mcp"] }
  }
}
```

Restart Claude Desktop. (Claude Desktop connects to remote servers through Settings > Connectors; paste `https://vuena-assets.test-games.workers.dev/mcp` there if you prefer the hosted version.)

### Other clients

Any client that speaks MCP works: stdio command `npx -y vuena-assets-mcp`, or streamable HTTP URL `https://vuena-assets.test-games.workers.dev/mcp` (stateless, no auth).

> Until the npm package is published, run it from a clone: `git clone https://github.com/Vuena/vuena-assets-mcp && cd vuena-assets-mcp && npm install && npm run build`, then use `node /path/to/vuena-assets-mcp/dist/stdio.js` as the command.

## Tools

| Tool | What it does |
|---|---|
| `search_assets(query, tags?, rigged?, limit?)` | Ranked search over names, tags, categories and animation clip names. `tags` narrows (e.g. `["winter"]`), `rigged: true` returns only animated characters / animals. |
| `get_asset(id)` | Full details: triangle count, size in metres, animation clips, GLB and preview URLs, licence, matching paid pack. |
| `download_asset(id, format, dest_dir)` | **stdio only.** Saves `<id>.glb` (or the preview `<id>.png`) into `dest_dir`, verifies the SHA-256 against the catalogue. |
| `list_packs()` | The free download plus the optional paid full packs on itch.io, with short descriptions. |

Example prompts:

- "Add a rigged fox with a walk animation to `assets/models` and load it in my three.js scene."
- "Find a snowman and a pine tree, download them into `public/models`."
- "I'm making a store game, what free props do you have?"

### Direct URLs (no MCP needed)

```
https://vuena-assets.test-games.workers.dev/models/{id}.glb
https://vuena-assets.test-games.workers.dev/previews/{id}.png
https://vuena-assets.test-games.workers.dev/catalog.json
```

All files are served with `Access-Control-Allow-Origin: *`, so browser games can load them directly. GLBs are self-contained (textures and animations embedded), glTF 2.0, metres, Y-up.

## The models and the paid packs

The free models are samples of Vuena's larger paid packs on [itch.io](https://vuena.itch.io). The packs are optional: everything served here stays free and CC0 on its own. `list_packs` shows the packs honestly with their itch URLs; each model's `full_pack_url` points to the pack it was taken from. FBX versions of the same models (with textures) are in the free [Vuena Free Mega Starter](https://vuena.itch.io/vuena-free-mega-starter) download.

## Licence

- **Assets (the models, textures, animations, previews): CC0 1.0.** See <https://creativecommons.org/publicdomain/zero/1.0/>. The only third-party files are the wood textures of the armchair and coffee table, from Poly Haven's `oak_veneer_01` by Jenelle van Heerden (CC0; the walnut is a darkened copy).
- **Code in this repository: MIT** (see `LICENSE`).

The GLB and preview files are hosted on the worker and are not stored in this repository (it is code plus the catalogue `data/catalog.json`).

## Development

```bash
npm install
npm run build        # tsc -> dist/ (stdio server)
npm test             # SDK client test against the built stdio server
node scripts/test-stdio.mjs --remote https://vuena-assets.test-games.workers.dev/mcp
npx wrangler dev     # run the remote endpoint locally (needs worker/public with the model files)
```

- `src/core.ts` - catalogue types, search, tool registration (shared).
- `src/stdio.ts` - local stdio server with `download_asset`.
- `src/worker.ts` - Cloudflare Worker: stateless streamable-HTTP MCP at `/mcp`, everything else is static assets.
- `scripts/` - maintainer scripts that build the catalogue and the static site from the source model files.

Built with the official [TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk). Hosted on Cloudflare Workers static assets (free plan).
