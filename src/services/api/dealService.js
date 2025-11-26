import dealsData from "@/services/mockData/deals.json"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let deals = [...dealsData]

export const dealService = {
  async getAll() {
    await delay(400)
    return [...deals]
  },

  async getById(id) {
    await delay(200)
    const deal = deals.find(d => d.Id === parseInt(id))
    if (!deal) {
      throw new Error("Deal not found")
    }
    return { ...deal }
  },

  async create(dealData) {
    await delay(350)
    const newDeal = {
      ...dealData,
      Id: Math.max(...deals.map(d => d.Id)) + 1,
      amount: parseFloat(dealData.amount) || 0,
      probability: parseInt(dealData.probability) || 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    deals = [newDeal, ...deals]
    return { ...newDeal }
  },

  async update(id, dealData) {
    await delay(350)
    const index = deals.findIndex(d => d.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Deal not found")
    }
    
    const updatedDeal = {
      ...deals[index],
      ...dealData,
      Id: parseInt(id),
      amount: parseFloat(dealData.amount) || deals[index].amount,
      probability: parseInt(dealData.probability) || deals[index].probability,
      updatedAt: new Date().toISOString()
    }
    
    deals[index] = updatedDeal
    return { ...updatedDeal }
  },

async delete(id) {
    await delay(200)
    deals = deals.filter(d => d.Id !== parseInt(id))
    return true
  },

  async bulkUpdateStage(dealIds, stage) {
    await delay(400)
    dealIds.forEach(id => {
      const index = deals.findIndex(d => d.Id === parseInt(id))
      if (index !== -1) {
        deals[index] = {
          ...deals[index],
          stage,
          updatedAt: new Date().toISOString()
        }
      }
    })
    return true
  },

  async getByStage(stage) {
    await delay(300)
    return deals.filter(d => d.stage === stage)
  },

  async getPipelineMetrics() {
    await delay(200)
    const totalValue = deals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0)
    const weightedValue = deals.reduce((sum, deal) => {
      const amount = parseFloat(deal.amount) || 0
      const probability = parseInt(deal.probability) || 0
      return sum + (amount * (probability / 100))
    }, 0)
    
    const stageDistribution = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1
      return acc
    }, {})

    return {
      totalValue,
      weightedValue,
      totalDeals: deals.length,
      stageDistribution
    }
  }
}