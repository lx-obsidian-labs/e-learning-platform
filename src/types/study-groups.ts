export type GroupMember = {
  id: string
  groupId: string
  userId: string
  role: "admin" | "member"
  joinedAt: string
  user: { id: string; name: string | null; image: string | null } | null
}

export type GroupActivity = {
  id: string
  groupId: string
  userId: string
  type: string
  message: string | null
  createdAt: string
  user: { name: string | null; image?: string | null } | null
}

export type StudyGroup = {
  id: string
  name: string
  description: string | null
  courseId: string | null
  createdBy: string
  maxMembers: number
  isPublic: boolean
  inviteCode: string
  createdAt: string
  updatedAt: string
}

export type GroupWithDetails = StudyGroup & {
  memberCount: number
  members: GroupMember[]
  activities: GroupActivity[]
}

export type GroupWithMemberCount = StudyGroup & {
  memberCount: number
}

export type CourseProgress = {
  id: string
  title: string
  enrolledCount: number
  members: string[]
}

export type CreateGroupInput = {
  name: string
  description?: string
  courseId?: string
  maxMembers?: number
  isPublic?: boolean
}

export type UpdateGroupInput = {
  name?: string
  description?: string | null
  maxMembers?: number
  isPublic?: boolean
}
