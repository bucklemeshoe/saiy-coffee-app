import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { CircleUserRound, Settings, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'

function SidebarLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation()
  const isActive = pathname === to
  return (
    <Link
      to={to}
      className={
        'block rounded-md px-3 py-2 text-sm ' +
        (isActive
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800')
      }
    >
      {label}
    </Link>
  )
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminLayout({ children }: React.PropsWithChildren) {
  const hasClerk = Boolean((import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY) &&
    (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY !== 'disabled_for_local_dev'
  const { pathname } = useLocation()

  const navItems = [
    { name: 'Dashboard', to: '/', current: pathname === '/' },
  ] as const

  const navbar = (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0">
                  <Link to="/" className="text-white font-semibold">Order Admin</Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navItems.map((item) =>
                      'to' in item ? (
                        <Link
                          key={item.name}
                          to={item.to!}
                          aria-current={item.current ? 'page' : undefined}
                          className={classNames(
                            item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <a
                          key={item.name}
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className={classNames('text-gray-300 hover:bg-white/5 hover:text-white', 'rounded-md px-3 py-2 text-sm font-medium')}
                        >
                          {item.name}
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <button type="button" className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>
                  {hasClerk ? (
                    <div className="ml-3">
                      <SignedIn>
                        <UserButton />
                      </SignedIn>
                      <SignedOut>
                        <SignInButton>
                          <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white">Sign in</button>
                        </SignInButton>
                      </SignedOut>
                    </div>
                  ) : (
                    <div className="ml-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="relative h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border-0">
                            <CircleUserRound className="h-4 w-4 text-white" />
                            <span className="sr-only">Open user menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">Admin User</p>
                              <p className="text-xs leading-none text-muted-foreground">admin@example.com</p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon aria-hidden="true" className={classNames('size-6', !open && 'block')} />
                  <XMarkIcon aria-hidden="true" className={classNames('size-6', open && 'block hidden')} />
                </DisclosureButton>
              </div>
            </div>
          </div>
          <DisclosurePanel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navItems.map((item) =>
                'to' in item ? (
                  <DisclosureButton
                    key={item.name}
                    as={Link as any}
                    to={item.to!}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                  >
                    {item.name}
                  </DisclosureButton>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={classNames('text-gray-300 hover:bg-white/5 hover:text-white', 'block rounded-md px-3 py-2 text-base font-medium')}
                  >
                    {item.name}
                  </a>
                )
              )}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )

  return (
    <div className="min-h-screen">
      {navbar}
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
