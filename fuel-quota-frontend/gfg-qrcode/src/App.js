import { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

function App() {
  const [ownerName, setOwnerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [value, setValue] = useState('');
  const [back, setBack] = useState('#FFFFFF');
  const [fore, setFore] = useState('#000000');
  const [size, setSize] = useState(256);
  const [error, setError] = useState('');
  
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error
    setError('');

    // Validate form data
    if (!ownerName || !vehicleNumber || !vehicleType) {
      setError('All fields are required');
      return;
    }

    try {
      // Create vehicle registration data
      const registrationData = {
        ownerName,
        vehicleNumber,
        vehicleType,
      };

      // Send data to backend to generate QR code
      const response = await axios.post('http://localhost:5000/api/register', registrationData);
      setValue(response.data.qrCode);  // Set the QR code value from the backend
    } catch (err) {
      setError('Error generating QR code. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="App">
      <center>
        <h2>Vehicle Registration</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Owner Name"
              value={ownerName}
            />
          </div>
          <div>
            <input
              type="text"
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="Vehicle Number"
              value={vehicleNumber}
            />
          </div>
          <div>
            <input
              type="text"
              onChange={(e) => setVehicleType(e.target.value)}
              placeholder="Vehicle Type"
              value={vehicleType}
            />
          </div>
          <button type="submit">Register Vehicle</button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <br />
        <input
          type="text"
          onChange={(e) => setBack(e.target.value)}
          placeholder="Background Color"
        />
        <br />
        <input
          type="text"
          onChange={(e) => setFore(e.target.value)}
          placeholder="Foreground Color"
        />
        <br />
        <input
          type="number"
          onChange={(e) => setSize(parseInt(e.target.value === '' ? 0 : e.target.value, 10))}
          placeholder="Size of QR Code"
        />
        <br />

        {value && (
          <div>
            <h3>Generated QR Code</h3>
            <QRCode
              title="Vehicle Registration QR"
              value={value}
              bgColor={back}
              fgColor={fore}
              size={size === '' ? 0 : size}
            />
          </div>
        )}
      </center>
    </div>
  );
}

export default App;
