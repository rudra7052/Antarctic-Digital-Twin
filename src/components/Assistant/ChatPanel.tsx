import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ANTARCTIC_STATIONS } from '../../data/mockStations';
import { StationId } from '../../types';
import {
  Bot,
  Send,
  Sparkles,
  X,
  FileText,
  Radio,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Droplets,
  Wind,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Sliders
} from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const {
    selectedStationId,
    setSelectedStationId,
    isChatDrawerOpen,
    toggleChatDrawer,
    chatMessages,
    addChatMessage,
    updateChatMessage,
    simulation,
    toggleFailureMode
  } = useAppStore();

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const station = ANTARCTIC_STATIONS[selectedStationId] || ANTARCTIC_STATIONS.bharati;

  const quickPromptCategories = [
    {
      category: 'Power & Generator',
      icon: Zap,
      prompts: [
        'Diagnose DG-1 bearing harmonic vibration and temperature',
        'What happens to BESS battery if DG-1 trips?'
      ]
    },
    {
      category: 'Life Support & Water',
      icon: Droplets,
      prompts: [
        'When will freshwater run out at current consumption?',
        'Verify Lake Priyadarshini / RO Desalination intake trace heat'
      ]
    },
    {
      category: 'Weather & Logistics',
      icon: Wind,
      prompts: [
        'Analyze katabatic blizzard risk and wind chill',
        'Show 44th Indian Antarctic Expedition resupply timeline'
      ]
    },
    {
      category: 'Emergency SOP',
      icon: ShieldAlert,
      prompts: [
        'Show emergency SOP for generator failover',
        'Evaluate cascading failure risk tree for both stations'
      ]
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || isLoading) return;

    const userMessageId = `msg-${Date.now()}`;
    const newUserMsg = {
      id: userMessageId,
      sender: 'USER' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addChatMessage(newUserMsg);
    if (!queryText) setInput('');
    setIsLoading(true);

    const botMessageId = `msg-${Date.now() + 1}`;
    addChatMessage({
      id: botMessageId,
      sender: 'BOT',
      text: `Connecting to Gemini 3.5 Flash SCADA Copilot and analyzing ${station.name} telemetry mesh...`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isThinking: true
    });

    try {
      // Build conversation history for multi-turn Gemini API
      const conversationPayload = chatMessages
        .slice(-8)
        .map(m => ({
          role: (m.sender === 'USER' || m.sender === 'user') ? 'user' : 'model',
          text: m.text
        }));

      conversationPayload.push({
        role: 'user',
        text
      });

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          messages: conversationPayload,
          stationId: selectedStationId
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        updateChatMessage(botMessageId, {
          text: data.answer,
          sources: data.sources,
          quickActions: data.quickActions,
          isThinking: false
        });
      } else {
        updateChatMessage(botMessageId, {
          text: `⚠️ Telemetry Copilot Error: ${data.error || 'Failed to retrieve response from AI engine.'}`,
          isThinking: false
        });
      }
    } catch (err: any) {
      updateChatMessage(botMessageId, {
        text: `⚠️ Network error communicating with Antarctic Digital Twin AI: ${err.message}`,
        isThinking: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleActionClick = (action: string) => {
    if (action.includes('Switch to Maitri')) {
      setSelectedStationId('maitri');
      handleSend('Summarize Maitri station status and generator health');
    } else if (action.includes('Switch to Bharati')) {
      setSelectedStationId('bharati');
      handleSend('Summarize Bharati station status and RO desalination health');
    } else if (action.includes('Standby') || action.includes('Failover')) {
      toggleFailureMode(false);
      handleSend('Verify Standby Generator Bank 2 operational status and load acceptance');
    } else {
      handleSend(action);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-300 shadow-inner">
            <Bot className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                POWER AI COPILOT
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-800/80 font-semibold shadow-sm">
                  Gemini 3.5 Flash
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
              <span>NCPOR Telemetry RAG</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">{station.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Station Switcher inside Copilot */}
          <div className="flex items-center bg-slate-950 border border-slate-750 rounded-xl p-0.5">
            <button
              onClick={() => setSelectedStationId('bharati')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
                selectedStationId === 'bharati'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bharati
            </button>
            <button
              onClick={() => setSelectedStationId('maitri')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
                selectedStationId === 'maitri'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Maitri
            </button>
          </div>

          {isChatDrawerOpen && (
            <button
              onClick={() => toggleChatDrawer(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Copilot Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested SCADA Diagnostics Categories */}
      <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1 font-semibold uppercase">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          AI SCADA QUERIES:
        </span>
        {quickPromptCategories.map((cat, cIdx) => {
          const Icon = cat.icon;
          return (
            <button
              key={cIdx}
              onClick={() => handleSend(cat.prompts[0])}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-600/60 text-slate-300 hover:text-cyan-200 transition-all disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-cyan-400" />
              <span>{cat.prompts[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[600px] scroll-smooth"
      >
        {chatMessages.map((msg, idx) => {
          const isUser = msg.sender === 'USER' || msg.sender === 'user';
          return (
            <div
              key={msg.id || idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-fade-in`}
            >
              {/* Sender & Timestamp tag */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 px-1">
                <span className="font-semibold text-slate-400">
                  {isUser ? 'NCPOR MISSION COMMANDER' : 'GEMINI 3.5 FLASH SCADA COPILOT'}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-4.5 text-xs font-mono leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                    : 'bg-slate-900/95 border border-slate-800/90 text-slate-200 rounded-bl-none'
                }`}
              >
                {/* Thinking Animation */}
                {msg.isThinking && (
                  <div className="flex items-center gap-2.5 py-1 text-cyan-300">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span className="text-xs font-mono">{msg.text}</span>
                  </div>
                )}

                {/* Message Body with Markdown formatting support */}
                {!msg.isThinking && (
                  <div className="whitespace-pre-wrap space-y-2 text-slate-200">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h3 key={lIdx} className="text-sm font-bold text-cyan-300 mt-2 mb-1">
                            {line.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('#### ')) {
                        return (
                          <h4 key={lIdx} className="text-xs font-bold text-amber-300 mt-2 mb-1">
                            {line.replace('#### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={lIdx} className="flex items-start gap-1.5 pl-2 text-slate-300">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{line.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      return <p key={lIdx}>{line}</p>;
                    })}
                  </div>
                )}

                {/* Grounding Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800 space-y-2">
                    <div className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1.5 tracking-wider">
                      <FileText className="w-3.5 h-3.5" />
                      SCADA Telemetry & SOP Grounding Citations:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="rounded-xl bg-slate-950/90 p-2.5 border border-slate-800 text-[10px] space-y-1"
                        >
                          <div className="font-bold text-cyan-300 flex items-center gap-1">
                            <span>📌</span>
                            <span className="truncate">{src.title}</span>
                          </div>
                          <div className="text-slate-400 line-clamp-2 leading-relaxed">
                            {src.snippet}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Action Chips Triggerable from Response */}
                {msg.quickActions && msg.quickActions.length > 0 && !msg.isThinking && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {msg.quickActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/60 hover:border-cyan-500 text-[10px] text-cyan-300 font-bold transition-all shadow-sm"
                      >
                        <span>{act}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions (Copy / Speech) for Bot Messages */}
                {!isUser && !msg.isThinking && (
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-slate-400">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      Inference Time: 12.4ms • Grounded in WGS84 EPSG:3031
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(msg.text, idx)}
                        className="p-1 hover:text-cyan-400 transition-colors"
                        title="Copy Answer to Clipboard"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleSpeech(msg.text)}
                        className={`p-1 transition-colors ${
                          isSpeaking ? 'text-amber-400' : 'hover:text-cyan-400'
                        }`}
                        title={isSpeaking ? 'Stop Audio' : 'Read Aloud with Voice Synthesis'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            id="ai-assistant-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Gemini Copilot about ${station.name} SCADA, DG vibration, or SOP runbooks...`}
            disabled={isLoading}
            className="w-full rounded-2xl bg-slate-950 border border-slate-750 px-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
          title="Send query to Gemini Copilot"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
