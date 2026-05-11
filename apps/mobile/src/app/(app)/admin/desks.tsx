import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useDesksQuery, useCreateDesk, useDeleteDesk } from "@/features/desks/useDesksQuery";
import { colors, spacing, radius, rnShadows } from "@team-flow/shared";

export default function AdminDesksScreen() {
  const { data: desks, isLoading, refetch } = useDesksQuery();
  const { mutate: createDesk, isPending: isCreating } = useCreateDesk();
  const { mutate: deleteDesk } = useDeleteDesk();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createDesk(name, {
      onSuccess: () => {
        setNewName("");
        setShowAdd(false);
      },
    });
  }

  function handleDelete(id: string, name: string) {
    Alert.alert(
      "Delete desk",
      `Delete "${name}"? This will also cancel all future reservations.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteDesk(id),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text variant="h2">Manage Desks</Text>
        <Pressable onPress={() => setShowAdd(true)} style={styles.addBtn} hitSlop={12}>
          <Ionicons name="add-circle" size={28} color={colors.accent.primary} />
        </Pressable>
      </View>

      {/* Add desk panel */}
      {showAdd && (
        <View style={styles.addPanel}>
          <TextInput
            style={styles.input}
            placeholder="Desk name (e.g. Window Spot 01)"
            placeholderTextColor={colors.text.muted}
            value={newName}
            onChangeText={setNewName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          <View style={styles.addActions}>
            <Button
              variant="secondary"
              label="Cancel"
              onPress={() => { setShowAdd(false); setNewName(""); }}
              style={styles.addCancelBtn}
            />
            <Button
              variant="primary"
              label="Add Desk"
              loading={isCreating}
              disabled={!newName.trim()}
              onPress={handleCreate}
              style={styles.addConfirmBtn}
            />
          </View>
        </View>
      )}

      {/* Desk list */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.s32 }} color={colors.accent.primary} />
      ) : (
        <FlatList
          data={desks ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="body" color="muted">No desks yet. Tap + to add one.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.deskRow}>
              <View style={styles.deskInfo}>
                <Ionicons name="desktop-outline" size={18} color={colors.text.muted} />
                <View style={styles.deskTexts}>
                  <Text variant="bodyStrong" numberOfLines={1}>{item.name}</Text>
                  {!item.isActive && (
                    <Text variant="micro" color="muted">Archived</Text>
                  )}
                </View>
              </View>
              <Pressable
                onPress={() => handleDelete(item.id, item.name)}
                hitSlop={12}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color={colors.status.error} />
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  backBtn: {
    padding: spacing.s4,
  },
  addBtn: {
    padding: spacing.s4,
  },
  addPanel: {
    margin: spacing.s16,
    padding: spacing.s16,
    backgroundColor: colors.surface.level1,
    borderRadius: radius.r16,
    gap: spacing.s12,
    ...rnShadows.e2,
  },
  input: {
    backgroundColor: colors.surface.level2,
    borderRadius: radius.r12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
    fontSize: 16,
    color: colors.text.primary,
  },
  addActions: {
    flexDirection: "row",
    gap: spacing.s8,
  },
  addCancelBtn: {
    flex: 1,
  },
  addConfirmBtn: {
    flex: 2,
  },
  list: {
    padding: spacing.s16,
    gap: spacing.s8,
  },
  deskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface.level1,
    borderRadius: radius.r12,
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
    marginBottom: spacing.s8,
    ...rnShadows.e1,
  },
  deskInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s12,
    flex: 1,
  },
  deskTexts: {
    flex: 1,
    gap: spacing.s4,
  },
  deleteBtn: {
    padding: spacing.s4,
    marginLeft: spacing.s8,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.s40,
  },
});
