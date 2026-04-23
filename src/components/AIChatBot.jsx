import { useState } from 'react';

const BOT_AVATAR = "https://lh3.googleusercontent.com/aida/ADBb0uhgdS9Km4YxwB88MNTMHnn4j8G-ASnaNTYMBqJS8ZC8INfRc-LID6Tk2HsUaMWaBsDsTPLDCQAoClGVu1rbQsJcd8AUXQdjzqgK3PCywCqLKcLkTrgyK17BOWvVVZZcoHnQtLt2qU7ldmuCm5o3VGDL9nITIkKeuHO22Eto9eBFFkumX0Y9mihLKPk72ce7Vs_Mgk4n-Hp2GvztFUCqihJNN-TvU0nhIdwD64r83TnBj7WuhIhs_r1DSFhf";

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: '안녕하세요! 어떤 맛집을 찾으시나요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('groq_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(() => !sessionStorage.getItem('groq_api_key'));

  const suggestions = [
    '조용한 카페 추천해줘',
    '근처 최고의 파스타',
    '건강한 점심 옵션',
    '야외 다이닝',
  ];

  const formatBotMessage = text => {
    if (!text) return '';
    // Add line breaks before numbered list items for better readability.
    return text
      .replace(/(\S)\s+(\d+\.\s+\*\*)/g, '$1\n$2')
      .replace(/(\*\*:)\s*/g, '$1 ');
  };

  const renderBotMessage = text => {
    const formatted = formatBotMessage(text);
    const parts = formatted.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }
      return <span key={`${part}-${index}`}>{part}</span>;
    });
  };

  const saveApiKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    sessionStorage.setItem('groq_api_key', trimmed);
    setShowApiKeyInput(false);
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || isLoading) return;

    const key = sessionStorage.getItem('groq_api_key') || apiKey.trim();
    if (!key) {
      setShowApiKeyInput(true);
      return;
    }

    const userMessage = { id: Date.now(), from: 'user', text: userMsg };
    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'user',
              content: '너는 Foodiest AI concierge야. 맛집 추천과 음식 관련 질문에 대해 한국어로 친절하고 간결하게 답변해.',
            },
            ...nextMessages.map(message => ({
              role: message.from === 'user' ? 'user' : 'assistant',
              content: message.text,
            })),
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const apiError =
          data?.error?.message ||
          data?.error?.status ||
          `HTTP ${response.status}`;
        throw new Error(apiError);
      }
      const botReply = data?.choices?.[0]?.message?.content?.trim() || '응답을 받아오지 못했어요.';

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, from: 'bot', text: botReply },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: `Groq 오류: ${errorMessage}`,
        },
      ]);
      if (key !== (sessionStorage.getItem('groq_api_key') || '')) {
        setShowApiKeyInput(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-[#FF5722] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={BOT_AVATAR} alt="AI Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-white/20" />
              <div>
                <p className="font-bold text-sm leading-none">Foodiest AI</p>
                <p className="text-[10px] opacity-80">Online • AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-3">
            {showApiKeyInput && (
              <div className="bg-white border border-orange-200 rounded-xl p-3 shadow-sm">
                <p className="text-xs font-semibold text-slate-700 mb-2">Groq API Key 입력</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                  />
                  <button
                    onClick={saveApiKey}
                    className="px-3 py-2 text-xs bg-[#FF5722] text-white rounded-lg hover:brightness-110"
                  >
                    저장
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">키는 브라우저 세션에만 저장됩니다. (Groq API Key)</p>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.from === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-[#FF5722] flex-shrink-0 overflow-hidden">
                    <img src={BOT_AVATAR} alt="bot" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl shadow-sm max-w-[80%] text-sm ${
                    msg.from === 'bot'
                      ? 'bg-white rounded-tl-none border border-slate-100 text-slate-800'
                      : 'bg-[#FF5722] rounded-tr-none text-white'
                  }`}
                >
                  <span className="whitespace-pre-wrap break-words leading-relaxed">
                    {msg.from === 'bot' ? renderBotMessage(msg.text) : msg.text}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FF5722] flex-shrink-0 overflow-hidden">
                  <img src={BOT_AVATAR} alt="bot" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-sm bg-white border border-slate-100 text-slate-500">
                  응답 생성 중...
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {messages.length <= 2 && (
              <div className="pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">추천 질문</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-1.5 bg-white border border-orange-200 text-primary font-medium text-xs rounded-full shadow-sm hover:bg-orange-50 transition-all active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-2.5 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-[#FF5722] focus:border-transparent text-sm"
                placeholder="메시지를 입력하세요..."
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading}
                className="absolute right-2 text-[#FF5722] hover:scale-110 transition-transform"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 bg-[#FF5722] rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden group"
      >
        <img src={BOT_AVATAR} alt="Chat" className="w-full h-full object-cover" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
        <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          AI 컨시어지에게 물어보세요
        </span>
      </button>
    </div>
  );
}
