import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Calendar, Shield } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()

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
        return 'Administrator'
      case 'MODERATOR':
        return 'Moderator'
      case 'VIEWER':
        return 'Viewer'
      default:
        return role
    }
  }

  const getRoleDescription = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Полный доступ ко всем функциям системы, включая управление пользователями'
      case 'MODERATOR':
        return 'Создание и редактирование задач, просмотр всей информации'
      case 'VIEWER':
        return 'Только просмотр задач и общей информации'
      default:
        return ''
    }
  }

  const getPermissions = (role) => {
    switch (role) {
      case 'ADMIN':
        return [
          'Просмотр всех задач',
          'Создание задач',
          'Редактирование задач',
          'Удаление задач',
          'Просмотр всех пользователей',
          'Управление пользователями'
        ]
      case 'MODERATOR':
        return [
          'Просмотр всех задач',
          'Создание задач',
          'Редактирование задач'
        ]
      case 'VIEWER':
        return [
          'Просмотр всех задач'
        ]
      default:
        return []
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Загрузка профиля...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        <p className="text-gray-600">Информация о вашей учетной записи</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Имя пользователя</p>
                  <p className="text-sm text-gray-500">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Дата регистрации</p>
                  <p className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Роль</p>
                  <p className="text-sm text-gray-500">{getRoleDescription(user.role)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Права доступа</h3>
            <div className="space-y-3">
              {getPermissions(user.role).map((permission, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-700">{permission}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">О системе</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Task Manager</strong></p>
              <p>Версия: 1.0.0</p>
              <p>Архитектура: Трёхзвенная</p>
              <p>© 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
