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
  pointProbability = 0.5,
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
          // garda puntos cando finaliza timer
          if (pendingPoints > 0) {
            addPoints(pendingPoints);
            onTimerComplete?.(pendingPoints);
          }
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
      //  --------- gardar puntos acumulados se se para timer manualmente -------
      if (pendingPoints > 0) {
        addPoints(pendingPoints);
        onTimerComplete?.(pendingPoints);
      }
    } else {
      startCountdown();
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
      <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      <Text style={styles.pointsText}>Puntos acumulados: {pendingPoints}</Text>
      <TouchableOpacity style={styles.button} onPress={toggleCountdown}>
        <Text style={styles.buttonText}>
          {intervalRef.current !== null ? "Detener" : "Iniciar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
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
});
