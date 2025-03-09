import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import QRCode from 'react-qr-code';
import "./vehicleRegistration.css"; // ✅ Ensure correct path & file name

const schema = yup.object().shape({
  ownerName: yup.string().required("Owner name is required"),
  vehicleNumber: yup.string().required("Vehicle number is required"),
  vehicleType: yup.string().required("Select vehicle type"),
});

function VehicleRegistration() {
  const [qrCode, setQrCode] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      // Sending data to the backend
      const response = await axios.post("http://localhost:5000/api/register", data);
      setQrCode(response.data.qrCode); // Set the QR code URL received from the backend
    } catch (error) {
      console.error("Error registering vehicle:", error);
    }
  };
  

  return (
    <div className="vehicle-registration-container">
      <h2>Vehicle Registration</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Owner Name</label>
          <input type="text" {...register("ownerName")} />
          <p className="error">{errors.ownerName?.message}</p>
        </div>

        <div>
          <label>Vehicle Number</label>
          <input type="text" {...register("vehicleNumber")} />
          <p className="error">{errors.vehicleNumber?.message}</p>
        </div>

        <div>
          <label>Vehicle Type</label>
          <select {...register("vehicleType")}>
            <option value="">Select Type</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="truck">Truck</option>
          </select>
          <p className="error">{errors.vehicleType?.message}</p>
        </div>

        <button type="submit">Register Vehicle</button>
      </form>

      {qrCode && (
        <div className="qr-container">
          <QRCode value={qrCode} size={200} />
        </div>
      )}
    </div>
  );
}

export default VehicleRegistration;
