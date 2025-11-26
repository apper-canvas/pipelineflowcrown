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
    
    // Validate required fields
    if (!leadData.title?.trim() || !leadData.company?.trim()) {
      throw new Error("Title and company are required")
    }
    
    if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
      throw new Error("Please enter a valid email address")
    }
    
    const newLead = {
      ...leadData,
      Id: Math.max(...leads.map(l => l.Id), 0) + 1,
      stage: leadData.stage || 'new',
      source: leadData.source || 'website',
      value: leadData.value ? parseFloat(leadData.value) : null,
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
    
    // Validate email if provided
    if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
      throw new Error("Please enter a valid email address")
    }
    
    const updatedLead = {
      ...leads[index],
      ...leadData,
      Id: parseInt(id),
      value: leadData.value ? parseFloat(leadData.value) : leads[index].value,
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