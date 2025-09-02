import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'primary' | 'success' | 'warning' | 'error' | 'info'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary-50',
          icon: 'text-primary-600',
          border: 'border-primary-200',
          value: 'text-primary-900'
        }
      case 'success':
        return {
          bg: 'bg-success-50',
          icon: 'text-success-600',
          border: 'border-success-200',
          value: 'text-success-900'
        }
      case 'warning':
        return {
          bg: 'bg-warning-50',
          icon: 'text-warning-600',
          border: 'border-warning-200',
          value: 'text-warning-900'
        }
      case 'error':
        return {
          bg: 'bg-error-50',
          icon: 'text-error-600',
          border: 'border-error-200',
          value: 'text-error-900'
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          icon: 'text-blue-600',
          border: 'border-blue-200',
          value: 'text-blue-900'
        }
      default:
        return {
          bg: 'bg-gray-50',
          icon: 'text-gray-600',
          border: 'border-gray-200',
          value: 'text-gray-900'
        }
    }
  }

  const colors = getColorClasses(color)

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className={`text-3xl font-bold ${colors.value}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {trend && (
            <div className="flex items-center space-x-1 mt-2">
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-success-600' : 'text-error-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500">from last period</span>
            </div>
          )}
        </div>
        
        <div className={`${colors.icon} p-3 rounded-lg bg-white/50`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
