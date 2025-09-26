"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Bell, MessageCircle, Settings, Menu, LogOut, Heart } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

const mainLinks = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/profile/roohullah', label: 'Dashboard', icon: User },
  { href: '/favourites', label: 'Favourites', icon: Heart },
];

const conversationLinks = [
  { href: '/chat', label: 'Chat', icon: MessageCircle },
];

const otherLinks = [
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = ["/login", "/register", "/forgot-password", "/"].includes(pathname);
  if (isAuthPage) return null;

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  const renderNavLinks = (links: typeof mainLinks) => {
    return links.map(link => {
      const Icon = link.icon;
      const isActive = pathname.startsWith(link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          style={{ letterSpacing: '0.01em' }}
        >
          <Icon className="w-6 h-6" />
          {link.label}
        </Link>
      );
    });
  };

  return (
    <>
      {/* Hamburger menu for mobile/tablet */}
      <div className="fixed top-5 left-4 z-50 lg:hidden">
        <SidebarDrawer />
      </div>
      <aside className="sidebar-gradient h-full w-64 flex-col py-7 px-6 gap-2 z-10 hidden lg:flex">
        {/* Main Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Main</h3>
          <nav className="flex flex-col gap-1">
            {renderNavLinks(mainLinks)}
          </nav>
        </div>

        {/* Conversation Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Conversation</h3>
          <nav className="flex flex-col gap-1">
            {renderNavLinks(conversationLinks)}
          </nav>
        </div>

        {/* Other Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Other</h3>
          <nav className="flex flex-col gap-1">
            {renderNavLinks(otherLinks)}
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 text-gray-600 hover:text-red-500 hover:bg-red-50 transition duration-150 rounded-lg px-4 py-3"
        >
          <LogOut className="w-6 h-6" />
          Logout
        </button>
      </aside>
    </>
  );
}

// SidebarDrawer for mobile/tablet
export function SidebarDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = ["/login", "/register", "/forgot-password", "/"].includes(pathname);
  if (isAuthPage) return null;

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  const renderNavLinks = (links: typeof mainLinks) => {
    return links.map(link => {
      const Icon = link.icon;
      const isActive = pathname.startsWith(link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          style={{ letterSpacing: '0.01em' }}
          onClick={() => setOpen(false)}
        >
          <Icon className="w-6 h-6" />
          {link.label}
        </Link>
      );
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="lg:hidden p-2 text-gray-600 bg-white rounded-lg shadow-sm border border-gray-200" aria-label="Open menu">
          <Menu className="w-7 h-7" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl flex flex-col py-7 px-6 gap-2">
          <Dialog.Title className="sr-only">Sidebar Navigation</Dialog.Title>
          
          {/* Main Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Main</h3>
            <nav className="flex flex-col gap-1">
              {renderNavLinks(mainLinks)}
            </nav>
          </div>

          {/* Conversation Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Conversation</h3>
            <nav className="flex flex-col gap-1">
              {renderNavLinks(conversationLinks)}
            </nav>
          </div>

          {/* Other Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Other</h3>
            <nav className="flex flex-col gap-1">
              {renderNavLinks(otherLinks)}
            </nav>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
            className="mt-auto flex items-center gap-2 text-gray-600 hover:text-red-500 hover:bg-red-50 transition duration-150 rounded-lg px-4 py-3"
          >
            <LogOut className="w-6 h-6" />
            Logout
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
