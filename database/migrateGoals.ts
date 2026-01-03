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
