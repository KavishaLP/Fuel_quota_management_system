// utils/resetQuotas.js
import { vehicleDB } from '../config/sqldb.js';
import cron from 'node-cron';

// Function to get the current week's start and end dates
function getWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to get Monday
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - diffToMonday);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
}

// Main function to reset quotas
export async function resetFuelQuotas() {
    try {
        const { startDate, endDate } = getWeekDates();
        
        // Get all vehicle types with their weekly quotas
        const vehicleTypes = await vehicleDB.query(
            'SELECT id, weekly_quota FROM vehicle_types'
        );
        
        // Create a map of vehicle type IDs to their weekly quotas
        const quotaMap = {};
        vehicleTypes[0].forEach(type => {
            quotaMap[type.id] = type.weekly_quota;
        });
        
        // Update all fuel quotas with the new values and week dates
        const [result] = await vehicleDB.query(
            `UPDATE fuel_quotas 
             SET 
                 remaining_quota = ?, 
                 week_start_date = ?, 
                 week_end_date = ?
             WHERE vehicle_type_id = ?`,
            [quotaMap[vehicle_type_id], startDate, endDate, vehicle_type_id]
        );
        
        console.log(`Successfully reset ${result.affectedRows} fuel quotas for the week starting ${startDate}`);
        return true;
    } catch (error) {
        console.error('Error resetting fuel quotas:', error);
        throw error;
    }
}

// Initialize the weekly reset job
export function initWeeklyReset() {
    // Schedule to run every Monday at 00:01 AM
    cron.schedule('1 0 * * 1', async () => {
        console.log('Running weekly fuel quota reset...');
        try {
            await resetFuelQuotas();
        } catch (error) {
            console.error('Failed to run weekly fuel quota reset:', error);
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Colombo' // Adjust to your timezone
    });
    
    console.log('Weekly fuel quota reset job initialized');
}