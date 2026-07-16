import { showToast } from '../store/ui'

export type SharePayload = {
  title: string
  description?: string
  /** 공유할 웹 경로 또는 전체 URL */
  path: string
  imageUrl?: string
}

function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean
      init: (key: string) => void
      Share?: {
        sendDefault: (options: Record<string, unknown>) => void
      }
      Link?: {
        sendDefault: (options: Record<string, unknown>) => void
      }
    }
  }
}

let kakaoSdkPromise: Promise<boolean> | null = null

function loadKakaoSdk(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Kakao?.isInitialized?.()) return Promise.resolve(true)
  if (kakaoSdkPromise) return kakaoSdkPromise

  const key = (import.meta.env.VITE_KAKAO_MAP_KEY ?? '').trim()
  if (!key) return Promise.resolve(false)

  kakaoSdkPromise = new Promise((resolve) => {
    const existing = document.getElementById('kakao-js-sdk')
    const onReady = () => {
      try {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(key)
        }
        resolve(!!window.Kakao?.isInitialized?.())
      } catch {
        resolve(false)
      }
    }
    if (existing) {
      onReady()
      return
    }
    const script = document.createElement('script')
    script.id = 'kakao-js-sdk'
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
    script.async = true
    script.onload = onReady
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
  return kakaoSdkPromise
}

async function tryKakaoShare(payload: SharePayload, url: string): Promise<boolean> {
  const ok = await loadKakaoSdk()
  if (!ok || !window.Kakao) return false
  try {
    const share = window.Kakao.Share ?? window.Kakao.Link
    if (!share?.sendDefault) return false
    share.sendDefault({
      objectType: 'feed',
      content: {
        title: payload.title,
        description: payload.description ?? '명랑회에서 함께할 동행 펀딩을 확인해보세요.',
        imageUrl:
          payload.imageUrl ||
          'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/4d4f3c7c017900001.png',
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: '펀딩 보기',
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      ],
    })
    return true
  } catch {
    return false
  }
}

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    showToast('링크를 복사했어요. 카톡 등에 붙여넣기 하세요!', 'success')
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = url
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showToast('링크를 복사했어요', 'success')
  }
}

/**
 * 카카오톡 공유 우선 → Web Share API → 링크 복사
 */
export async function shareFunding(payload: SharePayload) {
  const url = absoluteUrl(payload.path)
  const text = `${payload.title}\n${payload.description ?? ''}\n${url}`.trim()

  const kakaoOk = await tryKakaoShare(payload, url)
  if (kakaoOk) {
    showToast('카카오톡 공유 창을 열었어요', 'info')
    return
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.description ?? text,
        url,
      })
      return
    } catch (e) {
      // 사용자가 취소한 경우는 무시
      if (e instanceof Error && e.name === 'AbortError') return
    }
  }

  await copyLink(url)
}
