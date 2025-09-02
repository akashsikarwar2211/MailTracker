import { Shield, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react'

interface EspTypeBadgeProps {
  type: string
}

export function EspTypeBadge({ type }: EspTypeBadgeProps) {
  const getBadgeConfig = (espType: string) => {
    const lowerType = espType.toLowerCase()
    
    // Major email providers
    if (['gmail', 'outlook', 'yahoo', 'icloud'].includes(lowerType)) {
      return {
        color: 'success',
        icon: CheckCircle,
        label: espType,
        description: 'Major Email Provider'
      }
    }
    
    // Business/enterprise providers
    if (['amazon', 'zoho', 'sendgrid', 'mailgun', 'postmark', 'mandrill'].includes(lowerType)) {
      return {
        color: 'primary',
        icon: Shield,
        label: espType,
        description: 'Business Email Service'
      }
    }
    
    // Verified senders
    if (['verified sender', 'corporate'].includes(lowerType)) {
      return {
        color: 'success',
        icon: CheckCircle,
        label: espType,
        description: 'Verified Sender'
      }
    }
    
    // Unknown types
    if (['unknown'].includes(lowerType)) {
      return {
        color: 'warning',
        icon: HelpCircle,
        label: espType,
        description: 'Unknown Provider'
      }
    }
    
    // Default case
    return {
      color: 'info',
      icon: Shield,
      label: espType,
      description: 'Email Service Provider'
    }
  }

  const config = getBadgeConfig(type)
  const IconComponent = config.icon

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-success-100 text-success-800 border-success-200'
      case 'primary':
        return 'bg-primary-100 text-primary-800 border-primary-200'
      case 'warning':
        return 'bg-warning-100 text-warning-800 border-warning-200'
      case 'error':
        return 'bg-error-100 text-error-800 border-error-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border-2 ${getColorClasses(config.color)}`}>
        <IconComponent className="h-4 w-4" />
        <span className="font-semibold text-sm">{config.label}</span>
      </div>
      
      <div className="text-sm text-gray-600">
        <p className="font-medium">{config.description}</p>
        <p className="text-xs text-gray-500">
          Detected from email headers and domain analysis
        </p>
      </div>
    </div>
  )
}
