// context/UserContext.js

import React, { createContext, useState } from 'react';

// Create the context
export const UserContext = createContext();

// Create the provider
export const UserProvider = ({ children }) => {
  // Default is TRUE so you can see the app immediately (Fake Login)
    const [isLoggedIn, setIsLoggedIn] = useState(false); // <--- NEW (Real)

  return (
    <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};