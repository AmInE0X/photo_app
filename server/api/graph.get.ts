import { executeSparql } from '../utils/sparql'

export default defineEventHandler(async (event) => {
  const query = `
    PREFIX : <http://example.org/library#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT ?s ?p ?o ?type ?title ?name WHERE {
      {
        ?s rdf:type ?type .
        FILTER (?type IN (:Book, :Author, :Category))
        OPTIONAL { ?s :title ?title }
        OPTIONAL { ?s :name ?name }
      }
      UNION
      {
        ?s ?p ?o .
        FILTER (?p IN (:writtenBy, :belongsTo))
      }
    }
  `

  let response: any
  let isMocked = false

  try {
    response = await executeSparql(query)
  } catch (err) {
    console.warn('Could not connect to Fuseki. Falling back to mock data.')
    isMocked = true
    response = {
      results: {
        bindings: [
          // Nodes
          { s: { value: ':Author_George_Orwell' }, type: { value: ':Author' }, name: { value: 'George Orwell' } },
          { s: { value: ':Author_JK_Rowling' }, type: { value: ':Author' }, name: { value: 'J.K. Rowling' } },
          { s: { value: ':Category_Dystopian' }, type: { value: ':Category' }, name: { value: 'Dystopian' } },
          { s: { value: ':Category_Fantasy' }, type: { value: ':Category' }, name: { value: 'Fantasy' } },
          { s: { value: ':Book_1984' }, type: { value: ':Book' }, title: { value: '1984' } },
          { s: { value: ':Book_Animal_Farm' }, type: { value: ':Book' }, title: { value: 'Animal Farm' } },
          { s: { value: ':Book_Sorcerers_Stone' }, type: { value: ':Book' }, title: { value: 'Harry Potter and the Sorcerer\'s Stone' } },
          // Edges
          { s: { value: ':Book_1984' }, p: { value: ':writtenBy' }, o: { value: ':Author_George_Orwell' } },
          { s: { value: ':Book_1984' }, p: { value: ':belongsTo' }, o: { value: ':Category_Dystopian' } },
          { s: { value: ':Book_Animal_Farm' }, p: { value: ':writtenBy' }, o: { value: ':Author_George_Orwell' } },
          { s: { value: ':Book_Animal_Farm' }, p: { value: ':belongsTo' }, o: { value: ':Category_Dystopian' } },
          { s: { value: ':Book_Sorcerers_Stone' }, p: { value: ':writtenBy' }, o: { value: ':Author_JK_Rowling' } },
          { s: { value: ':Book_Sorcerers_Stone' }, p: { value: ':belongsTo' }, o: { value: ':Category_Fantasy' } }
        ]
      }
    }
  }

  const nodesMap = new Map()
  const edges = []

  if (response?.results?.bindings) {
    for (const row of response.results.bindings) {
      if (row.type) {
        // Node
        const id = row.s.value
        let typeStr = row.type.value.split('#')[1] || row.type.value
        let label = row.title?.value || row.name?.value || id.split('#').pop()

        nodesMap.set(id, {
          data: {
            id,
            label,
            type: typeStr
          }
        })
      } else if (row.p && row.o) {
        // Edge
        const source = row.s.value
        const target = row.o.value
        const predicateStr = row.p.value.split('#')[1] || row.p.value

        edges.push({
          data: {
            id: `${source}-${predicateStr}-${target}`,
            source,
            target,
            label: predicateStr
          }
        })
      }
    }
  }

  return {
    isMocked,
    elements: [
      ...Array.from(nodesMap.values()),
      ...edges
    ]
  }
})
