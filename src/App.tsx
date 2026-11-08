import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, AlertTriangle, CloudSun, User, Wallet, Sparkles, Send, 
  Plus, Check, ChevronLeft, ArrowRight, BookOpen, Volume2, 
  HelpCircle, Wifi, WifiOff, Bell, ArrowUpRight, CheckCircle2, 
  Info, Award, ExternalLink, Moon, Settings, Zap, Compass, RefreshCw
} from "lucide-react";
import { AppState, Goal, AlertItem, CommunityReport } from "./types";
import { initialAppState, learningArticles, LearningArticle } from "./data";
import { translations } from "./translations";

export default function App() {
  const [state, setState] = useState<AppState>(initialAppState);

  const currentLang = (state.user.language as keyof typeof translations) || "English";
  const t = (key: keyof typeof translations["English"]): string => {
    const dict = translations[currentLang] || translations["English"];
    return dict[key] || translations["English"][key];
  };

  const getLocalizedAlertTitle = (title: string) => {
    if (title.includes("Flood Alert")) return t("floodAlert");
    if (title.includes("Drought Watch")) return t("droughtWatch");
    return title;
  };

  const getLocalizedAlertDesc = (desc: string) => {
    if (desc.includes("Heavy rainfall")) return t("floodAlertDesc");
    if (desc.includes("Below-average rainfall")) return t("droughtWatchDesc");
    return desc;
  };

  const getLocalizedAlertRec = (rec: string) => {
    if (rec.includes("Allocate ₦30,000")) return t("floodAlertRec");
    if (rec.includes("Begin Drought Protection")) return t("droughtWatchRec");
    return rec;
  };

  const getLocalizedReportType = (type: string) => {
    if (type.toLowerCase() === "flooding") return t("floodingType");
    if (type.toLowerCase().includes("crop disease")) return t("cropDiseaseType");
    return type;
  };

  const getLocalizedReportDesc = (desc: string) => {
    if (desc.includes("Flooding near Eket")) return t("report1Desc");
    if (desc.includes("Cassava mosaic")) return t("report2Desc");
    return desc;
  };

  const getLocalizedArticleTitle = (title: string) => {
    if (title.toLowerCase().includes("flood preparedness")) return t("floodPrepTitle");
    if (title.toLowerCase().includes("drought resilience")) return t("droughtTacticsTitle");
    return title;
  };

  const getLocalizedArticleCat = (cat: string) => {
    if (cat.toLowerCase().includes("emergency planning")) return t("emergencyPlanningCat");
    if (cat.toLowerCase().includes("water stewardship")) return t("waterStewardshipCat");
    return cat;
  };

  const getLocalizedReadTime = (time: string) => {
    if (time.includes("5 min")) return `5 ${t("minRead")}`;
    if (time.includes("4 min")) return `4 ${t("minRead")}`;
    return time;
  };

  const getLocalizedRelatedAlertText = (txt: string | undefined) => {
    if (!txt) return "";
    if (txt.includes("Active Flood alert")) return t("activeFloodAlertMitigate");
    return txt;
  };

  const mapRiskLevelToKey = (level: string) => {
    if (level.toLowerCase().includes("high")) return "highRisk";
    if (level.toLowerCase().includes("medium")) return "mediumRisk";
    return "lowRisk";
  };

  const [currentScreen, setCurrentScreen] = useState<string>("screen-splash");
  const [screenHistory, setScreenHistory] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<LearningArticle | null>(null);
  
  // Form States
  const [signupForm, setSignupForm] = useState({
    name: "Emeka Okonkwo",
    location: "Akwa Ibom",
    farmType: "Cassava & Yam",
    farmSize: "2 acres",
    phone: "+234 801 234 5678",
    language: "English"
  });

  const [climateTab, setClimateTab] = useState<"forecast" | "alerts" | "reports" | "learn">("forecast");
  const [vaultFilter, setVaultFilter] = useState<string>("All");

  // Report Event Form
  const [reportForm, setReportForm] = useState({
    type: "Flooding",
    icon: "🩸",
    severity: "Moderate",
    description: "",
    location: "Akwa Ibom"
  });

  // Add Funds Form
  const [addFundsAmount, setAddFundsAmount] = useState<string>("");

  // New Goal Form
  const [newGoalForm, setNewGoalForm] = useState({
    name: "",
    target: "",
    category: "Emergency",
    linkToAlerts: true
  });

  // AI Advisor state
  const [advisorInput, setAdvisorInput] = useState<string>("");
  const [isAdvisorTyping, setIsAdvisorTyping] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Splash timeout
  useEffect(() => {
    if (currentScreen === "screen-splash") {
      const timer = setTimeout(() => {
        navigateTo("screen-onboarding-1");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Scroll Chat to bottom
  useEffect(() => {
    if (currentScreen === "screen-advisor" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.advisor.messages, currentScreen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const navigateTo = (screenId: string) => {
    setScreenHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screenId);
  };

  const handleBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory(prev => prev.slice(0, prev.length - 1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen("screen-home");
    }
  };

  const toggleConnectivity = () => {
    setState(prev => {
      const isOnlineNext = !prev.connectivity.online;
      let toast = isOnlineNext ? "📶 App is Online. Real-time OPay sync enabled." : "📴 App is Offline. Offline Transaction Queue active.";
      showToast(toast);
      return {
        ...prev,
        connectivity: {
          ...prev.connectivity,
          online: isOnlineNext,
          pendingTransfer: isOnlineNext ? prev.connectivity.pendingTransfer : false
        }
      };
    });
  };

  const resolvePendingTransfer = () => {
    if (!state.connectivity.online) {
      showToast("📴 Reconnect to the OPay cellular network to execute transfers.");
      return;
    }
    
    // Auto-allocate pending transfer
    const pendingAmount = state.connectivity.pendingAmount;
    const targetFund = state.connectivity.pendingFund;
    
    setState(prev => {
      const updatedGoals = prev.vault.goals.map(g => {
        if (g.name === targetFund) {
          const newSaved = g.saved + pendingAmount;
          return {
            ...g,
            saved: newSaved,
            complete: newSaved >= g.target
          };
        }
        return g;
      });

      const totalSaved = updatedGoals.reduce((sum, g) => sum + g.saved, 0);
      const totalTarget = updatedGoals.reduce((sum, g) => sum + g.target, 0);
      const fundedPercent = Math.round((totalSaved / totalTarget) * 100);

      return {
        ...prev,
        vault: {
          ...prev.vault,
          goals: updatedGoals,
          totalSaved,
          fundedPercent
        },
        connectivity: {
          ...prev.connectivity,
          pendingTransfer: false
        }
      };
    });

    showToast(`✅ Successfully synced pending transaction. ₦${pendingAmount.toLocaleString()} allocated to ${targetFund}!`);
    navigateTo("screen-vault");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        name: signupForm.name,
        location: signupForm.location,
        farmType: signupForm.farmType,
        farmSize: signupForm.farmSize,
        phone: signupForm.phone,
        language: signupForm.language,
        initials: signupForm.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
      }
    }));
    showToast("✨ Account ClimaVault connected with OPay!");
    navigateTo("screen-home");
  };

  const handleAllocateNow = (alert: AlertItem) => {
    setSelectedAlert(alert);
    navigateTo("screen-allocation-confirm");
  };

  const confirmAllocation = () => {
    if (!selectedAlert) return;

    if (!state.connectivity.online) {
      // offline queue
      showToast("📴 No internet connection. OPay transfer queued for next signal.");
      setState(prev => ({
        ...prev,
        connectivity: {
          ...prev.connectivity,
          pendingTransfer: true,
          pendingAmount: selectedAlert.amount,
          pendingFund: selectedAlert.fund
        }
      }));
      navigateTo("screen-home");
      return;
    }

    // Online execution
    setState(prev => {
      const updatedGoals = prev.vault.goals.map(g => {
        if (g.name === selectedAlert.fund) {
          const newSaved = g.saved + selectedAlert.amount;
          return {
            ...g,
            saved: Math.min(newSaved, g.target),
            complete: newSaved >= g.target
          };
        }
        return g;
      });

      const totalSaved = updatedGoals.reduce((sum, g) => sum + g.saved, 0);
      const totalTarget = updatedGoals.reduce((sum, g) => sum + g.target, 0);
      const fundedPercent = Math.round((totalSaved / totalTarget) * 100);

      return {
        ...prev,
        vault: {
          ...prev.vault,
          goals: updatedGoals,
          totalSaved,
          fundedPercent
        }
      };
    });

    navigateTo("screen-allocation-success");
  };

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: CommunityReport = {
      id: state.communityReports.length + 1,
      type: reportForm.type,
      icon: reportForm.icon,
      location: `${reportForm.location}, Nigeria`,
      description: reportForm.description || `Reported ${reportForm.type} event in ${reportForm.location}.`,
      reporter: `${state.user.name.split(" ")[0]} ${state.user.name.split(" ")[1]?.charAt(0) || "O"}.`,
      time: "Just now",
      verified: 1,
      status: reportForm.severity === "Severe" ? "WARNING" : "WATCH"
    };

    setState(prev => ({
      ...prev,
      communityReports: [newReport, ...prev.communityReports]
    }));

    showToast("✅ Report submitted. 4 more verifications needed for Warning Status.");
    setClimateTab("reports");
    navigateTo("screen-climate");
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addFundsAmount);
    if (isNaN(amount) || amount <= 0 || !selectedGoal) return;

    if (!state.connectivity.online) {
      showToast("📴 Offline. Transaction queued in OPay SmartSync.");
      setState(prev => ({
        ...prev,
        connectivity: {
          ...prev.connectivity,
          pendingTransfer: true,
          pendingAmount: amount,
          pendingFund: selectedGoal.name
        }
      }));
      navigateTo("screen-vault");
      return;
    }

    setState(prev => {
      const updatedGoals = prev.vault.goals.map(g => {
        if (g.id === selectedGoal.id) {
          const newSaved = g.saved + amount;
          return {
            ...g,
            saved: newSaved,
            complete: newSaved >= g.target
          };
        }
        return g;
      });

      const totalSaved = updatedGoals.reduce((sum, g) => sum + g.saved, 0);
      const totalTarget = updatedGoals.reduce((sum, g) => sum + g.target, 0);
      const fundedPercent = Math.round((totalSaved / totalTarget) * 100);

      return {
        ...prev,
        vault: {
          ...prev.vault,
          goals: updatedGoals,
          totalSaved,
          fundedPercent
        }
      };
    });

    showToast(`✅ Allocated ₦${amount.toLocaleString()} via OPay to ${selectedGoal.name}!`);
    setAddFundsAmount("");
    navigateTo("screen-vault");
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(newGoalForm.target);
    if (!newGoalForm.name || isNaN(targetVal) || targetVal <= 0) return;

    const newGoal: Goal = {
      id: state.vault.goals.length + 1,
      name: newGoalForm.name,
      icon: newGoalForm.category === "Emergency" ? "🔴" : 
            newGoalForm.category === "Farm" ? "🌿" : 
            newGoalForm.category === "Livestock" ? "🐾" : "🎓",
      saved: 0,
      target: targetVal,
      category: newGoalForm.category,
      climate: newGoalForm.linkToAlerts,
      complete: false
    };

    setState(prev => {
      const updatedGoals = [...prev.vault.goals, newGoal];
      const totalTarget = updatedGoals.reduce((sum, g) => sum + g.target, 0);
      const totalSaved = updatedGoals.reduce((sum, g) => sum + g.saved, 0);
      const fundedPercent = Math.round((totalSaved / totalTarget) * 100);

      return {
        ...prev,
        vault: {
          ...prev.vault,
          goals: updatedGoals,
          totalTarget,
          fundedPercent
        }
      };
    });

    showToast(`✨ Created Goal: ${newGoal.name}`);
    setNewGoalForm({ name: "", target: "", category: "Emergency", linkToAlerts: true });
    navigateTo("screen-vault");
  };

  const activateInsurance = (company: string, cost: number) => {
    showToast(`✅ Successfully registered for ${company} Insurance!`);
    setState(prev => {
      const costAmount = cost;
      return {
        ...prev,
        vault: {
          ...prev.vault,
          totalSaved: Math.max(0, prev.vault.totalSaved - costAmount)
        }
      };
    });
  };

  const sendAdvisorMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add message to chat list
    setState(prev => ({
      ...prev,
      advisor: {
        ...prev.advisor,
        messages: [...prev.advisor.messages, userMsg]
      }
    }));
    setAdvisorInput("");
    setIsAdvisorTyping(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: state.advisor.messages,
          user: state.user,
          climate: state.climate,
          vault: state.vault,
          alerts: state.alerts
        })
      });

      const data = await response.json();
      
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: data.text || "I'm having a small signal interruption but remember to review your Flood Recovery fund to stay safe on OPay.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setState(prev => ({
        ...prev,
        advisor: {
          ...prev.advisor,
          messages: [...prev.advisor.messages, assistantMsg]
        }
      }));
    } catch (err) {
      console.error("Failed to connect to advisor server API", err);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "I'm working in offline-cached mode due to cellular signal drop. Based on your 2-acre farm in Akwa Ibom, we recommend keeping your Flood Recovery Fund at 100% capacity (₦30,000) using OPay to secure rapid post-flood recovery. Let's aim to allocate ₦15,000 more when signal returns.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setState(prev => ({
        ...prev,
        advisor: {
          ...prev.advisor,
          messages: [...prev.advisor.messages, assistantMsg]
        }
      }));
    } finally {
      setIsAdvisorTyping(false);
    }
  };

  // Seed initial welcome message
  useEffect(() => {
    if (state.advisor.messages.length === 0) {
      setState(prev => ({
        ...prev,
        advisor: {
          messages: [{
            id: "welcome-init",
            role: "assistant",
            content: `Hello ${state.user.name}! I'm your ClimaVault AI Advisor, powered by climate intelligence for ${state.user.location}. I can help you with farm planning, financial preparedness, crop recommendations, and disaster recovery. What would you like to know today?`,
            timestamp: "06:00 AM"
          }]
        }
      }));
    }
  }, [state.user.name, state.user.location]);

  // Read learning article helper
  const handleReadArticle = (article: LearningArticle) => {
    setSelectedArticle(article);
    navigateTo("screen-learn-article");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center p-0 md:py-8 font-sans text-neutral-800 antialiased overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* Phone container wrapper with high-fidelity realistic bezel shadow */}
      <div className="w-full max-w-[390px] h-[844px] bg-neutral-50 relative shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden md:rounded-[40px] border border-neutral-800/10 ring-12 ring-neutral-950/80">
        
        {/* Status Bar - Clean and realistic iOS/Android header */}
        <div className="bg-neutral-950 text-neutral-400 text-[10px] font-mono py-1.5 px-4 flex items-center justify-between select-none border-b border-neutral-900 shrink-0 z-50">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold tracking-tight text-neutral-305 text-neutral-300">06:23</span>
            <span className="text-neutral-700">•</span>
            <span className="text-neutral-500 text-[9px]">GMT</span>
          </div>
          <div className="w-16 h-3.5 bg-black rounded-full border border-neutral-900 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-1.5 font-sans text-[9px] font-bold">
            {state.connectivity.online ? (
              <span className="text-emerald-400 tracking-tighter">4G 📶</span>
            ) : (
              <span className="text-orange-400 tracking-tighter">NO SIGNAL ⚠️</span>
            )}
            <span className="text-neutral-300">88% 🔋</span>
          </div>
        </div>

        {/* Connection status banner helper - beautifully custom designed banner */}
        <div className={`text-[10px] font-sans font-medium tracking-wide py-1.5 px-3 flex items-center justify-between transition-all duration-300 border-b ${state.connectivity.online ? "bg-emerald-950 text-emerald-300 border-emerald-900" : "bg-orange-950 text-orange-300 border-orange-900"}`}>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${state.connectivity.online ? "bg-emerald-400 animate-ping" : "bg-orange-400"}`}></span>
            <span>{state.connectivity.online ? "OPay SmartSync Active — Signals High" : "Offline Cache Engaged — Local Database"}</span>
          </div>
          <span className="text-[8px] font-mono opacity-8 tracking-widest uppercase bg-black/30 px-1.5 py-0.5 rounded border border-white/5">
            {state.connectivity.online ? "Connected" : "Offline"}
          </span>
        </div>

        {/* Floating toast notification support with elegant glassy feedback */}
        {toastMessage && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-neutral-950/95 backdrop-blur-md text-neutral-100 text-[11px] px-3.5 py-3 rounded-2xl shadow-xl border border-neutral-800/10 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/25">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="flex-1 font-medium">{toastMessage}</p>
          </div>
        )}

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto pb-[64px]">
          
          {/* ================== SCREEN 1: SPLASH ================== */}
          {currentScreen === "screen-splash" && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#091F18] via-[#020D09] to-[#010604] z-40 flex flex-col items-center justify-between py-14 px-6 text-center text-white animate-fade-in">
              <div className="absolute inset-0 bg-radial-[circle_at_center] from-emerald-900/15 to-transparent opacity-60 pointer-events-none"></div>
              
              <div className="my-auto flex flex-col items-center gap-5 relative z-10 w-full">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center border border-emerald-300/20 shadow-[0_12px_40px_-4px_rgba(16,185,129,0.3)] select-none">
                  {/* Cloud + Lightning SVG Icon */}
                  <svg className="w-11 h-11 text-emerald-100 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-1.76-3.81-4-4.5-2.67-.82-5.14.88-5.5 3.5a5.5 5.5 0 0 0 .5 10.5"/>
                    <path d="m11.5 13-3 4h5l-3 4"/>
                  </svg>
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-4xl font-display font-black tracking-tight text-white leading-none" data-i18n="appName">
                    Clima<span className="text-emerald-400">Vault</span>
                  </h1>
                  <p className="text-emerald-500/80 font-mono text-[9px] font-bold uppercase tracking-widest leading-none" data-i18n="resiliencyNode">
                    {t("resiliencyNode")}
                  </p>
                </div>
                
                <div className="h-[2px] w-8 bg-emerald-500/30 rounded-full my-1"></div>
                
                <p className="text-emerald-200/80 text-[13px] font-light leading-relaxed max-w-[260px]" data-i18n="hubAndReserve">
                  {t("hubAndReserve")}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-5 w-full relative z-10">
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-wider uppercase text-emerald-300 backdrop-blur-sm" data-i18n="poweredByGoogle">
                  {t("poweredByGoogle")}
                </span>
                <div className="space-y-0.5 text-center">
                  <p className="text-emerald-600 font-mono text-[9px] tracking-widest uppercase font-bold" data-i18n="innovChallenge">{t("innovChallenge")}</p>
                  <p className="text-[8px] text-neutral-700 font-bold uppercase tracking-wide font-mono" data-i18n="buildAlpha">{t("buildAlpha")}</p>
                </div>
              </div>
            </div>
          )}

          {/* ================== SCREEN 2: ONBOARDING SLIDE 1 ================== */}
          {currentScreen === "screen-onboarding-1" && (
            <div className="h-full flex flex-col justify-between py-12 px-6 text-center animate-fade-in bg-[#FAFAFA]">
              <div className="my-auto flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-emerald-100/40 border border-emerald-100 flex items-center justify-center text-5xl shadow-sm animate-pulse-slow">
                  ⛈️
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold tracking-widest uppercase px-2.5 py-1 rounded-full font-mono" data-i18n="onboarding1Badge">
                    {t("onboarding1Badge")}
                  </span>
                  <h2 className="text-3xl font-display font-black text-neutral-900 tracking-tight leading-none pt-1" data-i18n="onboarding1Title">
                    {t("onboarding1Title")}
                  </h2>
                </div>
                <p className="text-neutral-500 text-[13px] leading-relaxed max-w-[290px]" data-i18n="onboarding1Desc">
                  {t("onboarding1Desc")}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-2 rounded-full bg-emerald-800 transition-all"></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-200"></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-200"></span>
                </div>
                <button 
                  onClick={() => navigateTo("screen-onboarding-2")} 
                  className="w-full bg-neutral-900 hover:bg-neutral-950 text-white font-bold text-xs tracking-wide py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-98"
                  data-i18n="onboardingNext"
                >
                  {t("onboardingNext")} <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          )}

          {/* ================== SCREEN 3: ONBOARDING SLIDE 2 ================== */}
          {currentScreen === "screen-onboarding-2" && (
            <div className="h-full flex flex-col justify-between py-12 px-6 text-center animate-fade-in bg-[#FAFAFA]">
              <div className="my-auto flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-emerald-100/40 border border-emerald-100 flex items-center justify-center text-5xl shadow-sm">
                  💸
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold tracking-widest uppercase px-2.5 py-1 rounded-full font-mono" data-i18n="onboarding2Badge">
                    {t("onboarding2Badge")}
                  </span>
                  <h2 className="text-3xl font-display font-black text-neutral-900 tracking-tight leading-none pt-1" data-i18n="onboarding2Title">
                    {t("onboarding2Title")}
                  </h2>
                </div>
                <p className="text-neutral-500 text-[13px] leading-relaxed max-w-[290px]" data-i18n="onboarding2Desc">
                  {t("onboarding2Desc")}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-200"></span>
                  <span className="w-5 h-2 rounded-full bg-emerald-800 transition-all"></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-200"></span>
                </div>
                <button 
                  onClick={() => navigateTo("screen-onboarding-3")} 
                  className="w-full bg-neutral-900 hover:bg-neutral-950 text-white font-bold text-xs tracking-wide py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-98"
                  data-i18n="onboardingNext"
                >
                  {t("onboardingNext")} <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          )}

          {/* ================== SCREEN 4: ONBOARDING SLIDE 3 ================== */}
          {currentScreen === "screen-onboarding-3" && (
            <div className="h-full flex flex-col justify-between py-12 px-6 text-center animate-fade-in bg-[#FAFAFA]">
              <div className="my-auto flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-emerald-100/40 border border-emerald-100 flex items-center justify-center text-5xl shadow-sm">
                  🤝
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold tracking-widest uppercase px-2.5 py-1 rounded-full font-mono" data-i18n="onboarding3Badge">
                    {t("onboarding3Badge")}
                  </span>
                  <h2 className="text-3xl font-display font-black text-neutral-900 tracking-tight leading-none pt-1" data-i18n="onboarding3Title">
                    {t("onboarding3Title")}
                  </h2>
                </div>
                <p className="text-neutral-500 text-[13px] leading-relaxed max-w-[290px]" data-i18n="onboarding3Desc">
                  {t("onboarding3Desc")}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-200"></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-200"></span>
                  <span className="w-5 h-2 rounded-full bg-emerald-800 transition-all"></span>
                </div>
                <button 
                  onClick={() => navigateTo("screen-signup")} 
                  className="w-full bg-gradient-to-r from-emerald-800 to-emerald-900 text-white font-bold text-xs tracking-wider py-4 px-6 rounded-xl shadow-lg hover:from-emerald-900 hover:to-emerald-950 transition transform active:scale-98"
                  data-i18n="onboardingStart"
                >
                  {t("onboardingStart")}
                </button>
              </div>
            </div>
          )}

          {/* ================== SCREEN 5: SIGN UP ================== */}
          {currentScreen === "screen-signup" && (
            <div className="animate-fade-in bg-neutral-50 min-h-full">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-5 py-4 sticky top-0 flex items-center gap-3 border-b border-emerald-800/20 z-10 shadow-sm">
                <button onClick={handleBack} className="p-1.5 hover:bg-white/10 rounded-xl transition active:scale-95">
                  <ChevronLeft className="w-5 h-5 text-emerald-300" />
                </button>
                <div className="flex-1">
                  <h3 className="font-display font-black text-lg tracking-tight" data-i18n="createAccount">{t("createAccount")}</h3>
                  <p className="text-[9px] text-emerald-300/80 font-mono font-bold tracking-widest uppercase" data-i18n="secOpay">{t("secOpay")}</p>
                </div>
              </div>
 
              <form onSubmit={handleSignup} className="p-4 space-y-4 font-sans">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/50 space-y-3.5">
                  <h4 className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase font-mono" data-i18n="farmerId">{t("farmerId")}</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider" data-i18n="fullName">{t("fullName")}</label>
                    <input 
                      type="text" 
                      required
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                      className="w-full text-xs px-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:border-emerald-600 transition"
                      placeholder="e.g. Babajide Ibrahim"
                    />
                  </div>
 
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider" data-i18n="phoneNum">{t("phoneNum")}</label>
                    <input 
                      type="tel" 
                      required
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                      placeholder="+234 801 234 5678"
                      className="w-full text-xs px-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:border-emerald-600 transition"
                    />
                  </div>
                </div>
 
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/50 space-y-3.5">
                  <h4 className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase font-mono" data-i18n="farmProfileheading">{t("farmProfileHeading")}</h4>
                  
                  <div className="grid grid-cols-2 gap-35 grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider" data-i18n="location">{t("location")}</label>
                      <select 
                        value={signupForm.location}
                        onChange={(e) => setSignupForm({...signupForm, location: e.target.value})}
                        className="w-full text-xs px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:border-emerald-600 transition"
                      >
                        <option>Akwa Ibom</option>
                        <option>Kano</option>
                        <option>Oyo</option>
                        <option>Ogun</option>
                        <option>Lagos</option>
                        <option>Niger Delta</option>
                        <option>Kogi</option>
                        <option>Kaduna</option>
                      </select>
                    </div>
 
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider" data-i18n="primaryCrop">{t("primaryCrop")}</label>
                      <select 
                        value={signupForm.farmType}
                        onChange={(e) => setSignupForm({...signupForm, farmType: e.target.value})}
                        className="w-full text-xs px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:border-emerald-600 transition"
                      >
                        <option>Cassava & Yam</option>
                        <option>Maize & Soybean</option>
                        <option>Rice Only</option>
                        <option>Millet & Sorghum</option>
                        <option>Mixed Crops</option>
                        <option>Livestock Only</option>
                      </select>
                    </div>
                  </div>
 
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider" data-i18n="farmSizeText">{t("farmSizeText")}</label>
                      <select 
                        value={signupForm.farmSize}
                        onChange={(e) => setSignupForm({...signupForm, farmSize: e.target.value})}
                        className="w-full text-xs px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:border-emerald-600 transition"
                      >
                        <option>Less than 1 acre</option>
                        <option>1-2 acres</option>
                        <option>3-5 acres</option>
                        <option>5+ acres</option>
                      </select>
                    </div>
 
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider" data-i18n="languageSelect">{t("languageSelect")}</label>
                      <select 
                        value={signupForm.language}
                        onChange={(e) => setSignupForm({...signupForm, language: e.target.value})}
                        className="w-full text-xs px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:border-emerald-600 transition"
                      >
                        <option>English</option>
                        <option>Hausa</option>
                        <option>Yoruba</option>
                        <option>Igbo</option>
                        <option>Ibibio</option>
                      </select>
                    </div>
                  </div>
                </div>
 
                <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-150 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Wallet className="w-4.5 h-4.5 text-blue-700" />
                      <h4 className="text-[10px] font-bold tracking-wider uppercase font-mono" data-i18n="opayBalanceSync">{t("opayBalanceSync")}</h4>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-8 h-4.5 bg-blue-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all"></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed" data-i18n="opaySyncDesc">
                    {t("opaySyncDesc")}
                  </p>
                  <div className="flex items-center gap-1.5 text-[8px] text-blue-900 font-mono font-bold tracking-wider opacity-80 uppercase pt-0.5" data-i18n="cbnCompliant">
                    {t("cbnCompliant")}
                  </div>
                </div>
 
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-800 to-emerald-950 text-white font-bold py-3.5 px-6 rounded-xl hover:from-emerald-900 hover:to-black shadow-md text-xs tracking-wider transition active:scale-98 mt-2 flex items-center justify-center gap-2"
                  data-i18n="createMyVaultBtn"
                >
                  {t("createMyVaultBtn")}
                </button>
                
                <p className="text-center text-xs text-neutral-500 mt-2 font-medium" data-i18n="alreadyRegistered">
                  {t("alreadyRegistered")}
                </p>
              </form>
            </div>
          )}
 
          {/* ================== SCREEN 6: HOME ================== */}
          {currentScreen === "screen-home" && (
            <div className="animate-fade-in space-y-4">
              
              {/* Home Header */}
              <div className="bg-gradient-to-br from-[#06241B] via-[#041D16] to-[#02100C] text-white pt-6 pb-6 px-4 rounded-b-[32px] border-b border-emerald-950 shadow-lg space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-[circle_at_top_right] from-emerald-800/20 to-transparent pointer-events-none"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center font-display font-extrabold text-white tracking-tight border border-emerald-400/20 shadow-[0_4px_16px_rgba(16,185,129,0.15)]">
                      {state.user.initials}
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-450 text-emerald-350/80 font-mono tracking-wider uppercase font-bold" data-i18n={new Date().getHours() < 12 ? "goodMorning" : "goodAfternoon"}>{t(new Date().getHours() < 12 ? "goodMorning" : "goodAfternoon")}</p>
                      <h2 className="font-display font-extrabold text-xl leading-none text-white">{state.user.name}</h2>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigateTo("screen-profile")}
                      className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition relative active:scale-95"
                    >
                      <Bell className="w-4 h-4 text-emerald-300" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-[#06241B] rounded-full"></span>
                    </button>
                  </div>
                </div>
 
                <div className="flex items-center justify-between text-xs text-emerald-300 font-medium relative z-10 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="tracking-tight">{state.user.location} · {state.user.farmType}</span>
                  </div>
                  <span className="text-[9px] tracking-widest uppercase font-mono font-bold bg-emerald-950 border border-emerald-900/40 px-2 py-0.5 rounded-md text-emerald-400">
                    {state.user.farmSize}
                  </span>
                </div>
 
                {/* Risk score panel */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-inner relative z-10">
                  <div className="space-y-1.5">
                    <p className="text-[9px] text-emerald-305 text-emerald-300 font-mono uppercase tracking-widest font-black leading-none" data-i18n="riskClimateFactor">{t("riskClimateFactor")}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-display font-black text-white leading-none">{state.climate.riskScore}%</span>
                      <span className="px-2 py-1 bg-red-950/80 text-red-400 border border-red-900/30 text-[9px] font-mono font-bold rounded-lg uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span> {t(mapRiskLevelToKey(state.climate.riskLevel))}
                      </span>
                    </div>
                    <p className="text-[9px] text-emerald-425 text-emerald-400 font-mono font-bold opacity-80 leading-none" data-i18n="verifiedHubTime">{t("verifiedHubTime")}</p>
                  </div>
                  <Shield className="w-9 h-9 text-emerald-500/20" />
                </div>
              </div>
 
              {/* Offline / Pending Transfer alert section */}
              {state.connectivity.pendingTransfer && (
                <div 
                  onClick={resolvePendingTransfer}
                  className="mx-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3 shadow-sm hover:border-orange-300 transition cursor-pointer"
                >
                  <Wifi className="w-4.5 h-4.5 text-orange-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1 font-sans">
                    <p className="text-xs font-bold text-orange-900" data-i18n="connectionBanner">{t("connectionBanner")}</p>
                    <p className="text-[11px] text-orange-850 text-orange-800 leading-normal font-medium">
                      <span data-i18n="readyToExecute">{t("readyToExecute")}</span>: <span className="font-mono font-bold">₦{state.connectivity.pendingAmount.toLocaleString()}</span> {"→"} {state.connectivity.pendingFund}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                </div>
              )}
 
              {/* Active alerts panel */}
              <div className="px-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-black tracking-widest text-neutral-400 uppercase" data-i18n="activeAlerts">{t("activeAlerts")}</h3>
                  <span className="bg-red-50 text-red-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-red-200">
                    {state.alerts.length} <span data-i18n="activeAlerts">{t("activeAlerts").toUpperCase()}</span>
                  </span>
                </div>
 
                <div className="space-y-3 font-sans">
                  {state.alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`bg-white rounded-2xl border-l-[6px] shadow-sm overflow-hidden border border-neutral-200/50 flex flex-col ${alert.color === "red" ? "border-l-red-650 border-l-red-600" : "border-l-amber-500"}`}
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl shrink-0">{alert.type === "Flood" ? "🌊" : "☀️"}</span>
                            <div>
                              <h4 className="font-display font-extrabold text-sm text-neutral-900 leading-tight">{getLocalizedAlertTitle(alert.title)}</h4>
                              <p className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider">{alert.location}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono font-semibold tracking-wider px-2 py-0.5 rounded-md uppercase ${alert.color === "red" ? "bg-red-50 text-red-700 border border-red-150" : "bg-amber-50 text-amber-700 border border-amber-150"}`} data-i18n={alert.severity === "Severe" || alert.severity === "High" ? "warning" : "watch"}>
                            {alert.severity === "Severe" || alert.severity === "High" ? t("warning") : t("watch")}
                          </span>
                        </div>
 
                        <p className="text-xs text-neutral-600 leading-relaxed font-normal">{alert.description}</p>
                        
                        <div className="p-3 bg-emerald-50/40 rounded-xl space-y-1.5 border border-emerald-100/40">
                          <div className="flex items-center gap-1.5 text-emerald-900">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <p className="text-[10px] font-mono font-extrabold tracking-widest uppercase" data-i18n="geminiActive">{t("geminiActive")}</p>
                          </div>
                          <p className="text-xs text-neutral-700 leading-normal font-medium">{alert.recommendation}</p>
                          <p className="text-[9px] text-neutral-400 font-mono font-bold uppercase">{alert.deadline}</p>
                        </div>
 
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-1 border-b border-neutral-100 font-medium">
                          <span data-i18n="verifiedHubTime">{t("verifiedHubTime")}</span>
                          <span className="font-bold text-neutral-700">{alert.communityReports} Verified Partners</span>
                        </div>
 
                        <button 
                          onClick={() => handleAllocateNow(alert)}
                          className="w-full py-3 bg-neutral-900 hover:bg-neutral-950 text-white text-xs font-mono font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm"
                          data-i18n="allocateNow"
                        >
                          {t("allocateNow")}: ₦{alert.amount.toLocaleString()}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Vault overview card */}
              <div className="mx-4 p-4 bg-white rounded-2xl border border-neutral-200/50 shadow-sm space-y-3.5 font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4.5 h-4.5 text-emerald-800" />
                    <h3 className="font-display font-extrabold text-xs tracking-wider uppercase text-neutral-400" data-i18n="financialEngineMetrics">{t("financialEngineMetrics")}</h3>
                  </div>
                  <button 
                    onClick={() => navigateTo("screen-vault")}
                    className="text-emerald-800 text-xs font-black tracking-wide hover:underline"
                  >
                    <span data-i18n="yourVault">{t("yourVault")}</span> →
                  </button>
                </div>
 
                <div className="space-y-1">
                  <p className="text-3xl font-mono font-black text-neutral-900 leading-none tracking-tight">₦{state.vault.totalSaved.toLocaleString()}</p>
                  <p className="text-[11px] text-neutral-400 font-medium leading-none" data-i18n="totalSavedAcross">{t("totalSavedAcross")} {state.vault.goals.length}</p>
                </div>
 
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-neutral-600 font-medium font-mono">
                    <span>{state.vault.fundedPercent}% <span data-i18n="funded">{t("funded")}</span></span>
                    <span className="font-bold text-neutral-800" data-i18n="yourVault">{t("yourVault")}: ₦{state.vault.totalTarget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden border border-neutral-200/20">
                    <div 
                      className="bg-gradient-to-r from-emerald-600 to-emerald-800 h-2 rounded-full transition-all duration-800"
                      style={{ width: `${state.vault.fundedPercent}%` }}
                    ></div>
                  </div>
                </div>
 
                <div className="pt-2 grid grid-cols-3 gap-2 text-center border-t border-neutral-100">
                  <div className="p-2 bg-neutral-50 rounded-xl">
                    <p className="text-[9px] text-neutral-400 font-semibold font-mono" data-i18n="activeReserves">{t("activeReserves")}</p>
                    <p className="text-xs font-mono font-bold text-neutral-800">₦{state.vault.climateReserves.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-xl">
                    <p className="text-[9px] text-neutral-400 font-semibold font-mono" data-i18n="activeGoals">{t("activeGoals")}</p>
                    <p className="text-xs font-mono font-bold text-neutral-800">{state.vault.activeGoals}</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-xl">
                    <p className="text-[9px] text-neutral-400 font-semibold font-mono" data-i18n="completedText">{t("completedText")}</p>
                    <p className="text-xs font-mono font-bold text-emerald-800">{state.vault.goals.filter(g => g.saved >= g.target).length} <span data-i18n="funded">{t("funded")}</span></p>
                  </div>
                </div>
              </div>
 
              {/* Quick Actions 2x2 grid */}
              <div className="px-4 space-y-3 font-sans pb-4">
                <h3 className="text-xs font-mono font-black tracking-widest text-neutral-400 uppercase" data-i18n="quickActions">{t("quickActions")}</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => navigateTo("screen-report")}
                    className="p-4 bg-white hover:bg-neutral-50 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col items-start gap-2.5 text-left transition active:scale-97 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                      <AlertTriangle className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-neutral-800 leading-tight" data-i18n="reportEvent">{t("reportEvent")}</h4>
                      <p className="text-[10px] text-neutral-400 font-semibold" data-i18n="reportEvent">{t("reportEvent")}</p>
                    </div>
                  </button>
 
                  <button 
                    onClick={() => navigateTo("screen-advisor")}
                    className="p-4 bg-white hover:bg-neutral-50 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col items-start gap-2.5 text-left transition active:scale-97 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-neutral-800 leading-tight" data-i18n="askAdvisor">{t("askAdvisor")}</h4>
                      <p className="text-[10px] text-neutral-400 font-semibold" data-i18n="askAdvisor">{t("askAdvisor")}</p>
                    </div>
                  </button>
 
                  <button 
                    onClick={() => navigateTo("screen-new-goal")}
                    className="p-4 bg-white hover:bg-neutral-50 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col items-start gap-2.5 text-left transition active:scale-97 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                      <Plus className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-neutral-800 leading-tight" data-i18n="newGoal">{t("newGoal")}</h4>
                      <p className="text-[10px] text-neutral-400 font-semibold" data-i18n="newGoal">{t("newGoal")}</p>
                    </div>
                  </button>
 
                  <button 
                    onClick={() => {
                      setClimateTab("learn");
                      navigateTo("screen-climate");
                    }}
                    className="p-4 bg-white hover:bg-neutral-50 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col items-start gap-2.5 text-left transition active:scale-97 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                      <BookOpen className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-neutral-800 leading-tight" data-i18n="learningHub">{t("learningHub")}</h4>
                      <p className="text-[10px] text-neutral-400 font-semibold" data-i18n="learningHub">{t("learningHub")}</p>
                    </div>
                  </button>
                </div>
              </div>
 
            </div>
          )}

          {/* ================== SCREEN 7: ALLOCATION CONFIRM ================== */}
          {currentScreen === "screen-allocation-confirm" && selectedAlert && (
            <div className="animate-fade-in bg-neutral-50 min-h-full font-sans">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-5 py-4 sticky top-0 flex items-center gap-3 border-b border-emerald-850/20 z-10 shadow-sm">
                <button onClick={handleBack} className="p-1.5 hover:bg-white/10 rounded-xl transition active:scale-95">
                  <ChevronLeft className="w-5 h-5 text-emerald-300" />
                </button>
                <div className="flex-1">
                  <h3 className="font-display font-black text-lg tracking-tight" data-i18n="allocateNow">{t("allocateNow")}</h3>
                  <p className="text-[9px] text-emerald-300/80 font-mono font-bold tracking-widest uppercase" data-i18n="resiliencyNode">{t("resiliencyNode")}</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Alert review card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/50 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-red-100 text-red-700 font-mono font-extrabold px-2 py-0.5 rounded-md uppercase border border-red-200">
                      {selectedAlert.severity} Alert
                    </span>
                    <span className="text-neutral-300 font-bold font-mono">/</span>
                    <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold tracking-wide">{selectedAlert.location}</span>
                  </div>
                  <h4 className="font-display font-black text-sm text-neutral-900 leading-snug">{getLocalizedAlertTitle(selectedAlert.title)}</h4>
                  <p className="text-xs text-neutral-605 text-neutral-600 leading-normal">{selectedAlert.description}</p>
                </div>

                {/* Gemini Recommended Breakdown */}
                <div className="bg-gradient-to-br from-[#06241B] via-[#041D16] to-[#02100C] text-white rounded-2xl p-4 shadow-md space-y-3.5 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 relative z-10">
                    <div className="flex items-center gap-1.5 text-emerald-300">
                      <Sparkles className="w-4 h-4 text-emerald-450 text-emerald-400 shrink-0" />
                      <h4 className="text-[10px] font-mono font-black tracking-widest uppercase">GEMINI IA TARGET BREAKDOWN</h4>
                    </div>
                    <span className="text-[8px] font-mono font-bold bg-white/10 text-emerald-300 px-2 py-0.5 rounded uppercase border border-white/5" data-i18n="connectedSwitch">{t("connectedSwitch")}</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-emerald-100/90 font-medium relative z-10 font-sans">
                    <div className="flex justify-between items-center">
                      <span data-i18n="reportEvent">{t("reportEvent")}</span>
                      <span className="font-mono font-bold text-white">₦15,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span data-i18n="howItWorks4">{t("howItWorks4")}</span>
                      <span className="font-mono font-bold text-white">₦10,005</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span data-i18n="climateReserves">{t("climateReserves")}</span>
                      <span className="font-mono font-bold text-white">₦5,000</span>
                    </div>
                    <div className="w-full border-t border-dashed border-white/10 my-2"></div>
                    <div className="flex justify-between items-center text-sm font-display font-black text-white">
                      <span data-i18n="totalSaved">{t("totalSaved")}</span>
                      <span className="font-mono text-base text-emerald-400">₦{selectedAlert.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-black/45 border border-white/5 rounded-xl text-[10px] text-emerald-300/95 leading-relaxed font-sans mt-2 relative z-10" data-i18n="insuranceCollabDesc">
                    🤖 {t("insuranceCollabDesc")}
                  </div>
                </div>

                {/* OPay Execution Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/50 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase" data-i18n="secureOpayLink">{t("secureOpayLink")}</h4>
                    <span className="text-[10px] text-emerald-800 font-bold font-mono">● {t("onlineActive")}</span>
                  </div>

                  <div className="space-y-2 text-xs text-neutral-600 font-medium font-sans">
                    <div className="flex justify-between">
                      <span className="text-neutral-400 font-mono uppercase text-[9px] font-bold" data-i18n="targetAccountLabel">{t("targetAccountLabel")}</span>
                      <span className="font-black text-neutral-800">{selectedAlert.fund}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400 font-mono uppercase text-[9px] font-bold" data-i18n="opayLiquidFundLabel">{t("opayLiquidFundLabel")}</span>
                      <span className="font-mono font-bold text-neutral-800">₦142,000</span>
                    </div>
                    <div className="w-full border-t border-neutral-100 my-1"></div>
                    <div className="flex justify-between text-neutral-900 font-extrabold items-center">
                      <span className="font-display" data-i18n="totalSavingsLabel">{t("totalSavingsLabel")}</span>
                      <span className="font-mono text-lg text-emerald-800">₦{selectedAlert.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-center font-mono font-extrabold text-[8px] text-neutral-400 tracking-widest py-1.5 bg-neutral-50 rounded-lg border border-neutral-100/50 uppercase">
                    {t("readyToExecute")}
                  </div>
                </div>

                {state.connectivity.online ? (
                  <button 
                    onClick={confirmAllocation}
                    className="w-full py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white font-bold text-xs tracking-wider rounded-xl transition shadow-lg hover:from-emerald-900 hover:to-black active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>{t("executeViaOpay").toUpperCase()} (₦{selectedAlert.amount.toLocaleString()}) →</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button 
                      onClick={confirmAllocation}
                      className="w-full py-4 bg-white border-2 border-orange-500 text-orange-700 font-bold text-xs tracking-wider rounded-xl transition hover:bg-orange-50 active:scale-98"
                      data-i18n="queueOfflineDepositBtn"
                    >
                      {t("queueOfflineDepositBtn")}
                    </button>
                    <div className="p-3 bg-orange-50 border border-orange-120 rounded-xl flex items-start gap-2 text-[11px] text-orange-900 font-medium leading-relaxed font-sans">
                      <span className="shrink-0 mt-0.5">📴</span>
                      <span data-i18n="syncPendingDesc">{t("syncPendingDesc")}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================== SCREEN 8: ALLOCATION SUCCESS ================== */}
          {currentScreen === "screen-allocation-success" && selectedAlert && (
            <div className="h-full flex flex-col justify-between py-12 px-6 text-center animate-fade-in bg-white font-sans">
              
              <div className="my-auto flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-150 scale-110 shadow-sm">
                  <Check className="w-10 h-10 text-emerald-700 font-black" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] bg-emerald-100/70 text-emerald-850 font-mono font-black tracking-widest uppercase px-3 py-1 rounded-full" data-i18n="completedText">
                    {t("completedText").toUpperCase()}
                  </span>
                  <h3 className="text-2xl font-display font-black text-neutral-900 tracking-tight leading-none pt-2" data-i18n="goalReached">{t("goalReached")}</h3>
                </div>
                
                <div className="space-y-1.5 py-4 bg-neutral-50/50 w-full rounded-2xl border border-neutral-100">
                  <p className="text-4xl font-mono font-black text-[#042F1A] text-emerald-950 leading-none">₦{selectedAlert.amount.toLocaleString()}</p>
                  <p className="text-xs text-neutral-400 font-semibold font-mono uppercase">{t("funded").toUpperCase()} SECURELY TO {selectedAlert.fund}</p>
                </div>

                <p className="text-[11px] text-neutral-500 italic px-4 leading-relaxed bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100" data-i18n="opaySyncDesc">
                  "{t("opaySyncDesc")}"
                </p>

                {/* Gemini Recommended Next Steps card */}
                <div className="w-full text-left bg-gradient-to-br from-emerald-50/50 to-teal-50/50 p-4 rounded-2xl border border-emerald-100/70 space-y-3 shadow-inner">
                  <div className="flex items-center gap-1.5 text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 animate-pulse" />
                    <h4 className="text-[10px] font-mono font-black tracking-wider uppercase">GEMINI {t("geminiActive").toUpperCase()}</h4>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-semibold font-sans" data-i18n="suggestedResilienceDispatches">
                    {t("suggestedResilienceDispatches")}
                  </p>
                  <button 
                    onClick={() => navigateTo("screen-advisor")}
                    className="text-xs text-emerald-850 font-black hover:underline flex items-center gap-1 hover:text-emerald-950 transition"
                  >
                    <span data-i18n="askAdvisor">{t("askAdvisor")}</span> <ArrowRight className="w-4 h-4 text-emerald-700" />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => navigateTo("screen-home")}
                className="w-full py-4 bg-neutral-900 hover:bg-neutral-950 text-white text-xs font-bold tracking-wider rounded-xl transition shadow-md active:scale-98 uppercase"
                data-i18n="home"
              >
                {t("home").toUpperCase()}
              </button>
            </div>
          )}

          {/* ================== SCREEN 9: CLIMATE INTELLIGENCE TAB ================== */}
          {currentScreen === "screen-climate" && (
            <div className="animate-fade-in bg-neutral-50 min-h-full font-sans">
              
              {/* Climate Header */}
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-5 pb-5 px-5 sticky top-0 z-10 border-b border-emerald-850/20 shadow-sm">
                <h3 className="font-display font-black text-lg tracking-tight" data-i18n="climateIntel">{t("climateIntel")}</h3>
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-300 font-mono font-bold uppercase tracking-wider mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{state.user.location} {t("territoryOffline")}</span>
                </div>

                <div className="mt-4 bg-[#0B1E36]/80 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div>
                    <p className="text-[8px] font-mono font-black text-sky-400 tracking-widest uppercase" data-i18n="soilSaturationIndex">{t("soilSaturationIndex")}</p>
                    <p className="text-sm font-display font-black text-white mt-0.5">88% <span className="text-red-400" data-i18n="extremeFloodRisk">{t("extremeFloodRisk")}</span></p>
                  </div>
                  <div className="w-28 bg-neutral-900/50 h-2.5 rounded-full overflow-hidden shrink-0 border border-white/5">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5" style={{width: '88%'}}></div>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs Navigator */}
              <div className="bg-white sticky top-[125px] lg:top-[125px] z-10 flex border-b border-neutral-200/50 shadow-sm font-bold text-xs">
                {(["forecast", "alerts", "reports", "learn"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setClimateTab(tab)}
                    className={`flex-1 text-center py-4 border-b-2 capitalize transition-colors tracking-wide font-display ${climateTab === tab ? "border-emerald-800 text-emerald-800 font-black text-[12px]" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
                  >
                    {t(tab)}
                  </button>
                ))}
              </div>

              {/* CLIMATE CONTENT SWITCHER */}
              <div className="p-4 space-y-4">
                
                {/* 1. FORECAST TAB */}
                {climateTab === "forecast" && (
                  <div className="space-y-4 animate-fade-in">
                    <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase" data-i18n="sevenDayWeather">{t("sevenDayWeather")}</h4>
                    
                    {/* Horizontal scroll strip for schedule */}
                    <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                      <div className="bg-gradient-to-br from-[#05251B] to-[#01140F] text-white rounded-2xl p-4 text-center min-w-[85px] shadow-sm flex flex-col items-center justify-between gap-2.5 shrink-0 border border-emerald-900 absolute overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400/30"></div>
                        <span className="text-[9px] font-mono font-black text-emerald-300 tracking-wider uppercase">TODAY</span>
                        <span className="text-2xl">⛈️</span>
                        <div className="text-xs leading-none">
                          <p className="font-display font-black text-white text-sm">31°C</p>
                          <p className="text-[8px] text-emerald-300 font-mono font-bold mt-0.5">/24°C</p>
                        </div>
                        <span className="text-[8px] tracking-wide font-mono font-black uppercase text-red-300 bg-red-950/45 px-1.5 py-0.5 rounded-lg border border-red-900/20">85% Rain</span>
                      </div>

                      <div className="bg-white text-neutral-800 rounded-2xl p-4 text-center min-w-[85px] shadow-sm flex flex-col items-center justify-between gap-2.5 shrink-0 border border-neutral-200/50 hover:border-emerald-600 transition duration-150">
                        <span className="text-[9px] font-mono font-black text-neutral-400 tracking-wider">FRI</span>
                        <span className="text-2xl">🌧️</span>
                        <div className="text-xs leading-none font-sans">
                          <p className="font-display font-black text-neutral-900">29°C</p>
                          <p className="text-[8px] text-neutral-400 font-mono font-bold mt-0.5">/23°C</p>
                        </div>
                        <span className="text-[8px] tracking-wide font-mono font-bold uppercase text-neutral-500">72% Rain</span>
                      </div>

                      <div className="bg-white text-neutral-800 rounded-2xl p-4 text-center min-w-[85px] shadow-sm flex flex-col items-center justify-between gap-2.5 shrink-0 border border-neutral-200/50 hover:border-emerald-600 transition duration-150">
                        <span className="text-[9px] font-mono font-black text-neutral-400 tracking-wider">SAT</span>
                        <span className="text-2xl">☁️</span>
                        <div className="text-xs leading-none font-sans">
                          <p className="font-display font-black text-neutral-900">30°C</p>
                          <p className="text-[8px] text-neutral-400 font-mono font-bold mt-0.5">/22°C</p>
                        </div>
                        <span className="text-[8px] tracking-wide font-mono font-bold uppercase text-neutral-400">40% Cloud</span>
                      </div>

                      <div className="bg-white text-neutral-800 rounded-2xl p-4 text-center min-w-[85px] shadow-sm flex flex-col items-center justify-between gap-2.5 shrink-0 border border-neutral-200/50 hover:border-emerald-600 transition duration-150">
                        <span className="text-[9px] font-mono font-black text-neutral-400 tracking-wider">SUN</span>
                        <span className="text-2xl">⛅</span>
                        <div className="text-xs leading-none font-sans">
                          <p className="font-display font-black text-neutral-900">33°C</p>
                          <p className="text-[8px] text-neutral-400 font-mono font-bold mt-0.5">/25°C</p>
                        </div>
                        <span className="text-[8px] tracking-wide font-mono font-bold uppercase text-neutral-400">15% Cloud</span>
                      </div>

                      <div className="bg-white text-neutral-800 rounded-2xl p-4 text-center min-w-[85px] shadow-sm flex flex-col items-center justify-between gap-2.5 shrink-0 border border-neutral-200/50 hover:border-emerald-600 transition duration-150">
                        <span className="text-[9px] font-mono font-black text-neutral-400 tracking-wider">MON</span>
                        <span className="text-2xl">☀️</span>
                        <div className="text-xs leading-none font-sans">
                          <p className="font-display font-black text-neutral-900">35°C</p>
                          <p className="text-[8px] text-neutral-400 font-mono font-bold mt-0.5">/26°C</p>
                        </div>
                        <span className="text-[8px] tracking-wide font-mono font-bold uppercase text-neutral-400">0% Sunny</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/50 shadow-sm space-y-4">
                      <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase pb-1 border-b border-neutral-100" data-i18n="todayClimateMetrics">{t("todayClimateMetrics")}</h4>
                      
                      <div className="grid grid-cols-2 gap-3.5 text-xs font-sans">
                        <div className="p-3.5 bg-neutral-50 rounded-xl space-y-1">
                          <p className="text-neutral-400 uppercase text-[8px] font-mono font-black" data-i18n="humidityLabel">{t("humidityLabel")}</p>
                          <p className="text-xs font-display font-black text-neutral-900">88%</p>
                        </div>
                        <div className="p-3.5 bg-neutral-50 rounded-xl space-y-1">
                          <p className="text-neutral-400 uppercase text-[8px] font-mono font-black" data-i18n="rainfallQuantity">{t("rainfallQuantity")}</p>
                          <p className="text-xs font-display font-black text-neutral-900">85 mm Predicted</p>
                        </div>
                        <div className="p-3.5 bg-neutral-50 rounded-xl space-y-1">
                          <p className="text-neutral-400 uppercase text-[8px] font-mono font-black" data-i18n="windHeading">{t("windHeading")}</p>
                          <p className="text-xs font-display font-black text-neutral-900">WNW 14 km/h</p>
                        </div>
                        <div className="p-3.5 bg-neutral-50 rounded-xl space-y-1">
                          <p className="text-neutral-400 uppercase text-[8px] font-mono font-black" data-i18n="temperatureSpikes">{t("temperatureSpikes")}</p>
                          <p className="text-xs font-display font-black text-neutral-900">Max 31°C / Min 24°C</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-100 rounded-xl text-[10px] text-neutral-500 font-semibold leading-relaxed flex items-start gap-2 border border-neutral-200">
                      <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <div data-i18n="dataHarvestedFrom">
                        {t("dataHarvestedFrom")}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ALERTS TAB */}
                {climateTab === "alerts" && (
                  <div className="space-y-4 animate-fade-in">
                    <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase" data-i18n="criticalActionsTimeline">{t("criticalActionsTimeline")}</h4>
                    <div className="space-y-4">
                      {state.alerts.map((alert) => (
                        <div 
                          key={alert.id}
                          className={`bg-white rounded-2xl border-l-[6px] p-5 shadow-sm border border-neutral-200/50 space-y-3.5 ${alert.color === "red" ? "border-l-red-600" : "border-l-orange-500"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-display font-black text-[13px] text-neutral-900 leading-tight">{getLocalizedAlertTitle(alert.title)}</h4>
                            <span className={`text-[8px] font-mono font-black tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase border border-red-200/30`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 font-semibold leading-relaxed">{getLocalizedAlertDesc(alert.description)}</p>
                          <div className="bg-neutral-50 py-3 px-4 rounded-xl border border-neutral-150 text-xs">
                            <span className="font-mono font-black text-emerald-800 text-[9px] tracking-wider block uppercase mb-1" data-i18n="resiliencyNode">🔥 {t("resiliencyNode").toUpperCase()}</span>
                            <span className="text-neutral-700 font-medium leading-relaxed">{getLocalizedAlertRec(alert.recommendation)}</span>
                          </div>
                          <button 
                            onClick={() => handleAllocateNow(alert)}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 text-white text-xs font-bold rounded-xl transition shadow active:scale-98 uppercase tracking-wider font-mono font-sans"
                          >
                            {t("allocateNow")} ₦{alert.amount.toLocaleString()} {t("remaining").toUpperCase()}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. REPORTS TAB */}
                {climateTab === "reports" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase" data-i18n="neighborhoodWarningReports">{t("neighborhoodWarningReports")}</h4>
                      <button 
                        onClick={() => navigateTo("screen-report")}
                        className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 hover:from-emerald-900 transition active:scale-95 duration-100 shadow font-sans"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-300" /> <span data-i18n="reportIncidentBtn">{t("reportIncidentBtn")}</span>
                      </button>
                    </div>

                    {/* Verification Ladder instruction card */}
                    <div className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl border border-neutral-200/50 text-[11px] space-y-2.5 shadow-sm">
                      <p className="font-display font-black text-neutral-800 uppercase text-[9px] tracking-wider font-mono" data-i18n="verificationScaleHierarchy">{t("verificationScaleHierarchy")}</p>
                      <div className="grid grid-cols-3 gap-1.5 text-[9px] text-center font-mono font-black">
                        <div className="p-2 bg-white border border-neutral-200 rounded-xl text-emerald-900 shadow-sm">
                          🟢 {t("watch")}<br/><span className="text-[8px] text-neutral-400 font-normal">1 report</span>
                        </div>
                        <div className="p-2 bg-white border border-neutral-200 rounded-xl text-orange-600 shadow-sm">
                          🟠 {t("warning")}<br/><span className="text-[8px] text-neutral-400 font-normal">3+ reports</span>
                        </div>
                        <div className="p-2 bg-white border border-neutral-200 rounded-xl text-red-650 shadow-sm">
                          🔴 URGENT<br/><span className="text-[8px] text-neutral-400 font-normal">Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* List of reports */}
                    <div className="space-y-3.5">
                      {state.communityReports.map((report) => (
                        <div key={report.id} className="bg-white rounded-2xl p-4.5 p-5 shadow-sm border border-neutral-200/50 space-y-3.5 font-sans">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center border border-neutral-100 shadow-inner">{report.icon}</span>
                              <div>
                                <h5 className="font-display font-black text-neutral-900 text-xs">{getLocalizedReportType(report.type)}</h5>
                                <p className="text-[9px] text-neutral-400 font-mono font-bold mt-0.5">{report.location} • {report.time}</p>
                              </div>
                            </div>
                            <span className="text-[8px] font-mono font-black px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-700/90 rounded-md">
                              {report.status === "WARNING" ? t("warning") : t("watch")}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-500 font-semibold leading-relaxed">{getLocalizedReportDesc(report.description)}</p>

                          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-neutral-100 font-bold font-sans">
                            <span className="text-neutral-400 font-bold uppercase text-[9px] font-mono">{t("byLabel")} {report.reporter}</span>
                            <button 
                              onClick={() => {
                                showToast("Verified report successfully!");
                                setState(prev => ({
                                  ...prev,
                                  communityReports: prev.communityReports.map(r => r.id === report.id ? {...r, verified: r.verified + 1} : r)
                                }));
                              }}
                              className="text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition flex items-center gap-1 active:scale-95 duration-100 font-black text-[10px]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t("supportVerifyBtn")} ({report.verified})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. LEARN TAB */}
                {climateTab === "learn" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase" data-i18n="offlineResiliencyManuals">{t("offlineResiliencyManuals")}</h4>
                      <p className="text-xs text-neutral-500 font-medium leading-relaxed" data-i18n="noActiveMobileNetwork">{t("noActiveMobileNetwork")}</p>
                    </div>

                    <div className="space-y-3">
                      {learningArticles.map((article) => (
                        <div 
                          key={article.id}
                          onClick={() => handleReadArticle(article)}
                          className="bg-white p-4.5 p-4 rounded-2xl border border-neutral-200/50 shadow-sm hover:border-emerald-600 transition cursor-pointer flex items-center justify-between gap-3 active:scale-98 duration-100"
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-2xl bg-neutral-50 w-11 h-11 rounded-xl flex items-center justify-center border border-neutral-100 shadow-inner">
                              {article.emoji}
                            </span>
                            <div>
                              <h5 className="font-display font-black text-neutral-900 text-xs leading-snug">{getLocalizedArticleTitle(article.title)}</h5>
                              <p className="text-[9px] text-neutral-400 font-mono font-black tracking-wider uppercase mt-1">
                                {getLocalizedArticleCat(article.category)} • {getLocalizedReadTime(article.readTime)}
                              </p>
                            </div>
                          </div>
                          {/* Use ChevronLeft rotated instead of ChevronRight to preserve existing asset imports */}
                          <ChevronLeft className="w-4 h-4 text-neutral-400 transform rotate-180 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ================== SCREEN 10: LEARNING ARTICLE VIEW ================== */}
          {currentScreen === "screen-learn-article" && selectedArticle && (
            <div className="animate-fade-in bg-white min-h-full font-sans">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-5 py-4.5 sticky top-0 flex items-center gap-3 border-b border-white/5 shadow-sm z-10">
                <button onClick={handleBack} className="p-1.5 hover:bg-white/10 rounded-xl transition duration-150 active:scale-90">
                  <ChevronLeft className="w-5 h-5 text-emerald-300" />
                </button>
                <div className="flex-1">
                  <h3 className="font-display font-black text-sm leading-tight tracking-tight">{getLocalizedArticleTitle(selectedArticle.title)}</h3>
                  <p className="text-[9px] text-emerald-300 font-mono font-bold uppercase tracking-wider mt-0.5" data-i18n="offlineAcademyManual">{t("offlineAcademyManual")}</p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-bold border-b border-neutral-150 pb-3">
                  <span className="px-3 py-1 bg-neutral-100 rounded-full font-mono text-[9px] font-black uppercase text-emerald-800 tracking-wider border border-neutral-200/50">{getLocalizedArticleCat(selectedArticle.category)}</span>
                  <span className="font-mono text-[9.5px] uppercase tracking-wide font-extrabold">{getLocalizedReadTime(selectedArticle.readTime)} {t("studyLabel") || "study"}</span>
                </div>

                <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-neutral-200/50 shadow-inner">
                  <span className="text-6xl filter drop-shadow">{selectedArticle.emoji}</span>
                </div>

                <div className="space-y-4 text-[13px] text-neutral-600 leading-relaxed font-medium">
                  {selectedArticle.paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* Practical tips board */}
                <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-5 rounded-2xl space-y-3.5 shadow-sm border border-emerald-800/10 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                  <h4 className="text-[9px] font-mono font-black tracking-widest uppercase text-emerald-300" data-i18n="keyResiliencyRules">{t("keyResiliencyRules")}</h4>
                  <ul className="space-y-3 text-xs leading-relaxed font-medium">
                    {selectedArticle.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2.5">
                        <span className="text-emerald-405 font-mono text-emerald-400 font-black shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedArticle.hasRelatedAlert && (
                  <div 
                    onClick={() => {
                      const alert = state.alerts.find(a => a.type === "Flood");
                      if (alert) {
                        setSelectedAlert(alert);
                        navigateTo("screen-allocation-confirm");
                      }
                    }}
                    className="p-4 bg-red-50 border border-red-200/55 rounded-2xl hover:bg-red-100 transition duration-150 cursor-pointer flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">⚠️</span>
                      <p className="text-xs text-red-950 font-black font-display">{getLocalizedRelatedAlertText(selectedArticle.relatedAlertText)}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-red-700 shrink-0" />
                  </div>
                )}

                <button 
                  onClick={() => {
                    setAdvisorInput(selectedArticle.prefilledQuestion);
                    navigateTo("screen-advisor");
                  }}
                  className="w-full py-4 bg-gradient-to-r from-[#0B1E36] to-[#040A14] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition duration-150 shadow border border-sky-950 uppercase tracking-widest font-mono"
                >
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span data-i18n="askAiAdvisorAboutThis">{t("askAiAdvisorAboutThis")}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================== SCREEN 11: REPORT CLIMATE EVENT ================== */}
          {currentScreen === "screen-report" && (
            <div className="animate-fade-in bg-neutral-50 min-h-full font-sans">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-5 py-4.5 sticky top-0 flex items-center gap-3 border-b border-white/5 shadow-sm z-10">
                <button onClick={handleBack} className="p-1.5 hover:bg-white/10 rounded-xl transition duration-150 active:scale-90">
                  <ChevronLeft className="w-5 h-5 text-emerald-300" />
                </button>
                <div className="flex-1">
                  <h3 className="font-display font-black text-sm leading-tight tracking-tight">{t("reportEvent")}</h3>
                  <p className="text-[9px] text-emerald-300 font-mono font-bold uppercase tracking-wider mt-0.5">Community Protection Dispatch</p>
                </div>
              </div>

              <form onSubmit={submitReport} className="p-5 space-y-4.5">
                <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                  Your certified report automatically helps verify risks in our district layout. Verified reports trigger OPay alert flags for other nearby farmers.
                </p>

                {/* Event Type Grid selector */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-black tracking-widest uppercase text-neutral-400">EVENT TYPE</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { name: "Flooding", icon: "🩸" },
                      { name: "Drought", icon: "☀️" },
                      { name: "Storm Damage", icon: "🌪️" },
                      { name: "Crop Disease", icon: "🦠" },
                      { name: "Livestock Threat", icon: "🐄" },
                      { name: "River Rise", icon: "🌊" }
                    ].map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setReportForm({...reportForm, type: item.name, icon: item.icon})}
                        className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-left transition duration-150 active:scale-98 ${reportForm.type === item.name ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-black shadow-sm" : "bg-white border-neutral-200/60 text-neutral-700 hover:bg-neutral-100"}`}
                      >
                        <span className="text-xl filter drop-shadow-sm">{item.icon}</span>
                        <span className="font-medium tracking-tight text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity selectors */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-black tracking-widest uppercase text-neutral-400">SEVERITY RATING</label>
                  <div className="flex gap-2">
                    {["Mild", "Moderate", "Severe"].map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setReportForm({...reportForm, severity: sev})}
                        className={`flex-1 py-3 rounded-xl border text-center transition tracking-wide font-bold text-xs ${reportForm.severity === sev ? "bg-emerald-800 text-white border-emerald-800 shadow-sm" : "bg-white border-neutral-200/60 text-neutral-600 hover:bg-neutral-100 active:scale-98"}`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description input */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black tracking-widest uppercase text-neutral-400">DETAILED REPORT</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Describe what you see - e.g., Water covering the road near Uyo market by 30cm and advancing to cassava beds."
                    value={reportForm.description}
                    onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                    className="w-full text-xs p-3.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:bg-white focus:border-emerald-600 transition font-medium"
                  />
                </div>

                {/* Location input */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black tracking-widest uppercase text-neutral-400">REPORT AREA LOCATION</label>
                  <input 
                    type="text" 
                    required
                    value={reportForm.location}
                    onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                    className="w-full text-xs px-4 py-3.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 transition font-medium"
                  />
                </div>

                {/* Photo Evidence button placeholder */}
                <button 
                  type="button" 
                  onClick={() => showToast("📸 Access granted for back Camera storage. Mock proof verified.")}
                  className="w-full py-4 bg-white border border-neutral-200 border-dashed rounded-2xl hover:border-emerald-600 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-500 hover:text-emerald-800 hover:bg-neutral-50 transition duration-150 active:scale-98"
                >
                  📸 Attach Photo Evidence (Offline Verified)
                </button>

                {/* Trust Score card */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/80 flex items-center justify-between text-xs shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-5 h-5 text-emerald-800" />
                    <div>
                      <p className="font-display font-bold text-neutral-900 text-xs">Reporter Trust Coefficient</p>
                      <p className="text-[10px] text-neutral-500 font-medium">Weighted 2.2x in verification consensus.</p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-150">★ 4.8</span>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 text-white font-bold text-xs rounded-2xl transition duration-150 shadow hover:shadow-emerald-800/25 uppercase tracking-wider font-mono active:scale-98"
                >
                  {t("submitReport")}
                </button>
              </form>
            </div>
          )}

          {/* ================== SCREEN 12: VAULT TAB ================== */}
          {currentScreen === "screen-vault" && (
            <div className="animate-fade-in bg-neutral-50 min-h-full font-sans">
              
              {/* Vault Header */}
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-5 pb-5 px-5 sticky top-0 z-10 border-b border-emerald-850/20 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-black text-xl tracking-tight">{t("yourVault")}</h3>
                    <p className="text-emerald-300/80 text-xs mt-0.5 font-medium">Automated reserves connected to local climate layers.</p>
                  </div>
                  <button 
                    onClick={() => navigateTo("screen-new-goal")}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition flex items-center justify-center font-bold text-white text-base shadow-sm border border-white/5"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>

                {/* OPay Wallet connected indicator */}
                <div className="mt-5 bg-gradient-to-br from-[#06241B] to-[#02100C] p-4 rounded-2xl border border-emerald-500/10 space-y-3 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-60"></div>
                  <p className="text-[9px] text-emerald-400 font-mono font-black tracking-widest uppercase">{t("totalSaved").toUpperCase()}</p>
                  
                  <div className="flex items-baseline justify-between relative z-10">
                    <span className="text-3xl font-mono font-black text-white">₦{state.vault.totalSaved.toLocaleString()}</span>
                    <span className="text-[9px] bg-emerald-900/80 text-emerald-305 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded border border-emerald-500/20 uppercase tracking-wider">
                      OPAY DIRECT LINK
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-white/5 relative z-10">
                    <div>
                      <p className="text-[8px] font-mono text-emerald-450 text-emerald-400/70 uppercase">{t("climateReserves").toUpperCase()}</p>
                      <p className="font-mono font-bold text-white text-xs mt-0.5">₦{state.vault.climateReserves.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-emerald-450 text-emerald-400/70 uppercase">{t("activeGoals").toUpperCase()}</p>
                      <p className="font-mono font-bold text-white text-xs mt-0.5">{state.vault.activeGoals} targets</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-emerald-455 text-emerald-400/70 uppercase">{t("funded").toUpperCase()}</p>
                      <p className="font-mono font-bold text-white text-xs mt-0.5">{state.vault.fundedPercent}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Sync Bar */}
              {state.connectivity.pendingTransfer && (
                <div className="mx-4 mt-4 p-4 bg-blue-50/75 border border-blue-200/50 rounded-2xl space-y-2.5 shadow-sm">
                  <p className="text-xs font-bold text-blue-900 leading-snug flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>{t("readyToExecute")}</span>
                  </p>
                  <p className="text-[11px] text-blue-700 leading-normal font-medium">
                    Allocate ₦{state.connectivity.pendingAmount.toLocaleString()} safely into your emergency shelter goal accounts.
                  </p>
                  <button 
                    onClick={resolvePendingTransfer}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl transition shadow-sm font-sans tracking-wide"
                  >
                    {t("allocateNow").toUpperCase()}
                  </button>
                </div>
              )}

              {/* Goal categories list pills */}
              <div className="px-5 pt-4 flex gap-2 overflow-x-auto scrollbar-hide">
                {["All", "Emergency", "Farm", "Livestock"].map((ctg) => (
                  <button
                    key={ctg}
                    onClick={() => setVaultFilter(ctg)}
                    className={`py-1.5 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap border shrink-0 transition active:scale-95 duration-100 ${vaultFilter === ctg ? "bg-emerald-990 bg-emerald-900 text-white border-emerald-900 shadow-sm" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
                  >
                    {ctg}
                  </button>
                ))}
              </div>

              {/* Goals lists */}
              <div className="p-4 space-y-3.5">
                {state.vault.goals
                  .filter(g => vaultFilter === "All" || g.category === vaultFilter)
                  .map((goal) => (
                    <div key={goal.id} className="bg-white p-4 rounded-2xl border border-neutral-200/50 shadow-sm space-y-3.5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl bg-neutral-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-neutral-100 shrink-0">
                            {goal.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-display font-black text-xs text-neutral-900">{goal.name}</h4>
                              {goal.climate && (
                                <span className="text-[8px] bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                  Sync Linked
                                </span>
                              )}
                            </div>
                            <p className="text-[8px] text-neutral-400 uppercase tracking-widest font-mono font-bold mt-0.5">{goal.category} SAVINGS</p>
                          </div>
                        </div>

                        {goal.complete ? (
                          <span className="text-emerald-700 text-[9px] font-mono font-black tracking-wider uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
                            ✓ SECURED
                          </span>
                        ) : (
                          <button 
                            onClick={() => {
                              setSelectedGoal(goal);
                              navigateTo("screen-add-funds");
                            }}
                            className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] border border-emerald-100 uppercase tracking-wide"
                          >
                            + Deposit
                          </button>
                        )}
                      </div>

                      {/* Goal progress metrics */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="font-mono font-extrabold text-neutral-900">₦{goal.saved.toLocaleString()} <span className="text-[9px] text-neutral-400 font-sans font-medium uppercase font-bold">saved</span></span>
                          <span className="text-neutral-400 font-mono text-[10px] font-medium">Target: ₦{goal.target.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden border border-neutral-150 border-neutral-200/20">
                          <div 
                            className="bg-gradient-to-r from-emerald-600 to-emerald-800 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((goal.saved / goal.target) * 100))}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono font-extrabold text-neutral-455 text-neutral-400">
                          <span>{Math.round((goal.saved / goal.target) * 100)}% {t("funded").toUpperCase()}</span>
                          <span>{goal.target > goal.saved ? `₦${(goal.target - goal.saved).toLocaleString()} ${t("remaining")}` : t("goalReached").toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Upsell Climate Micro-Insurance */}
                <div className="p-4 bg-gradient-to-br from-[#0B1E36] via-[#081629] to-[#040A14] text-white rounded-2xl border border-blue-950 shadow-md space-y-3.5 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-400 to-sky-300 opacity-60"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-300">
                      <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                      <h4 className="text-[10px] font-mono font-black tracking-widest uppercase">INSURANCE SAFEGUARD UPGRADE</h4>
                    </div>
                    <span className="text-[8px] font-mono font-bold bg-white/10 text-sky-300 px-2 py-0.5 rounded border border-white/5 uppercase">Premium Portal</span>
                  </div>
                  <p className="text-xs text-blue-200/95 leading-relaxed">
                    Protect your 2-acre cassava plots against torrential damage. Premium stakes start at just <span className="font-mono text-white font-bold">₦500/mo</span> with secure multi-tier compensations up to <span className="font-mono text-white font-bold">₦50,000</span>.
                  </p>
                  <button 
                    onClick={() => navigateTo("screen-insurance")}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white text-xs font-bold tracking-wider rounded-xl transition shadow uppercase"
                  >
                    EXPLORE MARKETPLACE →
                  </button>
                </div>
              </div>
            </div>
          )}
          {currentScreen === "screen-add-funds" && selectedGoal && (
            <div className="animate-fade-in bg-neutral-50 min-h-full font-sans">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-5 py-4 sticky top-0 flex items-center gap-3 border-b border-emerald-850/20 z-10 shadow-sm">
                <button onClick={handleBack} className="p-1.5 hover:bg-white/10 rounded-xl transition active:scale-95">
                  <ChevronLeft className="w-5 h-5 text-emerald-300" />
                </button>
                <div className="flex-1">
                  <h3 className="font-display font-black text-lg tracking-tight">Add to {selectedGoal.name}</h3>
                  <p className="text-[9px] text-emerald-300 font-mono font-bold tracking-widest uppercase">OPAY SECURED LIQUIDITY PIPELINE</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Goal progress card */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl bg-neutral-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-neutral-100">{selectedGoal.icon}</span>
                    <div>
                      <h4 className="font-display font-black text-xs text-neutral-900 leading-snug">{selectedGoal.name}</h4>
                      <p className="text-[8px] text-neutral-400 font-mono font-bold tracking-widest uppercase mt-0.5">{selectedGoal.category} Target Account</p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-700 font-bold font-mono">
                    ₦{selectedGoal.saved.toLocaleString()} / ₦{selectedGoal.target.toLocaleString()}
                  </span>
                </div>

                {/* Amount input custom field */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/50 shadow-sm space-y-3.5">
                  <label className="text-[9px] font-mono font-black tracking-widest uppercase text-neutral-400">ENTER SYNC DEPOSIT AMOUNT (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 font-display font-black text-lg text-neutral-900">₦</span>
                    <input 
                      type="number" 
                      required
                      placeholder="0.00"
                      value={addFundsAmount}
                      onChange={(e) => setAddFundsAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono font-black text-base text-neutral-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                  </div>

                  {/* Quick chips support */}
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    {[1000, 5000, 10000, 25000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAddFundsAmount(val.toString())}
                        className="py-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold font-mono rounded-xl text-center active:scale-95 transition"
                      >
                        ₦{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-neutral-200/50 space-y-2 text-xs font-medium">
                  <div className="flex justify-between text-neutral-500">
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Transfer Origin:</span>
                    <span className="font-extrabold text-neutral-800">OPay Mobile Secure Wallet</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold">OPay Liquid Fund:</span>
                    <span className="font-mono font-bold text-neutral-800">₦142,000</span>
                  </div>
                </div>

                {state.connectivity.online ? (
                  <button 
                    onClick={handleAddFunds}
                    className="w-full py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-950 hover:to-black text-white font-bold text-xs tracking-wider rounded-xl transition shadow active:scale-98 uppercase"
                  >
                    {t("addFunds").toUpperCase()}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button 
                      onClick={handleAddFunds}
                      className="w-full py-4 bg-white border-2 border-orange-500 text-orange-700 font-bold text-xs tracking-wider rounded-xl transition hover:bg-orange-50 active:scale-98"
                    >
                      QUEUE OFFLINE SAVINGS DEPOSIT
                    </button>
                    <p className="text-[10px] text-orange-700 text-center font-bold">
                      📴 Sync pending. The local cache will securely forward this deposit to OPay upon connection detection.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================== SCREEN 14: NEW SAVINGS GOAL ================== */}
          {currentScreen === "screen-new-goal" && (
            <div className="animate-fade-in bg-neutral-50 min-h-full font-sans">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-5 py-4 sticky top-0 flex items-center gap-3 border-b border-emerald-850/20 z-10 shadow-sm">
                <button onClick={handleBack} className="p-1.5 hover:bg-white/10 rounded-xl transition active:scale-95">
                  <ChevronLeft className="w-5 h-5 text-emerald-300" />
                </button>
                <div className="flex-1">
                  <h3 className="font-display font-black text-lg tracking-tight">{t("newGoal")}</h3>
                  <p className="text-[9px] text-emerald-300 font-mono font-bold tracking-widest uppercase">RISK MITIGATION RESERVES</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase">CHOOSE RESILIENCY TEMPLATE</h4>
                
                {/* Horizontal templates stripe scroll support */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide text-xs">
                  {[
                    { name: "Flood Recovery Fund", icon: "🌧️", target: 30000, category: "Emergency" },
                    { name: "Drought Protection Fund", icon: "🍂", target: 25000, category: "Emergency" },
                    { name: "Farm Inputs Booster", icon: "🌿", target: 50000, category: "Farm" }
                  ].map((temp) => (
                    <div 
                      key={temp.name}
                      onClick={() => setNewGoalForm({
                        name: temp.name,
                        target: temp.target.toString(),
                        category: temp.category,
                        linkToAlerts: true
                      })}
                      className="bg-white p-4 rounded-2xl border border-neutral-200/50 shadow-sm shrink-0 min-w-[210px] hover:border-emerald-600 transition cursor-pointer space-y-2.5 active:scale-98"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl w-9 h-9 bg-neutral-50 rounded-lg flex items-center justify-center border border-neutral-100 shadow-inner">{temp.icon}</span>
                        <h5 className="font-display font-black text-neutral-900 text-[11px] leading-tight">{temp.name}</h5>
                      </div>
                      <p className="text-[9px] text-neutral-400 font-mono font-bold uppercase tracking-wider">Target: <span className="text-neutral-700 font-black">₦{temp.target.toLocaleString()}</span></p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCreateGoal} className="bg-white rounded-2xl p-5 border border-neutral-200/50 shadow-sm space-y-4">
                  <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase">CUSTOM SETTINGS</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider">GOAL NAME</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Cassava Hybrid Stock"
                      value={newGoalForm.name}
                      onChange={(e) => setNewGoalForm({...newGoalForm, name: e.target.value})}
                      className="w-full text-xs px-3.5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition text-neutral-900 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider">TARGET LIMIT (₦)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="₦ 45,000"
                        value={newGoalForm.target}
                        onChange={(e) => setNewGoalForm({...newGoalForm, target: e.target.value})}
                        className="w-full text-xs px-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition text-neutral-900 font-mono font-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider">CATEGORY</label>
                      <select 
                        value={newGoalForm.category}
                        onChange={(e) => setNewGoalForm({...newGoalForm, category: e.target.value})}
                        className="w-full text-xs px-3 py-[11px] bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white text-neutral-800 font-bold transition"
                      >
                        <option>Emergency</option>
                        <option>Farm</option>
                        <option>Livestock</option>
                        <option>Education</option>
                      </select>
                    </div>
                  </div>

                  {/* Link with alert toggle */}
                  <div className="flex items-start justify-between gap-3 border-t border-neutral-100 pt-4">
                    <div className="space-y-1">
                      <p className="text-xs font-display font-black text-neutral-900">OPay Alert Smart Synchronization</p>
                      <p className="text-[10px] text-neutral-400 leading-normal font-medium">
                        Automatically adjust savings frequency when local climate events trigger alerts.
                      </p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer mt-1 shrink-0">
                      <input 
                        type="checkbox" 
                        checked={newGoalForm.linkToAlerts}
                        onChange={(e) => setNewGoalForm({...newGoalForm, linkToAlerts: e.target.checked})}
                        className="sr-only peer" 
                        id="goal-alert-toggle"
                      />
                      <label htmlFor="goal-alert-toggle" className="sr-only">OPay Alert Smart Synchronization</label>
                      <div className="w-10 h-6 bg-neutral-200 peer-checked:bg-emerald-600 rounded-full transition-all relative after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-emerald-990 active:scale-98 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition shadow shadow-sm mt-2"
                  >
                    {t("createGoal").toUpperCase()}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================== SCREEN 15: INSURANCE MARKETPLACE ================== */}
          {currentScreen === "screen-insurance" && (
            <div className="animate-fade-in bg-neutral-50 min-h-full font-sans">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-5 py-4 sticky top-0 flex items-center gap-3 border-b border-emerald-850/20 z-10 shadow-sm">
                <button onClick={handleBack} className="p-1.5 hover:bg-white/10 rounded-xl transition active:scale-95">
                  <ChevronLeft className="w-5 h-5 text-emerald-300" />
                </button>
                <div className="flex-1">
                  <h3 className="font-display font-black text-lg tracking-tight">Insurance</h3>
                  <p className="text-[9px] text-emerald-300 font-mono font-bold tracking-widest uppercase">CERTIFIED WEATHER-INDEX PROTECTION</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Hero card */}
                <div className="bg-gradient-to-br from-[#0B1E36] via-[#081629] to-[#040A14] text-white p-5 rounded-2xl border border-blue-955 border-blue-900 shadow-md space-y-3 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-400 to-sky-300 opacity-60"></div>
                  <div className="flex items-center gap-2 text-blue-300">
                    <Shield className="w-5 h-5 text-blue-450 text-blue-400" />
                    <h4 className="text-[10px] font-mono font-black tracking-widest uppercase text-sky-400">Protect Your Hard Harvest</h4>
                  </div>
                  <p className="text-xs text-blue-200/95 leading-relaxed font-semibold">
                    ClimaVault securely collaborates with NiMet and accredited Nigerian agricultural insurers for automated payouts when climate indexes exceed safe limits.
                  </p>
                </div>

                <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase">AVAILABLE POLICIES</h4>
                
                {/* Policy cards lists */}
                <div className="space-y-4">
                  {[
                    { company: "Pula Agri", name: "Multi-Peril Crop Compensation", cost: 500, payout: 50000, desc: "Covers rainfall failures, excessive flood rot, and armyworm invasions for Akwa Ibom farmers." },
                    { company: "aYo Insurance", name: "Family Health + Farm Injury Shield", cost: 300, payout: 30000, desc: "Secures instant payout for localized hospitalization, accidents, plus severe harvest storms." },
                    { company: "NAIC (Govt-backed)", name: "Certified Climate Catastrophe Cover", cost: 200, payout: 25000, desc: "Accredited state protection from devastating floods and droughts supported by national emergency relief." }
                  ].map((policy) => (
                    <div key={policy.name} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/50 space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-mono font-bold text-[#0B1E36] text-[10px] uppercase tracking-wider">{policy.company}</h4>
                          <h5 className="font-display font-black text-neutral-900 text-xs leading-snug mt-0.5">{policy.name}</h5>
                        </div>
                        <span className="text-[11px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl whitespace-nowrap shadow-inner">
                          ₦{policy.cost}/mo
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold">{policy.desc}</p>
                      
                      <div className="flex items-center justify-between text-[11px] pt-3 border-t border-neutral-100 text-neutral-400">
                        <span className="font-medium text-[10px] uppercase font-bold text-neutral-450 text-neutral-450">MAX PAYOUT: <span className="font-mono font-black text-neutral-800 text-xs">₦{policy.payout.toLocaleString()}</span></span>
                        <button 
                          onClick={() => activateInsurance(policy.company, policy.cost)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow active:scale-95 duration-100 uppercase tracking-wider"
                        >
                          Activate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-white rounded-2xl border border-neutral-200/50 shadow-sm space-y-3 text-xs">
                  <h4 className="font-display font-black text-neutral-900 text-xs tracking-tight uppercase border-b border-neutral-100 pb-2">HOW WEATHER-INDEX SCHEME WORKS</h4>
                  <div className="space-y-3 text-neutral-600 pr-1">
                    <p className="leading-relaxed font-semibold"><span className="font-mono text-emerald-700 font-bold">01.</span> Select policy with OPay monthly direct payment routing.</p>
                    <p className="leading-relaxed font-semibold"><span className="font-mono text-emerald-700 font-bold">02.</span> Satellite sensors track soil moisture and rainfall indexes.</p>
                    <p className="leading-relaxed font-semibold"><span className="font-mono text-emerald-700 font-bold">03.</span> Excessive flood index automatically verifies and declares trigger.</p>
                    <p className="leading-relaxed font-semibold"><span className="font-mono text-emerald-700 font-bold">04.</span> Indemnity payouts process to OPay within 48 hours for immediate recovery.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================== SCREEN 16: AI ADVISOR CHAT ================== */}
          {currentScreen === "screen-advisor" && (
            <div className="animate-fade-in bg-neutral-100 min-h-full flex flex-col justify-between h-[844px] pb-[60px] font-sans">
              
              {/* Advisor Sticky Header */}
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-4 pb-4 px-5 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-emerald-850/20">
                <div className="flex items-center gap-2.5">
                  <button onClick={handleBack} className="p-1.5 hover:bg-white/10 rounded-xl lg:hidden transition active:scale-95">
                    <ChevronLeft className="w-5 h-5 text-emerald-300" />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center font-bold text-lg border border-purple-500/20 shadow-inner shrink-0">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm leading-tight">AI ClimaVault Advisor</h3>
                    <p className="text-[9px] text-emerald-300 font-mono font-bold tracking-wider uppercase leading-none mt-0.5">Agriculture resilience expert</p>
                  </div>
                </div>
                <span className="text-[9px] bg-purple-900/45 text-purple-300 font-mono font-black border border-purple-500/10 px-2 py-1 rounded tracking-wide">
                  GEMINI ACTIVE
                </span>
              </div>

              {/* Chat messages scrolling space */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{maxHeight: '600px'}}>
                {state.advisor.messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    {msg.role !== "user" && (
                      <span className="text-xl bg-purple-50 w-8 h-8 rounded-xl border border-purple-100 shadow-inner flex items-center justify-center shrink-0">
                        🤖
                      </span>
                    )}
                    <div className="space-y-0.5 flex flex-col">
                      <div className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed font-semibold ${msg.role === "user" ? "bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-tr-none" : "bg-white text-neutral-800 rounded-tl-none border border-neutral-200/50"}`}>
                        {msg.id === "welcome-init" ? (
                          state.user.language === "Hausa" ? `Barka da zuwa, ${state.user.name}! Ni ne Mai Ba Da Shawarwari na ClimaVault AI, wanda ke tallafawa da bayanan yanayi na ${state.user.location}. Zan iya taimaka maka da tsara gona, shirye-shiryen kuɗi, shawarwarin amfanin gona, da murmurewa daga bala'i. Me kuke son sani a yau?` :
                          state.user.language === "Yoruba" ? `Pẹlẹ o, ${state.user.name}! Mo jẹ Oludamoran AI ClimaVault rẹ, ti o ni agbara nipasẹ oye oju-ọjọ fun ${state.user.location}. Mo le ṣe iranlọwọ fun ọ pẹlu titoju oko, igbaradi owo, awọn iṣeduro irugbin, ati imularada ajalu. Kini iwọ yoo fẹ lati mọ loni?` :
                          state.user.language === "Igbo" ? `Ndewo, ${state.user.name}! Mụ bụ Onye Ndụmọdụ AI ClimaVault gị, nke nwere ọgụgụ isi ihu igwe maka ${state.user.location}. Enwere m ike inyere gị aka na nhazi ugbo, njikere ego, aro ihe ọkụkụ, na mgbake ọdachi. Kedu ihe ị ga-chọ ịma taa?` :
                          state.user.language === "Ibibio" ? `Mmekòm, ${state.user.name}! Ami mme Onye Ndumodu AI ClimaVault mbu, iyene mme okuk nte climate ke ${state.user.location}. Ami mmekeme ndinwam fi ke ukama ufan, isip okuk, mme ubok nte ndidem, ye mme nte efen. Nso ke afo akpama ndifiok mfin emi?` :
                          msg.content
                        ) : msg.content}
                      </div>
                      <span className={`text-[8px] text-neutral-400 font-mono font-bold mt-1 px-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isAdvisorTyping && (
                  <div className="flex items-start gap-2.5 max-w-[85%] mr-auto">
                    <span className="text-xl bg-purple-50 w-8 h-8 rounded-xl border border-purple-100 shadow-inner flex items-center justify-center shrink-0">🤖</span>
                    <div className="bg-white p-3.5 rounded-2xl text-neutral-800 border border-neutral-200/50 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Prompt Suggestions chips (only visible if messages are <= 2) */}
              {state.advisor.messages.length <= 2 && (
                <div className="p-4 bg-neutral-50/75 border-t border-neutral-200/50 space-y-2 shrink-0">
                  <p className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-widest px-1">SUGGESTED RESILIENCE DISPATCHES</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide text-[11px] -mx-1 px-1">
                    {[
                      "Should I plant maize this week?",
                      "How do I protect cassava from floods?",
                      "What should I save before the rainy season?",
                      "Explain my current risk score"
                    ].map((promptText) => (
                      <button
                        key={promptText}
                        onClick={() => sendAdvisorMessage(promptText)}
                        className="py-2 px-3.5 bg-white border border-neutral-200 text-neutral-700 hover:border-emerald-600 rounded-xl whitespace-nowrap transition active:scale-95 duration-100 font-bold"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input sticky bar */}
              <div className="p-3 bg-white border-t border-neutral-200/50 flex items-center gap-2 shrink-0">
                <input 
                  type="text"
                  placeholder="Ask your AI Advisor..."
                  value={advisorInput}
                  onChange={(e) => setAdvisorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendAdvisorMessage(advisorInput);
                  }}
                  className="flex-1 text-xs px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 transition font-medium"
                />
                <button 
                  onClick={() => sendAdvisorMessage(advisorInput)}
                  className="w-11 h-11 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-black text-white rounded-xl flex items-center justify-center transition active:scale-95 duration-100 shadow shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
          {currentScreen === "screen-profile" && (
            <div className="animate-fade-in bg-neutral-50 min-h-full font-sans">
              
              {/* Profile header stats cards */}
              <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-6 pb-6 px-5 rounded-b-[24px] shadow-md space-y-4 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-60"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-purple-950 text-white flex items-center justify-center font-display font-black text-lg border border-purple-500/20 shadow-inner">
                    {state.user.initials}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg leading-tight tracking-tight">{state.user.name}</h3>
                    <p className="text-[10px] text-emerald-300 font-mono font-bold tracking-wider uppercase mt-0.5">{state.user.location} • {state.user.farmType}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-white/5 relative z-10">
                  <div>
                    <p className="text-[8px] font-mono text-emerald-400/80 uppercase">TOTAL RESERVED</p>
                    <p className="font-mono font-black text-white text-sm mt-0.5">₦{state.vault.totalSaved.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-mono text-emerald-400/80 uppercase">ACTIVE CHANNELS</p>
                    <p className="font-mono font-black text-white text-sm mt-0.5">{state.vault.activeGoals} Goals</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-mono text-emerald-400/80 uppercase">SECURED MET</p>
                    <p className="font-mono font-black text-white text-sm mt-0.5">2 Goals</p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                
                {/* Farmer Profile detail parameters */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/50 shadow-sm space-y-3.5">
                  <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase pb-1 border-b border-neutral-100">{t("farmProfile").toUpperCase()}</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-400 font-bold uppercase text-[9px] font-mono">Full Name</span>
                      <span className="font-black text-neutral-900">{state.user.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-400 font-bold uppercase text-[9px] font-mono">District Territory</span>
                      <span className="font-black text-neutral-900">{state.user.location}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-400 font-bold uppercase text-[9px] font-mono">Crop Canopy</span>
                      <span className="font-black text-neutral-900">{state.user.farmType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-400 font-bold uppercase text-[9px] font-mono">Farm Surface</span>
                      <span className="font-black text-neutral-900">{state.user.farmSize}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400 font-bold uppercase text-[9px] font-mono">Linked Phone</span>
                      <span className="font-mono font-black text-neutral-900">{state.phone || state.user.phone}</span>
                    </div>
                  </div>
                </div>

                {/* OPay connected credentials checklist layout */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/50 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-800" />
                      <h4 className="font-display font-black text-xs text-neutral-900 uppercase">OPAY SECURED LINK</h4>
                    </div>
                    <span className="text-[8px] text-emerald-800 bg-emerald-50 border border-emerald-100 font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      ONLINE ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-neutral-500 leading-normal font-semibold">
                    <p className="flex items-center gap-1.5">
                      <span className="text-emerald-700">✓</span>
                      <span>One-tap automatic risk reserve allocation routing.</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-emerald-700">✓</span>
                      <span>Offline transactional cache securely queued.</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-emerald-700">✓</span>
                      <span>SmartSync direct linkage to weather indices.</span>
                    </p>
                    <p className="text-[9px] font-mono font-black text-neutral-400 border-t border-neutral-100 pt-2.5 tracking-wider uppercase">
                      CBN-COMPLIANT • NDIC-INSURED ARCHITECTURE
                    </p>
                  </div>
                </div>

                {/* Language change indicator */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/50 shadow-sm space-y-3.5">
                  <h4 className="text-[9px] font-mono font-black text-neutral-400 tracking-widest uppercase">{t("language").toUpperCase()}</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {["English", "Ibibio", "Hausa", "Yoruba", "Igbo"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setState(prev => ({...prev, user: {...prev.user, language: lang}}));
                          showToast(`System dialect transformed to: ${lang}`);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-wide transition duration-150 active:scale-95 ${state.user.language === lang ? "bg-emerald-800 text-white border-emerald-800 shadow-sm shadow-emerald-800/10" : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"}`}
                      >
                        {lang} {state.user.language === lang && "✓"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Microinsurance details summary card */}
                <div className="p-5 bg-gradient-to-br from-[#0B1E36] via-[#081629] to-[#040A14] text-white rounded-2xl border border-blue-950 shadow-md space-y-3 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-400 to-sky-300 opacity-60"></div>
                  <h4 className="font-mono font-black text-sky-400 uppercase text-[9px] tracking-widest">ACTIVE AGRI-SHIELDS</h4>
                  <p className="text-blue-150 text-blue-200 text-xs leading-relaxed font-semibold">
                    Protect Cassava acreage from deluge hazards with verified weather indices. Core monthly stakes start at just <span className="font-mono text-white font-black">₦500/mo</span>.
                  </p>
                  <button 
                    onClick={() => navigateTo("screen-insurance")}
                    className="text-xs font-black text-sky-300 hover:text-white flex items-center gap-1 mt-1 transition active:transform"
                  >
                    Open policies marketplace <ArrowRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>

                {/* Submission footer details */}
                <div className="text-center text-[9px] text-neutral-400 font-mono font-bold leading-relaxed pt-4 border-t border-neutral-200">
                  <p className="font-black uppercase text-neutral-500 tracking-wider">ClimaVault core build v1.0.0</p>
                  <p className="text-neutral-400 lowercase tracking-tight mt-0.5">Designed for OPay Innovation Challenge 2026 Submission</p>
                  <p className="text-emerald-700 font-extrabold uppercase mt-1 tracking-wide">✓ CB-COMPLIANT SECURE MOBILE API</p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ================== FIXED BOTTOM NAV ================== */}
        {currentScreen !== "screen-splash" && 
         currentScreen !== "screen-onboarding-1" && 
         currentScreen !== "screen-onboarding-2" && 
         currentScreen !== "screen-onboarding-3" && 
         currentScreen !== "screen-signup" && (
          <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-white border-t border-neutral-200 flex items-center justify-around z-20">
            {[
              { id: "screen-home", label: "Home", emoji: "🏠" },
              { id: "screen-climate", label: "Climate", emoji: "⛈️" },
              { id: "screen-vault", label: "Vault", emoji: "💎" },
              { id: "screen-advisor", label: "Advisor", emoji: "🤖" },
              { id: "screen-profile", label: "Profile", emoji: "👤" }
            ].map((tab) => {
              const isActive = currentScreen === tab.id || 
                    (tab.id === "screen-climate" && currentScreen === "screen-learn-article") ||
                    (tab.id === "screen-vault" && (currentScreen === "screen-add-funds" || currentScreen === "screen-insurance")) ||
                    (tab.id === "screen-home" && (currentScreen === "screen-allocation-confirm" || currentScreen === "screen-allocation-success" || currentScreen === "screen-report" || currentScreen === "screen-new-goal"));
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    // Reset selected variables and jump directly
                    setSelectedAlert(null);
                    setSelectedGoal(null);
                    setSelectedArticle(null);
                    setCurrentScreen(tab.id);
                  }}
                  className="flex flex-col items-center justify-center w-12 h-full gap-0.5 relative"
                >
                  <span className={`text-xl transition-transform ${isActive ? "scale-110" : "opacity-60"}`}>
                    {tab.emoji}
                  </span>
                  <span className={`text-[9px] font-bold tracking-wide transition-colors ${isActive ? "text-emerald-800 font-extrabold" : "text-neutral-400 font-medium"}`}>
                    {t(tab.label.toLowerCase() as any)}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1 right-1 h-1 bg-emerald-800 rounded-t-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* Floating Connectivity Toggle for demo and reviewers */}
      <div className="fixed bottom-4 left-4 z-50 bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-2xl shadow-xl flex items-center gap-2 max-w-[170px] transition text-[11px] text-white hidden md:flex">
        <div className="flex flex-col gap-0.5">
          <p className="font-black text-neutral-400 uppercase text-[9px] tracking-wider leading-none">SmartSync Switch</p>
          <p className="font-extrabold text-[10px] leading-tight select-none">
            {state.connectivity.online ? "📶 OPay signal High" : "📴 Offline simulation"}
          </p>
        </div>
        <button 
          onClick={toggleConnectivity}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition ${state.connectivity.online ? "bg-emerald-800 text-white" : "bg-orange-700 text-white animate-pulse"}`}
        >
          {state.connectivity.online ? "Connected" : "Re-sync"}
        </button>
      </div>

    </div>
  );
}
