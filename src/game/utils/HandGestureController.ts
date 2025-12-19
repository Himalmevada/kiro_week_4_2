import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import { HandDetector } from '@tensorflow-models/hand-pose-detection';

export interface GestureState {
  moveDirection: 'left' | 'right' | 'center';
  isPalmOpen: boolean;
  handHeight: 'high' | 'middle' | 'low';
  handX: number; // Normalized 0-1
  handY: number; // Normalized 0-1
  isHandDetected: boolean;
  confidence: number;
  fingersExtended: number; // 0-5 count of extended fingers
}

export class HandGestureController {
  private detector: HandDetector | null = null;
  private video: HTMLVideoElement | null = null;
  private isInitialized = false;
  private isDetecting = false;
  private animationFrameId: number | null = null;

  private currentGesture: GestureState = {
    moveDirection: 'center',
    isPalmOpen: false,
    handHeight: 'middle',
    handX: 0.5,
    handY: 0.5,
    isHandDetected: false,
    confidence: 0,
    fingersExtended: 0
  };

  // Calibration values
  private centerX = 0.5;
  private deadZone = 0.15; // 15% dead zone in center

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check if browser supports required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.');
      }

      // Check camera permissions
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permissionStatus.state === 'denied') {
            throw new Error('Camera permission denied. Please allow camera access in your browser settings and reload the page.');
          }
        } catch (permError) {
          // Permission API might not be fully supported, continue anyway
          console.warn('Could not check camera permissions:', permError);
        }
      }

      // Initialize TensorFlow backend
      console.log('Initializing TensorFlow...');
      await tf.ready();
      await tf.setBackend('webgl');
      console.log('TensorFlow backend ready');

      // Create hand detector
      console.log('Loading hand detection model...');
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
        modelType: 'full',
        maxHands: 1,
      };

      this.detector = await handPoseDetection.createDetector(model, detectorConfig);
      console.log('Hand detection model loaded');

      // Setup video stream
      console.log('Requesting camera access...');
      this.video = document.createElement('video');
      this.video.width = 640;
      this.video.height = 480;
      this.video.autoplay = true;
      this.video.playsInline = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      this.video.srcObject = stream;
      await new Promise((resolve, reject) => {
        if (this.video) {
          this.video.onloadedmetadata = resolve;
          this.video.onerror = reject;
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('Camera stream timeout')), 10000);
        }
      });

      this.isInitialized = true;
      console.log('HandGestureController initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize HandGestureController:', error);

      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Camera permission denied. Please allow camera access and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No camera found. Please connect a camera and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Camera is already in use by another application. Please close other apps using the camera.');
      } else if (error.name === 'OverconstrainedError') {
        throw new Error('Camera does not meet the required specifications.');
      } else if (error.name === 'SecurityError') {
        throw new Error('Camera access blocked by security settings. Please ensure the site is accessed via HTTPS.');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to initialize camera. Please check your browser settings and try again.');
      }
    }
  }

  startDetection(): void {
    if (!this.isInitialized || this.isDetecting) {
      return;
    }

    this.isDetecting = true;
    this.detectHands();
  }

  stopDetection(): void {
    this.isDetecting = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private async detectHands(): Promise<void> {
    if (!this.isDetecting || !this.detector || !this.video) {
      return;
    }

    try {
      const hands = await this.detector.estimateHands(this.video);

      if (hands.length > 0) {
        const hand = hands[0];
        this.processHandLandmarks(hand);
      } else {
        // No hand detected
        this.currentGesture.isHandDetected = false;
        this.currentGesture.confidence = 0;
      }
    } catch (error) {
      console.error('Error detecting hands:', error);
    }

    if (this.isDetecting) {
      this.animationFrameId = requestAnimationFrame(() => this.detectHands());
    }
  }

  private processHandLandmarks(hand: any): void {
    const keypoints = hand.keypoints;

    // Get palm center (average of key palm points)
    const palmBase = keypoints[0]; // Wrist
    const indexBase = keypoints[5]; // Index finger base
    const pinkyBase = keypoints[17]; // Pinky base

    const palmCenterX = (palmBase.x + indexBase.x + pinkyBase.x) / 3;
    const palmCenterY = (palmBase.y + indexBase.y + pinkyBase.y) / 3;

    // Normalize coordinates (0-1 range)
    const normalizedX = palmCenterX / this.video!.width;
    const normalizedY = palmCenterY / this.video!.height;

    this.currentGesture.handX = normalizedX;
    this.currentGesture.handY = normalizedY;
    this.currentGesture.isHandDetected = true;
    this.currentGesture.confidence = hand.score || 0;

    // Determine move direction with dead zone
    const relativeX = normalizedX - this.centerX;
    if (relativeX < -this.deadZone) {
      this.currentGesture.moveDirection = 'left';
    } else if (relativeX > this.deadZone) {
      this.currentGesture.moveDirection = 'right';
    } else {
      this.currentGesture.moveDirection = 'center';
    }

    // Determine hand height
    if (normalizedY < 0.33) {
      this.currentGesture.handHeight = 'high';
    } else if (normalizedY < 0.67) {
      this.currentGesture.handHeight = 'middle';
    } else {
      this.currentGesture.handHeight = 'low';
    }

    // Detect fingers and palm state
    const fingerCount = this.countExtendedFingers(keypoints);
    this.currentGesture.fingersExtended = fingerCount;
    this.currentGesture.isPalmOpen = fingerCount >= 3;
  }

  private countExtendedFingers(keypoints: any[]): number {
    let extendedCount = 0;

    // Check thumb (special case - compare x positions instead of y)
    const thumbTip = keypoints[4];
    const thumbBase = keypoints[2];
    const wrist = keypoints[0];

    // Thumb is extended if tip is far from wrist in x direction
    const thumbExtended = Math.abs(thumbTip.x - wrist.x) > Math.abs(thumbBase.x - wrist.x) + 20;
    if (thumbExtended) {
      extendedCount++;
    }

    // Check other four fingers by comparing tip to base positions
    const fingers = [
      { tip: 8, base: 6 },   // Index
      { tip: 12, base: 10 }, // Middle
      { tip: 16, base: 14 }, // Ring
      { tip: 20, base: 18 }  // Pinky
    ];

    for (const finger of fingers) {
      const tip = keypoints[finger.tip];
      const base = keypoints[finger.base];

      // Finger is extended if tip is higher (lower y value) than base
      const isExtended = tip.y < base.y - 10; // 10px threshold
      if (isExtended) {
        extendedCount++;
      }
    }

    return extendedCount;
  }

  getGestureState(): GestureState {
    return { ...this.currentGesture };
  }

  calibrate(centerPosition: number): void {
    this.centerX = centerPosition;
    console.log('Calibrated center position:', centerPosition);
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.video;
  }

  async cleanup(): Promise<void> {
    this.stopDetection();

    if (this.video && this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }

    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }

    this.isInitialized = false;
    console.log('HandGestureController cleaned up');
  }

  isReady(): boolean {
    return this.isInitialized && this.isDetecting;
  }
}
