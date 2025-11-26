import tasksData from "@/services/mockData/tasks.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let tasks = [...tasksData]

export const taskService = {
async getAll() {
    await delay(300)
    return [...tasks]
  },

async getByAssignee(assigneeId) {
    await delay(300)
    const id = parseInt(assigneeId)
    if (!id || isNaN(id)) return []
    return tasks.filter(t => t.assignedTo === id)
  },

  async getById(id) {
    await delay(200)
    const task = tasks.find(t => t.Id === parseInt(id))
    if (!task) {
      throw new Error("Task not found")
    }
    return { ...task }
  },

  async create(taskData) {
    await delay(300)
const now = new Date().toISOString()
const newTask = {
      ...taskData,
      Id: Math.max(...tasks.map(t => t.Id)) + 1,
      status: taskData.status || "not-started",
      category: taskData.category || "follow-up",
      assignedTo: taskData.assignedTo || null,
      assignedAt: taskData.assignedTo ? now : null,
      assignmentHistory: taskData.assignedTo ? [{
        assignedTo: taskData.assignedTo,
        assignedAt: now,
        assignedBy: 1, // Current user
        status: 'active'
      }] : [],
      createdAt: now,
      completedAt: taskData.status === "completed" ? now : null
    }
    tasks = [newTask, ...tasks]
    return { ...newTask }
  },

  async update(id, taskData) {
    await delay(300)
    const index = tasks.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Task not found")
    }
    
const now = new Date().toISOString()
    const previousAssignee = tasks[index].assignedTo
    const newAssignee = taskData.assignedTo
    const assignmentChanged = newAssignee !== previousAssignee
    
    // Prepare assignment history entry if assignment changed
    const currentHistory = tasks[index].assignmentHistory || []
    const newHistoryEntry = assignmentChanged ? {
      assignedTo: newAssignee,
      assignedAt: now,
      assignedBy: 1, // Current user
      previousAssignee: previousAssignee,
      status: newAssignee ? 'active' : 'unassigned'
    } : null
    
    const updatedTask = {
      ...tasks[index],
      ...taskData,
      Id: parseInt(id),
      assignedTo: newAssignee || null,
      assignedAt: assignmentChanged && newAssignee ? now : tasks[index].assignedAt,
      assignmentHistory: newHistoryEntry ? [...currentHistory, newHistoryEntry] : currentHistory,
      completedAt: taskData.status === "completed" && !tasks[index].completedAt ? now : (taskData.status === "completed" ? tasks[index].completedAt : null),
      updatedAt: now
    }
    
    tasks[index] = updatedTask
    return { ...updatedTask }
  },

  async delete(id) {
    await delay(200)
    tasks = tasks.filter(t => t.Id !== parseInt(id))
    return true
  }
}