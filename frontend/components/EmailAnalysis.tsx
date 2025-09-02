import { Mail, User, Calendar, FileText, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface EmailData {
  id: string
  subject?: string
  from?: string
  to?: string
  timestamp: string
  receivedAt?: string
  errorMessage?: string
}

interface EmailAnalysisProps {
  email: EmailData
}

export function EmailAnalysis({ email }: EmailAnalysisProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-primary-600 mt-0.5" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <p className="text-gray-900 font-medium">
                {email.subject || 'No subject'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-primary-600 mt-0.5" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <p className="text-gray-900">
                {email.from || 'Unknown sender'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-primary-600 mt-0.5" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <p className="text-gray-900">
                {email.to || 'Unknown recipient'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-primary-600 mt-0.5" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processed At
              </label>
              <p className="text-gray-900">
                {formatDate(email.timestamp)}
              </p>
            </div>
          </div>

          {email.receivedAt && (
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary-600 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Received At
                </label>
                <p className="text-gray-900">
                  {formatDate(email.receivedAt)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-primary-600 mt-0.5" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email ID
              </label>
              <p className="text-gray-900 font-mono text-sm">
                {email.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message (if any) */}
      {email.errorMessage && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-error-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-error-800">
                Processing Error
              </h3>
              <p className="text-sm text-error-700 mt-1">
                {email.errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Status */}
      <div className="bg-success-50 border border-success-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-success-800">
            Email successfully processed and analyzed
          </span>
        </div>
      </div>
    </div>
  )
}
