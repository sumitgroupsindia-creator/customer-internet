import { createContext, useContext, useState, useCallback } from 'react';

const CustomerAuthContext = createContext(null);

const STORAGE_TOKEN = 'sumit_inet_token';
const STORAGE_USER = 'sumit_inet_customer';

export function CustomerAuthProvider({ children, queryClient }) {
  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER));
    } catch {
      return null;
    }
  });

  const login = useCallback((token, customerData) => {
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(customerData));
    setCustomer(customerData);
  }, []);

  const updateCustomer = useCallback((patch) => {
    setCustomer((c) => {
      const next = { ...c, ...patch };
      localStorage.setItem(STORAGE_USER, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    if (queryClient) queryClient.clear();
    setCustomer(null);
  }, [queryClient]);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        login,
        logout,
        updateCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomerAuth = () => useContext(CustomerAuthContext);
