import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Exercise, MuscleGroup } from '../lib/types'

export function useMuscleGroups() {
  return useQuery<MuscleGroup[]>({
    queryKey: ['muscle_groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .select('*')
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*, exercise_muscles(*, muscle_groups(*))')
        .order('name')
      if (error) throw error
      return data
    },
  })
}

interface CreateExerciseInput {
  name: string
  equipment?: string
  notes?: string
  primary_muscle_group_id: string
  secondary_muscle_group_ids?: string[]
}

export function useCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateExerciseInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: exercise, error: exErr } = await supabase
        .from('exercises')
        .insert({ name: input.name, equipment: input.equipment, notes: input.notes, user_id: user.id })
        .select()
        .single()
      if (exErr) throw exErr

      const muscleRows = [
        { exercise_id: exercise.id, muscle_group_id: input.primary_muscle_group_id, role: 'primary' },
        ...(input.secondary_muscle_group_ids ?? []).map(id => ({
          exercise_id: exercise.id, muscle_group_id: id, role: 'secondary',
        })),
      ]
      const { error: mErr } = await supabase.from('exercise_muscles').insert(muscleRows)
      if (mErr) throw mErr

      return exercise
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })
}
