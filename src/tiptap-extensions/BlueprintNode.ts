import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import BlueprintNodeView from './BlueprintNodeView.vue'

export default Node.create({
  name: 'blueprint',
  group: 'block',
  atom: true, // This node is a single, indivisible "atom"

  addAttributes() {
    return {
      blueprintId: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="blueprint"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'blueprint' })]
  },

  // This is the most important part!
  // It tells Tiptap to use a Vue component to render this node.
  addNodeView() {
    return VueNodeViewRenderer(BlueprintNodeView)
  },
})
