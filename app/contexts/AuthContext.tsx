// contexts/AuthContext.tsx
import { onAuthStateChanged, User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../firebase"; // Importa tu instancia de auth

interface AuthContextType {
  user: User | null;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider - Configurando listener onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log(
        "AuthProvider - onAuthStateChanged - Estado detectado:",
        firebaseUser?.uid || "null"
      );
      setUser(firebaseUser);
      setIsAuthLoading(false); // Importante: marca la carga como completa aquí
    });

    return () => {
      console.log("AuthProvider - Desuscribiendo de onAuthStateChanged.");
      unsubscribe();
    };
  }, []); // Este efecto solo se ejecuta una vez al montar el Provider

  return (
    <AuthContext.Provider value={{ user, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
