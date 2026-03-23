import { executeSparql } from '../utils/sparql'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const id = queryParams.id as string

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ID parameter' })
  }

  const query = `
    PREFIX : <http://example.org/library#>
    SELECT ?p ?o WHERE {
      <${id}> ?p ?o .
    }
  `

  let response: any
  let isMocked = false

  try {
    response = await executeSparql(query)
  } catch (err) {
    console.warn(`Could not connect to Fuseki for node ${id}. Falling back to mock data.`)
    isMocked = true
    
    // Mock data for node details
    const mockDetails: Record<string, Record<string, string[]>> = {
      ':Author_George_Orwell': { name: ['George Orwell'], type: ['Author'] },
      ':Author_JK_Rowling': { name: ['J.K. Rowling'], type: ['Author'] },
      ':Category_Dystopian': { name: ['Dystopian'], type: ['Category'] },
      ':Category_Fantasy': { name: ['Fantasy'], type: ['Category'] },
      ':Book_1984': { title: ['1984'], type: ['Book'], writtenBy: [':Author_George_Orwell'], belongsTo: [':Category_Dystopian'] },
      ':Book_Animal_Farm': { title: ['Animal Farm'], type: ['Book'], writtenBy: [':Author_George_Orwell'], belongsTo: [':Category_Dystopian'] },
      ':Book_Sorcerers_Stone': { title: ['Harry Potter and the Sorcerer\'s Stone'], type: ['Book'], writtenBy: [':Author_JK_Rowling'], belongsTo: [':Category_Fantasy'] }
    }

    const data = mockDetails[id] || { info: ['No mock details available for this node'] }
    return { id, details: data, isMocked: true }
  }

  const details: Record<string, string[]> = {}

  if (response?.results?.bindings) {
    for (const row of response.results.bindings) {
      const pred = row.p.value.split('#')[1] || row.p.value.split('/').pop() || row.p.value
      const obj = row.o.value

      if (!details[pred]) {
        details[pred] = []
      }
      details[pred].push(obj)
    }
  }

  return {
    id,
    details
  }
})
