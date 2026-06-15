"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateProfile } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { motion } from "@/components/motion"
import { Camera, Save, BookOpen, GraduationCap, Users, Trophy, BarChart3 } from "lucide-react"

type Props = {
  name: string
  email: string
  bio: string
  image: string
  role: string
  createdAt: string
  completedCourses: number
  inProgressCourses: number
  totalLessonsCompleted: number
  totalStudents: number
  instructorCourseCount: number
}

export function ProfileView({
  name, email, bio, image, role, createdAt,
  completedCourses, inProgressCourses, totalLessonsCompleted,
  totalStudents, instructorCourseCount,
}: Props) {
  const [activeTab, setActiveTab] = useState<"profile" | "stats">("profile")
  const [previewUrl, setPreviewUrl] = useState(image)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase()

  const roleColors: Record<string, string> = {
    STUDENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
    INSTRUCTOR: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
  }

  async function handleSave(formData: FormData) {
    setSaving(true)
    const result = await updateProfile(formData)
    if (result.success) {
      toast.success("Profile updated")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to update profile")
    }
    setSaving(false)
  }

  const isStudent = role === "STUDENT"
  const isInstructor = role === "INSTRUCTOR"

  const statsCards = isStudent
    ? [
        { icon: BookOpen, label: "In Progress", value: inProgressCourses, gradient: "from-blue-500 to-cyan-500" },
        { icon: GraduationCap, label: "Completed", value: completedCourses, gradient: "from-emerald-500 to-teal-500" },
        { icon: Trophy, label: "Lessons Done", value: totalLessonsCompleted, gradient: "from-amber-500 to-orange-500" },
      ]
    : [
        { icon: BookOpen, label: "Courses", value: instructorCourseCount, gradient: "from-blue-500 to-cyan-500" },
        { icon: Users, label: "Students", value: totalStudents, gradient: "from-purple-500 to-pink-500" },
        { icon: BarChart3, label: "Completed", value: completedCourses, gradient: "from-emerald-500 to-teal-500" },
      ]

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Banner */}
      <div className="relative h-48 sm:h-56 rounded-b-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 -mx-4 sm:-mx-6">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Avatar - overlaps banner */}
      <div className="relative -mt-20 mb-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="relative"
        >
          <Avatar className="h-28 w-28 sm:h-32 sm:w-32 ring-4 ring-background shadow-xl rounded-2xl">
            <AvatarImage src={previewUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl sm:text-4xl font-bold rounded-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">✓</span>
          </div>
        </motion.div>

        <div className="flex-1 pb-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">{name || "User"}</h1>
            <Badge variant="outline" className={`w-fit text-xs ${roleColors[role] || ""}`}>
              {role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{email}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Member since {new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {statsCards.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border/50 bg-card/50 p-4 text-center"
          >
            <div className={`inline-flex h-9 w-9 rounded-lg bg-gradient-to-br ${stat.gradient} p-2 items-center justify-center mb-2`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "profile"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "stats"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Account Info
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong rounded-2xl p-6 sm:p-8 mb-8"
        >
          <form action={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
              <Input id="name" name="name" defaultValue={name} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={3}
                defaultValue={bio}
                placeholder="Tell us about yourself..."
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium">Avatar URL</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="image"
                  name="image"
                  placeholder="https://example.com/avatar.jpg"
                  defaultValue={image}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  className="h-11 flex-1"
                />
                <div className="h-11 w-11 rounded-lg border border-border overflow-hidden shrink-0 flex items-center justify-center bg-muted/30">
                  {previewUrl ? (
                    <img src={previewUrl} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  ) : (
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Paste a URL to an image (Gravatar, Google, etc.)</p>
            </div>

            <Button type="submit" disabled={saving} className="h-11 px-6">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </motion.div>
      )}

      {activeTab === "stats" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong rounded-2xl p-6 sm:p-8 mb-8 space-y-5"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{email}</span>
          </div>
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant="outline" className={`text-xs ${roleColors[role] || ""}`}>{role}</Badge>
          </div>
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium">
              {new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account status</span>
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>
          </div>
        </motion.div>
      )}
    </div>
  )
}
