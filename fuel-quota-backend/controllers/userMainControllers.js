import { vehicleDB } from "../config/sqldb.js";


export const getVehicleOwnerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Owner ID is required" });
    }

    const query = `
      SELECT 
        id, 
        firstName, 
        lastName, 
        vehicleNumber, 
        uniqueToken,
        vehicleType,
        engineNumber
      FROM vehicleowner 
      WHERE id = ?
    `;

    vehicleDB.query(query, [id], (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Vehicle owner not found" });
      }

      const ownerData = results[0];
      res.json(ownerData);
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};