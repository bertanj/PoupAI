import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, TextInput, Platform, Alert, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alterarValor, criarMeta, getMetas, removerMeta, Meta } from "../../src/services/meta";

function formatCurrencyBR(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  const intValue = parseInt(digits, 10);
  const value = (intValue / 100).toFixed(2);
  return value.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function parseBRLToNumber(br: string): number {
  if (!br) return NaN;
  return Number(br.replace(/\./g, "").replace(",", "."));
}
function maskDateBR(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  if (digits.length <= 2) return dd;
  if (digits.length <= 4) return `${dd}/${mm}`;
  return `${dd}/${mm}/${yyyy}`;
}
function brToISO(d: string): string | null {
  const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}
function isoToBR(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
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
  voltarBtn: { marginRight: 12 },

  sectionTitle: {
    fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8, color: "#222", paddingHorizontal: 16,
  },
  novaMetaBtn: { marginLeft: "auto", marginRight: 16, marginTop: 2 },
  novaMetaText: { color: "#7B5CFA", fontWeight: "bold", fontSize: 15 },

  metaBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metaHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  metaNome: { fontSize: 17, fontWeight: "bold", color: "#222" },
  metaValor: { fontSize: 16, color: "#7B5CFA", fontWeight: "bold" },
  metaData: { fontSize: 13, color: "#888", marginBottom: 6 },
  progressLabel: { fontSize: 13, color: "#7B5CFA", fontWeight: "bold", marginBottom: 2 },
  progressBarBox: { width: "100%", height: 8, backgroundColor: "#E5E7EB", borderRadius: 4, marginBottom: 4 },
  progressBar: { height: 8, borderRadius: 4 },
  progressValores: { fontSize: 13, color: "#888", marginBottom: 8, marginTop: 2 },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  addBtn: { flex: 1, backgroundColor: "#E0F2FE", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  addText: { color: "#0EA5E9", fontWeight: "bold", fontSize: 15 },
  removeBtn: { flex: 1, backgroundColor: "#FEE2E2", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  removeText: { color: "#EF4444", fontWeight: "bold", fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: { width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 6 },
  input: {
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 12, fontSize: 16,
    backgroundColor: "#F9FAFB", color: "#111827", marginBottom: 10,
  },
  modalBtnsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  modalBtnText: { fontWeight: "bold" },
});

export default function Goals() {
  const router = useRouter();
  const usuarioId = 1;
  const qc = useQueryClient();

  const metasQ = useQuery<Meta[]>({
    queryKey: ["metas", usuarioId],
    queryFn: () => getMetas(usuarioId),
  });

  const criarMetaMut = useMutation({
    mutationFn: (meta: Meta) => criarMeta(meta),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["metas", usuarioId] }),
  });

  const alterarValorMut = useMutation({
    mutationFn: ({ metaId, delta }: { metaId: number; delta: number }) =>
      alterarValor(metaId, delta),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["metas", usuarioId] }),
  });

  const removerMetaMut = useMutation({
    mutationFn: (id: number) => removerMeta(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["metas", usuarioId] }),
  });

  const [valueModalVisible, setValueModalVisible] = useState(false);
  const [valueMode, setValueMode] = useState<"add" | "remove">("add");
  const [activeMeta, setActiveMeta] = useState<Meta | null>(null);
  const [valorInput, setValorInput] = useState("");

  const [newModalVisible, setNewModalVisible] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [novaData, setNovaData] = useState("");

  const metas = metasQ.data ?? [];

  const openValueModal = (meta: Meta, mode: "add" | "remove") => {
    setActiveMeta(meta);
    setValueMode(mode);
    setValorInput("");
    setValueModalVisible(true);
  };

  const aplicarValor = () => {
    if (!activeMeta) return;
    const valorNum = parseBRLToNumber(valorInput);
    if (!valorInput || isNaN(valorNum) || valorNum <= 0) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.");
      return;
    }
    const delta = valueMode === "add" ? valorNum : -valorNum;
    alterarValorMut.mutate(
      { metaId: activeMeta.id, delta },
      {
        onSuccess: () => setValueModalVisible(false),
        onError: (e: any) => {
          const msg = e?.response?.data
            ? (typeof e.response.data === "string" ? e.response.data : JSON.stringify(e.response.data))
            : e?.message || "Falha ao atualizar valor.";
          Alert.alert("Erro", msg);
        },
      }
    );
  };

  const abrirNovaMeta = () => {
    setNovoNome("");
    setNovoValor("");
    setNovaData("");
    setNewModalVisible(true);
  };

  const criarMetaHandle = () => {
    const nome = novoNome.trim();
    const total = parseBRLToNumber(novoValor);
    const iso = brToISO(novaData);

    if (!nome || isNaN(total) || total <= 0 || !iso) {
      Alert.alert("Campos obrigatórios", "Informe nome, valor total (> 0) e data (dd/mm/aaaa).");
      return;
    }

    const metaToCreate: Meta = {
      id: 0,
      descricao: nome,
      valorAlvo: total,
      valorAtual: 0,
      data: iso,
      atingida: false,
      usuarioId,
    };

    criarMetaMut.mutate(metaToCreate, {
      onSuccess: () => setNewModalVisible(false),
      onError: (e: any) => {
        const msg = e?.response?.data
          ? (typeof e.response.data === "string" ? e.response.data : JSON.stringify(e.response.data))
          : e?.message || "Falha ao criar meta.";
        Alert.alert("Erro", msg);
      },
    });
  };

  const confirmRemove = (meta: Meta) => {
    Alert.alert(
      "Remover meta",
      `Deseja remover a meta "${meta.descricao}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () =>
            removerMetaMut.mutate(meta.id, {
              onError: (e: any) => {
                const msg = e?.response?.data
                  ? (typeof e.response.data === "string" ? e.response.data : JSON.stringify(e.response.data))
                  : e?.message || "Falha ao remover meta.";
                Alert.alert("Erro", msg);
              },
            }),
        },
      ]
    );
  };

  if (metasQ.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Carregando metas...</Text>
      </View>
    );
  }
  if (metasQ.error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "#EF4444", fontWeight: "bold" }}>Erro ao carregar metas</Text>
        <Text style={{ marginTop: 8 }}>
          {String((metasQ.error as any)?.message || "Erro")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.voltarBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Metas</Text>
        </View>
      </View>

      {/* Título + Nova meta */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 8 }}>
        <Text style={styles.sectionTitle}>Minhas metas</Text>
        <TouchableOpacity style={styles.novaMetaBtn} onPress={abrirNovaMeta}>
          <Text style={styles.novaMetaText}>+ Nova meta</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {metas.map((meta) => {
          const percent =
            meta.valorAlvo > 0
              ? Math.min(Math.round((meta.valorAtual / meta.valorAlvo) * 100), 100)
              : 0;
          const falta = Math.max(0, meta.valorAlvo - meta.valorAtual);
          const cor = meta.atingida ? "#22C55E" : "#7B5CFA";

          return (
            <View key={meta.id} style={styles.metaBox}>
              <View style={styles.metaHeader}>
                <Text style={styles.metaNome}>{meta.descricao}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={[styles.metaValor, { color: cor }]}>
                    R$ {meta.valorAlvo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </Text>

                  <TouchableOpacity
                    onPress={() => confirmRemove(meta)}
                    accessibilityLabel="Remover meta"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    disabled={removerMetaMut.isPending}
                  >
                    <Feather name="trash-2" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.metaData}>Até {isoToBR(meta.data)}</Text>

              <Text style={[styles.progressLabel, { color: cor }]}>Progresso: {percent}%</Text>
              <View style={styles.progressBarBox}>
                <View style={[styles.progressBar, { width: `${percent}%`, backgroundColor: cor }]} />
              </View>

              <Text style={styles.progressValores}>
                R$ {meta.valorAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R${" "}
                {meta.valorAlvo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} • Faltam R${" "}
                {falta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => openValueModal(meta, "add")}
                >
                  <Text style={styles.addText}>Adicionar valor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => openValueModal(meta, "remove")}
                >
                  <Text style={styles.removeText}>Remover valor</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Modal valor */}
      <Modal
        visible={valueModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setValueModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {valueMode === "add" ? "Adicionar valor" : "Remover valor"}
            </Text>

            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
              placeholderTextColor="#9CA3AF"
              value={valorInput}
              onChangeText={(t) => setValorInput(formatCurrencyBR(t))}
              maxLength={20}
            />

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F3F4F6" }]}
                onPress={() => setValueModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: "#111827" }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: valueMode === "add" ? "#0EA5E9" : "#EF4444" },
                ]}
                onPress={aplicarValor}
                disabled={alterarValorMut.isPending}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                  {valueMode === "add" ? "Adicionar" : "Remover"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal nova meta */}
      <Modal
        visible={newModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nova meta</Text>

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Trocar de celular"
              placeholderTextColor="#9CA3AF"
              value={novoNome}
              onChangeText={setNovoNome}
            />

            <Text style={styles.label}>Data limite</Text>
            <TextInput
              style={styles.input}
              placeholder="dd/mm/aaaa"
              placeholderTextColor="#9CA3AF"
              keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
              value={novaData}
              onChangeText={(t) => setNovaData(maskDateBR(t))}
              maxLength={10}
            />

            <Text style={styles.label}>Valor total (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor="#9CA3AF"
              keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
              value={novoValor}
              onChangeText={(t) => setNovoValor(formatCurrencyBR(t))}
              maxLength={20}
            />

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F3F4F6" }]}
                onPress={() => setNewModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: "#111827" }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#7B5CFA" }]}
                onPress={criarMetaHandle}
                disabled={criarMetaMut.isPending}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Criar meta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
