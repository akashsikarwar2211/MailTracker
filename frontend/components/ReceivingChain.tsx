import { Server, ArrowRight, Globe } from 'lucide-react'

interface ReceivingChainProps {
  chain: string[]
}

export function ReceivingChain({ chain }: ReceivingChainProps) {
  if (!chain || chain.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Server className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p>No receiving chain data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-6">
        <p>
          This email passed through {chain.length} server(s) before reaching your inbox.
          The path shows the chronological order from sender to recipient.
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Server nodes */}
        <div className="space-y-6">
          {chain.map((server, index) => (
            <div key={index} className="relative flex items-start space-x-4">
              {/* Server icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className="h-12 w-12 bg-primary-100 border-2 border-primary-300 rounded-full flex items-center justify-center">
                  <Server className="h-6 w-6 text-primary-600" />
                </div>
                {index < chain.length - 1 && (
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Server info */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900">
                      Server {index + 1}
                    </h3>
                    {index === 0 && (
                      <span className="badge badge-info text-xs">
                        Origin
                      </span>
                    )}
                    {index === chain.length - 1 && (
                      <span className="badge badge-success text-xs">
                        Destination
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Hostname
                      </label>
                      <p className="text-sm text-gray-900 font-mono break-all">
                        {server}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Role
                      </label>
                      <p className="text-sm text-gray-700">
                        {index === 0 ? 'Sender Server' : 
                         index === chain.length - 1 ? 'Your Mail Server' : 
                         'Relay Server'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
          <div>
            <h4 className="font-medium text-primary-900">Email Routing Summary</h4>
            <p className="text-sm text-primary-700">
              Email traveled from <strong>{chain[0]}</strong> through{' '}
              {chain.length > 2 ? `${chain.length - 2} relay servers` : 'direct connection'} to{' '}
              <strong>{chain[chain.length - 1]}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
