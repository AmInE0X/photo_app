import { executeSparql } from '../utils/sparql'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Require authenticated user
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userEmail = user.email || ''

  // SPARQL: fetch all books added by this user, including author and category labels
  const query = `
    PREFIX : <http://example.org/library#>

    SELECT ?book ?title ?addedBy ?authorName ?catName WHERE {
      ?book a :Book ;
            :title ?title ;
            :addedBy ?addedBy .
      FILTER(?addedBy = "${userEmail.replace(/"/g, '\\"')}")
      OPTIONAL { ?book :writtenBy ?author . ?author :name ?authorName . }
      OPTIONAL { ?book :belongsTo ?cat . ?cat :name ?catName . }
    }
    ORDER BY ?title
  `

  let rows: any[] = []

  try {
    const response: any = await executeSparql(query)
    rows = response?.results?.bindings?.map((row: any) => ({
      id: row.book.value,
      title: row.title?.value || '',
      addedBy: row.addedBy?.value || '',
      author: row.authorName?.value || '—',
      category: row.catName?.value || '—'
    })) || []
  } catch (e) {
    // Fuseki not reachable: return empty list (no mock data per-user makes sense)
    rows = []
  }

  return { books: rows, user: userEmail }
})
