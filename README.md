# Semantic Book Web App

A Nuxt 3 full-stack application that visualizes a semantic Knowledge Graph for books, users, tags, and locations. It uses **Cytoscape.js** for interactive visualization, **Apache Jena Fuseki** for storing RDF data and querying via SPARQL, and **Supabase** for user authentication.

## Features
- Interactive Knowledge Graph UI using Cytoscape.js.
- Different colors and shapes for Nodes: 
  - Book (Blue, Rectangle)
  - Tag (Green, Round Tag)
  - User (Orange, Ellipse)
  - Location (Purple, Star)
- Backend APIs powered by SPARQL:
  - `/api/graph`: Fetches and maps RDF triples (nodes and edges) into Cytoscape elements.
  - `/api/node?id=...`: Fetches precise semantic details of a clicked node.
- Real-time OWL inference possibilities.
- User Authentication via Supabase.

## Prerequisites
1. **Node.js** v18+ and `pnpm`
2. **Apache Fuseki** (local or cloud)
3. **Supabase Project** (optional, but highly recommended for auth)

## 1. Setup Data Store (Apache Fuseki)
1. Download [Apache Jena Fuseki](https://jena.apache.org/download/).
2. Start the server (e.g. `fuseki-server`).
3. Create a persistent dataset via the Fuseki Web UI (usually at `http://localhost:3030`). Let's name it `/ds`.
4. Upload the provided TTL files from the `ontology/` directory to the Fuseki dataset:
   - `ontology.ttl` (Defines the model, relations, and data types)
   - `sample_data.ttl` (Contains sample triples)

## 2. Setup Nuxt Built Environment
1. Clone or navigate to the project directory.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   # Fuseki SPARQL Endpoint
   FUSEKI_ENDPOINT=http://localhost:3030/ds/query

   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

## 3. Running Locally
Start the Nuxt 3 development server:
```bash
pnpm run dev
```
Navigate to `http://localhost:3000`. You will be asked to log in or register before you can view the Semantic Knowledge Graph.

## 4. Production Deployment
This app supports multiple deployment targets natively, thanks to Nuxt Nitro.

### Deploying to Vercel or Netlify
1. Connect your GitHub repository to Vercel/Netlify.
2. In the specific platform's settings, define the Environment Variables (`FUSEKI_ENDPOINT`, `SUPABASE_URL`, `SUPABASE_KEY`).
3. Set the build command to `pnpm run build` and output directory to `.output/public` (or let the platform autodetect Nuxt 3).
4. The backend server routes (`/api/graph`, `/api/node`) will automatically be optimized into serverless edge functions.

### Deploying using Docker
1. Generate the standalone build:
   ```bash
   pnpm run build
   ```
2. You can serve the `.output/server/index.mjs` node script directly on your VPS using PM2.
   ```bash
   pm2 start .output/server/index.mjs --name "semantic-book-app"
   ```

## Folder Structure
- `app/` - Contains all Vue components, pages, layout, and Nuxt plugins.
- `ontology/` - Raw OWL / TTL data files.
- `server/api/` - The SPARQL data proxy points to connect Nuxt to Fuseki securely.
- `nuxt.config.ts` - Main framework settings.
