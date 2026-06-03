import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, MapPin, Users, Calendar, Wallet } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../../../shared/i18n/useI18n';
import { chatApi, type ChatMessage, type ChatSession } from '../../../shared/api/chat';

export default function ChatWidget() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: sessions } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const res = await chatApi.getSessions();
      return res.data;
    },
    enabled: isOpen,
  });

  const { data: messages } = useQuery({
    queryKey: ['chat-messages', activeSession?.id],
    queryFn: async () => {
      const res = await chatApi.getMessages(activeSession!.id);
      return res.data;
    },
    enabled: isOpen && !!activeSession,
  });

  const createSessionMutation = useMutation({
    mutationFn: () => chatApi.createSession(),
    onSuccess: (res) => {
      setActiveSession(res.data);
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      if (!activeSession) return createSessionMutation.mutateAsync().then((res) => chatApi.sendMessage(res.data.id, content));
      return chatApi.sendMessage(activeSession.id, content);
    },
    onSuccess: () => {
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', activeSession?.id] });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !activeSession && sessions && sessions.length > 0) {
      setActiveSession(sessions[0]);
    }
  }, [isOpen, sessions, activeSession]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text: string) => {
    sendMessageMutation.mutate(text);
  };

  const handleNewChat = () => {
    setActiveSession(null);
    createSessionMutation.mutate();
  };

  const displayMessages: ChatMessage[] = messages ?? [];
  const currentMessages = activeSession
    ? displayMessages
    : [{ id: 0, session_id: 0, role: 'assistant' as const, content: t('chat.welcome'), created_at: new Date().toISOString() }];

  const quickReplies = [
    { label: t('chat.iWantToGo'), icon: MapPin },
    { label: t('chat.guestsAnswer'), icon: Users },
    { label: t('chat.checkIn'), icon: Calendar },
    { label: t('chat.budgetAnswer'), icon: Wallet },
  ];

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-text text-white rotate-0'
            : 'bg-primary text-white'
        }`}
        aria-label={isOpen ? t('common.close') : t('chat.assistantTitle')}
      >
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] transition-all duration-300 sm:w-[380px] ${
          isOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex max-h-[500px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_70px_rgba(16,32,29,.18)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">{t('chat.assistantTitle')}</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              className="rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
            >
              {t('chat.newChat')}
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: '280px' }}>
            {currentMessages.length === 0 && (
              <p className="py-8 text-center text-sm text-text-secondary">{t('chat.noSessions')}</p>
            )}
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-warm-surface text-text rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sendMessageMutation.isPending && (
              <div className="mb-3 flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-warm-surface px-3.5 py-2.5 text-sm text-text-secondary">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {currentMessages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2.5">
              {quickReplies.map((reply) => (
                <button
                  key={reply.label}
                  type="button"
                  onClick={() => handleQuickReply(reply.label)}
                  disabled={sendMessageMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-warm-surface disabled:opacity-50"
                >
                  <reply.icon className="size-3 text-primary" />
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.inputPlaceholder')}
                disabled={sendMessageMutation.isPending}
                className="flex-1 rounded-xl border border-border bg-warm-surface px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || sendMessageMutation.isPending}
                className="flex size-10 items-center justify-center rounded-xl bg-primary text-white transition-all hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t('chat.sending')}
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
