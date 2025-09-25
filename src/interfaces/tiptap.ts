export interface Mark {
  type: string
  attrs?: Record<string, unknown>
}

// Represents a piece of text with its associated marks
export interface TextNode {
  type: 'text'
  text: string
  marks?: Mark[]
}

// Represents a block-level element in the document (paragraph, heading, blueprint)
export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: (TiptapNode | TextNode)[] // A node can contain other nodes or text
}

// The root document structure that Tiptap produces
export interface TiptapDocument {
  type: 'doc'
  content: TiptapNode[]
}
