import type { Campus } from './schema'

export interface SignupDraft {
  email: string
  password: string
  name: string
  campus: Campus
  major: string
  age: string
  bio: string
  interests: string[]
}

const KEY = 'dh_signup_draft'

const defaults: SignupDraft = {
  email: '',
  password: '',
  name: '',
  campus: '인문캠퍼스',
  major: '',
  age: '',
  bio: '',
  interests: [],
}

export function getDraft(): SignupDraft {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch {
    // ignore malformed draft
  }
  return { ...defaults }
}

export function patchDraft(patch: Partial<SignupDraft>) {
  const next = { ...getDraft(), ...patch }
  sessionStorage.setItem(KEY, JSON.stringify(next))
}

export function clearDraft() {
  sessionStorage.removeItem(KEY)
}
