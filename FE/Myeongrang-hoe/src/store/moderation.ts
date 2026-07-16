import { getDB, mutate } from './db'
import { showToast } from './ui'

const BLOCK_KEY = 'mh_blocked_users'
const REPORT_KEY = 'mh_reports'

export type ReportTargetType = 'user' | 'funding' | 'comment' | 'chat'

export type ReportRecord = {
  id: string
  reporterEmail: string
  targetType: ReportTargetType
  targetId: string
  reason: string
  detail?: string
  createdAt: number
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function getBlockedEmails(): string[] {
  return readJson<string[]>(BLOCK_KEY, [])
}

export function isBlocked(email: string): boolean {
  return getBlockedEmails().includes(email.trim().toLowerCase())
}

export function blockUser(email: string) {
  const normalized = email.trim().toLowerCase()
  const list = getBlockedEmails()
  if (list.includes(normalized)) {
    showToast('이미 차단한 사용자예요', 'info')
    return
  }
  writeJson(BLOCK_KEY, [...list, normalized])
  // 로컬 스토어 반응용 더미 mutate
  mutate(() => {})
  showToast('사용자를 차단했어요', 'success')
}

export function unblockUser(email: string) {
  const normalized = email.trim().toLowerCase()
  writeJson(
    BLOCK_KEY,
    getBlockedEmails().filter((e) => e !== normalized),
  )
  mutate(() => {})
  showToast('차단을 해제했어요', 'info')
}

export function submitReport(input: {
  reporterEmail: string
  targetType: ReportTargetType
  targetId: string
  reason: string
  detail?: string
}) {
  const reports = readJson<ReportRecord[]>(REPORT_KEY, [])
  const record: ReportRecord = {
    id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    reporterEmail: input.reporterEmail,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    detail: input.detail,
    createdAt: Date.now(),
  }
  writeJson(REPORT_KEY, [record, ...reports].slice(0, 200))
  showToast('신고가 접수되었어요. 검토 후 조치할게요.', 'success')
  return record
}

/** 차단된 사용자의 펀딩/댓글 필터용 */
export function filterBlockedFundingHost<T extends { hostEmail: string }>(items: T[]): T[] {
  const blocked = new Set(getBlockedEmails())
  if (blocked.size === 0) return items
  return items.filter((f) => !blocked.has(f.hostEmail.toLowerCase()))
}

// getDB import used to ensure store module loads; silence unused in some builds
void getDB
