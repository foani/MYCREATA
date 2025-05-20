# CreLink 앱 ProGuard 규칙

# React Native 기본 규칙
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.** { *; }

# JSC를 최적화하지 않도록 설정
-keep class com.facebook.react.bridge.CatalystInstance { *; }
-keep class com.facebook.react.bridge.JavaScriptModule { *; }
-keep class com.facebook.react.bridge.ReadableType { *; }
-keep class com.facebook.react.bridge.ReadableNativeArray { *; }
-keep class com.facebook.react.modules.** { *; }

# React Native 네비게이션 라이브러리
-keep class com.reactnavigation.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# 암호화 관련 라이브러리 보존
-keep class org.bouncycastle.** { *; }
-keep class org.spongycastle.** { *; }
-keep class com.wallet.crypto.trustapp.** { *; }

# ethers.js 관련 네이티브 바인딩 보존
-keep class org.ethereum.** { *; }
-keep class io.reactivex.** { *; }

# SVG 및 QR 코드 라이브러리
-keep class com.horcrux.svg.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.github.mikephil.charting.** { *; }

# 지문 인식 관련 라이브러리
-keep class com.rnbiometrics.** { *; }
-keep class com.reactnativebiometrics.** { *; }

# MMKV 저장소 라이브러리
-keep class com.tencent.mmkv.** { *; }

# 키체인 보안 스토리지
-keep class com.oblador.keychain.** { *; }

# 푸시 알림 관련
-keep class com.dieam.reactnativepushnotification.** { *; }

# Firebase 관련
-keep class com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }

# 지갑 및 블록체인 관련
-keep class wallet.core.jni.** { *; }
-keep class io.ethmobile.** { *; }

# 난독화 문제 발생 가능한 외부 라이브러리
-keep class com.facebook.crypto.** { *; }
-keep class com.facebook.soloader.** { *; }

# 네이티브 모듈 및 콜백 보존
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp *;
}

-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}

-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters

-keep @com.facebook.common.internal.DoNotStrip class *
-keep @com.facebook.proguard.annotations.DoNotStrip class *

-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}

-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

# Hermes 엔진
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Fastify 관련 
-keep class io.jsonwebtoken.** { *; }

# 커스텀 네이티브 모듈
-keep class com.crelink.wallet.** { *; }
