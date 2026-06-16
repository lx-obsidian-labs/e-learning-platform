
₿─── Edu Learn ──────────────────────────────────────────────────────────────

  A full-stack AI-powered e-learning platform with gamification, spaced
  repetition, adaptive reviews, social learning, and blockchain-verified
  certificates.

  Built by LX Obsidian Labs — Founder & Lead Developer: Siphesihle Nathan Vilane

──────────────────────────────────────────────────────────────────────────────

Table of Contents
─────────────────
1. Overview
2. Features
3. Tech Stack
4. Architecture
5. Getting Started
6. User Manual
   6.1 Students
   6.2 Instructors
   6.3 Administrators
7. API Reference
8. Deployment
9. Environment Variables
10. Database Migrations
11. License
12. Attribution

──────────────────────────────────────────────────────────────────────────────

1. Overview
═══════════

Edu Learn is a modern, AI-enhanced learning management system (LMS) designed
for both self-paced and instructor-led education. The platform combines
proven pedagogical techniques — gamification, spaced repetition (SM-2), daily
quests, study groups — with state-of-the-art AI features: intelligent
tutoring, content generation, video coaching, discussion moderation, and
personalised course recommendations.

The platform is built on Next.js 16 with Supabase for authentication and
data storage, and is fully deployable on Vercel with zero configuration.

Key differentiators:
  • AI-powered features (NVIDIA/OpenAI) — no additional AI infra needed
  • Gamification engine (XP, levels, streaks, badges, leaderboards)
  • SM-2 adaptive review system for long-term retention
  • Blockchain-verified certificates (SHA-256 hash, public verification page)
  • PWA support with offline fallback
  • i18n with 4 languages (English, French, Portuguese, Spanish)
  • WCAG 2.2 accessible design system
  • Study groups with activity feeds
  • Analytics dashboards for students, instructors, and admins
  • Daily quests with auto-progress tracking and XP rewards

──────────────────────────────────────────────────────────────────────────────

2. Features
═══════════

2.1 Core Learning
─────────────────
  • Course browser with search, categories, and filtering
  • Modular lessons with video, text, and quiz content
  • Progress tracking per course and per lesson
  • Enrolment management (free and paid courses via EFT)

2.2 AI Features
───────────────
  • Floating AI Assistant — site-wide chat for any question
  • AI Tutor — course-specific, context-aware tutoring
  • AI Video Coach — lesson-aware coaching overlay on video lessons
  • AI Content Generator — 4-step wizard for instructors (outline, lessons,
    quizzes)
  • AI Discussion Moderator — auto-flag/reject/allow on user content
  • AI Recommendations — personalised course suggestions on dashboard
  • AI Insights — learning analytics summaries powered by AI

2.3 Gamification
────────────────
  • XP system with 100 levels (progressive XP curve)
  • Daily streaks (consecutive-day logging)
  • Badge system (achievement-based, 10+ badges)
  • Global leaderboard with XP ranking
  • Celebration animations on level-up, streak milestones, and badge awards

2.4 Daily Quests
────────────────
  • 7 quest types (XP earning, lessons completed, streaks, quiz accuracy,
    login, group activity, discussions)
  • 3 quests auto-generated per user per day
  • Auto-progress tracking on relevant actions
  • XP reward claims with confetti animation

2.5 Spaced Repetition
─────────────────────
  • SM-2 algorithm implementation (Anki-compatible parameters)
  • Adaptive review scheduling per lesson
  • Review sessions with difficulty rating (Again/Hard/Good/Easy)
  • Weak spots identification (low-easiness items)
  • Review dashboard at /review

2.6 Social Learning
───────────────────
  • Study Groups with join/leave and member management
  • Group activity feeds
  • Member avatars and role indicators
  • Dashboard quick-action to create or browse groups

2.7 Blockchain Certificates
───────────────────────────
  • SHA-256 hash generation (userId:courseId:timestamp)
  • Public verification page at /verify?hash=...
  • Premium certificate display with decorative borders
  • Certificate listing dashboard
  • Cryptographic re-verification on every view

2.8 Analytics
─────────────
  • Student Dashboard: 6 stat cards (level/XP, streak, lessons, courses,
    accuracy, badges), 30-day XP line chart, 7-day activity bar chart,
    GitHub-style heatmap grid, course progress bars, weak spots table
  • Admin Dashboard: 8 platform stat cards, revenue bar chart, activity
    feed, user/course/discussion management

2.9 PWA & Offline
─────────────────
  • Service worker (cache-first static, network-first navigation/API)
  • Offline fallback page at /offline
  • Install prompt with iOS instructions (30-day dismissal)
  • Browser notification integration

2.10 Internationalisation
─────────────────────────
  • 4 languages: English (en), French (fr), Portuguese (pt), Spanish (es)
  • Cookie-based locale detection (no URL prefix)
  • Language switcher in navbar (globe icon)
  • ~150 translation keys covering navigation, footer, home page,
    gamification, reviews, metadata

2.11 Accessibility
──────────────────
  • WCAG 2.2 compliant design system
  • Dark/light mode via next-themes
  • ARIA labels, roles, live regions
  • Keyboard-accessible navigation
  • Screen-reader-friendly semantic markup

2.12 Admin Panel
────────────────
  • Role-based access (ADMIN/INSTRUCTOR/STUDENT)
  • User management (search, filter, role change, pagination)
  • Course management (search, status filter, PUBLISH/DRAFT/ARCHIVE toggle)
  • Discussion moderation (table with delete confirmation)
  • Payment dashboard (EFT proof approval/rejection)
  • Course import (edX, OpenLearn, external course aggregator)

──────────────────────────────────────────────────────────────────────────────

3. Tech Stack
═════════════

Layer        │ Technology
─────────────┼──────────────────────────────────────────────────────────────
Framework    │ Next.js 16 (App Router, webpack)
Language     │ TypeScript (strict mode)
Styling      │ Tailwind CSS v4, shadcn/ui (radix-nova)
Database     │ Supabase (PostgreSQL + Storage + Auth)
Auth         │ Supabase Auth (email/password)
AI           │ NVIDIA API (chat, recommendations, generation, moderation)
             │ OpenAI API (Whisper STT, TTS — optional)
Payments     │ EFT (manual proof upload + admin approval)
Deployment   │ Vercel (auto-deploy from GitHub)
i18n         │ next-intl (localePrefix: 'never')
PWA          │ Custom service worker + manifest.json
Charts       │ recharts (analytics)
Caching      │ Next.js built-in + service worker cache-first
Analytics    │ Custom (no third-party analytics)

──────────────────────────────────────────────────────────────────────────────

4. Architecture
═══════════════

4.1 Folder Structure
────────────────────

src/
├── actions/           # Server Actions (business logic)
│   ├── admin.ts
│   ├── analytics.ts
│   ├── certificates.ts
│   ├── discussions.ts
│   ├── enrollments.ts
│   ├── gamification.ts
│   ├── payments.ts
│   ├── quests.ts
│   ├── spaced-repetition.ts
│   ├── study-groups.ts
│   └── ...
├── app/               # App Router pages + API routes
│   ├── admin/         # Admin dashboard (users, courses, discussions)
│   ├── api/           # REST API endpoints
│   ├── auth/          # Login / Register
│   ├── certificates/  # Certificate listing + detail
│   ├── courses/       # Course browser, detail, lessons, quizzes
│   ├── dashboard/     # Student dashboard
│   ├── groups/        # Study groups (list, create, detail)
│   ├── instructor/    # Instructor panel + AI generator
│   ├── leaderboard/   # Global rankings
│   ├── orders/        # EFT payment orders
│   ├── review/        # Spaced repetition review sessions
│   └── ...
├── components/        # Reusable UI components
│   ├── ui/            # shadcn/ui primitives
│   ├── floating-ai-assistant.tsx
│   ├── notification-bell.tsx
│   ├── pwa-prompt.tsx
│   └── ...
├── i18n/              # Internationalisation config
│   ├── routing.ts
│   ├── request.ts
│   └── ...
├── lib/               # Shared utilities
│   ├── supabase/      # Supabase client factories
│   ├── nvidia-ai.ts   # NVIDIA AI integration
│   ├── openai.ts      # OpenAI integration
│   └── ...
├── types/             # TypeScript type definitions
└── middleware.ts      # Next.js middleware (locale detection)

public/
├── sw.js              # Service worker
└── manifest.json      # PWA manifest

scripts/
├── migrate-ai-chats.sql
├── migrate-certificates.sql
├── migrate-course-source.sql
├── migrate-gamification.sql
├── migrate-quests.sql
├── migrate-spaced-repetition.sql
└── migrate-study-groups.sql

messages/
├── en.json             # English translations
├── fr.json             # French translations
├── pt.json             # Portuguese translations
└── es.json             # Spanish translations

4.2 Data Flow
─────────────
  • All database queries use an admin (service-role) Supabase client for RLS
    bypass. The SSR anon client is only used for auth.getUser().
  • Server Actions handle all mutations; API routes handle non-form
    interactions (AI chat, Stripe webhooks, external imports).
  • AI features call NVIDIA API directly from server-side code; responses
    are streamed or returned as JSON.
  • Authentication state is managed via Supabase Auth cookies, read by
    next-intl middleware and layout components.

──────────────────────────────────────────────────────────────────────────────

5. Getting Started
══════════════════

Prerequisites
─────────────
  • Node.js 20+
  • npm 10+
  • A Supabase project (free tier works)
  • (Optional) NVIDIA API key for AI features
  • (Optional) OpenAI API key for Whisper/TTS

Installation
────────────
  git clone https://github.com/lx-obsidian-labs/e-learning-platform.git
  cd e-learning-platform
  npm install
  cp .env.example .env.local   # or set vars in your environment

  # Fill in your .env.local:
  #   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  #   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  #   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  #   NVIDIA_API_KEY=your-nvidia-key        (optional)
  #   OPENAI_API_KEY=your-openai-key        (optional)
  #   AI_CLEANUP_SECRET=your-cleanup-secret (optional)

  npm run dev

  Open http://localhost:3000

Database Setup
──────────────
  Run the migration scripts in your Supabase SQL Editor in this order:
    1. scripts/migrate-gamification.sql
    2. scripts/migrate-spaced-repetition.sql
    3. scripts/migrate-quests.sql
    4. scripts/migrate-study-groups.sql
    5. scripts/migrate-certificates.sql
    6. scripts/migrate-course-source.sql
    7. scripts/migrate-ai-chats.sql

  Each script creates the required tables, indexes, and seed data.

──────────────────────────────────────────────────────────────────────────────

6. User Manual
══════════════

6.1 Students
────────────

  Registration & Login
  ┌─────────────────────────────────────────────────────────────────────┐
  │ 1. Navigate to /auth/register                                      │
  │ 2. Enter your name, email, and password                            │
  │ 3. Verify your email (if Supabase email confirmation is enabled)   │
  │ 4. Log in at /auth/login                                           │
  └─────────────────────────────────────────────────────────────────────┘

  Dashboard
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Access your personalised dashboard at /dashboard                 │
  │ • View your level, XP, streak, enrolled courses, and progress      │
  │ • Check AI-powered course recommendations                         │
  │ • See AI insights about your learning habits                      │
  │ • Quick-access buttons: Review, Groups, Analytics, Badges         │
  └─────────────────────────────────────────────────────────────────────┘

  Browsing & Enrolling in Courses
  ┌─────────────────────────────────────────────────────────────────────┐
  │ 1. Go to /courses to browse all available courses                  │
  │ 2. Use the search bar or category filters to narrow down           │
  │ 3. Click a course to view details (description, instructor,        │
  │    lessons list)                                                   │
  │ 4. Click "Enrol" to start learning (free courses enrol instantly;  │
  │    paid courses require EFT payment + admin approval)              │
  └─────────────────────────────────────────────────────────────────────┘

  Lessons & Quizzes
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Open a course and click a lesson to begin                        │
  │ • Watch embedded video, read content, complete quizzes             │
  │ • Progress auto-saves as you complete lessons                      │
  │ • After completing a lesson, you are prompted to start a review    │
  │   session (spaced repetition)                                      │
  │ • AI Video Coach available on video lessons (click the brain icon) │
  └─────────────────────────────────────────────────────────────────────┘

  Spaced Repetition Review
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Go to /review to see due review items                            │
  │ • Rate each item: Again (forgot), Hard (difficult), Good (okay),   │
  │   Easy (trivial)                                                   │
  │ • The SM-2 algorithm schedules the next review based on your       │
  │   rating                                                           │
  │ • Regular reviews improve long-term retention                      │
  └─────────────────────────────────────────────────────────────────────┘

  Gamification
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Earn XP by completing lessons, quizzes, daily quests, and        │
  │   maintaining streaks                                              │
  │ • Level up every ~100 XP (progressive curve)                       │
  │ • Earn badges for achievements (10+ lessons, 7-day streak, etc.)   │
  │ • Track your rank on the /leaderboard                              │
  │ • View all badges at /badges                                       │
  │ • Complete daily quests at /dashboard (3 new quests each day)      │
  └─────────────────────────────────────────────────────────────────────┘

  Daily Quests
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • 3 quests are generated daily for you                             │
  │ • Quest types: Earn XP, Complete Lessons, Maintain Streak,         │
  │   High Quiz Accuracy, Login Daily, Group Activity, Discussions     │
  │ • Progress tracks automatically as you use the platform            │
  │ • Claim your XP reward by clicking "Claim" on each quest           │
  │ • Unclaimed quests expire at midnight UTC                          │
  └─────────────────────────────────────────────────────────────────────┘

  Study Groups
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Browse groups at /groups or create your own at /groups/create    │
  │ • Join a group to collaborate with other learners                  │
  │ • View group activity feed and member list                         │
  │ • Each group shows member count, creation date, and course focus   │
  └─────────────────────────────────────────────────────────────────────┘

  Analytics
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • View detailed learning analytics at /analytics                   │
  │ • 6 stat cards: Level/XP, Streak, Lessons Completed, Courses       │
  │   Enrolled, Review Accuracy, Badges Earned                         │
  │ • 30-day XP trend line chart                                       │
  │ • 7-day activity bar chart (lessons + quizzes per day)             │
  │ • GitHub-style activity heatmap                                    │
  │ • Course progress bars with status badges                          │
  │ • Weak spots table (lessons with low SM-2 easiness)                │
  └─────────────────────────────────────────────────────────────────────┘

  Certificates
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Earn a certificate when you complete all lessons in a course     │
  │ • View certificates at /certificates                               │
  │ • Each certificate has a unique SHA-256 hash                       │
  │ • Share the public verification link or hash                       │
  │ • Anyone can verify at /verify?hash=<hash>                         │
  └─────────────────────────────────────────────────────────────────────┘

  AI Assistant
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Click the chat button (bottom-right corner) to open the AI       │
  │   Assistant                                                        │
  │ • Ask any question about courses, learning, or the platform        │
  │ • The assistant has context from the whole platform                │
  │ • Available on every page, no enrolment needed                     │
  └─────────────────────────────────────────────────────────────────────┘

  Settings
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Update your profile at /settings                                 │
  │ • Change your name, email, or password                             │
  │ • Toggle notification preferences                                  │
  └─────────────────────────────────────────────────────────────────────┘

  EFT Payments
  ┌─────────────────────────────────────────────────────────────────────┐
  │ 1. Attempt to enrol in a paid course                               │
  │ 2. You will be prompted to create an order and upload proof of     │
  │    payment (EFT)                                                    │
  │ 3. An admin will verify your proof and approve the enrolment       │
  │ 4. You will receive a notification when approved                   │
  │ 5. Track your orders at /orders                                    │
  └─────────────────────────────────────────────────────────────────────┘

6.2 Instructors
───────────────

  Accessing the Instructor Panel
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Instructors can access the panel via the "🎓 Teach" button in    │
  │   the navigation bar, or from the profile dropdown menu            │
  │ • The panel is at /instructor                                      │
  └─────────────────────────────────────────────────────────────────────┘

  Creating a Course
  ┌─────────────────────────────────────────────────────────────────────┐
  │ 1. Go to /instructor/courses/new                                   │
  │ 2. Fill in course title, description, category, and optional image │
  │ 3. Click "Create Course"                                           │
  │ 4. The course starts as a DRAFT — publish when ready               │
  └─────────────────────────────────────────────────────────────────────┘

  Adding Lessons
  ┌─────────────────────────────────────────────────────────────────────┐
  │ 1. Open your course from /instructor/courses                       │
  │ 2. Click "Add Lesson"                                              │
  │ 3. Enter lesson title, content, and optional video URL             │
  │ 4. Save — lessons appear in order automatically                    │
  └─────────────────────────────────────────────────────────────────────┘

  Creating Quizzes
  ┌─────────────────────────────────────────────────────────────────────┐
  │ 1. From the course edit page, click "Add Quiz"                     │
  │ 2. Enter the quiz question and possible answers                     │
  │ 3. Mark the correct answer(s)                                      │
  │ 4. Quizzes are tied to lessons and auto-graded on submission       │
  └─────────────────────────────────────────────────────────────────────┘

  AI Content Generator
  ┌─────────────────────────────────────────────────────────────────────┐
  │ 1. Go to /instructor/ai-generator                                  │
  │ 2. Step 1: Enter a course topic/description — AI generates an      │
  │    outline                                                         │
  │ 3. Step 2: Select a module from the outline — AI generates lesson  │
  │    content                                                         │
  │ 4. Step 3: AI generates quiz questions for each lesson             │
  │ 5. Step 4: Review and import — all content is saved to your course │
  │ Requires NVIDIA_API_KEY to be configured.                          │
  └─────────────────────────────────────────────────────────────────────┘

  Importing External Courses
  ┌─────────────────────────────────────────────────────────────────────┐
  │ 1. Go to /instructor/import                                        │
  │ 2. Choose a source: edX, OpenLearn, or other supported platforms   │
  │ 3. Search or paste a course URL                                    │
  │ 4. Preview the course content                                      │
  │ 5. Click "Import" — course and lessons are created automatically   │
  │ Imported courses include source attribution on the course page.    │
  └─────────────────────────────────────────────────────────────────────┘

6.3 Administrators
──────────────────

  Admin Dashboard
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Access at /admin (requires ADMIN role)                           │
  │ • View platform stats: total users, courses, enrollments, active   │
  │   discussions, revenue, new users (30d), completion rate           │
  │ • Revenue bar chart (monthly, from EFT payments)                   │
  │ • Recent activity feed                                             │
  └─────────────────────────────────────────────────────────────────────┘

  User Management
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Go to /admin/users                                               │
  │ • Search users by name or email                                    │
  │ • Filter by role (ALL / STUDENT / INSTRUCTOR / ADMIN)              │
  │ • Change user roles via dropdown                                   │
  │ • Paginated results (10 per page)                                  │
  └─────────────────────────────────────────────────────────────────────┘

  Course Management
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Go to /admin/courses                                             │
  │ • Search courses by title                                          │
  │ • Filter by status (ALL / PUBLISHED / DRAFT / ARCHIVED)            │
  │ • Toggle course status: PUBLISH, DRAFT, ARCHIVE                    │
  └─────────────────────────────────────────────────────────────────────┘

  Discussion Moderation
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Go to /admin/discussions                                         │
  │ • View all discussions with moderation status                      │
  │ • Delete inappropriate discussions with confirmation prompt        │
  │ • AI auto-moderation flags/rejects toxic content                    │
  └─────────────────────────────────────────────────────────────────────┘

  Payment Management
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Go to /admin/payments                                            │
  │ • View pending EFT payments with user details and proof files      │
  │ • Approve or reject payments                                       │
  │ • Approved payments auto-enrol the user in paid courses            │
  │ • Notifications sent to users on approval/rejection                │
  └─────────────────────────────────────────────────────────────────────┘

  Course Import
  ┌─────────────────────────────────────────────────────────────────────┐
  │ • Go to /admin/import                                              │
  │ • Import courses from external platforms (edX, OpenLearn, etc.)    │
  │ • Courses include automatic source attribution                     │
  └─────────────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────────────────────

7. API Reference
════════════════

All API routes are prefixed with /api/.

Auth
────
  POST /api/user/role
    Returns the current user's role from the database.
    Response: { role: "STUDENT" | "INSTRUCTOR" | "ADMIN" }

AI
──
  POST /api/ai/assistant
    General-purpose AI chat (no enrolment required).
    Body: { question: string, history?: { role: string, content: string }[] }
    Response: { reply: string }

  POST /api/ai/tutor
    Course-specific AI tutor (enrolment required).
    Body: { question: string, courseId: string, lessonId?: string, history?: { role: string, content: string }[] }
    Response: { reply: string }

  POST /api/ai/video-coach
    Lesson-context AI coaching for video player.
    Body: { question: string, lessonId: string, history?: { role: string, content: string }[] }
    Response: { reply: string }

  POST /api/ai/cleanup
    Deletes ai_chats older than 1 day.
    Body: { secret: string }
    Response: { success: true, deleted: number }

Courses
───────
  GET /api/courses
    List all published courses.
    Query: ?search=&category=&page=&limit=

  GET /api/courses/[id]
    Get single course with lessons.

  GET /api/courses/[id]/lessons
    Get lessons for a course.

  GET /api/courses/[id]/sections
    Get sections for a course.

External Imports
────────────────
  GET /api/external-courses
    Fetch aggregated external courses (Khan Academy, OpenStax, etc.).

  POST /api/external-courses/import
    Import a course from an external platform.

  POST /api/edx/import
    Import an edX course by ID.
    Body: { courseId: string, userId: string }

  GET /api/edx/search?q=
    Search edX courses.

  POST /api/import/moodle
    Import from Moodle XML export.

  POST /api/import/openedx
    Import from Open edX export.

──────────────────────────────────────────────────────────────────────────────

8. Deployment
═════════════

The project is designed for one-click deployment on Vercel.

  • Push to GitHub — Vercel auto-deploys from the master branch.
  • No manual Vercel CLI configuration needed.
  • All environment variables must be set in Vercel Project → Settings →
    Environment Variables.

Build Command
─────────────
  npm run build

Output Directory
────────────────
  .next

Install Command
───────────────
  npm install

──────────────────────────────────────────────────────────────────────────────

9. Environment Variables
════════════════════════

Required
────────
  NEXT_PUBLIC_SUPABASE_URL     Supabase project URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY  Supabase anonymous key
  SUPABASE_SERVICE_ROLE_KEY    Supabase service-role key (keep secret)

Optional
────────
  NVIDIA_API_KEY               Required for AI features (assistant, tutor,
                               generator, moderator, recommendations)
  OPENAI_API_KEY               Required for Whisper STT / TTS
  AI_CLEANUP_SECRET            Required for daily AI chat cleanup cron
  BANK_NAME                    EFT payment bank name
  BANK_ACCOUNT_NAME            EFT payment account name
  BANK_ACCOUNT_NUMBER          EFT payment account number
  BANK_BRANCH_CODE             EFT payment branch code
  PAYMENT_REFERENCE_PREFIX     EFT payment reference prefix

All optional variables gracefully degrade — the app runs without them, but
the corresponding features will be disabled or show a warning.

──────────────────────────────────────────────────────────────────────────────

10. Database Migrations
═══════════════════════

Run these SQL scripts in your Supabase SQL Editor in the listed order.

  scripts/
  ├── migrate-gamification.sql          XP, levels, streaks, badges, leaderboard
  ├── migrate-spaced-repetition.sql     SM-2 review items + schedule
  ├── migrate-quests.sql                Daily quests + progress
  ├── migrate-study-groups.sql          Study groups, members, activities
  ├── migrate-certificates.sql          Certificates + SHA-256 hashes
  ├── migrate-course-source.sql         Source attribution columns
  └── migrate-ai-chats.sql              AI chat persistence table

Important notes:
  • All migrations use IF NOT EXISTS / idempotent patterns.
  • The admin (service-role) client is used for all queries — Supabase RLS
    is enabled but no policies are defined.
  • Seed data is included for gamification (level thresholds, default
    badges) and daily quests (quest pool).

──────────────────────────────────────────────────────────────────────────────

11. License
═══════════

MIT License

Copyright (c) 2025-2026 LX Obsidian Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

──────────────────────────────────────────────────────────────────────────────

12. Attribution
═══════════════

  LX Obsidian Labs
  ────────────────
  A software development company specialising in modern web applications,
  AI integration, and educational technology.

  Founder & Lead Developer
  ────────────────────────
  Siphesihle Nathan Vilane

  Contact & Links
  ───────────────
  • GitHub:     https://github.com/lx-obsidian-labs
  • Repository: https://github.com/lx-obsidian-labs/e-learning-platform

  Acknowledgements
  ────────────────
  • Next.js team for the incredible React framework
  • Supabase for the open-source Firebase alternative
  • shadcn/ui for the beautiful component library
  • Vercel for the deployment platform
  • NVIDIA for the AI inference API
  • OpenAI for the Whisper and TTS models
  • The open-source community for the tools and libraries that made this
    project possible

──────────────────────────────────────────────────────────────────────────────

© 2025-2026 LX Obsidian Labs. Built by Siphesihle Nathan Vilane. All rights
reserved under the MIT License.
