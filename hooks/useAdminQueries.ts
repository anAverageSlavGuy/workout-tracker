import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Exercise, EquipmentType, MuscleGroup } from '../lib/types'

export function useEquipmentTypes() {
  return useQuery<EquipmentType[]>({
    queryKey: ['equipment_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name')
      if (error) throw error
      return data || []
    },
  })
}

export function useExercisesAdmin() {
  return useQuery<Exercise[]>({
    queryKey: ['exercises_admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*, equipment_types(*), exercise_muscles(*, muscle_groups(*))')
        .is('user_id', null)
        .order('name')
      if (error) throw error
      return data || []
    },
  })
}

export function useExerciseMuscles(exerciseId: string | null) {
  return useQuery({
    queryKey: ['exercise_muscles', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return []
      const { data, error } = await supabase
        .from('exercise_muscles')
        .select('*, muscle_groups(*)')
        .eq('exercise_id', exerciseId)
      if (error) throw error
      return data || []
    },
    enabled: !!exerciseId,
  })
}

export function useMuscleGroupsAdmin() {
  return useQuery<MuscleGroup[]>({
    queryKey: ['muscle_groups_admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .select('*')
        .order('name')
      if (error) throw error
      return data || []
    },
  })
}
