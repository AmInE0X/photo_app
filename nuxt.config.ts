// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],


  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    fusekiEndpoint: process.env.FUSEKI_ENDPOINT || 'http://localhost:3030/myGraph/sparql' ,
    fusekiUpdateEndpoint: process.env.FUSEKI_UPDATE_ENDPOINT || 'http://localhost:3030/myGraph/update'
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false // So it doesn't try to redirect everything by default initially
  }
})
