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
  const [user,setUser] = useState([])
  const [allMachines,setAllMachines] = useState([])

  return (
    <SessionProvider>
      <MyContext.Provider value={{ allMachines,setAllMachines,value, setValue ,user,setUser }}>
        {children}
      </MyContext.Provider>
    </SessionProvider>
  );
}
