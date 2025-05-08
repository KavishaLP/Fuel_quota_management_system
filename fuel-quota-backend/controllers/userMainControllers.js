import { vehicleDB } from "../config/sqldb.js";

export const getVehicleOwnerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Owner ID is required" });
    }

    const query = `
      SELECT 
        vo.id, 
        vo.firstName, 
        vo.lastName, 
        vo.vehicleNumber, 
        vo.uniqueToken,
        vo.engineNumber,
        vt.type_name as vehicleType,
        fq.remaining_quota,
        vt.weekly_quota,
        ROUND((fq.remaining_quota / vt.weekly_quota) * 100, 0) as quotaPercentage,
        fq.week_start_date,
        fq.week_end_date
      FROM vehicleowner vo
      LEFT JOIN fuel_quotas fq ON vo.id = fq.vehicle_owner_id AND 
        fq.week_start_date <= CURRENT_DATE AND fq.week_end_date >= CURRENT_DATE
      LEFT JOIN vehicle_types vt ON vt.id = vo.vehicleType
      WHERE vo.id = ?
      ORDER BY fq.week_start_date DESC
      LIMIT 1
    `;

    vehicleDB.query(query, [id], (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Vehicle owner not found" });
      }

      // Format dates 
      const ownerData = results[0];
      if (ownerData.week_start_date) {
        ownerData.week_start_date = new Date(ownerData.week_start_date).toISOString().split('T')[0];
      }
      if (ownerData.week_end_date) {
        ownerData.week_end_date = new Date(ownerData.week_end_date).toISOString().split('T')[0];
      }

      res.json(ownerData);
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Add a new controller to fetch the latest fuel transaction
export const getLatestFuelTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Owner ID is required" });
    }

    const query = `
      SELECT 
        ft.transaction_time,
        ft.amount,
        fs.fuel_station_name
      FROM fuel_transactions ft
      JOIN fuel_stations fs ON ft.station_id = fs.id
      WHERE ft.vehicle_id = ?
      ORDER BY ft.transaction_time DESC
      LIMIT 1
    `;

    vehicleDB.query(query, [id], (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ data: { lastRefuel: null } });
      }

      const transactionData = {
        lastRefuel: {
          date: new Date(results[0].transaction_time).toISOString(),
          amount: results[0].amount,
          station: results[0].fuel_station_name
        }
      };

      res.json({ data: transactionData });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

