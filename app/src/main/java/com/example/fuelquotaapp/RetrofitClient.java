package com.example.fuelquotaapp;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.widget.Toast;

import com.example.fuelquotaapp.services.ApiService;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.Cache;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {
    // Base URL should ideally come from build config or environment variables
    private static final String BASE_URL = "http://192.168.8.144:5000/api/";
    private static final int CONNECT_TIMEOUT = 15; // seconds
    private static final int READ_TIMEOUT = 30; // seconds
    private static final int WRITE_TIMEOUT = 30; // seconds

    private static Retrofit retrofit = null;
    private static OkHttpClient okHttpClient = null;

    // Private constructor to prevent instantiation
    private RetrofitClient() {}

    public static synchronized ApiService getApiService(Context context) {
        if (retrofit == null) {
            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(getOkHttpClient(context))
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit.create(ApiService.class);
    }

    private static OkHttpClient getOkHttpClient(final Context context) {
        if (okHttpClient == null) {
            // Create cache
            int cacheSize = 10 * 1024 * 1024; // 10 MB
            Cache cache = new Cache(context.getCacheDir(), cacheSize);

            // Create logging interceptor
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            // Create offline interceptor
            Interceptor offlineInterceptor = new Interceptor() {
                @Override
                public Response intercept(Chain chain) throws IOException {
                    Request request = chain.request();

                    if (!isNetworkAvailable(context)) {
                        // Customize cache behavior when offline
                        int maxStale = 60 * 60 * 24 * 7; // 1 week
                        request = request.newBuilder()
                                .header("Cache-Control", "public, only-if-cached, max-stale=" + maxStale)
                                .build();

                        // Show toast (optional)
                        Toast.makeText(context, "No internet connection, showing cached data", Toast.LENGTH_SHORT).show();
                    }
                    return chain.proceed(request);
                }
            };

            // Create online interceptor
            Interceptor onlineInterceptor = new Interceptor() {
                @Override
                public Response intercept(Chain chain) throws IOException {
                    Response response = chain.proceed(chain.request());
                    int maxAge = 60; // read from cache for 1 minute
                    return response.newBuilder()
                            .header("Cache-Control", "public, max-age=" + maxAge)
                            .removeHeader("Pragma")
                            .build();
                }
            };

            okHttpClient = new OkHttpClient.Builder()
                    .cache(cache)
                    .addInterceptor(offlineInterceptor)
                    .addNetworkInterceptor(onlineInterceptor)
                    .addInterceptor(logging)
                    .connectTimeout(CONNECT_TIMEOUT, TimeUnit.SECONDS)
                    .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)
                    .writeTimeout(WRITE_TIMEOUT, TimeUnit.SECONDS)
                    .build();
        }
        return okHttpClient;
    }

    private static boolean isNetworkAvailable(Context context) {
        ConnectivityManager connectivityManager =
                (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }
}