# 🚗 Bump map – Smart Pothole Detection & Alert System

RoadSense is a cross-platform mobile application that detects potholes in real time using a smartphone’s motion sensors and GPS. The system alerts drivers through vibration and displays detected potholes on a live map.

---

## 📌 Problem Statement

Potholes:

- Cause vehicle damage  
- Increase accident risk  
- Raise maintenance costs  
- Are reported manually and inefficiently  

There is a need for an automated, real-time road monitoring solution.

---

## 💡 Our Solution

RoadSense transforms smartphones into intelligent road sensors by:

- 📊 Using accelerometer data to detect sudden bumps  
- 📍 Capturing GPS location of detected potholes  
- 🗺️ Displaying potholes on a live interactive map  
- 📳 Alerting drivers with vibration feedback  
- 🔴 Classifying bump severity (Low, Medium, High)  

---

## ⚙️ Tech Stack

- React Native
- Expo
- expo-sensors (Accelerometer)
- expo-location (GPS tracking)
- expo-haptics (Vibration alerts)
- react-native-maps

---

## 🚀 Features

- ✅ Real-time bump detection  
- ✅ Severity classification  
- ✅ Live GPS tracking  
- ✅ Interactive map visualization  
- ✅ Haptic feedback alerts  
- ✅ Start/Stop detection control  

---

## 📱 How It Works

1. The accelerometer monitors vertical motion changes.
2. When acceleration crosses a threshold, a bump is detected.
3. The system:
   - Determines severity
   - Captures GPS coordinates
   - Displays a marker on the map
   - Triggers vibration alert
4. Detection runs continuously while enabled.

---
