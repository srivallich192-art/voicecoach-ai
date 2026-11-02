import { useReducer, useCallback } from 'react';

export const INTERVIEW_STATES = {
  IDLE: 'idle',
  SPEAKING_QUESTION: 'speaking_question',
  READY: 'ready',
  RECORDING: 'recording',
  UPLOADING: 'uploading',
  ANALYZING: 'analyzing',
  SHOWING_FEEDBACK: 'showing_feedback',
  FINISHED: 'finished',
  ERROR: 'error'
};

const initialState = {
  status: INTERVIEW_STATES.IDLE,
  session: null,
  currentTurn: null,
  priorTurns: [],
  currentFeedback: null,
  errorMessage: null,
  isLastQuestion: false,
  questionNumber: 1,
  totalQuestions: 5
};

function interviewReducer(state, action) {
  switch (action.type) {
    case 'INIT_SESSION':
      return {
        ...state,
        status: INTERVIEW_STATES.SPEAKING_QUESTION,
        session: action.payload.session,
        currentTurn: action.payload.currentTurn,
        totalQuestions: action.payload.session.question_count || 5,
        questionNumber: (action.payload.session.current_main_index || 0) + 1,
        errorMessage: null
      };

    case 'START_SPEAKING':
      return {
        ...state,
        status: INTERVIEW_STATES.SPEAKING_QUESTION,
        errorMessage: null
      };

    case 'FINISH_SPEAKING':
      return {
        ...state,
        status: INTERVIEW_STATES.READY
      };

    case 'START_RECORDING':
      return {
        ...state,
        status: INTERVIEW_STATES.RECORDING,
        errorMessage: null
      };

    case 'START_UPLOADING':
      return {
        ...state,
        status: INTERVIEW_STATES.UPLOADING
      };

    case 'START_ANALYZING':
      return {
        ...state,
        status: INTERVIEW_STATES.ANALYZING
      };

    case 'SET_FEEDBACK':
      return {
        ...state,
        status: INTERVIEW_STATES.SHOWING_FEEDBACK,
        currentFeedback: action.payload.analysis,
        isLastQuestion: Boolean(action.payload.isLast),
        errorMessage: null
      };

    case 'REPEAT_TURN':
      return {
        ...state,
        status: INTERVIEW_STATES.READY,
        currentFeedback: null,
        errorMessage: null
      };

    case 'ADVANCE_TURN':
      return {
        ...state,
        status: INTERVIEW_STATES.SPEAKING_QUESTION,
        priorTurns: state.currentTurn ? [...state.priorTurns, state.currentTurn] : state.priorTurns,
        currentTurn: action.payload.nextTurn,
        currentFeedback: null,
        questionNumber: action.payload.nextTurn?.kind === 'main'
          ? state.questionNumber + 1
          : state.questionNumber,
        errorMessage: null
      };

    case 'FINISH_INTERVIEW':
      return {
        ...state,
        status: INTERVIEW_STATES.FINISHED
      };

    case 'SET_ERROR':
      return {
        ...state,
        status: INTERVIEW_STATES.ERROR,
        errorMessage: action.payload
      };

    case 'RESET_ERROR':
      return {
        ...state,
        status: INTERVIEW_STATES.READY,
        errorMessage: null
      };

    default:
      return state;
  }
}

export function useInterviewMachine() {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  const initSession = useCallback((session, currentTurn) => {
    dispatch({ type: 'INIT_SESSION', payload: { session, currentTurn } });
  }, []);

  const startSpeaking = useCallback(() => {
    dispatch({ type: 'START_SPEAKING' });
  }, []);

  const finishSpeaking = useCallback(() => {
    dispatch({ type: 'FINISH_SPEAKING' });
  }, []);

  const startRecording = useCallback(() => {
    dispatch({ type: 'START_RECORDING' });
  }, []);

  const startUploading = useCallback(() => {
    dispatch({ type: 'START_UPLOADING' });
  }, []);

  const startAnalyzing = useCallback(() => {
    dispatch({ type: 'START_ANALYZING' });
  }, []);

  const setFeedback = useCallback((analysis, isLast) => {
    dispatch({ type: 'SET_FEEDBACK', payload: { analysis, isLast } });
  }, []);

  const repeatTurn = useCallback(() => {
    dispatch({ type: 'REPEAT_TURN' });
  }, []);

  const advanceTurn = useCallback((nextTurn) => {
    dispatch({ type: 'ADVANCE_TURN', payload: { nextTurn } });
  }, []);

  const finishInterview = useCallback(() => {
    dispatch({ type: 'FINISH_INTERVIEW' });
  }, []);

  const setError = useCallback((msg) => {
    dispatch({ type: 'SET_ERROR', payload: msg });
  }, []);

  const resetError = useCallback(() => {
    dispatch({ type: 'RESET_ERROR' });
  }, []);

  return {
    state,
    initSession,
    startSpeaking,
    finishSpeaking,
    startRecording,
    startUploading,
    startAnalyzing,
    setFeedback,
    repeatTurn,
    advanceTurn,
    finishInterview,
    setError,
    resetError
  };
}

