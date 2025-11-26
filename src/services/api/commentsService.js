import commentsData from '../mockData/comments.json'

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data store
let comments = [...commentsData]

export const commentsService = {
  async getByTaskId(taskId) {
    await delay(200)
    const taskComments = comments.filter(c => c.taskId === parseInt(taskId))
    return taskComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  },

  async getById(id) {
    await delay(100)
    const comment = comments.find(c => c.Id === parseInt(id))
    if (!comment) {
      throw new Error("Comment not found")
    }
    return { ...comment }
  },

  async create(commentData) {
    await delay(300)
    const now = new Date().toISOString()
    const newComment = {
      ...commentData,
      Id: Math.max(...comments.map(c => c.Id), 0) + 1,
      createdAt: now,
      updatedAt: now,
      editHistory: [],
      reactions: {},
      reactionCounts: {},
      likes: 0,
      likedBy: [],
      isPinned: false,
      isResolved: false,
      attachments: commentData.attachments || [],
      mentions: commentData.mentions || [],
      isUnread: false
    }
    
    comments.push(newComment)
    return { ...newComment }
  },

  async update(id, commentData) {
    await delay(300)
    const index = comments.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Comment not found")
    }

    const now = new Date().toISOString()
    const originalComment = comments[index]
    
    // Track edit history if content changed
    const editHistory = [...(originalComment.editHistory || [])]
    if (commentData.content && commentData.content !== originalComment.content) {
      editHistory.push({
        content: originalComment.content,
        editedAt: now,
        editedBy: commentData.authorId || originalComment.authorId
      })
    }

    const updatedComment = {
      ...originalComment,
      ...commentData,
      Id: parseInt(id),
      updatedAt: now,
      editHistory,
      isEdited: commentData.content && commentData.content !== originalComment.content
    }
    
    comments[index] = updatedComment
    return { ...updatedComment }
  },

  async delete(id) {
    await delay(200)
    const index = comments.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Comment not found")
    }
    
    // Also delete all replies to this comment
    const commentToDelete = comments[index]
    const repliesToDelete = comments.filter(c => c.parentCommentId === commentToDelete.Id)
    
    comments = comments.filter(c => 
      c.Id !== parseInt(id) && 
      c.parentCommentId !== parseInt(id)
    )
    
    return { deleted: 1 + repliesToDelete.length }
  },

  async addReaction(commentId, emoji, userId) {
    await delay(100)
    const index = comments.findIndex(c => c.Id === parseInt(commentId))
    if (index === -1) {
      throw new Error("Comment not found")
    }

    const comment = comments[index]
    const reactions = { ...(comment.reactions || {}) }
    const reactionCounts = { ...(comment.reactionCounts || {}) }

    if (!reactions[emoji]) {
      reactions[emoji] = []
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId)
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1
    }

    const updatedComment = {
      ...comment,
      reactions,
      reactionCounts,
      updatedAt: new Date().toISOString()
    }

    comments[index] = updatedComment
    return { ...updatedComment }
  },

  async removeReaction(commentId, emoji, userId) {
    await delay(100)
    const index = comments.findIndex(c => c.Id === parseInt(commentId))
    if (index === -1) {
      throw new Error("Comment not found")
    }

    const comment = comments[index]
    const reactions = { ...(comment.reactions || {}) }
    const reactionCounts = { ...(comment.reactionCounts || {}) }

    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId)
      reactionCounts[emoji] = Math.max(0, (reactionCounts[emoji] || 0) - 1)
      
      if (reactions[emoji].length === 0) {
        delete reactions[emoji]
        delete reactionCounts[emoji]
      }
    }

    const updatedComment = {
      ...comment,
      reactions,
      reactionCounts,
      updatedAt: new Date().toISOString()
    }

    comments[index] = updatedComment
    return { ...updatedComment }
  },

  async toggleLike(commentId, userId) {
    await delay(100)
    const index = comments.findIndex(c => c.Id === parseInt(commentId))
    if (index === -1) {
      throw new Error("Comment not found")
    }

    const comment = comments[index]
    const likedBy = [...(comment.likedBy || [])]
    const isLiked = likedBy.includes(userId)

    const updatedComment = {
      ...comment,
      likedBy: isLiked ? likedBy.filter(id => id !== userId) : [...likedBy, userId],
      likes: isLiked ? Math.max(0, comment.likes - 1) : (comment.likes || 0) + 1,
      updatedAt: new Date().toISOString()
    }

    comments[index] = updatedComment
    return { ...updatedComment }
  },

  async togglePin(commentId, userId) {
    await delay(100)
    const index = comments.findIndex(c => c.Id === parseInt(commentId))
    if (index === -1) {
      throw new Error("Comment not found")
    }

    const comment = comments[index]
    const updatedComment = {
      ...comment,
      isPinned: !comment.isPinned,
      pinnedBy: comment.isPinned ? null : userId,
      pinnedAt: comment.isPinned ? null : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    comments[index] = updatedComment
    return { ...updatedComment }
  },

  async toggleResolve(commentId, userId) {
    await delay(100)
    const index = comments.findIndex(c => c.Id === parseInt(commentId))
    if (index === -1) {
      throw new Error("Comment not found")
    }

    const comment = comments[index]
    const updatedComment = {
      ...comment,
      isResolved: !comment.isResolved,
      resolvedBy: comment.isResolved ? null : userId,
      resolvedAt: comment.isResolved ? null : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    comments[index] = updatedComment
    return { ...updatedComment }
  },

  async search(taskId, query) {
    await delay(200)
    const taskComments = comments.filter(c => c.taskId === parseInt(taskId))
    
    if (!query.trim()) {
      return taskComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }

    const filtered = taskComments.filter(comment => 
      comment.content.toLowerCase().includes(query.toLowerCase()) ||
      comment.authorName.toLowerCase().includes(query.toLowerCase())
    )

    return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  },

  async getCommentCount(taskId) {
    await delay(50)
    return comments.filter(c => c.taskId === parseInt(taskId)).length
  },

  async getUnreadCount(taskId, userId) {
    await delay(50)
    return comments.filter(c => 
      c.taskId === parseInt(taskId) && 
      c.isUnread && 
      c.authorId !== userId
    ).length
  },

  async markAsRead(commentIds, userId) {
    await delay(100)
    let updatedCount = 0
    
    commentIds.forEach(commentId => {
      const index = comments.findIndex(c => c.Id === parseInt(commentId))
      if (index !== -1 && comments[index].authorId !== userId) {
        comments[index] = {
          ...comments[index],
          isUnread: false,
          readBy: [...(comments[index].readBy || []), userId],
          readAt: new Date().toISOString()
        }
        updatedCount++
      }
    })

    return { markedAsRead: updatedCount }
  }
}

export default commentsService