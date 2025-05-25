package com.example.fuelquotaapp.services;

import com.example.fuelquotaapp.models.LoginRequest;
import com.example.fuelquotaapp.models.LoginResponse;
import com.example.fuelquotaapp.models.VehicleResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ApiService {
    // Existing login endpoint
    @POST("employee/login")
    Call<LoginResponse> employeeLogin(@Body LoginRequest loginRequest);

    // Add vehicle details endpoint
    @GET("vehicles/{identifier}")
    Call<VehicleResponse> getVehicleDetails(@Path("identifier") String identifier);
}