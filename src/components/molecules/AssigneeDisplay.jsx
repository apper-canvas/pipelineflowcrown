import React, { useState, useEffect } from 'react'
import { teamMemberService } from '@/services/api/teamMemberService'

export default function AssigneeDisplay({ assigneeId, size = "sm", showName = false, className = "" }) {
  const [assignee, setAssignee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (assigneeId) {
      loadAssignee()
    } else {
      setLoading(false)
    }
  }, [assigneeId])

  const loadAssignee = async () => {
    try {
      setLoading(true)
      const member = await teamMemberService.getById(assigneeId)
      setAssignee(member)
    } catch (error) {
      console.error('Error loading assignee:', error)
      setAssignee(null)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm", 
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  }

  if (!assigneeId || loading) {
    return null
  }

  if (!assignee) {
    return <div className={`${sizeClasses[size]} rounded-full bg-slate-300 ${className}`}></div>
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {assignee.avatar ? (
        <img 
          src={assignee.avatar} 
          alt={assignee.name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          title={assignee.name}
        />
      ) : (
        <div 
          className={`${sizeClasses[size]} rounded-full bg-primary-500 flex items-center justify-center`}
          title={assignee.name}
        >
          <span className="font-medium text-white">
            {getInitials(assignee.name)}
          </span>
        </div>
      )}
      {showName && (
        <span className="text-sm font-medium text-slate-700">{assignee.name}</span>
      )}
    </div>
  )
}