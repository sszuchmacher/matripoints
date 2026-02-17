import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../src/store/useStore";
import { Colors, Spacing, FontSize, BorderRadius } from "../../src/constants/theme";
import type { TaskCategory, Recurrence } from "../../src/types";
import { CATEGORY_CONFIG } from "../../src/types";

type Filter = "all" | "mine" | "partner" | "done";

export default function TasksScreen() {
  const couple = useStore((s) => s.couple);
  const profiles = useStore((s) => s.profiles);
  const currentProfileId = useStore((s) => s.currentProfileId);
  const tasks = useStore((s) => s.tasks);
  const loadData = useStore((s) => s.loadData);
  const addTask = useStore((s) => s.addTask);
  const completeTask = useStore((s) => s.completeTask);
  const uncompleteTask = useStore((s) => s.uncompleteTask);
  const removeTask = useStore((s) => s.removeTask);

  const [filter, setFilter] = useState<Filter>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategory>("chores");
  const [newAssignee, setNewAssignee] = useState<string | null>(null);
  const [newPoints, setNewPoints] = useState("10");

  const currentProfile = profiles.find((p) => p.id === currentProfileId);
  const partnerProfile = profiles.find((p) => p.id !== currentProfileId);

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    switch (filter) {
      case "mine":
        return t.assignedTo === currentProfileId && !t.completedAt;
      case "partner":
        return t.assignedTo === partnerProfile?.id && !t.completedAt;
      case "done":
        return !!t.completedAt;
      default:
        return !t.completedAt;
    }
  });

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    await addTask({
      title: newTitle.trim(),
      category: newCategory,
      assignedTo: newAssignee,
      isRecurring: false,
      recurrence: null,
      pointsValue: parseInt(newPoints) || 10,
    });
    setNewTitle("");
    setNewCategory("chores");
    setNewAssignee(null);
    setNewPoints("10");
    setShowAddModal(false);
  };

  const handleComplete = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleUncomplete = async (taskId: string) => {
    await uncompleteTask(taskId);
  };

  const handleDelete = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeTask(taskId) },
    ]);
  };

  if (!couple) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {(["all", "mine", "partner", "done"] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === "mine"
                ? currentProfile?.displayName ?? "Mine"
                : f === "partner"
                ? partnerProfile?.displayName ?? "Partner"
                : f === "all"
                ? "To Do"
                : "Done"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} />}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>
              {filter === "done" ? "📋" : "✨"}
            </Text>
            <Text style={styles.emptyText}>
              {filter === "done"
                ? "No completed tasks yet"
                : "No tasks here — add one!"}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const isDone = !!task.completedAt;
            const assignee = profiles.find((p) => p.id === task.assignedTo);
            const completer = profiles.find((p) => p.id === task.completedBy);
            const categoryConfig = CATEGORY_CONFIG[task.category];

            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onLongPress={() => handleDelete(task.id)}
                activeOpacity={0.7}
              >
                <TouchableOpacity
                  style={[styles.checkbox, isDone && styles.checkboxDone]}
                  onPress={() =>
                    isDone ? handleUncomplete(task.id) : handleComplete(task.id)
                  }
                >
                  {isDone && (
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  )}
                </TouchableOpacity>
                <View style={styles.taskContent}>
                  <Text
                    style={[styles.taskTitle, isDone && styles.taskTitleDone]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  <View style={styles.taskMeta}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: categoryConfig.color + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: categoryConfig.color },
                        ]}
                      >
                        {categoryConfig.label}
                      </Text>
                    </View>
                    {assignee && (
                      <Text style={styles.assigneeEmoji}>
                        {assignee.avatarEmoji}
                      </Text>
                    )}
                    {isDone && completer && (
                      <Text style={styles.completerText}>
                        Done by {completer.avatarEmoji}
                      </Text>
                    )}
                  </View>
                </View>
                {couple.pointsEnabled && (
                  <Text style={[styles.pointsBadge, isDone && styles.pointsDone]}>
                    +{task.pointsValue}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity
              onPress={handleAddTask}
              disabled={!newTitle.trim()}
            >
              <Text
                style={[
                  styles.modalSave,
                  !newTitle.trim() && styles.modalSaveDisabled,
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              placeholder="What needs to be done?"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              placeholderTextColor={Colors.textLight}
            />

            <Text style={styles.modalLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    newCategory === cat && {
                      borderColor: CATEGORY_CONFIG[cat].color,
                      backgroundColor: CATEGORY_CONFIG[cat].color + "15",
                    },
                  ]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={styles.categoryOptionText}>
                    {CATEGORY_CONFIG[cat].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Assign to</Text>
            <View style={styles.assigneeOptions}>
              <TouchableOpacity
                style={[
                  styles.assigneeOption,
                  newAssignee === null && styles.assigneeSelected,
                ]}
                onPress={() => setNewAssignee(null)}
              >
                <Text style={styles.assigneeOptionEmoji}>👥</Text>
                <Text style={styles.assigneeOptionText}>Anyone</Text>
              </TouchableOpacity>
              {profiles.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.assigneeOption,
                    newAssignee === p.id && styles.assigneeSelected,
                  ]}
                  onPress={() => setNewAssignee(p.id)}
                >
                  <Text style={styles.assigneeOptionEmoji}>{p.avatarEmoji}</Text>
                  <Text style={styles.assigneeOptionText}>{p.displayName}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {couple.pointsEnabled && (
              <>
                <Text style={styles.modalLabel}>Points value</Text>
                <View style={styles.pointsOptions}>
                  {["5", "10", "15", "20", "25"].map((pts) => (
                    <TouchableOpacity
                      key={pts}
                      style={[
                        styles.pointsOption,
                        newPoints === pts && styles.pointsOptionSelected,
                      ]}
                      onPress={() => setNewPoints(pts)}
                    >
                      <Text
                        style={[
                          styles.pointsOptionText,
                          newPoints === pts && styles.pointsOptionTextSelected,
                        ]}
                      >
                        {pts}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  filterTextActive: {
    color: Colors.white,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  checkboxDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: "500",
    marginBottom: 4,
  },
  taskTitleDone: {
    textDecorationLine: "line-through",
    color: Colors.textLight,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  assigneeEmoji: {
    fontSize: 16,
  },
  completerText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  pointsBadge: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  pointsDone: {
    color: Colors.success,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
  },
  modalSave: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.primary,
  },
  modalSaveDisabled: {
    opacity: 0.4,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryOptionText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.text,
  },
  assigneeOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  assigneeOption: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  assigneeSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + "20",
  },
  assigneeOptionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  assigneeOptionText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: "500",
  },
  pointsOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  pointsOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pointsOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  pointsOptionText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  pointsOptionTextSelected: {
    color: Colors.white,
  },
});
