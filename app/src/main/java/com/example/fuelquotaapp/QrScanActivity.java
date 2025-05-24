// Updated QrScanActivity with debugging
package com.example.fuelquotaapp;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.util.SparseArray;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.vision.CameraSource;
import com.google.android.gms.vision.Detector;
import com.google.android.gms.vision.barcode.Barcode;
import com.google.android.gms.vision.barcode.BarcodeDetector;

import java.io.IOException;

public class QrScanActivity extends AppCompatActivity {

    private static final int CAMERA_PERMISSION_REQUEST = 1001;
    private static final String TAG = "QrScanActivity";
    private SurfaceView cameraPreview;
    private CameraSource cameraSource;
    private BarcodeDetector barcodeDetector;
    private boolean isProcessing = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_scan);

        Log.d(TAG, "QrScanActivity onCreate called");

        cameraPreview = findViewById(R.id.camera_preview);
        if (cameraPreview == null) {
            Log.e(TAG, "Camera preview SurfaceView not found in layout!");
            Toast.makeText(this, "Camera view not found", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        initializeScanner();
    }

    private void initializeScanner() {
        Log.d(TAG, "Initializing scanner...");

        // 1. Setup barcode detector
        barcodeDetector = new BarcodeDetector.Builder(this)
                .setBarcodeFormats(Barcode.QR_CODE)
                .build();

        if (!barcodeDetector.isOperational()) {
            Log.e(TAG, "Barcode detector is not operational");
            Toast.makeText(this, "Scanner setup failed - detector not operational", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        Log.d(TAG, "Barcode detector is operational");

        // 2. Setup camera source
        cameraSource = new CameraSource.Builder(this, barcodeDetector)
                .setAutoFocusEnabled(true)
                .setRequestedPreviewSize(1600, 1024)
                .build();

        // 3. Setup surface view
        cameraPreview.getHolder().addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(SurfaceHolder holder) {
                Log.d(TAG, "Surface created");
                try {
                    if (PermissionUtils.hasCameraPermission(QrScanActivity.this)) {
                        Log.d(TAG, "Camera permission granted, starting camera");
                        cameraSource.start(holder);
                    } else {
                        Log.d(TAG, "Requesting camera permission");
                        PermissionUtils.requestCameraPermission(QrScanActivity.this, CAMERA_PERMISSION_REQUEST);
                    }
                } catch (IOException e) {
                    Log.e(TAG, "Camera start failed", e);
                    showErrorAndFinish("Camera initialization failed: " + e.getMessage());
                } catch (SecurityException e) {
                    Log.e(TAG, "Security exception when starting camera", e);
                    showErrorAndFinish("Camera permission denied");
                }
            }

            @Override
            public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
                Log.d(TAG, "Surface changed: " + width + "x" + height);
            }

            @Override
            public void surfaceDestroyed(SurfaceHolder holder) {
                Log.d(TAG, "Surface destroyed");
                if (cameraSource != null) {
                    cameraSource.stop();
                }
            }
        });

        // 4. Setup barcode processor
        barcodeDetector.setProcessor(new Detector.Processor<Barcode>() {
            @Override
            public void release() {
                Log.d(TAG, "Barcode processor released");
            }

            @Override
            public void receiveDetections(Detector.Detections<Barcode> detections) {
                if (isProcessing) {
                    Log.d(TAG, "Already processing, ignoring detection");
                    return;
                }

                SparseArray<Barcode> barcodes = detections.getDetectedItems();
                Log.d(TAG, "Detected " + barcodes.size() + " barcodes");

                if (barcodes.size() > 0) {
                    isProcessing = true;
                    Barcode barcode = barcodes.valueAt(0);
                    String qrContent = barcode.displayValue;

                    Log.d(TAG, "QR Code detected: " + qrContent);
                    Log.d(TAG, "QR Code format: " + barcode.format);
                    Log.d(TAG, "QR Code value format: " + barcode.valueFormat);

                    runOnUiThread(() -> handleQrResult(qrContent));
                }
            }
        });

        Log.d(TAG, "Scanner initialization complete");
    }

    // Updated handleQrResult method with safe navigation
    private void handleQrResult(String qrContent) {
        Log.d(TAG, "Handling QR result: " + qrContent);

        try {
            // Validate QR content
            if (qrContent == null || qrContent.trim().isEmpty()) {
                Log.e(TAG, "QR content is null or empty");
                Toast.makeText(this, "Invalid QR code - no data", Toast.LENGTH_SHORT).show();
                resetScanner();
                return;
            }

            // Stop camera before navigation
            if (cameraSource != null) {
                Log.d(TAG, "Stopping camera source");
                cameraSource.stop();
            }

            Log.d(TAG, "Creating intent to VehicleDetailsActivity");

            // Create explicit intent with full class name
            Intent intent = new Intent();
            intent.setClassName(this, "com.example.fuelquotaapp.VehicleDetailsActivity");
            intent.putExtra("vehicle_identifier", qrContent.trim());

            // Alternative method - use class reference
            // Intent intent = new Intent(this, VehicleDetailsActivity.class);
            // intent.putExtra("vehicle_identifier", qrContent.trim());

            Log.d(TAG, "Starting VehicleDetailsActivity with identifier: " + qrContent.trim());

            // Check if the activity can be resolved before starting
            if (intent.resolveActivity(getPackageManager()) != null) {
                startActivity(intent);
                finish();
            } else {
                Log.e(TAG, "VehicleDetailsActivity cannot be resolved");
                Toast.makeText(this, "Navigation error - Activity not found", Toast.LENGTH_LONG).show();
                resetScanner();
            }

        } catch (Exception e) {
            Log.e(TAG, "Error handling QR result", e);
            Toast.makeText(this, "Error processing QR code: " + e.getMessage(), Toast.LENGTH_LONG).show();
            resetScanner();
        }
    }

    private void resetScanner() {
        Log.d(TAG, "Resetting scanner");
        isProcessing = false;
        try {
            if (cameraSource != null && cameraPreview != null) {
                cameraSource.start(cameraPreview.getHolder());
                Log.d(TAG, "Scanner reset successfully");
            }
        } catch (IOException | SecurityException e) {
            Log.e(TAG, "Cannot restart scanner", e);
            showErrorAndFinish("Cannot restart scanner: " + e.getMessage());
        }
    }

    private void showErrorAndFinish(String message) {
        Log.e(TAG, "Showing error and finishing: " + message);
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        finish();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == CAMERA_PERMISSION_REQUEST) {
            if (PermissionUtils.hasCameraPermission(this)) {
                Log.d(TAG, "Camera permission granted after request");
                try {
                    if (cameraSource != null && cameraPreview != null) {
                        cameraSource.start(cameraPreview.getHolder());
                    }
                } catch (IOException | SecurityException e) {
                    Log.e(TAG, "Failed to start camera after permission grant", e);
                    showErrorAndFinish("Camera start failed after permission grant");
                }
            } else {
                Log.e(TAG, "Camera permission denied");
                showErrorAndFinish("Camera permission is required for QR scanning");
            }
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "onPause called");
        if (cameraSource != null) {
            cameraSource.stop();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "onResume called");
        // Reset processing flag when resuming
        isProcessing = false;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy called");

        if (cameraSource != null) {
            cameraSource.release();
            cameraSource = null;
        }
        if (barcodeDetector != null) {
            barcodeDetector.release();
            barcodeDetector = null;
        }
    }
}