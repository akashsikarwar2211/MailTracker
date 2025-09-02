import { useState } from 'react'
import { Mail, Calendar, User, Search, Filter } from 'lucide-react'
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
}

export function EmailHistory({ emails }: EmailHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEsp, setFilterEsp] = useState('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'subject' | 'espType'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No emails processed yet</h3>
        <p className="text-gray-500">
          Emails will appear here once they are received and processed by the system.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails by subject, sender, or recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* ESP Filter */}
          <div className="sm:w-48">
            <select
              value={filterEsp}
              onChange={(e) => setFilterEsp(e.target.value)}
              className="input-field"
            >
              <option value="all">All ESP Types</option>
              {uniqueEspTypes.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-field"
            >
              <option value="timestamp">Sort by Date</option>
              <option value="subject">Sort by Subject</option>
              <option value="espType">Sort by ESP</option>
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary px-3"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredEmails.length} of {emails.length} emails
        </p>
        {searchTerm && (
          <p className="text-sm text-gray-500">
            Filtered by: "{searchTerm}"
          </p>
        )}
      </div>

      {/* Email List */}
      <div className="space-y-4">
        {filteredEmails.map((email) => (
          <div key={email.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-4">
              {/* Email Icon */}
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary-600" />
                </div>
              </div>

              {/* Email Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {email.subject || 'No Subject'}
                    </h3>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span className="truncate">{email.from || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(email.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* ESP Badge */}
                  <div className="ml-4 flex-shrink-0">
                    <EspTypeBadge type={email.espType} />
                  </div>
                </div>

                {/* Receiving Chain Preview */}
                {email.receivingChain.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Route:</span>{' '}
                    <span className="font-mono">
                      {email.receivingChain.slice(0, 3).join(' → ')}
                      {email.receivingChain.length > 3 && ' → ...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredEmails.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}
    </div>
  )
}
