import { getDatabase } from './config';

/**
 * Migración para agregar la tabla de metas (goals)
 */
export async function migrateAddGoalsTable() {
  try {
    const db = await getDatabase();

    console.log('🔄 Running goals table migration...');

    // Crear tabla de metas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('monthly', 'yearly')),
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        xpReward INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        completedAt TEXT,
        year INTEGER NOT NULL,
        month INTEGER,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Crear índices para mejorar el rendimiento
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_goals_userId ON goals(userId);
      CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);
      CREATE INDEX IF NOT EXISTS idx_goals_year ON goals(year);
      CREATE INDEX IF NOT EXISTS idx_goals_year_month ON goals(year, month);
    `);

    console.log('✅ Goals table migration completed');
  } catch (error) {
    console.error('❌ Error in goals migration:', error);
    throw error;
  }
}

/**
 * Migración para agregar campos de notificaciones a la tabla goals
 */
export async function migrateAddGoalNotifications() {
  try {
    const db = await getDatabase();

    console.log('🔄 Running goal notifications migration...');

    // Verificar si las columnas ya existen
    const tableInfo = await db.getAllAsync(`PRAGMA table_info(goals)`);
    const columnNames = tableInfo.map((col: any) => col.name);

    // Agregar columna reminderDate si no existe
    if (!columnNames.includes('reminderDate')) {
      await db.execAsync(`
        ALTER TABLE goals ADD COLUMN reminderDate TEXT;
      `);
      console.log('✅ Added reminderDate column');
    }

    // Agregar columna notificationEnabled si no existe
    if (!columnNames.includes('notificationEnabled')) {
      await db.execAsync(`
        ALTER TABLE goals ADD COLUMN notificationEnabled INTEGER DEFAULT 0;
      `);
      console.log('✅ Added notificationEnabled column');
    }

    // Agregar columna notificationId si no existe
    if (!columnNames.includes('notificationId')) {
      await db.execAsync(`
        ALTER TABLE goals ADD COLUMN notificationId TEXT;
      `);
      console.log('✅ Added notificationId column');
    }

    console.log('✅ Goal notifications migration completed');
  } catch (error) {
    console.error('❌ Error in goal notifications migration:', error);
    throw error;
  }
}

/**
 * Migración para agregar campos de metas fallidas
 */
export async function migrateAddGoalFailedFields() {
  try {
    const db = await getDatabase();

    console.log('🔄 Running goal failed fields migration...');

    // Verificar si las columnas ya existen
    const tableInfo = await db.getAllAsync(`PRAGMA table_info(goals)`);
    const columnNames = tableInfo.map((col: any) => col.name);

    // Agregar columna failed si no existe
    if (!columnNames.includes('failed')) {
      await db.execAsync(`
        ALTER TABLE goals ADD COLUMN failed INTEGER DEFAULT 0;
      `);
      console.log('✅ Added failed column');
    }

    // Agregar columna failedAt si no existe
    if (!columnNames.includes('failedAt')) {
      await db.execAsync(`
        ALTER TABLE goals ADD COLUMN failedAt TEXT;
      `);
      console.log('✅ Added failedAt column');
    }

    console.log('✅ Goal failed fields migration completed');
  } catch (error) {
    console.error('❌ Error in goal failed fields migration:', error);
    throw error;
  }
}
