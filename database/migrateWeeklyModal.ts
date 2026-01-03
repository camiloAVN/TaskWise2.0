import { getDatabase } from './config';

export const migrateAddWeeklyModalFields = async (): Promise<void> => {
  try {
    const db = await getDatabase();

    console.log('🔄 Checking if weekly modal migration is needed...');

    const tableInfo = await db.getAllAsync<any>("PRAGMA table_info(users)");

    const hasLastWeeklyModalShown = tableInfo.some(
      (col: any) => col.name === 'lastWeeklyModalShownDate'
    );
    const hasWeeklyNotificationId = tableInfo.some(
      (col: any) => col.name === 'weeklyPlanningNotificationId'
    );

    if (hasLastWeeklyModalShown && hasWeeklyNotificationId) {
      console.log('✅ Weekly modal fields already exist, skipping migration');
      return;
    }

    if (!hasLastWeeklyModalShown) {
      await db.execAsync(`
        ALTER TABLE users ADD COLUMN lastWeeklyModalShownDate TEXT;
      `);
      console.log('✅ Added lastWeeklyModalShownDate column to users table');
    }

    if (!hasWeeklyNotificationId) {
      await db.execAsync(`
        ALTER TABLE users ADD COLUMN weeklyPlanningNotificationId TEXT;
      `);
      console.log('✅ Added weeklyPlanningNotificationId column to users table');
    }

    console.log('✅ Weekly modal migration completed successfully');
  } catch (error) {
    console.error('❌ Error migrating weekly modal fields:', error);
    throw error;
  }
};
