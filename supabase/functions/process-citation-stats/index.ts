import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CitationData {
  id: number;
  query: string;
  domain: string;
  is_cited: boolean;
  ai_answer: string;
  cited_sources: any[];
  recommendations: string;
  checked_at: string;
  user_id: string;
}

interface ChartData {
  date: string;
  citations: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface CitationStats {
  totalCitations: number;
  weeklyGrowth: number;
  googleSGE: number;
  bingChat: number;
  voice: number;
  topQueries: Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  recentCitations: CitationData[];
  level: number;
  points: number;
  streak: number;
  achievements: Achievement[];
  citationTrend: ChartData[];
}

const calculateStreak = (data: CitationData[]): number => {
    // Simple streak calculation - consecutive days with citations
    const days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });

    let streak = 0;
    for (const day of days) {
      const hasActivity = data.some(item => 
        new Date(item.checked_at).toDateString() === day
      );
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getAchievements = (citations: number, streak: number, level: number): Achievement[] => {
    const allAchievements: Achievement[] = [
      {
        id: 'first_citation',
        title: 'First Citation',
        description: 'Get your first AI citation',
        icon: '🎯',
        unlocked: citations >= 1,
        progress: Math.min(citations, 1),
        maxProgress: 1
      },
      {
        id: 'citation_master',
        title: 'Citation Master',
        description: 'Reach 10 citations',
        icon: '👑',
        unlocked: citations >= 10,
        progress: Math.min(citations, 10),
        maxProgress: 10
      },
      {
        id: 'streak_warrior',
        title: 'Streak Warrior',
        description: 'Maintain a 7-day activity streak',
        icon: '🔥',
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        maxProgress: 7
      },
      {
        id: 'level_up',
        title: 'Level Up',
        description: 'Reach level 5',
        icon: '⭐',
        unlocked: level >= 5,
        progress: Math.min(level, 5),
        maxProgress: 5
      }
    ];

    return allAchievements;
  };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json();
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseAdmin
        .from('citation_checks')
        .select('*')
        .eq('user_id', user_id)
        .gte('checked_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('checked_at', { ascending: false });

    if (error) throw error;

    const cited = data.filter(item => item.is_cited);
    const thisWeek = data.filter(item => 
      new Date(item.checked_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const lastWeek = data.filter(item => {
      const date = new Date(item.checked_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return date <= weekAgo && date > twoWeeksAgo;
    });

    const thisWeekCited = thisWeek.filter(item => item.is_cited).length;
    const lastWeekCited = lastWeek.filter(item => item.is_cited).length;
    const weeklyGrowth = lastWeekCited > 0 ? ((thisWeekCited - lastWeekCited) / lastWeekCited) * 100 : thisWeekCited > 0 ? 100 : 0;

    const queryStats = cited.reduce((acc, item) => {
      acc[item.query] = (acc[item.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topQueries = Object.entries(queryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([query, count]) => ({
        query,
        count,
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
      }));

    const trendData: ChartData[] = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const citationsOnDate = data.filter(item => 
        new Date(item.checked_at).toDateString() === date.toDateString() && item.is_cited
      ).length;
      return { date: dateString, citations: citationsOnDate };
    });

    const totalCitations = cited.length;
    const points = totalCitations * 10 + thisWeekCited * 5;
    const level = Math.floor(points / 100) + 1;
    const streak = calculateStreak(data);
    const achievements = getAchievements(totalCitations, streak, level);

    const stats: CitationStats = {
      totalCitations,
      weeklyGrowth,
      googleSGE: Math.floor(cited.length * 0.7),
      bingChat: Math.floor(cited.length * 0.2),
      voice: Math.floor(cited.length * 0.1),
      topQueries,
      recentCitations: cited.slice(0, 5),
      level,
      points,
      streak,
      achievements,
      citationTrend: trendData,
    };

    return new Response(
      JSON.stringify({ stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 