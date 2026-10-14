import AsyncStorage from '@react-native-async-storage/async-storage'
import { Session, SessionSet } from './types'

export type OfflineSessionOperation =
  | { id: string; type: 'insert_set'; payload: SessionSet }
  | { id: string; type: 'update_set'; payload: { id: string; weight: number; reps: number; rpe?: number | null; set_type?: SessionSet['set_type'] } }
  | { id: string; type: 'delete_set'; payload: { id: string } }
  | { id: string; type: 'update_session'; payload: { id: string; date: string } }

interface OfflineSessionRecord {
  session: Session
  operations: OfflineSessionOperation[]
  updatedAt: string
}

const keyFor = (sessionId: string) => `pumping_iron:offline-session:${sessionId}`
const modeKeyFor = (sessionId: string) => `pumping_iron:offline-mode:${sessionId}`
const automaticModeKey = 'pumping_iron:automatic-offline-mode'

function applyOperation(session: Session, operation: OfflineSessionOperation): Session {
  if (operation.type === 'insert_set') {
    const exists = session.session_sets?.some(set => set.id === operation.payload.id)
    if (exists) return session
    const exercise = operation.payload.exercises ?? session.session_sets?.find(set => set.exercise_id === operation.payload.exercise_id)?.exercises
    const payload = exercise ? { ...operation.payload, exercises: exercise } : operation.payload
    return { ...session, session_sets: [...(session.session_sets ?? []), payload] }
  }
  if (operation.type === 'update_set') {
    return { ...session, session_sets: session.session_sets?.map(set => set.id === operation.payload.id ? { ...set, ...operation.payload } : set) }
  }
  if (operation.type === 'delete_set') {
    return { ...session, session_sets: session.session_sets?.filter(set => set.id !== operation.payload.id) }
  }
  return { ...session, date: operation.payload.date }
}

function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function readRecord(sessionId: string) {
  const raw = await AsyncStorage.getItem(keyFor(sessionId))
  return raw ? JSON.parse(raw) as OfflineSessionRecord : null
}

async function writeRecord(sessionId: string, record: OfflineSessionRecord) {
  await AsyncStorage.setItem(keyFor(sessionId), JSON.stringify(record))
}

export async function cacheSession(session: Session) {
  const previous = await readRecord(session.id)
  const localSession = previous?.operations.reduce(applyOperation, session) ?? session
  await writeRecord(session.id, {
    session: localSession,
    operations: previous?.operations ?? [],
    updatedAt: new Date().toISOString(),
  })
  return localSession
}

export async function getOfflineMode(sessionId: string) {
  return (await AsyncStorage.getItem(modeKeyFor(sessionId))) === 'true'
}

export async function setOfflineMode(sessionId: string, enabled: boolean) {
  await AsyncStorage.setItem(modeKeyFor(sessionId), String(enabled))
}

export async function getAutomaticOfflineMode() {
  return (await AsyncStorage.getItem(automaticModeKey)) === 'true'
}

export async function setAutomaticOfflineMode(enabled: boolean) {
  await AsyncStorage.setItem(automaticModeKey, String(enabled))
}

export async function getCachedSession(sessionId: string) {
  return (await readRecord(sessionId))?.session ?? null
}

export async function getPendingOperationCount(sessionId: string) {
  return (await readRecord(sessionId))?.operations.length ?? 0
}

async function updateLocal(
  sessionId: string,
  operation: OfflineSessionOperation,
  update: (session: Session) => Session,
) {
  const record = await readRecord(sessionId)
  if (!record) throw new Error('Allenamento non disponibile offline')
  const nextSession = update(record.session)
  await writeRecord(sessionId, {
    session: nextSession,
    operations: [...record.operations, operation],
    updatedAt: new Date().toISOString(),
  })
  return nextSession
}

export async function addSetOffline(sessionId: string, input: Omit<SessionSet, 'id' | 'created_at'>) {
  const set: SessionSet = { ...input, id: makeId(), created_at: new Date().toISOString() }
  const next = await updateLocal(
    sessionId,
    { id: makeId(), type: 'insert_set', payload: set },
    session => ({ ...session, session_sets: [...(session.session_sets ?? []), set] }),
  )
  return { set, session: next }
}

export async function updateSetOffline(sessionId: string, input: { id: string; weight: number; reps: number; rpe?: number | null; set_type?: SessionSet['set_type'] }) {
  return updateLocal(
    sessionId,
    { id: makeId(), type: 'update_set', payload: input },
    session => ({
      ...session,
      session_sets: session.session_sets?.map(set => set.id === input.id ? { ...set, ...input } : set),
    }),
  )
}

export async function deleteSetOffline(sessionId: string, input: { id: string }) {
  return updateLocal(
    sessionId,
    { id: makeId(), type: 'delete_set', payload: input },
    session => ({ ...session, session_sets: session.session_sets?.filter(set => set.id !== input.id) }),
  )
}

export async function updateSessionDateOffline(sessionId: string, date: string) {
  return updateLocal(
    sessionId,
    { id: makeId(), type: 'update_session', payload: { id: sessionId, date } },
    session => ({ ...session, date }),
  )
}

function setRow(set: SessionSet) {
  return {
    id: set.id,
    session_id: set.session_id,
    exercise_id: set.exercise_id,
    set_number: set.set_number,
    weight: set.weight,
    reps: set.reps,
    rpe: set.rpe ?? null,
    set_type: set.set_type ?? null,
  }
}

export async function syncSession(sessionId: string, sync: {
  insertSet: (set: ReturnType<typeof setRow>) => Promise<void>
  updateSet: (set: Extract<OfflineSessionOperation, { type: 'update_set' }>['payload']) => Promise<void>
  deleteSet: (set: { id: string }) => Promise<void>
  updateSession: (input: { id: string; date: string }) => Promise<void>
}) {
  const record = await readRecord(sessionId)
  if (!record || record.operations.length === 0) return record?.session ?? null

  let completed = 0
  for (const operation of record.operations) {
    if (operation.type === 'insert_set') await sync.insertSet(setRow(operation.payload))
    if (operation.type === 'update_set') await sync.updateSet(operation.payload)
    if (operation.type === 'delete_set') await sync.deleteSet(operation.payload)
    if (operation.type === 'update_session') await sync.updateSession(operation.payload)
    completed += 1
    const latest = await readRecord(sessionId)
    if (latest) await writeRecord(sessionId, { ...latest, operations: latest.operations.slice(completed) })
  }

  const final = await readRecord(sessionId)
  return final?.session ?? null
}
