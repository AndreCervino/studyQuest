// app/(admin)/console.tsx
import HomeButton from "@/components/ui/HomeButton"; // Asegúrate de que esta ruta sea correcta
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList, // ¡Necesitamos FlatList!
  StyleSheet,
  Text,
  View,
} from "react-native";
// Importa tu instancia de Firestore
import { db } from "../../firebase"; // Ajusta la ruta si es necesario
// Importa las funciones necesarias para consultar Firestore Y LA CLASE Timestamp
import { collection, getDocs, Timestamp } from "firebase/firestore";

// Define la interfaz para la estructura de datos de cada usuario que mostraremos
interface UserDataTable {
  id: string;
  username?: string;
  email: string;
  createdAt?: Date; // Ahora manejaremos esto para que SIEMPRE sea Date o undefined
}

export default function AdminConsoleScreen() {
  const [users, setUsers] = useState<UserDataTable[]>([]);
  const [loading, setLoading] = useState(true); // Inicia en true porque cargamos al montar
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // Limpia errores previos al intentar recargar (útil si alguna vez agregas recarga)
      setError(null);

      try {
        const usersCollectionRef = collection(db, "users");
        const querySnapshot = await getDocs(usersCollectionRef);

        const usersList: UserDataTable[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          // *** Lógica mejorada para manejar createdAt ***
          let createdAtDate: Date | undefined;
          if (data.createdAt instanceof Timestamp) {
            // Si es una instancia de Timestamp, la convertimos a Date
            createdAtDate = data.createdAt.toDate();
          } else if (data.createdAt) {
            // Si existe pero NO es Timestamp, logueamos una advertencia
            console.warn(
              `Documento ${doc.id} tiene createdAt no-Timestamp:`,
              data.createdAt
            );
            // Opcional: intentar parsear si esperas strings de fecha (descomentar si aplica)
            // try { createdAtDate = new Date(data.createdAt); } catch(e) { console.error("No se pudo parsear fecha", e); }
          }
          // Si data.createdAt es undefined, createdAtDate seguirá siendo undefined

          return {
            id: doc.id,
            username: data.username,
            email: data.email,
            createdAt: createdAtDate, // Usamos la variable que ahora es Date o undefined
            // ... otros campos que quieras mostrar ...
          };
        });

        console.log("Usuarios obtenidos:", usersList.length, "usuarios."); // Log más informativo

        setUsers(usersList);
        setLoading(false); // Indica que la carga ha terminado con éxito
        setError(null); // Asegura que no haya mensaje de error visible
      } catch (err: any) {
        // Usa 'any' o un tipo de error más específico si lo conoces
        console.error("Error al obtener usuarios:", err);

        // Actualiza el estado de error y marca la carga como terminada
        setError(err.message || "Error desconocido al cargar usuarios.");
        setLoading(false); // Indica que la carga ha terminado (con un error)
      }
    };

    fetchUsers(); // Llama a la función de carga al montar el componente
  }, []); // El array vacío asegura que el efecto solo se ejecute una vez

  // --- Renderizado condicional ---

  // Si está cargando, muestra un indicador
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando usuarios...</Text>
      </View>
    );
  }

  // Si hay un error, muestra un mensaje de error
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {/* Opcional: Botón para intentar recargar si hay error */}
        {/* <TouchableOpacity onPress={fetchUsers} style={{ marginTop: 20, padding: 10, backgroundColor: '#ddd' }}>
          <Text>Reintentar</Text>
        </TouchableOpacity> */}
      </View>
    );
  }

  // Función para renderizar cada fila de la tabla en la FlatList
  const renderUserItem = ({ item }: { item: UserDataTable }) => (
    <View style={styles.row}>
      {/* Puedes mostrar el UID si es útil para debugging o referencia */}
      {/* <Text style={[styles.cell, styles.uidCell]}>{item.id}</Text> */}
      <Text style={styles.cell}>{item.username || "N/A"}</Text>{" "}
      {/* Muestra 'N/A' si no hay username */}
      <Text style={styles.cell}>{item.email}</Text>
      {/* Formatea la fecha de creación si existe y es válida */}
      <Text style={styles.cell}>
        {item.createdAt instanceof Date && !isNaN(item.createdAt.getTime())
          ? item.createdAt.toLocaleDateString() // Formatea la fecha
          : "N/A"}{" "}
        {/* Muestra 'N/A' si no hay fecha válida */}
      </Text>
    </View>
  );

  // --- ¡EL RETURN PRINCIPAL QUE FALTABA! ---
  return (
    <View style={styles.container}>
      {/* Botón de inicio, si lo necesitas en esta pantalla */}
      <View style={styles.row}>
        {" "}
        {/* Puedes ajustar el estilo de esta View si solo contiene el botón */}
        <HomeButton />
      </View>

      <Text style={styles.title}>Consola de Administrador</Text>

      {/* Encabezados de la tabla */}
      <View style={styles.headerRow}>
        {/* <Text style={[styles.headerCell, styles.uidCell]}>UID</Text> */}
        <Text style={styles.headerCell}>Username</Text>
        <Text style={styles.headerCell}>Email</Text>
        <Text style={styles.headerCell}>Creado</Text>
      </View>

      {/* Si no hay usuarios y no estamos cargando ni hay error, mostramos un mensaje */}
      {users.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text>No hay usuarios para mostrar.</Text>
        </View>
      ) : (
        // FlatList para renderizar los datos de los usuarios
        <FlatList
          data={users} // Los datos que vienen del estado
          renderItem={renderUserItem} // La función que renderiza cada fila
          keyExtractor={(item) => item.id} // Usa el UID como key
          contentContainerStyle={styles.listContent} // Estilo para el contenido de la lista
          // Puedes añadir estilos o props adicionales a la FlatList si es necesario
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
