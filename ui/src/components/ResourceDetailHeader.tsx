import {
  ActionIcon,
  Badge,
  CopyButton,
  Group,
  Text,
  Tooltip,
} from '@mantine/core'
import { type Label } from '@matrixhub/api-ts/v1alpha1/model.pb.ts'
import { Link } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import CopyIcon from '@/assets/svgs/copy.svg?react'
import FileIcon from '@/assets/svgs/file.svg?react'

interface ResourceDetailHeaderProps {
  projectId: string
  name: string
  size?: string
  updatedAt?: string
  /** Label list to render as badges */
  labels?: Label[]
  /** Action buttons (upload, download, etc.) */
  actions?: ReactNode
}

export function ResourceDetailHeader({
  projectId,
  name,
  size,
  updatedAt,
  labels,
  actions,
}: ResourceDetailHeaderProps) {
  const { t } = useTranslation()
  const fullName = `${projectId}/${name}`

  return (
    <>
      {/* Row 1: Breadcrumb + Action buttons */}
      <Group justify="space-between" align="flex-start" mb={10}>
        <Group gap="4" align="center">
          <Text
            component={Link}
            to={`/projects/${projectId}`}
            c="cyan"
            fw={600}
            size="lg"
            lh="28px"
            td="none"
          >
            {projectId}
          </Text>
          <Text c="dimmed" size="lg" w={24} h={24} fw={600} lh="24px" ta="center" inline>/</Text>
          <Text size="lg" c="gray.9" lh="28px">{name}</Text>
          <CopyButton value={fullName} timeout={2000}>
            {({
              copied,
              copy,
            }) => (
              <Tooltip label={copied ? t('common.copied') : t('common.copyName')} withArrow>
                <ActionIcon variant="subtle" color="gray" onClick={copy} size={24}>
                  <CopyIcon />
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>

      {/* Row 2: Badges */}
      {labels?.length && (
        <Group gap={8} mb={12}>
          {labels.map(label => (
            <Badge key={label.id} variant="light" color="gray" leftSection={<FileIcon />} size="md" radius="xl" fw={600} h={24}>
              {label.name}
            </Badge>
          ))}
        </Group>
      )}

      {/* Row 3: Metadata */}
      <Group gap={24}>
        <Text size="12px" lh="20px" c="dimmed">
          {t('common.fromProject')}
          {t('common.colon')}
          {projectId}
        </Text>
        <Text size="12px" lh="20px" c="dimmed">
          {t('common.modelSize')}
          {t('common.colon')}
          {size ?? '-'}
        </Text>
        <Text size="12px" lh="20px" c="dimmed">
          {t('common.updatedAt')}
          {t('common.colon')}
          {updatedAt ?? '-'}
        </Text>
      </Group>
    </>
  )
}
