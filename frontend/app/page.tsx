'use client'

import { useState, useEffect } from 'react'
import { Mail, Server, Shield, Activity, RefreshCw, AlertCircle } from 'lucide-react'
import { EmailAnalysis } from '@/components/EmailAnalysis'
import { ReceivingChain } from '@/components/ReceivingChain'
import { EspTypeBadge } from '@/components/EspTypeBadge'
import { StatsCard } from '@/components/StatsCard'
import { EmailHistory } from '@/components/EmailHistory'
import { useEmailData } from '@/hooks/useEmailData'

export default function Dashboard() {
  const { 
    latestEmail, 
    emailHistory, 
    stats, 
    isLoading, 
    error, 
    refetch 
  } = useEmailData()

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'stats'>('overview')

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-error-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the email analysis service.
          </p>
          <button 
            onClick={refetch}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">InspMail</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refetch}
                disabled={isLoading}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'history', label: 'History', icon: Mail },
              { id: 'stats', label: 'Statistics', icon: Server },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Emails"
                value={stats?.totalEmails || 0}
                icon={Mail}
                color="primary"
              />
              <StatsCard
                title="Active ESPs"
                value={stats?.espTypes ? Object.keys(stats.espTypes).length : 0}
                icon={Shield}
                color="success"
              />
              <StatsCard
                title="Processing Status"
                value={latestEmail ? 'Active' : 'Idle'}
                icon={Activity}
                color={latestEmail ? 'success' : 'warning'}
              />
              <StatsCard
                title="Last Update"
                value={latestEmail ? new Date(latestEmail.timestamp).toLocaleTimeString() : 'Never'}
                icon={RefreshCw}
                color="info"
              />
            </div>

            {/* Latest Email Analysis */}
            {latestEmail && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary-600" />
                  <span>Latest Email Analysis</span>
                </h2>
                <EmailAnalysis email={latestEmail} />
              </div>
            )}

            {/* Receiving Chain Visualization */}
            {latestEmail && latestEmail.receivingChain.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Server className="h-5 w-5 text-primary-600" />
                  <span>Email Receiving Chain</span>
                </h2>
                <ReceivingChain chain={latestEmail.receivingChain} />
              </div>
            )}

            {/* ESP Type Information */}
            {latestEmail && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary-600" />
                  <span>Email Service Provider</span>
                </h2>
                <div className="flex items-center space-x-4">
                  <EspTypeBadge type={latestEmail.espType} />
                  <div>
                    <p className="text-sm text-gray-600">
                      Detected from domain analysis and header inspection
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <EmailHistory emails={emailHistory?.emails || []} />
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">ESP Distribution</h2>
              {stats?.espTypes && (
                <div className="space-y-4">
                  {Object.entries(stats.espTypes).map(([esp, count]) => (
                    <div key={esp} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{esp}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${(count / stats.totalEmails) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              {stats?.recentActivity && (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.date} className="flex items-center justify-between">
                      <span className="text-gray-700">{activity.date}</span>
                      <span className="font-medium text-primary-600">{activity.count} emails</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
