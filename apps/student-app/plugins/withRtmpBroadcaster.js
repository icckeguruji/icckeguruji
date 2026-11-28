const fs = require('fs');
const path = require('path');
const {
  withAndroidManifest,
  withProjectBuildGradle,
  withAppBuildGradle,
  withMainApplication,
  withDangerousMod,
} = require('@expo/config-plugins');

const BROADCASTER_VIEW_KT = `package com.idealcoaching.app

import android.content.Context
import android.view.SurfaceHolder
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.pedro.rtmp.utils.ConnectCheckerRtmp
import com.pedro.rtplibrary.rtmp.RtmpCamera2
import com.pedro.rtplibrary.view.OpenGlView

class IccRtmpBroadcasterView(context: Context) : FrameLayout(context), ConnectCheckerRtmp, SurfaceHolder.Callback {
  private val openGlView: OpenGlView = OpenGlView(context)
  private val rtmpCamera: RtmpCamera2
  private var targetRtmpUrl: String = ""
  private var wantStreaming: Boolean = false
  private var currentFacing: String = "back"
  private var isMuted: Boolean = false
  private var surfaceReady: Boolean = false

  init {
    addView(openGlView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    openGlView.holder.addCallback(this)
    rtmpCamera = RtmpCamera2(openGlView, this)
  }

  private fun emitStatus(status: String, message: String) {
    try {
      val event = Arguments.createMap()
      event.putString("status", status)
      event.putString("message", message)
      val reactContext = context as? ReactContext ?: return
      reactContext.getJSModule(RCTEventEmitter::class.java)
        .receiveEvent(id, "onStreamStatus", event)
    } catch (_: Exception) {}
  }

  fun setRtmpUrl(url: String?) {
    targetRtmpUrl = url ?: ""
  }

  fun setStreaming(streaming: Boolean) {
    wantStreaming = streaming
    if (streaming) {
      startBroadcast()
    } else {
      stopBroadcast()
    }
  }

  fun setCameraFacing(facing: String?) {
    val next = facing ?: "back"
    if (next != currentFacing) {
      currentFacing = next
      try {
        rtmpCamera.switchCamera()
      } catch (_: Exception) {}
    }
  }

  fun setMuted(muted: Boolean) {
    isMuted = muted
    try {
      if (muted) rtmpCamera.disableAudio() else rtmpCamera.enableAudio()
    } catch (_: Exception) {}
  }

  private fun startBroadcast() {
    if (targetRtmpUrl.isBlank()) {
      emitStatus("failed", "Missing RTMP Stream URL")
      return
    }
    if (rtmpCamera.isStreaming) return
    try {
      val audioOk = rtmpCamera.prepareAudio()
      val videoOk = rtmpCamera.prepareVideo()
      if (audioOk && videoOk) {
        if (isMuted) rtmpCamera.disableAudio()
        rtmpCamera.startStream(targetRtmpUrl)
        emitStatus("connecting", "Connecting to YouTube Live...")
      } else {
        emitStatus("failed", "Camera or Microphone initialization failed")
      }
    } catch (e: Exception) {
      emitStatus("failed", e.message ?: "Failed to start stream")
    }
  }

  private fun stopBroadcast() {
    try {
      if (rtmpCamera.isStreaming) {
        rtmpCamera.stopStream()
      }
      emitStatus("stopped", "Stream stopped")
    } catch (_: Exception) {}
  }

  override fun surfaceCreated(holder: SurfaceHolder) {
    surfaceReady = true
    try {
      if (!rtmpCamera.isOnPreview) {
        rtmpCamera.startPreview()
      }
      if (wantStreaming && !rtmpCamera.isStreaming) {
        startBroadcast()
      }
    } catch (_: Exception) {}
  }

  override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {}

  override fun surfaceDestroyed(holder: SurfaceHolder) {
    surfaceReady = false
    try {
      if (rtmpCamera.isStreaming) rtmpCamera.stopStream()
      if (rtmpCamera.isOnPreview) rtmpCamera.stopPreview()
    } catch (_: Exception) {}
  }

  override fun onConnectionStartedRtmp(rtmpUrl: String) {
    emitStatus("connecting", "Starting live broadcast...")
  }

  override fun onConnectionSuccessRtmp() {
    emitStatus("live", "LIVE ON YOUTUBE")
  }

  override fun onConnectionFailedRtmp(reason: String) {
    try { rtmpCamera.stopStream() } catch (_: Exception) {}
    emitStatus("failed", reason)
  }

  override fun onNewBitrateRtmp(bitrate: Long) {}

  override fun onDisconnectRtmp() {
    emitStatus("stopped", "Disconnected from YouTube")
  }

  override fun onAuthErrorRtmp() {
    emitStatus("failed", "YouTube RTMP authentication error")
  }

  override fun onAuthSuccessRtmp() {}
}
`;

const VIEW_MANAGER_KT = `package com.idealcoaching.app

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class IccRtmpBroadcasterViewManager : SimpleViewManager<IccRtmpBroadcasterView>() {
  override fun getName(): String = "IccRtmpBroadcasterView"

  override fun createViewInstance(reactContext: ThemedReactContext): IccRtmpBroadcasterView {
    return IccRtmpBroadcasterView(reactContext)
  }

  @ReactProp(name = "rtmpUrl")
  fun setRtmpUrl(view: IccRtmpBroadcasterView, url: String?) {
    view.setRtmpUrl(url)
  }

  @ReactProp(name = "streaming", defaultBoolean = false)
  fun setStreaming(view: IccRtmpBroadcasterView, streaming: Boolean) {
    view.setStreaming(streaming)
  }

  @ReactProp(name = "cameraFacing")
  fun setCameraFacing(view: IccRtmpBroadcasterView, facing: String?) {
    view.setCameraFacing(facing)
  }

  @ReactProp(name = "muted", defaultBoolean = false)
  fun setMuted(view: IccRtmpBroadcasterView, muted: Boolean) {
    view.setMuted(muted)
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
    return MapBuilder.of(
      "onStreamStatus",
      MapBuilder.of("registrationName", "onStreamStatus")
    )
  }
}
`;

const PACKAGE_KT = `package com.idealcoaching.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class IccRtmpPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> = emptyList()

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(IccRtmpBroadcasterViewManager())
  }
}
`;

function withRtmpBroadcaster(config) {
  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const perms = manifest.manifest['uses-permission'] || [];
    const needed = ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'];
    for (const p of needed) {
      if (!perms.some((item) => item.$['android:name'] === p)) {
        perms.push({ $: { 'android:name': p } });
      }
    }
    manifest.manifest['uses-permission'] = perms;
    return cfg;
  });

  config = withProjectBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('jitpack.io')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /allprojects\s*\{\s*repositories\s*\{/,
        "allprojects {\n    repositories {\n        maven { url 'https://jitpack.io' }"
      );
    }
    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    const dep = "implementation 'com.github.pedroSG94.RootEncoder:rtplibrary:2.2.6'";
    if (!cfg.modResults.contents.includes('pedroSG94.RootEncoder')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    ${dep}`
      );
    }
    return cfg;
  });

  config = withMainApplication(config, (cfg) => {
    let contents = cfg.modResults.contents;
    if (!contents.includes('IccRtmpPackage')) {
      contents = contents.replace(
        'override fun getPackages(): List<ReactPackage> =',
        'override fun getPackages(): List<ReactPackage> ='
      );
      contents = contents.replace(
        'PackageList(this).packages.apply {',
        'PackageList(this).packages.apply {\n              add(com.idealcoaching.app.IccRtmpPackage())'
      );
    }
    cfg.modResults.contents = contents;
    return cfg;
  });

  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const pkgDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app/src/main/java/com/idealcoaching/app'
      );
      fs.mkdirSync(pkgDir, { recursive: true });
      fs.writeFileSync(path.join(pkgDir, 'IccRtmpBroadcasterView.kt'), BROADCASTER_VIEW_KT);
      fs.writeFileSync(path.join(pkgDir, 'IccRtmpBroadcasterViewManager.kt'), VIEW_MANAGER_KT);
      fs.writeFileSync(path.join(pkgDir, 'IccRtmpPackage.kt'), PACKAGE_KT);
      return cfg;
    },
  ]);

  return config;
}

module.exports = withRtmpBroadcaster;
