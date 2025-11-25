import leadsData from "@/services/mockData/leads.json"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let leads = [...leadsData]

export const leadService = {
  async getAll() {
    await delay(350)
    return [...leads]
  },

  async getById(id) {
    await delay(200)
    const lead = leads.find(l => l.Id === parseInt(id))
    if (!lead) {
      throw new Error("Lead not found")
    }
    return { ...lead }
  },

  async create(leadData) {
    await delay(300)
    const newLead = {
      ...leadData,
      Id: Math.max(...leads.map(l => l.Id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    leads = [newLead, ...leads]
    return { ...newLead }
  },

  async update(id, leadData) {
    await delay(300)
    const index = leads.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Lead not found")
    }
    
    const updatedLead = {
      ...leads[index],
      ...leadData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    }
    
    leads[index] = updatedLead
    return { ...updatedLead }
  },

  async delete(id) {
    await delay(200)
    leads = leads.filter(l => l.Id !== parseInt(id))
    return true
  }
}