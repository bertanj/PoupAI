import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
  getResumoMensal,
  getGastosPorCategoria,
  ResumoMensal,
  CategoriaItem,
} from "../../src/services/dashboard";
import { getAlertas, ContaAlertas } from "../../src/services/conta";
import { Picker } from "@react-native-picker/picker";

const screenWidth = Dimensions.get("window").width;

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export default function HomeScreen() {
  const router = useRouter();
  const usuarioId = 1;

  const hoje = new Date();
  const currentYear = hoje.getFullYear();
  const currentMonth = hoje.getMonth() + 1; 

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [tmpMonth, setTmpMonth] = useState<number>(selectedMonth);
  const [tmpYear, setTmpYear] = useState<number>(selectedYear);

  const years = useMemo(() => {
    const start = currentYear - 5;
    const end = currentYear + 1;
    const arr: number[] = [];
    for (let y = start; y <= end; y++) arr.push(y);
    return arr;
  }, [currentYear]);

  const resumoQ = useQuery<ResumoMensal>({
    queryKey: ["resumo-mensal", usuarioId, selectedYear, selectedMonth],
    queryFn: () => getResumoMensal(usuarioId, selectedYear, selectedMonth),
  });

  const categoriasQ = useQuery<CategoriaItem[]>({
    queryKey: ["gastos-categoria", usuarioId, selectedYear, selectedMonth],
    queryFn: () => getGastosPorCategoria(usuarioId, selectedYear, selectedMonth),
  });

  const alertasQ = useQuery<ContaAlertas>({
    queryKey: ["alertas", usuarioId],
    queryFn: () => getAlertas(usuarioId),
    retry: false,
  });

  const { refetch: refetchResumo } = resumoQ;
  const { refetch: refetchCategorias } = categoriasQ;
  const { refetch: refetchAlertas } = alertasQ;

  useFocusEffect(
    useCallback(() => {
      refetchResumo();
      refetchCategorias();
      refetchAlertas();
    }, [refetchResumo, refetchCategorias, refetchAlertas])
  );

  const resumo = resumoQ.data ?? { saldo: 0, totalreceitas: 0, totaldespesas: 0 };
  const categorias = categoriasQ.data ?? [];

  const resumoData = useMemo(
    () => [
      { label: "Entradas", value: resumo.totalreceitas, color: "#3B82F6", bg: "#E0F2FE" },
      { label: "Saídas", value: resumo.totaldespesas, color: "#EF4444", bg: "#FEE2E2" },
      { label: "Economia", value: resumo.saldo, color: "#22C55E", bg: "#DCFCE7" },
    ],
    [resumo]
  );

  const totalCategorias = useMemo(
    () => categorias.reduce((acc, c) => acc + (Number(c.total) || 0), 0),
    [categorias]
  );

  const corCategoria = useCallback((categoria: string) => {
    switch (categoria) {
      case "Alimentação":
        return "#EF4444";
      case "Viagem":
        return "#1E40AF";
      case "Saude":
        return "#22C55E";
      case "Transporte":
        return "#FACC15";
      case "Lazer":
        return "#93C5FD";
      default:
        return "#FF6384";
    }
  }, []);

  const periodoLabel = useMemo(() => {
    const m = MONTHS.find((x) => x.value === selectedMonth)?.label ?? "";
    return `${m} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  if (resumoQ.isLoading || categoriasQ.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Carregando...</Text>
      </View>
    );
  }

  if (resumoQ.error || categoriasQ.error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "#EF4444", fontWeight: "bold" }}>Erro ao carregar dados</Text>
        <Text style={{ color: "#666", marginTop: 8 }}>
          {String(
            (resumoQ.error as any)?.message ||
              (categoriasQ.error as any)?.message ||
              "Tente novamente."
          )}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Header */}
      <View style={styles.headerBox}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.headerTitle}>Poupai</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
            <Feather name="user" size={22} color="#7B5CFA" />
          </TouchableOpacity>
        </View>

        {/* Chip do período (abre modal) */}
        <TouchableOpacity
          style={styles.periodChip}
          onPress={() => {
            setTmpMonth(selectedMonth);
            setTmpYear(selectedYear);
            setPickerVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Feather name="calendar" size={16} color="#7B5CFA" />
          <Text style={styles.periodChipText}>{periodoLabel}</Text>
          <Feather name="chevron-down" size={16} color="#7B5CFA" />
        </TouchableOpacity>

        <Text style={styles.saldoLabel}>Saldo disponível</Text>
        <Text style={styles.saldoValor}>
          R${" "}
          {Number(resumo.saldo).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Alertas de contas */}
      {alertasQ.data && (
        (alertasQ.data.quantVencidas > 0 || alertasQ.data.quantProximas > 0 ||
         alertasQ.data.totalAPagar > 0 || alertasQ.data.totalAReceber > 0) && (
          <View style={{ marginBottom: 16 }}>
            {alertasQ.data.quantVencidas > 0 && (
              <TouchableOpacity
                style={styles.alertaVencido}
                onPress={() => router.push("/contas")}
                activeOpacity={0.8}
              >
                <Feather name="alert-circle" size={18} color="#EF4444" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.alertaVencidoTitulo}>
                    {alertasQ.data.quantVencidas} conta{alertasQ.data.quantVencidas > 1 ? "s" : ""} vencida{alertasQ.data.quantVencidas > 1 ? "s" : ""}
                  </Text>
                  <Text style={styles.alertaVencidoSub}>
                    R$ {alertasQ.data.valorVencidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em atraso
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
            {alertasQ.data.quantProximas > 0 && (
              <TouchableOpacity
                style={styles.alertaProximo}
                onPress={() => router.push("/contas")}
                activeOpacity={0.8}
              >
                <Feather name="clock" size={18} color="#D97706" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.alertaProximoTitulo}>
                    {alertasQ.data.quantProximas} conta{alertasQ.data.quantProximas > 1 ? "s" : ""} vence{alertasQ.data.quantProximas > 1 ? "m" : ""} em 7 dias
                  </Text>
                  <Text style={styles.alertaProximoSub}>
                    R$ {alertasQ.data.valorProximas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} a pagar
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#D97706" />
              </TouchableOpacity>
            )}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {alertasQ.data.totalAPagar > 0 && (
                <View style={styles.infoChipPagar}>
                  <Feather name="arrow-up-circle" size={14} color="#EF4444" />
                  <Text style={styles.infoChipPagarText}>
                    A pagar: R$ {alertasQ.data.totalAPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              )}
              {alertasQ.data.totalAReceber > 0 && (
                <View style={styles.infoChipReceber}>
                  <Feather name="arrow-down-circle" size={14} color="#22C55E" />
                  <Text style={styles.infoChipReceberText}>
                    A receber: R$ {alertasQ.data.totalAReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )
      )}

      {/* Tabs */}
      <View style={styles.tabsBox}>
        <TouchableOpacity onPress={() => {}}>
          <Text style={[styles.tabActive]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/transactions")}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Feather name="list" size={16} color="#888" style={{ marginRight: 4 }} />
          <Text style={styles.tab}>Transações</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/goals")}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <FontAwesome5 name="bullseye" size={16} color="#888" style={{ marginRight: 4 }} />
          <Text style={styles.tab}>Metas</Text>
        </TouchableOpacity>
      </View>

      {/* Resumo do mês */}
      <View style={styles.cardBox}>
        <Text style={styles.sectionTitle}>Resumo do mês</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {resumoData.map((item) => (
            <View key={item.label} style={[styles.resumoMesBox, { backgroundColor: item.bg }]}>
              <Text style={[styles.resumoMesLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={[styles.resumoMesValor, { color: item.color }]}>
                R{"$ "}
                {Number(item.value).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Gastos por categoria */}
      <View style={styles.cardBox}>
        <Text style={styles.sectionTitle}>Gastos por categoria</Text>
        {categorias.length === 0 && (
          <Text style={{ color: "#888" }}>Sem gastos no período.</Text>
        )}

        {categorias.map((cat) => (
          <View key={cat.categoria} style={styles.categoriaRow}>
            <View style={[styles.categoriaIcon, { backgroundColor: corCategoria(cat.categoria) }]}>
              <Feather name="shopping-bag" size={16} color={corCategoria(cat.categoria)} />
            </View>
            <Text style={styles.categoriaNome}>{cat.categoria}</Text>
            <Text style={styles.categoriaValor}>
              {Number(cat.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ))}

        {categorias.map((cat) => (
          <View key={cat.categoria + "-bar"} style={styles.progressBarBox}>
            <View
              style={[
                styles.progressBar,
                {
                  width:
                    totalCategorias > 0
                      ? `${(Number(cat.total) / totalCategorias) * 100}%`
                      : "0%",
                  backgroundColor: corCategoria(cat.categoria),
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Gráfico de pizza */}
      <View style={styles.cardBox}>
        <Text style={styles.sectionTitle}>Distribuição dos gastos</Text>
        {categorias.length > 0 ? (
          <PieChart
            data={categorias.map((cat) => {
              const percentual =
                totalCategorias > 0
                  ? Math.round((Number(cat.total) / totalCategorias) * 100)
                  : 0;
              return {
                name: `(${percentual}%)`,
                population: percentual,
                color: corCategoria(cat.categoria),
                legendFontColor: "#7F7F7F",
                legendFontSize: 15,
              };
            })}
            width={screenWidth - 40}
            height={220}
            chartConfig={{ color: () => "#000" }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="20"
            absolute
          />
        ) : (
          <Text style={{ color: "#888" }}>Sem dados para o gráfico.</Text>
        )}
      </View>

      {/* Gerenciar */}
      <View style={styles.cardBox}>
        <Text style={styles.sectionTitle}>Gerenciar</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.gerenciarCard} onPress={() => router.push("/categorias")} activeOpacity={0.8}>
            <View style={[styles.gerenciarIcon, { backgroundColor: "#EDE9FE" }]}>
              <Feather name="tag" size={20} color="#7B5CFA" />
            </View>
            <Text style={styles.gerenciarLabel}>Categorias</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gerenciarCard} onPress={() => router.push("/contatos")} activeOpacity={0.8}>
            <View style={[styles.gerenciarIcon, { backgroundColor: "#FEE2E2" }]}>
              <Feather name="users" size={20} color="#EF4444" />
            </View>
            <Text style={styles.gerenciarLabel}>Contatos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gerenciarCard} onPress={() => router.push("/contas")} activeOpacity={0.8}>
            <View style={[styles.gerenciarIcon, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="file-text" size={20} color="#22C55E" />
            </View>
            <Text style={styles.gerenciarLabel}>Contas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal seletor de mês/ano */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecionar período</Text>
            <View style={styles.pickersRow}>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Mês</Text>
                <View style={styles.inputPicker}>
                  <Picker
                    selectedValue={tmpMonth}
                    onValueChange={(v) => setTmpMonth(Number(v))}
                    mode="dialog"
                    style={{ height: 48 }}
                  >
                    {MONTHS.map((m) => (
                      <Picker.Item key={m.value} label={m.label} value={m.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Ano</Text>
                <View style={styles.inputPicker}>
                  <Picker
                    selectedValue={tmpYear}
                    onValueChange={(v) => setTmpYear(Number(v))}
                    mode="dialog"
                    style={{ height: 48 }}
                  >
                    {years.map((y) => (
                      <Picker.Item key={y} label={String(y)} value={y} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F3F4F6" }]}
                onPress={() => setPickerVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: "#111827" }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#7B5CFA" }]}
                onPress={() => {
                  setSelectedMonth(tmpMonth);
                  setSelectedYear(tmpYear);
                  setPickerVisible(false);
                }}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    backgroundColor: "#7B5CFA",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  periodChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#EDE9FE",
    marginTop: 12,
  },
  periodChipText: {
    color: "#7B5CFA",
    fontWeight: "bold",
  },
  saldoLabel: {
    color: "#E0E7FF",
    fontSize: 16,
    marginTop: 16,
  },
  saldoValor: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 4,
  },
  tabsBox: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  tab: {
    fontSize: 16,
    color: "#888",
    marginRight: 24,
    paddingBottom: 8,
  },
  tabActive: {
    fontSize: 16,
    color: "#7B5CFA",
    marginRight: 24,
    borderBottomWidth: 2,
    borderColor: "#7B5CFA",
    paddingBottom: 8,
    fontWeight: "bold",
  },
  cardBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  resumoMesBox: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  resumoMesLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resumoMesValor: {
    fontSize: 16,
    fontWeight: "bold",
  },
  categoriaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoriaNome: {
    fontSize: 16,
    color: "#222",
  },
  categoriaValor: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
  },
  progressBarBox: {
    width: "100%",
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  categoriaIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  pickersRow: {
    flexDirection: "row",
    gap: 12,
  },
  pickerCol: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  inputPicker: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  modalBtnsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnText: {
    fontWeight: "bold",
  },
  alertaVencido: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  alertaVencidoTitulo: { fontSize: 14, fontWeight: "bold", color: "#EF4444" },
  alertaVencidoSub: { fontSize: 12, color: "#EF4444" },
  alertaProximo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  alertaProximoTitulo: { fontSize: 14, fontWeight: "bold", color: "#D97706" },
  alertaProximoSub: { fontSize: 12, color: "#D97706" },
  infoChipPagar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 8,
  },
  infoChipPagarText: { fontSize: 12, fontWeight: "600", color: "#EF4444", flex: 1 },
  infoChipReceber: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
    padding: 8,
  },
  infoChipReceberText: { fontSize: 12, fontWeight: "600", color: "#22C55E", flex: 1 },
  gerenciarCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  gerenciarIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  gerenciarLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});
