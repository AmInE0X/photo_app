import { executeUpdateSparql } from '../utils/sparql'
import { randomUUID } from 'crypto'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'No body provided' })
  }

  const { title, author, category, publisher } = body

  if (!title || !author || !category || !publisher) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const uniqueId = randomUUID().replace(/-/g, '_')
  
  // Create URIs safely
  const bookUri = `http://example.org/library#Book_${uniqueId}`
  
  const slugAuthor = author.trim().replace(/[^a-zA-Z0-9]/g, '_')
  const authorUri = `http://example.org/library#Author_${slugAuthor}`
  
  const slugCat = category.trim().replace(/[^a-zA-Z0-9]/g, '_')
  const catUri = `http://example.org/library#Category_${slugCat}`

  const slugPub = publisher.trim().replace(/[^a-zA-Z0-9]/g, '_')
  const pubUri = `http://example.org/library#Publisher_${slugPub}`

  const userEmail = user.email || 'unknown'

  let sparqlInsert = `
    PREFIX : <http://example.org/library#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    INSERT DATA {
      <${bookUri}> a :Book ;
                   :title "${title.replace(/"/g, '\\"')}" ;
                   :addedBy "${userEmail.replace(/"/g, '\\"')}" ;
                   :writtenBy <${authorUri}> ;
                   :belongsTo <${catUri}> ;
                   :publishedBy <${pubUri}> .
      
      <${authorUri}> a :Author ;
                     :name "${author.replace(/"/g, '\\"')}" .
                     
      <${catUri}> a :Category ;
                  :name "${category.replace(/"/g, '\\"')}" .

      <${pubUri}> a :Publisher ;
                  :name "${publisher.replace(/"/g, '\\"')}" .
    }
  `

  try {
    await executeUpdateSparql(sparqlInsert)
  } catch (e: any) {
    console.error('Failed to insert new book into graph', e)
    throw createError({ 
        statusCode: 500, 
        statusMessage: 'Book API received request, but Knowledge Graph update failed. Ensure Fuseki is running and writeable.',
        data: e.message
    })
  }

  return {
    success: true,
    message: 'Book inserted into Knowledge Graph successfully',
    data: {
      bookUri,
      authorUri,
      catUri,
      pubUri
    }
  }
})
