import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Goal, GoalType, GOAL_XP_REWARDS } from '../../types/goal';

interface GoalsCardProps {
  monthlyGoals: Goal[];
  yearlyGoals: Goal[];
  onAddGoal: (type: GoalType, title: string, description?: string) => void;
  onToggleGoal: (id: number) => void;
  onDeleteGoal: (id: number) => void;
  onEditGoal: (id: number, title: string, description?: string) => void;
}

type TabType = 'monthly' | 'yearly';

export const GoalsCard: React.FC<GoalsCardProps> = ({
  monthlyGoals,
  yearlyGoals,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onEditGoal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('monthly');
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const currentGoals = activeTab === 'monthly' ? monthlyGoals : yearlyGoals;
  const xpReward = GOAL_XP_REWARDS[activeTab];

  // Cancelar edición cuando se cambia de tab
  useEffect(() => {
    if (editingGoalId !== null) {
      setEditingGoalId(null);
      setEditTitle('');
      setEditDescription('');
    }
    if (isAdding) {
      setIsAdding(false);
      setNewGoalTitle('');
      setNewGoalDescription('');
    }
  }, [activeTab]);

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Debes ingresar un título para la meta');
      return;
    }

    onAddGoal(activeTab, newGoalTitle.trim(), newGoalDescription.trim() || undefined);
    setNewGoalTitle('');
    setNewGoalDescription('');
    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    setNewGoalTitle('');
    setNewGoalDescription('');
    setIsAdding(false);
  };

  const handleStartEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description || '');
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      Alert.alert('Error', 'Debes ingresar un título para la meta');
      return;
    }

    if (editingGoalId) {
      onEditGoal(editingGoalId, editTitle.trim(), editDescription.trim() || undefined);
      setEditingGoalId(null);
      setEditTitle('');
      setEditDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleDelete = (goal: Goal) => {
    Alert.alert(
      'Eliminar Meta',
      `¿Estás seguro de que quieres eliminar "${goal.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDeleteGoal(goal.id),
        },
      ]
    );
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const isEditing = editingGoalId === item.id;

    if (isEditing) {
      return (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Título de la meta"
            placeholderTextColor="#666"
            autoFocus
          />
          <TextInput
            style={[styles.editInput, styles.descriptionInput]}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Descripción (opcional)"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelEditButton]}
              onPress={handleCancelEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleSaveEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.goalItem}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => onToggleGoal(item.id)}
        >
          <Ionicons
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.completed ? '#d9f434' : '#666'}
          />
        </TouchableOpacity>

        <View style={styles.goalContent}>
          <Text
            style={[styles.goalTitle, item.completed && styles.goalTitleCompleted]}
          >
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.goalDescription}>{item.description}</Text>
          )}
          <View style={styles.goalMeta}>
            <View style={styles.xpBadge}>
              <Ionicons name="flash" size={12} color="#000" />
              <Text style={styles.xpText}>{item.xpReward} XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleStartEdit(item)}
          >
            <Ionicons name="pencil" size={18} color="#d9f434" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Metas</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'monthly' && styles.tabActive]}
          onPress={() => setActiveTab('monthly')}
        >
          <Text
            style={[styles.tabText, activeTab === 'monthly' && styles.tabTextActive]}
          >
            Mensuales
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'monthly' && styles.tabBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === 'monthly' && styles.tabBadgeTextActive,
              ]}
            >
              {monthlyGoals.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'yearly' && styles.tabActive]}
          onPress={() => setActiveTab('yearly')}
        >
          <Text
            style={[styles.tabText, activeTab === 'yearly' && styles.tabTextActive]}
          >
            Anuales
          </Text>
          <View
            style={[styles.tabBadge, activeTab === 'yearly' && styles.tabBadgeActive]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === 'yearly' && styles.tabBadgeTextActive,
              ]}
            >
              {yearlyGoals.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Add Goal Section */}
      {isAdding ? (
        <View style={styles.addSection}>
          <TextInput
            style={styles.input}
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
            placeholder="Título de la meta"
            placeholderTextColor="#666"
            autoFocus
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={newGoalDescription}
            onChangeText={setNewGoalDescription}
            placeholder="Descripción (opcional)"
            placeholderTextColor="#666"
            multiline
          />
          <View style={styles.addActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelAdd}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddGoal}
            >
              <Text style={styles.addButtonText}>Agregar ({xpReward} XP)</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAdding(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#d9f434" />
          <Text style={styles.addButtonLabel}>
            Nueva Meta {activeTab === 'monthly' ? 'Mensual' : 'Anual'} ({xpReward}{' '}
            XP)
          </Text>
        </TouchableOpacity>
      )}

      {/* Goals List */}
      {currentGoals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay metas {activeTab === 'monthly' ? 'mensuales' : 'anuales'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentGoals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => `goal-${item.id}`}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          extraData={editingGoalId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  tabActive: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#000',
  },
  tabBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: '#000',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  tabBadgeTextActive: {
    color: '#d9f434',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d9f434',
    borderStyle: 'dashed',
  },
  addButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d9f434',
  },
  addSection: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#d9f434',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  checkbox: {
    paddingTop: 2,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  goalDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9f434',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  separator: {
    height: 8,
  },
  editContainer: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#d9f434',
  },
  editInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#d9f434',
  },
  cancelEditButton: {
    backgroundColor: '#333',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
