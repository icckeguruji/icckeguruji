import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  requireNativeComponent,
  UIManager,
} from 'react-native';
import { Radio, RefreshCw, Mic, MicOff, Square, Video } from 'lucide-react-native';

interface NativeBroadcasterProps {
  style?: any;
  rtmpUrl: string;
  streaming: boolean;
  cameraFacing: 'front' | 'back';
  muted: boolean;
  onStreamStatus?: (event: { nativeEvent: { status: string; message: string } }) => void;
}

const NativeBroadcaster =
  Platform.OS === 'android' && UIManager.getViewManagerConfig('IccRtmpBroadcasterView')
    ? requireNativeComponent<NativeBroadcasterProps>('IccRtmpBroadcasterView')
    : null;

interface InAppRtmpBroadcasterProps {
  rtmpUrl: string;
  onLiveStarted?: () => void;
  onLiveStopped?: () => void;
}

export function InAppRtmpBroadcaster({
  rtmpUrl,
  onLiveStarted,
  onLiveStopped,
}: InAppRtmpBroadcasterProps) {
  const [hasPermission, setHasPermission] = useState(Platform.OS !== 'android');
  const [streaming, setStreaming] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [muted, setMuted] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Camera Preview Ready');
  const [streamState, setStreamState] = useState<'idle' | 'connecting' | 'live' | 'failed'>('idle');

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ])
      .then((res) => {
        const camOk = res[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
        const micOk = res[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
        setHasPermission(camOk && micOk);
      })
      .catch(() => setHasPermission(false));
  }, []);

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.fallbackBox}>
        <Video size={28} color="#94A3B8" />
        <Text style={styles.fallbackText}>
          Direct Camera Live Broadcasting works inside the Android App.
        </Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.fallbackBox}>
        <Text style={styles.fallbackText}>Camera and Microphone permissions are required to Go Live.</Text>
        <TouchableOpacity
          style={styles.permBtn}
          onPress={() => {
            PermissionsAndroid.requestMultiple([
              PermissionsAndroid.PERMISSIONS.CAMERA,
              PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ]).then((res) => {
              const camOk = res[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
              const micOk = res[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
              setHasPermission(camOk && micOk);
            });
          }}
        >
          <Text style={styles.permBtnText}>Grant Camera & Mic Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraBox}>
        {NativeBroadcaster ? (
          <NativeBroadcaster
            style={StyleSheet.absoluteFill}
            rtmpUrl={rtmpUrl}
            streaming={streaming}
            cameraFacing={cameraFacing}
            muted={muted}
            onStreamStatus={(e) => {
              const st = e?.nativeEvent?.status;
              const msg = e?.nativeEvent?.message || '';
              setStatusMsg(msg);
              if (st === 'live') {
                setStreamState('live');
                onLiveStarted?.();
              } else if (st === 'connecting') {
                setStreamState('connecting');
              } else if (st === 'failed') {
                setStreamState('failed');
                setStreaming(false);
              } else if (st === 'stopped') {
                setStreamState('idle');
                setStreaming(false);
                onLiveStopped?.();
              }
            }}
          />
        ) : (
          <View style={styles.fallbackBox}>
            <Text style={styles.fallbackText}>Native camera broadcaster loads in the compiled Android APK.</Text>
          </View>
        )}

        <View style={styles.statusOverlay}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  streamState === 'live'
                    ? '#EF4444'
                    : streamState === 'connecting'
                    ? '#F59E0B'
                    : '#10B981',
              },
            ]}
          />
          <Text style={styles.statusOverlayText}>{statusMsg}</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => setCameraFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={styles.ctrlText}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, muted && { backgroundColor: '#B45309' }]}
          onPress={() => setMuted((prev) => !prev)}
        >
          {muted ? <MicOff size={16} color="#FFFFFF" /> : <Mic size={16} color="#FFFFFF" />}
          <Text style={styles.ctrlText}>{muted ? 'Muted' : 'Mic On'}</Text>
        </TouchableOpacity>

        {!streaming ? (
          <TouchableOpacity
            style={styles.goLiveBtn}
            onPress={() => {
              setStreamState('connecting');
              setStatusMsg('Starting Camera Live...');
              setStreaming(true);
            }}
          >
            <Radio size={16} color="#FFFFFF" />
            <Text style={styles.goLiveText}>Start Camera Live</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={() => {
              setStreaming(false);
              setStreamState('idle');
            }}
          >
            <Square size={15} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.goLiveText}>Stop Live</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cameraBox: {
    width: '100%',
    height: 240,
    backgroundColor: '#000000',
    position: 'relative',
  },
  statusOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#0F172A',
  },
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctrlText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  goLiveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 10,
  },
  stopBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
  },
  goLiveText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  fallbackBox: {
    flex: 1,
    minHeight: 140,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
  },
  fallbackText: {
    color: '#CBD5E1',
    fontSize: 12.5,
    textAlign: 'center',
  },
  permBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  permBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
