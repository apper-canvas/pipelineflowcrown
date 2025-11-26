// Mock team member data for assignment functionality
const teamMembers = [
  {
    Id: 1,
    name: "Current User",
    email: "current.user@company.com",
    avatar: null,
    role: "Sales Manager",
    department: "Sales",
    isCurrentUser: true
  },
  {
    Id: 2,
    name: "John Smith",
    email: "john.smith@company.com",
    avatar: null,
    role: "Sales Representative",
    department: "Sales",
    isCurrentUser: false
  },
  {
    Id: 3,
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    avatar: null,
    role: "Account Manager",
    department: "Sales",
    isCurrentUser: false
  },
  {
    Id: 4,
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    avatar: null,
    role: "Business Development Rep",
    department: "Sales",
    isCurrentUser: false
  }
]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const teamMemberService = {
  async getAll() {
    await delay(200)
    return [...teamMembers]
  },

  async getById(id) {
    await delay(200)
    const member = teamMembers.find(m => m.Id === parseInt(id))
    if (!member) {
      throw new Error("Team member not found")
    }
    return { ...member }
  },

  getCurrentUser() {
    return teamMembers.find(m => m.isCurrentUser) || teamMembers[0]
  }
}