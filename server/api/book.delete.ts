import { executeUpdateSparql } from '../utils/sparql'
import { serverSupabaseUser } from '#supabase/server'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const queryParams = getQuery(event)
  const id = queryParams.id as string

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing book ID' })
  }

  const userEmail = user.email || ''

  // Securely delete only if the book was added by this exact user
  const sparqlDelete = `
    PREFIX : <http://example.org/library#>
    DELETE {
      <${id}> ?p ?o .
    }
    WHERE {
      <${id}> :addedBy "${userEmail.replace(/"/g, '\\"')}" .
      <${id}> ?p ?o .
    }
  `

  try {
    await executeUpdateSparql(sparqlDelete)
  } catch (e: any) {
    console.error('Failed to delete book from graph', e)
    throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to delete book from Knowledge Graph.',
        data: e.message
    })
  }

  return { success: true, message: 'Book deleted successfully.' }
})
