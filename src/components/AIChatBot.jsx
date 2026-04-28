import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAll, search as searchDB, getById } from "../services/restaurantService";
import { getByRestaurant as getMenusByRestaurant } from "../services/menuService";
import { cuisineMap } from "../data/mockFilters";
import botAvatar from "../assets/chatbot.png";

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const BOT_AVATAR = botAvatar;

export default function AIChatBot() {
  const location = useLocation();

  // /restaurant/:id 페이지 감지
  const restaurantMatch = location.pathname.match(/^\/restaurant\/(\d+)/);
  const currentRestaurantId = restaurantMatch ? Number(restaurantMatch[1]) : null;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "안녕하세요! 근처 맛집 정보를 알려드립니다. 무엇을 찾으시나요? 🍽️",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || "";
  const [userLocation, setUserLocation] = useState(null);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [currentMenus, setCurrentMenus] = useState([]);
  // ref로 최신 값을 항상 동기적으로 참조 (closure stale 방지)
  const currentRestaurantRef = useRef(null);
  const currentMenusRef = useRef([]);
  const messagesContainerRef = useRef(null);
  const chatContainerRef = useRef(null);

  const suggestions = currentRestaurantId
    ? ["메뉴 목록 보여줘", "가성비 좋은 메뉴는?", "인기 메뉴 추천해줘", "오늘 뭐 먹을까?"]
    : ["근처 맛집 추천해줘", "가성비 좋은 곳 어디야?", "혼밥하기 좋은 곳", "오늘 점심 뭐 먹을까?"];

  const formatBotMessage = (text) => {
    if (!text) return "";
    // Add line breaks before numbered list items for better readability.
    return text
      .replace(/(\S)\s+(\d+\.\s+\*\*)/g, "$1\n$2")
      .replace(/(\*\*:)\s*/g, "$1 ");
  };

  const renderBotMessage = (text) => {
    const formatted = formatBotMessage(text);
    const parts = formatted.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }
      return <span key={`${part}-${index}`}>{part}</span>;
    });
  };

  const isMenuListRequest = (text) => {
    const patterns = [
      "메뉴 리스트", "메뉴리스트",
      "메뉴 목록", "메뉴목록",
      "전체 메뉴", "메뉴 전체",
      "메뉴 보여", "메뉴보여",
      "메뉴 알려줘", "메뉴 보고 싶",
      "메뉴 뭐", "무슨 메뉴", "어떤 메뉴",
      "메뉴 있어", "메뉴 종류",
    ];
    return patterns.some((p) => text.includes(p));
  };

  const extractRestaurantNameFromQuery = (text) => {
    const markers = [
      "전체 메뉴", "메뉴 리스트", "메뉴리스트", "메뉴 목록", "메뉴목록",
      "메뉴 보여", "메뉴보여", "메뉴 알려줘", "메뉴 보고 싶",
      "메뉴 뭐", "무슨 메뉴", "어떤 메뉴", "메뉴 있어", "메뉴 종류", "메뉴",
    ];
    let idx = -1;
    for (const marker of markers) {
      const pos = text.indexOf(marker);
      if (pos !== -1 && (idx === -1 || pos < idx)) idx = pos;
    }
    if (idx <= 0) return "";
    return text
      .substring(0, idx)
      .replace(/^(근처|여기|이\s*근처|주변의?|이\s*동네)\s*/g, "")
      .replace(/\s*(의|을|를|은|는|이|가)\s*$/, "")
      .trim();
  };

  const renderMenuCard = (msg) => (
    <div className="w-full min-w-[220px]">
      <p className="text-sm text-slate-600 mb-3 leading-relaxed">{renderBotMessage(msg.text)}</p>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
        {msg.menus.map((m) => (
          <div key={m.id} className="flex justify-between items-center px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
            <span className="text-sm font-medium text-slate-800">{m.name}</span>
            <span className="text-sm font-bold text-[#FF5722] ml-4 flex-shrink-0">
              {m.price.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // 식당 페이지일 때 식당 정보 + 메뉴 로드
  useEffect(() => {
    if (!currentRestaurantId) {
      setCurrentRestaurant(null);
      setCurrentMenus([]);
      return;
    }
    Promise.all([
      getById(currentRestaurantId),
      getMenusByRestaurant(currentRestaurantId),
    ]).then(([restaurant, menus]) => {
      setCurrentRestaurant(restaurant);
      setCurrentMenus(menus);
      currentRestaurantRef.current = restaurant;
      currentMenusRef.current = menus;
      setMessages([{
        id: 1,
        from: "bot",
        text: `**${restaurant.name}**에 오신 걸 환영해요! 메뉴 추천이나 궁금한 점을 물어보세요 🍽️`,
      }]);
    }).catch(() => {});
  }, [currentRestaurantId]);

  // 사용자 위치 가져오기
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("위치 접근 거부 또는 오류:", error);
          // 위치 없이도 동작 가능
        },
      );
    }
  }, []);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || isLoading) return;

    const key = apiKey.trim();
    if (!key) return;

    const userMessage = { id: Date.now(), from: "user", text: userMsg };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      // 식당 상세 페이지: 메뉴 기반 추천 (ref로 최신 데이터 참조)
      const restaurant = currentRestaurantRef.current;
      const menus = currentMenusRef.current;

      if (currentRestaurantId && restaurant) {
        if (isMenuListRequest(userMsg)) {
          const botMsg = menus.length > 0
            ? { id: Date.now() + 1, from: "bot", type: "menu", menus, text: `**${restaurant.name}**의 전체 메뉴입니다.` }
            : { id: Date.now() + 1, from: "bot", text: "현재 등록된 메뉴 정보가 없습니다." };
          setMessages((prev) => [...prev, botMsg]);
          return;
        }

        const menuLines = menus.length > 0
          ? menus.map((m) => `${m.name} (${m.price.toLocaleString()}원)`).join("\n")
          : null;

        const systemPrompt = `너는 "${restaurant.name}" 식당의 AI 어시스턴트야. 반드시 한글로만 답변해.

[식당 정보]
- 카테고리: ${cuisineMap[restaurant.cuisine] || restaurant.cuisine || "미분류"}
- 평점: ${restaurant.rating || "정보 없음"}/5.0
- 가격대: ${restaurant.price || "정보 없음"}
- 분위기: ${restaurant.vibes?.join(", ") || "정보 없음"}
- 설명: ${restaurant.description || "정보 없음"}

${menuLines
  ? `[메뉴판 - 반드시 이 목록만 사용할 것]
${menuLines}

규칙:
1. 메뉴 관련 질문에는 위 메뉴판에 있는 항목만 답변해. 목록에 없는 메뉴는 절대 언급하지 마.
2. 메뉴를 소개할 때는 반드시 메뉴명과 가격을 함께 알려줘.
3. 메뉴판에 없는 메뉴를 추천하거나 가격을 지어내지 마.`
  : `[메뉴 정보 없음]
등록된 메뉴가 없어. 메뉴 관련 질문에는 "현재 메뉴 정보가 등록되어 있지 않습니다"라고만 답해.`}`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemPrompt },
              ...nextMessages.slice(1).map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })),
            ],
            temperature: 0.3,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
        const botReply = data?.choices?.[0]?.message?.content?.trim() || "응답을 받아오지 못했어요.";
        setMessages((prev) => [...prev, { id: Date.now() + 1, from: "bot", text: botReply }]);
        return;
      }

      // 일반 페이지: 특정 식당 메뉴 목록 요청
      if (isMenuListRequest(userMsg)) {
        const restaurantName = extractRestaurantNameFromQuery(userMsg);
        if (!restaurantName) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              from: "bot",
              text: "어떤 식당의 메뉴가 궁금하신가요? 식당 이름을 함께 말씀해주세요!\n예: \"맥도날드 메뉴 보여줘\"",
            },
          ]);
          return;
        }
        const searchResults = await searchDB(restaurantName);
        if (searchResults.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              from: "bot",
              text: `"${restaurantName}"에 해당하는 식당을 찾을 수 없어요. 이름을 다시 확인해보세요.`,
            },
          ]);
          return;
        }
        const found = searchResults[0];
        const foundMenus = await getMenusByRestaurant(found.id);
        const botMsg =
          foundMenus.length > 0
            ? { id: Date.now() + 1, from: "bot", type: "menu", menus: foundMenus, text: `**${found.name}**의 전체 메뉴입니다.` }
            : { id: Date.now() + 1, from: "bot", text: `**${found.name}**에 등록된 메뉴 정보가 없습니다.` };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }

      // 일반 페이지: 맛집 검색 기반 추천
      let relevantRestaurants = [];

      if (userLocation) {
        const [keywordResults, allRestaurants] = await Promise.all([
          searchDB(userMsg),
          getAll(),
        ]);
        const nearbyResults = allRestaurants
          .map((r) => ({ ...r, distanceKm: calcDistance(userLocation.lat, userLocation.lng, r.y, r.x) }))
          .filter((r) => r.distanceKm <= 50)
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 10);

        const combined =
          keywordResults.length > 0
            ? keywordResults.map((r) => ({ ...r, distanceKm: calcDistance(userLocation.lat, userLocation.lng, r.y, r.x) }))
            : nearbyResults;
        const seen = new Set();
        relevantRestaurants = combined.filter((r) => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        }).slice(0, 5);
      } else {
        const results = await searchDB(userMsg);
        const seen = new Set();
        relevantRestaurants = results.filter((r) => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        }).slice(0, 5);
      }

      // 맛집 정보를 텍스트로 변환
      const restaurantContext = relevantRestaurants
        .map((r) => {
          const distanceText = r.distanceKm != null
            ? ` (${r.distanceKm.toFixed(1)}km 거리)`
            : "";
          const hoursText = r.hours?.weekday || "영업시간 미제공";

          const cuisineKR = cuisineMap[r.cuisine] || r.cuisine;

          return `**${r.name}**${distanceText} (${cuisineKR})
- 거리: ${r.distanceKm != null ? `${r.distanceKm.toFixed(1)}km` : "위치 정보 없음"}
- 전화: ${r.phone || "전화번호 미제공"}
- 평점: ${r.rating}/5.0
- 가격대: ${r.price}
- 영업시간: ${hoursText}
- 설명: ${r.description}
- 특징: ${r.tags ? r.tags.join(", ") : ""}
- 분위기: ${r.vibes ? r.vibes.join(", ") : ""}`;
        })
        .join("\n\n");

      const systemPrompt =
        relevantRestaurants.length > 0
          ? `너는 Foodiest AI concierge야. 아래는 실제 존재하는 맛집 데이터야. ${userLocation ? "사용자 근처 맛집을 거리순으로 정렬했어." : ""} 사용자의 질문에 맞춰 이 맛집들을 추천하고 설명해줘. 

중요: 반드시 순수한 한글로만 답변해. 한자나 일본어를 절대 사용하지 마. 예: "料理" 대신 "요리", "店" 대신 "집" 사용.

아래 데이터에 있는 정보만 사용하고, 없는 정보는 지어내지 마. 같은 식당을 중복으로 언급하지 마.

=== ${userLocation ? "근처 맛집 정보" : "추천 맛집 정보"} ===
${restaurantContext}

${userLocation ? "거리 정보를 포함해서 가까운 순서대로 추천해줘." : "사용자가 질문한 내용과 가장 관련있는 맛집을 추천해주고, 왜 추천하는지 간단히 설명해줘."} 번호를 매겨서 정리해주면 좋아.`
          : `너는 Foodiest AI concierge야. 맛집 추천과 음식 관련 질문에 대해 순수한 한글로만 친절하고 간결하게 답변해. 한자나 일본어를 사용하지 마. 사용자에게 더 구체적인 정보(지역, 음식 종류 등)를 물어봐.`;

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              ...nextMessages.slice(1).map((message) => ({
                role: message.from === "user" ? "user" : "assistant",
                content: message.text,
              })),
            ],
            temperature: 0.7,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        const apiError =
          data?.error?.message ||
          data?.error?.status ||
          `HTTP ${response.status}`;
        throw new Error(apiError);
      }
      const botReply =
        data?.choices?.[0]?.message?.content?.trim() ||
        "응답을 받아오지 못했어요.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "bot", text: botReply },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: `Groq 오류: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading, isOpen]);

  return (
    <div ref={chatContainerRef} className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-[#FF5722] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white border border-white/30 flex-shrink-0 overflow-hidden">
                <img
                  src={BOT_AVATAR}
                  alt="AI Avatar"
                  className="w-full h-full object-contain"
                  style={{ transform: 'translateY(3px)' }}
                />
              </div>
              <div>
                <p className="font-bold text-sm leading-none">Foodiest AI</p>
                <p className="text-[10px] opacity-80">온라인 • AI 어시스턴트</p>
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
          <div
            ref={messagesContainerRef}
            className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-3"
          >

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.from === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-white border border-orange-200 flex-shrink-0 overflow-hidden">
                    <img
                      src={BOT_AVATAR}
                      alt="bot"
                      className="w-full h-full object-contain"
                      style={{ transform: 'translateY(3px)' }}
                    />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl shadow-sm text-sm ${
                    msg.from === "bot"
                      ? "bg-white rounded-tl-none border border-slate-100 text-slate-800"
                      : "bg-[#FF5722] rounded-tr-none text-white"
                  } ${msg.type === "menu" ? "max-w-[92%] w-full" : "max-w-[80%]"}`}
                >
                  {msg.type === "menu" ? (
                    renderMenuCard(msg)
                  ) : (
                    <span className="whitespace-pre-wrap break-words leading-relaxed">
                      {msg.from === "bot" ? renderBotMessage(msg.text) : msg.text}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FF5722] flex-shrink-0 overflow-hidden">
                  <img
                    src={BOT_AVATAR}
                    alt="bot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-sm bg-white border border-slate-100 text-slate-500">
                  응답 생성 중...
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {messages.length <= 2 && (
              <div className="pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  추천 질문
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i + 1}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-1.5 bg-white border border-orange-200 text-primary font-medium text-xs rounded-full shadow-sm hover:bg-orange-50 transition-all active:scale-95"
                    >
                      {`${i + 1}. ${s}`}
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
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
      {!isOpen && <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden group border border-[#FF5722]"
      >
        <img
          src={BOT_AVATAR}
          alt="Chat"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ transform: 'translateY(8px)' }}
        />
        <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          AI 컨시어지에게 물어보세요
        </span>
      </button>}
    </div>
  );
}
