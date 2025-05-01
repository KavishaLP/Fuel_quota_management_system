// utils/resetQuotas.js
import { vehicleDB } from '../config/sqldb.js';
import moment from 'moment';

export const resetWeeklyQuotas = (callback) => {
  try {
    // Calculate current week dates (Monday to Sunday)
    const now = moment();
    const weekStart = now.startOf('week').format('YYYY-MM-DD'); // Monday
    const weekEnd = now.endOf('week').format('YYYY-MM-DD');   // Sunday

    console.log(`Attempting to reset quotas for week ${weekStart} to ${weekEnd}...`);

    // Using callback style instead of promises
    vehicleDB.query(`
      UPDATE fuel_quotas fq
      JOIN vehicle_types vt ON fq.vehicle_type_id = vt.id
      SET 
        fq.remaining_quota = vt.weekly_quota,
        fq.week_start_date = ?,
        fq.week_end_date = ?
    `, [weekStart, weekEnd], (error, result) => {
      if (error) {
        console.error('Error resetting weekly quotas:', error);
        if (callback) {
          callback({
            success: false,
            message: `Failed to reset quotas: ${error.message}`,
            updatedCount: 0
          });
        }
        return;
      }

      console.log(`Reset complete. Updated ${result.affectedRows} vehicle quota records.`);
      
      const response = {
        success: true,
        message: `Successfully reset ALL quotas (${result.affectedRows} records) for week ${weekStart} to ${weekEnd}`,
        updatedCount: result.affectedRows
      };
      
      if (callback) {
        callback(response);
      }
    });
  } catch (error) {
    console.error('Error in reset quotas function:', error);
    if (callback) {
      callback({
        success: false,
        message: `Failed to execute quota reset: ${error.message}`,
        updatedCount: 0
      });
    }
  }
};

// For manual testing with callback approach
export const manualReset = () => {
  console.log('Manually triggering quota reset...');
  resetWeeklyQuotas((result) => {
    console.log(result);
    return result;
  });
};