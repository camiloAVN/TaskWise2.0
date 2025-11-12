import { checkDatabaseHealth, initDatabase, seedInitialData } from '@/database/migrations';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';



const _layout = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
    // Ocultar completamente la barra de navegación
    NavigationBar.setVisibilityAsync("hidden");

  }, []);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🔄 Initializing database...');
        
        // Inicializar tablas
        await initDatabase();
        
        // Seed inicial
        await seedInitialData();
        
        // Verificar salud de la DB
        const health = await checkDatabaseHealth();
        console.log('📊 Database health:', health);
        
        if (!health.isHealthy) {
          throw new Error('Database health check failed');
        }
        
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
  )
}

export default _layout

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