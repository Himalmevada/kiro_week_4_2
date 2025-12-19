# Space Invaders Game - Gesture Recognition Implementation Guide

## Overview

The gesture recognition system uses TensorFlow.js with MediaPipe Hands to detect hand poses and convert them into game controls. This guide explains how the system works and how to implement and debug it.

## Hand Pose Detection Basics

### MediaPipe Hands Model
- **Model:** MediaPipe Hands (Full model)
- **Input:** 640x480 video stream from webcam
- **Output:** 21 hand landmarks per hand
- **Landmarks:** Wrist, palm, and finger joints
- **Accuracy:** ~95% in good lighting conditions
- **Latency:** ~30-50ms per frame

### Hand Landmarks (21 points)
```
0:  Wrist
1:  Thumb CMC
2:  Thumb MCP
3:  Thumb IP
4:  Thumb TIP
5:  Index Finger MCP
6:  Index Finger PIP
7:  Index Finger DIP
8:  Index Finger TIP
9:  Middle Finger MCP
10: Middle Finger PIP
11: Middle Finger DIP
12: Middle Finger TIP
13: Ring Finger MCP
14: Ring Finger PIP
15: Ring Finger DIP
16: Ring Finger TIP
17: Pinky MCP
18: Pinky PIP
19: Pinky DIP
20: Pinky TIP
```

## Gesture Recognition Implementation

### 1. Hand Position Detection

**Purpose:** Determine if hand is on left, right, or center of screen

**Algorithm:**
```
1. Extract wrist landmark (index 0)
2. Calculate palm center as average of:
   - Wrist (0)
   - Index base (5)
   - Pinky base (17)
3. Normalize X coordinate to 0-1 range
4. Apply dead zone logic:
   - If X < 0.35: LEFT
   - If X > 0.65: RIGHT
   - If 0.35 ≤ X ≤ 0.65: CENTER
```

**Dead Zone Rationale:**
- Prevents accidental steering in center
- Provides stable neutral position
- Reduces jitter from hand tremor
- Improves user experience

### 2. Palm State Detection

**Purpose:** Determine if palm is open (shooting) or closed (not shooting)

**Algorithm:**
```
1. Count extended fingers (0-5)
2. For each finger:
   - Compare tip position to base position
   - If tip Y < base Y - threshold: EXTENDED
   - Threshold: 10 pixels
3. Palm is OPEN if 3+ fingers extended
4. Palm is CLOSED if < 3 fingers extended
```

**Finger Checking:**
- **Thumb:** Special case, compare X positions
- **Index-Pinky:** Compare Y positions (tip above base)

### 3. Finger Counting

**Purpose:** Detect number of extended fingers for power-up activation

**Algorithm:**
```
1. Initialize count = 0
2. Check thumb:
   - If |thumb_tip.x - wrist.x| > |thumb_base.x - wrist.x| + 20
   - Then count++
3. Check other fingers:
   - For each finger (index, middle, ring, pinky)
   - If finger_tip.y < finger_base.y - 10
   - Then count++
4. Return count (0-5)
```

**Power-Up Mapping:**
- 1 finger: Rapid Fire
- 2 fingers: Shield
- 3 fingers: Speed Boost

### 4. Hand Height Detection

**Purpose:** Determine if hand is high, middle, or low on screen

**Algorithm:**
```
1. Get normalized Y coordinate (0-1)
2. If Y < 0.33: HIGH
3. If 0.33 ≤ Y < 0.67: MIDDLE
4. If Y ≥ 0.67: LOW
```

## Implementation Details

### Initialization Process

```typescript
async initialize(): Promise<void> {
  // 1. Initialize TensorFlow backend
  await tf.ready();
  await tf.setBackend('webgl');
  
  // 2. Load MediaPipe Hands model
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const config = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelType: 'full',
    maxHands: 1
  };
  this.detector = await handPoseDetection.createDetector(model, config);
  
  // 3. Setup webcam stream
  this.video = document.createElement('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480, facingMode: 'user' }
  });
  this.video.srcObject = stream;
  
  // 4. Wait for video to load
  await new Promise(resolve => {
    this.video.onloadedmetadata = resolve;
  });
}
```

### Detection Loop

```typescript
private async detectHands(): Promise<void> {
  if (!this.isDetecting || !this.detector || !this.video) {
    return;
  }
  
  try {
    // 1. Estimate hands from video frame
    const hands = await this.detector.estimateHands(this.video);
    
    // 2. Process first hand (max 1 hand)
    if (hands.length > 0) {
      this.processHandLandmarks(hands[0]);
    } else {
      this.currentGesture.isHandDetected = false;
      this.currentGesture.confidence = 0;
    }
  } catch (error) {
    console.error('Hand detection error:', error);
  }
  
  // 3. Schedule next frame
  if (this.isDetecting) {
    this.animationFrameId = requestAnimationFrame(() => this.detectHands());
  }
}
```

### Landmark Processing

```typescript
private processHandLandmarks(hand: any): void {
  const keypoints = hand.keypoints;
  
  // 1. Calculate palm center
  const palmBase = keypoints[0];
  const indexBase = keypoints[5];
  const pinkyBase = keypoints[17];
  
  const palmCenterX = (palmBase.x + indexBase.x + pinkyBase.x) / 3;
  const palmCenterY = (palmBase.y + indexBase.y + pinkyBase.y) / 3;
  
  // 2. Normalize coordinates
  const normalizedX = palmCenterX / this.video.width;
  const normalizedY = palmCenterY / this.video.height;
  
  // 3. Update gesture state
  this.currentGesture.handX = normalizedX;
  this.currentGesture.handY = normalizedY;
  this.currentGesture.isHandDetected = true;
  this.currentGesture.confidence = hand.score || 0;
  
  // 4. Determine direction
  const relativeX = normalizedX - this.centerX;
  if (relativeX < -this.deadZone) {
    this.currentGesture.moveDirection = 'left';
  } else if (relativeX > this.deadZone) {
    this.currentGesture.moveDirection = 'right';
  } else {
    this.currentGesture.moveDirection = 'center';
  }
  
  // 5. Determine height
  if (normalizedY < 0.33) {
    this.currentGesture.handHeight = 'high';
  } else if (normalizedY < 0.67) {
    this.currentGesture.handHeight = 'middle';
  } else {
    this.currentGesture.handHeight = 'low';
  }
  
  // 6. Count fingers
  const fingerCount = this.countExtendedFingers(keypoints);
  this.currentGesture.fingersExtended = fingerCount;
  this.currentGesture.isPalmOpen = fingerCount >= 3;
}
```

## Integration with Game

### Reading Gesture State

```typescript
// In GameScene.update()
let gestureState: GestureState | null = null;
if (this.gesturesEnabled && this.gestureController) {
  gestureState = this.gestureController.getGestureState();
}
```

### Applying Gesture Movement

```typescript
// In GameScene.update()
if (gestureState && gestureState.isHandDetected) {
  // Note: Inverted because video is mirrored
  if (gestureState.moveDirection === 'left') {
    this.player.setVelocityX(moveSpeed);  // Hand left = ship right
  } else if (gestureState.moveDirection === 'right') {
    this.player.setVelocityX(-moveSpeed); // Hand right = ship left
  } else {
    this.player.setVelocityX(0);
  }
}
```

### Applying Gesture Shooting

```typescript
// In GameScene.update()
const shouldShoot = this.cursors.space.isDown ||
  (gestureState && gestureState.isHandDetected && gestureState.isPalmOpen);

if (shouldShoot && time > this.lastFired) {
  this.fireBullet();
  this.lastFired = time + this.fireRate;
}
```

### Applying Gesture Power-Ups

```typescript
// In GameScene.update()
if (gestureState && gestureState.isHandDetected) {
  const fingerCount = gestureState.fingersExtended;
  
  // Edge trigger: activate only on finger count change
  if (fingerCount !== this.lastFingerCount && fingerCount >= 1 && fingerCount <= 3) {
    switch (fingerCount) {
      case 1:
        this.activateRapidFire();
        break;
      case 2:
        this.activateShield();
        break;
      case 3:
        this.activateSpeedBoost();
        break;
    }
  }
  this.lastFingerCount = fingerCount;
}
```

## Visualization and Debugging

### Webcam Overlay Display

```typescript
// In WebcamOverlay.tsx
const drawHandTracking = (state: GestureState) => {
  // 1. Draw hand position circle
  const x = state.handX * canvas.width;
  const y = state.handY * canvas.height;
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, 2 * Math.PI);
  ctx.strokeStyle = state.isPalmOpen ? '#00ff00' : '#ff0000';
  ctx.stroke();
  
  // 2. Draw direction zones
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
  
  // 3. Draw direction arrow
  if (state.moveDirection === 'left') {
    drawArrow(ctx, canvas.width / 4, canvas.height - 40, 'left', '#ff6666');
  } else if (state.moveDirection === 'right') {
    drawArrow(ctx, (canvas.width / 4) * 3, canvas.height - 40, 'right', '#6666ff');
  }
};
```

### Gesture State Display

```typescript
// In WebcamOverlay.tsx
<div>
  <div>Direction: {gestureState.moveDirection.toUpperCase()}</div>
  <div>Palm: {gestureState.isPalmOpen ? 'OPEN' : 'CLOSED'}</div>
  <div>Height: {gestureState.handHeight.toUpperCase()}</div>
  <div>Fingers: {gestureState.fingersExtended}</div>
  <div>Confidence: {(gestureState.confidence * 100).toFixed(0)}%</div>
</div>
```

## Troubleshooting Guide

### Hand Not Detected
**Symptoms:** "No Hand" indicator in overlay
**Causes:**
- Hand outside camera view
- Poor lighting conditions
- Hand too close or too far
- Camera not properly initialized

**Solutions:**
- Ensure hand is visible in camera
- Improve lighting (natural light preferred)
- Position hand 30-60cm from camera
- Check browser console for errors

### Jittery Movement
**Symptoms:** Ship movement is shaky/unstable
**Causes:**
- Hand tremor or small movements
- Dead zone too small
- Confidence threshold too low

**Solutions:**
- Increase dead zone (currently 15%)
- Increase confidence threshold
- Smooth gesture state with moving average
- Reduce gesture detection frequency

### Incorrect Direction Detection
**Symptoms:** Hand moves left but ship goes right
**Causes:**
- Video not mirrored correctly
- Dead zone calculation wrong
- Coordinate normalization error

**Solutions:**
- Verify video mirror effect (scaleX(-1))
- Check dead zone calculation
- Verify coordinate normalization (0-1 range)
- Test with known hand positions

### Finger Counting Inaccurate
**Symptoms:** Wrong power-up activates
**Causes:**
- Finger threshold too high/low
- Hand angle affects detection
- Lighting affects finger visibility

**Solutions:**
- Adjust finger threshold (currently 10px)
- Test with different hand angles
- Improve lighting conditions
- Add finger confidence threshold

### Camera Permission Denied
**Symptoms:** Gesture control button disabled
**Causes:**
- User denied camera access
- Browser doesn't support camera API
- HTTPS required (except localhost)

**Solutions:**
- Request permission again
- Use HTTPS in production
- Check browser compatibility
- Clear browser permissions and retry

## Performance Optimization

### Gesture Detection Frequency
- Current: 30 FPS (requestAnimationFrame)
- Rationale: Sufficient for smooth gameplay
- Trade-off: Reduced CPU usage vs. responsiveness

### Hand Landmark Caching
- Cache landmarks between frames
- Reduce redundant calculations
- Smooth gesture state transitions

### Confidence Threshold
- Current: No minimum threshold
- Recommendation: Add 0.5 minimum for stability
- Display warning if confidence < 0.5

### Dead Zone Tuning
- Current: 15% (0.15 normalized)
- Larger dead zone: More stable but less responsive
- Smaller dead zone: More responsive but jittery

## Testing Gesture Recognition

### Manual Testing
1. Enable gesture control
2. Move hand left/right and verify direction
3. Open/close palm and verify shooting
4. Show 1/2/3 fingers and verify power-ups
5. Test in different lighting conditions
6. Test with different hand sizes/angles

### Automated Testing
```typescript
// Test hand position detection
const testHandPosition = (x: number, y: number, expectedDirection: string) => {
  const gesture = controller.getGestureState();
  gesture.handX = x;
  gesture.handY = y;
  expect(gesture.moveDirection).toBe(expectedDirection);
};

// Test palm state
const testPalmState = (fingersExtended: number, expectedOpen: boolean) => {
  const gesture = controller.getGestureState();
  gesture.fingersExtended = fingersExtended;
  expect(gesture.isPalmOpen).toBe(expectedOpen);
};
```

## Future Improvements

### Multi-Hand Support
- Currently: Single hand only
- Future: Support two-handed controls
- Use case: Complex gesture combinations

### Gesture Calibration
- Allow users to calibrate dead zone
- Adjust for different hand sizes
- Store calibration preferences

### Advanced Gestures
- Pinch gesture for special actions
- Swipe gestures for menu navigation
- Rotation gestures for ship rotation

### Machine Learning Improvements
- Fine-tune model for gaming
- Improve accuracy in low-light
- Reduce latency with optimization

### Accessibility Features
- Voice control alternative
- Eye-tracking support
- Customizable gesture mappings
