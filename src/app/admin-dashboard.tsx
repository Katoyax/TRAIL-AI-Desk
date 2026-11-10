
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Brand } from '../constants/brand';
import { apiRequest } from '../services/api';
import { signOut, useSession } from '../services/auth';

type SourceListResponse = {
  items: unknown[];
};

type OverviewState = {
  token: string;
  sourceCount: number | null;
  error: string;
};

export default function AdminDashboardScreen() {
  const session = useSession();

  // Extract stable values for the effect dependencies.
  const token = session?.token;
  const role = session?.user.role;
  const isDemo = session?.demo;

  const [overview, setOverview] = useState<OverviewState | null>(
    null
  );

  useEffect(() => {
    // Only fetch data for a real Admin session.
    if (!token || isDemo || role !== 'admin') {
      return;
    }

    // Capture the validated token as a definite string.
    const currentToken: string = token;
    let cancelled = false;

    async function loadOverview() {
      try {
        const result = await apiRequest<SourceListResponse>(
          '/api/admin/sources',
          { token: currentToken }
        );

        if (!cancelled) {
          setOverview({
            token: currentToken,
            sourceCount: Array.isArray(result.items)
              ? result.items.length
              : null,
            error: Array.isArray(result.items)
              ? ''
              : 'The knowledge-source response is invalid.',
          });
        }
      } catch {
        if (!cancelled) {
          setOverview({
            token: currentToken,
            sourceCount: null,
            error: 'Unable to load knowledge-base statistics.',
          });
        }
      }
    }

    void loadOverview();

    // Prevent a stale request from updating the component.
    return () => {
      cancelled = true;
    };
  }, [token, role, isDemo]);

  // Only use overview results belonging to the current session.
  const currentOverview =
    overview?.token === token ? overview : null;

  // Derive loading status without synchronous setState in the effect.
  const loading =
    Boolean(token) &&
    !isDemo &&
    role === 'admin' &&
    currentOverview === null;

  const sourceCount = currentOverview?.sourceCount ?? null;
  const error = currentOverview?.error ?? '';

  const handleLogout = () => {
    signOut();
    router.replace('/staff-login');
  };

  // Frontend route guard. Backend requireAdmin remains essential.
  if (!session || session.demo || session.user.role !== 'admin') {
    return null;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.brand}>
            TRAIL AI Desk
          </Text>
          <Text style={styles.headerSubtitle}>
            Administrator Workspace
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>
            Sign out
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>
          ADMINISTRATION
        </Text>

        <Text style={styles.title}>
          Admin Dashboard
        </Text>

        <Text style={styles.subtitle}>
          Welcome, {session.user.name}. Manage TRAIL AI Desk
          administration and system operations.
        </Text>

        <Text style={styles.sectionTitle}>
          System overview
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Knowledge sources
            </Text>

            {loading ? (
              <ActivityIndicator color={Brand.blue} />
            ) : (
              <Text style={styles.statValue}>
                {sourceCount ?? '—'}
              </Text>
            )}

            <Text style={styles.statDescription}>
              Sources currently returned by the knowledge catalog
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Current account
            </Text>

            <Text style={styles.accountRole}>
              Administrator
            </Text>

            <Text style={styles.statDescription}>
              {session.user.email}
            </Text>
          </View>
        </View>

        {error !== '' && (
          <Text
            style={styles.error}
            accessibilityRole="alert"
          >
            {error}
          </Text>
        )}

        <Text style={styles.sectionTitle}>
          Administrative modules
        </Text>

        <View style={styles.moduleGrid}>
          <View style={styles.moduleCard}>
            <Text style={styles.moduleTitle}>
              User Management
            </Text>

            <Text style={styles.moduleDescription}>
              View and manage approved student and staff accounts.
              Account-management endpoints are not implemented yet.
            </Text>

            <Text style={styles.comingSoon}>
              Backend integration pending
            </Text>
          </View>

          <View style={styles.moduleCard}>
            <Text style={styles.moduleTitle}>
              Knowledge Management
            </Text>

            <Text style={styles.moduleDescription}>
              Open the existing knowledge-source workspace.
              Manager-specific permissions will be separated in
              the upcoming RBAC implementation.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              disabled
              onPress={() => router.push('/admin')}
              style={[styles.moduleButton, styles.moduleButtonDisabled]}
            >
              <Text style={styles.moduleButtonText}>
                Open existing workspace
              </Text>
            </Pressable>
          </View>

          <View style={styles.moduleCard}>
            <Text style={styles.moduleTitle}>
              Administrative Activity
            </Text>

            <Text style={styles.moduleDescription}>
              Review account and administrative activity once
              verified audit records are available.
            </Text>

            <Text style={styles.comingSoon}>
              Audit integration pending
            </Text>
          </View>

          <View style={styles.moduleCard}>
            <Text style={styles.moduleTitle}>
              System Settings
            </Text>

            <Text style={styles.moduleDescription}>
              System administration and configuration controls
              will be implemented in a future milestone.
            </Text>

            <Text style={styles.comingSoon}>
              Future module
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.canvas,
  },

  header: {
    backgroundColor: Brand.navy,
    paddingHorizontal: 28,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  headerCopy: {
    flexShrink: 1,
  },

  brand: {
    color: Brand.surface,
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: Brand.onNavy,
    fontSize: 12,
    marginTop: 4,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: Brand.onNavy,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  logoutText: {
    color: Brand.surface,
    fontWeight: '700',
  },

  content: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 64,
  },

  eyebrow: {
    color: Brand.blue,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginTop: 12,
    marginBottom: 10,
  },

  title: {
    color: Brand.navy,
    fontSize: 32,
    fontWeight: '800',
  },

  subtitle: {
    color: Brand.muted,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 22,
  },

  sectionTitle: {
    color: Brand.navy,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  statCard: {
    backgroundColor: Brand.surface,
    borderColor: Brand.line,
    borderWidth: 1,
    borderRadius: 14,
    padding: 22,
    flexGrow: 1,
    flexBasis: 240,
    minWidth: 0,
  },

  statLabel: {
    fontSize: 14,
    color: Brand.muted,
    fontWeight: '600',
  },

  statValue: {
    fontSize: 36,
    color: Brand.navy,
    fontWeight: '800',
    marginTop: 10,
  },

  accountRole: {
    fontSize: 24,
    color: Brand.navy,
    fontWeight: '800',
    marginTop: 14,
  },

  statDescription: {
    color: Brand.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
  },

  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  moduleCard: {
    flexGrow: 1,
    flexBasis: 320,
    minWidth: 0,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: 14,
    padding: 22,
  },

  moduleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.navy,
    marginBottom: 10,
  },

  moduleDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: Brand.muted,
    marginBottom: 16,
  },

  comingSoon: {
    color: Brand.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  moduleButton: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.navy,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },

  moduleButtonDisabled: {
    opacity: 0.5,
  },

  moduleButtonText: {
    color: Brand.surface,
    fontSize: 14,
    fontWeight: '700',
  },

  error: {
    color: Brand.error,
    marginTop: 12,
  },
});
