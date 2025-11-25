import contactsData from "@/services/mockData/contacts.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let contacts = [...contactsData]

export const contactService = {
  async getAll() {
    await delay(400)
    return [...contacts]
  },

  async getById(id) {
    await delay(200)
    const contact = contacts.find(c => c.Id === parseInt(id))
    if (!contact) {
      throw new Error("Contact not found")
    }
    return { ...contact }
  },

async create(contactData) {
    await delay(300)
    
    // Validate required fields
    if (!contactData.name?.trim()) {
      throw new Error("Name is required")
    }
    
    // Validate email format if provided
    if (contactData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      throw new Error("Please enter a valid email address")
    }
    
// Validate phone format if provided (basic validation)
    if (contactData.phone && !/^[+]?[\d\s\-()]+$/.test(contactData.phone)) {
      throw new Error("Please enter a valid phone number")
    }
    
    const newContact = {
      ...contactData,
      Id: Math.max(...contacts.map(c => c.Id)) + 1,
      avatar: contactData.avatar || "",
      tags: contactData.tags || [],
      createdAt: new Date().toISOString(),
      lastContactedAt: new Date().toISOString()
    }
    contacts = [newContact, ...contacts]
    return { ...newContact }
  },

async update(id, contactData) {
    await delay(300)
    const index = contacts.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Contact not found")
    }
    
    // Validate required fields
    if (!contactData.name?.trim()) {
      throw new Error("Name is required")
    }
    
    // Validate email format if provided
    if (contactData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      throw new Error("Please enter a valid email address")
    }
    
// Validate phone format if provided (basic validation)
    if (contactData.phone && !/^[+]?[\d\s\-()]+$/.test(contactData.phone)) {
      throw new Error("Please enter a valid phone number")
    }
    
    const updatedContact = {
      ...contacts[index],
      ...contactData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    }
    
    contacts[index] = updatedContact
    return { ...updatedContact }
  },
async delete(id) {
    await delay(200)
    contacts = contacts.filter(c => c.Id !== parseInt(id))
    return true
  },

  async bulkDelete(ids) {
    await delay(300)
    const idsToDelete = ids.map(id => parseInt(id))
    contacts = contacts.filter(c => !idsToDelete.includes(c.Id))
    return { deleted: idsToDelete.length }
  },
async updateAvatar(id, avatarData) {
    await delay(200)
    const contactIndex = contacts.findIndex(c => c.Id === parseInt(id))
    if (contactIndex === -1) {
      throw new Error('Contact not found')
    }
    contacts[contactIndex] = {
      ...contacts[contactIndex],
      avatar: avatarData
    }
    return contacts[contactIndex]
  },
async exportToCsv() {
    await delay(100)
    const headers = ['Id', 'Name', 'Email', 'Phone', 'Company', 'Position', 'Created At', 'Last Contacted']
    const csvData = [
      headers.join(','),
      ...contacts.map(contact => [
        contact.Id,
        `"${(contact.name || '').replace(/"/g, '""')}"`,
        `"${(contact.email || '').replace(/"/g, '""')}"`,
        `"${(contact.phone || '').replace(/"/g, '""')}"`,
        `"${(contact.company || '').replace(/"/g, '""')}"`,
        `"${(contact.position || '').replace(/"/g, '""')}"`,
        contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '',
        contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString() : ''
      ].join(','))
    ].join('\n')
    
    return csvData
  }
}