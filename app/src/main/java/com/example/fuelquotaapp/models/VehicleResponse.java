package com.example.fuelquotaapp.models;

import com.google.gson.annotations.SerializedName;

public class VehicleResponse {
    @SerializedName("vehicleNumber")
    private String vehicleNumber;

    @SerializedName("engineNumber")
    private String engineNumber;

    @SerializedName("vehicleTypeName")
    private String vehicleTypeName;

    @SerializedName("remaining_quota")
    private double remainingQuota;

    // Default constructor (required for Gson)
    public VehicleResponse() {
    }

    // Getters
    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public String getEngineNumber() {
        return engineNumber;
    }

    public String getVehicleTypeName() {
        return vehicleTypeName;
    }

    public double getRemainingQuota() {
        return remainingQuota;
    }

    // Setters
    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public void setEngineNumber(String engineNumber) {
        this.engineNumber = engineNumber;
    }

    public void setVehicleTypeName(String vehicleTypeName) {
        this.vehicleTypeName = vehicleTypeName;
    }

    public void setRemainingQuota(double remainingQuota) {
        this.remainingQuota = remainingQuota;
    }

    // Optional: toString() for debugging
    @Override
    public String toString() {
        return "VehicleResponse{" +
                "vehicleNumber='" + vehicleNumber + '\'' +
                ", engineNumber='" + engineNumber + '\'' +
                ", vehicleTypeName='" + vehicleTypeName + '\'' +
                ", remainingQuota=" + remainingQuota +
                '}';
    }
}