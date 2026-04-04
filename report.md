# 📚 Semantic Library System — Rapport de TP Web Sémantique

## 1. Présentation du domaine et Architecture de l'Application

Le système **Semantic Library System** est une application Web visant à gérer un catalogue de bibliothèque intelligent, où les relations entre les Livres, les Auteurs, les Éditeurs et les Catégories (Genres) sont modélisées sous forme de graphe de connaissances (Knowledge Graph). 

L'architecture suit un modèle moderne "Full-stack Semantic Web":
- **Base de données (Triplestore) :** Apache Jena Fuseki. Stocke les triplets RDF interactifs et expose des endpoints SPARQL.
- **Moteur d'inférence :** `OWLFBRuleReasoner` embarqué dans Jena Fuseki via un fichier d'assemblage (`config.ttl`).
- **Backend (API REST) :** Nuxt 3 (Node.js/TypeScript). Agit comme un intermédiaire sécurisé qui transforme nos requêtes RESTful (`GET /api/graph`, `POST /api/book`, etc.) en requêtes SPARQL et convertit les résultats en JSON.
- **Frontend :** Nuxt 3 / Vue 3. Fournit une interface utilisateur interactive visualisant le graphe via **Cytoscape.js**. 

---

## 2. Modélisation de l’ontologie (OWL) et Choix Sémantiques

L'ontologie a été modélisée pour refléter la richesse du domaine de l'édition tout en respectant les standards du W3C.

### Classes (5 au total)
- `:Book` : Représente un livre générique.
- `:PublishedBook` : Sous-classe de `:Book` (`rdfs:subClassOf`), représentant un livre ayant un éditeur officiel.
- `:Author` : Un auteur.
- `:Category` : Le genre littéraire (ex: Dystopie, Fantasy).
- `:Publisher` : La maison d'édition.

### Propriétés Objet (4 au total)
- `:writtenBy` (domaine: `Book`, co-domaine: `Author`)
- `:isAuthorOf` : Définie comme la **relation inverse** de `:writtenBy` (`owl:inverseOf`).
- `:belongsTo` (domaine: `Book`, co-domaine: `Category`)
- `:publishedBy` (domaine: `PublishedBook`, co-domaine: `Publisher`)

### Propriétés de Données (3 au total)
- `:title` (`xsd:string`), `:name`, `:addedBy`.

### Restrictions
Nous avons appliqué une restriction `owl:cardinality` sur la classe `:Book` : tout livre doit posséder exactement un `:title` (`owl:onProperty :title ; owl:cardinality "1"^^xsd:nonNegativeInteger`).

---

## 3. Données RDF et Web de Données (DBpedia)

Le jeu de données (`sample_data.ttl`) contient plus de **25 individus** (auteurs, catégories, éditeurs et livres). 

Pour inscrire notre ontologie locale dans le **Web de Données (Linked Data)**, nous avons utilisé la propriété `owl:sameAs` afin d'aligner nos entités avec celles de DBpedia. Par exemple :
```turtle
:Author_George_Orwell owl:sameAs <http://dbpedia.org/resource/George_Orwell> .
:Category_Dystopian owl:sameAs <http://dbpedia.org/resource/Dystopia> .
```

---

## 4. Requêtes SPARQL

L'application exécute **5 requêtes distinctes** pour remplir tous les cas d'usage du TP :

1. **Requête Simple :** `node.get.ts` interroge récursivement les détails d'un nœud (`SELECT ?p ?o WHERE { <ID> ?p ?o }`).
2. **Requête avec Filtre :** `search.get.ts` permet la recherche textuelle (titre) grâce à `FILTER(regex(str(?title), "...", "i"))`.
3. **Requête avec Jointure :** `mybooks.get.ts` lie le Livre, l'Auteur et la Catégorie par jointure dans le pattern matching.
4. **Requête avec Agrégation :** `stats.get.ts` calcule le nombre de livres par catégorie à l'aide de `COUNT(?book)` et `GROUP BY ?categoryName`.
5. **Relation Indirecte :** `indirect.get.ts` utilise un chemin de propriétés SPARQL (`?author ^:writtenBy / :belongsTo ?category`) pour retrouver les auteurs intervenant dans un genre spécifique, sans lier l'auteur et la catégorie directement.

---

## 5. Raisonnement Sémantique et Inférence

Pour exploiter l'inférence (comme les types implicites d'après le `domain`/`range` et les sous-classes), nous avons configuré Fuseki avec un raisonneur à l'aide du fichier `config.ttl`.

**Exemples d'inférences activées :**
- Étant donné la propriété inverse `owl:inverseOf`, même si la base ne contient que la relation `Livre :writtenBy Auteur`, le moteur déduira automatiquement `Auteur :isAuthorOf Livre`.
- Étant donné `PublishedBook rdfs:subClassOf Book`, toute requête listant les `Book` ramènera également les `PublishedBook` de façon implicite.

*Pour exécuter le serveur avec le raisonneur actif, on utilise:*
`fuseki-server --config=ontology/config.ttl`

---

## 6. Difficultés Rencontrées

1. **Configuration du raisonneur Jena :** Le lancement de base (`--mem`) de Fuseki n'active aucun raisonnement RDFS/OWL. Il a fallu découvrir comment construire un fichier d'assemblage (Assembler file) au format turtle (`config.ttl`) pour attacher le `OWLFBRuleReasoner` à notre dataset en mémoire.
2. **Visualisation Graphe :** Mapper les triplets RDF (qui sont fondamentalement des paires sujet-prédicat-objet) vers les structures "Nœuds et Liens" attendues par le format Cytoscape.js a demandé une manipulation complexe des résultats JSON du endpoint SPARQL.
3. **SPARQL UPDATE Sécurisé :** Permettre l'édition via l'API (ex: `PUT /api/book`) a nécessité l'envoi de requêtes `DELETE` suivies de `INSERT` dans un bloc SPARQL, en s'assurant d'échapper les chaînes de caractères pour prévenir toute injection SPARQL.

---
*Date de remise : Mai 2026*
