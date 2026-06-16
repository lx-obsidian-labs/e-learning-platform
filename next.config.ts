import path from "path"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
}

export default withNextIntl(nextConfig)
