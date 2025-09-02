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
    refetch,
    refetchHistory 
  } = useEmailData()

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'stats'>('overview')
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const selectedEmail = selectedEmailId
    ? emailHistory?.emails.find(e => e.id === selectedEmailId) || latestEmail
    : latestEmail

  // Auto-select latest email when available (and nothing is selected)
  useEffect(() => {
    if (!selectedEmailId && latestEmail?.id) {
      setSelectedEmailId(latestEmail.id)
    }
  }, [latestEmail?.id, selectedEmailId])

  // Update selected email when latest email changes (for refresh)
  useEffect(() => {
    if (latestEmail?.id) {
      setSelectedEmailId(latestEmail.id)
    }
  }, [latestEmail?.id])



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
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                onClick={async () => {
                  setIsRefreshing(true);
                  setSelectedEmailId(null);
                  
                  try {
                    // Force refresh all data
                    await refetch();
                  } catch (error) {
                    console.error('Refresh failed:', error);
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                disabled={isLoading || isRefreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
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
            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Emails</p>
                    <p className="text-3xl font-bold text-blue-900">{stats?.totalEmails || 0}</p>
                    <p className="text-xs text-blue-500 mt-1">Processed & Analyzed</p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-bounce-in">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Active ESPs</p>
                    <p className="text-3xl font-bold text-green-900">
                      {stats?.espTypes ? Object.keys(stats.espTypes).length : 0}
                    </p>
                    <p className="text-xs text-green-500 mt-1">Service Providers</p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg animate-bounce-in" style={{ animationDelay: '200ms' }}>
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Processing Status</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {latestEmail ? 'Active' : 'Idle'}
                    </p>
                    <p className="text-xs text-purple-500 mt-1">
                      {latestEmail ? 'Real-time monitoring' : 'Waiting for emails'}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-bounce-in" style={{ animationDelay: '400ms' }}>
                    <Activity className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-1">Last Update</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {latestEmail ? new Date(latestEmail.timestamp).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }) : 'Never'}
                    </p>
                    <p className="text-xs text-orange-500 mt-1">
                      {latestEmail ? 'Latest email processed' : 'No emails yet'}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg animate-bounce-in" style={{ animationDelay: '600ms' }}>
                    <RefreshCw className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Email Analysis */}
            {selectedEmail && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary-600" />
                  <span>Latest Email Analysis</span>
                </h2>
                <EmailAnalysis email={selectedEmail} />
              </div>
            )}

            {/* Receiving Chain Visualization */}
            {selectedEmail && selectedEmail.receivingChain.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Server className="h-5 w-5 text-primary-600" />
                  <span>Email Receiving Chain</span>
                </h2>
                <ReceivingChain chain={selectedEmail.receivingChain} />
              </div>
            )}

            {/* ESP Type Information */}
            {selectedEmail && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary-600" />
                  <span>Email Service Provider</span>
                </h2>
                <div className="flex items-center space-x-4">
                  <EspTypeBadge type={selectedEmail.espType} />
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
          <EmailHistory
            emails={emailHistory?.emails || []}
            onSelectEmail={(id) => { setSelectedEmailId(id); setActiveTab('overview'); }}
            onRefresh={refetchHistory}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8">
            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Emails</p>
                    <p className="text-3xl font-bold text-blue-900">{stats?.totalEmails || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center animate-bounce-in">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active ESPs</p>
                    <p className="text-3xl font-bold text-green-900">
                      {stats?.espTypes ? Object.keys(stats.espTypes).length : 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center animate-bounce-in" style={{ animationDelay: '200ms' }}>
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Processing Rate</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {latestEmail ? 'Active' : 'Idle'}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center animate-bounce-in" style={{ animationDelay: '400ms' }}>
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced ESP Distribution */}
            <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Email Service Provider Distribution</h2>
                <div className="text-sm text-gray-500">
                  {stats?.totalEmails || 0} total emails analyzed
                </div>
              </div>
              
              {stats?.espTypes && (
                <div className="space-y-6">
                  {Object.entries(stats.espTypes)
                    .sort(([,a], [,b]) => b - a)
                    .map(([esp, count], index) => {
                      const percentage = (count / stats.totalEmails) * 100;
                      const colors = [
                        'from-blue-500 to-blue-600',
                        'from-green-500 to-green-600',
                        'from-purple-500 to-purple-600',
                        'from-orange-500 to-orange-600',
                        'from-red-500 to-red-600',
                        'from-indigo-500 to-indigo-600'
                      ];
                      
                      return (
                        <div key={esp} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className={`h-4 w-4 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`} />
                              <span className="font-medium text-gray-700">{esp}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                              <span className="font-semibold text-gray-900">{count}</span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-3 bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-1000 ease-out transform origin-left`}
                                style={{
                                  width: `${percentage}%`,
                                  animationDelay: `${index * 100}ms`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Enhanced Recent Activity */}
            <div className="card animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Email Activity Timeline</h2>
                <div className="text-sm text-gray-500">Last 7 days</div>
              </div>
              
              {stats?.recentActivity && (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={activity.date} className="group">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">{activity.count}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(activity.date).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-primary-600 font-semibold">
                              {activity.count} {activity.count === 1 ? 'email' : 'emails'}
                            </p>
                          </div>
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-1000 ease-out transform origin-left"
                            style={{
                                  width: `${(activity.count / Math.max(...stats.recentActivity.map(a => a.count))) * 100}%`,
                                  animationDelay: `${index * 150}ms`
                            }}
                          />
                        </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email Processing Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Insights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average emails per day</span>
                    <span className="font-semibold text-gray-900">
                      {stats?.recentActivity ? 
                        Math.round(stats.recentActivity.reduce((sum, a) => sum + a.count, 0) / stats.recentActivity.length) : 
                        0
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Most active ESP</span>
                    <span className="font-semibold text-gray-900">
                      {stats?.espTypes ? 
                        Object.entries(stats.espTypes).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A' : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data freshness</span>
                    <span className="font-semibold text-gray-900">
                      {latestEmail ? 
                        `${Math.round((Date.now() - new Date(latestEmail.timestamp).getTime()) / (1000 * 60 * 60))}h ago` : 
                        'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${latestEmail ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-sm text-gray-600">Email Processing</span>
                    <span className="ml-auto text-sm font-medium text-gray-900">
                      {latestEmail ? 'Active' : 'Idle'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">Database Connection</span>
                    <span className="ml-auto text-sm font-medium text-gray-900">Connected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">IMAP Service</span>
                    <span className="ml-auto text-sm font-medium text-gray-900">Online</span>
                  </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
