import { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
  isLoading: boolean;
  loadingMessage?: string;
  error?: string | null;
}

interface AppContextType {
  appState: AppState;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    loadingMessage: undefined,
    error: null,
  });

  const setLoading = (loading: boolean, message?: string) => {
    setAppState(prev => ({
      ...prev,
      isLoading: loading,
      loadingMessage: message,
    }));
  };

  const setError = (error: string | null) => {
    setAppState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }));
  };

  const clearError = () => {
    setAppState(prev => ({
      ...prev,
      error: null,
    }));
  };

  return (
    <AppContext.Provider value={{ appState, setLoading, setError, clearError }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};