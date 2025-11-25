import activitiesData from "@/services/mockData/activities.json"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let activities = [...activitiesData]

export const activityService = {
  async getAll() {
    await delay(300)
    return [...activities]
  },

  async getRecent(limit = 10) {
    await delay(250)
    return activities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  },

  async create(activityData) {
    await delay(200)
    const newActivity = {
      ...activityData,
      Id: Math.max(...activities.map(a => a.Id)) + 1,
      createdAt: new Date().toISOString()
    }
    activities = [newActivity, ...activities]
    return { ...newActivity }
  }
}