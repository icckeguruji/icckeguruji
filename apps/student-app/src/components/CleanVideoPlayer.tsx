import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { SlidersHorizontal, ShieldCheck } from 'lucide-react-native';

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

export function extractYouTubeId(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return 'jfKfPfyJRdk';
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  try {
    if (raw.includes('youtu.be/')) {
      return raw.split('youtu.be/')[1].split(/[?&/]/)[0] || raw;
    }
    if (raw.includes('v=')) {
      return raw.split('v=')[1].split(/[?&/]/)[0] || raw;
    }
    if (raw.includes('/embed/')) {
      return raw.split('/embed/')[1].split(/[?&/]/)[0] || raw;
    }
    if (raw.includes('/live/')) {
      return raw.split('/live/')[1].split(/[?&/]/)[0] || raw;
    }
    if (raw.includes('/shorts/')) {
      return raw.split('/shorts/')[1].split(/[?&/]/)[0] || raw;
    }
  } catch {}
  return raw;
}

export function CleanVideoPlayer({
  videoId,
  height = 220,
  autoplay = false,
}: CleanVideoPlayerProps) {
  const webViewRef = useRef<WebView>(null);
  const [quality, setQuality] = useState<string>('default');
  const cleanId = extractYouTubeId(videoId);

  const handleQualityChange = (qKey: string) => {
    setQuality(qKey);
    if (Platform.OS !== 'web' && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        try {
          var frame = document.getElementById('icc-yt-frame');
          if (frame && frame.contentWindow) {
            frame.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'setPlaybackQuality',
              args: ['${qKey}']
            }), '*');
          }
        } catch(e) {}
        true;
      `);
    }
  };

  const embedSrc = `https://www.youtube-nocookie.com/embed/${cleanId}?enablejsapi=1&autoplay=${autoplay ? 1 : 0}&controls=1&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&vq=${quality}`;

  const cleanHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: 0; display: block; }
    /* Solid opaque shields: completely hide & block YouTube Title, Share button, Watch Later & YouTube Logo */
    .shield-top {
      position: fixed; top: 0; left: 0; right: 0; height: 52px;
      z-index: 9999; background: #0F172A;
      display: flex; align-items: center; padding: 0 12px;
      color: #CBD5E1; font-family: sans-serif; font-size: 11px; font-weight: 700;
      letter-spacing: 0.4px; pointer-events: auto;
    }
    .shield-yt-logo {
      position: fixed; bottom: 0; right: 0; width: 115px; height: 46px;
      z-index: 9999; background: #000000; pointer-events: auto;
    }
  </style>
</head>
<body>
  <iframe
    id="icc-yt-frame"
    src="${embedSrc}"
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
  <div class="shield-top">ICC PROTECTED PLAYER</div>
  <div class="shield-yt-logo"></div>
</body>
</html>
  `;

  return (
    <View>
      <View style={[styles.playerBox, { height }]}>
        {Platform.OS === 'web' ? (
          <iframe
            key={`${cleanId}-${quality}`}
            width="100%"
            height={height}
            src={embedSrc}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            style={{ border: 'none' }}
          />
        ) : (
          <WebView
            key={cleanId}
            ref={webViewRef}
            source={{ html: cleanHtml, baseUrl: 'https://www.youtube-nocookie.com' }}
            style={{ flex: 1, backgroundColor: '#000000' }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            allowsInlineMediaPlayback
            allowsFullscreenVideo={false}
            setSupportMultipleWindows={false}
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            onShouldStartLoadWithRequest={(req) => {
              const u = (req.url || '').toLowerCase();
              if (u.startsWith('about:') || u.includes('youtube-nocookie.com/embed/')) {
                return true;
              }
              return false;
            }}
          />
        )}

        {/* Native opaque shields: guarantee YouTube Share button, Title & Logo are invisible and untappable */}
        <View style={styles.topShield} pointerEvents="auto">
          <ShieldCheck size={13} color="#38BDF8" />
          <Text style={styles.topShieldText}>ICC PROTECTED STREAM</Text>
        </View>
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
    height: 52,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    zIndex: 20,
  },
  topShieldText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomRightShield: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 115,
    height: 46,
    backgroundColor: '#000000',
    zIndex: 20,
  },
  qualityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  qualityLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qualityLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
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
    borderWidth: 1,
    borderColor: '#334155',
  },
  qualityPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  qualityPillText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  qualityPillTextActive: {
    color: '#FFFFFF',
  },
});
