import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { tasksAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react'

const Tasks = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: tasksData, isLoading } = useQuery(
    ['tasks', { search: searchTerm, status: statusFilter }],
    () => tasksAPI.getTasks({ search: searchTerm, status: statusFilter })
  )

  const createMutation = useMutation(tasksAPI.createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks')
      setShowCreateModal(false)
      toast.success('Задача создана')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Ошибка при создании задачи')
    }
  })

  const updateMutation = useMutation(
    ({ id, data }) => tasksAPI.updateTask(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks')
        setEditingTask(null)
        toast.success('Задача обновлена')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Ошибка при обновлении задачи')
      }
    }
  )

  const deleteMutation = useMutation(tasksAPI.deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks')
      toast.success('Задача удалена')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Ошибка при удалении задачи')
    }
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const tasks = tasksData?.data?.tasks || []
  const canCreateTask = ['ADMIN', 'MODERATOR'].includes(user?.role)
  const canEditTask = ['ADMIN', 'MODERATOR'].includes(user?.role)
  const canDeleteTask = user?.role === 'ADMIN'

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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'TODO':
        return 'К выполнению'
      case 'IN_PROGRESS':
        return 'В работе'
      case 'DONE':
        return 'Выполнено'
      default:
        return status
    }
  }

  const handleCreateTask = (data) => {
    createMutation.mutate(data)
    reset()
  }

  const handleUpdateTask = (data) => {
    updateMutation.mutate({ id: editingTask.id, data })
  }

  const handleDeleteTask = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      deleteMutation.mutate(id)
    }
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    reset({
      title: task.title,
      description: task.description || '',
      status: task.status
    })
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Задачи</h1>
        {canCreateTask && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Создать задачу
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">Все статусы</option>
              <option value="TODO">К выполнению</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="DONE">Выполнено</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : (
        <div className="card">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Задачи не найдены</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Автор
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата создания
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.user?.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {canEditTask && (
                            <button
                              onClick={() => openEditModal(task)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {canDeleteTask && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTask) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingTask ? 'Редактировать задачу' : 'Создать задачу'}
            </h3>
            <form onSubmit={handleSubmit(editingTask ? handleUpdateTask : handleCreateTask)}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  {...register('title', { required: 'Название обязательно' })}
                  type="text"
                  className="input"
                  placeholder="Название задачи"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input"
                  placeholder="Описание задачи"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select {...register('status')} className="input">
                  <option value="TODO">К выполнению</option>
                  <option value="IN_PROGRESS">В работе</option>
                  <option value="DONE">Выполнено</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingTask(null)
                    reset()
                  }}
                  className="btn-secondary"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="btn-primary"
                >
                  {createMutation.isLoading || updateMutation.isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
