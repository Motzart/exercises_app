import * as React from 'react';
import { useLocation, useParams, Link } from 'react-router';
import { IconHome } from '@tabler/icons-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { usePlaylist } from '~/hooks/useExercises';

const routeLabels: Record<string, string> = {
  '/': 'Головна',
  '/overview': 'Аналітика',
  '/calendar': 'Календар',
  '/history': 'Історія',
  '/play-lists': 'Списки вправ',
  '/exercises': 'Вправи',
  '/helpers': 'Допомога',
};

function DynamicBreadcrumbItem() {
  const { id } = useParams();
  const { data: playlist } = usePlaylist(id || '');

  if (playlist) {
    return <BreadcrumbPage>{playlist.name}</BreadcrumbPage>;
  }

  return <BreadcrumbPage>Завантаження...</BreadcrumbPage>;
}

export function PageBreadcrumb() {
  const location = useLocation();
  const { id } = useParams();
  const pathname = location.pathname;

  // Генерируем breadcrumbs на основе пути
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; href: string }> = [];

  // Добавляем главную страницу
  if (pathname !== '/') {
    breadcrumbs.push({ label: 'Головна', href: '/' });
  }

  // Обрабатываем сегменты пути
  let currentPath = '';
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    // Для динамических маршрутов (например, /play-lists/:id)
    if (
      i === pathSegments.length - 1 &&
      id &&
      currentPath.startsWith('/play-lists/')
    ) {
      // Последний элемент будет динамическим
      break;
    }

    const label = routeLabels[currentPath] || segment;
    breadcrumbs.push({ label, href: currentPath });
  }

  // Если это динамический маршрут плейлиста, добавляем его название
  if (id && pathname.startsWith('/play-lists/')) {
    breadcrumbs.push({ label: '', href: pathname });
  }

  // Если на главной странице, не показываем breadcrumb
  if (pathname === '/' || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="px-4 lg:px-6 pb-4">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isDynamic =
              isLast && id && pathname.startsWith('/play-lists/');
            const isHome = crumb.href === '/';

            return (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {isLast ? (
                    isDynamic ? (
                      <DynamicBreadcrumbItem />
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={crumb.href}
                        className="flex items-center gap-1.5"
                      >
                        {isHome && <IconHome className="size-4" />}
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
