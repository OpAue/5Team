export function sunlightTier(score: number): string {
  if (score <= 30) return '새싹 단계'
  if (score <= 60) return '묘목 단계'
  if (score <= 90) return '나무 단계'
  return '큰 나무 단계'
}
