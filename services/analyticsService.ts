import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, DEMO_MODE } from '../config/firebase';

export interface JourneyStats {
  viewCount: number;
  startCount: number;
  completeCount: number;
  totalCompletionTime: number; // Total seconds for all completions
  stepCompletions: Record<string, number>; // counts per stepId
  stepTimes: Record<string, number>; // total duration per stepId
  fieldErrors: Record<string, number>; // total errors per fieldId/stepId
  geoDistribution: Record<string, number>; // counts per country code
  variantStats?: Record<string, { views: number; starts: number; completes: number }>; // A/B test variant tracking
  lastUpdatedAt: any;
}

const STATS_COLLECTION = 'journey_stats';

/**
 * Tracks a journey event (view, start, complete, step_complete, field_error)
 */
export async function trackJourneyEvent(
  journeyId: string, 
  event: 'view' | 'start' | 'complete' | 'step_complete' | 'field_error',
  metadata?: { stepId?: string; duration?: number; fieldId?: string; variant?: string }
) {
  const countryCode = (navigator.language || 'US').split('-')[1] || 'US';
  const variant = metadata?.variant || 'v1';

  if (DEMO_MODE) {
    const statsKey = `jb_stats_${journeyId}`;
    const statsStr = localStorage.getItem(statsKey);
    const stats: JourneyStats = statsStr ? JSON.parse(statsStr) : {
      viewCount: 0,
      startCount: 0,
      completeCount: 0,
      totalCompletionTime: 0,
      stepCompletions: {},
      stepTimes: {},
      fieldErrors: {},
      geoDistribution: {},
      variantStats: { v1: { views: 0, starts: 0, completes: 0 }, v2: { views: 0, starts: 0, completes: 0 } }
    };
    
    // Ensure nested objects exist
    if (!stats.stepTimes) stats.stepTimes = {};
    if (!stats.fieldErrors) stats.fieldErrors = {};
    if (!stats.variantStats) stats.variantStats = { v1: { views: 0, starts: 0, completes: 0 }, v2: { views: 0, starts: 0, completes: 0 } };
    if (!stats.variantStats[variant]) stats.variantStats[variant] = { views: 0, starts: 0, completes: 0 };

    if (event === 'view') {
      stats.viewCount++;
      stats.variantStats[variant].views++;
    }
    if (event === 'start') {
      stats.startCount++;
      stats.variantStats[variant].starts++;
    }
    if (event === 'complete') {
      stats.completeCount++;
      stats.variantStats[variant].completes++;
      if (metadata?.duration) stats.totalCompletionTime += metadata.duration;
      stats.geoDistribution[countryCode] = (stats.geoDistribution[countryCode] || 0) + 1;
    }
    if (event === 'step_complete' && metadata?.stepId) {
      stats.stepCompletions[metadata.stepId] = (stats.stepCompletions[metadata.stepId] || 0) + 1;
      if (metadata.duration) {
        stats.stepTimes[metadata.stepId] = (stats.stepTimes[metadata.stepId] || 0) + metadata.duration;
      }
    }
    if (event === 'field_error' && metadata?.fieldId) {
      stats.fieldErrors[metadata.fieldId] = (stats.fieldErrors[metadata.fieldId] || 0) + 1;
    }
    
    localStorage.setItem(statsKey, JSON.stringify(stats));
    return;
  }

  // Firestore path
  const statRef = doc(db, STATS_COLLECTION, journeyId);
  const snap = await getDoc(statRef);

  const updates: any = {
    lastUpdatedAt: serverTimestamp()
  };

  if (event === 'view') {
    updates.viewCount = increment(1);
    updates[`variantStats.${variant}.views`] = increment(1);
  } else if (event === 'start') {
    updates.startCount = increment(1);
    updates[`variantStats.${variant}.starts`] = increment(1);
  } else if (event === 'complete') {
    updates.completeCount = increment(1);
    updates[`variantStats.${variant}.completes`] = increment(1);
    if (metadata?.duration) updates.totalCompletionTime = increment(metadata.duration);
    updates[`geoDistribution.${countryCode}`] = increment(1);
  } else if (event === 'step_complete' && metadata?.stepId) {
    updates[`stepCompletions.${metadata.stepId}`] = increment(1);
    if (metadata.duration) updates[`stepTimes.${metadata.stepId}`] = increment(metadata.duration);
  } else if (event === 'field_error' && metadata?.fieldId) {
    updates[`fieldErrors.${metadata.fieldId}`] = increment(1);
  }

  if (!snap.exists()) {
    // Initial creation
    const initialStats: any = {
      viewCount: event === 'view' ? 1 : 0,
      startCount: event === 'start' ? 1 : 0,
      completeCount: event === 'complete' ? 1 : 0,
      totalCompletionTime: (event === 'complete' && metadata?.duration) ? metadata.duration : 0,
      stepCompletions: (event === 'step_complete' && metadata?.stepId) ? { [metadata.stepId]: 1 } : {},
      stepTimes: (event === 'step_complete' && metadata?.stepId && metadata.duration) ? { [metadata.stepId]: metadata.duration } : {},
      fieldErrors: (event === 'field_error' && metadata?.fieldId) ? { [metadata.fieldId]: 1 } : {},
      geoDistribution: (event === 'complete') ? { [countryCode]: 1 } : {},
      variantStats: {
        v1: { views: (variant === 'v1' && event === 'view') ? 1 : 0, starts: (variant === 'v1' && event === 'start') ? 1 : 0, completes: (variant === 'v1' && event === 'complete') ? 1 : 0 },
        v2: { views: (variant === 'v2' && event === 'view') ? 1 : 0, starts: (variant === 'v2' && event === 'start') ? 1 : 0, completes: (variant === 'v2' && event === 'complete') ? 1 : 0 }
      },
      lastUpdatedAt: serverTimestamp()
    };
    await setDoc(statRef, initialStats);
  } else {
    await updateDoc(statRef, updates);
  }
}

/**
 * Retrieves aggregate stats for a journey
 */
export async function getJourneyStats(journeyId: string): Promise<JourneyStats> {
  if (DEMO_MODE) {
    const statsKey = `jb_stats_${journeyId}`;
    return JSON.parse(localStorage.getItem(statsKey) || '{"viewCount":0, "startCount":0, "completeCount":0, "lastUpdatedAt": null}');
  }

  const statRef = doc(db, STATS_COLLECTION, journeyId);
  const snap = await getDoc(statRef);

  if (!snap.exists()) {
    return {
      viewCount: 0,
      startCount: 0,
      completeCount: 0,
      totalCompletionTime: 0,
      stepCompletions: {},
      stepTimes: {},
      fieldErrors: {},
      geoDistribution: {},
      lastUpdatedAt: null
    };
  }

  return snap.data() as JourneyStats;
}

/**
 * Calculates average completion time in seconds
 */
export function getAverageCompletionTime(stats: JourneyStats): number {
  if (!stats.completeCount || !stats.totalCompletionTime) return 0;
  return Math.round(stats.totalCompletionTime / stats.completeCount);
}
