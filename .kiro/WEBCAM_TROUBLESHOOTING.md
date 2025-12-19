# Webcam Access Troubleshooting Guide

## Error: "Failed to access webcam. Please grant camera permissions and try again."

This guide helps you resolve camera access issues when using gesture recognition on the Space Invaders Game.

## Quick Fixes

### 1. **Check HTTPS (Most Important for Deployed Sites)**

**The Problem:** Camera access requires HTTPS for security reasons.

**The Fix:**
- ✅ Deployed on Amplify: Should automatically use HTTPS
- ✅ Local development: `http://localhost:5173` works fine
- ❌ Deployed on HTTP: Will NOT work - camera access blocked

**Verify:**
- Look at your URL in the browser address bar
- Should start with `https://` (not `http://`)
- If using `http://`, the site is not secure

### 2. **Grant Camera Permissions**

**The Problem:** Browser is blocking camera access.

**The Fix:**
1. Look for the **camera icon** in your browser's address bar (right side)
2. Click the camera icon
3. Select **"Allow"** or **"Allow once"**
4. Refresh the page
5. Try gesture control again

**If you don't see the camera icon:**
- The permission may have been denied previously
- See "Reset Camera Permissions" below

### 3. **Reset Camera Permissions**

**Chrome/Edge:**
1. Click the **lock icon** in the address bar
2. Click **"Cookies and site settings"**
3. Find **"Camera"** in the list
4. Click the **X** to remove the site
5. Refresh the page
6. Grant permission again

**Firefox:**
1. Click the **lock icon** in the address bar
2. Click **"Clear Cookies and Site Data"**
3. Refresh the page
4. Grant permission again

**Safari:**
1. Go to **Safari → Settings → Privacy**
2. Find **"Camera"** permissions
3. Remove the site from the list
4. Refresh the page
5. Grant permission again

### 4. **Check Camera is Not in Use**

**The Problem:** Another application is using your camera.

**The Fix:**
1. Close all other applications using the camera:
   - Zoom
   - Google Meet
   - Skype
   - Discord
   - OBS
   - Any video conferencing app
2. Try gesture control again

**To find what's using the camera:**
- **Windows:** Task Manager → Performance → Open Resource Monitor
- **Mac:** Activity Monitor → search for camera-related apps
- **Linux:** `lsof /dev/video*` in terminal

### 5. **Check Camera Hardware**

**The Problem:** Camera is not connected or not working.

**The Fix:**
1. Verify camera is connected to your device
2. Test camera in another app:
   - Windows: Camera app
   - Mac: Photo Booth
   - Linux: Cheese
3. If camera doesn't work in other apps, it's a hardware issue
4. Try a different camera or USB webcam

### 6. **Try a Different Browser**

**The Problem:** Your browser doesn't support camera access properly.

**The Fix:**
Try one of these supported browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

**If it works in another browser:**
- Update your current browser to the latest version
- Or use the browser where it works

### 7. **Clear Browser Cache**

**The Problem:** Cached data is interfering with camera access.

**The Fix:**
1. Press **Ctrl+Shift+Delete** (Windows/Linux) or **Cmd+Shift+Delete** (Mac)
2. Select **"All time"** for time range
3. Check **"Cookies and other site data"**
4. Check **"Cached images and files"**
5. Click **"Clear data"**
6. Refresh the page
7. Try gesture control again

### 8. **Try Incognito/Private Mode**

**The Problem:** Browser extensions are interfering.

**The Fix:**
1. Open a new **Incognito** (Chrome) or **Private** (Firefox/Safari) window
2. Navigate to your game
3. Try gesture control
4. If it works, disable browser extensions:
   - Chrome: Settings → Extensions → Disable suspicious ones
   - Firefox: Add-ons → Disable suspicious ones

## Specific Error Messages

### "Camera permission denied"
- **Cause:** You clicked "Block" or "Deny" when asked for permission
- **Fix:** See "Reset Camera Permissions" above

### "No camera found"
- **Cause:** No camera connected to your device
- **Fix:** Connect a webcam or use a device with a built-in camera

### "Camera is already in use"
- **Cause:** Another application is using the camera
- **Fix:** See "Check Camera is Not in Use" above

### "Camera access blocked by security settings"
- **Cause:** Site is using HTTP instead of HTTPS
- **Fix:** Ensure you're using HTTPS (deployed sites should auto-redirect)

### "Your browser doesn't support camera access"
- **Cause:** Browser is too old or doesn't support camera API
- **Fix:** Update browser or use a supported browser (Chrome 90+, Firefox 88+, etc.)

## For Deployed Sites (Amplify)

### Issue: Works locally but not on Amplify

**Cause:** HTTPS not properly configured or permissions not set.

**Fix:**
1. Verify URL uses `https://` (not `http://`)
2. Amplify should auto-redirect HTTP to HTTPS
3. Check browser console (F12) for errors
4. Clear browser cache and cookies
5. Try in incognito mode
6. Try a different browser

### Check Amplify Deployment

1. Go to AWS Amplify Console
2. Find your app
3. Check **"Domain management"**
4. Verify HTTPS is enabled
5. Check **"Build logs"** for any errors

## Browser Console Debugging

**To see detailed error messages:**

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Try gesture control
4. Look for red error messages
5. Share the error message for help

**Common console errors:**
- `NotAllowedError` → Permission denied
- `NotFoundError` → No camera found
- `NotReadableError` → Camera in use
- `SecurityError` → HTTPS required
- `TypeError` → Browser doesn't support API

## Testing Camera Access

**Before trying gesture control:**

1. Test camera in browser:
   - Chrome: Go to `chrome://settings/content/camera`
   - Firefox: Go to `about:preferences#privacy`
   - Check camera is listed and allowed

2. Test camera in another app:
   - Windows: Open Camera app
   - Mac: Open Photo Booth
   - Linux: Open Cheese

3. If camera works elsewhere but not in game:
   - Clear browser cache
   - Try incognito mode
   - Try different browser

## Still Not Working?

### Collect Debug Information

1. **Browser info:**
   - Browser name and version
   - Operating system
   - Device type (laptop, desktop, tablet)

2. **Error message:**
   - Exact error text from alert
   - Console errors (F12 → Console)

3. **What you've tried:**
   - List of troubleshooting steps attempted
   - Which steps worked/didn't work

4. **Environment:**
   - Local or deployed?
   - URL being used
   - HTTPS or HTTP?

### Get Help

With the debug information above, you can:
1. Check GitHub issues for similar problems
2. Create a new GitHub issue with details
3. Ask in project discussions
4. Check browser documentation for camera API

## Prevention Tips

### For Users
- Always grant camera permissions when asked
- Keep browser updated
- Close other camera apps before using gesture control
- Use HTTPS on deployed sites

### For Developers
- Test on multiple browsers
- Test on different devices
- Test with camera permissions denied
- Test with camera in use by other apps
- Provide clear error messages (already done!)
- Log errors to console for debugging

## Performance Tips

If gesture control is working but laggy:

1. **Reduce gesture detection frequency:**
   - Currently runs at 30 FPS
   - Can be reduced further if needed

2. **Improve lighting:**
   - Better lighting = better hand detection
   - Avoid backlighting
   - Use natural light when possible

3. **Position camera properly:**
   - Camera should be 30-60cm from your hand
   - Hand should be fully visible
   - Avoid extreme angles

4. **Close other apps:**
   - Reduces CPU usage
   - Improves overall performance

5. **Use a better camera:**
   - Built-in webcams are often lower quality
   - USB webcams usually perform better
   - Higher resolution = better detection

## Reference

### Supported Browsers
- Chrome 90+ (Recommended)
- Firefox 88+
- Edge 90+
- Safari 14+

### Required APIs
- MediaDevices API (getUserMedia)
- WebGL (for TensorFlow.js)
- Canvas API (for visualization)

### Deployment Requirements
- HTTPS (required for camera access)
- Modern browser (see supported list)
- Camera hardware
- Adequate lighting

---

**Last Updated:** December 2024
**Version:** 1.0.0

For more help, see `.kiro/steering/gesture-recognition-guide.md`
