export interface MuscleGroup {
  id: string
  name: string
}

export interface EquipmentType {
  id: string
  name: string
}

export interface Exercise {
  id: string
  user_id: string | null
  name: string
  equipment_id: string | null
  notes: string | null
  created_at: string
  exercise_muscles?: ExerciseMuscle[]
  equipment_types?: EquipmentType
}

export interface ExerciseMuscle {
  exercise_id: string
  muscle_group_id: string
  activation_percentage: number
  muscle_groups?: MuscleGroup
}

export interface WorkoutTemplate {
  id: string
  user_id: string
  name: string
  template_exercises?: TemplateExercise[]
}

export interface TemplateExercise {
  template_id: string
  exercise_id: string
  target_sets: number
  target_reps: number
  position: number
  exercises?: Exercise
}

export interface Session {
  id: string
  user_id: string
  date: string
  template_id: string | null
  notes: string | null
  session_sets?: SessionSet[]
}

export interface SessionSet {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  weight: number
  reps: number
  rpe: number | null
  set_type: 'topset' | 'backoff' | null
  created_at?: string
  exercises?: Exercise
}

export type MealType = 'colazione' | 'pranzo' | 'cena' | 'spuntino' | 'fuori_pasto'

export interface NutritionProfile {
  user_id: string
  calorie_goal: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
  created_at: string
  updated_at: string
}

export interface NutritionMeal {
  id: string
  user_id: string
  date: string
  meal_type: MealType
  input_text: string
  transcript: string | null
  summary: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number | null
  source: 'ai_import' | 'manual'
  created_at: string
}

export function epley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}
