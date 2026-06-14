export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Authentication Error</h1>
        <p className="mt-2 text-muted-foreground">
          Something went wrong. Please try again.
        </p>
        <a
          href="/auth/login"
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Back to login
        </a>
      </div>
    </div>
  )
}
