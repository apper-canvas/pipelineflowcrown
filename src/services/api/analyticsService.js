import analyticsData from "@/services/mockData/analytics.json"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const analyticsService = {
  async getAnalytics(period = "30d") {
    await delay(500)
    
    // Simulate different data based on period
    const baseData = { ...analyticsData }
    
    if (period === "7d") {
      baseData.chartData.categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      baseData.stats = baseData.stats.map(stat => ({
        ...stat,
        change: stat.change ? `+${Math.floor(Math.random() * 20 + 5)}%` : stat.change
      }))
    } else if (period === "90d") {
      baseData.chartData.categories = ["Jan", "Feb", "Mar"]
      baseData.stats = baseData.stats.map(stat => ({
        ...stat,
        value: stat.value.includes("$") ? 
          `$${(parseInt(stat.value.replace(/[^0-9]/g, "")) * 3).toLocaleString()}` :
          `${parseInt(stat.value.replace(/[^0-9]/g, "")) * 2.5}`
      }))
    }
    
    return baseData
  }
}