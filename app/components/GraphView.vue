<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  elements: any[],
  highlightId?: string | null
}>()

const emit = defineEmits<{
  (e: 'nodeClick', id: string): void
}>()

const container = ref<HTMLElement | null>(null)
let cy: any = null

onMounted(async () => {
  if (import.meta.client) {
    const cytoscape = (await import('cytoscape')).default

    cy = cytoscape({
      container: container.value,

      elements: props.elements,

      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#fff',
            'text-outline-color': '#333',
            'text-outline-width': 2,
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px'
          }
        },
        {
          selector: 'edge',
          style: {
            'label': 'data(label)',
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': -10
          }
        },
        // Color nodes based on type
        {
          selector: 'node[type="Book"]',
          style: { 'background-color': '#3b82f6', 'shape': 'rectangle', 'width': 60, 'height': 40 } // Blue
        },
        {
          selector: 'node[type="Author"]',
          style: { 'background-color': '#f97316', 'shape': 'ellipse', 'width': 55, 'height': 55 } // Orange
        },
        {
          selector: 'node[type="Category"]',
          style: { 'background-color': '#10b981', 'shape': 'round-tag', 'width': 70, 'height': 35 } // Green
        },
        {
          selector: '.highlighted',
          style: { 'border-width': 4, 'border-color': '#ef4444', 'width': 80, 'height': 80 }
        }
      ],

      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      }
    })

    cy.on('tap', 'node', (evt: any) => {
      const node = evt.target
      emit('nodeClick', node.id())
    })
  }
})

watch(() => props.elements, (newElements) => {
  if (cy) {
    cy.elements().remove()
    cy.add(newElements)
    cy.layout({ name: 'cose' }).run()
  }
}, { deep: true })

watch(() => props.highlightId, (id) => {
  if (cy) {
    cy.nodes().removeClass('highlighted')
    if (id) {
      const node = cy.getElementById(id)
      if (node.length) {
        node.addClass('highlighted')
        cy.animate({ center: { eles: node }, zoom: 1.5 }, { duration: 500 })
      }
    }
  }
})
</script>

<template>
  <div ref="container" class="w-full h-[600px] border border-gray-200 rounded-lg shadow-inner bg-gray-50"></div>
</template>

<style scoped>
</style>
