import tasksData from "@/services/mockData/tasks.json"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let tasks = [...tasksData]

export const taskService = {
  async getAll() {
    await delay(300)
    return [...tasks]
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
    const newTask = {
      ...taskData,
      Id: Math.max(...tasks.map(t => t.Id)) + 1,
      status: taskData.status || "pending",
      createdAt: new Date().toISOString(),
      completedAt: null
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
    
    const updatedTask = {
      ...tasks[index],
      ...taskData,
      Id: parseInt(id),
      completedAt: taskData.status === "completed" ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
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