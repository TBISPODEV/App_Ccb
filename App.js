import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { printToFileAsync } from 'expo-print';  // Para gerar o PDF
import * as Sharing from 'expo-sharing';  // Para compartilhar o PDF

const App = () => {
  // Estados para armazenar os dados
  const [organistas, setOrganistas] = useState([]);
  const [nome, setNome] = useState('');
  const [disponibilidade, setDisponibilidade] = useState('');
  const [escala, setEscala] = useState(null);
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [diasSelecionados, setDiasSelecionados] = useState('');

  // Função para adicionar organista
  const adicionarOrganista = () => {
    if (!nome || !disponibilidade) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    setOrganistas((prev) => [
      ...prev,
      { nome, disponibilidade: disponibilidade.split(',').map((d) => d.trim().toLowerCase()) },
    ]);
    setNome('');
    setDisponibilidade('');
  };

  // Função para calcular todos os dias selecionados de um mês
  const calcularDiasDoMes = (mes, ano, diasSelecionados) => {
    const diasDaSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const diasDoMes = [];
    const dias = diasSelecionados.split(',').map((d) => d.trim().toLowerCase()); // Converte os dias selecionados em array

    // Calcula o primeiro dia do mês
    const primeiroDiaDoMes = new Date(ano, mes - 1, 1); // Mes começa em 0, então subtraímos 1
    const ultimoDiaDoMes = new Date(ano, mes, 0); // Último dia do mês

    // Percorre todos os dias do mês
    for (let dia = 1; dia <= ultimoDiaDoMes.getDate(); dia++) {
      const data = new Date(ano, mes - 1, dia);
      const diaDaSemana = diasDaSemana[data.getDay()];

      // Verifica se o dia é um dos selecionados
      if (dias.includes(diaDaSemana)) {
        diasDoMes.push({ diaDaSemana, data });
      }
    }

    return diasDoMes;
  };

  // Função para gerar a escala
  const gerarEscala = () => {
    if (!mes || !ano || !diasSelecionados) {
      Alert.alert('Erro', 'Por favor, informe o mês, ano e os dias da semana.');
      return;
    }

    const diasDoMes = calcularDiasDoMes(parseInt(mes), parseInt(ano), diasSelecionados);
    const novaEscala = {};

    diasDoMes.forEach(({ diaDaSemana, data }) => {
      // Filtra os organistas disponíveis para o dia
      const organistasDisponiveis = organistas
        .filter((f) => f.disponibilidade.includes(diaDaSemana))
        .slice(0, 2); // Limita a 2 organistas por dia

      // Atribui "Meia Hora" e "Culto" de forma alternada
      if (organistasDisponiveis.length === 2) {
        // Alterna as palavras entre as duas organistas
        organistasDisponiveis[0].tipo = 'Culto';
        organistasDisponiveis[1].tipo = 'Meia Hora';
      }

      novaEscala[data.toLocaleDateString('pt-BR')] = organistasDisponiveis.map((organista) => ({
        ...organista,
        data: data.toLocaleDateString('pt-BR'),
      }));
    });

    setEscala(novaEscala);
  };

  // Função para gerar o PDF
  const gerarPDF = async () => {
    if (!escala) {
      Alert.alert('Erro', 'Nenhuma escala gerada.');
      return;
    }

    try {
      let htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 20px;
              }
              h1 {
                text-align: center;
                font-size: 28px;
                color: #2E8B57;
                margin-bottom: 20px;
              }
              h2 {
                color: #333;
                font-size: 20px;
                margin-bottom: 8px;
              }
              p {
                font-size: 16px;
                margin-bottom: 6px;
                color: #555;
              }
              .escala {
                background-color: #fff;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                margin-bottom: 25px;
              }
              .escala p {
                margin: 5px 0;
              }
              .escala .data {
                font-weight: bold;
                color: #007BFF;
              }
              .escala .tipo {
                font-style: italic;
                color: #FF5722;
              }
            </style>
          </head>
          <body>
            <h1>Escala de Rodízio</h1>
      `;

      // Iterar sobre a escala e construir o conteúdo HTML para o PDF
      Object.keys(escala).forEach((data) => {
        htmlContent += `
          <div class="escala">
            <h2>Data: ${data}</h2>
        `;
        escala[data].forEach((organista) => {
          htmlContent += `
            <p><span class="data">${organista.data}</span> - ${organista.nome} - <span class="tipo">${organista.tipo}</span></p>
          `;
        });
        htmlContent += `</div>`;
      });

      htmlContent += `
          </body>
        </html>
      `;

      // Gerar o PDF a partir do conteúdo HTML
      const { uri } = await printToFileAsync({
        html: htmlContent,
      });

      // Mostrar o caminho do arquivo gerado
      Alert.alert('PDF Gerado', `Escala gerada com sucesso!\nCaminho: ${uri}`);
      console.log('PDF Gerado:', uri);

      // Compartilhar o PDF gerado
      if (Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
      }

    } catch (error) {
      console.error('Erro ao gerar o PDF:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao gerar o PDF.');
    }
  };

  // Função para limpar a escala gerada
  const limparEscala = () => {
    setEscala(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerador de Rodizio</Text>

      {/* Formulário de Cadastro */}
      <TextInput
        style={styles.input}
        placeholder="Nome da Organista"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Dias da semana (ex: terça, quinta)"
        value={disponibilidade}
        onChangeText={setDisponibilidade}
      />
      <Button title="Adicionar Organista" onPress={adicionarOrganista} />

      {/* Seleção de Mês e Ano */}
      <TextInput
        style={styles.input}
        placeholder="Mês (1 a 12)"
        value={mes}
        keyboardType="numeric"
        onChangeText={setMes}
      />
      <TextInput
        style={styles.input}
        placeholder="Ano (ex: 2024)"
        value={ano}
        keyboardType="numeric"
        onChangeText={setAno}
      />

      {/* Seleção de Dias da Semana */}
      <TextInput
        style={styles.input}
        placeholder="Dias da semana (ex: terça, quinta)"
        value={diasSelecionados}
        onChangeText={setDiasSelecionados}
      />

      {/* Lista de Organistas */}
      <Text style={styles.subtitle}>Organistas</Text>
      <FlatList
        data={organistas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.nome} - {item.disponibilidade.join(', ')}
          </Text>
        )}
      />

      {/* Botão para gerar a escala */}
      <Button title="Gerar Rodizio" onPress={gerarEscala} />

      {/* Botão para limpar a escala */}
      <View style={styles.spacing}>
        <Button title="Limpar Rodizio" onPress={limparEscala} />
      </View>

      {/* Botão para gerar o PDF */}
      <View style={styles.spacing}>
        <Button title="Gerar PDF" onPress={gerarPDF} />
      </View>

      {/* Resultado da Escala - Usando ScrollView */}
      {escala && (
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.subtitle}>Escala Gerada</Text>
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop:50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    fontSize: 14,
    marginBottom: 5,
  },
  spacing: {
    marginVertical: 10,
  },
  scrollContainer: {
    marginTop: 20,
  },
});

export default App;

