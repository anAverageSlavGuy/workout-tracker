import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export function useIsAdmin() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['is_admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
      return !error && !!data
    },
    enabled: !!user?.id,
  })
}
