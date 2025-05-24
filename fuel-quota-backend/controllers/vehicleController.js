import { vehicleDB } from "../config/sqldb.js";

export const getVehicleDetails = async (req, res) => {
  const { identifier } = req.params;

  if (!identifier || identifier.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Vehicle identifier is required"
    });
  }

  const cleanIdentifier = identifier.trim().toUpperCase();

  try {
    const query = `
      SELECT 
        v.vehicleNumber,
        vt.type_name AS vehicleTypeName,
        COALESCE(fq.remaining_quota, 0) AS remaining_quota
      FROM vehicleowner v
      LEFT JOIN vehicle_types vt ON v.vehicleType = vt.id
      LEFT JOIN fuel_quotas fq ON v.id = fq.vehicle_owner_id
        AND CURRENT_DATE BETWEEN fq.week_start_date AND fq.week_end_date
      WHERE UPPER(v.vehicleNumber) = ?
         OR UPPER(v.engineNumber) = ?
      LIMIT 1
    `;

    vehicleDB.query(query, [cleanIdentifier, cleanIdentifier], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database query failed",
          error: err.message // Include actual error
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Vehicle ${cleanIdentifier} not found`
        });
      }

      // Simplify response
      const response = {
        success: true,
        data: {
          vehicleNumber: results[0].vehicleNumber,
          vehicleTypeName: results[0].vehicleTypeName || "Unknown",
          remaining_quota: results[0].remaining_quota
        }
      };

      console.log("Successful response:", response);
      res.status(200).json(response);
    });

  } catch (error) {
    console.error("Server crash:", error);
    res.status(500).json({
      success: false,
      message: "Server processing error",
      error: error.message
    });
  }
};