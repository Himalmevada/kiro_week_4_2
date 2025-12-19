import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { gameConfig } from "../game/config";
import { HandGestureController } from "../game/utils/HandGestureController";
import { WebcamOverlay } from "./WebcamOverlay";

export default function Game() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureControllerRef = useRef<HandGestureController | null>(null);
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game(gameConfig);

      // Create gesture controller
      gestureControllerRef.current = new HandGestureController();

      // Store in game registry for scenes to access
      if (gameRef.current) {
        gameRef.current.registry.set('gestureController', gestureControllerRef.current);
      }
    }

    return () => {
      if (gestureControllerRef.current) {
        gestureControllerRef.current.cleanup();
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const toggleGestureControl = async () => {
    if (!gestureControllerRef.current) return;

    if (!isGestureEnabled) {
      setIsInitializing(true);
      try {
        await gestureControllerRef.current.initialize();
        gestureControllerRef.current.startDetection();
        setIsGestureEnabled(true);

        // Notify game that gestures are enabled
        if (gameRef.current) {
          gameRef.current.registry.set('gesturesEnabled', true);
        }
      } catch (error) {
        console.error('Failed to enable gesture control:', error);
        alert('Failed to access webcam. Please grant camera permissions and try again.');
      } finally {
        setIsInitializing(false);
      }
    } else {
      // Stop detection and cleanup camera
      gestureControllerRef.current.stopDetection();
      await gestureControllerRef.current.cleanup();
      setIsGestureEnabled(false);

      // Notify game that gestures are disabled
      if (gameRef.current) {
        gameRef.current.registry.set('gesturesEnabled', false);
      }

      // Reinitialize the controller for next use
      gestureControllerRef.current = new HandGestureController();
      if (gameRef.current) {
        gameRef.current.registry.set('gestureController', gestureControllerRef.current);
      }
    }
  };

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
      {/* Gesture Control Toggle Button */}
      <button
        onClick={toggleGestureControl}
        disabled={isInitializing}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1001,
          padding: "12px 24px",
          background: isGestureEnabled
            ? "linear-gradient(135deg, #00ff88, #00cc66)"
            : "linear-gradient(135deg, #0088ff, #0066cc)",
          color: "#fff",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "8px",
          cursor: isInitializing ? "wait" : "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
          fontFamily: "monospace"
        }}
      >
        {isInitializing
          ? "Initializing AI..."
          : isGestureEnabled
            ? "🤖 AI Gestures: ON"
            : "🤖 Enable AI Gestures"}
      </button>

      {/* Webcam Overlay */}
      <WebcamOverlay
        gestureController={gestureControllerRef.current}
        isEnabled={isGestureEnabled}
      />

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

      {/* Instructions Overlay */}
      {isGestureEnabled && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.8)",
          padding: "15px",
          borderRadius: "10px",
          border: "2px solid rgba(0, 255, 255, 0.4)",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "12px",
          maxWidth: "300px"
        }}>
          <div style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold", color: "#0ff" }}>
            AI Gesture Controls:
          </div>
          <div style={{ marginBottom: "5px" }}>Move hand LEFT/RIGHT to steer</div>
          <div style={{ marginBottom: "5px" }}>OPEN palm to shoot</div>
          <div style={{ marginBottom: "5px" }}>CLOSE fist to stop shooting</div>
          <div style={{ marginBottom: "8px", paddingTop: "5px", borderTop: "1px solid rgba(0,255,255,0.2)" }}>
            <div style={{ fontWeight: "bold", color: "#ff0", marginBottom: "3px" }}>Power-ups:</div>
            <div style={{ fontSize: "11px", marginBottom: "2px" }}>👆 1 finger = Rapid Fire</div>
            <div style={{ fontSize: "11px", marginBottom: "2px" }}>✌️ 2 fingers = Shield</div>
            <div style={{ fontSize: "11px", marginBottom: "2px" }}>🤟 3 fingers = Speed Boost</div>
          </div>
          <div style={{ fontSize: "10px", opacity: 0.7 }}>Keyboard controls still work!</div>
        </div>
      )}
    </div>
  );
}
