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
  }
}