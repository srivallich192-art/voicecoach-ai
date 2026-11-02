import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';

export async function getProgress(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch all completed session reports with session details
    const { data: reports, error } = await supabaseAdmin
      .from('session_reports')
      .select(`
        id,
        session_id,
        overall_score,
        category_scores,
        avg_wpm,
        total_fillers,
        created_at,
        interview_sessions (
          role_domain,
          role_title,
          interview_type,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError(`Failed to fetch progress metrics: ${error.message}`, 500);
    }

    if (!reports || reports.length === 0) {
      return res.status(200).json({
        data: {
          hasHistory: false,
          totalSessions: 0,
          averageOverallScore: 0,
          averageWpm: 0,
          averageFillers: 0,
          categoryAverages: {
            clarity: 0,
            structure: 0,
            relevance: 0,
            confidence_tone: 0,
            pacing: 0,
            vocabulary_grammar: 0
          },
          timeline: []
        },
        error: null
      });
    }

    // Compute averages
    const totalSessions = reports.length;
    let sumScore = 0;
    let sumWpm = 0;
    let sumFillers = 0;

    const categorySums = {
      clarity: 0,
      structure: 0,
      relevance: 0,
      confidence_tone: 0,
      pacing: 0,
      vocabulary_grammar: 0
    };

    const timeline = reports.map(r => {
      sumScore += r.overall_score || 0;
      sumWpm += Number(r.avg_wpm || 0);
      sumFillers += r.total_fillers || 0;

      if (r.category_scores) {
        for (const [key, val] of Object.entries(r.category_scores)) {
          if (categorySums[key] !== undefined) {
            categorySums[key] += Number(val || 0);
          }
        }
      }

      return {
        id: r.id,
        sessionId: r.session_id,
        date: r.created_at,
        roleTitle: r.interview_sessions?.role_title || 'Mock Interview',
        domain: r.interview_sessions?.role_domain || 'General',
        overallScore: r.overall_score,
        wpm: Number(r.avg_wpm || 0),
        fillers: r.total_fillers || 0,
        clarity: r.category_scores?.clarity || 0,
        structure: r.category_scores?.structure || 0,
        confidence: r.category_scores?.confidence_tone || 0
      };
    });

    const categoryAverages = {};
    for (const [key, sum] of Object.entries(categorySums)) {
      categoryAverages[key] = Math.round(sum / totalSessions);
    }

    res.status(200).json({
      data: {
        hasHistory: true,
        totalSessions,
        averageOverallScore: Math.round(sumScore / totalSessions),
        averageWpm: Math.round((sumWpm / totalSessions) * 10) / 10,
        averageFillers: Math.round((sumFillers / totalSessions) * 10) / 10,
        categoryAverages,
        timeline
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

