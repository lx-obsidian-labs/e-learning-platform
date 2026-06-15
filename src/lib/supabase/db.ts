import { createAdminClient } from "./admin"

function admin() {
  return createAdminClient()
}

function quote(col: string) {
  return `"${col}"`
}

export { admin, quote }
