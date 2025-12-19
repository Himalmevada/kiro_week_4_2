import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { gameConfig } from "../game/config";

export default function Game() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game(gameConfig);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "20px",
          background:
            "linear-gradient(135deg, rgba(0, 20, 40, 0.6), rgba(0, 40, 80, 0.4))",
          borderRadius: "12px",
          border: "2px solid rgba(0, 255, 255, 0.3)",
          boxShadow:
            "0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div id="game-container" ref={containerRef} />
      </div>
    </div>
  );
}
