import React, { useEffect, useRef, useState } from 'react';
import { HandGestureController, GestureState } from '../game/utils/HandGestureController';

interface WebcamOverlayProps {
  gestureController: HandGestureController | null;
  isEnabled: boolean;
}

export const WebcamOverlay: React.FC<WebcamOverlayProps> = ({ gestureController, isEnabled }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gestureState, setGestureState] = useState<GestureState | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gestureController || !isEnabled) {
      return;
    }

    // Get video element from gesture controller
    const videoElement = gestureController.getVideoElement();
    if (videoElement && videoRef.current) {
      videoRef.current.srcObject = videoElement.srcObject;
    }

    // Update gesture state periodically
    const updateGesture = () => {
      const state = gestureController.getGestureState();
      setGestureState(state);

      // Draw hand tracking visualization
      if (canvasRef.current && videoRef.current) {
        drawHandTracking(state);
      }

      animationFrameRef.current = requestAnimationFrame(updateGesture);
    };

    updateGesture();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gestureController, isEnabled]);

  const drawHandTracking = (state: GestureState) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.isHandDetected) return;

    // Draw hand position indicator
    const x = state.handX * canvas.width;
    const y = state.handY * canvas.height;

    // Draw circle at hand position
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2 * Math.PI);
    ctx.strokeStyle = state.isPalmOpen ? '#00ff00' : '#ff0000';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw center line with dead zones
    const centerX = canvas.width / 2;
    const deadZoneWidth = canvas.width * 0.15;

    // Left zone
    ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
    ctx.fillRect(0, 0, centerX - deadZoneWidth, canvas.height);

    // Right zone
    ctx.fillStyle = 'rgba(100, 100, 255, 0.2)';
    ctx.fillRect(centerX + deadZoneWidth, 0, centerX - deadZoneWidth, canvas.height);

    // Dead zone
    ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';
    ctx.fillRect(centerX - deadZoneWidth, 0, deadZoneWidth * 2, canvas.height);

    // Draw direction indicator
    const arrowY = canvas.height - 40;
    if (state.moveDirection === 'left') {
      drawArrow(ctx, canvas.width / 4, arrowY, 'left', '#ff6666');
    } else if (state.moveDirection === 'right') {
      drawArrow(ctx, (canvas.width / 4) * 3, arrowY, 'right', '#6666ff');
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, direction: 'left' | 'right', color: string) => {
    const size = 20;
    ctx.fillStyle = color;
    ctx.beginPath();

    if (direction === 'left') {
      ctx.moveTo(x + size, y - size);
      ctx.lineTo(x, y);
      ctx.lineTo(x + size, y + size);
    } else {
      ctx.moveTo(x - size, y - size);
      ctx.lineTo(x, y);
      ctx.lineTo(x - size, y + size);
    }

    ctx.lineTo(direction === 'left' ? x + size / 2 : x - size / 2, y);
    ctx.closePath();
    ctx.fill();
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '10px'
    }}>
      <div style={{ position: 'relative', width: '240px', height: '180px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '5px',
            transform: 'scaleX(-1)' // Mirror the video
          }}
        />
        <canvas
          ref={canvasRef}
          width={240}
          height={180}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            transform: 'scaleX(-1)' // Mirror the canvas
          }}
        />
      </div>

      {gestureState && (
        <div style={{
          marginTop: '10px',
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '5px',
          fontSize: '12px',
          color: '#fff',
          fontFamily: 'monospace'
        }}>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: gestureState.isHandDetected ? '#00ff00' : '#ff0000' }}>
              {gestureState.isHandDetected ? '✓ Hand Detected' : '✗ No Hand'}
            </span>
          </div>

          {gestureState.isHandDetected && (
            <>
              <div style={{ marginBottom: '3px' }}>
                Direction: <strong style={{
                  color: gestureState.moveDirection === 'left' ? '#ff6666' :
                         gestureState.moveDirection === 'right' ? '#6666ff' : '#888'
                }}>
                  {gestureState.moveDirection.toUpperCase()}
                </strong>
              </div>

              <div style={{ marginBottom: '3px' }}>
                Palm: <strong style={{
                  color: gestureState.isPalmOpen ? '#00ff00' : '#ff9900'
                }}>
                  {gestureState.isPalmOpen ? 'OPEN' : 'CLOSED'}
                </strong>
              </div>

              <div style={{ marginBottom: '3px' }}>
                Height: <strong>{gestureState.handHeight.toUpperCase()}</strong>
              </div>

              <div style={{ marginBottom: '3px' }}>
                Fingers: <strong style={{
                  color: gestureState.fingersExtended >= 1 && gestureState.fingersExtended <= 3
                    ? '#ffff00'
                    : '#aaa',
                  fontSize: '16px'
                }}>
                  {gestureState.fingersExtended}
                </strong>
                {gestureState.fingersExtended >= 1 && gestureState.fingersExtended <= 3 && (
                  <span style={{ color: '#ffff00', marginLeft: '5px' }}>
                    (Power {gestureState.fingersExtended})
                  </span>
                )}
              </div>

              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '5px' }}>
                Confidence: {(gestureState.confidence * 100).toFixed(0)}%
              </div>
            </>
          )}
        </div>
      )}

      <div style={{
        marginTop: '8px',
        padding: '6px',
        background: 'rgba(0, 100, 200, 0.3)',
        borderRadius: '5px',
        fontSize: '10px',
        color: '#aaf',
        textAlign: 'center',
        fontFamily: 'monospace'
      }}>
        AI Hand Tracking Active
      </div>
    </div>
  );
};
