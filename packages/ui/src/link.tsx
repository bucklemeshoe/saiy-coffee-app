import * as Headless from '@headlessui/react'
import { forwardRef } from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'

type AnchorLikeProps = React.ComponentPropsWithoutRef<'a'>

type CatalystLinkProps = (
  | ({ href: string } & Omit<RouterLinkProps, 'to'>)
  | ({ to: RouterLinkProps['to'] } & Omit<RouterLinkProps, 'to'>)
) & AnchorLikeProps

export const Link = forwardRef<HTMLAnchorElement, CatalystLinkProps>(function Link(
  { href, to, ...rest },
  ref,
) {
  const finalTo = (to ?? href ?? '') as RouterLinkProps['to']
  return (
    <Headless.DataInteractive>
      <RouterLink {...(rest as any)} to={finalTo} ref={ref as any} />
    </Headless.DataInteractive>
  )
})

