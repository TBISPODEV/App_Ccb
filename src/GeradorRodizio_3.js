//RODIZIO DOS SANITARIOS

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
import { printToFileAsync } from "expo-print"; // Para gerar o PDF
import * as Sharing from "expo-sharing"; // Para compartilhar o PDF
import Icon from "react-native-vector-icons/FontAwesome"; // Para ícones
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GeradorRodizioScreen = () => {
  // Estados para armazenar os dados
  const rodizioId = "rodizio3";
  const [organistas, setOrganistas] = useState([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [tipoEscala, setTipoEscala] = useState("ambos"); // Estado para controlar se é Meia Hora, Culto ou Ambos
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

  // <== Função para salvar os dados
  const salvarDados = async (dados) => {
    try {
      await AsyncStorage.setItem(rodizioId, JSON.stringify(dados));
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  };

  const excluirOrganista = (index) => {
    const novosOrganistas = [...organistas];
    novosOrganistas.splice(index, 1);
    setOrganistas(novosOrganistas);
    salvarDados(novosOrganistas);
  };

  // Função para formatar o telefone no padrão (XX) XXXXX-XXXX
  const formatarTelefone = (telefone) => {
    const telefoneLimpo = telefone.replace(/\D/g, ""); // Remove caracteres não numéricos
    const match = telefoneLimpo.match(/^(\d{2})(\d{5})(\d{4})$/);

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`; // Formata como (XX) XXXXX-XXXX
    }

    return telefone; // Retorna o telefone original se não bater com o padrão esperado
  };

  // Função para adicionar organista
  const adicionarOrganista = () => {
    if (!nome || !disponibilidade) {
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
    setTipoEscala("estacionamento"); // Resetar a seleção
  };

  // Função para calcular todos os dias selecionados de um mês
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

  // Função para gerar a escala
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
    let ultimoDiaEscalados = [];

    diasDoMes.forEach(({ diaDaSemana, data }) => {
      const organistasDisponiveis = organistas.filter(
        (f) =>
          f.disponibilidade.includes(diaDaSemana) &&
          !ultimoDiaEscalados.includes(f.nome)
      );
      const escolhidos = [];

      // Garantir que apenas uma pessoa faz "Meia Hora" e outra "Culto"
      while (escolhidos.length < 3 && organistasDisponiveis.length > 0) {
        const escolhido = organistasDisponiveis.splice(
          Math.floor(Math.random() * organistasDisponiveis.length),
          1
        )[0];

        if (
          escolhido.tipoEscala === "Sanitário masculino" &&
          !escolhidos.some((o) => o.tipo === "Sanitário masculino")
        ) {
          escolhidos.push({ ...escolhido, tipo: "Sanitário masculino" });
        } else if (
          escolhido.tipoEscala === "Sanitário feminino" &&
          !escolhidos.some((o) => o.tipo === "Sanitário feminino")
        ) {
          escolhidos.push({ ...escolhido, tipo: "Sanitário feminino" });
        } else if (
          escolhido.tipoEscala == "estacionamento" &&
          !escolhidos.some((o) => o.tipo === "estacionamento")
        ) {
          escolhidos.push({ ...escolhido, tipo: "estacionamento" });
        }
      }

      ultimoDiaEscalados = escolhidos.map((o) => o.nome);

      novaEscala[data.toLocaleDateString("pt-BR")] = escolhidos.map(
        (organista) => ({
          ...organista,
          data: data.toLocaleDateString("Pt-BR"),
        })
      );
    });

    setEscala(novaEscala);
  };

  // Função para gerar o PDF
  const gerarPDF = async () => {
    if (!escala) {
      Alert.alert("Erro", "Nenhuma escala gerada.");
      return;
    }
    try {
      // Início do HTML com o estilo para o documento
      let htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4; /* Fundo leve */
            }
            h1 {
              text-align: center; /* Centraliza o título */
              font-size: 24px;
              color: #333; /* Cor escura para contraste */
            }
            table {
              width: 100%; /* Tabela ocupa toda a largura */
              border-collapse: collapse; /* Remove espaçamento entre células */
              margin-bottom: 20px;
              background-color: #fff; /* Fundo branco para a tabela */
              border-radius: 5px; /* Bordas arredondadas */
              box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* Sombra leve */
            }
            th, td {
              border: 1px solid #ccc; /* Bordas finas */
              padding: 8px; /* Espaçamento interno */
              text-align: left; /* Texto alinhado à esquerda */
              font-size: 14px;
            }
            th {
              background-color: #f8f8f8; /* Fundo do cabeçalho */
              font-weight: bold; /* Texto em negrito no cabeçalho */
            }
            tr:nth-child(even) {
              background-color: #f9f9f9; /* Cor alternada para linhas pares */
            }
            @page {
              margin: 20px; /* Margem ao redor da página */
            }
          </style>
        </head>
        <body>
          <h1>Escala de Rodízio Sanitários e estacionamento</h1> <!-- Título do PDF -->
          <h2>Dia de Ensaio: ${diaEnsaio}</h2>
      `;

      // Itera sobre as datas da escala para criar uma tabela para cada dia
      Object.keys(escala).forEach((data) => {
        const setorSanitarioMasculino = escala[data].filter(
          (organista) => organista.tipo === "Sanitário masculino"
        );
        const setorSanitarioFeminino = escala[data].filter(
          (organista) => organista.tipo === "Sanitário feminino"
        );
        const setorEstacionamento = escala[data].filter(
          (organista) => organista.tipo === "estacionamento"
        );

        htmlContent += `
          <h2>Data: ${data}</h2>
          <table>
            <thead>
              <tr>
                <th>Sanitário Masculino</th>
                <th>Sanitário Feminino</th>
                <th>Estacionamento</th>
              </tr>
            </thead>
            <tbody>
        `;

        const maxLength = Math.max(
          setorSanitarioMasculino.length,
          setorSanitarioFeminino.length,
          setorEstacionamento.length
        );

        for (let i = 0; i < maxLength; i++) {
          htmlContent += `
          <tr>
            <td>${
              setorSanitarioMasculino[i] ? setorSanitarioMasculino[i].nome : ""
            }</td>
            <td>${
              setorSanitarioFeminino[i] ? setorSanitarioFeminino[i].nome : ""
            }</td>
            <td>${
              setorEstacionamento[i] ? setorEstacionamento[i].nome : ""
            }</td>
          </tr>
        `;
        }

        // Fecha a tabela
        htmlContent += `
            </tbody>
          </table>
        `;
      });

      // Fecha o HTML do corpo do documento
      htmlContent += `</body></html>`;

      // Gera o PDF a partir do HTML
      const { uri } = await printToFileAsync({ html: htmlContent });

      // Verifica se o compartilhamento está disponível no dispositivo e compartilha o PDF
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rodizio dos sanitários</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome dos irmãos"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Dias disponível para atender (ex: terça, quinta)"
        value={disponibilidade}
        onChangeText={setDisponibilidade}
      />

      {/* Campo de seleção para tipo de escala (Meia Hora, Culto ou Ambos) */}
      <View style={{ marginBottom: 10 }}>
        <Text style={{ marginBottom: 5 }}>Atendimento:</Text>
        <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 10 }}>
          <Picker
            selectedValue={tipoEscala}
            onValueChange={(itemValue) => setTipoEscala(itemValue)}
            style={{ height: 50 }}
          >
            <Picker.Item label="Estacionamento" value="estacionamento" />
            <Picker.Item
              label="Sanitário Masculino"
              value="Sanitário masculino"
            />
            <Picker.Item
              label="Sanitário Feminino"
              value="Sanitário feminino"
            />
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={adicionarOrganista}>
        <View style={styles.buttonContent}>
          <Icon name="plus" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Adicionar Porteiros</Text>
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

      {/* Botão Gerar Rodízio */}
      <TouchableOpacity style={styles.button} onPress={gerarEscala}>
        <View style={styles.buttonContent}>
          <Icon name="clipboard" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Gerar Rodízio</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Irmãos do atendimento:</Text>
      <FlatList
        data={organistas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.itemContainer}>
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

      {/* Botão Gerar PDF */}
      <TouchableOpacity style={styles.button} onPress={gerarPDF}>
        <View style={styles.buttonContent}>
          <Icon name="file" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Gerar PDF</Text>
        </View>
      </TouchableOpacity>

      {escala && (
        <ScrollView style={[styles.scrollContainer, { flex: 1 }]}>
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
    backgroundColor: "rgb(203, 68, 31)", // Cor de fundo dos botões
    paddingVertical: 5, // Altura dos botões
    borderRadius: 8, // Borda arredondada
    marginBottom: 15, // Espaçamento entre os botões
    paddingHorizontal: 20, // Espaçamento interno lateral
  },
  buttonContent: {
    flexDirection: "row", // Ícone e texto lado a lado
    alignItems: "center", // Centraliza verticalmente
    justifyContent: "center", // Centraliza horizontalmente
  },
  icon: {
    marginRight: 20, // Espaço entre o ícone e o texto
  },
  buttonText: {
    color: "white", // Cor do texto do botão
    fontSize: 19, // Tamanho do texto do botão
    fontWeight: "bold", // Deixa o texto em negrito
  },
  scrollContainer: { marginTop: 2 },
});

export default GeradorRodizioScreen;
