import { Button } from '@mantine/core'
import { IconHomePlus } from '@tabler/icons-react'
import {
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  getRouteApi,
  useRouterState,
} from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { useRouteListState } from '@/shared/hooks/useRouteListState'

import { RegistriesTable } from '../components/RegistriesTable'
import {
  adminRegistryKeys,
  registriesQueryOptions,
} from '../registries.query'
import { DEFAULT_REGISTRIES_PAGE } from '../registries.schema'
import { getRegistryRowId } from '../registries.utils'

const registriesRouteApi = getRouteApi('/(auth)/admin/registries')

export function RegistriesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = registriesRouteApi.useNavigate()
  const search = registriesRouteApi.useSearch()
  const {
    data,
    isFetching,
  } = useSuspenseQuery(registriesQueryOptions(search))
  const {
    registries,
    pagination,
  } = data
  const routeLoading = useRouterState({
    select: state => state.isLoading,
  })
  const loading = routeLoading || isFetching

  const refreshRegistries = () => queryClient.invalidateQueries({
    queryKey: adminRegistryKeys.lists(),
  })

  const {
    rowSelection,
    setRowSelection,
    selectedCount,
    onSearchChange,
    onRefresh,
    onPageChange,
  } = useRouteListState({
    search,
    navigate,
    records: registries,
    getRecordId: getRegistryRowId,
    refresh: refreshRegistries,
  })

  const handleCreate = () => {
    // TODO: open create registry modal
  }

  const handleBatchDelete = () => {
    if (selectedCount === 0) {
      return
    }

    // TODO: open batch delete registry modal
  }

  return (
    <RegistriesTable
      data={registries}
      pagination={pagination}
      loading={loading}
      page={search.page ?? DEFAULT_REGISTRIES_PAGE}
      searchValue={search.query ?? ''}
      onSearchChange={onSearchChange}
      onRefresh={onRefresh}
      onBatchDelete={handleBatchDelete}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      onPageChange={onPageChange}
      selectedCount={selectedCount}
      toolbarExtra={(
        <Button
          disabled
          onClick={handleCreate}
          leftSection={<IconHomePlus size={16} />}
        >
          {t('routes.admin.registries.toolbar.create')}
        </Button>
      )}
    />
  )
}
