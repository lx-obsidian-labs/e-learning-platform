import type { CourseProvider } from "../types"

export type { CourseProvider }

const registry = new Map<string, CourseProvider>()

export function registerProvider(provider: CourseProvider): void {
  registry.set(provider.name, provider)
}

export function getProvider(name: string): CourseProvider | undefined {
  return registry.get(name)
}

export function getAllProviders(): CourseProvider[] {
  return Array.from(registry.values())
}

export function clearProviders(): void {
  registry.clear()
}
