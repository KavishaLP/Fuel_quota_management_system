import QRCode from 'qrcode';
import db from '../config/database.js';
import { promisify } from 'util';

// Convert QR code generation to promise-based
const generateQRCode = promisify(QRCode.toDataURL);

export const generateVehicleQRCode = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        
        // Get vehicle owner details from database
        const [results] = await db.query(
            `SELECT vehicleNumber, uniqueToken, firstName, lastName 
             FROM vehicleowner 
             WHERE id = ?`,
            [vehicleId]
        );

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle owner not found' });
        }

        const vehicleData = results[0];
        
        // Create the data to encode in QR code
        const qrData = JSON.stringify({
            vehicleId,
            vehicleNumber: vehicleData.vehicleNumber,
            owner: `${vehicleData.firstName} ${vehicleData.lastName}`,
            token: vehicleData.uniqueToken,
            timestamp: new Date().toISOString()
        });

        // Generate QR code
        const qrCodeDataUrl = await generateQRCode(qrData, { 
            errorCorrectionLevel: 'H',
            width: 300,
            margin: 2
        });

        // Return the QR code data URL
        res.status(200).json({
            success: true,
            qrCode: qrCodeDataUrl,
            vehicleNumber: vehicleData.vehicleNumber
        });
    } catch (error) {
        console.error('QR code generation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate QR code',
            error: error.message
        });
    }
};