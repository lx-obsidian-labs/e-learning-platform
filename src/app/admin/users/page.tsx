import { getUsers } from "@/actions/admin"
import { UserTable } from "./user-table"
import { Card, CardContent } from "@/components/ui/card"

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
        <p className="lead">{total} total users</p>
      </div>

      <Card variant="pro">
        <CardContent className="p-0">
          <UserTable users={users} total={total} page={page} pageSize={pageSize} />
        </CardContent>
      </Card>
    </div>
  )
}
