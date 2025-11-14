import { getDatabase } from './config';

export const migrateAddUserFields = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    
    console.log('🔄 Checking if user fields migration is needed...');
    
    // Verificar si las columnas ya existen
    const tableInfo = await db.getAllAsync<any>(
      "PRAGMA table_info(users)"
    );
    
    const hasAge = tableInfo.some((col: any) => col.name === 'age');
    const hasEmail = tableInfo.some((col: any) => col.name === 'email');
    
    // Si ambas columnas ya existen, no hacer nada
    if (hasAge && hasEmail) {
      console.log('✅ User fields already exist, skipping migration');
      return;
    }
    
    // Agregar columna 'age' si no existe
    if (!hasAge) {
      await db.execAsync(`
        ALTER TABLE users ADD COLUMN age INTEGER;
      `);
      console.log('✅ Added age column to users table');
    }
    
    // Agregar columna 'email' si no existe
    if (!hasEmail) {
      await db.execAsync(`
        ALTER TABLE users ADD COLUMN email TEXT;
      `);
      console.log('✅ Added email column to users table');
    }
    
    console.log('✅ User fields migration completed successfully');
  } catch (error) {
    console.error('❌ Error migrating user fields:', error);
    throw error;
  }
};