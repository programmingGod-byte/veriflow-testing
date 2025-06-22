'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchParamsProviderProps {
  onTabChange: (tab: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function SearchParamsProvider({ 
  onTabChange, 
  setActiveTab 
}: SearchParamsProviderProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  // Set active tab based on URL parameter
  useEffect(() => {
    if (tab === 'signup') {
      setActiveTab('signup');
    }
  }, [tab, setActiveTab]);
  
  // Expose the callbackUrl through the context for the parent component to use
  return (
    <div data-callback-url={callbackUrl} style={{ display: 'none' }} />
  );
} 