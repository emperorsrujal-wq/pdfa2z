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
  geoDistribution: Record<string, number>; // counts per country code
  lastUpdatedAt: any;
}

const STATS_COLLECTION = 'journey_stats';

/**
 * Tracks a journey event (view, start, complete, step_complete)
 */
export async function trackJourneyEvent(
  journeyId: string, 
  event: 'view' | 'start' | 'complete' | 'step_complete',
  metadata?: { stepId?: string; duration?: number }
) {
  const countryCode = (navigator.language || 'US').split('-')[1] || 'US';
  if (DEMO_MODE) {
    const statsKey = `jb_stats_${journeyId}`;
    const stats = JSON.parse(localStorage.getItem(statsKey) || '{"viewCount":0, "startCount":0, "completeCount":0, "totalCompletionTime":0, "stepCompletions":{}, "geoDistribution":{}}');
    
    if (event === 'view') stats.viewCount++;
    if (event === 'start') stats.startCount++;
    if (event === 'complete') {
      stats.completeCount++;
      if (metadata?.duration) stats.totalCompletionTime += metadata.duration;
      stats.geoDistribution[countryCode] = (stats.geoDistribution[countryCode] || 0) + 1;
    }
    if (event === 'step_complete' && metadata?.stepId) {
      stats.stepCompletions[metadata.stepId] = (stats.stepCompletions[metadata.stepId] || 0) + 1;
    }
    
    localStorage.setItem(statsKey, JSON.stringify(stats));
    return;
  }

  const statRef = doc(db, STATS_COLLECTION, journeyId);
  const snap = await getDoc(statRef);

  const fieldMap: Record<string, string> = {
    view: 'viewCount',
    start: 'startCount',
    complete: 'completeCount',
    step_complete: 'stepCompletions'
  };

  const field = fieldMap[event];

  if (!snap.exists()) {
    await setDoc(statRef, {
      viewCount: event === 'view' ? 1 : 0,
      startCount: event === 'start' ? 1 : 0,
      completeCount: event === 'complete' ? 1 : 0,
      lastUpdatedAt: serverTimestamp()
    });
  } else {
    await updateDoc(statRef, {
      [field]: increment(1),
      lastUpdatedAt: serverTimestamp()
    });
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
