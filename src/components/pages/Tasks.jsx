import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import { taskService } from "@/services/api/taskService"
import { contactService } from "@/services/api/contactService"
import { format, isToday, isTomorrow, isPast } from "date-fns"

const TaskModal = ({ isOpen, task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    relatedTo: "",
    relatedType: "contact"
  })
  const [contacts, setContacts] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen])

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
      })
    } else {
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "pending",
        relatedTo: "",
        relatedType: "contact"
      })
    }
  }, [task])

  const loadContacts = async () => {
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error("Task title is required")
      return
    }

    setSaving(true)
    try {
      const savedTask = task
        ? await taskService.update(task.Id, formData)
        : await taskService.create(formData)
      
      onSave(savedTask)
      toast.success(task ? "Task updated successfully" : "Task created successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save task")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ApperIcon name="X" className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Follow up with client"
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Additional details about this task..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="input-field"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Related To
              </label>
              <select 
                value={formData.relatedTo}
                onChange={(e) => setFormData({...formData, relatedTo: e.target.value})}
                className="input-field"
              >
                <option value="">No relation</option>
                {contacts.map(contact => (
                  <option key={contact.Id} value={contact.Id}>
                    {contact.name} - {contact.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Saving..." : task ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTask, setSelectedTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  useEffect(() => {
    loadTasks()
    loadContacts()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await taskService.getAll()
      setTasks(data)
    } catch (err) {
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    }
  }

  const handleTaskSave = (savedTask) => {
    if (selectedTask) {
      setTasks(tasks.map(t => t.Id === savedTask.Id ? savedTask : t))
    } else {
      setTasks([savedTask, ...tasks])
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.Id === taskId)
      const newStatus = task.status === "completed" ? "pending" : "completed"
      const updatedTask = await taskService.update(taskId, { ...task, status: newStatus })
      setTasks(tasks.map(t => t.Id === taskId ? updatedTask : t))
      toast.success(`Task ${newStatus === "completed" ? "completed" : "reopened"}`)
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const handleDelete = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.delete(taskId)
        setTasks(tasks.filter(t => t.Id !== taskId))
        toast.success("Task deleted successfully")
      } catch (error) {
        toast.error("Failed to delete task")
      }
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "danger"
      case "high": return "warning"
      case "medium": return "info"
      case "low": return "default"
      default: return "default"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success"
      case "in-progress": return "info"
      case "cancelled": return "danger"
      default: return "default"
    }
  }

  const getContactName = (contactId) => {
    if (!contactId) return null
    const contact = contacts.find(c => c.Id === contactId)
    return contact ? contact.name : "Unknown Contact"
  }

  const getDateLabel = (dueDate) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isPast(date)) return "Overdue"
    return format(date, "MMM d")
  }

  const getDateColor = (dueDate) => {
    if (!dueDate) return "text-slate-500"
    const date = new Date(dueDate)
    if (isPast(date) && !isToday(date)) return "text-red-600"
    if (isToday(date)) return "text-amber-600"
    return "text-slate-600"
  }

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const tasksByStatus = {
    pending: tasks.filter(t => t.status === "pending").length,
    "in-progress": tasks.filter(t => t.status === "in-progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    cancelled: tasks.filter(t => t.status === "cancelled").length
  }

  const overdueTasks = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== "completed").length

  if (loading) return <Loading type="skeleton" />
  if (error) return <ErrorView message={error} onRetry={loadTasks} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tasks</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your to-do list and track task progress.
          </p>
          {overdueTasks > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              You have {overdueTasks} overdue task{overdueTasks !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button 
          onClick={() => {
            setSelectedTask(null)
            setIsModalOpen(true)
          }}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All ({tasks.length})</option>
            <option value="pending">Pending ({tasksByStatus.pending})</option>
            <option value="in-progress">In Progress ({tasksByStatus["in-progress"]})</option>
            <option value="completed">Completed ({tasksByStatus.completed})</option>
            <option value="cancelled">Cancelled ({tasksByStatus.cancelled})</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority:</label>
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <Empty 
          icon="CheckSquare"
          title="No tasks found"
          message={filterStatus === "all" && filterPriority === "all" ? "Create your first task to get started." : "No tasks match your current filters."}
          actionLabel="Add Task"
          onAction={() => {
            setSelectedTask(null)
            setIsModalOpen(true)
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.Id} className="card hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(task.Id)}
                  className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    task.status === "completed"
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-slate-300 hover:border-primary-500"
                  }`}
                >
                  {task.status === "completed" && (
                    <ApperIcon name="Check" className="h-3 w-3" />
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        task.status === "completed" 
                          ? "text-slate-500 line-through" 
                          : "text-slate-900 dark:text-slate-100"
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.status === "completed"
                            ? "text-slate-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}>
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => {
                          setSelectedTask(task)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.Id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Task Meta */}
                  <div className="flex items-center flex-wrap gap-3 mt-3">
                    <Badge variant={getPriorityColor(task.priority)} size="sm">
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>

                    <Badge variant={getStatusColor(task.status)} size="sm">
                      {task.status.replace("-", " ").charAt(0).toUpperCase() + task.status.replace("-", " ").slice(1)}
                    </Badge>

                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 text-sm ${getDateColor(task.dueDate)}`}>
                        <ApperIcon name="Calendar" className="h-4 w-4" />
                        <span>{getDateLabel(task.dueDate)}</span>
                      </div>
                    )}

                    {task.relatedTo && (
                      <div className="flex items-center space-x-1 text-sm text-slate-500">
                        <ApperIcon name="User" className="h-4 w-4" />
                        <span>{getContactName(task.relatedTo)}</span>
                      </div>
                    )}

                    <div className="text-xs text-slate-400">
                      Created {format(new Date(task.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        task={selectedTask}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTask(null)
        }}
        onSave={handleTaskSave}
      />
    </div>
  )
}

export default Tasks