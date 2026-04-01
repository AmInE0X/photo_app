import { executeSparql } from '../utils/sparql'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const text = queryParams.text as string

  if (!text) {
    return { results: [] }
  }

  // Safe SPARQL string injection by removing confusing characters
  const safeText = text.replace(/(["'\\])/g, '')
  
  const query = `
    PREFIX : <http://example.org/library#>
    SELECT ?book ?title WHERE {
      ?book a :Book ;
            :title ?title .
      FILTER(regex(str(?title), "${safeText}", "i"))
    }
  `

  let response: any
  try {
    response = await executeSparql(query)
  } catch (err) {
    // Mock for demo if Fuseki is empty or unreachable
    const mockDb = [
      { id: 'http://example.org/library#Book_1984', title: '1984' },
      { id: 'http://example.org/library#Book_Animal_Farm', title: 'Animal Farm' },
      { id: 'http://example.org/library#Book_Sorcerers_Stone', title: "Harry Potter and the Sorcerer's Stone" }
    ]
    return { results: mockDb.filter(b => b.title.toLowerCase().includes(safeText.toLowerCase())) }
  }

  const results = response?.results?.bindings?.map((row: any) => ({
    id: row.book.value,
    title: row.title.value
  })) || []

  return { results }
})
