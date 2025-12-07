import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  BookOpenIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';
import { useContext, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { supabaseClient } from '~/lib/supabaseClient';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Overview', href: '#' },
  { name: 'History', href: '#' },
  { name: 'Calendar', href: '#' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useContext(SupabaseAuthContext);
  const user_metadata = user?.user_metadata;

  async function handleLogout() {
    await supabaseClient.auth.signOut();
    window.location.href = '/';
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50 flex h-16 border-b border-gray-900/10 bg-white dark:border-gray-100/10 dark:bg-gray-800">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-x-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-3 p-3 md:hidden"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon
              aria-hidden="true"
              className="size-5 text-gray-900 dark:text-gray-100"
            />
          </button>
          <BookOpenIcon
            aria-hidden="true"
            className="size-12 text-gray-900 dark:text-gray-100"
          />
          <span className="text-xl font-light uppercase">Smart Diary</span>
        </div>
        <nav className="hidden md:flex md:gap-x-11 md:text-sm/6 md:font-semibold md:text-gray-700 dark:md:text-gray-300">
          {navigation.map((item, itemIdx) => (
            <a key={itemIdx} href={item.href}>
              {item.name}
            </a>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-x-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon aria-hidden="true" className="size-6" />
          </button>
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your profile</span>
            <img
              alt=""
              src={user_metadata?.avatar_url}
              className="size-8 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
            />
          </a>
          {user && (
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400 cursor-pointer"
            >
              <span className="sr-only">Logout</span>
              <ArrowRightStartOnRectangleIcon
                aria-hidden="true"
                className="size-6"
              />
            </button>
          )}
        </div>
      </div>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-4 pb-6 sm:max-w-sm sm:px-6 sm:ring-1 sm:ring-gray-900/10 dark:bg-gray-950 dark:sm:ring-gray-100/10">
          <div className="-ml-0.5 flex h-16 items-center gap-x-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
            <div className="-ml-0.5">
              <a href="#" className="-m-1.5 block p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </a>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                {item.name}
              </a>
            ))}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Header;
