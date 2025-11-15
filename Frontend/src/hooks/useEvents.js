import { useQuery } from '@tanstack/react-query'
import client from '../api/client.js'
import api from '../api/config.js'

export const useEvents = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['events', page, limit],
    queryFn: () => client(`${api.endpoints.events}?page=${page}&limit=${limit}`),
  })
}

