import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
// The helper function you exported from your store file
import { createInitialBlueprint } from '@/stores/blueprint'
// The Vue component that will be rendered inside the editor (created below)
import BlueprintNodeView from './BlueprintNodeView.vue'

export default Node.create({
  // The unique name for this node
  name: 'blueprint',
  // It's a block-level element, like a paragraph
  group: 'block',
  // This is crucial: it treats the node as a single, indivisible "atom".
  // The user cannot type inside it or split it.
  atom: true,
  // Allows the user to drag and drop the entire blueprint block within the editor
  draggable: true,

  // Defines the data that this node will store in the Tiptap document
  addAttributes() {
    return {
      blueprintData: {
        // By default, a new node has no data
        default: null,
      },
    }
  },

  // Tells Tiptap how to create this node from saved HTML content
  parseHTML() {
    return [
      {
        tag: 'div[data-type="blueprint"]',
        getAttrs: (element) => {
          const data = (element as HTMLElement).getAttribute('data-blueprint')
          try {
            // We parse the stringified JSON data from the attribute
            return { blueprintData: data ? JSON.parse(data) : createInitialBlueprint() }
          } catch (e) {
            console.error('Failed to parse corrupted blueprint data.', e)
            return { blueprintData: createInitialBlueprint() }
          }
        },
      },
    ]
  },

  // Tells Tiptap how to save this node back into HTML
  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes(
        { 'data-type': 'blueprint' },
        // We stringify the entire blueprint object to store it safely in a single attribute
        { 'data-blueprint': JSON.stringify(node.attrs.blueprintData) },
      ),
    ]
  },

  // This is the most important part: it links our node schema to a Vue component renderer.
  addNodeView() {
    return VueNodeViewRenderer(BlueprintNodeView)
  },

  // This adds a convenient `.addBlueprint()` command to the editor's chainable methods
  addCommands() {
    return {
      addBlueprint:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              // When a new blueprint is inserted, we give it a fresh, empty state.
              blueprintData: createInitialBlueprint(),
            },
          })
        },
    }
  },
})
