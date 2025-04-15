import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // Importa os ícones

const HomeScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require("../assets/capa.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.title}></Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("GeradorRodizio")}
        >
          <View style={styles.buttonContent}>
            <Icon name="clipboard" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Rodizio Organistas</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CultoJovens")}
        >
          <View style={styles.buttonContent}>
            <Icon name="clipboard" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Rodizio Culto de jovens</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("GeradorPorteiros")}
        >
          <View style={styles.buttonContent}>
            <Icon name="clipboard" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Rodizio Porteiros</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("GeradorSanitarios")}
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
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginTop: 50,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 90,
  },
  button: {
    backgroundColor: "rgb(203, 68, 31)",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center", // Alinhamento vertical
  },
  icon: {
    marginRight: 35, // Espaço fixo entre o ícone e o texto
  },
  buttonText: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "left", // O texto começa exatamente após o ícone
    flex: 1, // Garante que o texto ocupe o espaço necessário
  },
});

export default HomeScreen;
