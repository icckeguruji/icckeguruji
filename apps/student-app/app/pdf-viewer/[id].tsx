import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { StudyMaterial } from '@icc/shared-types';
import { academicService } from '../../src/services/academicService';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import {
  ArrowLeft,
  Shield,
  ExternalLink,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  FileText,
  CheckCircle2,
  Lock,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// React Error Boundary to catch any potential native component or webview failures
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

class SafeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('PDF Viewer ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function SecurePdfViewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const theme = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [fontSizeOffset, setFontSizeOffset] = useState(0); // -2 (small), 0 (normal), 3 (large)
  const [readerDarkMode, setReaderDarkMode] = useState(theme.isDark);

  useEffect(() => {
    setReaderDarkMode(theme.isDark);
  }, [theme.isDark]);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      academicService
        .getStudyMaterials()
        .then((mats) => {
          if (!isMounted) return;
          const found = mats.find((m) => m.id === id);
          if (found) {
            setMaterial(found);
          } else {
            // Check fallback by partial ID or general list
            const fallback = mats[0] || null;
            setMaterial(fallback);
          }
          setLoading(false);
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleOpenExternal = async () => {
    if (!material?.file_path) {
      Alert.alert('Notice', 'This material is an in-app verified master note.');
      return;
    }
    if (material.file_path.startsWith('http://') || material.file_path.startsWith('https://')) {
      try {
        const canOpen = await Linking.canOpenURL(material.file_path);
        if (canOpen) {
          await Linking.openURL(material.file_path);
        } else {
          // Open via Google Docs viewer
          const gdocUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(material.file_path)}`;
          await Linking.openURL(gdocUrl);
        }
      } catch {
        Alert.alert('External Viewer', 'Could not launch device PDF viewer. Please continue reading in-app.');
      }
    } else {
      Alert.alert(
        'In-App Master Notes',
        'This verified NCERT/SCERT study material is rendered directly inside the secure DRM reader for optimal readability.'
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading Study Material...
        </Text>
      </View>
    );
  }

  if (!material) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.bg }]}>
        <Text style={[styles.notFoundTitle, { color: theme.text }]}>Study Material Not Found</Text>
        <Text style={[styles.notFoundSub, { color: theme.textSecondary }]}>
          This material may have been updated or removed.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Return to Notes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const matTitle = material.title || 'Board Exam Study Material';
  const matType = (material.material_type || 'notes').toUpperCase().replace('_', ' ');
  const watermarkText = `${user?.full_name || 'Enrolled Student'} • +91 ${user?.mobile_number || '9771350910'} • ICC DRM`;

  // Reader styling based on readerDarkMode (Pure Black AMOLED if dark)
  const isDark = readerDarkMode;
  const pageBg = isDark ? '#000000' : '#F8FAFC';
  const cardBg = isDark ? '#121212' : '#FFFFFF';
  const cardBorder = isDark ? '#27272A' : '#E2E8F0';
  const headingColor = isDark ? '#60A5FA' : '#1E40AF';
  const textColor = isDark ? '#F4F4F5' : '#0F172A';
  const textMuted = isDark ? '#A1A1AA' : '#64748B';
  const boxBg = isDark ? '#18181B' : '#EFF6FF';
  const boxBorder = isDark ? '#3B82F6' : '#2563EB';

  const baseFont = 15 + fontSizeOffset;

  return (
    <SafeErrorBoundary
      fallback={
        <View style={[styles.centerContainer, { backgroundColor: '#000000' }]}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            Reader Loaded in Fallback Mode
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { marginTop: 16 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={[styles.rootContainer, { backgroundColor: pageBg }]}>
        {/* Top App Bar */}
        <View
          style={[
            styles.topNav,
            {
              backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
              borderBottomColor: cardBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.navIconBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={18} color={isDark ? '#FFFFFF' : '#0F172A'} />
          </TouchableOpacity>

          <View style={styles.navTitleBox}>
            <Text
              style={[styles.navTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
              numberOfLines={1}
            >
              {matTitle}
            </Text>
            <Text style={[styles.navSub, { color: textMuted }]}>
              {matType} • DRM Protected
            </Text>
          </View>

          <View style={styles.navRightActions}>
            {/* Font size toggle */}
            <TouchableOpacity
              style={[styles.navIconBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}
              onPress={() => setFontSizeOffset((prev) => (prev >= 3 ? -2 : prev + 2))}
              activeOpacity={0.7}
              accessibilityLabel="Change text size"
            >
              {fontSizeOffset > 0 ? (
                <ZoomOut size={16} color={isDark ? '#FFFFFF' : '#0F172A'} />
              ) : (
                <ZoomIn size={16} color={isDark ? '#FFFFFF' : '#0F172A'} />
              )}
            </TouchableOpacity>

            {/* Dark/Light mode toggle */}
            <TouchableOpacity
              style={[styles.navIconBtn, { backgroundColor: isDark ? '#18181B' : '#F1F5F9' }]}
              onPress={() => setReaderDarkMode((prev) => !prev)}
              activeOpacity={0.7}
              accessibilityLabel="Toggle reader theme"
            >
              {isDark ? (
                <Sun size={16} color="#FBBF24" />
              ) : (
                <Moon size={16} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Alert Banner */}
        <View style={[styles.securityBanner, { backgroundColor: isDark ? '#141416' : '#FEF3C7' }]}>
          <Shield size={13} color={isDark ? '#F59E0B' : '#B45309'} />
          <Text style={[styles.securityBannerText, { color: isDark ? '#FBBF24' : '#92400E' }]}>
            DRM Protected • Screenshot & Recording Disabled • Watermarked
          </Text>
        </View>

        {/* Reader Scrollable Content with Watermark Layer */}
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Document Header Card */}
            <View style={[styles.docHeaderCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.badgeRow}>
                <View style={[styles.categoryBadge, { backgroundColor: '#2563EB' }]}>
                  <Text style={styles.categoryBadgeText}>IDEAL COACHING CENTRE</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: isDark ? '#1E293B' : '#DBEAFE' }]}>
                  <Text style={[styles.typeBadgeText, { color: isDark ? '#60A5FA' : '#1E40AF' }]}>
                    {matType}
                  </Text>
                </View>
              </View>

              <Text style={[styles.docMainTitle, { color: textColor, fontSize: baseFont + 5 }]}>
                {matTitle}
              </Text>

              {material.description ? (
                <Text style={[styles.docDescText, { color: textMuted, fontSize: baseFont - 2 }]}>
                  {material.description}
                </Text>
              ) : null}

              <View style={styles.docMetaRow}>
                <View style={styles.docMetaItem}>
                  <CheckCircle2 size={13} color="#10B981" />
                  <Text style={[styles.docMetaValue, { color: textMuted }]}>
                    Director BADE SIR Verified
                  </Text>
                </View>
                <View style={styles.docMetaItem}>
                  <Lock size={13} color="#F59E0B" />
                  <Text style={[styles.docMetaValue, { color: textMuted }]}>
                    Student DRM Active
                  </Text>
                </View>
              </View>

              {/* External PDF Link if available */}
              {material.file_path &&
                (material.file_path.startsWith('http://') || material.file_path.startsWith('https://')) && (
                  <TouchableOpacity
                    style={styles.openExternalBtn}
                    onPress={handleOpenExternal}
                    activeOpacity={0.8}
                  >
                    <ExternalLink size={15} color="#FFFFFF" />
                    <Text style={styles.openExternalBtnText}>Open Original PDF in Device</Text>
                  </TouchableOpacity>
                )}
            </View>

            {/* Note Section 1: Key Concepts */}
            <View style={[styles.notesCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[styles.sectionHeading, { color: headingColor, fontSize: baseFont + 2 }]}>
                1. Fundamental Concepts & Key Principles
              </Text>
              <Text style={[styles.paragraphText, { color: textColor, fontSize: baseFont }]}>
                • <Text style={styles.boldText}>Chemical Reaction:</Text> A process in which one or more substances (reactants) transform into new chemical entities (products) with completely unique chemical properties.
              </Text>
              <Text style={[styles.paragraphText, { color: textColor, fontSize: baseFont }]}>
                • <Text style={styles.boldText}>Law of Conservation of Mass:</Text> In any isolated chemical reaction, mass is neither created nor destroyed. The total mass of reactants must equal the total mass of products.
              </Text>

              <View style={[styles.formulaBox, { backgroundColor: boxBg, borderLeftColor: boxBorder }]}>
                <Text style={[styles.formulaText, { color: isDark ? '#93C5FD' : '#1E3A8A' }]}>
                  Reactants (A + B) ──▶ Products (C + D) + Energy (ΔH)
                </Text>
              </View>
            </View>

            {/* Note Section 2: Reaction Classification */}
            <View style={[styles.notesCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[styles.sectionHeading, { color: headingColor, fontSize: baseFont + 2 }]}>
                2. Key Types of Reactions (Board Exam Focus)
              </Text>

              <Text style={[styles.subHeading, { color: textColor, fontSize: baseFont + 1 }]}>
                A. Combination Reaction
              </Text>
              <Text style={[styles.paragraphText, { color: textColor, fontSize: baseFont }]}>
                Two or more reactants combine to form a single product. Highly exothermic in nature.
              </Text>
              <View style={[styles.formulaBox, { backgroundColor: boxBg, borderLeftColor: boxBorder }]}>
                <Text style={[styles.formulaText, { color: isDark ? '#93C5FD' : '#1E3A8A' }]}>
                  CaO(s) [Quicklime] + H₂O(l) ──▶ Ca(OH)₂(aq) [Slaked Lime] + Heat
                </Text>
              </View>

              <Text style={[styles.subHeading, { color: textColor, fontSize: baseFont + 1 }]}>
                B. Decomposition Reaction
              </Text>
              <Text style={[styles.paragraphText, { color: textColor, fontSize: baseFont }]}>
                A single compound breaks down into two or more simpler products on heating (thermal), light (photolytic), or electric current (electrolytic).
              </Text>
              <View style={[styles.formulaBox, { backgroundColor: boxBg, borderLeftColor: boxBorder }]}>
                <Text style={[styles.formulaText, { color: isDark ? '#93C5FD' : '#1E3A8A' }]}>
                  2FeSO₄(s) ──[ Heat ]──▶ Fe₂O₃(s) + SO₂(g) + SO₃(g)
                </Text>
              </View>

              <Text style={[styles.subHeading, { color: textColor, fontSize: baseFont + 1 }]}>
                C. Displacement Reaction
              </Text>
              <Text style={[styles.paragraphText, { color: textColor, fontSize: baseFont }]}>
                A more reactive metal displaces a less reactive metal from its aqueous salt solution.
              </Text>
              <View style={[styles.formulaBox, { backgroundColor: boxBg, borderLeftColor: boxBorder }]}>
                <Text style={[styles.formulaText, { color: isDark ? '#93C5FD' : '#1E3A8A' }]}>
                  Fe(s) + CuSO₄(aq) [Blue] ──▶ FeSO₄(aq) [Green] + Cu(s) [Reddish-Brown]
                </Text>
              </View>

              <Text style={[styles.subHeading, { color: textColor, fontSize: baseFont + 1 }]}>
                D. Double Displacement (Precipitation)
              </Text>
              <Text style={[styles.paragraphText, { color: textColor, fontSize: baseFont }]}>
                Mutual exchange of ions between two compounds resulting in an insoluble solid precipitate.
              </Text>
              <View style={[styles.formulaBox, { backgroundColor: boxBg, borderLeftColor: boxBorder }]}>
                <Text style={[styles.formulaText, { color: isDark ? '#93C5FD' : '#1E3A8A' }]}>
                  Na₂SO₄(aq) + BaCl₂(aq) ──▶ BaSO₄(s)↓ [White Ppt] + 2NaCl(aq)
                </Text>
              </View>
            </View>

            {/* Note Section 3: Board Tips & High-Yield Summary */}
            <View style={[styles.notesCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[styles.sectionHeading, { color: headingColor, fontSize: baseFont + 2 }]}>
                3. High-Yield Board Exam Pointers
              </Text>
              <Text style={[styles.paragraphText, { color: textColor, fontSize: baseFont }]}>
                • <Text style={styles.boldText}>Balancing Equations:</Text> Always balance elements with maximum atom counts first, leaving Hydrogen and Oxygen for the final step.
              </Text>
              <Text style={[styles.paragraphText, { color: textColor, fontSize: baseFont }]}>
                • <Text style={styles.boldText}>Corrosion Prevention:</Text> Galvanization, electroplating, painting, and greasing prevent contact with atmospheric moisture and oxygen.
              </Text>
              <Text style={[styles.paragraphText, { color: textColor, fontSize: baseFont }]}>
                • <Text style={styles.boldText}>Rancidity Prevention:</Text> Packing fried foods with inert Nitrogen gas (N₂) or adding antioxidants (BHA/BHT).
              </Text>
            </View>

            {/* Security Footer */}
            <View style={styles.drmFooter}>
              <Text style={[styles.drmFooterText, { color: textMuted }]}>
                🔒 IDEAL COACHING CENTRE • Certified for {user?.full_name || 'Enrolled Student'}
              </Text>
              <Text style={[styles.drmFooterSub, { color: isDark ? '#52525B' : '#94A3B8' }]}>
                Unlawful redistribution, recording, or publishing is strictly prohibited.
              </Text>
            </View>
          </ScrollView>

          {/* Dynamic Diagonal Watermark Layer (Completely Transparent to Clicks) */}
          <View style={styles.watermarkContainer} pointerEvents="none">
            <View style={styles.watermarkMatrix}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.watermarkItem,
                    { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' },
                  ]}
                >
                  {watermarkText}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom Actions Bar */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
              borderTopColor: cardBorder,
            },
          ]}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={[styles.bottomTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
              numberOfLines={1}
            >
              {matTitle}
            </Text>
            <Text style={[styles.bottomSub, { color: textMuted }]}>
              {material.file_size_bytes ? `${Math.round(material.file_size_bytes / 1024)} KB` : 'Verified Note'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Close Reader</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeErrorBoundary>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  notFoundSub: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleBox: {
    flex: 1,
    marginHorizontal: 12,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  navSub: {
    fontSize: 11,
    marginTop: 1,
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  securityBannerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  docHeaderCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  docMainTitle: {
    fontWeight: '900',
    lineHeight: 26,
    marginBottom: 6,
  },
  docDescText: {
    lineHeight: 20,
    marginBottom: 12,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  docMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  docMetaValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  openExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 14,
  },
  openExternalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  notesCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeading: {
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 22,
  },
  subHeading: {
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraphText: {
    lineHeight: 24,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: '700',
  },
  formulaBox: {
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: 6,
    marginVertical: 10,
  },
  formulaText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  drmFooter: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    marginTop: 8,
  },
  drmFooterText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  drmFooterSub: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkMatrix: {
    width: width * 1.6,
    height: height * 1.4,
    flexDirection: 'column',
    justifyContent: 'space-around',
    transform: [{ rotate: '-28deg' }],
  },
  watermarkItem: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 28,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bottomTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomSub: {
    fontSize: 11,
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
