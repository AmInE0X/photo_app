import { useRuntimeConfig } from '#imports'

export async function executeSparql(query: string) {
  const config = useRuntimeConfig()
  const endpoint = config.fusekiEndpoint as string

  try {
    const response = await $fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json'
      },
      body: query
    })
    return response
  } catch (error: any) {
    console.debug('SPARQL Query Connection Failed (Fallback may occur):', error.message || error)
    throw error
  }
}

export async function executeUpdateSparql(query: string) {
  const config = useRuntimeConfig()
  
  // Default to fusekiUpdateEndpoint from config, fallback to computing from fusekiEndpoint
  let updateEndpoint = config.fusekiUpdateEndpoint as string
  if (!updateEndpoint) {
    const endpoint = config.fusekiEndpoint as string
    updateEndpoint = endpoint
    if (endpoint.endsWith('/sparql')) {
      updateEndpoint = endpoint.replace('/sparql', '/update')
    } else if (endpoint.endsWith('/query')) {
      updateEndpoint = endpoint.replace('/query', '/update')
    }
  }

  try {
    const response = await $fetch(updateEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-update'
      },
      body: query
    })
    return response
  } catch (error: any) {
    console.debug('SPARQL Update Connection Failed:', error.message || error)
    throw error
  }
}
