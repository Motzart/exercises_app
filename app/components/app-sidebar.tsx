import * as React from 'react';
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMusic,
  IconNotebook,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';

import { NavMain } from '~/components/nav-main';
import { NavSecondary } from '~/components/nav-secondary';
import { NavUser } from '~/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';
import { Link } from 'react-router';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import CalendarView from './CalendarView';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar_url: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Головна',
      url: '/',
      icon: IconDashboard,
    },
    {
      title: 'Вправи',
      url: '/exercises',
      icon: IconFileWord,
    },
    // {
    //   title: 'Огляд',
    //   url: '/overview',
    //   icon: IconChartBar,
    // },
    {
      title: 'Аналітика',
      url: '/analytics',
      icon: IconReport,
    },
    {
      title: 'Історія',
      url: '/history',
      icon: IconFolder,
    },
    {
      title: 'Гами',
      url: '/scales',
      icon: IconMusic,
    },
    // {
    //   title: 'Календар',
    //   url: '/calendar',
    //   icon: IconUsers,
    // },
    // {
    //   title: 'Акорди',
    //   url: '/chords',
    //   icon: IconUsers,
    // },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: IconCamera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: IconFileDescription,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: IconFileAi,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    // {
    //   title: 'Налаштування',
    //   url: '#',
    //   icon: IconSettings,
    // },
    // {
    //   title: 'Допомога',
    //   url: '#',
    //   icon: IconHelp,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = React.useContext(SupabaseAuthContext);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <IconNotebook className="!size-5 text-blue-500" />
                <span className="text-base font-semibold">
                  Practice journal
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <div className="mt-4 w-full flex flex-col gap-4 items-center justify-center">
          <CalendarView />
        </div>

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user?.user_metadata ?? data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
