'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
   email: string;
   setEmail: (email: string) => void;
}

const defaultEmail = 'test@example.com';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
   const [email, setEmailState] = useState<string>(() => {
      if (typeof window !== 'undefined') {
         return localStorage.getItem('userEmail') || defaultEmail;
      }
      return defaultEmail;
   });

   const setEmail = (newEmail: string) => {
      setEmailState(newEmail);
      localStorage.setItem('userEmail', newEmail);
   };

   return (
      <UserContext.Provider value={{ email, setEmail }}>
         {children}
      </UserContext.Provider>
   );
}

export function useUser() {
   const context = useContext(UserContext);
   if (context === undefined) {
      throw new Error('useUser must be used within a UserProvider');
   }
   return context;
}
