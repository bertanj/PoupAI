import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { useQuery } from "@tanstack/react-query";

import {
  getUltimasTransacoes,
  Transacao as ApiTransacao,
} from "../../src/services/transacao";
import { criarReceita } from "../../src/services/receita";
import { criarDespesa } from "../../src/services/despesa";

const filters = [
  { label: "Todos", value: "todos" as const },
  { label: "Receitas", value: "entrada" as const },
  { label: "Despesas", value: "saida" as const },
];

type FeatherGlyphs = "shopping-cart" | "dollar-sign" | "coffee" | "filter";

type UITransacao = {
  tipo: "entrada" | "saida";
  categoria: string;
  valor: number;
  descricao?: string;
  icone: FeatherGlyphs;
  data: string;
};

const categoriasList = [
  { label: "Alimentação", value: "Alimentação", icone: "shopping-cart", id: 1 },
  { label: "Transporte", value: "Transporte", icone: "shopping-cart", id: 2 },
  { label: "Saúde", value: "Saúde", icone: "shopping-cart", id: 3 },
  { label: "Lazer", value: "Lazer", icone: "coffee", id: 4 },
  { label: "Viagem", value: "Viagem", icone: "shopping-cart", id: 5 },
];

function getCategoriaIcon(categoria: string): FeatherGlyphs {
  const found = categoriasList.find((c) => c.value === categoria);
  return (found?.icone as FeatherGlyphs) || "shopping-cart";
}

function formatDateLabel(dateISO: string) {
  const d = new Date(dateISO);
  if (isNaN(d.getTime())) return "Data inválida";
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, hoje))
    return `Hoje, ${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}`;
  if (sameDay(d, ontem))
    return `Ontem, ${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}`;
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

/** Só é RECEITA se vier "Receita"/"Entrada"/equivalentes; qualquer outra coisa => DESPESA */
function mapApiTipoToUI(raw: any): "entrada" | "saida" {
  if (raw === undefined || raw === null) return "saida";
  const v = String(raw)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

  if (v === "receita" || v === "entrada" || v === "credito" || v === "credit" || v === "income") {
    return "entrada";
  }
  return "saida";
}

/** Máscara de data: mantém apenas dígitos e formata como dd/mm/yyyy */
function maskDateBR(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  if (digits.length <= 2) return dd;
  if (digits.length <= 4) return `${dd}/${mm}`;
  return `${dd}/${mm}/${yyyy}`;
}

function parseDateBRtoISO(d: string) {
  const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

function todayBR(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = String(now.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function formatCurrencyBR(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 0) return "";
  const intValue = parseInt(digits, 10);
  const value = (intValue / 100).toFixed(2); 
  return value
    .replace(".", ",") 
    .replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
}

/** Converte string BR para número JS (1.234,56 -> 1234.56) */
function parseBRLToNumber(br: string): number {
  if (!br) return NaN;
  return Number(br.replace(/\./g, "").replace(",", "."));
}

/** CategoryPicker iOS/Android robusto (ActionSheet no iOS, Dialog no Android) */
function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  if (Platform.OS === "ios") {
    const abrirSheet = () => {
      Keyboard.dismiss();
      const labels = categoriasList.map((c) => c.label);
      const options = [...labels, "Cancelar"];
      const cancelButtonIndex = options.length - 1;
      ActionSheetIOS.showActionSheetWithOptions(
        { title: "Categoria", options, cancelButtonIndex },
        (idx) => {
          if (idx !== cancelButtonIndex) {
            const escolhido = categoriasList[idx].value;
            onChange(escolhido);
          }
        }
      );
    };

    return (
      <TouchableOpacity style={styles.input} onPress={abrirSheet} activeOpacity={0.7}>
        <Text style={{ color: value ? "#222" : "#bbb" }}>
          {value || "Selecione uma categoria"}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.inputPicker}>
      <Picker
        selectedValue={value}
        onValueChange={(v) => onChange(String(v))}
        mode="dialog"
        style={{ height: 48 }}
        dropdownIconColor="#7B5CFA"
      >
        {categoriasList.map((cat) => (
          <Picker.Item key={cat.id} label={cat.label} value={cat.value} />
        ))}
      </Picker>
    </View>
  );
}

export default function Transactions() {
  const router = useRouter();
  const usuarioId = 1;

  const [selectedFilter, setSelectedFilter] = useState<"todos" | "entrada" | "saida">("todos");

  const [modalVisible, setModalVisible] = useState(false);
  const [tipo, setTipo] = useState<"despesa" | "receita">("despesa");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(""); 
  const [categoria, setCategoria] = useState(categoriasList[0].value);
  const [data, setData] = useState(todayBR()); 

  const q = useQuery({
    queryKey: ["ultimas-transacoes", usuarioId],
    queryFn: async () => {
      const response = await getUltimasTransacoes(usuarioId, 30, 0);
      return response;
    },
  });

  useEffect(() => {
    if (modalVisible) {
      setData(todayBR());
      setValor("");
    }
  }, [modalVisible]);

  useEffect(() => {
    if (tipo === "receita") {
      setCategoria("");
    } else {
      if (!categoria) setCategoria(categoriasList[0].value);
    }
  }, [tipo]);

  const uiTransacoes: UITransacao[] = useMemo(() => {
    const src: ApiTransacao[] = q.data || [];
    return src.map((t) => {
      const tipoUI = mapApiTipoToUI((t as any).tipo);

    
      const categoriaBackend =
        (t as any).categoria || (tipoUI === "saida" ? String((t as any).tipo || "").trim() : "");

      const descricao = t.descricao || (tipoUI === "entrada" ? "Receita" : "Despesa");

      return {
        tipo: tipoUI,
        categoria: categoriaBackend,
        descricao,
        valor: Number((t as any).valor),
        icone: tipoUI === "entrada" ? "dollar-sign" : getCategoriaIcon(categoriaBackend),
        data: (t as any).data,
      };
    });
  }, [q.data]);

  const filtered = useMemo(() => {
    if (selectedFilter === "todos") return uiTransacoes;
    return uiTransacoes.filter((t) => t.tipo === selectedFilter);
  }, [selectedFilter, uiTransacoes]);

  const grouped = useMemo(() => {
    const map = new Map<string, UITransacao[]>();
    for (const t of filtered) {
      const label = formatDateLabel(t.data);
      map.set(label, [...(map.get(label) || []), t]);
    }
    return Array.from(map.entries())
      .map(([dateLabel, data]) => ({
        dateLabel,
        data: data.sort((a, b) => +new Date(b.data) - +new Date(a.data)),
      }))
      .sort((a, b) => {
        const ad = a.data[0]?.data ? +new Date(a.data[0].data) : 0;
        const bd = b.data[0]?.data ? +new Date(b.data[0].data) : 0;
        return bd - ad;
      });
  }, [filtered]);

  async function handleSalvar() {
    if (!descricao || !valor || !data || (tipo === "despesa" && !categoria)) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha descrição, valor e data (e categoria se for despesa)."
      );
      return;
    }
    const valorNum = parseBRLToNumber(valor);
    if (isNaN(valorNum)) {
      Alert.alert("Valor inválido", "Informe um número válido em Valor.");
      return;
    }
    const iso = parseDateBRtoISO(data);
    if (!iso) {
      Alert.alert("Data inválida", "Use o formato dd/mm/aaaa.");
      return;
    }

    try {
      if (tipo === "receita") {
        await criarReceita({
          usuarioId,
          descricao,
          valor: Math.abs(valorNum),
          data: iso,
        });
      } else {
        const categoriaId =
          categoriasList.find((c) => c.value === categoria)?.id || 1;
        await criarDespesa({
          usuarioId,
          descricao,
          valor: Math.abs(valorNum),
          data: iso,
          categoriaId,
        });
      }

      setModalVisible(false);
      setTipo("despesa");
      setDescricao("");
      setValor("");
      setCategoria(categoriasList[0].value);
      setData(todayBR());

      q.refetch();
      Alert.alert("OK", "Transação salva com sucesso!");
    } catch (e: any) {
      const msg = e?.response?.data
        ? JSON.stringify(e.response.data)
        : e?.message || "Erro ao salvar";
      Alert.alert("Erro", msg);
    }
  }

  if (q.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Carregando transações...</Text>
      </View>
    );
  }

  if (q.error) {
    const er = q.error as any;
    const msg = er?.response?.data
      ? JSON.stringify(er.response.data)
      : er?.message || "Erro";
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "#EF4444", fontWeight: "bold" }}>
          Erro ao carregar transações
        </Text>
        <Text selectable style={{ marginTop: 8 }}>{msg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace("/home")}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transações</Text>
        </View>
        <View style={styles.filterBar}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterBtn,
                selectedFilter === f.value && styles.filterBtnActive,
              ]}
              onPress={() => setSelectedFilter(f.value)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  selectedFilter === f.value && styles.filterBtnTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.filterIcon}>
            <Feather name="filter" size={18} color="#7B5CFA" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Todas as transações</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
      >
        {grouped.map((group, idx) => (
          <View key={idx}>
            <Text style={styles.groupDate}>{group.dateLabel}</Text>
            {group.data.map((t, i) => (
              <View key={i} style={styles.card}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: t.tipo === "entrada" ? "#E6F9F0" : "#FDECEC" },
                  ]}
                >
                  <Feather
                    name={t.icone}
                    size={22}
                    color={t.tipo === "entrada" ? "#22C55E" : "#EF4444"}
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {t.categoria || (t.tipo === "entrada" ? "Receita" : "Despesa")}
                  </Text>
                  <Text style={styles.cardDesc}>
                    {t.descricao || (t.tipo === "entrada" ? "Receita" : "Despesa")}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.cardValue,
                    { color: t.tipo === "entrada" ? "#22C55E" : "#EF4444" },
                  ]}
                >
                  {t.tipo === "entrada" ? "+ " : "- "}
                  R{"$ "}
                  {Math.abs(t.valor).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* MODAL Nova Transação */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova transação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#222" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Tipo</Text>
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              <Pressable
                style={[styles.tipoBtn, tipo === "despesa" && styles.tipoBtnAtivoDespesa]}
                onPress={() => setTipo("despesa")}
              >
                <Text
                  style={[styles.tipoBtnText, tipo === "despesa" && styles.tipoBtnTextAtivoDespesa]}
                >
                  Despesa
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tipoBtn, tipo === "receita" && styles.tipoBtnAtivoReceita]}
                onPress={() => setTipo("receita")}
              >
                <Text
                  style={[styles.tipoBtnText, tipo === "receita" && styles.tipoBtnTextAtivoReceita]}
                >
                  Receita
                </Text>
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              value={descricao}
              onChangeText={setDescricao}
              placeholderTextColor="#bbb"
            />

            <Text style={styles.modalLabel}>Valor (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType="numeric"
              value={valor}
              onChangeText={(txt) => setValor(formatCurrencyBR(txt))}
              placeholderTextColor="#bbb"
              maxLength={20}
            />

            {tipo === "despesa" && (
              <>
                <Text style={styles.modalLabel}>Categoria</Text>
                <CategoryPicker value={categoria} onChange={setCategoria} />
                {!!categoria && (
                  <Text style={{ color: "#888", fontSize: 13, marginBottom: 8, marginLeft: 2 }}>
                    Categoria selecionada: {categoria}
                  </Text>
                )}
              </>
            )}

            <Text style={styles.modalLabel}>Data</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="dd/mm/aaaa"
                value={data}
                onChangeText={(txt) => setData(maskDateBR(txt))}
                placeholderTextColor="#bbb"
                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
                maxLength={10}
              />
              <Feather name="calendar" size={20} color="#bbb" style={{ marginLeft: 8 }} />
            </View>

            <TouchableOpacity style={styles.modalSalvarBtn} onPress={handleSalvar}>
              <Text style={styles.modalSalvarText}>Salvar</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
              <Feather name="alert-circle" size={16} color="#FACC15" style={{ marginRight: 6 }} />
              <Text style={styles.modalDica}>Revise seus gastos semanalmente</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#7B5CFA",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginLeft: 8 },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F3F4F6",
  },
  filterBtnActive: { backgroundColor: "#E0D7FF" },
  filterBtnText: { fontSize: 15, color: "#6B7280", fontWeight: "500" },
  filterBtnTextActive: { color: "#7B5CFA", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#222",
    paddingHorizontal: 16,
  },
  groupDate: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  cardDesc: { fontSize: 13, color: "#888", marginTop: 2 },
  cardValue: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  filterIcon: {
    marginLeft: "auto",
    marginRight: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 8,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7B5CFA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#222" },
  modalLabel: { fontSize: 15, fontWeight: "bold", color: "#222", marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
    color: "#222",
  },
  inputPicker: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  tipoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    marginRight: 8,
  },
  tipoBtnAtivoDespesa: { backgroundColor: "#FECACA" },
  tipoBtnAtivoReceita: { backgroundColor: "#c1f7c3", marginRight: 0 },
  tipoBtnText: { fontSize: 15, fontWeight: "bold", color: "#888" },
  tipoBtnTextAtivoDespesa: { color: "#EF4444" },
  tipoBtnTextAtivoReceita: { color: "#22C55E" },
  modalSalvarBtn: {
    backgroundColor: "#7B5CFA",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
  },
  modalSalvarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalDica: { color: "#888", fontSize: 13 },
});
