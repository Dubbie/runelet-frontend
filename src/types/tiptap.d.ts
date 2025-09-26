import '@tiptap/core'

// Use the `declare module` syntax to "open up" the @tiptap/core module for augmentation.
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    // Our custom command is added here.
    addBlueprint: {
      /**
       * A command to insert a blueprint node at the current selection.
       */
      addBlueprint: () => ReturnType
    }
  }
}
