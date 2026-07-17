import { distanceKm, type LatLng } from './geo'
import type { FundingRecord, RiskLevel, UserRecord } from '../store/schema'
import {
  currentCountOf,
  fundingsOf,
  isClosed,
  isExpired,
  isMatched,
  isParticipant,
} from '../store/actions'

export type MyeongBotPick = {
  funding: FundingRecord
  distanceKm: number
  score: number
  /** 한 줄 추천 이유 (예: 관심사 맛집 + 1명 남음 + 신뢰도 높음) */
  reasonLine: string
  reasons: string[]
}

function trustLabel(risk: RiskLevel | string): string | null {
  if (risk === '낮음') return '신뢰도 높음'
  if (risk === '중간') return '신뢰도 보통'
  if (risk === '높음') return '신뢰도 낮음'
  return null
}

function formatDistance(km: number): string {
  if (km < 0.05) return '아주 가까움'
  if (km < 1) return `${Math.max(50, Math.round(km * 1000))}m`
  return `${km.toFixed(1)}km`
}

/**
 * 명랑봇: 지금 나가기 좋은 모임 추천
 *
 * 점수 요소
 * - 거리 · 관심사 · 성사 임박 · 신뢰도
 * - 이전 참가 이력이 있으면 동일 카테고리 가중
 * - 이력 없으면 거리·관심사·성사임박·신뢰도만 사용
 */
export function recommendWithMyeongBot(
  me: UserRecord,
  fundings: FundingRecord[],
  origin: LatLng,
  limit = 6,
): MyeongBotPick[] {
  const history = fundingsOf(me.email)
  const hasHistory = history.length > 0
  const historyCategories = new Set(history.map((f) => f.category))

  const picks: MyeongBotPick[] = []

  for (const f of fundings) {
    if (isClosed(f) || isExpired(f) || isMatched(f)) continue
    if (isParticipant(f, me.email)) continue
    if (f.hostEmail === me.email) continue

    const dist = distanceKm(origin, { lat: f.lat, lng: f.lng })
    const current = currentCountOf(f)
    const remaining = Math.max(0, f.targetCount - current)
    if (remaining <= 0) continue

    let score = 0
    const reasons: string[] = []

    // 1) 관심사
    if (me.interests?.includes(f.category)) {
      score += 42
      reasons.push(`관심사 ${f.category}`)
    }

    // 2) 이전 참가 이력 (있을 때만)
    if (hasHistory && historyCategories.has(f.category)) {
      // 관심사와 겹치면 이유 중복 방지, 점수만 추가
      if (!me.interests?.includes(f.category)) {
        score += 32
        reasons.push(`이전 ${f.category} 참여`)
      } else {
        score += 12
      }
    }

    // 3) 성사 임박
    if (remaining === 1) {
      score += 38
      reasons.push('1명 남음')
    } else if (remaining === 2) {
      score += 22
      reasons.push('2명 남음')
    } else if (remaining <= 3) {
      score += 10
      reasons.push(`${remaining}명 남음`)
    }

    // 4) 신뢰도 (노쇼 리스크 역매핑)
    const trust = trustLabel(f.aiRisk)
    if (f.aiRisk === '낮음') {
      score += 28
      if (trust) reasons.push(trust)
    } else if (f.aiRisk === '중간') {
      score += 12
      if (trust) reasons.push(trust)
    } else if (f.aiRisk === '높음') {
      score -= 18
      // 낮음 신뢰도는 긍정적 추천 문구로 넣지 않음
    }

    // 5) 거리
    if (dist <= 1) {
      score += 32
      reasons.push(formatDistance(dist))
    } else if (dist <= 3) {
      score += 20
      reasons.push(formatDistance(dist))
    } else if (dist <= 5) {
      score += 10
      reasons.push(formatDistance(dist))
    } else if (dist <= 10) {
      score += 4
      reasons.push(formatDistance(dist))
    } else {
      score -= 6
    }

    // 최소 한 가지 긍정 이유가 없으면 제외 (완전 무관한 글)
    if (reasons.length === 0 || score < 12) continue

    // 이유 우선순위 정렬: 관심사/이력 → 임박 → 신뢰도 → 거리
    const priority = (r: string) => {
      if (r.startsWith('관심사') || r.startsWith('이전')) return 0
      if (r.includes('남음')) return 1
      if (r.startsWith('신뢰도')) return 2
      return 3
    }
    reasons.sort((a, b) => priority(a) - priority(b))

    const uniqueReasons = [...new Set(reasons)].slice(0, 4)
    picks.push({
      funding: f,
      distanceKm: dist,
      score,
      reasons: uniqueReasons,
      reasonLine: uniqueReasons.join(' + '),
    })
  }

  picks.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm)
  return picks.slice(0, limit)
}
