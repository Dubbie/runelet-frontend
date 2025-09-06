import type { ApiResponse, Item } from '@/interfaces'

class ItemApiService {
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = 'https://runelet-api.ddev.site/api/v1'
  }

  public async getItems(page: number = 1, query: string = ''): Promise<ApiResponse<Item>> {
    const url = new URL(`${this.baseUrl}/items`)
    url.searchParams.append('page', page.toString())
    if (query) {
      url.searchParams.append('filter[search]', query)
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to fetch items')
    }
    return response.json()
  }
}

export const itemApiService = new ItemApiService()
