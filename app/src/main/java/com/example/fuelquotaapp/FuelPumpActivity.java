package com.example.fuelquotaapp;
import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;


public class FuelPumpActivity extends AppCompatActivity {
    private EditText etLitres;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_fuel_pump);

        etLitres = findViewById(R.id.etLitres);
        Button btnSubmit = findViewById(R.id.btnSubmit);

        btnSubmit.setOnClickListener(v -> {
            String litresStr = etLitres.getText().toString();
            if (!litresStr.isEmpty()) {
                double litres = Double.parseDouble(litresStr);
                // Call API to record transaction
                recordFuelTransaction(litres);
            }
        });
    }

    private void recordFuelTransaction(double litres) {
        // Retrofit call to submit transaction
        // Show confirmation dialog first
    }
}
