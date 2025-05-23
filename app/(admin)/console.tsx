// app/(admin)/console.tsx
import HomeButton from "@/components/ui/HomeButton"; // Asegúrate de que esta ruta sea correcta
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
// Importa tu instancia de Firestore
import { db } from "../../firebase"; // Ajusta la ruta si es necesario
// Importa solo las funciones necesarias para consultar Firestore
import { collection, getDocs } from "firebase/firestore"; // Ya no necesitamos Timestamp aquí

// Define la interfaz, tratando createdAt como string
interface UserDataTable {
  id: string;
  username?: string;
  email: string;
  createdAt?: string;
}

export default function AdminConsoleScreen() {
  const [users, setUsers] = useState<UserDataTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setError(null);

      try {
        const usersCollectionRef = collection(db, "users");
        const querySnapshot = await getDocs(usersCollectionRef);

        const usersList: UserDataTable[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          // *** Lógica simplificada: leer createdAt como string ***
          const rawCreatedAt = data.createdAt;

          // Asignamos directamente, esperando que sea un string o undefined/null
          // TypeScript lo infiere como 'any' de .data(), por eso la Type Assertion (as string | undefined) es útil,
          // pero para simplificar al máximo, confiamos en la interfaz UserDataTable
          const createdAtString: string | undefined =
            typeof rawCreatedAt === "string" ? rawCreatedAt : undefined;

          return {
            id: doc.id,
            username: data.username as string | undefined, // Type assertion para claridad si lo necesitas
            email: data.email as string,
            createdAt: createdAtString, // Asignamos el string o undefined
            // ... otros campos que quieras mostrar ...
          };
        });

        console.log("Usuarios obtenidos:", usersList.length, "usuarios.");

        setUsers(usersList);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error("Error al obtener usuarios:", err);
        setError(err.message || "Error desconocido al cargar usuarios.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // --- Renderizado condicional (sin cambios) ---
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando usuarios...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Función para renderizar cada fila de la tabla
  const renderUserItem = ({ item }: { item: UserDataTable }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.username || "N/A"}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      {/* Mostrar el string de createdAt directamente, o "N/A" si no existe */}
      <Text style={styles.cell}>{item.createdAt || "N/A"}</Text>
    </View>
  );

  // --- RETURN PRINCIPAL (sin cambios, solo el contenido de la FlatList) ---
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <HomeButton />
      </View>
      <Text style={styles.title}>Consola de Administrador</Text>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Username</Text>
        <Text style={styles.headerCell}>Email</Text>
        <Text style={styles.headerCell}>Creado</Text>
      </View>
      {users.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text>No hay usuarios para mostrar.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

// Estilos para la pantalla (sin cambios)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Ajusta según la altura de tu barra de estado/navegación
    paddingHorizontal: 15,
    backgroundColor: "#f7f7f7",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 5,
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 5,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
