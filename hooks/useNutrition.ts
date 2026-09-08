import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MealType, NutritionMeal, NutritionProfile } from '../lib/types'

const defaultProfile = {
  calorie_goal: 2000,
  protein_goal: 120,
  carbs_goal: 250,
  fat_goal: 55,
}

export function useNutritionProfile() {
  return useQuery<NutritionProfile | null>({
    queryKey: ['nutrition_profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nutrition_profiles')
        .select('*')
        .maybeSingle()
      if (error) throw error
      return data as NutritionProfile | null
    },
  })
}

export function useUpsertNutritionProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Omit<NutritionProfile, 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('nutrition_profiles')
        .upsert({
          user_id: user.id,
          ...defaultProfile,
          ...input,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single()
      if (error) throw error
      return data as NutritionProfile
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nutrition_profile'] }),
  })
}

export function useNutritionMeals(from?: string, to?: string) {
  return useQuery<NutritionMeal[]>({
    queryKey: ['nutrition_meals', from, to],
    queryFn: async () => {
      let query = supabase
        .from('nutrition_meals')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (from) query = query.gte('date', from)
      if (to) query = query.lte('date', to)

      const { data, error } = await query
      if (error) throw error
      return data as NutritionMeal[]
    },
  })
}

export function useCreateNutritionMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      date: string
      meal_type: MealType
      input_text: string
      transcript?: string | null
      summary: string
      calories: number
      protein: number
      carbs: number
      fat: number
      confidence?: number | null
      source: 'ai_import' | 'manual'
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('nutrition_meals')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as NutritionMeal
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nutrition_meals'] }),
  })
}

export function useDeleteNutritionMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('nutrition_meals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nutrition_meals'] }),
  })
}
