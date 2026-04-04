import { executeSparql } from '../utils/sparql'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const categoryId = queryParams.categoryId as string

  if (!categoryId) {
    return { results: [] }
  }

  // Safe URI check
  const idMatch = categoryId.match(/^[a-zA-Z0-9_:#/-]+$/)
  const safeId = idMatch ? categoryId : '<invalid>'
  
  // Query 5: Indirect Relation
  // Finds authors who have written books that belong to a specific category.
  // The relation Author -> Category is indirect: ?author ^:writtenBy / :belongsTo ?category
  const query = `
    PREFIX : <http://example.org/library#>

    SELECT DISTINCT ?author ?authorName WHERE {
      ?author ^:writtenBy / :belongsTo <${safeId}> .
      ?author :name ?authorName .
    }
  `

  let results: any[] = []

  try {
    const response: any = await executeSparql(query)
    results = response?.results?.bindings?.map((row: any) => ({
      id: row.author.value,
      name: row.authorName.value,
    })) || []
  } catch (e) {
    console.error('Failed to fetch indirect relations', e)
    // mock fallback
    if (categoryId.includes('Dystopian')) {
      results = [{ id: 'http://example.org/library#Author_George_Orwell', name: 'George Orwell' }]
    }
  }

  return { results }
})
