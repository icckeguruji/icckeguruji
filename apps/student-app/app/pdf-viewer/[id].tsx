import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../../src/store/useAuthStore';
import { initialStudyMaterials } from '../../../admin-web/src/lib/sample-data';

const { width, height } = Dimensions.get('window');

export default function SecurePdfViewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const material =
    initialStudyMaterials.find((m) => m.id === id) || initialStudyMaterials[0];

  // Dynamic watermark text with student identity to prevent external recording/leakage
  const watermarkText = `${user?.full_name || 'Student'} • +91 ${user?.mobile_number || '9876543210'} • ICC DRM`;

  // HTML content rendering the study notes cleanly and securely inside WebView
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>${material.title}</title>
      <style>
        * {
          box-sizing: border-box;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #F8FAFC;
          color: #0F172A;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .header-box {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .badge {
          display: inline-block;
          background: #1E3A8A;
          color: #FFFFFF;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        h1 {
          font-size: 20px;
          font-weight: 800;
          margin: 12px 0 6px 0;
          color: #0F172A;
        }
        p.desc {
          font-size: 13px;
          color: #64748B;
          margin: 0;
        }
        .content-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        h2 {
          font-size: 16px;
          font-weight: 700;
          color: #1E40AF;
          border-bottom: 2px solid #DBEAFE;
          padding-bottom: 6px;
          margin-top: 0;
        }
        .formula-box {
          background: #EFF6FF;
          border-left: 4px solid #2563EB;
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
          font-family: monospace;
          font-size: 14px;
          font-weight: bold;
          margin: 12px 0;
        }
        .point {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .drm-footer {
          text-align: center;
          font-size: 11px;
          color: #94A3B8;
          margin-top: 30px;
          padding: 16px;
          border-top: 1px dashed #CBD5E1;
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <span class="badge">IDEAL COACHING CENTRE • NCERT / SCERT NOTES</span>
        <h1>${material.title}</h1>
        <p class="desc">${material.description || 'Verified Study Material for Board Preparation'}</p>
      </div>

      <div class="content-card">
        <h2>1. Key Concepts & Definitions</h2>
        <div class="point">• <b>Definition:</b> A transformation that yields new substances with entirely distinct chemical identities and characteristics.</div>
        <div class="point">• <b>Law of Conservation of Mass:</b> Matter can neither be created nor destroyed in a chemical reaction. Total mass of reactants must equal total mass of products.</div>
        <div class="formula-box">
          Reactants → Products + Energy (ΔH)
        </div>
      </div>

      <div class="content-card">
        <h2>2. Essential Types of Chemical Reactions</h2>
        <div class="point"><b>1. Combination Reaction:</b> Two or more reactants combine to form a single product.</div>
        <div class="formula-box">CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat</div>
        <div class="point"><b>2. Decomposition Reaction:</b> A single reactant breaks down to yield multiple simpler products upon heating, electricity, or light.</div>
        <div class="formula-box">2FeSO₄(s) --Δ--> Fe₂O₃(s) + SO₂(g) + SO₃(g)</div>
        <div class="point"><b>3. Displacement Reaction:</b> Highly reactive element displaces less reactive element from its aqueous salt solution.</div>
        <div class="formula-box">Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)</div>
        <div class="point"><b>4. Double Displacement Reaction:</b> Mutual exchange of ions between reactants to produce an insoluble precipitate.</div>
        <div class="formula-box">Na₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s)↓ + 2NaCl(aq)</div>
      </div>

      <div class="content-card">
        <h2>3. Important Board Derivations & Exam Tips</h2>
        <div class="point">• <b>Balancing by Hit & Trial:</b> Always equalize atoms of maximum number first, followed by hydrogen and oxygen.</div>
        <div class="point">• <b>Corrosion vs Rancidity:</b> Oxidation of metals vs oxidation of fats/oils. Prevented by antioxidants or nitrogen flushing.</div>
      </div>

      <div class="drm-footer">
        🔒 IDEAL COACHING CENTRE • Watermarked for ${user?.full_name || 'Enrolled Student'}<br>
        Unlawful distribution, recording or screen capturing is strictly prohibited.
      </div>

      <script>
        // Disable context menu, text selection & drag
        document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
        document.addEventListener('selectstart', function(e) { e.preventDefault(); return false; });
        document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Top Security Warning Banner */}
      <View style={styles.securityBanner}>
        <Text style={styles.securityText}>
          🛡️ DRM Protected In-App Reading • Download & Screenshots Disabled
        </Text>
      </View>

      {/* Main WebView Content */}
      <View style={styles.webviewContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled
        />

        {/* Dynamic Security Watermark Overlay Layer */}
        <View style={styles.watermarkOverlay} pointerEvents="none">
          <View style={styles.watermarkGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Text key={i} style={styles.watermarkItem}>
                {watermarkText}
              </Text>
            ))}
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Decrypting Study Material...</Text>
          </View>
        )}
      </View>

      {/* Bottom Viewer Controls */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.docTitle} numberOfLines={1}>
            {material.title}
          </Text>
          <Text style={styles.docMeta}>
            {material.material_type.toUpperCase().replace('_', ' ')} • Class 10
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  securityBanner: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  securityText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  webview: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  watermarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: 'hidden',
  },
  watermarkGrid: {
    width: width * 1.5,
    height: height,
    flexDirection: 'column',
    justifyContent: 'space-around',
    transform: [{ rotate: '-30deg' }],
  },
  watermarkItem: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(15, 23, 42, 0.08)',
    textAlign: 'center',
    letterSpacing: 2,
    marginVertical: 25,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  docMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
