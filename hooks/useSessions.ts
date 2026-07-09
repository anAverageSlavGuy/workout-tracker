import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Session, SessionSet } from '../lib/types'

interface SessionFilters {
  muscleGroupId?: string
  exerciseId?: string
  from?: string
  to?: string
}

export function useSessions(filters?: SessionFilters) {
  return useQuery<Session[]>({
    queryKey: ['sessions', filters],
    queryFn: async () => {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          session_sets(
            *,
            exercises(*, exercise_muscles(*, muscle_groups(*)))
          )
        `)
        .order('date', { ascending: false })

      if (filters?.from) query = query.gte('date', filters.from)
      if (filters?.to) query = query.lte('date', filters.to)

      const { data, error } = await query
      if (error) throw error

      let result = data as Session[]

      if (filters?.muscleGroupId) {
        result = result.filter(s =>
          s.session_sets?.some(set =>
            set.exercises?.exercise_muscles?.some(
              em => em.role === 'primary' && em.muscle_group_id === filters.muscleGroupId
            )
          )
        )
      }

      if (filters?.exerciseId) {
        result = result.filter(s =>
          s.session_sets?.some(set => set.exercise_id === filters.exerciseId)
        )
      }

      return result
    },
  })
}

export function useSession(id: string) {
  return useQuery<Session>({
    queryKey: ['session', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          session_sets(
            *,
            exercises(*, exercise_muscles(*, muscle_groups(*)))
          )
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { template_id?: string; date?: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          date: input.date ?? new Date().toISOString().split('T')[0],
          template_id: input.template_id ?? null,
          notes: input.notes ?? null,
        })
        .select()
        .single()
      if (error) throw error

      // Se c'è un template, pre-carico gli esercizi con set vuoti (weight=0)
      if (input.template_id) {
        const { data: templateExercises } = await supabase
          .from('template_exercises')
          .select('*, exercises(*)')
          .eq('template_id', input.template_id)
          .order('position')

        if (templateExercises && templateExercises.length > 0) {
          const sets = templateExercises.flatMap(te =>
            Array.from({ length: te.target_sets }, (_, i) => ({
              session_id: session.id,
              exercise_id: te.exercise_id,
              set_number: i + 1,
              weight: 0,
              reps: te.target_reps,
            }))
          )
          await supabase.from('session_sets').insert(sets)
        }
      }

      return session as Session
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export function useAddSet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      session_id: string
      exercise_id: string
      set_number: number
      weight: number
      reps: number
      rpe?: number
    }) => {
      const { data, error } = await supabase
        .from('session_sets')
        .insert(input)
        .select('*, exercises(*, exercise_muscles(*, muscle_groups(*)))')
        .single()
      if (error) throw error
      return data as SessionSet
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['session', vars.session_id] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useUpdateSet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      session_id: string
      weight?: number
      reps?: number
      rpe?: number | null
    }) => {
      const { id, session_id: _sid, ...updates } = input
      const { data, error } = await supabase
        .from('session_sets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['session', vars.session_id] })
    },
  })
}

export function useDeleteSet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, session_id }: { id: string; session_id: string }) => {
      const { error } = await supabase.from('session_sets').delete().eq('id', id)
      if (error) throw error
      return session_id
    },
    onSuccess: (session_id) => {
      qc.invalidateQueries({ queryKey: ['session', session_id] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sessions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}
