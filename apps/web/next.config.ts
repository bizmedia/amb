import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // Корень монорепо: иначе Turbopack не находит next относительно App Router.
  // CSS (@import "tailwindcss" и др.) резолвится из этого же корня — см. devDependencies в корневом package.json.
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default withNextIntl(nextConfig);
