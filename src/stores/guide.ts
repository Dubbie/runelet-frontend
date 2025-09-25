import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { TiptapDocument } from '@/interfaces/tiptap'

// We define a new store and name it 'guide'
export const useGuideStore = defineStore('guide', () => {
  // --- STATE ---
  // These refs will hold the data for the single guide we are editing/viewing.
  // They act as our temporary database.
  const guideTitle = ref<string>('Untitled Guide')
  const guideContent = ref<TiptapDocument | null>(null)

  // --- ACTIONS ---
  /**
   * This function simulates saving the guide. It takes the new title and content
   * and updates the state refs.
   * @param title The new title of the guide.
   * @param content The new Tiptap JSON document for the guide's content.
   */
  function saveGuide(title: string, content: TiptapDocument) {
    // A console.log is helpful to confirm the action is being called
    console.log('Saving guide content to Pinia store:', { title, content })

    guideTitle.value = title
    guideContent.value = content
  }

  // --- RETURN ---
  // We must return the state and actions so our components can use them.
  return {
    // State
    guideTitle,
    guideContent,
    // Actions
    saveGuide,
  }
})
