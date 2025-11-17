import { CustomTabBar } from '@/components/CustomTabBar';
import { useNotificationStore } from '@/stores/notificationStore';
import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, UIManager } from 'react-native';

// ⭐ Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false);  // ⭐ DESACTIVAR
}

const _layout = () => {
  const { setUserId, loadEssentialTasks, loadRecentCompleted } = useTaskStore();
  const { loadUser } = useUserStore();
  const { setUserId: setNotificationUserId, loadNotifications, loadUnreadCount } =
    useNotificationStore();

  useEffect(() => {
    const initializeStores = async () => {
      try {
        await loadUser();
        let user = useUserStore.getState().user;
        
        // If no user exists, create a default one
        if (!user) {
          console.log('🔧 Creating default user...');
          const { createUser } = useUserStore.getState();
          await createUser({
            name: 'Usuario',
            email: 'usuario@taskwise.app',
          });
          user = useUserStore.getState().user;
        }
        
        if (user) {
          setUserId(user.id);
          setNotificationUserId(user.id);
          await loadEssentialTasks();
          await loadRecentCompleted();
          await loadNotifications();
          await loadUnreadCount();
          console.log('✅ Stores initialized');
        }
      } catch (error) {
        console.error('❌ Error initializing stores:', error);
      }
    };
    
    initializeStores();
  }, []);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // ⭐ AGREGAR ESTAS OPCIONES CRÍTICAS
        tabBarHideOnKeyboard: false,
        lazy: false,
        freezeOnBlur: true,
        animation: 'none',
      }}
    >
      <Tabs.Screen
        name="Home/index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="Stats/index"
        options={{
          title: 'Estadísticas',
        }}
      />
      <Tabs.Screen
        name="Agenda/index"
        options={{
          title: 'Agenda',
        }}
      />
      <Tabs.Screen
        name="Profile/index"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
};

export default _layout;