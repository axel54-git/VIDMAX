# ProGuard and R8 Security Rules for CineStream / FlickCove APK

# Strip debug logging in production build
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}

# Preserve Capacitor Bridge & Native Plugin interfaces
-keep class com.flickcove.stream.** { *; }
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# Preserve AndroidX Core and WebKit
-keep public class com.google.android.gms.** { public *; }
-dontwarn com.google.android.gms.**

# Code Obfuscation configurations
-repackageclasses ''
-allowaccessmodification
-optimizations !code/simplification/arithmetic,!code/allocation/variable
