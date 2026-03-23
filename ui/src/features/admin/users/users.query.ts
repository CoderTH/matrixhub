import { Users } from '@matrixhub/api-ts/v1alpha1/user.pb'
import { queryOptions } from '@tanstack/react-query'

import {
  normalizeUsersSearch,
  DEFAULT_USERS_PAGE_SIZE,
  type UsersSearch,
} from './users.schema'

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (search: ReturnType<typeof normalizeUsersSearch>) =>
    [...adminUserKeys.lists(), search] as const,
}

export function usersQueryOptions(search: UsersSearch) {
  const normalizedSearch = normalizeUsersSearch(search)

  return queryOptions({
    queryKey: adminUserKeys.list(normalizedSearch),
    queryFn: async () => {
      const response = await Users.ListUsers({
        page: normalizedSearch.page,
        pageSize: DEFAULT_USERS_PAGE_SIZE,
        search: normalizedSearch.query,
      })

      return {
        users: response.users ?? [],
        pagination: response.pagination,
      }
    },
  })
}
