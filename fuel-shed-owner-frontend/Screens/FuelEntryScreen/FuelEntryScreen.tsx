// FuelEntryScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../FuelEntryScreen/FuelEntryScreenStyles';

export default function FuelEntryScreen() {
  const [fuelType, setFuelType] = useState('Petrol');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    if (!quantity || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert('Success', `Fuel Entry Saved:\nType: ${fuelType}\nQty: ${quantity}L\nPrice: Rs.${price}`);
    setQuantity('');
    setPrice('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Fuel Entry</Text>

      <Text style={styles.label}>Fuel Type</Text>
      <Picker
        selectedValue={fuelType}
        onValueChange={(itemValue) => setFuelType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Petrol" value="Petrol" />
        <Picker.Item label="Diesel" value="Diesel" />
      </Picker>

      <Text style={styles.label}>Quantity (Liters)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter quantity"
      />

      <Text style={styles.label}>Price (LKR)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
      />

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
