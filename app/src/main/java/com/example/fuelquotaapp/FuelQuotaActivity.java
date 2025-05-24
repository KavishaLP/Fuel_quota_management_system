package com.example.fuelquotaapp;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class FuelQuotaActivity extends AppCompatActivity {
    private String vehicleId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_fuel_quota);

        vehicleId = getIntent().getStringExtra("VEHICLE_ID");
        TextView tvVehicleId = findViewById(R.id.tvVehicleId);
        tvVehicleId.setText("Vehicle ID: " + vehicleId);

        Button btnPumpFuel = findViewById(R.id.btnPumpFuel);
        btnPumpFuel.setOnClickListener(v -> {
            Intent intent = new Intent(this, FuelPumpActivity.class);
            intent.putExtra("VEHICLE_ID", vehicleId);
            startActivity(intent);
        });

        // Fetch quota from API and update progress bar
    }
}
