import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import SearchBar from "@/components/molecules/SearchBar"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import { contactService } from "@/services/api/contactService"
import { format } from "date-fns"

const ContactModal = ({ isOpen, contact, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    tags: []
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (contact) {
      setFormData(contact)
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        tags: []
      })
    }
  }, [contact])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    setSaving(true)
    try {
      const savedContact = contact
        ? await contactService.update(contact.Id, formData)
        : await contactService.create(formData)
      
      onSave(savedContact)
      toast.success(contact ? "Contact updated successfully" : "Contact created successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save contact")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {contact ? "Edit Contact" : "New Contact"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ApperIcon name="X" className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="John Doe"
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="john@company.com"
          />
          
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="+1 (555) 123-4567"
          />
          
          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            placeholder="Acme Inc."
          />
          
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
            placeholder="Sales Manager"
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Saving..." : contact ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Contacts = () => {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedContact, setSelectedContact] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredContacts(
        contacts.filter(contact =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredContacts(contacts)
    }
  }, [contacts, searchTerm])

  const loadContacts = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await contactService.getAll()
      setContacts(data)
    } catch (err) {
      setError("Failed to load contacts")
    } finally {
      setLoading(false)
    }
  }

  const handleContactSave = (savedContact) => {
    if (selectedContact) {
      setContacts(contacts.map(c => c.Id === savedContact.Id ? savedContact : c))
    } else {
      setContacts([savedContact, ...contacts])
    }
  }

  const handleDelete = async (contactId) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        await contactService.delete(contactId)
        setContacts(contacts.filter(c => c.Id !== contactId))
        toast.success("Contact deleted successfully")
      } catch (error) {
        toast.error("Failed to delete contact")
      }
    }
  }

  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) return <Loading type="skeleton" />
  if (error) return <ErrorView message={error} onRetry={loadContacts} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Contacts</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your customer relationships and contact information.
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedContact(null)
            setIsModalOpen(true)
          }}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Contact</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search contacts by name, company, or email..."
            onSearch={setSearchTerm}
          />
        </div>
        <select className="input-field w-full sm:w-auto">
          <option>All Contacts</option>
          <option>Recent Contacts</option>
          <option>My Contacts</option>
        </select>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <Empty 
          icon="Users"
          title={searchTerm ? "No contacts found" : "No contacts yet"}
          message={searchTerm ? "Try adjusting your search terms." : "Start building your customer database by adding your first contact."}
          actionLabel="Add Contact"
          onAction={() => {
            setSelectedContact(null)
            setIsModalOpen(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <div key={contact.Id} className="card hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {getInitials(contact.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {contact.name}
                    </h3>
                    {contact.position && contact.company && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {contact.position} at {contact.company}
                      </p>
                    )}
                    {contact.email && (
                      <p className="text-sm text-slate-500 dark:text-slate-500 truncate">
                        {contact.email}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedContact(contact)
                      setIsModalOpen(true)
                    }}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                  >
                    <ApperIcon name="Edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(contact.Id)
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                  {contact.phone && (
                    <a 
                      href={`tel:${contact.phone}`}
                      className="flex items-center space-x-1 hover:text-primary-600 transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ApperIcon name="Phone" className="h-4 w-4" />
                      <span>Call</span>
                    </a>
                  )}
                  {contact.email && (
                    <a 
                      href={`mailto:${contact.email}`}
                      className="flex items-center space-x-1 hover:text-primary-600 transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ApperIcon name="Mail" className="h-4 w-4" />
                      <span>Email</span>
                    </a>
                  )}
                </div>
                
                {contact.lastContactedAt && (
                  <div className="text-xs text-slate-400">
                    Last contact: {format(new Date(contact.lastContactedAt), "MMM d")}
                  </div>
                )}
              </div>

              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {contact.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {contact.tags.length > 2 && (
                    <Badge variant="default" size="sm">
                      +{contact.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        contact={selectedContact}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedContact(null)
        }}
        onSave={handleContactSave}
      />
    </div>
  )
}

export default Contacts