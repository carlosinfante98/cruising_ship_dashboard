/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional CARTO basemap key — raises the anonymous tile rate limit. See ShipMap.tsx. */
  readonly VITE_CARTO_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
