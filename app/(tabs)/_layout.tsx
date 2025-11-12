import { CustomTabBar } from '@/components/CustomTabBar';
import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';


const _layout = () => {

    const { setUserId, loadEssentialTasks, loadRecentCompleted } = useTaskStore();
     const { loadUser } = useUserStore();
  
    useEffect(() => {
      const initializeStores = async () => {
        try {
          // Cargar usuario primero
          await loadUser();
          
          // Obtener el user ID
          const user = useUserStore.getState().user;
          
          if (user) {
            setUserId(user.id);
            
            // Cargar tareas
            await loadEssentialTasks();
            await loadRecentCompleted();
            
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
  )
}

export default _layout