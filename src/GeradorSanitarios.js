import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GeradorRodizio from './GeradorRodizio_3';

const GeradorSanitarios = () => {
  return (
    <View style={styles.container}>
      <GeradorRodizio />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding:0,
  },
});

export default GeradorSanitarios;