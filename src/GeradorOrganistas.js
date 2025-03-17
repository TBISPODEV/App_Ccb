import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GeradorRodizio from './GeradorRodizio';

const GeradorOrganistas = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Rodízio de Organistas</Text>
      <GeradorRodizio />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default GeradorOrganistas;

