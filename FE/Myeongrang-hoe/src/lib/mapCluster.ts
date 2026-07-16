/** 간단한 그리드 기반 지도 클러스터 */

export type ClusterPoint<T> = {
  lat: number
  lng: number
  data: T
}

export type ClusterResult<T> =
  | { type: 'cluster'; lat: number; lng: number; count: number; items: T[] }
  | { type: 'single'; lat: number; lng: number; item: T }

/**
 * @param level 카카오맵 level (작을수록 확대)
 */
export function clusterPoints<T>(
  points: ClusterPoint<T>[],
  level: number,
): ClusterResult<T>[] {
  if (points.length === 0) return []
  // level 이 클수록(축소) 셀이 넓어짐
  const cell = Math.max(0.002, 0.004 * Math.pow(1.45, Math.max(0, level - 3)))

  const buckets = new Map<string, ClusterPoint<T>[]>()
  for (const p of points) {
    const key = `${Math.floor(p.lat / cell)}_${Math.floor(p.lng / cell)}`
    const list = buckets.get(key)
    if (list) list.push(p)
    else buckets.set(key, [p])
  }

  const result: ClusterResult<T>[] = []
  for (const group of buckets.values()) {
    if (group.length === 1) {
      const p = group[0]
      result.push({ type: 'single', lat: p.lat, lng: p.lng, item: p.data })
      continue
    }
    const lat = group.reduce((s, g) => s + g.lat, 0) / group.length
    const lng = group.reduce((s, g) => s + g.lng, 0) / group.length
    result.push({
      type: 'cluster',
      lat,
      lng,
      count: group.length,
      items: group.map((g) => g.data),
    })
  }
  return result
}
