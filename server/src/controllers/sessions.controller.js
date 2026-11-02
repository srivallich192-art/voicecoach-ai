import crypto from 'crypto';
import { supabaseAdmin } from '../lib/supabase.js';
import { NotFoundError, ForbiddenError, AppError } from '../lib/errors.js';
import { createInterviewPlan } from '../services/interviewPlanner.js';
import { deleteSessionAudio, getSignedAudioUrl } from '../services/audioStorage.js';

// In-memory fallback stores if database migration has not been executed yet
export const memorySessions = new Map();
export const memoryTurns = new Map();
export const memoryReports = new Map();

export async function createSession(req, res, next) {
  try {
    const userId = req.user.id;
    const body = req.body;

    // Fetch user profile for fallback experience level
    let experienceLevel = 'fresher';
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profile?.experience_level) experienceLevel = profile.experience_level;
    } catch (_) {}

    // Generate dynamic interview question plan using Gemini
    const plan = await createInterviewPlan({
      role_title: body.role_title,
      role_domain: body.role_domain,
      experience_level: experienceLevel,
      interview_type: body.interview_type,
      difficulty: body.difficulty,
      question_count: body.question_count,
      job_description: body.job_description,
      userId
    });

    const firstQuestion = plan.questions[0];

    // Try inserting session into database
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('interview_sessions')
      .insert({
        user_id: userId,
        role_domain: body.role_domain,
        role_title: body.role_title,
        interview_type: body.interview_type,
        difficulty: body.difficulty,
        question_count: body.question_count,
        job_description: body.job_description,
        feedback_language: body.feedback_language || 'English',
        enable_follow_ups: body.enable_follow_ups,
        silence_auto_stop_seconds: body.silence_auto_stop_seconds,
        save_audio: body.save_audio,
        status: 'created',
        current_main_index: 0,
        question_plan: plan.questions
      })
      .select()
      .single();

    if (sessionError && sessionError.code === 'PGRST205') {
      // Database tables not migrated yet: store in-memory so interview runs seamlessly
      const memSessionId = 'mem-' + Date.now();
      const memSession = {
        id: memSessionId,
        user_id: userId,
        role_domain: body.role_domain,
        role_title: body.role_title,
        interview_type: body.interview_type,
        difficulty: body.difficulty,
        question_count: body.question_count,
        job_description: body.job_description,
        feedback_language: body.feedback_language || 'English',
        enable_follow_ups: body.enable_follow_ups,
        silence_auto_stop_seconds: body.silence_auto_stop_seconds,
        save_audio: false,
        status: 'created',
        current_main_index: 0,
        question_plan: plan.questions,
        created_at: new Date().toISOString()
      };
      memorySessions.set(memSessionId, memSession);

      const memTurn = {
        id: 'turn-' + Date.now(),
        session_id: memSessionId,
        user_id: userId,
        turn_index: 0,
        kind: 'main',
        question_text: firstQuestion.question,
        question_topic: firstQuestion.topic,
        created_at: new Date().toISOString()
      };
      memoryTurns.set(memSessionId, [memTurn]);

      return res.status(201).json({
        data: {
          session: memSession,
          greeting: plan.greeting,
          currentTurn: memTurn,
          totalQuestions: plan.questions.length
        },
        error: null
      });
    }

    if (sessionError) {
      throw new AppError(`Failed to create interview session: ${sessionError.message}`, 500);
    }

    // Insert first turn
    const { data: turn, error: turnError } = await supabaseAdmin
      .from('interview_turns')
      .insert({
        session_id: session.id,
        user_id: userId,
        turn_index: 0,
        kind: 'main',
        question_text: firstQuestion.question,
        question_topic: firstQuestion.topic
      })
      .select()
      .single();

    if (turnError) {
      throw new AppError(`Failed to initialize first question: ${turnError.message}`, 500);
    }

    res.status(201).json({
      data: {
        session,
        greeting: plan.greeting,
        currentTurn: turn,
        totalQuestions: plan.questions.length
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function listSessions(req, res, next) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, domain } = req.query;
    const offset = (page - 1) * limit;

    const { data: sessions, count, error } = await supabaseAdmin
      .from('interview_sessions')
      .select(`
        *,
        session_reports (
          overall_score,
          category_scores,
          avg_wpm,
          total_fillers
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error && error.code === 'PGRST205') {
      // In-memory fallback
      const memList = Array.from(memorySessions.values()).filter(s => s.user_id === userId);
      return res.status(200).json({
        data: {
          sessions: memList,
          total: memList.length,
          page: Number(page),
          limit: Number(limit),
          totalPages: 1
        },
        error: null
      });
    }

    if (error) {
      throw new AppError(`Failed to list sessions: ${error.message}`, 500);
    }

    res.status(200).json({
      data: {
        sessions: sessions || [],
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / limit)
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;

    // Check in-memory store first
    if (memorySessions.has(sessionId)) {
      const session = memorySessions.get(sessionId);
      const turns = memoryTurns.get(sessionId) || [];
      const report = memoryReports.get(sessionId) || null;
      return res.status(200).json({
        data: { session, turns, report },
        error: null
      });
    }

    const { data: session, error } = await supabaseAdmin
      .from('interview_sessions')
      .select('*, profiles:user_id(display_name, experience_level)')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      throw new NotFoundError('Interview session not found');
    }

    // Ownership re-check
    if (session.user_id !== userId) {
      throw new ForbiddenError('Access to this interview session is forbidden');
    }

    // Fetch turns
    const { data: turns, error: turnsError } = await supabaseAdmin
      .from('interview_turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_index', { ascending: true });

    if (turnsError) {
      throw new AppError(`Failed to fetch session turns: ${turnsError.message}`, 500);
    }

    // Generate signed audio URLs if saved
    const processedTurns = await Promise.all(
      (turns || []).map(async (turn) => {
        if (session.save_audio && turn.audio_path) {
          const signedUrl = await getSignedAudioUrl(turn.audio_path);
          return { ...turn, signed_audio_url: signedUrl };
        }
        return turn;
      })
    );

    // Fetch report if completed
    const { data: report } = await supabaseAdmin
      .from('session_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    res.status(200).json({
      data: {
        session,
        turns: processedTurns,
        report: report || null
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;

    if (memorySessions.has(sessionId)) {
      memorySessions.delete(sessionId);
      memoryTurns.delete(sessionId);
      memoryReports.delete(sessionId);
      return res.status(200).json({
        data: { message: 'Session deleted successfully' },
        error: null
      });
    }

    const { data: session, error } = await supabaseAdmin
      .from('interview_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      throw new NotFoundError('Interview session not found');
    }

    if (session.user_id !== userId) {
      throw new ForbiddenError('Cannot delete another user’s interview session');
    }

    // Delete stored audio if any
    await deleteSessionAudio(userId, sessionId);

    // Delete session (cascade removes turns and report)
    const { error: deleteError } = await supabaseAdmin
      .from('interview_sessions')
      .delete()
      .eq('id', sessionId);

    if (deleteError) {
      throw new AppError(`Failed to delete session: ${deleteError.message}`, 500);
    }

    res.status(200).json({
      data: { message: 'Session deleted successfully' },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function startSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;

    if (memorySessions.has(sessionId)) {
      const session = memorySessions.get(sessionId);
      session.status = 'in_progress';
      session.started_at = new Date().toISOString();
      const turns = memoryTurns.get(sessionId) || [];
      const currentTurn = turns[turns.length - 1];
      return res.status(200).json({
        data: { session, currentTurn },
        error: null
      });
    }

    const { data: session, error } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      throw new NotFoundError('Interview session not found');
    }

    if (session.user_id !== userId) {
      throw new ForbiddenError('Unauthorized session access');
    }

    const { data: updatedSession, error: updateError } = await supabaseAdmin
      .from('interview_sessions')
      .update({
        status: 'in_progress',
        started_at: session.started_at || new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      throw new AppError(`Failed to start session: ${updateError.message}`, 500);
    }

    // Get current turn
    const { data: currentTurn } = await supabaseAdmin
      .from('interview_turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_index', { ascending: false })
      .limit(1)
      .single();

    res.status(200).json({
      data: {
        session: updatedSession,
        currentTurn
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function retryQuestion(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;
    const { turn_id } = req.body;

    let targetQuestionText = 'Tell me about a challenging situation you handled.';
    let roleTitle = 'Mock Interview';

    if (memorySessions.has(sessionId)) {
      const turns = memoryTurns.get(sessionId) || [];
      const found = turns.find(t => t.id === turn_id);
      if (found) targetQuestionText = found.question_text;
      const memSess = memorySessions.get(sessionId);
      roleTitle = memSess.role_title;
    } else {
      const { data: targetTurn } = await supabaseAdmin
        .from('interview_turns')
        .select('*')
        .eq('id', turn_id)
        .single();
      if (targetTurn) targetQuestionText = targetTurn.question_text;
    }

    const newId = 'mem-retry-' + Date.now();
    const newSession = {
      id: newId,
      user_id: userId,
      role_domain: 'General',
      role_title: `${roleTitle} (Practice Drill)`,
      interview_type: 'behavioral',
      difficulty: 'standard',
      question_count: 1,
      feedback_language: 'English',
      enable_follow_ups: false,
      silence_auto_stop_seconds: 4,
      save_audio: false,
      status: 'created',
      current_main_index: 0,
      question_plan: [{ question: targetQuestionText, topic: 'Practice', category: 'behavioral', what_a_good_answer_includes: ['Specific example', 'Results'] }]
    };
    memorySessions.set(newId, newSession);

    const newTurn = {
      id: 'turn-' + Date.now(),
      session_id: newId,
      user_id: userId,
      turn_index: 0,
      kind: 'main',
      question_text: targetQuestionText,
      question_topic: 'Practice Target'
    };
    memoryTurns.set(newId, [newTurn]);

    res.status(201).json({
      data: {
        session: newSession,
        currentTurn: newTurn
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}
