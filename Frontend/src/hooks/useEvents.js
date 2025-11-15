import { useQuery } from '@tanstack/react-query'
import client from '../api/client.js'
import api from '../api/config.js'

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => client(api.endpoints.events),
  })
}

