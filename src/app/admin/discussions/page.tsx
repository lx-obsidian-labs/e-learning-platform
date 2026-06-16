import { getDiscussions } from "@/actions/admin"
import { DiscussionsTable } from "./discussions-table"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminDiscussionsPage({ searchParams }: Props) {
  const params = await searchParams
  const { discussions, total, page, pageSize } = await getDiscussions(
    params.page ? Number(params.page) : 1
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discussions</h1>
        <p className="text-muted-foreground">Content moderation - {total} total discussions</p>
      </div>

      <DiscussionsTable discussions={discussions} total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
