'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Phone } from 'lucide-react';

// Import our modern components
import PageHeader from './components/PageHeader';
import TabNavigation from './components/TabNavigation';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';
import CallerLookupCard from './components/CallerLookupCard';
import CallRecordTable from './components/CallRecordTable';
import SectionHeader from './components/SectionHeader';

interface CallerLookup {
  id: number;
  phoneNumber: string;
  lookupResult: string;
  timestamp: string;
}

interface CallRecord {
  id: number;
  to: string;
  from: string;
  callSid: string;
  status: string;
  timestamp: string;
}

export default function CallerIdPage() {
  const [callerLookups, setCallerLookups] = useState<CallerLookup[]>([]);
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lookups');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch caller lookups
        const lookupsResponse = await fetch('/api/caller_id/history?type=lookups');
        const lookupsData = await lookupsResponse.json();
        
        // Fetch call records
        const callsResponse = await fetch('/api/caller_id/history?type=calls');
        const callsData = await callsResponse.json();
        
        setCallerLookups(lookupsData.lookups || []);
        setCallRecords(callsData.calls || []);
      } catch (error) {
        console.error('Error fetching caller ID data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const parseCallerInfo = (jsonString: string) => {
    try {
      const info = JSON.parse(jsonString);
      return info;
    } catch (e) {
      return { error: 'Invalid data format' };
    }
  };

  const tabs = [
    {
      id: 'lookups',
      label: 'Caller ID Lookups',
      icon: <Search className="w-4 h-4" />,
      count: callerLookups.length
    },
    {
      id: 'calls',
      label: 'Call Records',
      icon: <Phone className="w-4 h-4" />,
      count: callRecords.length
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageHeader 
          title="Caller ID Management" 
          subtitle="Track caller lookups and call records with advanced insights"
        />
        
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        />
        
        {loading ? (
          <LoadingSpinner message="Loading caller ID data..." />
        ) : (
          <>
            {activeTab === 'lookups' && (
              <div className="space-y-6">
                <SectionHeader
                  title="Caller ID Lookups"
                  description="View detailed information about phone number lookups"
                  actionLabel="New Lookup"
                  onAction={() => router.push('/caller-id/lookup')}
                  count={callerLookups.length}
                />
                
                {callerLookups.length === 0 ? (
                  <EmptyState
                    icon={<Search className="w-8 h-8 text-gray-400" />}
                    title="No caller ID lookups found"
                    description="Start by performing your first phone number lookup to identify unknown callers and detect potential spam."
                    actionLabel="Perform a Lookup"
                    onAction={() => router.push('/caller-id/lookup')}
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {callerLookups.map((lookup) => {
                      const callerInfo = parseCallerInfo(lookup.lookupResult);
                      return (
                        <CallerLookupCard
                          key={lookup.id}
                          phoneNumber={lookup.phoneNumber}
                          timestamp={lookup.timestamp}
                          callerInfo={callerInfo}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'calls' && (
              <div className="space-y-6">
                <SectionHeader
                  title="Call Records"
                  description="Monitor all your call activity and status updates"
                  actionLabel="Make a Call"
                  onAction={() => router.push('/caller-id/call')}
                  count={callRecords.length}
                />
                
                {callRecords.length === 0 ? (
                  <EmptyState
                    icon={<Phone className="w-8 h-8 text-gray-400" />}
                    title="No call records found"
                    description="Your call history will appear here once you start making calls through the system."
                    actionLabel="Make a Call"
                    onAction={() => router.push('/caller-id/call')}
                  />
                ) : (
                  <CallRecordTable callRecords={callRecords} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
