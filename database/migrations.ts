import { getDatabase } from './config';

/**
 * Crea todas las tablas de la base de datos
 */
export const initDatabase = async (): Promise<void> => {
  try {
    const db = await getDatabase();

    // ==================== TABLA: users ====================
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        avatar TEXT,
        
        -- Progreso y Nivel
        totalXP INTEGER DEFAULT 0,
        currentLevel INTEGER DEFAULT 1,
        currentLevelXP INTEGER DEFAULT 0,
        nextLevelXP INTEGER DEFAULT 100,
        category TEXT DEFAULT 'novato',
        
        -- Estadísticas básicas
        totalTasksCompleted INTEGER DEFAULT 0,
        tasksCompletedToday INTEGER DEFAULT 0,
        tasksCompletedThisWeek INTEGER DEFAULT 0,
        tasksCompletedThisMonth INTEGER DEFAULT 0,
        
        -- Racha
        currentStreak INTEGER DEFAULT 0,
        bestStreak INTEGER DEFAULT 0,
        lastTaskDate TEXT,
        
        -- Logros
        totalAchievements INTEGER DEFAULT 0,
        
        -- Misiones diarias
        dailyMissionsCompletedToday INTEGER DEFAULT 0,
        dailyMissionsStreak INTEGER DEFAULT 0,
        
        -- Fechas
        createdAt TEXT NOT NULL,
        lastActivity TEXT NOT NULL
      );
    `);

    // ==================== TABLA: tasks ====================
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        
        -- Gamificación
        difficulty TEXT NOT NULL,
        category TEXT DEFAULT 'other',
        priority TEXT DEFAULT 'medium',
        basePoints INTEGER NOT NULL,
        bonusMultiplier REAL DEFAULT 1.0,
        earnedPoints INTEGER DEFAULT 0,
        
        -- Temporal
        dueDate TEXT,
        dueTime TEXT,
        estimatedTime INTEGER,
        
        -- Fechas de control
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        completedAt TEXT,
        
        -- Flags de bonificación
        completedEarly INTEGER DEFAULT 0,
        isFirstTaskOfDay INTEGER DEFAULT 0,
        completedDuringStreak INTEGER DEFAULT 0,
        
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // ==================== TABLA: achievements ====================
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL,
        rarity TEXT NOT NULL,
        xpReward INTEGER NOT NULL,
        
        -- Estado
        unlocked INTEGER DEFAULT 0,
        unlockedAt TEXT,
        progress INTEGER DEFAULT 0,
        
        -- Criterios
        requirementType TEXT NOT NULL,
        requirementValue INTEGER NOT NULL,
        currentValue INTEGER DEFAULT 0,
        
        -- Metadata
        orderIndex INTEGER NOT NULL,
        isSecret INTEGER DEFAULT 0,
        
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(id, userId)
      );
    `);

    // ==================== TABLA: streaks ====================
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        
        -- Racha
        currentStreak INTEGER DEFAULT 0,
        bestStreak INTEGER DEFAULT 0,
        
        -- Fechas
        lastActivityDate TEXT,
        streakStartDate TEXT,
        bestStreakDate TEXT,
        
        -- Estado
        isActive INTEGER DEFAULT 0,
        
        -- Metadata
        totalDaysActive INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // ==================== TABLA: daily_missions ====================
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_missions (
        id TEXT PRIMARY KEY,
        userId INTEGER NOT NULL,
        date TEXT NOT NULL,
        
        -- Descripción
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        
        -- Tipo y dificultad
        type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        
        -- Progreso
        targetValue INTEGER NOT NULL,
        currentValue INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        completedAt TEXT,
        
        -- Recompensas
        xpReward INTEGER NOT NULL,
        bonusXP INTEGER DEFAULT 0,
        
        -- Metadata
        orderIndex INTEGER NOT NULL,
        
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(id, userId)
      );
    `);

    // ==================== TABLA: stats ====================
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        
        -- Estadísticas globales
        totalTasks INTEGER DEFAULT 0,
        totalTasksCompleted INTEGER DEFAULT 0,
        totalTasksCancelled INTEGER DEFAULT 0,
        totalXPEarned INTEGER DEFAULT 0,
        
        -- Promedios
        averageTasksPerDay REAL DEFAULT 0,
        averageXPPerDay REAL DEFAULT 0,
        averageCompletionTime REAL DEFAULT 0,
        
        -- Por dificultad
        easyTasksCompleted INTEGER DEFAULT 0,
        mediumTasksCompleted INTEGER DEFAULT 0,
        hardTasksCompleted INTEGER DEFAULT 0,
        extremeTasksCompleted INTEGER DEFAULT 0,
        
        -- Por categoría
        workTasksCompleted INTEGER DEFAULT 0,
        personalTasksCompleted INTEGER DEFAULT 0,
        healthTasksCompleted INTEGER DEFAULT 0,
        studyTasksCompleted INTEGER DEFAULT 0,
        financeTasksCompleted INTEGER DEFAULT 0,
        socialTasksCompleted INTEGER DEFAULT 0,
        creativeTasksCompleted INTEGER DEFAULT 0,
        otherTasksCompleted INTEGER DEFAULT 0,
        
        -- Tiempo
        totalTimeInvested INTEGER DEFAULT 0,
        averageTimePerTask REAL DEFAULT 0,
        
        -- Mejores momentos
        mostProductiveDay TEXT,
        mostProductiveHour INTEGER,
        mostProductiveDayOfWeek INTEGER,
        
        -- Racha
        currentStreak INTEGER DEFAULT 0,
        bestStreak INTEGER DEFAULT 0,
        totalDaysWithActivity INTEGER DEFAULT 0,
        
        -- Misiones
        totalDailyMissionsCompleted INTEGER DEFAULT 0,
        dailyMissionsCompletedStreak INTEGER DEFAULT 0,
        
        -- Logros
        totalAchievementsUnlocked INTEGER DEFAULT 0,
        
        -- Fechas
        updatedAt TEXT NOT NULL,
        
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(userId)
      );
    `);

    // ==================== ÍNDICES ====================
    
    // Tasks
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tasks_userId 
      ON tasks(userId);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tasks_completed 
      ON tasks(completed);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tasks_dueDate 
      ON tasks(dueDate);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tasks_difficulty 
      ON tasks(difficulty);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tasks_category 
      ON tasks(category);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status 
      ON tasks(status);
    `);

    // Achievements
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_achievements_userId 
      ON achievements(userId);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_achievements_unlocked 
      ON achievements(unlocked);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_achievements_category 
      ON achievements(category);
    `);

    // Daily Missions
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_missions_userId_date 
      ON daily_missions(userId, date);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_missions_completed 
      ON daily_missions(completed);
    `);

    // Streaks
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_streaks_userId 
      ON streaks(userId);
    `);

    console.log('✅ Database tables and indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

/**
 * Resetea la base de datos (útil en desarrollo)
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    
    console.log('⚠️ Resetting database...');
    
    // Eliminar todas las tablas
    await db.execAsync('DROP TABLE IF EXISTS stats;');
    await db.execAsync('DROP TABLE IF EXISTS daily_missions;');
    await db.execAsync('DROP TABLE IF EXISTS streaks;');
    await db.execAsync('DROP TABLE IF EXISTS achievements;');
    await db.execAsync('DROP TABLE IF EXISTS tasks;');
    await db.execAsync('DROP TABLE IF EXISTS users;');
    
    // Recrear tablas
    await initDatabase();
    
    console.log('✅ Database reset successfully');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
};

/**
 * Verifica el estado de la base de datos
 */
export const checkDatabaseHealth = async (): Promise<{
  isHealthy: boolean;
  tables: string[];
  userCount: number;
  taskCount: number;
}> => {
  try {
    const db = await getDatabase();
    
    // Obtener lista de tablas
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    // Contar usuarios
    const userResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM users'
    );
    
    // Contar tareas
    const taskResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks'
    );
    
    return {
      isHealthy: true,
      tables: tables.map(t => t.name),
      userCount: userResult?.count || 0,
      taskCount: taskResult?.count || 0,
    };
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {
      isHealthy: false,
      tables: [],
      userCount: 0,
      taskCount: 0,
    };
  }
};

/**
 * Seed inicial de datos (usuario por defecto)
 */
export const seedInitialData = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    
    // Verificar si ya existe un usuario
    const existingUser = await db.getFirstAsync('SELECT id FROM users LIMIT 1');
    
    if (existingUser) {
      console.log('ℹ️ Database already has data, skipping seed');
      return;
    }
    
    console.log('🌱 Seeding initial data...');
    
    const now = new Date().toISOString();
    
    // Crear usuario por defecto
    const userResult = await db.runAsync(
      `INSERT INTO users (
        name, totalXP, currentLevel, currentLevelXP, nextLevelXP, 
        category, createdAt, lastActivity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Usuario', 0, 1, 0, 100, 'novato', now, now]
    );
    
    const userId = userResult.lastInsertRowId;
    
    // Crear registro de streak
    await db.runAsync(
      `INSERT INTO streaks (userId, createdAt, updatedAt) VALUES (?, ?, ?)`,
      [userId, now, now]
    );
    
    // Crear registro de stats
    await db.runAsync(
      `INSERT INTO stats (userId, updatedAt) VALUES (?, ?)`,
      [userId, now]
    );
    
    console.log('✅ Initial data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};