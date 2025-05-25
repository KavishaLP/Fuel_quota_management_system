package com.example.fuelquotaapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

public class DashboardActivity extends AppCompatActivity {
    private static final int QR_SCAN_REQUEST = 1000;
    private RecyclerView rvRecentTransactions;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        initializeViews();
        setupRecyclerView();
        fetchRecentTransactions();
    }

    private void initializeViews() {
        rvRecentTransactions = findViewById(R.id.rvRecentTransactions);
    }

    private void setupRecyclerView() {
        rvRecentTransactions.setLayoutManager(new LinearLayoutManager(this));
        // Set your adapter here
    }

    public void navigateToQrScan(View view) {
        if (PermissionUtils.hasCameraPermission(this)) {
            startQrScanActivity();
        } else {
            PermissionUtils.requestCameraPermission(this, QR_SCAN_REQUEST);
        }
    }

    private void startQrScanActivity() {
        startActivityForResult(
                new Intent(this, QrScanActivity.class),
                QR_SCAN_REQUEST
        );
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == QR_SCAN_REQUEST) {
            handleQrScanResult(resultCode, data);
        }
    }

    private void handleQrScanResult(int resultCode, Intent data) {
        if (resultCode == RESULT_OK) {
            processSuccessfulScan(data);
        }
    }

    private void processSuccessfulScan(Intent data) {
        String qrContent = data != null ? data.getStringExtra("qr_result") : null;
        if (isValidQrContent(qrContent)) {
            navigateToVehicleDetails(qrContent);
        } else {
            showInvalidQrError();
        }
    }

    private boolean isValidQrContent(String qrContent) {
        return qrContent != null && !qrContent.trim().isEmpty();
    }

    private void navigateToVehicleDetails(String identifier) {
        Intent intent = new Intent(this, VehicleDetailsActivity.class);
        intent.putExtra("identifier", identifier.trim());
        startActivity(intent);
    }

    private void showInvalidQrError() {
        Toast.makeText(this, "Invalid QR code scanned", Toast.LENGTH_SHORT).show();
    }

    private void fetchRecentTransactions() {
        // Implement Retrofit call to fetch recent transactions
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        handleCameraPermissionResult(requestCode, grantResults);
    }

    private void handleCameraPermissionResult(int requestCode, int[] grantResults) {
        if (requestCode == QR_SCAN_REQUEST) {
            if (PermissionUtils.permissionGranted(requestCode, QR_SCAN_REQUEST, grantResults)) {
                startQrScanActivity();
            } else {
                showCameraPermissionDenied();
            }
        }
    }

    private void showCameraPermissionDenied() {
        Toast.makeText(this,
                "Camera permission required for scanning",
                Toast.LENGTH_SHORT).show();
    }
}