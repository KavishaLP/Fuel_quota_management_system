import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './Screens/HomeScreen/HomeScreen';
import ScannerScreen from './Screens/ScannerScreen';
import FuelEntryScreen from './Screens/FuelEntryScreen/FuelEntryScreen';

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Scan QR" component={ScannerScreen} />
        <Tab.Screen name="Fuel Entry" component={FuelEntryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
