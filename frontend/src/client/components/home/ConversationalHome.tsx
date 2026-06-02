import { useState } from 'react';
import { Calendar, Search, ChevronRight, Bot, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../shared/i18n/useI18n';

type Step = 'welcome' | 'destination' | 'guests' | 'dates' | 'budget' | 'loading' | 'results';
type Message = {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
};

export default function ConversationalHome() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [destination, setDestination] = useState('');
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [budget, setBudget] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: t('chat.welcome'),
      timestamp: new Date(),
    },
  ]);

  const addMessage = (type: 'bot' | 'user', text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleDestinationSubmit = (value: string) => {
    setDestination(value);
    addMessage('user', `${t('chat.iWantToGo')} ${value}`);
    setStep('guests');

    setTimeout(() => {
      addMessage('bot', `${t('chat.guestsQuestion')}`);
    }, 600);
  };

  const handleGuestsSubmit = (value: number) => {
    setGuests(value);
    addMessage('user', `${t('chat.guestsAnswer')} ${value}`);
    setStep('dates');

    setTimeout(() => {
      addMessage('bot', t('chat.datesQuestion'));
    }, 600);
  };

  const handleDatesSubmit = (checkIn: string, checkOut: string) => {
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    addMessage('user', `${t('chat.checkIn')} ${checkIn}, ${t('chat.checkOut')} ${checkOut}`);
    setStep('budget');

    setTimeout(() => {
      addMessage('bot', t('chat.budgetQuestion'));
    }, 600);
  };

  const handleBudgetSubmit = (value: string) => {
    setBudget(value);
    addMessage('user', `${t('chat.budgetAnswer')} ${value} VND/đêm`);
    setStep('loading');

    setTimeout(() => {
      setStep('results');
      addMessage('bot', t('chat.searching'));
    }, 800);
  };

  const handleViewResults = () => {
    const params = new URLSearchParams();
    if (destination) params.set('location', destination);
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    if (guests) params.set('guests', String(guests));
    if (budget) params.set('max_price', budget);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-navy via-navy/95 to-primary/20 flex flex-col">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-8">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'bot' && (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-lg">
                  <Bot className="size-5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  msg.type === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white text-navy rounded-bl-sm shadow-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <span className="text-[10px] opacity-60 mt-1 block">
                  {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {msg.type === 'user' && (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <span className="text-sm font-bold">Bạn</span>
                </div>
              )}
            </div>
          ))}

          {/* Input Areas */}
          {step === 'welcome' && (
            <div className="flex gap-3 justify-start reveal">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-lg">
                <Bot className="size-5" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-md p-4 w-full max-w-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('chat.destinationPlaceholder')}
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && destination.trim()) {
                        handleDestinationSubmit(destination.trim());
                      }
                    }}
                    className="flex-1 text-sm text-navy outline-none placeholder:text-text-secondary"
                    autoFocus
                  />
                  <button
                    onClick={() => destination.trim() && handleDestinationSubmit(destination.trim())}
                    disabled={!destination.trim()}
                    className="flex size-10 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-primary-hover hover:scale-105"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'guests' && (
            <div className="flex gap-3 justify-start reveal">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-lg">
                <Bot className="size-5" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-md p-4 w-full max-w-md">
                <div className="flex gap-2">
                  <select
                    value={guests}
                    onChange={e => handleGuestsSubmit(Number(e.target.value))}
                    className="flex-1 text-sm text-navy outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>
                        {n} khách {n === 1 ? '' : `(1 phòng)`}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="size-5 text-text-secondary" />
                </div>
              </div>
            </div>
          )}

          {step === 'dates' && (
            <div className="flex gap-3 justify-start reveal">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-lg">
                <Bot className="size-5" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-md p-4 w-full max-w-md">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={e => setCheckIn(e.target.value)}
                      className="flex-1 text-sm text-navy outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={e => setCheckOut(e.target.value)}
                      className="flex-1 text-sm text-navy outline-none cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={() => checkIn && checkOut && handleDatesSubmit(checkIn, checkOut)}
                    disabled={!checkIn || !checkOut}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-primary-hover"
                  >
                    <Send className="size-4" />
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'budget' && (
            <div className="flex gap-3 justify-start reveal">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-lg">
                <Bot className="size-5" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-md p-4 w-full max-w-md">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="VD: 500000"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && budget.trim()) {
                        handleBudgetSubmit(budget.trim());
                      }
                    }}
                    className="flex-1 text-sm text-navy outline-none placeholder:text-text-secondary"
                  />
                  <button
                    onClick={() => budget.trim() && handleBudgetSubmit(budget.trim())}
                    disabled={!budget.trim()}
                    className="flex size-10 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-primary-hover hover:scale-105"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="flex gap-3 justify-start reveal">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-lg">
                <Bot className="size-5" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-md px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-text-secondary">Đang tìm kiếm...</span>
                </div>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="flex gap-3 justify-start reveal">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-lg">
                <Bot className="size-5" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-md p-5 w-full max-w-lg">
                <div className="space-y-4">
                  <p className="text-sm text-navy">{t('chat.foundResults', { destination })}</p>

                  {/* Preview Results */}
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 rounded-xl bg-warm-surface/50 border border-border/50">
                      <div className="size-20 shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-gold/20" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-navy">Mường Thanh Luxury Hà Nội</div>
                        <div className="text-xs text-text-secondary mt-1">Hà Nội • 4.8 ⭐⭐⭐⭐</div>
                        <div className="text-sm font-bold text-primary mt-2">500.000 VND/đêm</div>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-xl bg-warm-surface/50 border border-border/50">
                      <div className="size-20 shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-gold/20" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-navy">Hilton Hanoi Opera</div>
                        <div className="text-xs text-text-secondary mt-1">Hà Nội • 4.9 ⭐⭐⭐⭐⭐</div>
                        <div className="text-sm font-bold text-primary mt-2">2.800.000 VND/đêm</div>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-xl bg-warm-surface/50 border border-border/50">
                      <div className="size-20 shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-gold/20" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-navy">Sofitel Legend Metropole</div>
                        <div className="text-xs text-text-secondary mt-1">Hà Nội • 5.0 ⭐⭐⭐⭐⭐</div>
                        <div className="text-sm font-bold text-primary mt-2">5.500.000 VND/đêm</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleViewResults}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(15,118,110,0.3)] hover:-translate-y-0.5"
                  >
                    <Search className="size-4" />
                    Xem tất cả kết quả
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        {step === 'welcome' && (
          <div className="border-t border-white/10 pt-4 mt-auto">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setDestination('Hà Nội'); handleDestinationSubmit('Hà Nội'); }}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-all"
              >
                🏛️ Hà Nội
              </button>
              <button
                onClick={() => { setDestination('Đà Nẵng'); handleDestinationSubmit('Đà Nẵng'); }}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-all"
              >
                🏖️ Đà Nẵng
              </button>
              <button
                onClick={() => { setDestination('TP.HCM'); handleDestinationSubmit('TP.HCM'); }}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-all"
              >
                🌆 TP.HCM
              </button>
              <button
                onClick={() => { setDestination('Hội An'); handleDestinationSubmit('Hội An'); }}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-all"
              >
                🏮 Hội An
              </button>
              <button
                onClick={() => { setDestination('Nha Trang'); handleDestinationSubmit('Nha Trang'); }}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-all"
              >
                🌊 Nha Trang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}