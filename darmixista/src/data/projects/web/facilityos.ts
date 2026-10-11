import type { Project } from "../types";

const project: Project = {
  order: 1,
  slug: "facilityos",
  title: "FacilityOS",
  year: "2026",
  category: { es: "Plataforma SaaS", en: "SaaS platform" },
  summary: {
    es: "Gestión de instalaciones educativas multi-tenant por distrito y escuela, con backend en Vertical Slice y CQRS.",
    en: "Multi-tenant facility management for school districts, with a Vertical Slice + CQRS backend.",
  },
  description: {
    es: "Plataforma para administrar instalaciones educativas con aislamiento por distrito y escuela. El backend en .NET sigue Vertical Slice Architecture con CQRS (MediatR), autenticación JWT con refresh tokens en cookies httpOnly. El frontend en React 19 está organizado por features, con caché offline en IndexedDB y un modo mock para la demo.",
    en: "A platform to manage educational facilities with per-district and per-school isolation. The .NET backend follows Vertical Slice Architecture with CQRS (MediatR) and JWT auth with refresh tokens in httpOnly cookies. The React 19 frontend is feature-oriented, with offline caching in IndexedDB and a mock mode for the demo.",
  },
  highlights: {
    es: [
      "Multi-tenancy por distrito y escuela",
      "Vertical Slice + CQRS con MediatR",
      "JWT con refresh token en cookie httpOnly",
      "Demo en modo mock con caché offline",
    ],
    en: [
      "Multi-tenancy per district and school",
      "Vertical Slice + CQRS with MediatR",
      "JWT with refresh token in httpOnly cookie",
      "Mock-mode demo with offline cache",
    ],
  },
  tags: [
    ".NET 10",
    "React 19",
    "TanStack Query",
    "Zustand",
    "Ant Design",
    "MediatR",
    "IndexedDB",
  ],
  links: {
    demo: "https://9caeeece.facilityos-9er.pages.dev",
    code: "https://github.com/OrlandoGalvanVargas/facilityos",
  },
  domain: "facilityos.pages.dev",
  image: "/projects/facilityos.webp",
};

export default project;
