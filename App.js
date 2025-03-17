import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/HomeScreen';  // Importação corrigida
import GeradorRodizio from './src/GeradorRodizio';  // Importação corrigida
import GeradorOrganistas from './src/GeradorOrganistas';  // Importação corrigida
import GeradorPorteiros from './src/GeradorPorteiros';  // Importação corrigida
import GeradorSanitarios from './src/GeradorSanitarios'; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GeradorRodizio" component={GeradorRodizio} />
        <Stack.Screen name="GeradorPorteiros" component={GeradorPorteiros} />
        <Stack.Screen name="GeradorSanitarios" component={GeradorSanitarios} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}




