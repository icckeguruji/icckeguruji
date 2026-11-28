import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react-native';

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

const SPEED_OPTIONS = [1, 1.25, 1.5, 2];

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

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem < 10 ? '0' : ''}${rem}`;
}

export function CleanVideoPlayer({
  videoId,
  height = 220,
  autoplay = false,
}: CleanVideoPlayerProps) {
  const webViewRef = useRef<WebView>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState<string>('default');
  const [speed, setSpeed] = useState<number>(1);
  const [barWidth, setBarWidth] = useState<number>(1);
  const cleanId = extractYouTubeId(videoId);

  useEffect(() => {
    setIsPlaying(autoplay);
    setCurrentTime(0);
    setDuration(0);
  }, [cleanId, autoplay]);

  const sendPlayerCmd = (js: string) => {
    if (Platform.OS !== 'web' && webViewRef.current) {
      webViewRef.current.injectJavaScript(`try { ${js} } catch(e) {} true;`);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      sendPlayerCmd('if (window.iccPlayer) window.iccPlayer.pauseVideo();');
      setIsPlaying(false);
    } else {
      sendPlayerCmd('if (window.iccPlayer) window.iccPlayer.playVideo();');
      setIsPlaying(true);
    }
  };

  const seekBy = (delta: number) => {
    const target = Math.max(0, Math.min(duration || 999999, currentTime + delta));
    setCurrentTime(target);
    sendPlayerCmd(`if (window.iccPlayer) window.iccPlayer.seekTo(${target}, true);`);
  };

  const handleSeekPress = (locationX: number) => {
    if (!duration || barWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / barWidth));
    const target = Math.floor(ratio * duration);
    setCurrentTime(target);
    sendPlayerCmd(`if (window.iccPlayer) window.iccPlayer.seekTo(${target}, true);`);
  };

  const handleQualityChange = (qKey: string) => {
    setQuality(qKey);
    sendPlayerCmd(`
      if (window.iccPlayer) {
        window.iccPlayer.setPlaybackQuality('${qKey}');
        var t = window.iccPlayer.getCurrentTime ? window.iccPlayer.getCurrentTime() : 0;
        if (window.iccPlayer.loadVideoById) {
          window.iccPlayer.loadVideoById({ videoId: '${cleanId}', startSeconds: t, suggestedQuality: '${qKey}' });
        }
      }
    `);
  };

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setSpeed(next);
    sendPlayerCmd(`if (window.iccPlayer && window.iccPlayer.setPlaybackRate) window.iccPlayer.setPlaybackRate(${next});`);
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'progress') {
        if (typeof msg.currentTime === 'number') setCurrentTime(msg.currentTime);
        if (typeof msg.duration === 'number' && msg.duration > 0) setDuration(msg.duration);
      } else if (msg.type === 'state') {
        setIsPlaying(msg.state === 1);
      }
    } catch {}
  };

  // Zero-YouTube-UI HTML: controls=0 disables all YouTube buttons (no Share, no Copy Link, no Logo bar),
  // and full-screen touch shield prevents long-press context menu completely.
  const cleanHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    #player { width: 100%; height: 100%; pointer-events: none; }
    .touch-shield {
      position: fixed; inset: 0; z-index: 9999;
      background: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
  </style>
</head>
<body oncontextmenu="return false;">
  <div id="player"></div>
  <div class="touch-shield" oncontextmenu="return false;"></div>
  <script src="https://www.youtube.com/iframe_api"></script>
  <script>
    var iccPlayer;
    function postMsg(obj) {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(obj));
        }
      } catch(e) {}
    }
    function onYouTubeIframeAPIReady() {
      iccPlayer = new YT.Player('player', {
        width: '100%',
        height: '100%',
        videoId: '${cleanId}',
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: ${autoplay ? 1 : 0},
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
          playsinline: 1,
          showinfo: 0,
          origin: 'https://www.youtube-nocookie.com'
        },
        events: {
          onReady: function(e) {
            try {
              e.target.setPlaybackQuality('${quality}');
              if (${autoplay ? 'true' : 'false'}) e.target.playVideo();
            } catch(err) {}
          },
          onStateChange: function(e) {
            postMsg({ type: 'state', state: e.data });
          }
        }
      });
      window.iccPlayer = iccPlayer;
      setInterval(function() {
        try {
          if (iccPlayer && iccPlayer.getCurrentTime && iccPlayer.getDuration) {
            postMsg({
              type: 'progress',
              currentTime: iccPlayer.getCurrentTime() || 0,
              duration: iccPlayer.getDuration() || 0
            });
          }
        } catch(e) {}
      }, 800);
    }
  </script>
</body>
</html>
  `;

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.playerBox, { height }]}>
        {Platform.OS === 'web' ? (
          <View style={{ flex: 1, position: 'relative' }}>
            <iframe
              key={`${cleanId}-${quality}`}
              width="100%"
              height={height}
              src={`https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=${autoplay ? 1 : 0}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&vq=${quality}`}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              style={{ border: 'none', pointerEvents: 'none' }}
            />
          </View>
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
            onMessage={handleWebViewMessage}
            onShouldStartLoadWithRequest={(req) => {
              const u = (req.url || '').toLowerCase();
              return u.startsWith('about:') || u.includes('youtube-nocookie.com') || u.includes('youtube.com/iframe_api');
            }}
          />
        )}

        {/* Full-surface touch shield: completely blocks long-press Copy Link / Share / Watch on YouTube */}
        <Pressable
          style={styles.fullTouchShield}
          onPress={togglePlay}
          onLongPress={() => {}}
        >
          {!isPlaying && (
            <View style={styles.centerPlayCircle}>
              <Play size={26} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          )}
        </Pressable>

        {/* Subtle ICC Badge (no YouTube branding) */}
        <View style={styles.iccBadge} pointerEvents="none">
          <ShieldCheck size={11} color="#38BDF8" />
          <Text style={styles.iccBadgeText}>ICC PLAYER</Text>
        </View>
      </View>

      {/* Custom Seek Bar + Controls */}
      <View style={styles.controlsContainer}>
        <Pressable
          style={styles.progressTrack}
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          onPress={(e) => handleSeekPress(e.nativeEvent.locationX)}
        >
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </Pressable>

        <View style={styles.controlsRow}>
          <View style={styles.leftControls}>
            <TouchableOpacity onPress={togglePlay} style={styles.iconBtn} activeOpacity={0.7}>
              {isPlaying ? (
                <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => seekBy(-10)} style={styles.seekBtn} activeOpacity={0.7}>
              <RotateCcw size={13} color="#CBD5E1" />
              <Text style={styles.seekText}>10s</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => seekBy(10)} style={styles.seekBtn} activeOpacity={0.7}>
              <RotateCw size={13} color="#CBD5E1" />
              <Text style={styles.seekText}>10s</Text>
            </TouchableOpacity>
            <Text style={styles.timeLabel}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>

          <TouchableOpacity onPress={cycleSpeed} style={styles.speedPill} activeOpacity={0.75}>
            <Text style={styles.speedText}>{speed}x</Text>
          </TouchableOpacity>
        </View>
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
  wrapper: {
    backgroundColor: '#020617',
  },
  playerBox: {
    width: '100%',
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  fullTouchShield: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  centerPlayCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iccBadge: {
    position: 'absolute',
    top: 8,
    left: 10,
    zIndex: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  iccBadgeText: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  controlsContainer: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 8,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 30,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  seekText: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '700',
  },
  timeLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  speedPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  speedText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
  },
  qualityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B1120',
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
