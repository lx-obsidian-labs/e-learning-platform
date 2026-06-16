import { getUsers } from "@/actions/admin"
import { UserTable } from "./user-table"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams
  const { users, total, page, pageSize } = await getUsers(
    params.page ? Number(params.page) : 1,
    params.search,
    params.role
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">{total} total users</p>
      </div>

      <UserTable users={users} total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
