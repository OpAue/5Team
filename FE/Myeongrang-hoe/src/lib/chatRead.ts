const KEY = 'mh_chat_seen'

type SeenMap = Record<string, number> // fundingId -> last seen message timestamp

function read(): SeenMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as SeenMap
  } catch {
    return {}
  }
}

function write(map: SeenMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

export function markChatSeen(fundingId: number, lastMessageAt: number) {
  const map = read()
  const prev = map[String(fundingId)] ?? 0
  if (lastMessageAt > prev) {
    map[String(fundingId)] = lastMessageAt
    write(map)
  }
}

export function getChatSeenAt(fundingId: number): number {
  return read()[String(fundingId)] ?? 0
}

export function countUnreadChat(
  fundingId: number,
  messages: { createdAt: number; authorEmail: string }[],
  myEmail: string | null | undefined,
): number {
  const seen = getChatSeenAt(fundingId)
  return messages.filter((m) => m.createdAt > seen && m.authorEmail !== 'system' && m.authorEmail !== myEmail)
    .length
}
