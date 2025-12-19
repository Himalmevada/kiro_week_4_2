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
      } catch (error: any) {
        console.error('Failed to enable gesture control:', error);

        // Display user-friendly error message based on error type
        const errorMessage = error?.message || 'Failed to access webcam';
        let fullMessage = '🎥 Camera Access Error\n\n';

        if (errorMessage.includes('permission')) {
          fullMessage += 'Camera permission denied.\n\n' +
            'Please:\n' +
            '1. Look for the camera icon in your browser\'s address bar\n' +
            '2. Click it and select "Allow"\n' +
            '3. Refresh the page and try again\n\n' +
            'Note: On deployed sites, HTTPS is required for camera access.';
        } else if (errorMessage.includes('No camera')) {
          fullMessage += 'No camera found on your device.\n\n' +
            'Please:\n' +
            '1. Connect a webcam to your device\n' +
            '2. Check that no other app is using the camera\n' +
            '3. Try again';
        } else if (errorMessage.includes('already in use')) {
          fullMessage += 'Your camera is already in use by another application.\n\n' +
            'Please:\n' +
            '1. Close other apps using the camera (Zoom, Google Meet, etc.)\n' +
            '2. Try again';
        } else if (errorMessage.includes('HTTPS') || errorMessage.includes('SecurityError')) {
          fullMessage += 'Camera access requires HTTPS.\n\n' +
            'On deployed sites:\n' +
            '1. Ensure you\'re using HTTPS (not HTTP)\n' +
            '2. Check your browser supports camera access\n' +
            '3. Grant camera permissions in browser settings';
        } else if (errorMessage.includes('browser')) {
          fullMessage += 'Your browser doesn\'t support camera access.\n\n' +
            'Please use:\n' +
            '• Chrome 90+\n' +
            '• Firefox 88+\n' +
            '• Edge 90+\n' +
            '• Safari 14+';
        } else {
          fullMessage += errorMessage + '\n\n' +
            'General troubleshooting:\n' +
            '• Ensure HTTPS is used on deployed sites\n' +
            '• Grant camera permissions in browser settings\n' +
            '• Check no other app is using the camera\n' +
            '• Try refreshing the page';
        }

        alert(fullMessage);
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
          background: isInitializing
            ? "linear-gradient(135deg, #ff8800, #cc6600)"
            : isGestureEnabled
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
          fontFamily: "monospace",
          opacity: isInitializing ? 0.8 : 1
        }}
      >
        {isInitializing
          ? "⏳ Initializing AI..."
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
