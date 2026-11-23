import type { Project } from "../types";

const project: Project = {
  order: 3,
  slug: "rh-plus",
  cover: "/projects/shots/rh-plus/cover.webp",
  shots: ["/projects/shots/rh-plus/01.webp", "/projects/shots/rh-plus/02.webp", "/projects/shots/rh-plus/03.webp", "/projects/shots/rh-plus/04.webp"],
  title: "RH Plus",
  year: "2025",
  accent: "#7088ff",
  category: { es: "Recursos Humanos", en: "Human Resources" },
  summary: {
    es: 'Recursos Humanos sin carpetas: expedientes, asistencias, evaluaciones y vacantes en un solo lugar, con un rol para cada quien.',
    en: 'Human Resources without folders: records, attendance, reviews and job openings in one place, with a role for everyone.',
  },
  summaryShort: {
    es: 'Expedientes, asistencias, evaluaciones y vacantes en un solo lugar, con un rol para cada quien.',
    en: 'Records, attendance, reviews and job openings in one place, with a role for everyone.',
  },
  description: {
    es: "Sistema web para áreas de Recursos Humanos que automatiza tareas clave de la gestión del talento: expediente de empleados, registro de asistencias, evaluaciones de desempeño con plantillas e indicadores ponderados por área, vacantes y postulaciones, y contratos. El frontend en React y Vite consume una API REST con autenticación JWT, protege las rutas por sesión y controla cada módulo según el rol del usuario. Incluye un modo demo con perfiles de RH y de empleado para recorrer el sistema sin cuenta, y sigue una guía propia de lineamientos UI/UX.",
    en: "A web system for HR departments that automates key talent management tasks: employee records, attendance tracking, performance reviews with per-area templates and weighted indicators, job openings and applications, and contracts. The React + Vite frontend consumes a REST API with JWT authentication, guards routes by session and gates each module by the user’s role. It includes a demo mode with HR and employee profiles to explore the system without an account, and follows its own UI/UX guidelines.",
  },
  highlights: {
    es: [
      "Cinco módulos de gestión del talento",
      "Acceso por roles en rutas y módulos",
      "Evaluaciones con indicadores ponderados",
      "Modo demo con perfiles de RH y empleado",
    ],
    en: [
      "Five talent management modules",
      "Role-based access to routes and modules",
      "Reviews with weighted indicators",
      "Demo mode with HR and employee profiles",
    ],
  },
  tags: [
    "React 19",
    "Vite",
    "Tailwind CSS",
    "React Router 7",
    "Axios",
    "JWT",
    "Framer Motion",
  ],
  links: {
    demo: "https://system-rrhh-plus.netlify.app/",
    code: "https://github.com/OrlandoGalvanVargas/react-rrhh-plus-",
  },
  domain: "system-rrhh-plus.netlify.app",
  image: "/projects/rh-plus.webp",
};

export default project;
