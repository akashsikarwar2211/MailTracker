import { useState, useEffect } from 'react'
import { Mail, Calendar, User, Search, Filter, RefreshCw, X, ChevronDown, SortAsc, SortDesc } from 'lucide-react'
import { format } from 'date-fns'
import { EspTypeBadge } from './EspTypeBadge'

interface EmailData {
  id: string
  subject?: string
  from?: string
  to?: string
  timestamp: string
  espType: string
  receivingChain: string[]
}

interface EmailHistoryProps {
  emails: EmailData[]
  onSelectEmail?: (id: string) => void
  onRefresh?: () => void
  isLoading?: boolean
}

export function EmailHistory({ emails, onSelectEmail, onRefresh, isLoading }: EmailHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEsp, setFilterEsp] = useState('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'subject' | 'espType'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchAnimation, setSearchAnimation] = useState(false)
  const [filterAnimation, setFilterAnimation] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return 'Invalid date'
    }
  }

  const filteredEmails = emails
    .filter(email => {
      const matchesSearch = 
        email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.to?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesEsp = filterEsp === 'all' || email.espType.toLowerCase() === filterEsp.toLowerCase()
      
      return matchesSearch && matchesEsp
    })
    .sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case 'subject':
          aValue = a.subject || ''
          bValue = b.subject || ''
          break
        case 'espType':
          aValue = a.espType
          bValue = b.espType
          break
        default:
          aValue = a.timestamp
          bValue = b.timestamp
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const uniqueEspTypes = Array.from(new Set(emails.map(email => email.espType)))

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          setSearchAnimation(true)
          setTimeout(() => setSearchAnimation(false), 1000)
        }
      }
      // Escape to clear search
      if (e.key === 'Escape') {
        setSearchTerm('')
        setFilterEsp('all')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Trigger filter animation when filters change
  useEffect(() => {
    if (searchTerm || filterEsp !== 'all') {
      setFilterAnimation(true)
      const timer = setTimeout(() => setFilterAnimation(false), 500)
      return () => clearTimeout(timer)
    }
  }, [searchTerm, filterEsp])

  if (emails.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Mail className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Emails Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
          Your email history will appear here once emails are received and processed by the system. 
          Click the refresh button to check for new emails.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Check for New Emails
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with refresh button */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Email History</h2>
                <p className="text-sm text-gray-600">
                  Latest {emails.length} emails from your Gmail account
                </p>
              </div>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {/* Header with enhanced styling */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Filter className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Search & Filters</h3>
            <p className="text-sm text-gray-600">Find and organize your emails efficiently</p>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Enhanced Search with better styling */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <Search className="h-4 w-4 text-primary-500" />
              <span>Search Emails</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">⌘K</span>
            </label>
            <div className={`relative group ${searchAnimation ? 'animate-pulse' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400 group-focus-within:text-primary-500 transition-all duration-200 ${isSearchFocused ? 'scale-110' : ''}`} />
                <input
                  type="text"
                  placeholder="Search by subject, sender, or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full px-5 py-4 pl-12 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 text-gray-900 placeholder-gray-400 ${isSearchFocused ? 'shadow-lg transform scale-[1.02]' : ''}`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {searchTerm && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 animate-fade-in">
                <div className="h-1.5 w-1.5 bg-primary-400 rounded-full animate-pulse"></div>
                <span>Searching for: <span className="font-semibold text-primary-600">"{searchTerm}"</span></span>
                <span className="text-gray-400">• {filteredEmails.length} results</span>
              </div>
            )}
          </div>

          {/* Enhanced ESP Filter with better styling */}
          <div className="lg:w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span>ESP Type</span>
            </label>
            <div className={`relative group ${filterAnimation ? 'animate-bounce' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
              <div className="relative">
                <select
                  value={filterEsp}
                  onChange={(e) => setFilterEsp(e.target.value)}
                  className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-900 appearance-none cursor-pointer hover:shadow-lg hover:border-blue-300 hover:bg-blue-50/30 font-medium"
                >
                  <option value="all" className="py-3 px-2 text-gray-700 font-medium">All ESP Types</option>
                  {uniqueEspTypes.map(esp => (
                    <option key={esp} value={esp} className="py-3 px-2 text-gray-700 font-medium hover:bg-blue-100">{esp}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-all duration-200 group-hover:scale-110 group-focus-within:text-blue-500">
                  <ChevronDown className="h-4 w-4 text-gray-400 transition-colors duration-200" />
                </div>
              </div>
            </div>
            {filterEsp !== 'all' && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600 animate-fade-in">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Filtered by: <span className="font-semibold">{filterEsp}</span></span>
              </div>
            )}
          </div>

          {/* Enhanced Sort with arrows */}
          <div className="lg:w-32">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Sort</span>
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative group flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 text-gray-900 appearance-none cursor-pointer text-sm font-medium hover:shadow-lg hover:border-green-300 hover:bg-green-50/30"
                >
                  <option value="timestamp" className="py-2 text-gray-700 font-medium">Date</option>
                  <option value="subject" className="py-2 text-gray-700 font-medium">Subject</option>
                  <option value="espType" className="py-2 text-gray-700 font-medium">ESP</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </div>
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
                title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4 text-gray-600 group-hover:text-green-600 transition-colors duration-200" />
                ) : (
                  <SortDesc className="h-4 w-4 text-gray-600 group-hover:text-green-600 transition-colors duration-200" />
                )}
              </button>
            </div>
          </div>
        </div>


      </div>

      {/* Active Filters Summary */}
      {(searchTerm || filterEsp !== 'all') && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <span className="text-sm font-semibold text-primary-800">Active Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1.5 bg-primary-100 text-primary-800 text-sm font-medium rounded-lg">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 h-4 w-4 text-primary-600 hover:text-primary-800 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            {filterEsp !== 'all' && (
              <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg">
                ESP: {filterEsp}
                <button
                  onClick={() => setFilterEsp('all')}
                  className="ml-2 h-4 w-4 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterEsp('all')
              }}
              className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Results Count */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-900">
                Showing {filteredEmails.length} of {emails.length} emails
              </span>
            </div>
            {searchTerm && (
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm text-indigo-700">
                  Filtered by: <span className="font-semibold">"{searchTerm}"</span>
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-600 font-medium">Last updated</div>
            <div className="text-sm text-blue-800">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Enhanced Email List */}
      <div className="space-y-4">
        {filteredEmails.map((email, index) => (
          <button
            key={email.id}
            onClick={() => onSelectEmail && onSelectEmail(email.id)}
            className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1 w-full group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start space-x-4">
              {/* Enhanced Email Icon */}
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Enhanced Email Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors duration-200">
                      {email.subject || 'No Subject'}
                    </h3>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <User className="h-4 w-4 text-primary-500" />
                        <span className="truncate font-medium">{email.from || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary-500" />
                        <span className="font-medium">{formatDate(email.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced ESP Badge */}
                  <div className="ml-4 flex-shrink-0">
                    <EspTypeBadge type={email.espType} />
                  </div>
                </div>

                {/* Enhanced Receiving Chain Preview */}
                {email.receivingChain.length > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Email Route</span>
                    </div>
                    <div className="text-sm text-gray-700 font-mono">
                      {email.receivingChain.slice(0, 3).map((server, i) => (
                        <span key={i}>
                          <span className="text-primary-600 font-semibold">{server}</span>
                          {i < Math.min(3, email.receivingChain.length - 1) && (
                            <span className="mx-2 text-gray-400">→</span>
                          )}
                    </span>
                      ))}
                      {email.receivingChain.length > 3 && (
                        <span className="text-gray-500">... ({email.receivingChain.length - 3} more)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Enhanced No Results */}
      {filteredEmails.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Results Found</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            No emails match your current search and filter criteria. Try adjusting your search terms or filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterEsp('all')
            }}
            className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
