'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
   email: string;
   setEmail: (email: string) => void;
}

const defaultEmail = 'default@example.com';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
   const [email, setEmail] = useState<string>(defaultEmail);

   useEffect(() => {
      const stored = localStorage.getItem('userEmail');
      if (stored) {
         setEmail(stored);
      }
   }, []);

   useEffect(() => {
      localStorage.setItem('userEmail', email);
   }, [email]);

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
