import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { printToFileAsync } from "expo-print";
import * as Sharing from "expo-sharing";
import Icon from "react-native-vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GeradorRodizioScreen = () => {
  const rodizioId = "rodizio1";
  const [organistas, setOrganistas] = useState([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [tipoEscala, setTipoEscala] = useState("ambos");
  const [escala, setEscala] = useState(null);
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState("");
  const [diaEnsaio, setDiaEnsaio] = useState("");

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosSalvos = await AsyncStorage.getItem(rodizioId);
        if (dadosSalvos !== null) {
          setOrganistas(JSON.parse(dadosSalvos));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarDados();
  }, [rodizioId]);
  const [escalaEditavel, setEscalaEditavel] = useState(null);

  useEffect(() => {
    if (escala) {
      setEscalaEditavel(JSON.parse(JSON.stringify(escala))); // Clonar o objeto para edição
    }
  }, [escala]);

  const editarNomeRodizio = (data, index, novoNome) => {
    const novaEscalaEditavel = { ...escalaEditavel };
    novaEscalaEditavel[data][index].nome = novoNome;
    setEscalaEditavel(novaEscalaEditavel);
    setEscala(novaEscalaEditavel);
  };

  // Exibir rodízio editável
  {
    escalaEditavel && (
      <ScrollView style={{ marginTop: 10 }}>
        {Object.keys(escalaEditavel).map((data) => (
          <View key={data}>
            <Text style={styles.item}>Data: {data}</Text>
            {escalaEditavel[data].map((organista, index) => (
              <TextInput
                key={index}
                style={styles.input}
                value={organista.nome}
                onChangeText={(novoNome) =>
                  editarNomeRodizio(data, index, novoNome)
                }
              />
            ))}
          </View>
        ))}
      </ScrollView>
    );
  }
  const prepararEdicao = () => {
    if (escala) {
      setEscalaEditavel(JSON.parse(JSON.stringify(escala))); // Clona os dados para edição
    } else {
      Alert.alert("Erro", "Nenhuma escala disponível para edição.");
    }
  };

  // <== função para salvar os dados
  const salvarDados = async (dados) => {
    try {
      await AsyncStorage.setItem(rodizioId, JSON.stringify(dados));
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  };

  // <== função para excluir organistas
  const excluirOrganista = (index) => {
    const novosOrganistas = [...organistas];
    novosOrganistas.splice(index, 1);
    setOrganistas(novosOrganistas);
    salvarDados(novosOrganistas);
  };

  // <== função para formatar o telefone no padrão (XX) XXXXX-XXXX
  const formatarTelefone = (telefone) => {
    const telefoneLimpo = telefone.replace(/\D/g, "");
    const match = telefoneLimpo.match(/^(\d{2})(\d{5})(\d{4})$/);

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    return telefone;
  };

// Função para adicionar organistas
  const adicionarOrganista = () => {
    if (!nome || !telefone || !disponibilidade) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    const novosOrganistas = [
      ...organistas,
      {
        nome,
        telefone: formatarTelefone(telefone),
        disponibilidade: disponibilidade
          .split(",")
          .map((d) => d.trim().toLowerCase()),
        tipoEscala,
      },
    ];
    setOrganistas(novosOrganistas);
    salvarDados(novosOrganistas);
    setNome("");
    setTelefone("");
    setDisponibilidade("");
    setTipoEscala("ambos");
  };

  const calcularDiasDoMes = (mes, ano, diasSelecionados) => {
    const diasDaSemana = [
      "domingo",
      "segunda",
      "terça",
      "quarta",
      "quinta",
      "sexta",
      "sábado",
    ];
    const diasDoMes = [];
    const dias = diasSelecionados.split(",").map((d) => d.trim().toLowerCase());
    const primeiroDiaDoMes = new Date(ano, mes - 1, 1);
    const ultimoDiaDoMes = new Date(ano, mes, 0);

    for (let dia = 1; dia <= ultimoDiaDoMes.getDate(); dia++) {
      const data = new Date(ano, mes - 1, dia);
      const diaDaSemana = diasDaSemana[data.getDay()];
      if (dias.includes(diaDaSemana)) {
        diasDoMes.push({ diaDaSemana, data });
      }
    }
    return diasDoMes;
  };

  //Função para gerar escala
  const gerarEscala = () => {
    if (!mes || !ano || !diasSelecionados) {
      Alert.alert("Erro", "Por favor, informe o mês, ano e os dias da semana.");
      return;
    }

    const diasDoMes = calcularDiasDoMes(
      parseInt(mes),
      parseInt(ano),
      diasSelecionados
    );
    const novaEscala = {};
    const ultimoDiaEscalados = [];

    // Função para embaralhar um array
    const embaralharArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const organistasDisponiveisOriginais = [...organistas];
    let indexMeiaHora = 0;

    const organistasMeiaHora = organistasDisponiveisOriginais.filter(
      (f) => f.tipoEscala === "meiaHora"
    );
    const organistasAmbos = organistasDisponiveisOriginais.filter(
      (f) => f.tipoEscala === "ambos"
    );

    diasDoMes.forEach(({ diaDaSemana, data }) => {
      let organistasDisponiveis = organistasDisponiveisOriginais.filter((f) =>
        f.disponibilidade.includes(diaDaSemana)
      );

      if (organistasDisponiveis.length === 0) {
        // Se todos os organistas já foram sorteados, reseta a lista
        organistasDisponiveis = organistasDisponiveisOriginais.filter((f) =>
          f.disponibilidade.includes(diaDaSemana)
        );
      }

      const organistasAleatorios = embaralharArray([...organistasDisponiveis]);
      let pessoaSorteada = organistasAleatorios[0]; // Sorteia a primeira pessoa disponível

      const dataFormatada = data.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      novaEscala[dataFormatada] = [
        {
          nome: pessoaSorteada.nome,
          telefone: pessoaSorteada.telefone,
          tipo:
            pessoaSorteada.tipoEscala === "ambos"
              ? "Culto/meia hora"
              : pessoaSorteada.tipoEscala,
        },
      ];

      if (pessoaSorteada.tipoEscala === "meiaHora") {
        // Alterna entre as pessoas do tipo "meiaHora"
        let parceiro = organistasAmbos[indexMeiaHora % organistasAmbos.length];
        indexMeiaHora++;
        novaEscala[dataFormatada].push({
          nome: parceiro.nome,
          telefone: parceiro.telefone,
          tipo: "Culto/meia hora",
        });
      }
    });

    setEscala(novaEscala);
  };

  const gerarPDF = async () => {
    if (!escala) {
      Alert.alert("Erro", "Nenhuma escala gerada.");
      return;
    }
    try {
      let htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
             .moldura {
        border: 10px solid #000; /* Moldura preta */
        padding: 20px;
        margin: 0 auto;
        width: 90%;
        background-color: #fff;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Efeito de profundidade */
      }
            h1 { text-align: center; font-size: 24px; color: #333; }
            h3 { text-align: center; color: #345; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fff; border-radius: 5px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
            th { background-color: #f8f8f8; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @page {
              margin: 20mm; 
              border: 5px solid black;/* Margem ao redor da página */
            }
          </style>
        </head>
        
     
      

          <h1>Escala de Rodízio</h1>
          <h3>Dia de Ensaio: ${diaEnsaio}</h3>
      `;

      Object.keys(escala).forEach((data) => {
        htmlContent += `
          <h2>Data: ${data}</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
        `;

        escala[data].forEach((organista) => {
          htmlContent += `
            <tr>
              <td>${organista.nome}</td>
              <td>${organista.telefone}</td>
              <td>${organista.tipo}</td>
            </tr>
          `;
        });

        htmlContent += `
            </tbody>
          </table>
        `;
      });

      htmlContent += `</body></html>`;

      const { uri } = await printToFileAsync({ html: htmlContent });

      if (Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(
          "Erro",
          "O compartilhamento não está disponível neste dispositivo."
        );
      }
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      Alert.alert("Erro", "Ocorreu um erro ao gerar o PDF.");
    }
  };

  const limparEscala = () => {
    setEscala(null);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={styles.scrollContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Rodizio de organistas</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome da Organista"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone (ex: (11) 91234-5678)"
          value={telefone}
          keyboardType="phone-pad"
          onChangeText={setTelefone}
        />
        <TextInput
          style={styles.input}
          placeholder="Dias disponível para tocar (ex: terça, quinta)"
          value={disponibilidade}
          onChangeText={setDisponibilidade}
        />
        <View style={{ marginBottom: 10 }}>
          <Text style={{ marginBottom: 5 }}>Tocar:</Text>
          <View
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 10 }}
          >
            <Picker
              selectedValue={tipoEscala}
              onValueChange={(itemValue) => setTipoEscala(itemValue)}
              style={{ height: 50 }}
            >
              <Picker.Item label="Ambos" value="ambos" />
              <Picker.Item label="Meia Hora" value="meiaHora" />
              <Picker.Item label="Culto" value="culto" />
            </Picker>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={adicionarOrganista}>
          <View style={styles.buttonContent}>
            <Icon name="plus" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Adicionar Organista</Text>
          </View>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Mês (1 a 12)"
          value={mes}
          keyboardType="numeric"
          onChangeText={setMes}
        />
        <TextInput
          style={styles.input}
          placeholder="Ano (ex: 2025)"
          value={ano}
          keyboardType="numeric"
          onChangeText={setAno}
        />
        <TextInput
          style={styles.input}
          placeholder="Dias de culto (ex: terça, quinta)"
          value={diasSelecionados}
          onChangeText={setDiasSelecionados}
        />
        <TextInput
          style={styles.input}
          placeholder="Dia de Ensaio"
          value={diaEnsaio}
          onChangeText={setDiaEnsaio}
        />
        {/* Botão para gerar rodizio */}
        <TouchableOpacity style={styles.button} onPress={gerarEscala}>
          <View style={styles.buttonContent}>
            <Icon name="clipboard" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Gerar Rodízio</Text>
          </View>
        </TouchableOpacity>
        
        {/*Botão para ativar edição:*/}
        <TouchableOpacity style={styles.button} onPress={prepararEdicao}>
          <Text style={styles.buttonText}>Editar Rodízio</Text>
        </TouchableOpacity>
        // Exibição dos nomes editáveis:
        {escalaEditavel && (
          <ScrollView style={{ marginTop: 10 }}>
            {Object.keys(escalaEditavel).map((data) => (
              <View key={data}>
                <Text style={styles.item}>Data: {data}</Text>
                {escalaEditavel[data].map((organista, index) => (
                  <TextInput
                    key={index}
                    style={styles.input}
                    value={organista.nome}
                    onChangeText={(novoNome) =>
                      editarNomeRodizio(data, index, novoNome)
                    }
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        )}
        <Text style={styles.subtitle}>Organistas</Text>
        <FlatList
          data={organistas}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <Text style={styles.item}>
                {item.nome} - {item.disponibilidade.join(", ")} - Tipo:{" "}
                {item.tipoEscala}
              </Text>
              <TouchableOpacity onPress={() => excluirOrganista(index)}>
                <Icon name="trash" size={20} color="#ff0000" />
              </TouchableOpacity>
            </View>
          )}
        />
        <TouchableOpacity style={styles.button} onPress={gerarPDF}>
          <View style={styles.buttonContent}>
            <Icon name="file" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Gerar PDF</Text>
          </View>
        </TouchableOpacity>
        {escala && (
          <ScrollView style={{ marginTop: 2 }}>
            {Object.keys(escala).map((data) => (
              <View key={data}>
                <Text style={styles.item}>Data: {data}</Text>
                {escala[data].map((f, index) => (
                  <Text key={index} style={styles.item}>
                    - {f.nome} ({f.tipo})
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 10,
    marginTop: 2,
  },
  subtitle: { fontSize: 18, marginTop: 2 },
  item: { fontSize: 14, marginBottom: 1 },
  button: {
    backgroundColor: "rgb(203, 68, 31)",
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { marginRight: 20 },
  buttonText: { color: "white", fontSize: 19, fontWeight: "bold" },
  scrollContainer: { flex: 1 },
});

export default GeradorRodizioScreen;
