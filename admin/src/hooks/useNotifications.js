import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:5000'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/notifications`, { credentials: 'include' })
      const data = await res.json()
      setNotifications(
        (data.notifications || []).map(n => ({
          id:      n.id,
          name:    n.title,
          message: n.message,
          unread:  !n.isRead,
          url:     n.url,
        }))
      )
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
      })
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }, [])

  const deleteNotification = useCallback(async (id) => {
    try {
      await fetch(`${API}/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }, [])

  const clearAll = useCallback(async () => {
    try {
      await Promise.all(
        notifications.map(n =>
          fetch(`${API}/notifications/${n.id}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        )
      )
      setNotifications([])
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    }
  }, [notifications])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  return { notifications, loading, markAllAsRead, deleteNotification, clearAll, refetch: fetchNotifications }
}