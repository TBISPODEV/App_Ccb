import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importa os ícones
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../assets/capa.jpg')} // Caminho da imagem de fundo
      style={styles.container}
      resizeMode="cover" // A imagem cobre toda a tela
    >
      <Text style={styles.title}></Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('GeradorRodizio')}
        >
          <View style={styles.buttonContent}>
            <Icon name="clipboard" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Rodizio Organistas</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('GeradorPorteiros')}
        >
          <View style={styles.buttonContent}>
            <Icon name="clipboard" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Rodizio Porteiros</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('GeradorSanitarios')}
        >
          <View style={styles.buttonContent}>
            <Icon name="clipboard" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Rodizio Sanitários</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // A imagem vai cobrir toda a tela
    justifyContent: 'space-between', // Espaço entre título e botões
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    padding: 20, // Espaçamento
  },
  title: {
    fontSize: 22,
    marginTop: 50, // Espaço no topo para o título
    color: 'white', // Torna o texto visível sobre a imagem
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Sombra no texto para melhor visibilidade
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    textAlign: 'center', // Centraliza o texto
  },
  buttonContainer: {
    width: '100%', // Botões ocupam toda a largura disponível
    paddingHorizontal: 20, // Espaçamento interno lateral
    marginBottom: 90, // Move os botões mais para baixo
  },
  button: {
    backgroundColor: 'rgb(203, 68, 31)', // Cor de fundo dos botões
    paddingVertical: 15, // Altura dos botões
    borderRadius: 8, // Borda arredondada
    marginBottom: 15, // Espaçamento entre os botões
    paddingHorizontal: 20, // Espaçamento interno lateral
  },
  buttonContent: {
    flexDirection: 'row', // Ícone e texto lado a lado
    alignItems: 'center', // Centraliza verticalmente
    justifyContent: 'center', // Centraliza horizontalmente
  },
  icon: {
    marginRight: 20, // Espaço entre o ícone e o texto
  },
  buttonText: {
    color: 'white', // Cor do texto do botão
    fontSize: 19, // Tamanho do texto do botão
    fontWeight: 'bold', // Deixa o texto em negrito
  },
});

export default HomeScreen;
