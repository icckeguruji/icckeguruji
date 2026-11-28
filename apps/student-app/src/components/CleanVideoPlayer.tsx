import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { SlidersHorizontal } from 'lucide-react-native';

interface CleanVideoPlayerProps {
  videoId: string;
  height?: number;
  autoplay?: boolean;
}

const QUALITY_OPTIONS = [
  { key: 'default', label: 'Auto' },
  { key: 'hd1080', label: '1080p' },
  { key: 'hd720', label: '720p' },
  { key: 'large', label: '480p' },
  { key: 'medium', label: '360p' },
];

export function CleanVideoPlayer({
  videoId,
  height = 220,
  autoplay = false,
}: CleanVideoPlayerProps) {
  const webViewRef = useRef<WebView>(null);
  const [quality, setQuality] = useState<string>('default');

  const handleQualityChange = (qKey: string) => {
    setQuality(qKey);
    if (Platform.OS !== 'web' && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        try {
          if (window.iccPlayer && typeof window.iccPlayer.setPlaybackQuality === 'function') {
            window.iccPlayer.setPlaybackQuality('${qKey}');
          }
        } catch(e) {}
        true;
      `);
    }
  };

  const cleanHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    #player { width: 100%; height: 100%; }
    /* Shield top bar (title/share/watch later) & bottom-right YouTube logo */
    .shield-top {
      position: fixed; top: 0; left: 0; right: 0; height: 52px;
      z-index: 9999; background: transparent;
    }
    .shield-yt-logo {
      position: fixed; bottom: 0; right: 0; width: 110px; height: 48px;
      z-index: 9999; background: transparent;
    }
  </style>
</head>
<body>
  <div id="player"></div>
  <div class="shield-top"></div>
  <div class="shield-yt-logo"></div>
  <script src="https://www.youtube.com/iframe_api"></script>
  <script>
    var iccPlayer;
    function onYouTubeIframeAPIReady() {
      iccPlayer = new YT.Player('player', {
        width: '100%',
        height: '100%',
        videoId: '${videoId}',
        playerVars: {
          autoplay: ${autoplay ? 1 : 0},
          controls: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
          playsinline: 1
        },
        events: {
          onReady: function(e) {
            try { e.target.setPlaybackQuality('${quality}'); } catch(err) {}
          }
        }
      });
      window.iccPlayer = iccPlayer;
    }
  </script>
</body>
</html>
  `;

  return (
    <View>
      <View style={[styles.playerBox, { height }]}>
        {Platform.OS === 'web' ? (
          <iframe
            key={`${videoId}-${quality}`}
            width="100%"
            height={height}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&controls=1&iv_load_policy=3&fs=0&vq=${quality}`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            style={{ border: 'none' }}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: cleanHtml, baseUrl: 'https://icconline.vercel.app' }}
            style={{ flex: 1, backgroundColor: '#000000' }}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
          />
        )}

        {/* Native protective overlays: block YouTube Share, Title & Branding */}
        <View style={styles.topShield} pointerEvents="auto" />
        <View style={styles.bottomRightShield} pointerEvents="auto" />
      </View>

      {/* In-App Video Quality Selector */}
      <View style={styles.qualityBar}>
        <View style={styles.qualityLabelRow}>
          <SlidersHorizontal size={12} color="#94A3B8" />
          <Text style={styles.qualityLabel}>Quality:</Text>
        </View>
        <View style={styles.qualityPills}>
          {QUALITY_OPTIONS.map((opt) => {
            const active = quality === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => handleQualityChange(opt.key)}
                style={[styles.qualityPill, active && styles.qualityPillActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.qualityPillText, active && styles.qualityPillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerBox: {
    width: '100%',
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  topShield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    zIndex: 20,
  },
  bottomRightShield: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 105,
    height: 44,
    zIndex: 20,
  },
  qualityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  qualityLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  qualityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  qualityPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qualityPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  qualityPillActive: {
    backgroundColor: '#2563EB',
  },
  qualityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  qualityPillTextActive: {
    color: '#FFFFFF',
  },
});
