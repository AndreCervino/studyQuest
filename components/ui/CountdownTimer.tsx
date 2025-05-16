import { doc, increment, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase";

interface CountdownTimerProps {
  initialSeconds?: number;
  pointRate?: number;
  pointQuantity?: number;
  pointProbability?: number;
  onTimerComplete?: (totalPoints: number) => void;
}

export default function CountdownTimer({
  initialSeconds = 300,
  pointRate = 3,
  pointQuantity = 1,
  pointProbability = 1,
  onTimerComplete,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [pendingPoints, setPendingPoints] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const lastPointTimeRef = useRef<number>(0);

  const addPoints = async (pointsToAdd: number) => {
    if (!auth.currentUser?.uid) return;

    const userDocRef = doc(db, "users", auth.currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        points: increment(pointsToAdd),
      });
      setPendingPoints(0); // Resetear puntos pendientes después de sumarlos
    } catch (error) {
      console.error("Error updating points:", error);
    }
  };

  const tryGivePoints = (currentTime: number) => {
    if (
      currentTime % pointRate === 0 &&
      currentTime !== lastPointTimeRef.current &&
      Math.random() < pointProbability
    ) {
      setPendingPoints((prev) => prev + pointQuantity);
      lastPointTimeRef.current = currentTime;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startCountdown = () => {
    stopCountdown();
    setSecondsLeft(initialSeconds);
    setPendingPoints(0);
    lastPointTimeRef.current = 0;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const newTime = prev - 1;
        if (newTime > 0) {
          tryGivePoints(initialSeconds - newTime);
          return newTime;
        } else {
          stopCountdown();
          // Mostrar alerta pero NO sumar puntos todavía
          onTimerComplete?.(pendingPoints);
          return 0;
        }
      });
    }, 1000) as unknown as number;
  };

  const stopCountdown = () => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleCountdown = () => {
    if (intervalRef.current !== null) {
      stopCountdown();
      // Mostrar alerta pero NO sumar puntos automáticamente
      onTimerComplete?.(pendingPoints);
    } else {
      startCountdown();
    }
  };

  // --- Función para confirmar los puntos acumulados ---
  const confirmPoints = async () => {
    if (pendingPoints > 0 && auth.currentUser?.uid) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          points: increment(pendingPoints),
        });
        setPendingPoints(0); // Resetear puntos pendientes
      } catch (error) {
        console.error("Error al confirmar puntos:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (pendingPoints > 0) {
        addPoints(pendingPoints);
      }
      stopCountdown();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(secondsLeft)}</Text>
      <Text style={styles.pointsText}>Puntos acumulados: {pendingPoints}</Text>
      <TouchableOpacity style={styles.button} onPress={toggleCountdown}>
        <Text style={styles.buttonText}>
          {intervalRef.current !== null ? "Detener" : "Iniciar"}
        </Text>
      </TouchableOpacity>

      {/* Botón para confirmar puntos (solo visible cuando hay puntos pendientes y el timer está parado) */}
      {pendingPoints > 0 && intervalRef.current === null && (
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={confirmPoints}
        >
          <Text style={styles.buttonText}>¡Tómate un descanso!</Text>
          <Text style={styles.buttonText}>
            Has ganado {pendingPoints} puntos
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 72,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginBottom: 20,
    color: "#333",
  },
  pointsText: {
    fontSize: 18,
    color: "#28a745",
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#28a745", // Verde para diferenciar la acción de confirmación
    marginTop: 10,
  },
});
