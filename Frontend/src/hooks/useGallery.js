import { useQuery } from '@tanstack/react-query'
import client from '../api/client.js'
import api from '../api/config.js'

export const useGallery = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['gallery', page, limit],
    queryFn: () => client(`${api.endpoints.gallery}?page=${page}&limit=${limit}`),
  })
}

