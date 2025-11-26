import React, { useState, useRef, useEffect } from 'react'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your comment...",
  teamMembers = [],
  minHeight = "120px",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionIndex, setMentionIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef(null)

  const handleTextareaChange = (e) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart
    
    onChange(newValue)
    setCursorPosition(cursorPos)
    
    // Check for @mentions
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
      setShowMentions(true)
      setMentionIndex(0)
    } else {
      setShowMentions(false)
    }
  }

  const handleKeyDown = (e) => {
    if (showMentions) {
      const filteredMembers = teamMembers.filter(member =>
        member.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex(Math.min(mentionIndex + 1, filteredMembers.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex(Math.max(mentionIndex - 1, 0))
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        if (filteredMembers[mentionIndex]) {
          insertMention(filteredMembers[mentionIndex])
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false)
      }
    }

    // Handle shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault()
        wrapSelection('**', '**')
      } else if (e.key === 'i') {
        e.preventDefault()
        wrapSelection('*', '*')
      } else if (e.key === 'k') {
        e.preventDefault()
        wrapSelection('[link text](', ')')
      }
    }
  }

  const insertMention = (member) => {
    const textarea = textareaRef.current
    const beforeMention = value.slice(0, cursorPosition - mentionQuery.length - 1)
    const afterMention = value.slice(cursorPosition)
    const newValue = `${beforeMention}@${member.name} ${afterMention}`
    
    onChange(newValue)
    setShowMentions(false)
    
    // Set cursor position after mention
    setTimeout(() => {
      const newCursorPos = beforeMention.length + member.name.length + 2
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const wrapSelection = (prefix, suffix) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.slice(start, end)
    
    const newValue = 
      value.slice(0, start) + 
      prefix + selectedText + suffix + 
      value.slice(end)
    
    onChange(newValue)
    
    setTimeout(() => {
      const newStart = start + prefix.length
      const newEnd = newStart + selectedText.length
      textarea.setSelectionRange(newStart, newEnd)
      textarea.focus()
    }, 0)
  }

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    const newValue = value.slice(0, start) + text + value.slice(end)
    onChange(newValue)
    
    setTimeout(() => {
      const newCursorPos = start + text.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5)

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => wrapSelection('**', '**')}
            title="Bold (Ctrl+B)"
          >
            <ApperIcon name="Bold" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => wrapSelection('*', '*')}
            title="Italic (Ctrl+I)"
          >
            <ApperIcon name="Italic" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => wrapSelection('`', '`')}
            title="Code"
          >
            <ApperIcon name="Code" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => wrapSelection('[link text](', ')')}
            title="Link (Ctrl+K)"
          >
            <ApperIcon name="Link" className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('\n- ')}
            title="Bullet List"
          >
            <ApperIcon name="List" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('\n1. ')}
            title="Numbered List"
          >
            <ApperIcon name="ListOrdered" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('> ')}
            title="Quote"
          >
            <ApperIcon name="Quote" className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-slate-500">
            {value.length} characters
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <ApperIcon 
              name={isExpanded ? "Minimize" : "Maximize"} 
              className="h-4 w-4" 
            />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ minHeight }}
          className={`w-full p-3 border-0 resize-none focus:outline-none bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 ${
            isExpanded ? 'min-h-[240px]' : ''
          }`}
        />
        
        {/* Mention dropdown */}
        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-w-xs w-full">
            {filteredMembers.map((member, index) => (
              <button
                key={member.Id}
                type="button"
                onClick={() => insertMention(member)}
                className={`w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2 ${
                  index === mentionIndex ? 'bg-slate-100 dark:bg-slate-700' : ''
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {member.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {member.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500">
        <div className="flex flex-wrap gap-4">
          <span>**bold**</span>
          <span>*italic*</span>
          <span>`code`</span>
          <span>[link](url)</span>
          <span>@mention</span>
          <span>> quote</span>
        </div>
      </div>
    </div>
  )
}

export default RichTextEditor