import { useState, useEffect, useCallback } from 'react'

interface EmailData {
  id: string
  rawHeaders: string
  receivingChain: string[]
  espType: string
  timestamp: string
  subject?: string
  from?: string
  to?: string
  receivedAt?: string
  errorMessage?: string
}

interface EmailHistory {
  emails: EmailData[]
  total: number
  page: number
  totalPages: number
}

interface Stats {
  totalEmails: number
  espTypes: { [key: string]: number }
  recentActivity: { date: string; count: number }[]
}

interface UseEmailDataReturn {
  latestEmail: EmailData | null
  emailHistory: EmailHistory | null
  stats: Stats | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export function useEmailData(): UseEmailDataReturn {
  const [latestEmail, setLatestEmail] = useState<EmailData | null>(null)
  const [emailHistory, setEmailHistory] = useState<EmailHistory | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLatestEmail = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/latest`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setLatestEmail(data.data)
      }
    } catch (err) {
      console.error('Error fetching latest email:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch latest email')
    }
  }, [])

  const fetchEmailHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/history?page=1&limit=10`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setEmailHistory(data.data)
      }
    } catch (err) {
      console.error('Error fetching email history:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch email history')
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/stats/dashboard`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
    }
  }, [])

  const fetchAllData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        fetchLatestEmail(),
        fetchEmailHistory(),
        fetchStats(),
      ])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchLatestEmail, fetchEmailHistory, fetchStats])

  const refetch = useCallback(() => {
    fetchAllData()
  }, [fetchAllData])

  // Initial data fetch
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Set up polling for latest email (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestEmail()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchLatestEmail])

  return {
    latestEmail,
    emailHistory,
    stats,
    isLoading,
    error,
    refetch,
  }
}
