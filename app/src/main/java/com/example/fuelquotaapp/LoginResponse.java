package com.example.fuelquotaapp;

public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private Employee employee;

    // Getters
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getToken() { return token; }
    public Employee getEmployee() { return employee; }

    public static class Employee {
        private int id;
        private String name;
        private String email;
        private String station_registration_number;
        private String mobile_number;

        // Getters
        public int getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getStationRegistrationNumber() { return station_registration_number; }
        public String getMobileNumber() { return mobile_number; }
    }
}