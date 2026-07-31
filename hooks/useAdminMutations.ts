import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// Equipment mutations
export function useCreateEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('equipment_types')
        .insert({ name })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment_types'] }),
  })
}

export function useUpdateEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('equipment_types')
        .update({ name })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment_types'] }),
  })
}

export function useDeleteEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment_types')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment_types'] }),
  })
}

// Muscle group mutations
export function useCreateMuscleGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .insert({ name })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['muscle_groups'] }),
  })
}

export function useUpdateMuscleGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .update({ name })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['muscle_groups'] }),
  })
}

export function useDeleteMuscleGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('muscle_groups')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['muscle_groups'] }),
  })
}

// Exercise mutations
export function useCreateExerciseAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; equipment_id?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert({ ...input, user_id: null })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })
}

export function useUpdateExerciseAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string; name: string; equipment_id?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('exercises')
        .update(input)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })
}

export function useDeleteExerciseAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })
}

// Exercise-muscles mutations
export function useCreateExerciseMuscle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { exercise_id: string; muscle_group_id: string; activation_percentage: number }) => {
      const { data, error } = await supabase
        .from('exercise_muscles')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise_muscles'] }),
  })
}

export function useUpdateExerciseMuscle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ exercise_id, muscle_group_id, activation_percentage }: { exercise_id: string; muscle_group_id: string; activation_percentage: number }) => {
      const { data, error } = await supabase
        .from('exercise_muscles')
        .update({ activation_percentage })
        .eq('exercise_id', exercise_id)
        .eq('muscle_group_id', muscle_group_id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise_muscles'] }),
  })
}

export function useDeleteExerciseMuscle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ exercise_id, muscle_group_id }: { exercise_id: string; muscle_group_id: string }) => {
      const { error } = await supabase
        .from('exercise_muscles')
        .delete()
        .eq('exercise_id', exercise_id)
        .eq('muscle_group_id', muscle_group_id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise_muscles'] }),
  })
}
