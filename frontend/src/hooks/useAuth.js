// src/context/AuthContext.jsx (bottom of the file)

// ... (AuthProvider component code is above this)

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
  return useContext(AuthContext);
};