import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      allowed: ['ADMIN', 'MODERATOR', 'VIEWER']
    },
    {
      name: 'Задачи',
      href: '/tasks',
      icon: CheckSquare,
      allowed: ['ADMIN', 'MODERATOR', 'VIEWER']
    },
    {
      name: 'Пользователи',
      href: '/users',
      icon: Users,
      allowed: ['ADMIN']
    },
    {
      name: 'Профиль',
      href: '/profile',
      icon: User,
      allowed: ['ADMIN', 'MODERATOR', 'VIEWER']
    }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.allowed.includes(user?.role)
  )

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MODERATOR':
        return 'bg-blue-100 text-blue-800'
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin'
      case 'MODERATOR':
        return 'Moderator'
      case 'VIEWER':
        return 'Viewer'
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-gray-600 transition-opacity ${sidebarOpen ? 'opacity-75' : 'opacity-0'}`} 
             onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex w-full max-w-xs flex-col bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <SidebarContent 
            navigation={filteredNavigation} 
            currentPath={location.pathname}
            user={user}
            getRoleBadgeColor={getRoleBadgeColor}
            getRoleLabel={getRoleLabel}
            logout={logout}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent 
          navigation={filteredNavigation} 
          currentPath={location.pathname}
          user={user}
          getRoleBadgeColor={getRoleBadgeColor}
          getRoleLabel={getRoleLabel}
          logout={logout}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                Task Manager
              </h1>
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navigation, currentPath, user, getRoleBadgeColor, getRoleLabel, logout }) => (
  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 ring-1 ring-gray-900/5">
    <div className="flex h-16 shrink-0 items-center">
      <h2 className="text-xl font-bold text-gray-900">Task Manager</h2>
    </div>
    
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                    currentPath === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
        
        <li className="mt-auto">
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-x-4">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className={`text-xs rounded-full px-2 py-1 inline-block ${getRoleBadgeColor(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-4 w-full flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <LogOut className="h-6 w-6 shrink-0" />
              Выйти
            </button>
          </div>
        </li>
      </ul>
    </nav>
  </div>
)

export default Layout
