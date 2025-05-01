// utils/resetQuotas.js
import { vehicleDB } from '../config/sqldb.js';
import cron from 'node-cron';


const resetWeeklyQuotas = async () => {
  try {
    // Calculate current week (Monday to Sunday)
    const currentDate = new Date();
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    const formattedWeekStart = weekStart.toISOString().split('T')[0];
    const formattedWeekEnd = weekEnd.toISOString().split('T')[0];

    console.log(`🔄 Starting weekly quota reset for week ${formattedWeekStart} to ${formattedWeekEnd}`);

    await vehicleDB.beginTransaction();

    try {
      // Update ALL quota records with new values and dates
      const [updateResult] = await vehicleDB.query(`
        UPDATE fuel_quotas fq
        JOIN vehicle_types vt ON fq.vehicle_type_id = vt.id
        SET 
          fq.remaining_quota = vt.weekly_quota,
          fq.week_start_date = ?,
          fq.week_end_date = ?
      `, [formattedWeekStart, formattedWeekEnd]);
      
      await vehicleDB.commit();
      console.log(`✅ Successfully updated ${updateResult.affectedRows} quotas for week ${formattedWeekStart}-${formattedWeekEnd}`);
    } catch (error) {
      await vehicleDB.rollback();
      console.error('❌ Quota reset failed:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('🚨 Error in weekly quota reset:', error.message);
  }
};


export const initQuotaResetScheduler = () => {
  // Schedule to run every Monday at 00:00 AM (Colombo time)
  const job = cron.schedule('0 0 * * 1', resetWeeklyQuotas, {
    scheduled: true,
    timezone: "Asia/Colombo"
  });

  // Log next run times for verification
  const nextRuns = job.nextDates(3);
  console.log('⏰ Automatic weekly quota reset scheduler initialized');
  console.log('📅 Next reset times:');
  nextRuns.forEach((date, i) => {
    console.log(`   ${i+1}. ${date.toLocaleString('en-US', { 
      timeZone: 'Asia/Colombo',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      timeZoneName: 'short'
    })}`);
  });

  return job;
};