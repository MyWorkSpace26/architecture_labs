import { useQuery } from 'react-query'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { CheckSquare, Users, TrendingUp, Clock } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  const { data: dashboardData } = useQuery('dashboard-stats', () => 
    dashboardAPI.getStats()
  )

  const stats = dashboardData?.data?.stats || {
    totalTasks: 0,
    totalUsers: 0,
    statusStats: {},
    roleStats: {},
    recentTasks: []
  }

  const todoTasks = stats.statusStats.TODO || 0
  const inProgressTasks = stats.statusStats.IN_PROGRESS || 0
  const doneTasks = stats.statusStats.DONE || 0
  const recentTasks = stats.recentTasks || []

  const adminUsers = stats.roleStats.ADMIN || 0
  const moderatorUsers = stats.roleStats.MODERATOR || 0
  const viewerUsers = stats.roleStats.VIEWER || 0

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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'TODO':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'DONE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Добро пожаловать, {user?.username}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckSquare className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего задач</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">В работе</p>
              <p className="text-2xl font-bold text-gray-900">{stats.statusStats.IN_PROGRESS || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Выполнено</p>
              <p className="text-2xl font-bold text-gray-900">{stats.statusStats.DONE || 0}</p>
            </div>
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Пользователи</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Последние задачи</h2>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500">Задач пока нет</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      {task.user?.username} • {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(task.status)}`}>
                    {task.status === 'TODO' ? 'К выполнению' : 
                     task.status === 'IN_PROGRESS' ? 'В работе' : 'Выполнено'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Распределение задач</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">К выполнению</span>
                <span className="text-sm text-gray-500">{todoTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${stats.totalTasks > 0 ? (todoTasks / stats.totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">В работе</span>
                <span className="text-sm text-gray-500">{inProgressTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.totalTasks > 0 ? (inProgressTasks / stats.totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Выполнено</span>
                <span className="text-sm text-gray-500">{doneTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.totalTasks > 0 ? (doneTasks / stats.totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Distribution (Admin only) */}
      {user?.role === 'ADMIN' && (
        <div className="card mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Распределение пользователей</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{adminUsers}</p>
              <p className="text-sm text-gray-600">Admin</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{moderatorUsers}</p>
              <p className="text-sm text-gray-600">Moderator</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{viewerUsers}</p>
              <p className="text-sm text-gray-600">Viewer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
