import { executeUpdateSparql } from '../utils/sparql'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { id, newTitle } = body

  if (!id || !newTitle) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id or newTitle' })
  }

  // Delete the old title and insert the new one
  const safeTitle = newTitle.replace(/(["'\\])/g, '\\$1')
  
  const query = `
    PREFIX : <http://example.org/library#>

    DELETE {
      <${id}> :title ?oldTitle .
    }
    INSERT {
      <${id}> :title "${safeTitle}" .
    }
    WHERE {
      <${id}> :title ?oldTitle .
    }
  `

  try {
    await executeUpdateSparql(query)
    return { success: true, message: 'Book title updated successfully' }
  } catch (e) {
    console.error('Update failed', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update knowledge graph' })
  }
})
