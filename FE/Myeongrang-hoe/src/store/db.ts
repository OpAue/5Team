import { useSyncExternalStore } from 'react'
import { createSeedDB, type DB } from './schema'

const STORAGE_KEY = 'dh_db_v4'

let db: DB = load()
const listeners = new Set<() => void>()

function load(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    // fall through to reseed
  }
  const seeded = createSeedDB()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  listeners.forEach((l) => l())
}

/** 스토어를 직접 읽어야 하는 경우 (컴포넌트 밖) */
export function getDB(): DB {
  return db
}

/** 불변 규칙을 지키며 db를 갱신한다: recipe는 draft를 변형하고 반환값은 무시된다. */
export function mutate(recipe: (draft: DB) => void) {
  const next = structuredClone(db)
  recipe(next)
  db = next
  save()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getDB, getDB)
}

export function resetDB() {
  db = createSeedDB()
  save()
}
