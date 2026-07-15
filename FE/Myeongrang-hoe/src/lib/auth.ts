import { getDB } from '../store/db'

export function isLoggedIn(): boolean {
  return getDB().currentUserEmail !== null
}
