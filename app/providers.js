'use client';

import { SessionProvider } from 'next-auth/react';
import React, { createContext, useState } from 'react';

// Create and export the context
export const MyContext = createContext();

// Create and export the provider component
export function Providers({ children }) {
  const [value, setValue] = useState({
    name:"",
    ip:"",
  });

  return (
    <SessionProvider>
      <MyContext.Provider value={{ value, setValue }}>
        {children}
      </MyContext.Provider>
    </SessionProvider>
  );
}
