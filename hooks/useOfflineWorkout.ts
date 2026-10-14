import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Exercise, Session, SessionSet } from '../lib/types'
import { checkNetworkQuality } from '../lib/networkStatus'
import {
  addSetOffline,
  deleteSetOffline,
  getPendingOperationCount,
  getOfflineMode,
  getAutomaticOfflineMode,
  setOfflineMode,
  syncSession,
  updateSessionDateOffline,
  updateSetOffline,
} from '../lib/offlineSession'

export function useOfflineWorkout(sessionId: string) {
  const qc = useQueryClient()
  const [isOfflineMode, setIsOfflineModeState] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const refreshPending = useCallback(async () => {
    setPendingCount(await getPendingOperationCount(sessionId))
  }, [sessionId])

  useEffect(() => {
    let active = true
    void refreshPending()
    void Promise.all([getOfflineMode(sessionId), getAutomaticOfflineMode()]).then(([savedMode, automaticMode]) => {
      if (!active) return
      setIsOfflineModeState(savedMode || automaticMode)
      if (automaticMode && !savedMode) void setOfflineMode(sessionId, true)
    })

    // Also check at session level: the app-wide check and this screen can
    // mount in parallel, so the automatic preference may not exist yet.
    void checkNetworkQuality().then(({ quality }) => {
      if (active && quality !== 'online') {
        setIsOfflineModeState(true)
        void setOfflineMode(sessionId, true)
      }
    })

    return () => { active = false }
  }, [refreshPending, sessionId])

  const setIsOfflineMode = useCallback((enabled: boolean) => {
    setIsOfflineModeState(enabled)
    void setOfflineMode(sessionId, enabled)
  }, [sessionId])

  const updateCache = useCallback((session: Session) => {
    qc.setQueryData(['session', sessionId], session)
  }, [qc, sessionId])

  const addSet = useCallback(async (input: Omit<SessionSet, 'id' | 'created_at'>) => {
    const result = await addSetOffline(sessionId, input)
    updateCache(result.session)
    await refreshPending()
    return result.set
  }, [refreshPending, sessionId, updateCache])

  const addExercise = useCallback(async (exercise: Exercise, input: { weight: number; reps: number | null }, setNumber: number) => {
    return addSet({
      session_id: sessionId,
      exercise_id: exercise.id,
      set_number: setNumber,
      weight: input.weight,
      reps: input.reps,
      rpe: null,
      set_type: null,
      exercises: exercise,
    })
  }, [addSet, sessionId])

  const updateSet = useCallback(async (input: { id: string; weight: number; reps: number | null; rpe?: number | null; set_type?: SessionSet['set_type'] }) => {
    const session = await updateSetOffline(sessionId, input)
    // Update the visible query from the current cache as well as the local
    // record. This avoids replacing the query with a stale snapshot when the
    // offline operation is saved while SetRow is still finishing its edit.
    qc.setQueryData<Session>(['session', sessionId], current => current
      ? {
          ...current,
          session_sets: current.session_sets?.map(set =>
            set.id === input.id ? { ...set, ...input } : set,
          ),
        }
      : session)
    await refreshPending()
  }, [qc, refreshPending, sessionId])

  const deleteSet = useCallback(async (input: { id: string }) => {
    const session = await deleteSetOffline(sessionId, input)
    qc.setQueryData<Session>(['session', sessionId], current => current
      ? {
          ...current,
          session_sets: current.session_sets?.filter(set => set.id !== input.id),
        }
      : session)
    await refreshPending()
  }, [qc, refreshPending, sessionId])

  const updateDate = useCallback(async (date: string) => {
    const session = await updateSessionDateOffline(sessionId, date)
    updateCache(session)
    await refreshPending()
  }, [refreshPending, sessionId, updateCache])

  const sync = useCallback(async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncError(null)
    try {
      const session = await syncSession(sessionId, {
        insertSet: async set => {
          const { error } = await supabase.from('session_sets').upsert(set, { onConflict: 'id' })
          if (error) throw error
        },
        updateSet: async ({ id, ...updates }) => {
          const { error } = await supabase.from('session_sets').update(updates).eq('id', id)
          if (error) throw error
        },
        deleteSet: async ({ id }) => {
          const { error } = await supabase.from('session_sets').delete().eq('id', id)
          if (error) throw error
        },
        updateSession: async ({ id, date }) => {
          const { error } = await supabase.from('sessions').update({ date }).eq('id', id)
          if (error) throw error
        },
      })
      if (session) updateCache(session)
      await refreshPending()
      await qc.invalidateQueries({ queryKey: ['sessions'] })
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sincronizzazione non riuscita')
      await refreshPending()
      throw error
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, qc, refreshPending, sessionId, updateCache])

  return { isOfflineMode, setIsOfflineMode, pendingCount, isSyncing, syncError, addSet, addExercise, updateSet, deleteSet, updateDate, sync }
}
