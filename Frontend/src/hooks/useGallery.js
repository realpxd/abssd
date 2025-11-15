import { useQuery } from '@tanstack/react-query'
import client from '../api/client.js'
import api from '../api/config.js'

export const useGallery = () => {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: () => client(api.endpoints.gallery),
  })
}

