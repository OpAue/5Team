export function sunlightTier(score: number): string {
  if (score <= 30) return '새싹 단계'
  if (score <= 60) return '묘목 단계'
  if (score <= 90) return '나무 단계'
  return '큰 나무 단계'
}

export function sunlightTierIndex(score: number): 0 | 1 | 2 | 3 {
  if (score <= 30) return 0
  if (score <= 60) return 1
  if (score <= 90) return 2
  return 3
}

/** 햇살지수 단계별 배지 색상 — 원 배경(bg)은 단계가 오를수록 파랑(새싹) → 초록 → 햇살빛 금색(큰 나무)으로 진해진다 */
export const SUNLIGHT_TIERS = [
  { label: '새싹 단계', bg: '#E3EEFB', trunk: '#4C8C5A', canopyDark: '#9FDD9A', canopyLight: '#D3F3CF' },
  { label: '묘목 단계', bg: '#DCEFE0', trunk: '#3F7D4C', canopyDark: '#6FCB74', canopyLight: '#B7E9B4' },
  { label: '나무 단계', bg: '#D3EAD6', trunk: '#8A5A34', canopyDark: '#4CAE50', canopyLight: '#8FD98C' },
  { label: '큰 나무 단계', bg: '#FCEFC2', trunk: '#7A4B26', canopyDark: '#2F8F42', canopyLight: '#6FC46B' },
] as const
