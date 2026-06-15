import { getAllUsers } from "@/actions/admin-users"
import { UserTable } from "./user-table"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams
  const { users, total } = await getAllUsers({
    search: params.search,
    role: params.role,
    page: params.page ? Number(params.page) : 1,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">{total} total users</p>
      </div>

      <UserTable users={users} total={total} />
    </div>
  )
}
