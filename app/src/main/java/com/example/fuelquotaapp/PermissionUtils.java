package com.example.fuelquotaapp;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class PermissionUtils {

    public static boolean hasCameraPermission(Context context) {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED;
    }

    public static void requestCameraPermission(Activity activity, int requestCode) {
        ActivityCompat.requestPermissions(activity,
                new String[]{Manifest.permission.CAMERA},
                requestCode);
    }

    public static boolean permissionGranted(int requestCode, int targetRequestCode, int[] grantResults) {
        return requestCode == targetRequestCode &&
                grantResults.length > 0 &&
                grantResults[0] == PackageManager.PERMISSION_GRANTED;
    }
}