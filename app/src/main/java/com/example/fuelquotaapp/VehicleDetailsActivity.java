package com.example.fuelquotaapp;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class VehicleDetailsActivity extends AppCompatActivity {

    private static final String TAG = "VehicleDetailsActivity";
    private static final String API_BASE_URL = "http://192.168.8.144:5000/api/vehicles/";
    private static final String SUBMIT_FUEL_URL = "http://192.168.8.144:5000/api/fuel-entry/";

    // UI Components
    private TextView tvVehicleNumber, tvQuota, tvVehicleType, tvValidationMessage;
    private EditText etFuelAmount;
    private Button btnSubmitFuel;

    // Data variables
    private String currentVehicleIdentifier;
    private int vehicleOwnerId;
    private double currentQuota = 0.0;
    private RequestQueue requestQueue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_vehicle_details);
        Log.d(TAG, "VehicleDetailsActivity onCreate called");

        // Initialize request queue
        requestQueue = Volley.newRequestQueue(this);

        initializeViews();
        setupInputListeners();
        handleIntentData();
    }

    private void initializeViews() {
        try {
            tvVehicleNumber = findViewById(R.id.tvVehicleNumber);
            tvQuota = findViewById(R.id.tvQuota);
            tvVehicleType = findViewById(R.id.tvVehicleType);
            tvValidationMessage = findViewById(R.id.tvValidationMessage);
            etFuelAmount = findViewById(R.id.etFuelAmount);
            btnSubmitFuel = findViewById(R.id.btnSubmitFuel);

            // Check if all required views are found
            if (tvVehicleNumber == null || tvQuota == null || tvVehicleType == null ||
                    tvValidationMessage == null || etFuelAmount == null || btnSubmitFuel == null) {
                Log.e(TAG, "One or more required views not found in layout");
                showError("Layout initialization error", true);
                return;
            }

            // Initialize quick amount buttons
            Button btnQuick5 = findViewById(R.id.btnQuick5);
            Button btnQuick10 = findViewById(R.id.btnQuick10);
            Button btnQuick20 = findViewById(R.id.btnQuick20);

            if (btnQuick5 != null) btnQuick5.setOnClickListener(v -> setQuickAmount(5));
            if (btnQuick10 != null) btnQuick10.setOnClickListener(v -> setQuickAmount(10));
            if (btnQuick20 != null) btnQuick20.setOnClickListener(v -> setQuickAmount(20));

            // Set up editor action listener for fuel amount input
            etFuelAmount.setOnEditorActionListener((v, actionId, event) -> {
                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    attemptFuelSubmission();
                    return true;
                }
                return false;
            });

            Log.d(TAG, "Views initialized successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error initializing views", e);
            showError("Failed to initialize interface", true);
        }
    }

    private void setupInputListeners() {
        etFuelAmount.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                validateInput();
            }
        });

        btnSubmitFuel.setOnClickListener(v -> attemptFuelSubmission());
    }

    private void handleIntentData() {
        currentVehicleIdentifier = getIntent().getStringExtra("vehicle_identifier");
        if (currentVehicleIdentifier == null || currentVehicleIdentifier.trim().isEmpty()) {
            Log.e(TAG, "No vehicle identifier provided");
            showError("Invalid vehicle identifier", true);
            return;
        }
        Log.d(TAG, "Vehicle identifier: " + currentVehicleIdentifier);
        fetchVehicleDetails(currentVehicleIdentifier.trim());
    }

    private void fetchVehicleDetails(String identifier) {
        try {
            String encodedIdentifier = URLEncoder.encode(identifier, "UTF-8");
            String url = API_BASE_URL + encodedIdentifier;
            Log.d(TAG, "Fetching vehicle details from: " + url);

            JsonObjectRequest request = new JsonObjectRequest(
                    Request.Method.GET,
                    url,
                    null,
                    new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            handleDetailsResponse(response);
                        }
                    },
                    new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            handleError(error);
                        }
                    }
            );

            request.setRetryPolicy(new DefaultRetryPolicy(
                    15000, // 15 seconds timeout
                    0, // no retries
                    DefaultRetryPolicy.DEFAULT_BACKOFF_MULT
            ));

            requestQueue.add(request);

        } catch (UnsupportedEncodingException e) {
            Log.e(TAG, "Error encoding vehicle identifier", e);
            showError("Invalid vehicle identifier encoding", true);
        }
    }

    private void handleDetailsResponse(JSONObject response) {
        try {
            Log.d(TAG, "Vehicle details response: " + response.toString());

            // Check if response indicates success
            boolean success = response.optBoolean("success", false);
            if (!success) {
                String message = response.optString("message", "Request failed");
                Log.e(TAG, "API returned success=false: " + message);
                showError(message, false);
                return;
            }

            // Check for data field
            if (!response.has("data")) {
                Log.e(TAG, "Response missing 'data' field");
                showError("Invalid response format", false);
                return;
            }

            JSONObject data = response.getJSONObject("data");
            if (data == null) {
                Log.e(TAG, "Data object is null");
                showError("No vehicle data found", false);
                return;
            }

            // More robust field extraction with null checks and default values
            try {
                // Check for required fields before accessing them
                if (!data.has("vehicle_owner_id")) {
                    Log.e(TAG, "Missing vehicle_owner_id in response");
                    showError("Invalid vehicle data: missing owner ID", false);
                    return;
                }

                if (!data.has("remaining_quota")) {
                    Log.e(TAG, "Missing remaining_quota in response");
                    showError("Invalid vehicle data: missing quota information", false);
                    return;
                }

                // Extract vehicle details with proper error handling
                vehicleOwnerId = data.getInt("vehicle_owner_id");

                // Handle quota as either double or string
                Object quotaObj = data.get("remaining_quota");
                if (quotaObj instanceof Number) {
                    currentQuota = ((Number) quotaObj).doubleValue();
                } else if (quotaObj instanceof String) {
                    try {
                        currentQuota = Double.parseDouble((String) quotaObj);
                    } catch (NumberFormatException e) {
                        Log.e(TAG, "Invalid quota format: " + quotaObj);
                        currentQuota = 0.0;
                    }
                } else {
                    Log.e(TAG, "Unexpected quota type: " + quotaObj.getClass().getSimpleName());
                    currentQuota = 0.0;
                }

                displayVehicleDetails(data);
                updateQuotaDisplay();

                Log.d(TAG, "Vehicle details loaded successfully - ID: " + vehicleOwnerId + ", Quota: " + currentQuota);

            } catch (JSONException e) {
                Log.e(TAG, "Error extracting specific fields from data object", e);
                showError("Data format error: " + e.getMessage(), false);
            }

        } catch (JSONException e) {
            Log.e(TAG, "Error parsing vehicle details response", e);
            Log.e(TAG, "Response content: " + response.toString());
            showError("Data processing error: " + e.getMessage(), false);
        } catch (Exception e) {
            Log.e(TAG, "Unexpected error handling response", e);
            showError("Unexpected error: " + e.getMessage(), false);
        }
    }

    private void displayVehicleDetails(JSONObject data) throws JSONException {
        // Safely extract vehicle details with fallbacks
        String vehicleNumber = data.optString("vehicleNumber", "Unknown");
        String vehicleType = data.optString("vehicleTypeName", "Unknown");

        // Handle potential null values
        if (vehicleNumber.isEmpty() || "null".equals(vehicleNumber)) {
            vehicleNumber = data.optString("vehicle_number", "Unknown");
        }
        if (vehicleType.isEmpty() || "null".equals(vehicleType)) {
            vehicleType = data.optString("vehicle_type", "Unknown");
        }

        tvVehicleNumber.setText(vehicleNumber);
        tvVehicleType.setText(vehicleType);

        Log.d(TAG, "Displayed vehicle: " + vehicleNumber + " (" + vehicleType + ")");
    }

    private void attemptFuelSubmission() {
        String input = etFuelAmount.getText().toString().trim();
        if (input.isEmpty()) {
            showError("Please enter fuel amount", false);
            return;
        }

        try {
            double amount = Double.parseDouble(input);
            if (!validateAmount(amount)) return;

            Log.d(TAG, "Submitting fuel entry: " + amount + "L");
            submitFuelEntryToServer(amount);

        } catch (NumberFormatException e) {
            Log.e(TAG, "Invalid number format: " + input, e);
            showError("Invalid number format", false);
        }
    }

    private boolean validateAmount(double amount) {
        if (amount <= 0) {
            showError("Amount must be positive", false);
            return false;
        }
        if (amount > currentQuota) {
            tvValidationMessage.setVisibility(View.VISIBLE);
            showError("Amount exceeds remaining quota", false);
            return false;
        }
        tvValidationMessage.setVisibility(View.GONE);
        return true;
    }

    private void submitFuelEntryToServer(double amount) {
        try {
            JSONObject payload = new JSONObject();
            payload.put("vehicle_id", vehicleOwnerId);
            payload.put("fuel_amount", amount);

            Log.d(TAG, "Fuel entry payload: " + payload.toString());

            JsonObjectRequest request = new JsonObjectRequest(
                    Request.Method.POST,
                    SUBMIT_FUEL_URL,
                    payload,
                    new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            handleSubmissionResponse(response, amount);
                        }
                    },
                    new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            handleSubmissionError(error);
                        }
                    }
            ) {
                @Override
                public Map<String, String> getHeaders() {
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Content-Type", "application/json");
                    return headers;
                }
            };

            request.setRetryPolicy(new DefaultRetryPolicy(
                    15000, // 15 seconds timeout
                    0, // no retries
                    DefaultRetryPolicy.DEFAULT_BACKOFF_MULT
            ));

            requestQueue.add(request);
            showLoadingState(true);

        } catch (JSONException e) {
            Log.e(TAG, "Error creating fuel entry payload", e);
            showError("Submission error", true);
        }
    }

    private void handleSubmissionResponse(JSONObject response, double amount) {
        showLoadingState(false);
        try {
            Log.d(TAG, "Fuel entry response: " + response.toString());

            if (response.getBoolean("success")) {
                JSONObject data = response.getJSONObject("data");
                currentQuota = data.getDouble("remaining_quota");

                updateQuotaDisplay();
                etFuelAmount.setText("");

                String successMessage = "Fuel entry submitted successfully!\n" +
                        "Amount: " + amount + "L\n" +
                        "Remaining Quota: " + String.format(Locale.getDefault(), "%.2f", currentQuota) + "L";

                showToast(successMessage);
                Log.d(TAG, "Fuel entry submitted successfully");
            } else {
                String errorMessage = response.optString("message", "Submission failed");
                showError(errorMessage, false);
                Log.e(TAG, "Fuel entry submission failed: " + errorMessage);
            }
        } catch (JSONException e) {
            Log.e(TAG, "Error parsing submission response", e);
            showError("Response parsing error", true);
        }
    }

    private void handleSubmissionError(VolleyError error) {
        showLoadingState(false);
        String errorMsg = "Submission failed";

        if (error.networkResponse != null) {
            try {
                String responseBody = new String(error.networkResponse.data, "UTF-8");
                Log.e(TAG, "Server error response: " + responseBody);

                // Try to parse error response for better error message
                try {
                    JSONObject errorResponse = new JSONObject(responseBody);
                    if (errorResponse.has("message")) {
                        errorMsg = errorResponse.getString("message");
                    }
                } catch (JSONException e) {
                    errorMsg = "HTTP " + error.networkResponse.statusCode;
                }
            } catch (UnsupportedEncodingException e) {
                errorMsg = "HTTP " + error.networkResponse.statusCode;
            }
        } else if (error.getMessage() != null) {
            errorMsg = error.getMessage();
        }

        Log.e(TAG, "Fuel submission error: " + errorMsg);
        showError(errorMsg, false);
    }

    private void validateInput() {
        String input = etFuelAmount.getText().toString().trim();
        if (input.isEmpty()) {
            tvValidationMessage.setVisibility(View.GONE);
            return;
        }

        try {
            double amount = Double.parseDouble(input);
            if (amount > currentQuota) {
                tvValidationMessage.setText("⚠️ Amount exceeds remaining quota!");
                tvValidationMessage.setVisibility(View.VISIBLE);
            } else {
                tvValidationMessage.setVisibility(View.GONE);
            }
        } catch (NumberFormatException e) {
            tvValidationMessage.setText("⚠️ Invalid number format");
            tvValidationMessage.setVisibility(View.VISIBLE);
        }
    }

    private void setQuickAmount(int liters) {
        etFuelAmount.setText(String.valueOf(liters));
        validateInput();
        Log.d(TAG, "Quick amount set: " + liters + "L");
    }

    private void updateQuotaDisplay() {
        if (tvQuota != null) {
            tvQuota.setText(String.format(Locale.getDefault(), "%.2f L", currentQuota));
        }
    }

    private void showLoadingState(boolean isLoading) {
        if (btnSubmitFuel != null) {
            btnSubmitFuel.setEnabled(!isLoading);
            btnSubmitFuel.setText(isLoading ? "Submitting..." : "🚀 SUBMIT FUEL ENTRY");
        }
    }

    private void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    private void showError(String message, boolean critical) {
        Log.e(TAG, "Error: " + message);
        Toast.makeText(this, message, critical ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT).show();
        if (critical) {
            finish();
        }
    }

    private void handleError(VolleyError error) {
        String errorMsg = "Server error";

        if (error.networkResponse != null) {
            try {
                String responseBody = new String(error.networkResponse.data, "UTF-8");
                Log.e(TAG, "Server error response: " + responseBody);

                // Try to parse error response for better error message
                try {
                    JSONObject errorResponse = new JSONObject(responseBody);
                    if (errorResponse.has("message")) {
                        errorMsg = errorResponse.getString("message");
                    }
                } catch (JSONException e) {
                    errorMsg = "HTTP " + error.networkResponse.statusCode;
                }
            } catch (UnsupportedEncodingException e) {
                errorMsg = "HTTP " + error.networkResponse.statusCode;
            }
        } else if (error.getMessage() != null) {
            errorMsg = error.getMessage();
        }

        Log.e(TAG, "Network error: " + errorMsg);
        showError(errorMsg, true);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (requestQueue != null) {
            requestQueue.cancelAll(TAG);
        }
    }
}