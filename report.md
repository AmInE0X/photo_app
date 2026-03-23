# 📚 Semantic Library System — Full Technical Report

## 1. Project Overview

The **Semantic Library System** is a full-stack web application that represents library data (Books, Authors, Categories) as a **Knowledge Graph** using the **Semantic Web** stack. Users can:

- **Visualize** the relationships between books, authors, and categories in an interactive graph
- **Search** for books by title in real-time
- **Add** new books that are permanently stored as RDF triples in a triple-store database
- **Inspect** full properties of any node by clicking on it

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Nuxt 3 (Vue 3) | Full-stack SSR/SPA hybrid |
| **UI Library** | Nuxt UI (v4) | Components, forms, toasts, cards |
| **Graph Visualization** | Cytoscape.js | Interactive Knowledge Graph rendering |
| **Authentication** | Supabase Auth | User login, session management |
| **Triple Store** | Apache Jena Fuseki | SPARQL-based RDF database |
| **Query Language** | SPARQL | Semantic database reads and writes |
| **Ontology Language** | OWL / Turtle (.ttl) | Knowledge model definition |
| **Type Safety** | TypeScript | Full type coverage on front and backend |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design |

---

## 3. Ontology (Knowledge Model)

The ontology is defined in OWL and serialized in Turtle format at [ontology/ontology.ttl](file:///d:/photo_app/ontology/ontology.ttl).

### 3.1 Namespace
```turtle
@prefix : <http://example.org/library#> .
```

### 3.2 Classes
| Class | URI | Description |
|---|---|---|
| `:Book` | `library#Book` | A published book |
| `:Author` | `library#Author` | A person who wrote a book |
| `:Category` | `library#Category` | A genre or subject classification |

### 3.3 Object Properties (Relationships)

| Property | Domain | Range | Description |
|---|---|---|---|
| `:writtenBy` | `:Book` | `:Author` | Links a book to its author |
| `:belongsTo` | `:Book` | `:Category` | Links a book to its genre |

### 3.4 Data Properties

| Property | Domain | Type | Description |
|---|---|---|---|
| `:title` | `:Book` | `xsd:string` | The text title of a book |
| `:name` | `:Author`, `:Category` | `xsd:string` | The display name |

---

## 4. Sample RDF Data

Located at [ontology/sample_data.ttl](file:///d:/photo_app/ontology/sample_data.ttl). Contains 7 nodes and 6 relationships:

```turtle
# 2 Authors
:Author_George_Orwell  :name "George Orwell"
:Author_JK_Rowling     :name "J.K. Rowling"

# 2 Categories
:Category_Dystopian    :name "Dystopian"
:Category_Fantasy      :name "Fantasy"

# 3 Books
:Book_1984             :title "1984"             → writtenBy Orwell, belongsTo Dystopian
:Book_Animal_Farm      :title "Animal Farm"       → writtenBy Orwell, belongsTo Dystopian
:Book_Sorcerers_Stone  :title "Harry Potter..."  → writtenBy Rowling, belongsTo Fantasy
```

---

## 5. Project File Structure

```
d:/photo_app/
├── ontology/
│   ├── ontology.ttl          # OWL class/property definitions
│   └── sample_data.ttl       # 3 books, 2 authors, 2 categories
│
├── server/
│   ├── api/
│   │   ├── graph.get.ts      # GET /api/graph → fetch all nodes & edges
│   │   ├── node.get.ts       # GET /api/node?id= → single node details
│   │   ├── book.post.ts      # POST /api/book → insert new book
│   │   └── search.get.ts     # GET /api/search?text= → find books by title
│   └── utils/
│       └── sparql.ts         # Shared SPARQL/SELECT + UPDATE utilities
│
├── app/
│   ├── pages/
│   │   ├── index.vue         # Home: Graph viewer + Search bar
│   │   ├── add.vue           # Add Book form
│   │   └── login.vue         # Supabase login page
│   ├── components/
│   │   ├── GraphView.vue     # Cytoscape.js wrapper component
│   │   └── NodeDetails.vue   # Sidebar: clicked node properties
│   └── app.vue               # Root layout, navbar, auth state
│
├── .env                      # FUSEKI_ENDPOINT, SUPABASE_URL, SUPABASE_KEY
└── nuxt.config.ts            # Nuxt configuration
```

---

## 6. Backend API Reference

### `GET /api/graph`

Returns all nodes and edges for Cytoscape.

**How it works:**
```
SPARQL SELECT → Fuseki /myGraph/query
↓
Filter types: Book, Author, Category
↓
Convert to Cytoscape elements (nodes + edges)
↓
Return JSON
```

**Response Example:**
```json
{
  "isMocked": false,
  "elements": [
    { "data": { "id": "http://example.org/library#Book_1984", "label": "1984", "type": "Book" } },
    { "data": { "id": "http://example.org/library#Author_George_Orwell", "label": "George Orwell", "type": "Author" } },
    { "data": { "source": "...Book_1984", "target": "...Author_George_Orwell", "label": "writtenBy" } }
  ]
}
```

---

### `GET /api/node?id=<uri>`

Returns all properties of a selected node.

**Example Request:**
```
GET /api/node?id=http://example.org/library#Book_1984
```

**Example Response:**
```json
{
  "id": "http://example.org/library#Book_1984",
  "details": {
    "type": ["Book"],
    "title": ["1984"],
    "writtenBy": ["http://example.org/library#Author_George_Orwell"],
    "belongsTo": ["http://example.org/library#Category_Dystopian"]
  }
}
```

---

### `POST /api/book`

Inserts a new book into Fuseki using SPARQL UPDATE. Requires a logged-in Supabase user.

**Request Body:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "category": "Classic"
}
```

**SPARQL Generated:**
```sparql
PREFIX : <http://example.org/library#>
INSERT DATA {
  <library#Book_abc123> a :Book ;
                        :title "The Great Gatsby" ;
                        :writtenBy <library#Author_F__Scott_Fitzgerald> ;
                        :belongsTo <library#Category_Classic> .
  <library#Author_F__Scott_Fitzgerald> a :Author ; :name "F. Scott Fitzgerald" .
  <library#Category_Classic> a :Category ; :name "Classic" .
}
```

**Response:**
```json
{ "success": true, "message": "Book inserted into Knowledge Graph successfully" }
```

---

### `GET /api/search?text=<query>`

Returns books whose title contains the search string (case-insensitive).

**Example:**
```
GET /api/search?text=harry
```

**SPARQL Used:**
```sparql
FILTER(CONTAINS(LCASE(?title), LCASE("harry")))
```

**Response:**
```json
{
  "results": [
    { "id": "http://example.org/library#Book_Sorcerers_Stone", "title": "Harry Potter and the Sorcerer's Stone" }
  ]
}
```

---

## 7. How the Knowledge Graph Works

```
User opens http://localhost:3000
↓
Authentication check (Supabase)
↓
/api/graph fetches all RDF triples from Fuseki
↓
Triples converted to Cytoscape.js elements
↓
Graph rendered with colored nodes:
  🔵 Blue Rectangle  = Book
  🟠 Orange Ellipse  = Author
  🟢 Green Tag       = Category
↓
User clicks node → /api/node fetches properties → sidebar shows details
User types search → /api/search queries Fuseki → graph highlights result
User fills "Add Book" → /api/book issues SPARQL INSERT → new node appears on refresh
```

---

## 8. Configuration

### [.env](file:///d:/photo_app/.env) file
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
FUSEKI_ENDPOINT=http://localhost:3030/myGraph/query
```

### Fuseki Dataset
- Fuseki is started with `fuseki-server --update --mem /myGraph`
- Admin UI available at **http://localhost:3030**
- Dataset named: `/myGraph`
- Query endpoint: `http://localhost:3030/myGraph/query`
- Update endpoint: `http://localhost:3030/myGraph/update`

---

## 9. Running the Application

```bash
# Step 1: Start Fuseki
fuseki-server --update --mem /myGraph

# Step 2: Upload TTL files via http://localhost:3030
# Upload: ontology.ttl + sample_data.ttl

# Step 3: Start Nuxt
cd d:/photo_app
npm run dev

# Step 4: Open browser
http://localhost:3000
```

---

## 10. Mock Data Fallback

If Apache Fuseki is **not running**, the app automatically switches to **mock mode** (shows a yellow warning banner). All 3 sample books are still visible in the graph, but new books added through the form will not persist until Fuseki is available.

---

*Report generated: March 2026 — Semantic Library System v1.0*
