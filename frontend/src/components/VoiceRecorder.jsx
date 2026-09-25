import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VoiceRecorder({ onAudioReady, onClearAudio }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioElementRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert blob to File for FormData upload
        const audioFile = new File([audioBlob], `voice_report_${Date.now()}.webm`, {
          type: 'audio/webm'
        });
        if (onAudioReady) onAudioReady(audioFile);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      setPermissionError('Microphone permission not granted or device not supported.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const clearAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (onClearAudio) onClearAudio();
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-cream/60 p-4 rounded-2xl border-2 border-vanilla space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-raspberry flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-raspberry" />
          <span>Voice Note Reporter (+25 GovCoins Bonus)</span>
        </span>
        <span className="text-[10px] bg-vanilla text-raspberry font-extrabold px-2.5 py-0.5 rounded-full border border-vanilla">
          AI Speech-to-Text
        </span>
      </div>

      {permissionError && (
        <div className="p-2.5 bg-vanilla/40 border border-raspberry/30 rounded-xl text-xs text-raspberry flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {!audioUrl ? (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex-1 bg-raspberry hover:bg-pink-grapefruit text-white text-xs font-extrabold py-3 px-4 rounded-xl transition duration-150 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Record Voice Audio Evidence</span>
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-between bg-white border-2 border-raspberry p-2.5 rounded-xl shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-raspberry animate-ping" />
                <span className="text-xs font-black text-raspberry">Recording Audio...</span>
                <span className="text-xs font-bold text-slate-700 bg-vanilla px-2 py-0.5 rounded-md">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="bg-raspberry text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-pink-grapefruit flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-3 rounded-xl border border-lime/60 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-lime" />
            <span className="text-xs font-black text-slate-800">Voice Evidence Attached</span>
            <span className="text-[11px] font-bold text-lime bg-lime/10 px-2 py-0.5 rounded-md">
              {formatTime(recordingTime)} Audio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayback}
              className="bg-raspberry text-white p-2 rounded-lg hover:bg-pink-grapefruit transition cursor-pointer"
              title={isPlaying ? 'Pause playback' : 'Play audio'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={clearAudio}
              className="bg-vanilla text-raspberry p-2 rounded-lg hover:bg-raspberry hover:text-white transition cursor-pointer"
              title="Delete audio note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}

      <p className="text-[11px] text-slate-500 font-medium">
        Speak clearly describing landmarks, danger severity, or sounds (e.g. rushing water, sputtering electrical lines). AI transcribes and extracts keywords automatically.
      </p>
    </div>
  );
}
