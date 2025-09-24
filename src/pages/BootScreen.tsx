import { useEffect, useState } from "react";
import "xp.css/dist/XP.css";

export default function BootScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onFinish();
          return 100;
        }
        return prev + 8; // Cambiado de 5 a 10
      });
    }, 200); 
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      style={{
        backgroundColor: "black",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100%",
          position: "relative",
        }}
      >
        <img
          src="src/assets/bootScreen.png"
          alt="Boot Screen"
          style={{
            width: "auto",
            height: "40vh",
            objectFit: "contain",
            marginBottom: "2rem",
          }}
        />

        {/* Barra de progreso de XP.css */}
        <progress
          className="progressbar"
          max={100}
          value={progress}
          style={{
            width: "200px", 
            height: "20px", 
            marginBottom: "2rem",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            padding: "0 40px",
            color: "white",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        >
          <div>
            Para una mejor experiencia
            <br /> Presiona F11 para pantalla completa
          </div>
          <div style={{ fontStyle: "italic", fontWeight: "bold" }}>Microsoft</div>
        </div>
      </div>
    </div>
  );
}
