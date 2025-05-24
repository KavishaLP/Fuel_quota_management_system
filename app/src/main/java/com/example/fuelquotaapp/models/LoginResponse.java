package com.example.fuelquotaapp.models;

public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private Employee employee;

    // Getters and setters
    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public Employee getEmployee() {
        return employee;
    }

    // Nested Employee class
    public static class Employee {
        private String id;
        private String name;
        private String email;

        // Getters
        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
    }
}