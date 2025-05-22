// contexts/AuthContext.tsx
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Importa las funciones de Firestore
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../firebase"; // Asegúrate de que `db` esté exportado en tu archivo firebase.ts

interface AuthContextType {
  user: User | null;
  isAdmin: boolean; // Añadimos si el usuario es administrador
  isLoading: boolean; // Renombramos para que sea más general (auth + admin check)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // Estado para administrador
  const [isLoading, setIsLoading] = useState(true); // Inicialmente estamos cargando

  useEffect(() => {
    console.log("AuthProvider - Configurando listener onAuthStateChanged...");

    // La callback debe ser async porque haremos una llamada a Firestore
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "AuthProvider - onAuthStateChanged - Estado detectado:",
        firebaseUser?.uid || "null"
      );

      setUser(firebaseUser);

      // Si hay un usuario logueado, verifica si es administrador
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid); // Referencia al documento del usuario
          const userDoc = await getDoc(userDocRef); // Obtiene el documento

          if (userDoc.exists()) {
            // Si el documento existe, verifica el campo 'isAdmin'
            const userData = userDoc.data();
            setIsAdmin(userData.isAdmin === true); // Asegúrate de que el campo sea boolean true
            console.log(
              `AuthProvider - User ${firebaseUser.uid} isAdmin: ${
                userData.isAdmin === true
              }`
            );
          } else {
            // Si el documento del usuario no existe en Firestore, no es admin
            setIsAdmin(false);
            console.log(
              `AuthProvider - User document for ${firebaseUser.uid} not found. Not admin.`
            );
          }
        } catch (error) {
          // Manejar errores al consultar Firestore
          console.error(
            "AuthProvider - Error fetching user document for admin check:",
            error
          );
          setIsAdmin(false); // En caso de error, asumimos que no es administrador
        }
      } else {
        // Si no hay usuario logueado, no es administrador
        setIsAdmin(false);
        console.log("AuthProvider - No user logged in. Not admin.");
      }

      // Marca la carga como completa SOLO después de procesar
      // el estado de auth Y la verificación de admin (si aplicó)
      setIsLoading(false);
      console.log("AuthProvider - Loading finished.");
    });

    // Función de limpieza para la suscripción
    return () => {
      console.log("AuthProvider - Desuscribiendo de onAuthStateChanged.");
      unsubscribe();
    };
  }, []); // Este efecto solo se ejecuta una vez al montar el Provider

  return (
    // Pasa el nuevo estado isAdmin y el estado de carga actualizado
    <AuthContext.Provider value={{ user, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto (no necesita cambios aquí,
// pero el tipo retornado ahora incluye isAdmin y isLoading)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
