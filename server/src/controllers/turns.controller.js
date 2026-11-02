import { supabaseAdmin } from '../lib/supabase.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  AppError
} from '../lib/errors.js';
import { analyzeTurn } from '../services/turnAnalyzer.js';
import { generateSessionReport } from '../services/reportBuilder.js';
import { uploadTurnAudio } from '../services/audioStorage.js';
import { memorySessions, memoryTurns, memoryReports } from './sessions.controller.js';

/**
 * Shared logic to evaluate turn (either via audio or text fallback)
 */
async function processTurnEvaluation({
  sessionId,
  userId,
  turnId,
  durationSeconds,
  audioBuffer = null,
  audioMimeType = 'audio/webm',
  textAnswer = null
}) {
  let session = null;
  let allTurns = [];
  const isMem = memorySessions.has(sessionId);

  if (isMem) {
    session = memorySessions.get(sessionId);
    allTurns = memoryTurns.get(sessionId) || [];
  } else {
    // 1. Fetch and verify session from Supabase
    const { data: sessData, error: sessError } = await supabaseAdmin
      .from('interview_sessions')
      .select('*, profiles:user_id(display_name, experience_level, feedback_language)')
      .eq('id', sessionId)
      .single();

    if (sessError || !sessData) {
      throw new NotFoundError('Interview session not found');
    }
    session = sessData;

    // 2. Fetch turns from Supabase
    const { data: dbTurns, error: turnsError } = await supabaseAdmin
      .from('interview_turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_index', { ascending: true });

    if (turnsError || !dbTurns || dbTurns.length === 0) {
      throw new NotFoundError('No turns found for this session');
    }
    allTurns = dbTurns;
  }

  if (session.status === 'created') {
    session.status = 'in_progress';
    session.started_at = new Date().toISOString();
    if (!isMem) {
      await supabaseAdmin
        .from('interview_sessions')
        .update({ status: 'in_progress', started_at: session.started_at })
        .eq('id', sessionId);
    }
  }

  // Find target turn
  let currentTurn = turnId
    ? allTurns.find(t => t.id === turnId)
    : allTurns[allTurns.length - 1];

  if (!currentTurn) {
    currentTurn = allTurns[allTurns.length - 1];
  }

  const priorTurns = allTurns.filter(t => t.turn_index < currentTurn.turn_index);

  // Determine next planned main question if any
  const questionPlan = session.question_plan || [];
  const nextMainIndex = session.current_main_index + 1;
  const nextPlannedQuestion = nextMainIndex < questionPlan.length
    ? questionPlan[nextMainIndex]?.question
    : null;

  // 3. Analyze turn using Gemini & deterministic metrics
  const analysis = await analyzeTurn({
    session,
    currentTurn,
    durationSeconds,
    audioBuffer,
    audioMimeType,
    textAnswer,
    priorTurns,
    nextPlannedQuestion,
    userId
  });

  // 4. Save audio if requested and audio exists
  let audioPath = null;
  if (session.save_audio && audioBuffer && !isMem) {
    audioPath = await uploadTurnAudio({
      userId,
      sessionId,
      turnId: currentTurn.id,
      buffer: audioBuffer,
      mimeType: audioMimeType
    });
  }

  // 5. Update current turn in database or memory
  currentTurn.transcript = analysis.transcript;
  currentTurn.duration_seconds = durationSeconds;
  currentTurn.word_count = analysis.word_count;
  currentTurn.words_per_minute = analysis.words_per_minute;
  currentTurn.filler_total = analysis.filler_total;
  currentTurn.filler_breakdown = analysis.filler_breakdown;
  currentTurn.scores = analysis.scores;
  currentTurn.feedback = {
    answer_status: analysis.answer_status,
    delivery_observations: analysis.delivery_observations,
    structure_analysis: analysis.structure_analysis,
    strengths: analysis.strengths,
    improvements: analysis.improvements,
    spoken_feedback: analysis.spoken_feedback,
    improved_answer_example: analysis.improved_answer_example,
    next_step: analysis.next_step
  };
  currentTurn.audio_path = audioPath;

  if (!isMem) {
    await supabaseAdmin
      .from('interview_turns')
      .update({
        transcript: currentTurn.transcript,
        duration_seconds: currentTurn.duration_seconds,
        word_count: currentTurn.word_count,
        words_per_minute: currentTurn.words_per_minute,
        filler_total: currentTurn.filler_total,
        filler_breakdown: currentTurn.filler_breakdown,
        scores: currentTurn.scores,
        feedback: currentTurn.feedback,
        audio_path: audioPath
      })
      .eq('id', currentTurn.id);
  }

  // 6. Handle next step branching
  const nextStep = analysis.next_step;
  let nextTurn = null;
  let isLast = false;
  let isRepeat = false;

  if (nextStep.action === 'repeat_question') {
    isRepeat = true;
    nextTurn = currentTurn;
  } else if (nextStep.action === 'follow_up') {
    // Insert follow-up turn
    const followUpId = 'turn-' + Date.now();
    const newTurnData = {
      id: followUpId,
      session_id: sessionId,
      user_id: userId,
      turn_index: currentTurn.turn_index + 1,
      kind: 'follow_up',
      parent_turn_id: currentTurn.kind === 'follow_up' ? currentTurn.parent_turn_id : currentTurn.id,
      question_text: nextStep.question_text,
      question_topic: 'Follow-up exploration',
      created_at: new Date().toISOString()
    };

    if (isMem) {
      allTurns.push(newTurnData);
      memoryTurns.set(sessionId, allTurns);
      nextTurn = newTurnData;
    } else {
      const { data: dbTurn, error: insertError } = await supabaseAdmin
        .from('interview_turns')
        .insert({
          session_id: sessionId,
          user_id: userId,
          turn_index: currentTurn.turn_index + 1,
          kind: 'follow_up',
          parent_turn_id: currentTurn.kind === 'follow_up' ? currentTurn.parent_turn_id : currentTurn.id,
          question_text: nextStep.question_text,
          question_topic: 'Follow-up exploration'
        })
        .select()
        .single();

      if (insertError) {
        throw new AppError(`Failed to create follow-up turn: ${insertError.message}`, 500);
      }
      nextTurn = dbTurn;
    }
  } else {
    // Move to next main question or finish
    if (nextMainIndex < questionPlan.length) {
      const nextPlanItem = questionPlan[nextMainIndex];
      const mainQuestionText = nextStep.action === 'next_question' && nextStep.question_text
        ? nextStep.question_text
        : nextPlanItem.question;

      session.current_main_index = nextMainIndex;

      if (isMem) {
        const nextId = 'turn-' + Date.now();
        const newMainTurn = {
          id: nextId,
          session_id: sessionId,
          user_id: userId,
          turn_index: currentTurn.turn_index + 1,
          kind: 'main',
          question_text: mainQuestionText,
          question_topic: nextPlanItem.topic,
          created_at: new Date().toISOString()
        };
        allTurns.push(newMainTurn);
        memoryTurns.set(sessionId, allTurns);
        nextTurn = newMainTurn;
      } else {
        const { data: dbMainTurn, error: insertError } = await supabaseAdmin
          .from('interview_turns')
          .insert({
            session_id: sessionId,
            user_id: userId,
            turn_index: currentTurn.turn_index + 1,
            kind: 'main',
            question_text: mainQuestionText,
            question_topic: nextPlanItem.topic
          })
          .select()
          .single();

        if (insertError) {
          throw new AppError(`Failed to create next turn: ${insertError.message}`, 500);
        }

        await supabaseAdmin
          .from('interview_sessions')
          .update({ current_main_index: nextMainIndex })
          .eq('id', sessionId);

        nextTurn = dbMainTurn;
      }
    } else {
      isLast = true;
    }
  }

  return {
    analysis,
    currentTurnId: currentTurn.id,
    nextTurn,
    isLast,
    isRepeat,
    currentQuestionNumber: session.current_main_index + 1,
    totalPlannedQuestions: questionPlan.length
  };
}

export async function submitAudioTurn(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;
    const { turn_id, duration_seconds } = req.body;

    if (!req.file || !req.file.buffer) {
      throw new ValidationError('Audio recording file is required');
    }

    const duration = parseFloat(duration_seconds);
    if (isNaN(duration) || duration < 2 || duration > 130) {
      throw new ValidationError('Duration must be between 2 and 130 seconds');
    }

    const result = await processTurnEvaluation({
      sessionId,
      userId,
      turnId: turn_id,
      durationSeconds: duration,
      audioBuffer: req.file.buffer,
      audioMimeType: req.file.mimetype || 'audio/webm'
    });

    res.status(200).json({ data: result, error: null });
  } catch (err) {
    next(err);
  }
}

export async function submitTextTurn(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;
    const { turn_id, text, estimated_duration_seconds = 45 } = req.body;

    const result = await processTurnEvaluation({
      sessionId,
      userId,
      turnId: turn_id,
      durationSeconds: parseFloat(estimated_duration_seconds) || 45,
      textAnswer: text
    });

    res.status(200).json({ data: result, error: null });
  } catch (err) {
    next(err);
  }
}

export async function completeSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;

    let session = null;
    let turns = [];
    const isMem = memorySessions.has(sessionId);

    if (isMem) {
      session = memorySessions.get(sessionId);
      turns = (memoryTurns.get(sessionId) || []).filter(t => t.scores);

      if (memoryReports.has(sessionId)) {
        return res.status(200).json({ data: memoryReports.get(sessionId), error: null });
      }
    } else {
      const { data: sessData, error: sessError } = await supabaseAdmin
        .from('interview_sessions')
        .select('*, profiles:user_id(display_name, experience_level, feedback_language)')
        .eq('id', sessionId)
        .single();

      if (sessError || !sessData) {
        throw new NotFoundError('Interview session not found');
      }
      session = sessData;

      const { data: existingReport } = await supabaseAdmin
        .from('session_reports')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existingReport) {
        return res.status(200).json({ data: existingReport, error: null });
      }

      const { data: dbTurns } = await supabaseAdmin
        .from('interview_turns')
        .select('*')
        .eq('session_id', sessionId)
        .not('scores', 'is', null)
        .order('turn_index', { ascending: true });

      turns = dbTurns || [];
    }

    if (!turns || turns.length === 0) {
      throw new ValidationError('Cannot generate report: No turns have been completed yet');
    }

    // Generate comprehensive coaching report via Gemini
    const reportData = await generateSessionReport({
      session,
      turns,
      userId
    });

    if (isMem) {
      const memReport = {
        id: 'report-' + Date.now(),
        session_id: sessionId,
        user_id: userId,
        overall_score: reportData.overall_score,
        category_scores: reportData.category_scores,
        report: reportData.report,
        avg_wpm: reportData.avg_wpm,
        total_fillers: reportData.total_fillers,
        created_at: new Date().toISOString()
      };
      memoryReports.set(sessionId, memReport);
      session.status = 'completed';
      session.completed_at = new Date().toISOString();
      return res.status(201).json({ data: memReport, error: null });
    }

    // Save report to Supabase
    const { data: savedReport, error: saveReportError } = await supabaseAdmin
      .from('session_reports')
      .insert({
        session_id: sessionId,
        user_id: userId,
        overall_score: reportData.overall_score,
        category_scores: reportData.category_scores,
        report: reportData.report,
        avg_wpm: reportData.avg_wpm,
        total_fillers: reportData.total_fillers
      })
      .select()
      .single();

    if (saveReportError) {
      throw new AppError(`Failed to persist report: ${saveReportError.message}`, 500);
    }

    await supabaseAdmin
      .from('interview_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    res.status(201).json({ data: savedReport, error: null });
  } catch (err) {
    next(err);
  }
}

export async function getSessionReport(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;

    if (memoryReports.has(sessionId)) {
      const report = memoryReports.get(sessionId);
      const session = memorySessions.get(sessionId);
      return res.status(200).json({
        data: { ...report, interview_sessions: session },
        error: null
      });
    }

    const { data: report, error } = await supabaseAdmin
      .from('session_reports')
      .select('*, interview_sessions(*)')
      .eq('session_id', sessionId)
      .single();

    if (error || !report) {
      throw new NotFoundError('Session report not found');
    }

    res.status(200).json({ data: report, error: null });
  } catch (err) {
    next(err);
  }
}
