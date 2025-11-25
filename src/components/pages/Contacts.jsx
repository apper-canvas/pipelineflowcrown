import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";

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
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        position: contact.position || "",
        tags: contact.tags || []
      })
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
    
    // Validate required fields
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
      toast.error(error.message || "Failed to save contact")
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

<form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
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
              type="tel"
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
              label="Job Title"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              placeholder="Sales Manager"
            />
          </div>
          
          <div className="text-xs text-slate-500 mt-2">
            * Required field
          </div>

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

const DeleteConfirmModal = ({ isOpen, contactName, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Delete Contact</h3>
          </div>
          
          <p className="text-slate-600 mb-6">
            Are you sure you want to delete <span className="font-semibold">{contactName}</span>? 
            This action cannot be undone.
          </p>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, contact: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedContact, setExpandedContact] = useState(null)
  useEffect(() => {
loadContacts()
  }, [])

useEffect(() => {
    if (searchTerm) {
      setFilteredContacts(
        contacts.filter(contact =>
          contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDelete = (contact) => {
    setDeleteModal({ isOpen: true, contact })
  }

  const confirmDelete = async () => {
    if (!deleteModal.contact) return
    
    setIsDeleting(true)
    try {
      await contactService.delete(deleteModal.contact.Id)
      setContacts(contacts.filter(c => c.Id !== deleteModal.contact.Id))
      toast.success("Contact deleted successfully")
      setDeleteModal({ isOpen: false, contact: null })
    } catch (error) {
      toast.error(error.message || "Failed to delete contact")
} finally {
      setIsDeleting(false)
    }
  }

const getInitials = (name) => {
    if (!name) return "??"
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
            placeholder="Search contacts by name, company, email, or phone..."
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
            <div 
              key={contact.Id} 
              className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => setExpandedContact(expandedContact === contact.Id ? null : contact.Id)}
            >
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
                    {!expandedContact || expandedContact !== contact.Id ? (
                      contact.email && (
                        <p className="text-sm text-slate-500 dark:text-slate-500 truncate">
                          {contact.email}
                        </p>
                      )
                    ) : null}
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
                    title="Edit contact"
                  >
                    <ApperIcon name="Edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(contact)
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete contact"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedContact === contact.Id && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-slide-up">
                  {contact.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Mail" className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-primary-600 hover:text-primary-700 break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Phone" className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-primary-600 hover:text-primary-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  
                  {contact.company && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Building2" className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">{contact.company}</span>
                    </div>
                  )}
                  
                  {contact.position && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Briefcase" className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">{contact.position}</span>
                    </div>
                  )}
                  
                  {contact.createdAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Calendar" className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500 dark:text-slate-500">
                        Added {format(new Date(contact.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              )}

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
                  
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 hover:text-primary-600 transition-colors duration-200"
                  >
                    <ApperIcon name={expandedContact === contact.Id ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
                    <span>{expandedContact === contact.Id ? "Less" : "More"}</span>
                  </button>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        contactName={deleteModal.contact?.name}
        onClose={() => setDeleteModal({ isOpen: false, contact: null })}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
)
}

export default Contacts