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
              em => em.muscle_group_id === filters.muscleGroupId
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
        .order('set_number', { foreignTable: 'session_sets' })
        .order('created_at', { foreignTable: 'session_sets' })
        .order('id', { foreignTable: 'session_sets' })
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

      // Se c'è un template, cerco l'ultimo allenamento con lo stesso template
      if (input.template_id) {
        const { data: templateExercises } = await supabase
          .from('template_exercises')
          .select('*, exercises(*)')
          .eq('template_id', input.template_id)
          .order('position')

        if (templateExercises && templateExercises.length > 0) {
          // Cerco l'ultimo allenamento con lo stesso template
          const { data: lastSessions } = await supabase
            .from('sessions')
            .select('id')
            .eq('template_id', input.template_id)
            .neq('id', session.id)
            .order('date', { ascending: false })
            .limit(1)

          let setNumber = 1
          let sets
          if (lastSessions && lastSessions.length > 0) {
            // Prendo i set dall'ultimo allenamento
            const { data: lastSessionSets } = await supabase
              .from('session_sets')
              .select('*')
              .eq('session_id', lastSessions[0].id)
              .order('set_number')

            sets = templateExercises.flatMap(te => {
              const exerciseSets = lastSessionSets?.filter(ss => ss.exercise_id === te.exercise_id) ?? []
              const numSets = exerciseSets.length > 0 ? exerciseSets.length : te.target_sets
              return Array.from({ length: numSets }, (_, i) => {
                const lastSet = exerciseSets[i]
                return {
                  session_id: session.id,
                  exercise_id: te.exercise_id,
                  set_number: setNumber++,
                  weight: lastSet?.weight ?? 0,
                  reps: lastSet?.reps ?? te.target_reps,
                }
              })
            })
          } else {
            // Se non c'è un allenamento precedente, uso i target del template
            sets = templateExercises.flatMap(te =>
              Array.from({ length: te.target_sets }, (_, i) => ({
                session_id: session.id,
                exercise_id: te.exercise_id,
                set_number: setNumber++,
                weight: 0,
                reps: te.target_reps,
              }))
            )
          }

          if (sets.length > 0) {
            await supabase.from('session_sets').insert(sets)
          }
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
      set_type?: string | null
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

export function useUpdateSessionDate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({ date })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Session
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['session', vars.id] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}
