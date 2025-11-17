import { migrateAddUserFields } from '@/database/migrateUserFields';
import { migrateAddNotificationFields } from '@/database/migrateNotificationFields';
import { checkDatabaseHealth, initDatabase, seedInitialData } from '@/database/migrations';
import { initializeImageDirectory } from '@/utils/imageUtils';
import { configureNotifications } from '@/utils/notificationUtils';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native'; // ⭐ Agregar AppState
import { SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';

const _layout = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // ⭐ AGREGAR: Listener para forzar ocultar barra cuando la app vuelve
  useEffect(() => {
    const hideNavigationBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (error) {
        console.log('Error hiding navigation bar:', error);
      }
    };

    // Ocultar al montar
    hideNavigationBar();

    // ⭐ Listener para cuando la app cambia de estado
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('🔄 App became active, hiding navigation bar...');
        hideNavigationBar();
      }
    });

    // ⭐ Forzar cada 500ms (agresivo pero efectivo)
    const interval = setInterval(() => {
      hideNavigationBar();
    }, 500);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🔄 Initializing database...');

        await initDatabase();
        await migrateAddUserFields();
        await migrateAddNotificationFields();
        await seedInitialData();
        await initializeImageDirectory();

        const health = await checkDatabaseHealth();
        console.log('📊 Database health:', health);

        if (!health.isHealthy) {
          throw new Error('Database health check failed');
        }

        // Configurar notificaciones
        console.log('🔔 Configuring notifications...');
        await configureNotifications();
        console.log('✅ Notifications configured');

        setDbInitialized(true);
        console.log('✅ Database ready');
      } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        setDbError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    setupDatabase();
  }, []);

  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error de Base de Datos</Text>
        <Text style={styles.errorText}>{dbError}</Text>
      </View>
    );
  }
  
  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d9f434" />
        <Text style={styles.loadingText}>Inicializando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className='bg-black' style={{flex:1, backgroundColor:'black'}}>
      <StatusBar style="light"/>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaView>
  );
};

export default _layout;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#d9f434',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorTitle: {
    color: '#F44336',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});