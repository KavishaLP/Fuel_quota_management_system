import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './HomeScreenStyles'; // Adjust the path as necessary

export default function HomeScreen() {
  return (
    <LinearGradient
        colors={['#a1c4fd', '#c2e9fb']} // new gradient colors
        style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to Fuel Manager</Text>
          <Text style={styles.subtitle}>Manage fuel. Scan QR. Simple.</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
