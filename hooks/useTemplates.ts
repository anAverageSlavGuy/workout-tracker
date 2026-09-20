import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { WorkoutTemplate } from '../lib/types'

export function useTemplates() {
  return useQuery<WorkoutTemplate[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          *,
          template_exercises(*, exercises(*))
        `)
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; exercises: Array<{ exercise_id: string; target_sets: number; target_reps: number; position: number }> }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: template, error: tErr } = await supabase
        .from('workout_templates')
        .insert({ user_id: user.id, name: input.name })
        .select()
        .single()
      if (tErr) throw tErr

      if (input.exercises.length > 0) {
        const rows = input.exercises.map(e => ({ ...e, template_id: template.id }))
        const { error: eErr } = await supabase.from('template_exercises').insert(rows)
        if (eErr) throw eErr
      }

      return template
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error: sessionsError } = await supabase
        .from('sessions')
        .update({ template_id: null })
        .eq('template_id', id)
      if (sessionsError) throw sessionsError

      const { error: exercisesError } = await supabase
        .from('template_exercises')
        .delete()
        .eq('template_id', id)
      if (exercisesError) throw exercisesError

      const { error } = await supabase.from('workout_templates').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useUpdateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('workout_templates')
        .update({ name })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useAddTemplateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ template_id, exercise_id, target_sets, target_reps, position }:
      { template_id: string; exercise_id: string; target_sets: number; target_reps: number; position: number }) => {
      const { data, error } = await supabase
        .from('template_exercises')
        .insert({ template_id, exercise_id, target_sets, target_reps, position })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useDeleteTemplateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ template_id, exercise_id }: { template_id: string; exercise_id: string }) => {
      const { error } = await supabase
        .from('template_exercises')
        .delete()
        .eq('template_id', template_id)
        .eq('exercise_id', exercise_id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}
