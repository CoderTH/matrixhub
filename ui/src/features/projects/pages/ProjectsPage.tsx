import {
  Button,
  Group,
  Paper,
  Stack,
  Title,
} from '@mantine/core'
import { useDebouncedCallback } from '@mantine/hooks'
import {
  getRouteApi,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import {
  startTransition,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import ProjectIcon from '@/assets/svgs/project.svg?react'

import { ProjectsTable } from '../components/ProjectsTable'

import type { MRT_RowSelectionState } from 'mantine-react-table'

const projectsRouteApi = getRouteApi('/(auth)/(app)/projects/')

export function ProjectsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const navigate = projectsRouteApi.useNavigate()
  const search = projectsRouteApi.useSearch()
  const {
    projects,
    pagination,
  } = projectsRouteApi.useLoaderData()
  const loading = useRouterState({
    select: state => state.isLoading,
  })
  const [query, setQuery] = useState(search.query)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const updateSearchQuery = useDebouncedCallback((value: string) => {
    const nextQuery = value.trim()

    if (nextQuery === search.query) {
      return
    }

    setRowSelection({})
    startTransition(() => {
      void navigate({
        replace: true,
        search: prev => ({
          ...prev,
          page: 1,
          query: nextQuery,
        }),
      })
    })
  }, 300)

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value)
    updateSearchQuery(value)
  }, [updateSearchQuery])

  const handleCreate = () => {
    // TODO: open create project modal
  }

  const handleDelete = () => {
    // TODO: open delete project modal
  }

  const selectedProjects = useMemo(
    () => projects.filter(project => !!project.name && !!rowSelection[project.name]),
    [projects, rowSelection],
  )

  const handleBatchDelete = () => {
    if (selectedProjects.length === 0) {
      return
    }

    // TODO: open batch delete project modal with selectedProjects
  }

  const handleRefresh = useCallback(() => {
    setRowSelection({})
    void router.invalidate({
      filter: match => match.routeId === '/(auth)/(app)/projects/',
      sync: true,
    })
  }, [router])

  const handlePageChange = useCallback((page: number) => {
    setRowSelection({})
    startTransition(() => {
      void navigate({
        search: prev => ({
          ...prev,
          page,
        }),
      })
    })
  }, [navigate])

  return (
    <Stack gap="lg">
      <Group gap="sm">
        <ProjectIcon width={24} />
        <Title order={2}>{t('routes.projects.title')}</Title>
      </Group>

      <Paper>
        <Stack gap="lg">

          <ProjectsTable
            records={projects}
            pagination={pagination}
            loading={loading}
            page={search.page ?? 1}
            searchValue={query}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
            onDelete={handleDelete}
            onBatchDelete={handleBatchDelete}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onPageChange={handlePageChange}
            selectedCount={selectedProjects.length}
            toolbarExtra={(
              <Button onClick={handleCreate}>
                {t('routes.projects.create')}
              </Button>
            )}
          />
        </Stack>
      </Paper>
    </Stack>
  )
}
