import { getDatabase } from './config';

export const migrateAddNotificationFields = async (): Promise<void> => {
  try {
    const db = await getDatabase();

    console.log('🔄 Checking if notification fields migration is needed...');

    // Verificar si las columnas ya existen
    const tableInfo = await db.getAllAsync<any>(
      "PRAGMA table_info(tasks)"
    );

    const hasReminder = tableInfo.some((col: any) => col.name === 'hasReminder');
    const hasNotificationId = tableInfo.some((col: any) => col.name === 'notificationId');

    // Si ambas columnas ya existen, no hacer nada
    if (hasReminder && hasNotificationId) {
      console.log('✅ Notification fields already exist, skipping migration');
      return;
    }

    // Agregar columna 'hasReminder' si no existe
    if (!hasReminder) {
      await db.execAsync(`
        ALTER TABLE tasks ADD COLUMN hasReminder INTEGER DEFAULT 0;
      `);
      console.log('✅ Added hasReminder column to tasks table');
    }

    // Agregar columna 'notificationId' si no existe
    if (!hasNotificationId) {
      await db.execAsync(`
        ALTER TABLE tasks ADD COLUMN notificationId TEXT;
      `);
      console.log('✅ Added notificationId column to tasks table');
    }

    console.log('✅ Notification fields migration completed successfully');
  } catch (error) {
    console.error('❌ Error migrating notification fields:', error);
    throw error;
  }
};
