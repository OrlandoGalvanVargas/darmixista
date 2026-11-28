import type { Project } from "../types";

const project: Project = {
  order: 2,
  slug: "facilityos",
  title: "FacilityOS",
  year: "2026",
  accent: "#2bb0e6",
  category: { es: "Plataforma SaaS", en: "SaaS platform" },
  summary: {
    es: 'Qué pasa cuando un distrito escolar administra decenas de escuelas: cada una ve solo lo suyo, y funciona sin internet.',
    en: 'What happens when a school district manages dozens of schools: each one sees only its own, and it works offline.',
  },
  summaryShort: {
    es: 'Plataforma para distritos escolares con decenas de escuelas, donde cada una ve solo lo suyo y funciona sin internet.',
    en: 'A platform for school districts with dozens of schools, where each one sees only its own and works offline.',
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
  sheet: {
    what: {
      es: 'Un distrito escolar administra todas sus escuelas desde un solo lugar. Cada escuela ve solo su información y la app sigue funcionando sin internet.',
      en: 'A school district manages all of its schools from one place. Each school only sees its own data, and the app keeps working without internet.',
    },
    how: {
      es: 'Backend en .NET con Vertical Slice y CQRS (MediatR), y sesión con JWT en cookies httpOnly. El frontend en React 19 guarda caché en IndexedDB para trabajar sin conexión.',
      en: '.NET backend with Vertical Slice and CQRS (MediatR), and JWT sessions in httpOnly cookies. The React 19 frontend caches data in IndexedDB to work offline.',
    },
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
