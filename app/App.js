import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';


const Tab = createBottomTabNavigator();

/*unction HomeScreen() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription;
    if (isDetecting) {
      subscription = Accelerometer.addListener(a => setAccel(a));
      Accelerometer.setUpdateInterval(200); // 5 readings/sec
    }
    return () => subscription && subscription.remove();
  }, [isDetecting]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Button
        title={isDetecting ? 'Stop Detection' : 'Start Detection'}
        color={isDetecting ? 'red' : 'green'}
        onPress={() => setIsDetecting(!isDetecting)}
      />
      <Text style={{ marginTop: 20 }}>
        {isDetecting ? 'Detection Running...' : 'Detection Stopped'}
      </Text>
      <Text style={{ marginTop: 10 }}>
        Acceleration: x={accel.x.toFixed(2)} y={accel.y.toFixed(2)} z={accel.z.toFixed(2)}
      </Text>
    </View>
  );
}*/

function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(loc.coords);
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Getting location…</Text>
      </View>
    );
  }

  const region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={region}>
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="You are here"
        />
      </MapView>
    </View>
  );
}

function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Text>Reports Screen</Text>
    </View>
  );
}

/*function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings Screen</Text>
    </View>
  );
}*/

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Map">
       
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding:20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});


/* 
88  <Tab.Screen name="Home" component={HomeScreen} /> 
91 <Tab.Screen name="Settings" component={SettingsScreen} />
*/
