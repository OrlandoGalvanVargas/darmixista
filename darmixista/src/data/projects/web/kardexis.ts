import type { Project } from '../types';

const project: Project = {
  order: 4,
  slug: 'kardexis',
  title: 'Kardexis',
  year: '2026',
  category: { es: 'Gestión de tareas', en: 'Task management' },
  summary: {
    es: 'Gestor colaborativo estilo Trello/Jira: workspaces, tableros, tareas, adjuntos y comentarios.',
    en: 'Collaborative Trello/Jira-style manager: workspaces, boards, tasks, attachments and comments.',
  },
  description: {
    es: 'API de gestión de tareas colaborativa con arquitectura enterprise: Spring Boot, PostgreSQL versionado con Flyway, autenticación JWT, adjuntos en AWS S3 y despliegue en contenedores. Frontend SPA con React, TypeScript y TanStack Query.',
    en: 'Collaborative task management API with an enterprise architecture: Spring Boot, PostgreSQL versioned with Flyway, JWT auth, attachments on AWS S3 and container deployment. SPA frontend with React, TypeScript and TanStack Query.',
  },
  highlights: {
    es: ['Workspaces, tableros y tareas', 'Migraciones con Flyway', 'Adjuntos en AWS S3', 'Despliegue en contenedores'],
    en: ['Workspaces, boards and tasks', 'Flyway migrations', 'Attachments on AWS S3', 'Containerized deployment'],
  },
  tags: ['Spring Boot', 'PostgreSQL', 'React', 'TypeScript', 'Flyway', 'AWS S3', 'Docker'],
  links: {},
  domain: 'kardexis.app',
  inProgress: true,
};

export default project;
