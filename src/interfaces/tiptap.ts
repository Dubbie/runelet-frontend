import type { Blueprint } from '@/interfaces'

// A generic Mark object (e.g., for bold, italic, color)
export interface TiptapMark {
  type: string
  // Use 'unknown' instead of 'any' to satisfy the linter.
  attrs?: Record<string, unknown>
}

// A base interface for all Tiptap nodes
interface TiptapNodeBase {
  type: string
  // Optional attributes object
  attrs?: {
    level?: 1 | 2 | 3 | 4 | 5 | 6
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    blueprintData?: Blueprint
    src?: string
    alt?: string
    title?: string
    // Use 'unknown' for other potential attributes.
    [key: string]: unknown
  }
}

// A specific interface for a 'text' node
export interface TiptapTextNode extends TiptapNodeBase {
  type: 'text'
  text: string
  marks?: TiptapMark[]
}

// An interface for parent nodes that can contain other nodes
export interface TiptapParentNode extends TiptapNodeBase {
  content?: TiptapNode[]
}

// A union type representing any possible Tiptap node
export type TiptapNode = TiptapParentNode | TiptapTextNode

// The top-level document structure
export interface TiptapDocument {
  type: 'doc'
  content: TiptapNode[]
}
