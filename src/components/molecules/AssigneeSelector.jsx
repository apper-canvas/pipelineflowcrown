import React, { useState, useEffect } from 'react'
import ApperIcon from '@/components/ApperIcon'
import { teamMemberService } from '@/services/api/teamMemberService'

export default function AssigneeSelector({ value, values, onChange, placeholder = "Assign to...", multiple = false, className = "" }) {
  const [teamMembers, setTeamMembers] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      setLoading(true)
      const data = await teamMemberService.getAll()
      setTeamMembers(data)
    } catch (error) {
      console.error('Error loading team members:', error)
    } finally {
      setLoading(false)
    }
  }

const selectedMember = multiple ? null : teamMembers.find(m => m.Id === value)
  const selectedMembers = multiple && values ? teamMembers.filter(m => values.includes(m.Id)) : []
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

const handleSelect = (memberId) => {
    if (multiple && values) {
      const newValues = values.includes(memberId) 
        ? values.filter(id => id !== memberId)
        : [...values, memberId]
      onChange(newValues)
    } else {
      onChange(memberId)
      setIsOpen(false)
      setSearchTerm("")
    }
  }

const handleUnassign = () => {
    onChange(multiple ? [] : null)
    setIsOpen(false)
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-field flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center space-x-2">
{multiple && selectedMembers.length > 0 ? (
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                {selectedMembers.slice(0, 3).map((member) => (
                  member.avatar ? (
                    <img 
                      key={member.Id}
                      src={member.avatar} 
                      alt={member.name}
                      className="w-6 h-6 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div key={member.Id} className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center border-2 border-white">
                      <span className="text-xs font-medium text-white">
                        {getInitials(member.name)}
                      </span>
                    </div>
                  )
                ))}
                {selectedMembers.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center border-2 border-white">
                    <span className="text-xs font-medium text-white">+{selectedMembers.length - 3}</span>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">
                {selectedMembers.length === 1 ? selectedMembers[0].name : `${selectedMembers.length} assigned`}
              </span>
            </div>
          ) : selectedMember ? (
            <>
              {selectedMember.avatar ? (
                <img 
                  src={selectedMember.avatar} 
                  alt={selectedMember.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {getInitials(selectedMember.name)}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium">{selectedMember.name}</span>
            </>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        <ApperIcon name="ChevronDown" className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-slate-200">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-slate-500">Loading...</div>
            ) : (
              <>
{(value || (multiple && values && values.length > 0)) && (
                  <button
                    type="button"
                    onClick={handleUnassign}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-red-600"
                  >
                    <ApperIcon name="UserMinus" className="w-4 h-4" />
                    <span className="text-sm">Unassign</span>
                  </button>
                )}
                
                {filteredMembers.map(member => (
<button
                    key={member.Id}
                    type="button"
                    onClick={() => handleSelect(member.Id)}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center space-x-3 ${
                      (multiple ? values?.includes(member.Id) : value === member.Id) ? 'bg-primary-50 text-primary-700' : ''
                    }`}
                  >
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {getInitials(member.name)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.role}</div>
                    </div>
                  </button>
                ))}
                
                {filteredMembers.length === 0 && (
                  <div className="p-3 text-center text-slate-500">No team members found</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}