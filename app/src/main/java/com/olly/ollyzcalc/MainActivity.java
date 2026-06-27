package com.olly.ollyzcalc;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String LIFECYCLE_TAG = "Lifecycle";
    private static final String PREFS_NAME = "ollyz_calc_state";
    private static final String STATE_KEY = "calculator_state";
    private static final String DEFAULT_STATE = "{\"expression\":\"\",\"result\":\"0\",\"mode\":\"basic\",\"angleMode\":\"DEG\"}";

    private WebView webView;
    private SharedPreferences preferences;
    private boolean pageReady = false;
    private String pendingRestoreJson;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(LIFECYCLE_TAG, "onCreate");

        preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = true;
                if (pendingRestoreJson != null) {
                    restoreCalculatorState(pendingRestoreJson);
                    pendingRestoreJson = null;
                }
            }``             `                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ```````
        });

        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(LIFECYCLE_TAG, "onStart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(LIFECYCLE_TAG, "onResume");
        String savedState = preferences.getString(STATE_KEY, DEFAULT_STATE);
        if (pageReady) {
            restoreCalculatorState(savedState);
        } else {
            pendingRestoreJson = savedState;
        }
    }

    @Override
    protected void onPause() {
        Log.d(LIFECYCLE_TAG, "onPause");
        if (webView != null && pageReady) {
            webView.evaluateJavascript(
                    "window.getState ? window.getState() : null;",
                    value -> {
                        String json = decodeJavascriptString(value);
                        if (json != null && !json.trim().isEmpty()) {
                            preferences.edit().putString(STATE_KEY, json).apply();
                        }
                    }
            );
        }
        super.onPause();
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(LIFECYCLE_TAG, "onStop");
    }

    @Override
    protected void onDestroy() {
        Log.d(LIFECYCLE_TAG, "onDestroy");
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private void restoreCalculatorState(String json) {
        if (webView == null || json == null) {
            return;
        }
        String script = "window.restoreState && window.restoreState(" + JSONObject.quote(json) + ");";
        webView.evaluateJavascript(script, null);
    }

    private String decodeJavascriptString(String value) {
        if (value == null || "null".equals(value)) {
            return null;
        }
        try {
            return new JSONArray("[" + value + "]").getString(0);
        } catch (JSONException ignored) {
            return value;
        }
    }
}
