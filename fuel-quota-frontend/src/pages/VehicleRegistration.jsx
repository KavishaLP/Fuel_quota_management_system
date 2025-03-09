import React, { useState } from 'react';
import axios from 'axios';

function VehicleRegister() {
    // State for form inputs
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [engineNumber, setEngineNumber] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous error messages
        setErrorMessage('');

        // Validation check for empty fields
        if (!firstName || !lastName || !vehicleType || !vehicleNumber || !engineNumber || !password || !rePassword) {
            setErrorMessage('All fields are required');
            return;
        }

        // Validation check for password match
        if (password !== rePassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            // Send data to backend
            const response = await axios.post('http://localhost:5000/api/register', {
                firstName,
                lastName,
                vehicleType,
                vehicleNumber,
                engineNumber,
                password,
                rePassword
            });

            // Set the QR code URL from the backend response
            setQrCode(response.data.qrCode);
        } catch (error) {
            // Handle any error responses
            setErrorMessage(error.response?.data?.message || 'An error occurred during registration');
        }
    };

    return (
        <div className="vehicle-register">
            <h2>Register Vehicle</h2>
            {errorMessage && <p className="error">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Vehicle Type"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Vehicle Number"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Engine Number"
                    value={engineNumber}
                    onChange={(e) => setEngineNumber(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Re-enter Password"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                />
                <button type="submit">Register Vehicle</button>
            </form>

            {qrCode && (
                <div className="qr-container">
                    <h3>QR Code for Vehicle Registration</h3>
                    <img src={qrCode} alt="QR Code" />
                </div>
            )}
        </div>
    );
}

export default VehicleRegister;
