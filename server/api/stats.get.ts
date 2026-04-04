import { executeSparql } from '../utils/sparql'

export default defineEventHandler(async () => {
  // Query 4: Aggregation Query (GROUP BY and COUNT)
  // Counts the number of books per category
  const query = `
    PREFIX : <http://example.org/library#>

    SELECT ?categoryName (COUNT(?book) AS ?bookCount) WHERE {
      ?book a :Book ;
            :belongsTo ?category .
      ?category :name ?categoryName .
    }
    GROUP BY ?categoryName
    ORDER BY DESC(?bookCount)
  `

  let results: any[] = []

  try {
    const response: any = await executeSparql(query)
    results = response?.results?.bindings?.map((row: any) => ({
      category: row.categoryName.value,
      count: parseInt(row.bookCount.value, 10)
    })) || []
  } catch (e) {
    console.error('Failed to fetch stats', e)
    // Mock data for demo
    results = [
      { category: 'Dystopian', count: 2 },
      { category: 'Fantasy', count: 1 }
    ]
  }

  return { results }
})
