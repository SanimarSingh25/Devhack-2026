import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DetectionScreen from './screens/DetectionScreen';
import HeatmapScreen from './screens/HeatmapScreen';
import ReportsScreen from './screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Heatmap">
        <Tab.Screen name="Heatmap" component={HeatmapScreen} />
        <Tab.Screen name="Detection" component={DetectionScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}