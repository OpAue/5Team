import { showToast } from '../store/ui'

const PERM_ASKED = 'mh_notify_perm_asked'
const TOASTED = 'mh_browser_notified'

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set].slice(-80)))
  } catch {
    // ignore
  }
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

/** 사용자 제스처 안에서 호출 권장 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    showToast('이 브라우저는 알림을 지원하지 않아요', 'info')
    return false
  }
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') {
    showToast('브라우저 알림이 차단되어 있어요. 설정에서 허용해주세요.', 'info')
    return false
  }
  try {
    localStorage.setItem(PERM_ASKED, '1')
  } catch {
    // ignore
  }
  const result = await Notification.requestPermission()
  if (result === 'granted') {
    showToast('브라우저 알림을 켰어요', 'success')
    return true
  }
  showToast('알림 권한이 거부됐어요', 'info')
  return false
}

export function hasAskedNotificationPermission(): boolean {
  try {
    return localStorage.getItem(PERM_ASKED) === '1'
  } catch {
    return false
  }
}

/**
 * 동일 id 알림은 한 번만 띄움 (세션/로컬 중복 방지)
 */
export function notifyBrowser(id: string, title: string, body: string, onClickUrl?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission !== 'granted') return false
  const seen = readSet(TOASTED)
  if (seen.has(id)) return false
  seen.add(id)
  writeSet(TOASTED, seen)

  try {
    const n = new Notification(title, {
      body,
      tag: id,
      icon: '/favicon.ico',
    })
    if (onClickUrl) {
      n.onclick = () => {
        window.focus()
        window.location.href = onClickUrl
        n.close()
      }
    }
    return true
  } catch {
    return false
  }
}
