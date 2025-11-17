import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUIStore } from '../stores/uiStore';
import { AddTaskModal } from './AddTaskModal';

const COLORS = {
  primary: '#d9f434',
  background: '#000000',
  inactive: '#F8FCE0',
  active: '#d9f434',
};

type IconName = keyof typeof Ionicons.glyphMap;

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {

  const { isAddTaskModalOpen, openAddTaskModal, closeAddTaskModal } = useUIStore();

  const getCleanRouteName = (routeName: string): string => {
    return routeName.replace('/index', '');
  };

  const getIconName = (routeName: string, focused: boolean): IconName => {
    const cleanName = getCleanRouteName(routeName);
    
    switch (cleanName) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'Stats':
        return focused ? 'stats-chart' : 'stats-chart-outline';
      case 'Agenda':
        return focused ? 'calendar' : 'calendar-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'help-outline';
    }
  };

  const tabOrder = ['Home/index', 'Stats/index', 'add', 'Agenda/index', 'Profile/index'];

  return (
    <>
      <View 
        style={styles.container}  
      >
        <View style={styles.tabBar}>
          {tabOrder.map((tabName) => {
            if (tabName === 'add') {
              return (
                <View key="add-button" style={styles.centerButtonContainer}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={openAddTaskModal}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={32} color="#000" />
                  </TouchableOpacity>
                </View>
              );
            }

            const route = state.routes.find((r) => r.name === tabName);
            
            if (!route) {
              console.warn(`Route ${tabName} not found`);
              return null;
            }

            const routeIndex = state.routes.indexOf(route);
            const isFocused = state.index === routeIndex;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={getIconName(route.name, isFocused)}
                  size={24}
                  color={isFocused ? COLORS.active : COLORS.inactive}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <AddTaskModal
        visible={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,  // ⭐ VALOR FIJO - NO dinámico
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgb(217,244,52,0.2)',
    borderRadius: 30,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    minWidth: 50,
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    paddingHorizontal: 15,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
});