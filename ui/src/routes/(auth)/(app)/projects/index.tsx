import { Projects } from '@matrixhub/api-ts/v1alpha1/project.pb'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { ProjectsPage } from '@/features/projects/pages/ProjectsPage'

const DEFAULT_PROJECTS_PAGE = 1
const DEFAULT_PROJECTS_PAGE_SIZE = 10

const pSearchParamSchema = z.object({
  page: z.number().optional().transform((value) => {
    if (value === undefined) {
      return value
    }

    const parsedPage = Number(value)

    if (!Number.isInteger(parsedPage) || parsedPage < DEFAULT_PROJECTS_PAGE) {
      return DEFAULT_PROJECTS_PAGE
    }

    return parsedPage
  }),
  query: z.string().optional().transform((value) => {
    if (value === undefined) {
      return value
    }

    return value.trim()
  }),
})

export const Route = createFileRoute('/(auth)/(app)/projects/')({
  component: RouteComponent,
  validateSearch: pSearchParamSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    query: search.query,
  }),
  loader: async ({ deps }) => {
    const response = await Projects.ListProjects({
      name: deps.query || undefined,
      page: deps.page,
      pageSize: DEFAULT_PROJECTS_PAGE_SIZE,
    })

    return {
      projects: response.projects ?? [],
      pagination: response.pagination,
    }
  },
  staticData: {
    navName: 'Projects',
  },
})

function RouteComponent() {
  return <ProjectsPage />
}
