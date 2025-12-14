import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import {
  ArrowLeftEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/20/solid';
import { useContext } from 'react';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { supabaseClient } from '~/lib/supabaseClient';
import { useModal } from '~/hooks/useModal';
import CreateNewItem from './CreateExercise';
import { Link, useLocation } from 'react-router';

const navigation = [
  { name: 'Головна', href: '/' },
  { name: 'Стата', href: '/overview' },
  { name: 'Історія', href: '/history' },
  // { name: 'Календар', href: '/calendar' },
  // { name: 'Рандомник', href: '/helpers' },
];

const Navbar = () => {
  const { user } = useContext(SupabaseAuthContext);
  const user_metadata = user?.user_metadata;
  const { openModal } = useModal();
  const location = useLocation();

  async function handleLogout() {
    await supabaseClient.auth.signOut();
    window.location.href = '/';
  }

  function handleAddExercise() {
    openModal('regular', <CreateNewItem />);
  }

  return (
    <Disclosure as="nav" className="relative bg-gray-800/50">
      <div className="container mx-auto  px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="mr-2 -ml-2 flex items-center md:hidden">
              {/* Mobile menu button */}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="block size-6 group-data-open:hidden"
                />
                <XMarkIcon
                  aria-hidden="true"
                  className="hidden size-6 group-data-open:block"
                />
              </DisclosureButton>
            </div>
            <div className="flex shrink-0 items-center text-2xl font-light">
              <Link to="/" className='text-blue-200 cursor-pointer'>Practice Journal</Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:flex-1 md:justify-center">
              {navigation.map((item, itemIdx) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={itemIdx}
                    to={item.href}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors ${
                      itemIdx > 0 ? '-ml-px' : ''
                    } ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          {user ? (
            <div className="flex items-center">
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="relative inline-flex items-center gap-x-1.5 rounded-md bg-green-800 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
                >
                  <PlusIcon aria-hidden="true" className="-ml-0.5 size-5" />
                  Додати вправу
                </button>
              </div>
              <div className="hidden md:ml-4 md:flex md:shrink-0 md:items-center">
                {/* <button
                  type="button"
                  className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="size-6" />
                </button> */}

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt=""
                      src={user_metadata?.avatar_url}
                      className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                    />
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 outline -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in cursor-pointer"
                  >
                    <MenuItem>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:outline-hidden"
                      >
                        Налаштування
                      </a>
                    </MenuItem>
                    <MenuItem>
                      <div
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:outline-hidden"
                      >
                        Вихід
                      </div>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-row gap-2 items-center justify-center text-white text-center cursor-pointer"
              onClick={() => (window.location.href = '/login')}
            >
              Вхід
              <ArrowLeftEndOnRectangleIcon
                aria-hidden="true"
                className="size-6"
              />
            </div>
          )}
        </div>
      </div>

      <DisclosurePanel className="md:hidden">
        <div className="space-y-1 pt-2 pb-3">
          {navigation.map((item, itemIdx) => {
            const isActive = location.pathname === item.href;
            return (
              <DisclosureButton
                key={itemIdx}
                as={Link}
                to={item.href}
                className={`block py-2 pr-4 pl-3 text-base font-medium mx-2 transition-colors sm:pr-6 sm:pl-5 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.name}
              </DisclosureButton>
            );
          })}
        </div>
        <div className="border-t border-white/10 pt-4 pb-3">
          <div className="flex items-center px-4 sm:px-6">
            <div className="shrink-0">
              <img
                alt=""
                src={user_metadata?.avatar_url}
                className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
              />
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-white">
                {user_metadata?.name}
              </div>
              <div className="text-sm font-medium text-gray-400">
                {user_metadata?.email}
              </div>
            </div>
            {/* <button
              type="button"
              className="relative ml-auto shrink-0 rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="size-6" />
            </button> */}
          </div>
          <div className="mt-3 space-y-1">
            <DisclosureButton
              as="a"
              href="#"
              className="block px-4 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
            >
              Налаштування
            </DisclosureButton>
            <DisclosureButton
              as="a"
              href="#"
              className="block px-4 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
            >
              Вихід
            </DisclosureButton>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};

export default Navbar;
