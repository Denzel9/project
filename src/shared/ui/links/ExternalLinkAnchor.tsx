import { useState, type ComponentProps, type MouseEvent } from 'react'

import { isNikssensHref, openHref } from '@/shared/lib/links/isNikssensHref'
import { ConfirmDialog } from '@/widgets/confirm-dialog'

type ExternalLinkAnchorProps = ComponentProps<'a'> & {
  href: string
}

export const ExternalLinkAnchor = ({
  href,
  children,
  onClick,
  ...props
}: ExternalLinkAnchorProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const isTrusted = isNikssensHref(href)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    event.preventDefault()

    if (isTrusted) {
      openHref(href)
      return
    }

    setIsConfirmOpen(true)
  }

  return (
    <>
      <a
        href={href}
        rel={isTrusted ? undefined : 'noopener noreferrer'}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>

      <ConfirmDialog
        width={440}
        isOpen={isConfirmOpen}
        title="Внешняя ссылка"
        description="Не рекомендуем переходить по ссылкам вне домена Nikssens — это может быть небезопасно."
        successLabel="Перейти"
        successColor="primary"
        onClose={() => setIsConfirmOpen(false)}
        onSuccess={() => {
          setIsConfirmOpen(false)
          openHref(href)
        }}
      />
    </>
  )
}
