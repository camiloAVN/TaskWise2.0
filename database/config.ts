import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Obtiene la instancia de la base de datos
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync('taskapp.db');
    console.log('✅ Database opened successfully');
    
    // Habilitar foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    return db;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    throw error;
  }
};

/**
 * Cierra la base de datos
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('✅ Database closed');
  }
};

/**
 * Ejecuta una query con logging
 */
export const executeQuery = async (
  query: string,
  params?: any[]
): Promise<any> => {
  try {
    const database = await getDatabase();
    const result = await database.runAsync(query, params || []);
    return result;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};