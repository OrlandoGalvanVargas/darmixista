import type { Project } from "../types";

const project: Project = {
  order: 2,
  slug: "darmix-tasking",
  title: "Darmix Tasking",
  year: "2026",
  category: { es: "Productividad", en: "Productivity" },
  summary: {
    es: "Gestor de proyectos y tareas: API REST en Laravel con JWT y SPA en React, con filtros, tema claro/oscuro y modo demo.",
    en: "Project and task manager: a Laravel REST API with JWT and a React SPA, with filters, light/dark themes and a demo mode.",
  },
  description: {
    es: "Aplicación full stack para organizar el trabajo en proyectos y tareas con estado y prioridad. La API RESTful en Laravel 12 usa autenticación JWT con refresh, Form Requests, API Resources, políticas de autorización (cada usuario solo ve lo suyo) y eager loading para evitar consultas N+1. El SPA en React 19 y TypeScript combina TanStack Query y Zustand, formularios con react-hook-form y Zod, filtros con búsqueda y paginación del lado del servidor, y un modo demo local que mantiene la interfaz usable aunque el backend no esté disponible. Todo se levanta con Docker Compose y cuenta con tests en ambas partes (Pest y Vitest).",
    en: "A full stack app to organize work into projects and tasks with status and priority. The Laravel 12 RESTful API uses JWT auth with refresh, Form Requests, API Resources, authorization policies (each user only sees their own data) and eager loading to avoid N+1 queries. The React 19 + TypeScript SPA combines TanStack Query and Zustand, forms with react-hook-form and Zod, search filters with server-side pagination, and a local demo mode that keeps the interface usable even when the backend is unavailable. Everything runs with Docker Compose and is tested on both sides (Pest and Vitest).",
  },
  highlights: {
    es: [
      "API REST con JWT, políticas y API Resources",
      "Filtros, búsqueda y paginación en servidor",
      "Modo demo local si el backend no responde",
      "Docker Compose y tests con Pest y Vitest",
    ],
    en: [
      "REST API with JWT, policies and API Resources",
      "Server-side filters, search and pagination",
      "Local demo mode when the backend is down",
      "Docker Compose and tests with Pest and Vitest",
    ],
  },
  tags: [
    "Laravel 12",
    "React 19",
    "TypeScript",
    "MySQL",
    "JWT",
    "Tailwind v4",
    "TanStack Query",
    "Docker",
  ],
  links: {
    demo: "https://darmix-tasking.pages.dev/",
    code: "https://github.com/OrlandoGalvanVargas/darmix-tasking",
  },
  domain: "darmix-tasking.pages.dev",
  image: "/projects/darmix-tasking.webp",
};

export default project;
