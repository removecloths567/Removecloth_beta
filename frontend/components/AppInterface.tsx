// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Upload, X, Loader2, Wand2, Download, AlertCircle, ArrowRight, ArrowLeft, 
//   Check, ChevronRight, Venus, Mars, Clock, Zap, CheckCircle2, RotateCcw, 
//   AlertTriangle, Users, CreditCard, ShieldAlert, Plus, ShieldX, Activity, ZapOff,
//   SignalHigh, Terminal, Fingerprint
// } from 'lucide-react';
// import { User, GenerationStatus, GenerationConfig, CONFIG_OPTIONS, GENERATION_API_URL } from '../types';

// interface AppInterfaceProps {
//   user: User;
//   onUpdateCredits: (newAmount: number) => void;
//   onNavigatePricing: () => void;
// }

// export const AppInterface: React.FC<AppInterfaceProps> = ({ user, onUpdateCredits, onNavigatePricing }) => {
//   const [currentStep, setCurrentStep] = useState<'upload' | 'config' | 'processing'>('upload');
//   const [config, setConfig] = useState<Partial<GenerationConfig>>({});
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [resultUrl, setResultUrl] = useState<string | null>(null);
//   const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [errorType, setErrorType] = useState<'traffic' | 'pipeline' | 'credits' | null>(null);
//   const [progress, setProgress] = useState(0);
//   const [queuePosition, setQueuePosition] = useState(0);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const wsRef = useRef<WebSocket | null>(null);
//   useEffect(() => {
//   return () => {
//     if (wsRef.current) {
//       wsRef.current.close();
//     }
//   };
// }, []);


//   const fileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const result = reader.result as string;
//         const base64Data = result.split(',')[1];
//         if (!base64Data) {
//             reject(new Error("Failed to extract data."));
//             return;
//         }
//         resolve(base64Data);
//       };
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   const isConfigComplete = () => {
//     if (!config.gender || !config.age || !config.mode || !config.bodyType || !config.assSize || !config.genitalType) {
//       return false;
//     }
//     if (config.gender === 'female' && !config.breastSize) {
//       return false;
//     }
//     return true;
//   };

//   const handleConfigChange = (key: keyof GenerationConfig, value: string) => {
//     setConfig(prev => ({ ...prev, [key]: value }));
//   };




//   const handleNextToConfig = () => {
//     if (!selectedFile) return;
//     window.scrollTo(0,0);
//     setCurrentStep('config');
//   };

//   const handleBackToUpload = () => {
//     window.scrollTo(0,0);
//     setCurrentStep('upload');
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setSelectedFile(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       setResultUrl(null);
//       setStatus(GenerationStatus.IDLE);
//       setErrorMessage(null);
//       setErrorType(null);
//     }
//   };

// //   const handleGenerate = async () => {
// //     if (!isConfigComplete() || !selectedFile) return;

// //     if (user.credits <= 0) {
// //       setErrorType('credits');
// //       setErrorMessage("You dont have sufficient credits please top-up for nonstop use");
// //       setStatus(GenerationStatus.ERROR);
// //       setCurrentStep('processing');
// //       return;
// //     }

// //     setErrorMessage(null);
// //     setErrorType(null);
// //     setCurrentStep('processing');
// //     setStatus(GenerationStatus.UPLOADING);
// //     setProgress(5);

// //     const startQueue = Math.floor(Math.random() * 15) + 10;
// //     setQueuePosition(startQueue);

// //     const controller = new AbortController();
// //     const timeoutId = setTimeout(() => controller.abort(), 300000);

// //     try {
// //       const b64 = await fileToBase64(selectedFile);
// //       setStatus(GenerationStatus.PROCESSING);

// //       let currentProgress = 5;
// //       const progressInterval = setInterval(() => {
// //         if (currentProgress < 98) {
// //           const increment = (100 - currentProgress) / 200; 
// //           currentProgress += increment;
// //           setProgress(currentProgress);
// //         }
// //         if (Math.random() > 0.94 && queuePosition > 1) {
// //             setQueuePosition(prev => Math.max(1, prev - 1));
// //         }
// //       }, 1500);

// //       const token = localStorage.getItem('auth_token');

// //       // PRECISE MAPPING TO BACKEND GenerationSettings MODEL
// //       const generationSettings = {
// //             generationMode: config.mode,
// //             gender: config.gender,
// //             age: config.age?.toLowerCase() || 'automatic',
// //             bodyType: config.bodyType,
// //             breastsSize: config.breastSize || 'none', // Change 'breastSize' to 'breastsSize' here
// //             assSize: config.assSize,
// //             pussy: config.gender === 'female' ? config.genitalType : 'shaved', // 'pussy' for females
// //             penis: config.gender === 'male' ? config.genitalType : 'shaved' // 'penis' for males
// //         };

// //       const payload = {
// //           request: { base64_image: b64 },
// //           settings: generationSettings
// //       };

// //       const response = await fetch(`${GENERATION_API_URL}/generate-image/`, {
// //         method: 'POST',
// //         headers: { 
// //           'Content-Type': 'application/json',
// //           'Authorization': token ? `Bearer ${token}` : ''
// //         },
// //         body: JSON.stringify(payload),
// //         signal: controller.signal
// //       });

// //       clearTimeout(timeoutId);
// //       clearInterval(progressInterval);

// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({}));
// //         const detail = errorData.detail || {};
// //         const backendErrorMsg = (detail.message || detail.error || errorData.message || "").toString();

// //         if (response.status === 402 || response.status === 403 || backendErrorMsg.toLowerCase().includes("credits")) {
// //           setErrorType('credits');
// //           throw new Error("You dont have sufficient credits please top-up for nonstop use");
// //         } else if (response.status === 503 || response.status === 429) {
// //           setErrorType('traffic');
// //           throw new Error("We are currently facing higher traffic exceeded 1000 users so please revisit us after some time");
// //         } else {
// //           setErrorType('pipeline');
// //           throw new Error("due to some unconvinence issue image generation is failed");
// //         }
// //       }

// //       const data = await response.json();

// //       if (data.success && data.result?.url) {
// //         setResultUrl(data.result.url);
// //         setProgress(100);
// //         setStatus(GenerationStatus.COMPLETED);

// //         if (typeof data.credits_remaining === 'number') {
// //            onUpdateCredits(data.credits_remaining);
// //         } else {
// //            onUpdateCredits(user.credits - 1);
// //         }
// //       } else {
// //         setErrorType('pipeline');
// //         throw new Error("due to some unconvinence issue image generation is failed");
// //       }

// //     } catch (err: any) {
// //       clearTimeout(timeoutId);
// //       setStatus(GenerationStatus.ERROR);

// //       if (err.name === 'AbortError') {
// //           setErrorType('traffic');
// //           setErrorMessage("We are currently facing higher traffic exceeded 1000 users so please revisit us after some time");
// //       } else {
// //           setErrorMessage(err.message || "due to some unconvinence issue image generation is failed");
// //           if (err.message?.includes("traffic")) setErrorType('traffic');
// //           else if (err.message?.includes("credits")) setErrorType('credits');
// //           else if (!errorType) setErrorType('pipeline');
// //       }
// //     }
// //   };

// const handleGenerate = async () => {
//   if (!isConfigComplete() || !selectedFile) return;

//   if (user.credits <= 0) {
//     setErrorType('credits');
//     setErrorMessage("You dont have sufficient credits please top-up for nonstop use");
//     setStatus(GenerationStatus.ERROR);
//     setCurrentStep('processing');
//     return;
//   }

//   setErrorMessage(null);
//   setErrorType(null);
//   setCurrentStep('processing');
//   setStatus(GenerationStatus.UPLOADING);
//   setProgress(0);
//   setQueuePosition(0);

//   try {
//     const b64 = await fileToBase64(selectedFile);
//     const token = localStorage.getItem('auth_token');

//     const generationSettings = {
//       generationMode: config.mode,
//       gender: config.gender,
//       age: config.age?.toLowerCase() || 'automatic',
//       bodyType: config.bodyType,
//       breastsSize: config.breastSize || 'none',
//       assSize: config.assSize,
//       pussy: config.gender === 'female' ? config.genitalType : 'shaved',
//       penis: config.gender === 'male' ? config.genitalType : 'shaved',
//     };

//     const wsUrl =
//       `${GENERATION_API_URL.replace(/^http/, 'ws')}/ws/generate?token=${token}`;

//     const ws = new WebSocket(wsUrl);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       ws.send(JSON.stringify({
//         request: { base64_image: b64 },
//         settings: generationSettings,
//       }));
//     };

//     ws.onmessage = (event) => {
//       const msg = JSON.parse(event.data);

//       switch (msg.type) {
//         case 'queue':
//           setQueuePosition(msg.position);
//           break;

//         case 'progress':
//           setProgress(msg.value);
//           setStatus(GenerationStatus.PROCESSING);
//           break;

//         case 'completed':
//           setResultUrl(msg.result_url);
//           setProgress(100);
//           setStatus(GenerationStatus.COMPLETED);
//           onUpdateCredits(msg.credits_remaining);
//           ws.close();
//           break;

//         case 'error':
//           if (msg.message?.toLowerCase().includes('credit')) {
//             setErrorType('credits');
//           } else if (msg.message?.toLowerCase().includes('traffic')) {
//             setErrorType('traffic');
//           } else {
//             setErrorType('pipeline');
//           }

//           setErrorMessage(msg.message || "Image generation failed");
//           setStatus(GenerationStatus.ERROR);
//           ws.close();
//           break;
//       }
//     };

//     ws.onerror = () => {
//       setErrorType('pipeline');
//       setErrorMessage("Connection lost. Please try again.");
//       setStatus(GenerationStatus.ERROR);
//     };

//   } catch (err: any) {
//     setErrorType('pipeline');
//     setErrorMessage(err.message || "Image generation failed");
//     setStatus(GenerationStatus.ERROR);
//   }
// };

//   const reset = () => {
//     setSelectedFile(null);
//     setPreviewUrl(null);
//     setResultUrl(null);
//     setStatus(GenerationStatus.IDLE);
//     setErrorMessage(null);
//     setErrorType(null);
//     setProgress(0);
//     setQueuePosition(0);
//     setConfig({});
//     setCurrentStep('upload');
//   };

//   if (currentStep === 'processing') {
//     return (
//         <div className="min-h-screen pt-24 pb-12 px-4 bg-black flex items-center justify-center relative transition-colors duration-500 overflow-hidden">
//             {/* Neural Matrix Ambient Background */}
//             <div className="absolute inset-0 z-0 overflow-hidden">
//                  <div className={`absolute top-1/4 left-1/4 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] lg:w-[800px] lg:h-[800px] blur-[80px] sm:blur-[200px] rounded-full opacity-30 animate-pulse-slow ${errorType === 'credits' ? 'bg-amber-600' : 'bg-primary'}`}></div>
//                  <div className={`absolute bottom-1/4 right-1/4 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] lg:w-[800px] lg:h-[800px] blur-[80px] sm:blur-[200px] rounded-full opacity-15 animate-pulse-slow ${errorType === 'credits' ? 'bg-orange-600' : 'bg-secondary'}`} style={{animationDelay: '2s'}}></div>
//                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_90%)]"></div>
//                  {/* Moving Grid Lines for Tech Vibe */}
//                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
//             </div>

//             <div className="w-full max-w-5xl mx-auto relative z-10 px-4">
//                 {status === GenerationStatus.ERROR ? (
//                     <div className="text-center animate-[fadeIn_0.6s_ease-out]">

//                         {/* High-Fidelity Diagnostics Hub */}
//                         <div className="relative mb-16 inline-block">
//                              {/* Central Core Bloom */}
//                              <div className={`hidden sm:block absolute inset-0 blur-[200px] rounded-full scale-150 animate-pulse opacity-60 ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>

//                              {/* Neural Core Vessel */}
//                              <div className={`relative w-48 h-48 md:w-64 md:h-64 bg-[#050505] backdrop-blur-3xl border-2 rounded-[4rem] flex flex-col items-center justify-center shadow-[0_0_100px_rgba(0,0,0,1)] transition-transform duration-1000 hover:scale-110 ${errorType === 'credits' ? 'border-amber-500/50 shadow-amber-500/10' : 'border-red-500/50 shadow-red-500/10'}`}>
//                                 {errorType === 'traffic' ? (
//                                     <div className="relative flex flex-col items-center gap-4">
//                                         <Users size={80} className="text-red-500 glitch-text" />
//                                         <span className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.4em]">Queue Full</span>
//                                     </div>
//                                 ) : errorType === 'credits' ? (
//                                     <div className="relative flex flex-col items-center gap-4 group">
//                                         <CreditCard size={80} className="text-amber-500 group-hover:scale-110 transition-transform" />
//                                         <div className="absolute -top-4 -right-4 w-14 h-14 bg-amber-500 rounded-3xl flex items-center justify-center border-4 border-[#050505] shadow-2xl animate-bounce">
//                                             <Plus size={32} className="text-black font-black" />
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className="relative flex flex-col items-center gap-4">
//                                         <ShieldX size={80} className="text-red-500 glitch-icon" />
//                                         <span className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.4em]">Link Severed</span>
//                                     </div>
//                                 )}

//                                 {/* Inner Diagnostic Ring */}
//                                 <div className={`absolute inset-4 border border-white/5 rounded-[3.5rem] flex items-center justify-center`}>
//                                      <Activity size={120} className={`opacity-5 ${errorType === 'credits' ? 'text-amber-500' : 'text-red-500'}`} />
//                                 </div>
//                              </div>

//                              {/* Reactive Orbital Rings */}
//                              <div className={`absolute inset-0 border-2 border-dashed rounded-full -m-8 animate-[spin_15s_linear_infinite] opacity-40 ${errorType === 'credits' ? 'border-amber-500' : 'border-red-500'}`}></div>
//                              <div className={`absolute inset-0 border border-dotted rounded-full -m-16 animate-[spin_30s_linear_infinite_reverse] opacity-20 ${errorType === 'credits' ? 'border-amber-500' : 'border-red-500'}`}></div>

//                              {/* Floating Status Dots */}
//                              <div className={`absolute -top-4 -left-4 w-4 h-4 rounded-full animate-ping ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
//                         </div>

//                         {/* Status Typography */}
//                         <div className="space-y-6 mb-14">
//                             <h2 className={`text-6xl md:text-8xl font-black uppercase tracking-tighter transition-all duration-700 ${errorType === 'credits' ? 'text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]'}`}>
//                                 {errorType === 'traffic' ? 'Load Limit' : errorType === 'credits' ? 'Sync Required' : 'Signal Lost'}
//                             </h2>
//                             <div className="flex items-center justify-center gap-4">
//                                 <div className={`h-1.5 w-24 rounded-full blur-[1px] ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
//                                 <div className="text-[11px] font-black uppercase tracking-[0.8em] text-gray-500">Anomaly Detected</div>
//                                 <div className={`h-1.5 w-24 rounded-full blur-[1px] ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
//                             </div>
//                         </div>

//                         {/* Diagnostic Panel */}
//                         <div className="relative max-w-3xl mx-auto mb-16">
//                              {/* Digital Scanning Laser Overlay */}
//                              <div className={`absolute top-0 left-0 w-full h-[4px] z-30 animate-[scan_4s_linear_infinite] shadow-2xl opacity-80 ${errorType === 'credits' ? 'bg-amber-400 shadow-amber-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>

//                              <div className="glass-panel border-white/10 rounded-[3rem] p-12 md:p-20 shadow-[0_50px_120px_rgba(0,0,0,1)] bg-black/40 backdrop-blur-3xl overflow-hidden group">
//                                  {/* Background HUD elements */}
//                                  <Terminal size={200} className="absolute -bottom-10 -right-10 text-white/[0.02] rotate-12" />
//                                  <Fingerprint size={200} className="absolute -top-10 -left-10 text-white/[0.02] -rotate-12" />

//                                  <p className="text-3xl md:text-4xl text-gray-200 font-black leading-tight tracking-tight relative z-10 glitch-text">
//                                     {errorMessage}
//                                  </p>

//                                  <div className="mt-12 flex flex-col items-center gap-6 relative z-10">
//                                      <div className={`h-1 w-full max-w-xs bg-white/5 rounded-full overflow-hidden`}>
//                                          <div className={`h-full animate-progress-indeterminate ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
//                                      </div>
//                                      <div className="flex items-center gap-4 text-gray-600 text-[10px] font-black uppercase tracking-[0.6em]">
//                                          <SignalHigh size={14} className="animate-pulse" />
//                                          {errorType === 'credits' ? 'Awaiting Balance Authorization' : 'Attempting Neural Handshake'}
//                                      </div>
//                                  </div>
//                              </div>
//                         </div>

//                         {/* Action Interface */}
//                         <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
//                             {errorType === 'credits' ? (
//                                 <button 
//                                     onClick={onNavigatePricing}
//                                     className="w-full sm:w-auto px-6 py-4 sm:px-20 sm:py-7 bg-amber-500 hover:bg-amber-400 rounded-3xl font-black text-black hover:shadow-[0_0_60px_rgba(245,158,11,0.7)] transition-all shadow-3xl uppercase tracking-[0.3em] active:scale-95 flex items-center justify-center gap-5 group text-xl"
//                                 >
//                                     <Zap size={28} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
//                                     Synchronize Balance
//                                 </button>
//                             ) : (
//                                 <button 
//                                     onClick={() => { setStatus(GenerationStatus.IDLE); handleGenerate(); }}
//                                     className="w-full sm:w-auto px-6 py-4 sm:px-20 sm:py-7  gradient-bg rounded-3xl font-black text-white hover:shadow-[0_0_60px_rgba(255,0,82,0.7)] transition-all shadow-3xl uppercase tracking-[0.3em] active:scale-95 flex items-center justify-center gap-5 group text-xl"
//                                 >
//                                     <RotateCcw size={28} className="group-hover:rotate-180 transition-transform duration-1000" />
//                                     Re-Initialize
//                                 </button>
//                             )}
//                             <button 
//                                 onClick={() => setCurrentStep('config')}
//                                 className="w-full sm:w-auto px-16 py-7 bg-white/5 border border-white/10 rounded-3xl font-black text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.3em] active:scale-95 text-lg"
//                             >
//                                 {errorType === 'credits' ? 'Compare Plans' : 'Diagnostic Reset'}
//                             </button>
//                         </div>

//                         {/* Footer Status Bar */}
//                         <div className="mt-24 flex items-center justify-center gap-10 text-gray-700">
//                              <div className="h-px flex-1 bg-white/5"></div>
//                              <button onClick={onNavigatePricing} className="text-[12px] font-black uppercase tracking-[0.6em] hover:text-primary transition-all whitespace-nowrap">
//                                  {errorType === 'credits' ? 'Upgrade to Pro Access' : 'Skip the wait - Get VIP'}
//                              </button>
//                              <div className="h-px flex-1 bg-white/5"></div>
//                         </div>
//                     </div>
//                 ) : status !== GenerationStatus.COMPLETED ? (
//                     <div className="max-w-xl mx-auto text-center">
//                         <div className="space-y-16">
//                             {/* Progresive Neural HUD */}
//                             <div className="relative w-72 h-72 mx-auto">
//                                 <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_20px_rgba(255,0,82,0.3)]">
//                                     <circle
//                                         cx="144"
//                                         cy="144"
//                                         r="120"
//                                         fill="transparent"
//                                         stroke="rgba(255,255,255,0.03)"
//                                         strokeWidth="4"
//                                     />
//                                     <circle
//                                         cx="144"
//                                         cy="144"
//                                         r="120"
//                                         fill="transparent"
//                                         stroke="url(#progressGrad)"
//                                         strokeWidth="12"
//                                         strokeDasharray={754}
//                                         strokeDashoffset={754 - (754 * progress) / 100}
//                                         strokeLinecap="round"
//                                         className="transition-all duration-700 ease-out"
//                                     />
//                                     <defs>
//                                         <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
//                                             <stop offset="0%" stopColor="#ff0052" />
//                                             <stop offset="100%" stopColor="#ff00f9" />
//                                         </linearGradient>
//                                     </defs>
//                                 </svg>
//                                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                                     <span className="text-7xl font-black text-white tracking-tighter">{Math.round(progress)}%</span>
//                                     <div className="flex gap-1 mt-2">
//                                         {[...Array(5)].map((_, i) => (
//                                             <div key={i} className={`h-1 w-3 rounded-full ${i < (progress / 20) ? 'bg-primary' : 'bg-white/10'}`}></div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="animate-[fadeIn_0.5s_ease-out]">
//                                 <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">
//                                     {status === GenerationStatus.UPLOADING ? 'Transmitting' : 'Neural Processing'}
//                                 </h2>
//                                 <p className="text-gray-500 mb-16 text-xl font-bold tracking-tight">Constructing High-Fidelity Layers...</p>

//                                 <div className="bg-[#050505] border border-white/5 rounded-[4rem] p-12 shadow-[0_40px_120px_rgba(0,0,0,1)] relative overflow-hidden text-left group">
//                                     <div className="absolute top-0 left-0 w-2.5 h-full bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all"></div>
//                                     <div className="flex items-center justify-between mb-8">
//                                         <div className="flex items-center gap-4 text-amber-500 font-black uppercase tracking-[0.3em] text-[11px]">
//                                             <Activity size={20} className="animate-pulse" />
//                                             Pipeline Status: ACTIVE
//                                         </div>
//                                         <div className="px-6 py-2.5 rounded-2xl bg-amber-500/10 text-amber-500 text-[11px] font-black border border-amber-500/20 shadow-inner">POS: #{queuePosition}</div>
//                                     </div>
//                                     <p className="text-gray-500 text-[12px] leading-relaxed mb-10 font-black uppercase tracking-[0.2em]">
//                                         Our clusters are optimizing for your selected configuration. High-resolution rendering requires intense computational power.
//                                     </p>
//                                     <button 
//                                         onClick={onNavigatePricing}
//                                         className="w-full py-6 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 rounded-3xl text-amber-500 text-[11px] font-black transition-all flex items-center justify-center gap-4 uppercase tracking-[0.4em] active:scale-95 group"
//                                     >
//                                         <Zap size={18} fill="currentColor" className="group-hover:scale-125 transition-transform" />
//                                         Authorize Priority Rendering
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="animate-[fadeIn_1s_ease-out]">
//                          <div className="flex items-center justify-between mb-14">
//                             <button 
//                                 onClick={reset}
//                                 className="group flex items-center gap-5 px-10 py-5 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all shadow-3xl active:scale-95"
//                             >
//                                 <ArrowLeft size={24} className="text-gray-400 group-hover:text-primary transition-transform group-hover:-translate-x-1" />
//                                 <span className="text-sm font-black text-gray-300 group-hover:text-white uppercase tracking-[0.3em]">New Session</span>
//                             </button>

//                             <div className="flex items-center gap-5 px-10 py-5 rounded-[2.5rem] bg-green-500/5 border border-green-500/20 text-green-400 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
//                                 <CheckCircle2 size={24} className="animate-bounce" />
//                                 <span className="text-[12px] font-black uppercase tracking-[0.4em]">Integrity Verified</span>
//                             </div>
//                          </div>

//                          <div className="bg-[#050505] border border-white/10 rounded-[5rem] overflow-hidden shadow-[0_80px_200px_rgba(0,0,0,1)] flex flex-col lg:flex-row min-h-[750px] ring-1 ring-white/5">
//                             <div className="w-full lg:w-[78%] bg-black relative flex items-center justify-center p-14 overflow-hidden">
//                                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,82,0.15)_0%,transparent_80%)]"></div>

//                                 <div className="relative z-10 max-h-full max-w-full rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] group ring-4 ring-white/5">
//                                      <img 
//                                         src={resultUrl || ""} 
//                                         alt="Output Diagnostic" 
//                                         className="max-h-[600px] object-contain transition-all duration-1000 group-hover:scale-[1.03]" 
//                                      />
//                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
//                                 </div>
//                             </div>

//                             <div className="w-full lg:w-[22%] border-l border-white/5 bg-[#080808] p-12 flex flex-col justify-between">
//                                 <div className="animate-[fadeIn_1.2s_ease-out]">
//                                     <div className="flex items-center gap-5 mb-12 text-primary">
//                                         <Wand2 size={40} />
//                                         <h2 className="text-4xl font-black text-white uppercase tracking-tighter">FINALISED</h2>
//                                     </div>

//                                     <div className="space-y-8">
//                                         <div className="p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/5 hover:bg-white/[0.05] transition-colors">
//                                             <div className="text-[10px] text-gray-600 uppercase font-black mb-3 tracking-[0.4em]">Target ID</div>
//                                             <div className="text-white font-black text-sm uppercase leading-relaxed">{config.gender} • {config.bodyType}<br/>{config.age} Diagnostic</div>
//                                         </div>
//                                         <div className="p-8 bg-green-500/5 rounded-[2.5rem] border border-green-500/10 shadow-inner">
//                                             <div className="text-[10px] text-green-500 uppercase font-black mb-3 tracking-[0.4em]">Signal</div>
//                                             <div className="text-green-400 font-black text-sm uppercase tracking-tighter">RENDER OPTIMIZED</div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-6 mt-20">
//                                     <a 
//                                         href={resultUrl || "#"} 
//                                         download={`RemoveCloths_${Date.now()}.png`}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="w-full py-7 gradient-bg rounded-[2.5rem] font-black text-white shadow-4xl hover:shadow-primary/70 transition-all flex items-center justify-center gap-5 uppercase tracking-[0.3em] active:scale-95 group text-xl"
//                                     >
//                                         <Download size={30} className="group-hover:animate-bounce" />
//                                         Save Results
//                                     </a>
//                                     <button 
//                                         onClick={reset}
//                                         className="w-full py-6 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-gray-500 hover:text-white transition-all flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-[11px]"
//                                     >
//                                         <RotateCcw size={20} />
//                                         Wipe Cache
//                                     </button>
//                                 </div>
//                             </div>
//                          </div>
//                     </div>
//                 )}
//             </div>

//             <style>{`
//                 @keyframes scan {
//                     0% { top: 0%; opacity: 0; }
//                     10% { opacity: 1; }
//                     90% { opacity: 1; }
//                     100% { top: 100%; opacity: 0; }
//                 }
//                 .glitch-text {
//                     animation: glitch 2.5s linear infinite;
//                 }
//                 @keyframes glitch {
//                     0% { transform: translate(0); text-shadow: none; }
//                     1% { transform: translate(-4px, 1px); text-shadow: 2px 0 #ff0052, -2px 0 #00ffff; }
//                     2% { transform: translate(4px, -1px); text-shadow: -2px 0 #ff0052, 2px 0 #00ffff; }
//                     3% { transform: translate(0); text-shadow: none; }
//                     100% { transform: translate(0); }
//                 }
//                 @keyframes progress-indeterminate {
//                     0% { left: -40%; width: 40%; }
//                     100% { left: 100%; width: 40%; }
//                 }
//                 .animate-progress-indeterminate {
//                     position: relative;
//                     animation: progress-indeterminate 1.5s infinite linear;
//                 }
//                 .animate-pulse-slow {
//                     animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//                 }
//                 .glitch-icon {
//                     animation: glitchIcon 0.8s infinite;
//                 }
//                 @keyframes glitchIcon {
//                     0% { transform: scale(1) translate(0); filter: hue-rotate(0deg); }
//                     10% { transform: scale(1.1) translate(-2px, 2px); filter: hue-rotate(90deg); }
//                     20% { transform: scale(0.9) translate(2px, -2px); filter: hue-rotate(180deg); }
//                     30% { transform: scale(1) translate(0); filter: hue-rotate(0deg); }
//                 }
//             `}</style>
//         </div>
//     )
//   }

//   return (
//     <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-24 pb-12 px-4 bg-gray-50 dark:bg-black transition-colors duration-300">
//       <div className="max-w-5xl mx-auto">

//         <div className="flex items-center justify-center mb-12 space-x-6">
//             <div className={`flex items-center gap-3 ${currentStep === 'upload' ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
//                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black border-2 transition-all ${currentStep === 'upload' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(255,0,82,0.4)]' : currentStep === 'config' ? 'bg-primary border-primary text-black' : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-surface'}`}>
//                   {currentStep === 'config' ? <Check size={20} /> : '1'}
//                 </div>
//                 <span className={`font-black uppercase tracking-widest text-xs hidden sm:inline ${currentStep === 'config' ? 'text-primary' : ''}`}>Source</span>
//             </div>
//             <div className={`w-16 h-0.5 transition-colors ${currentStep === 'config' ? 'bg-primary/50' : 'bg-gray-300 dark:bg-gray-800'}`}></div>
//             <div className={`flex items-center gap-3 ${currentStep === 'config' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
//                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black border-2 transition-all ${currentStep === 'config' ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(255,0,82,0.4)]' : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-surface'}`}>2</div>
//                 <span className="font-black uppercase tracking-widest text-xs hidden sm:inline">Settings</span>
//             </div>
//         </div>

//         {currentStep === 'upload' ? (
//             <div className="bg-white/90 dark:bg-[#101010]/90 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[3rem] p-8 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-[fadeIn_0.6s_ease-out]">
//                  <div className="text-center mb-16">
//                     <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">Target Data</h2>
//                     <p className="text-gray-600 dark:text-gray-400 font-bold max-w-lg mx-auto uppercase tracking-widest text-xs">
//                         High resolution ensures professional reconstruction
//                     </p>
//                  </div>

//                  <div className="max-w-2xl mx-auto">
//                     {!previewUrl ? (
//                          <div 
//                             className="h-[320px] sm:h-[480px] border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-primary/[0.03] rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-700 cursor-pointer group relative overflow-hidden"
//                             onClick={() => fileInputRef.current?.click()}
//                         >
//                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,0,82,0.05)_0%,_transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

//                             <div className="relative z-10 flex flex-col items-center">
//                                 <div className="w-32 h-32 rounded-[2rem] bg-white dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 shadow-2xl group-hover:shadow-primary/40 group-hover:border-primary/50 group-hover:rotate-6">
//                                     <Upload className="text-gray-400 group-hover:text-primary transition-colors duration-300" size={48} />
//                                 </div>
//                                 <p className="text-4xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors tracking-tighter uppercase">Open Image</p>
//                                 <p className="text-gray-500 text-xs font-black uppercase tracking-widest">DRAG & DROP OR BROWSE STORAGE</p>
//                                 <div className="mt-10 flex gap-4">
//                                     {['JPG', 'PNG', 'WEBP'].map(ext => (
//                                         <span key={ext} className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] text-gray-500 dark:text-gray-400 font-black tracking-[0.2em]">{ext}</span>
//                                     ))}
//                                 </div>
//                             </div>

//                             <input 
//                                 type="file" 
//                                 ref={fileInputRef} 
//                                 className="hidden" 
//                                 accept="image/*" 
//                                 onChange={handleFileChange}
//                             />
//                         </div>
//                     ) : (
//                          <div className="relative rounded-[2.5rem] overflow-hidden border border-gray-200 dark:border-white/10 group bg-gray-50 dark:bg-[#050505] shadow-2xl animate-[fadeIn_0.6s_ease-out] ring-1 ring-white/10">
//                             <div className="relative h-[480px] w-full flex items-center justify-center bg-black/50 p-4">
//                                 <img 
//                                     src={previewUrl} 
//                                     alt="Preview" 
//                                     className="max-h-full max-w-full object-contain rounded-xl" 
//                                 />
//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//                             </div>
//                             <button 
//                                 onClick={reset}
//                                 className="absolute top-8 right-8 p-5 bg-black/70 hover:bg-red-500/90 backdrop-blur-2xl rounded-2xl text-white border border-white/10 transition-all duration-500 hover:rotate-90 z-20 shadow-2xl"
//                             >
//                                 <X size={28} />
//                             </button>
//                         </div>
//                     )}

//                     <div className="mt-16 flex justify-center">
//                          <button
//                             onClick={handleNextToConfig}
//                             disabled={!selectedFile}
//                             className={`
//                                 w-full md:w-auto px-6 py-4 sm:px-12 sm:py-5 md:px-20 md:py-6  rounded-[2rem] font-black text-lg sm:text-xl md:text-2xl flex items-center justify-center gap-4 transition-all duration-700 relative overflow-hidden group active:scale-95
//                                 ${!selectedFile
//                                 ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-white/5' 
//                                 : 'gradient-bg text-white shadow-[0_20px_50px_rgba(255,0,82,0.4)] hover:shadow-primary/60 hover:scale-105'
//                                 }
//                             `}
//                         >
//                             <span className="relative flex items-center gap-3 tracking-tighter uppercase">
//                                 Configure Render
//                                 <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
//                             </span>
//                         </button>
//                     </div>
//                  </div>
//             </div>
//         ) : (
//             <div className="space-y-12">
//                 <div className="flex flex-col sm:flex-row items-center justify-between pb-10 border-b border-gray-200 dark:border-white/10 animate-[fadeIn_0.5s_ease-out_forwards]">
//                     <div className="mb-6 sm:mb-0 text-center sm:text-left">
//                          <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">AI Settings</h2>
//                          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mt-2">Adjust parameters for high-fidelity reconstruction</p>
//                     </div>
//                     <button 
//                         onClick={handleBackToUpload}
//                         className="px-8 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3 border border-gray-200 dark:border-white/10 shadow-sm active:scale-95"
//                     >
//                         <RotateCcw size={18} /> SWAP IMAGE
//                     </button>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
//                     <div className="lg:col-span-2 space-y-8 lg:space-y-12">
//                         {/* <Section title="1. TARGET GENDER" delay={0}>
//                         <div className="flex gap-3 sm:gap-8 w-full">
//                             {['female', 'male'].map((g) => (
//                             <button
//                                 key={g}
//                                 onClick={() => handleConfigChange('gender', g)}
//                                 className={`
//                                 flex-1 min-w-0 
//                                 px-4 py-6 sm:px-8 sm:py-12 
//                                 rounded-[2.5rem] font-black capitalize
//                                 text-lg sm:text-2xl
//                                 transition-all border-2 flex flex-col items-center justify-center gap-5 group
//                                 ${config.gender === g 
//                                     ? 'bg-primary/5 border-primary text-primary shadow-[0_25px_60px_rgba(255,0,82,0.15)]' 
//                                     : 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-white/5 text-gray-400 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}
//                                 `}
//                             >
//                                 <div className={`p-4 sm:p-6 rounded-[1.5rem] transition-all duration-500 ${config.gender === g ? 'bg-primary text-white scale-110 rotate-6 shadow-xl shadow-primary/30' : 'bg-gray-100 dark:bg-white/5 group-hover:scale-110 group-hover:rotate-6'}`}>
//                                 {g === 'female' ? <Venus size={40} /> : <Mars size={40} />}
//                                 </div>
//                                 <span className="uppercase tracking-widest">{g}</span>
//                             </button>
//                             ))}
//                         </div>
//                         </Section> */}
//                         <Section title="1. TARGET GENDER" delay={0}>
//                         <div className="grid grid-cols-2 gap-3 sm:gap-8 w-full">
//                             {CONFIG_OPTIONS.GENDER_OPTIONS.map((m) => (
//                             <ImageCard
//                                 key={m.id}
//                                 label={m.label}
//                                 image={m.image}
//                                 selected={config.gender === m.id}
//                                 onClick={() => handleConfigChange('gender', m.id)}
//                             />
//                             ))}
//                         </div>
//                         </Section>

//                         <Section title="2. RECONSTRUCTION STYLE" delay={1}>
//                             <div className="grid grid-cols-2 sm:grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
//                                 {CONFIG_OPTIONS.modes.map((m) => (
//                                     <ImageCard 
//                                         key={m.id}
//                                         label={m.label}
//                                         image={m.image}
//                                         selected={config.mode === m.id}
//                                         onClick={() => handleConfigChange('mode', m.id)}
//                                     />
//                                 ))}
//                             </div>
//                         </Section>

//                         <Section title="3. ANATOMICAL BUILD" delay={2}>
//                             <div className="grid grid-cols-2 sm:grid-cols-2 sm:grid-cols-4 gap-5">
//                                 {CONFIG_OPTIONS.bodyTypes.map((b) => (
//                                     <ImageCard 
//                                         key={b.id}
//                                         label={b.label}
//                                         image={b.image}
//                                         selected={config.bodyType === b.id}
//                                         onClick={() => handleConfigChange('bodyType', b.id)}
//                                     />
//                                 ))}
//                             </div>
//                         </Section>
//                     </div>

//                     <div className="lg:col-span-1 space-y-12">
//                         <Section title="ESTIMATED AGE" delay={3}>
//                             <div className="flex flex-wrap gap-3">
//                                 {CONFIG_OPTIONS.age.map((age) => (
//                                     <button
//                                         key={age}
//                                         onClick={() => handleConfigChange('age', age)}
//                                         className={`
//                                             flex-1 min-w-[100px] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border
//                                             ${config.age === age 
//                                                 ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' 
//                                                 : 'bg-white dark:bg-[#0d0d0d] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.05]'}
//                                         `}
//                                     >
//                                         {age}
//                                     </button>
//                                 ))}
//                             </div>
//                         </Section>

//                         <Section title={config.gender === 'male' ? "PENIS TEXTURE" : "GENITAL TYPE"} delay={4}>
//                             <div className="grid grid-cols-3 gap-3">
//                                 {CONFIG_OPTIONS.genitals.map((g) => (
//                                     <ImageCard 
//                                         key={g.id}
//                                         label={g.label}
//                                         image={g.image} 
//                                         selected={config.genitalType === g.id}
//                                         onClick={() => handleConfigChange('genitalType', g.id)}
//                                         compact
//                                     />
//                                 ))}
//                             </div>
//                         </Section>

//                         <div className="space-y-10">
//                             {config.gender === 'female' && (
//                                 <Section title="UPPER VOLUME" delay={5}>
//                                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                                         {CONFIG_OPTIONS.breastSizes.map((opt) => (
//                                             <ImageCard 
//                                                 key={opt.id}
//                                                 label={opt.label}
//                                                 image={opt.image} 
//                                                 selected={config.breastSize === opt.id}
//                                                 onClick={() => handleConfigChange('breastSize', opt.id)}
//                                                 compact
//                                             />
//                                         ))}
//                                     </div>
//                                 </Section>
//                             )}

//                             <Section title="LOWER VOLUME" delay={config.gender === 'female' ? 6 : 5}>
//                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                                     {CONFIG_OPTIONS.assSizes.map((opt) => (
//                                         <ImageCard 
//                                             key={opt.id}
//                                             label={opt.label}
//                                             image={opt.image} 
//                                             selected={config.assSize === opt.id}
//                                             onClick={() => handleConfigChange('assSize', opt.id)}
//                                             compact
//                                         />
//                                     ))}
//                                 </div>
//                             </Section>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="relative sm:sticky sm:bottom-8 z-30 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-6 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] mt-20 gap-8 animate-[slideInUp_0.8s_ease-out]">
//                      <div className="flex items-center gap-4">
//                          <div className="hidden lg:flex items-center gap-4">
//                             <StatusPill label="IDENTITY" value={config.gender} />
//                             <ChevronRight size={18} className="text-gray-400" />
//                             <StatusPill label="MODE" value={config.mode} />
//                             <ChevronRight size={18} className="text-gray-400" />
//                             <StatusPill label="ANATOMY" value={config.bodyType} />
//                          </div>
//                      </div>

//                      <button 
//                         onClick={handleGenerate}
//                         disabled={!isConfigComplete()}
//                         className={`
//                             w-full sm:w-auto px-6 py-4 sm:px-12 sm:py-5 md:px-16 md:py-5 rounded-2xl font-black text-lg sm:text-xl md:text-2xl flex items-center justify-center gap-4 transition-all duration-700 active:scale-95
//                              ${!isConfigComplete()
//                                 ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50 border border-transparent'
//                                 : 'gradient-bg text-white hover:shadow-primary/70 hover:scale-105 shadow-2xl uppercase tracking-tighter ring-2 ring-white/10'
//                              }
//                         `}
//                      >
//                         < Wand2 size={28} className={isConfigComplete() ? "animate-pulse" : ""} />
//                         {isConfigComplete() ? "INITIALIZE PIPELINE" : "INCOMPLETE CONFIG"}
//                      </button>
//                 </div>
//             </div>
//         )}
//       </div>
//       <style>{`
//         @keyframes slideInUp {
//             from { transform: translateY(40px); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//         }
//       `}</style>
//     </div>
//   );
// };

// const Section: React.FC<{title: string; children: React.ReactNode; delay?: number}> = ({ title, children, delay = 0 }) => (
//     <div 
//         className="bg-white dark:bg-[#0b0b0b] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all duration-700 hover:border-primary/30 shadow-sm hover:shadow-2xl animate-[slideInUp_0.6s_ease-out_forwards] opacity-0"
//         style={{ animationDelay: `${delay * 120}ms` }}
//     >
//         <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
//             <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
//             {title}
//         </h3>
//         {children}
//     </div>
// );

// const StatusPill: React.FC<{label: string, value?: string}> = ({label, value}) => (
//     <div className={`px-5 py-2 rounded-2xl border text-[10px] font-black tracking-[0.2em] transition-all ${value ? 'border-primary/50 text-primary bg-primary/10 shadow-[0_0_15px_rgba(255,0,82,0.1)]' : 'border-gray-200 dark:border-white/10 text-gray-400'}`}>
//         {value ? value.toUpperCase() : label}
//     </div>
// );

// const ImageCard: React.FC<{label: string; image: string; selected: boolean; onClick: () => void; compact?: boolean}> = ({ label, image, selected, onClick, compact }) => (
//     <div 
//         onClick={onClick}
//         className={`
//             relative aspect-[3/4] max-h-[220px] sm:max-h-none rounded-3xl overflow-hidden cursor-pointer group transition-all duration-700
//             ${selected ? 'ring-4 ring-primary scale-105 shadow-3xl z-10' : 'border border-gray-200 dark:border-white/10 grayscale hover:grayscale-0 hover:border-gray-400 dark:hover:border-white/20 opacity-60 hover:opacity-100 hover:scale-[1.04]'}
//         `}
//     >
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/95 z-10"></div>
//         <img 
//             src={image} 
//             alt={label} 
//             className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
//         />
//         <div className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${selected ? 'bg-primary shadow-lg scale-110' : 'bg-black/60 border border-white/30 backdrop-blur-md'}`}>
//             {selected && <Check size={18} className="text-white font-black" />}
//         </div>
//         <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-center">
//             <span className={`font-black uppercase tracking-[0.2em] ${compact ? 'text-[9px]' : 'text-xs'} ${selected ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
//         </div>
//     </div>
// );
import React, { useState, useRef, useEffect } from 'react';
import {
    Upload, X, Loader2, Wand2, Download, AlertCircle, ArrowRight, ArrowLeft,
    Check, ChevronRight, Venus, Mars, Clock, Zap, CheckCircle2, RotateCcw,
    AlertTriangle, Users, CreditCard, ShieldAlert, Plus, ShieldX, Activity, ZapOff,
    SignalHigh, Terminal, Fingerprint
} from 'lucide-react';
import { User, GenerationStatus, GenerationConfig, CONFIG_OPTIONS, GENERATION_API_URL } from '../types';
const IMGBB_API_KEY = "6a3e7822518b657fe71fee809a5741f0";

interface AppInterfaceProps {
    user: User;
    onUpdateCredits: (newAmount: number) => void;
    onNavigatePricing: () => void;
}

export const AppInterface: React.FC<AppInterfaceProps> = ({ user, onUpdateCredits, onNavigatePricing }) => {
    const [currentStep, setCurrentStep] = useState<'upload' | 'config' | 'processing'>('upload');
    const [config, setConfig] = useState<Partial<GenerationConfig>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'traffic' | 'pipeline' | 'credits' | null>(null);
    const [progress, setProgress] = useState(0);
    const [queuePosition, setQueuePosition] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);




    const isConfigComplete = () => {
        if (!config.gender || !config.age || !config.mode || !config.bodyType || !config.assSize || !config.genitalType) {
            return false;
        }
        if (config.gender === 'female' && !config.breastSize) {
            return false;
        }
        return true;
    };

    const handleConfigChange = (key: keyof GenerationConfig, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };




    const handleNextToConfig = () => {
        if (!selectedFile) return;
        window.scrollTo(0, 0);
        setCurrentStep('config');
    };

    const handleBackToUpload = () => {
        window.scrollTo(0, 0);
        setCurrentStep('upload');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Strict Validation: JPEG/PNG only, max 25MB
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            const maxSizeBytes = 25 * 1024 * 1024;

            if (!allowedMimeTypes.includes(file.type)) {
                setErrorMessage("Unsupported file format. Please upload JPEG or PNG.");
                setErrorType('pipeline');
                setStatus(GenerationStatus.ERROR);
                // Clear input to allow re-selection
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            if (file.size > maxSizeBytes) {
                setErrorMessage("File is too large. Maximum size is 25MB.");
                setErrorType('pipeline');
                setStatus(GenerationStatus.ERROR);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl(null);
            setStatus(GenerationStatus.IDLE);
            setErrorMessage(null);
            setErrorType(null);
        }
    };


    const handleGenerate = async () => {
        if (!isConfigComplete() || !selectedFile) return;

        if (user.credits <= 0) {
            setErrorType('credits');
            setErrorMessage("You dont have sufficient credits please top-up for nonstop use");
            setStatus(GenerationStatus.ERROR);
            setCurrentStep('processing');
            return;
        }

        setErrorMessage(null);
        setErrorType(null);
        setCurrentStep('processing');
        setStatus(GenerationStatus.UPLOADING);
        setProgress(5);

        const startQueue = Math.floor(Math.random() * 15) + 10;
        setQueuePosition(startQueue);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000);

        try {
            // 1. Upload to ImgBB first
            const formData = new FormData();
            formData.append('image', selectedFile);

            const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?expiration=600&key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            if (!imgbbResponse.ok) {
                throw new Error("Failed to upload image to the cloud. Please try again.");
            }

            const imgbbData = await imgbbResponse.json();
            const displayUrl = imgbbData.data.display_url;

            // Update progress after successful upload
            setProgress(20);
            setStatus(GenerationStatus.PROCESSING);

            let currentProgress = 20;
            const progressInterval = setInterval(() => {
                if (currentProgress < 98) {
                    const increment = (100 - currentProgress) / 200;
                    currentProgress += increment;
                    setProgress(currentProgress);
                }
                if (Math.random() > 0.94 && queuePosition > 1) {
                    setQueuePosition(prev => Math.max(1, prev - 1));
                }
            }, 1500);

            const token = localStorage.getItem('auth_token');

            // PRECISE MAPPING TO BACKEND GenerationSettings MODEL
            const generationSettings = {
                generationMode: config.mode,
                gender: config.gender,
                age: config.age?.toLowerCase() || 'automatic',
                bodyType: config.bodyType,
                breastsSize: config.breastSize || 'none',
                assSize: config.assSize,
                pussy: config.gender === 'female' ? config.genitalType : 'shaved',
                penis: config.gender === 'male' ? config.genitalType : 'shaved'
            };

            // Sending image_url instead of base64
            const payload = {
                request: { image_url: displayUrl },
                settings: generationSettings
            };

            const response = await fetch(`${GENERATION_API_URL}/generate-image/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const detail = errorData.detail || {};
                const backendErrorMsg = (detail.message || detail.error || errorData.message || "").toString();

                if (response.status === 402 || response.status === 403 || backendErrorMsg.toLowerCase().includes("credits")) {
                    setErrorType('credits');
                    throw new Error("You dont have sufficient credits please top-up for nonstop use");
                } else if (response.status === 503 || response.status === 429) {
                    setErrorType('traffic');
                    throw new Error("We are currently facing higher traffic exceeded 1000 users so please revisit us after some time");
                } else {
                    setErrorType('pipeline');
                    throw new Error("due to some unconvinence issue image generation is failed");
                }
            }

            const data = await response.json();

            if (data.success && data.result?.url) {
                setResultUrl(data.result.url);
                setProgress(100);
                setStatus(GenerationStatus.COMPLETED);

                if (typeof data.credits_remaining === 'number') {
                    onUpdateCredits(data.credits_remaining);
                } else {
                    onUpdateCredits(user.credits - 1);
                }
            } else {
                setErrorType('pipeline');
                throw new Error("due to some unconvinence issue image generation is failed");
            }

        } catch (err: any) {
            clearTimeout(timeoutId);
            setStatus(GenerationStatus.ERROR);

            if (err.name === 'AbortError') {
                setErrorType('traffic');
                setErrorMessage("We are currently facing higher traffic exceeded 1000 users so please revisit us after some time");
            } else {
                setErrorMessage(err.message || "due to some unconvinence issue image generation is failed");
                if (err.message?.includes("traffic")) setErrorType('traffic');
                else if (err.message?.includes("credits")) setErrorType('credits');
                else if (!errorType) setErrorType('pipeline');
            }
        }
    };

    const reset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setStatus(GenerationStatus.IDLE);
        setErrorMessage(null);
        setErrorType(null);
        setProgress(0);
        setQueuePosition(0);
        setConfig({});
        setCurrentStep('upload');
    };

    if (currentStep === 'processing') {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 bg-black flex items-center justify-center relative transition-colors duration-500 overflow-hidden">
                {/* Neural Matrix Ambient Background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className={`absolute top-1/4 left-1/4 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] lg:w-[800px] lg:h-[800px] blur-[80px] sm:blur-[200px] rounded-full opacity-30 animate-pulse-slow ${errorType === 'credits' ? 'bg-amber-600' : 'bg-primary'}`}></div>
                    <div className={`absolute bottom-1/4 right-1/4 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] lg:w-[800px] lg:h-[800px] blur-[80px] sm:blur-[200px] rounded-full opacity-15 animate-pulse-slow ${errorType === 'credits' ? 'bg-orange-600' : 'bg-secondary'}`} style={{ animationDelay: '2s' }}></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_90%)]"></div>
                    {/* Moving Grid Lines for Tech Vibe */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
                </div>

                <div className="w-full max-w-5xl mx-auto relative z-10 px-4">
                    {status === GenerationStatus.ERROR ? (
                        <div className="text-center animate-[fadeIn_0.6s_ease-out]">

                            {/* High-Fidelity Diagnostics Hub */}
                            <div className="relative mb-16 inline-block">
                                {/* Central Core Bloom */}
                                <div className={`hidden sm:block absolute inset-0 blur-[200px] rounded-full scale-150 animate-pulse opacity-60 ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>

                                {/* Neural Core Vessel */}
                                <div className={`relative w-48 h-48 md:w-64 md:h-64 bg-[#050505] backdrop-blur-3xl border-2 rounded-[4rem] flex flex-col items-center justify-center shadow-[0_0_100px_rgba(0,0,0,1)] transition-transform duration-1000 hover:scale-110 ${errorType === 'credits' ? 'border-amber-500/50 shadow-amber-500/10' : 'border-red-500/50 shadow-red-500/10'}`}>
                                    {errorType === 'traffic' ? (
                                        <div className="relative flex flex-col items-center gap-4">
                                            <Users size={80} className="text-red-500 glitch-text" />
                                            <span className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.4em]">Queue Full</span>
                                        </div>
                                    ) : errorType === 'credits' ? (
                                        <div className="relative flex flex-col items-center gap-4 group">
                                            <CreditCard size={80} className="text-amber-500 group-hover:scale-110 transition-transform" />
                                            <div className="absolute -top-4 -right-4 w-14 h-14 bg-amber-500 rounded-3xl flex items-center justify-center border-4 border-[#050505] shadow-2xl animate-bounce">
                                                <Plus size={32} className="text-black font-black" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative flex flex-col items-center gap-4">
                                            <ShieldX size={80} className="text-red-500 glitch-icon" />
                                            <span className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.4em]">Link Severed</span>
                                        </div>
                                    )}

                                    {/* Inner Diagnostic Ring */}
                                    <div className={`absolute inset-4 border border-white/5 rounded-[3.5rem] flex items-center justify-center`}>
                                        <Activity size={120} className={`opacity-5 ${errorType === 'credits' ? 'text-amber-500' : 'text-red-500'}`} />
                                    </div>
                                </div>

                                {/* Reactive Orbital Rings */}
                                <div className={`absolute inset-0 border-2 border-dashed rounded-full -m-8 animate-[spin_15s_linear_infinite] opacity-40 ${errorType === 'credits' ? 'border-amber-500' : 'border-red-500'}`}></div>
                                <div className={`absolute inset-0 border border-dotted rounded-full -m-16 animate-[spin_30s_linear_infinite_reverse] opacity-20 ${errorType === 'credits' ? 'border-amber-500' : 'border-red-500'}`}></div>

                                {/* Floating Status Dots */}
                                <div className={`absolute -top-4 -left-4 w-4 h-4 rounded-full animate-ping ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                            </div>

                            {/* Status Typography */}
                            <div className="space-y-6 mb-14">
                                <h2 className={`text-6xl md:text-8xl font-black uppercase tracking-tighter transition-all duration-700 ${errorType === 'credits' ? 'text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]'}`}>
                                    {errorType === 'traffic' ? 'Load Limit' : errorType === 'credits' ? 'Sync Required' : 'Signal Lost'}
                                </h2>
                                <div className="flex items-center justify-center gap-4">
                                    <div className={`h-1.5 w-24 rounded-full blur-[1px] ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                    <div className="text-[11px] font-black uppercase tracking-[0.8em] text-gray-500">Anomaly Detected</div>
                                    <div className={`h-1.5 w-24 rounded-full blur-[1px] ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                </div>
                            </div>

                            {/* Diagnostic Panel */}
                            <div className="relative max-w-3xl mx-auto mb-16">
                                {/* Digital Scanning Laser Overlay */}
                                <div className={`absolute top-0 left-0 w-full h-[4px] z-30 animate-[scan_4s_linear_infinite] shadow-2xl opacity-80 ${errorType === 'credits' ? 'bg-amber-400 shadow-amber-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>

                                <div className="glass-panel border-white/10 rounded-[3rem] p-12 md:p-20 shadow-[0_50px_120px_rgba(0,0,0,1)] bg-black/40 backdrop-blur-3xl overflow-hidden group">
                                    {/* Background HUD elements */}
                                    <Terminal size={200} className="absolute -bottom-10 -right-10 text-white/[0.02] rotate-12" />
                                    <Fingerprint size={200} className="absolute -top-10 -left-10 text-white/[0.02] -rotate-12" />

                                    <p className="text-3xl md:text-4xl text-gray-200 font-black leading-tight tracking-tight relative z-10 glitch-text">
                                        {errorMessage}
                                    </p>

                                    <div className="mt-12 flex flex-col items-center gap-6 relative z-10">
                                        <div className={`h-1 w-full max-w-xs bg-white/5 rounded-full overflow-hidden`}>
                                            <div className={`h-full animate-progress-indeterminate ${errorType === 'credits' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-600 text-[10px] font-black uppercase tracking-[0.6em]">
                                            <SignalHigh size={14} className="animate-pulse" />
                                            {errorType === 'credits' ? 'Awaiting Balance Authorization' : 'Attempting Neural Handshake'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Interface */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                                {errorType === 'credits' ? (
                                    <button
                                        onClick={onNavigatePricing}
                                        className="w-full sm:w-auto px-6 py-4 sm:px-20 sm:py-7 bg-amber-500 hover:bg-amber-400 rounded-3xl font-black text-black hover:shadow-[0_0_60px_rgba(245,158,11,0.7)] transition-all shadow-3xl uppercase tracking-[0.3em] active:scale-95 flex items-center justify-center gap-5 group text-xl"
                                    >
                                        <Zap size={28} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                                        Synchronize Balance
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { setStatus(GenerationStatus.IDLE); handleGenerate(); }}
                                        className="w-full sm:w-auto px-6 py-4 sm:px-20 sm:py-7  gradient-bg rounded-3xl font-black text-white hover:shadow-[0_0_60px_rgba(255,0,82,0.7)] transition-all shadow-3xl uppercase tracking-[0.3em] active:scale-95 flex items-center justify-center gap-5 group text-xl"
                                    >
                                        <RotateCcw size={28} className="group-hover:rotate-180 transition-transform duration-1000" />
                                        Re-Initialize
                                    </button>
                                )}
                                <button
                                    onClick={() => setCurrentStep('config')}
                                    className="w-full sm:w-auto px-16 py-7 bg-white/5 border border-white/10 rounded-3xl font-black text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.3em] active:scale-95 text-lg"
                                >
                                    {errorType === 'credits' ? 'Compare Plans' : 'Diagnostic Reset'}
                                </button>
                            </div>

                            {/* Footer Status Bar */}
                            <div className="mt-24 flex items-center justify-center gap-10 text-gray-700">
                                <div className="h-px flex-1 bg-white/5"></div>
                                <button onClick={onNavigatePricing} className="text-[12px] font-black uppercase tracking-[0.6em] hover:text-primary transition-all whitespace-nowrap">
                                    {errorType === 'credits' ? 'Upgrade to Pro Access' : 'Skip the wait - Get VIP'}
                                </button>
                                <div className="h-px flex-1 bg-white/5"></div>
                            </div>
                        </div>
                    ) : status !== GenerationStatus.COMPLETED ? (
                        <div className="max-w-xl mx-auto text-center">
                            <div className="space-y-16">
                                {/* Progresive Neural HUD */}
                                <div className="relative w-72 h-72 mx-auto">
                                    <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_20px_rgba(255,0,82,0.3)]">
                                        <circle
                                            cx="144"
                                            cy="144"
                                            r="120"
                                            fill="transparent"
                                            stroke="rgba(255,255,255,0.03)"
                                            strokeWidth="4"
                                        />
                                        <circle
                                            cx="144"
                                            cy="144"
                                            r="120"
                                            fill="transparent"
                                            stroke="url(#progressGrad)"
                                            strokeWidth="12"
                                            strokeDasharray={754}
                                            strokeDashoffset={754 - (754 * progress) / 100}
                                            strokeLinecap="round"
                                            className="transition-all duration-700 ease-out"
                                        />
                                        <defs>
                                            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#ff0052" />
                                                <stop offset="100%" stopColor="#ff00f9" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-7xl font-black text-white tracking-tighter">{Math.round(progress)}%</span>
                                        <div className="flex gap-1 mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`h-1 w-3 rounded-full ${i < (progress / 20) ? 'bg-primary' : 'bg-white/10'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="animate-[fadeIn_0.5s_ease-out]">
                                    <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">
                                        {status === GenerationStatus.UPLOADING ? 'Transmitting' : 'Neural Processing'}
                                    </h2>
                                    <p className="text-gray-500 mb-16 text-xl font-bold tracking-tight">Constructing High-Fidelity Layers...</p>

                                    <div className="bg-[#050505] border border-white/5 rounded-[4rem] p-12 shadow-[0_40px_120px_rgba(0,0,0,1)] relative overflow-hidden text-left group">
                                        <div className="absolute top-0 left-0 w-2.5 h-full bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all"></div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4 text-amber-500 font-black uppercase tracking-[0.3em] text-[11px]">
                                                <Activity size={20} className="animate-pulse" />
                                                Pipeline Status: ACTIVE
                                            </div>
                                            <div className="px-6 py-2.5 rounded-2xl bg-amber-500/10 text-amber-500 text-[11px] font-black border border-amber-500/20 shadow-inner">POS: #{queuePosition}</div>
                                        </div>
                                        <p className="text-gray-500 text-[12px] leading-relaxed mb-10 font-black uppercase tracking-[0.2em]">
                                            Our clusters are optimizing for your selected configuration. High-resolution rendering requires intense computational power.
                                        </p>
                                        <button
                                            onClick={onNavigatePricing}
                                            className="w-full py-6 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 rounded-3xl text-amber-500 text-[11px] font-black transition-all flex items-center justify-center gap-4 uppercase tracking-[0.4em] active:scale-95 group"
                                        >
                                            <Zap size={18} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                                            Authorize Priority Rendering
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-[fadeIn_1s_ease-out]">
                            <div className="flex items-center justify-between mb-14">
                                <button
                                    onClick={reset}
                                    className="group flex items-center gap-5 px-10 py-5 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all shadow-3xl active:scale-95"
                                >
                                    <ArrowLeft size={24} className="text-gray-400 group-hover:text-primary transition-transform group-hover:-translate-x-1" />
                                    <span className="text-sm font-black text-gray-300 group-hover:text-white uppercase tracking-[0.3em]">New Session</span>
                                </button>

                                <div className="flex items-center gap-5 px-10 py-5 rounded-[2.5rem] bg-green-500/5 border border-green-500/20 text-green-400 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                                    <CheckCircle2 size={24} className="animate-bounce" />
                                    <span className="text-[12px] font-black uppercase tracking-[0.4em]">Integrity Verified</span>
                                </div>
                            </div>

                            <div className="bg-[#050505] border border-white/10 rounded-[5rem] overflow-hidden shadow-[0_80px_200px_rgba(0,0,0,1)] flex flex-col lg:flex-row min-h-[750px] ring-1 ring-white/5">
                                <div className="w-full lg:w-[78%] bg-black relative flex items-center justify-center p-14 overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,82,0.15)_0%,transparent_80%)]"></div>

                                    <div className="relative z-10 max-h-full max-w-full rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] group ring-4 ring-white/5">
                                        <img
                                            src={resultUrl || ""}
                                            alt="Output Diagnostic"
                                            className="max-h-[600px] object-contain transition-all duration-1000 group-hover:scale-[1.03]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </div>

                                <div className="w-full lg:w-[22%] border-l border-white/5 bg-[#080808] p-12 flex flex-col justify-between">
                                    <div className="animate-[fadeIn_1.2s_ease-out]">
                                        <div className="flex items-center gap-5 mb-12 text-primary">
                                            <Wand2 size={40} />
                                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">FINALISED</h2>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                                <div className="text-[10px] text-gray-600 uppercase font-black mb-3 tracking-[0.4em]">Target ID</div>
                                                <div className="text-white font-black text-sm uppercase leading-relaxed">{config.gender} • {config.bodyType}<br />{config.age} Diagnostic</div>
                                            </div>
                                            <div className="p-8 bg-green-500/5 rounded-[2.5rem] border border-green-500/10 shadow-inner">
                                                <div className="text-[10px] text-green-500 uppercase font-black mb-3 tracking-[0.4em]">Signal</div>
                                                <div className="text-green-400 font-black text-sm uppercase tracking-tighter">RENDER OPTIMIZED</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mt-20">
                                        <a
                                            href={resultUrl || "#"}
                                            download={`RemoveCloths_${Date.now()}.png`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-7 gradient-bg rounded-[2.5rem] font-black text-white shadow-4xl hover:shadow-primary/70 transition-all flex items-center justify-center gap-5 uppercase tracking-[0.3em] active:scale-95 group text-xl"
                                        >
                                            <Download size={30} className="group-hover:animate-bounce" />
                                            Save Results
                                        </a>
                                        <button
                                            onClick={reset}
                                            className="w-full py-6 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-gray-500 hover:text-white transition-all flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-[11px]"
                                        >
                                            <RotateCcw size={20} />
                                            Wipe Cache
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .glitch-text {
                    animation: glitch 2.5s linear infinite;
                }
                @keyframes glitch {
                    0% { transform: translate(0); text-shadow: none; }
                    1% { transform: translate(-4px, 1px); text-shadow: 2px 0 #ff0052, -2px 0 #00ffff; }
                    2% { transform: translate(4px, -1px); text-shadow: -2px 0 #ff0052, 2px 0 #00ffff; }
                    3% { transform: translate(0); text-shadow: none; }
                    100% { transform: translate(0); }
                }
                @keyframes progress-indeterminate {
                    0% { left: -40%; width: 40%; }
                    100% { left: 100%; width: 40%; }
                }
                .animate-progress-indeterminate {
                    position: relative;
                    animation: progress-indeterminate 1.5s infinite linear;
                }
                .animate-pulse-slow {
                    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .glitch-icon {
                    animation: glitchIcon 0.8s infinite;
                }
                @keyframes glitchIcon {
                    0% { transform: scale(1) translate(0); filter: hue-rotate(0deg); }
                    10% { transform: scale(1.1) translate(-2px, 2px); filter: hue-rotate(90deg); }
                    20% { transform: scale(0.9) translate(2px, -2px); filter: hue-rotate(180deg); }
                    30% { transform: scale(1) translate(0); filter: hue-rotate(0deg); }
                }
            `}</style>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-24 pb-12 px-4 bg-gray-50 dark:bg-black transition-colors duration-300">
            <div className="max-w-5xl mx-auto">

                <div className="flex items-center justify-center mb-12 space-x-6">
                    <div className={`flex items-center gap-3 ${currentStep === 'upload' ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black border-2 transition-all ${currentStep === 'upload' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(255,0,82,0.4)]' : currentStep === 'config' ? 'bg-primary border-primary text-black' : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-surface'}`}>
                            {currentStep === 'config' ? <Check size={20} /> : '1'}
                        </div>
                        <span className={`font-black uppercase tracking-widest text-xs hidden sm:inline ${currentStep === 'config' ? 'text-primary' : ''}`}>Source</span>
                    </div>
                    <div className={`w-16 h-0.5 transition-colors ${currentStep === 'config' ? 'bg-primary/50' : 'bg-gray-300 dark:bg-gray-800'}`}></div>
                    <div className={`flex items-center gap-3 ${currentStep === 'config' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black border-2 transition-all ${currentStep === 'config' ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(255,0,82,0.4)]' : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-surface'}`}>2</div>
                        <span className="font-black uppercase tracking-widest text-xs hidden sm:inline">Settings</span>
                    </div>
                </div>

                {currentStep === 'upload' ? (
                    <div className="bg-white/90 dark:bg-[#101010]/90 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[3rem] p-8 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-[fadeIn_0.6s_ease-out]">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">Target Data</h2>
                            <p className="text-gray-600 dark:text-gray-400 font-bold max-w-lg mx-auto uppercase tracking-widest text-xs">
                                High resolution ensures professional reconstruction
                            </p>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            {!previewUrl ? (
                                <div
                                    className="h-[320px] sm:h-[480px] border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-primary/[0.03] rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-700 cursor-pointer group relative overflow-hidden"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,0,82,0.05)_0%,_transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-32 h-32 rounded-[2rem] bg-white dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 shadow-2xl group-hover:shadow-primary/40 group-hover:border-primary/50 group-hover:rotate-6">
                                            <Upload className="text-gray-400 group-hover:text-primary transition-colors duration-300" size={48} />
                                        </div>
                                        <p className="text-4xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors tracking-tighter uppercase">Open Image</p>
                                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest">DRAG & DROP OR BROWSE STORAGE</p>
                                        <div className="mt-10 flex gap-4">
                                            {['JPG', 'PNG'].map(ext => (
                                                <span key={ext} className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] text-gray-500 dark:text-gray-400 font-black tracking-[0.2em]">{ext}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            ) : (
                                <div className="relative rounded-[2.5rem] overflow-hidden border border-gray-200 dark:border-white/10 group bg-gray-50 dark:bg-[#050505] shadow-2xl animate-[fadeIn_0.6s_ease-out] ring-1 ring-white/10">
                                    <div className="relative h-[480px] w-full flex items-center justify-center bg-black/50 p-4">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-h-full max-w-full object-contain rounded-xl"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                    <button
                                        onClick={reset}
                                        className="absolute top-8 right-8 p-5 bg-black/70 hover:bg-red-500/90 backdrop-blur-2xl rounded-2xl text-white border border-white/10 transition-all duration-500 hover:rotate-90 z-20 shadow-2xl"
                                    >
                                        <X size={28} />
                                    </button>
                                </div>
                            )}

                            <div className="mt-16 flex justify-center">
                                <button
                                    onClick={handleNextToConfig}
                                    disabled={!selectedFile}
                                    className={`
                                w-full md:w-auto px-6 py-4 sm:px-12 sm:py-5 md:px-20 md:py-6  rounded-[2rem] font-black text-lg sm:text-xl md:text-2xl flex items-center justify-center gap-4 transition-all duration-700 relative overflow-hidden group active:scale-95
                                ${!selectedFile
                                            ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-white/5'
                                            : 'gradient-bg text-white shadow-[0_20px_50px_rgba(255,0,82,0.4)] hover:shadow-primary/60 hover:scale-105'
                                        }
                            `}
                                >
                                    <span className="relative flex items-center gap-3 tracking-tighter uppercase">
                                        Configure Render
                                        <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="flex flex-col sm:flex-row items-center justify-between pb-10 border-b border-gray-200 dark:border-white/10 animate-[fadeIn_0.5s_ease-out_forwards]">
                            <div className="mb-6 sm:mb-0 text-center sm:text-left">
                                <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">AI Settings</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mt-2">Adjust parameters for high-fidelity reconstruction</p>
                            </div>
                            <button
                                onClick={handleBackToUpload}
                                className="px-8 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3 border border-gray-200 dark:border-white/10 shadow-sm active:scale-95"
                            >
                                <RotateCcw size={18} /> SWAP IMAGE
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                            <div className="lg:col-span-2 space-y-8 lg:space-y-12">
                                {/* <Section title="1. TARGET GENDER" delay={0}>
                        <div className="flex gap-3 sm:gap-8 w-full">
                            {['female', 'male'].map((g) => (
                            <button
                                key={g}
                                onClick={() => handleConfigChange('gender', g)}
                                className={`
                                flex-1 min-w-0 
                                px-4 py-6 sm:px-8 sm:py-12 
                                rounded-[2.5rem] font-black capitalize
                                text-lg sm:text-2xl
                                transition-all border-2 flex flex-col items-center justify-center gap-5 group
                                ${config.gender === g 
                                    ? 'bg-primary/5 border-primary text-primary shadow-[0_25px_60px_rgba(255,0,82,0.15)]' 
                                    : 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-white/5 text-gray-400 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}
                                `}
                            >
                                <div className={`p-4 sm:p-6 rounded-[1.5rem] transition-all duration-500 ${config.gender === g ? 'bg-primary text-white scale-110 rotate-6 shadow-xl shadow-primary/30' : 'bg-gray-100 dark:bg-white/5 group-hover:scale-110 group-hover:rotate-6'}`}>
                                {g === 'female' ? <Venus size={40} /> : <Mars size={40} />}
                                </div>
                                <span className="uppercase tracking-widest">{g}</span>
                            </button>
                            ))}
                        </div>
                        </Section> */}
                                <Section title="1. TARGET GENDER" delay={0}>
                                    <div className="grid grid-cols-2 gap-3 sm:gap-8 w-full">
                                        {CONFIG_OPTIONS.GENDER_OPTIONS.map((m) => (
                                            <ImageCard
                                                key={m.id}
                                                label={m.label}
                                                image={m.image}
                                                selected={config.gender === m.id}
                                                onClick={() => handleConfigChange('gender', m.id)}
                                            />
                                        ))}
                                    </div>
                                </Section>

                                <Section title="2. RECONSTRUCTION STYLE" delay={1}>
                                    <div className="grid grid-cols-2 sm:grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {CONFIG_OPTIONS.modes.map((m) => (
                                            <ImageCard
                                                key={m.id}
                                                label={m.label}
                                                image={m.image}
                                                selected={config.mode === m.id}
                                                onClick={() => handleConfigChange('mode', m.id)}
                                            />
                                        ))}
                                    </div>
                                </Section>

                                <Section title="3. ANATOMICAL BUILD" delay={2}>
                                    <div className="grid grid-cols-2 sm:grid-cols-2 sm:grid-cols-4 gap-5">
                                        {CONFIG_OPTIONS.bodyTypes.map((b) => (
                                            <ImageCard
                                                key={b.id}
                                                label={b.label}
                                                image={b.image}
                                                selected={config.bodyType === b.id}
                                                onClick={() => handleConfigChange('bodyType', b.id)}
                                            />
                                        ))}
                                    </div>
                                </Section>
                            </div>

                            <div className="lg:col-span-1 space-y-12">
                                <Section title="ESTIMATED AGE" delay={3}>
                                    <div className="flex flex-wrap gap-3">
                                        {CONFIG_OPTIONS.age.map((age) => (
                                            <button
                                                key={age}
                                                onClick={() => handleConfigChange('age', age)}
                                                className={`
                                            flex-1 min-w-[100px] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border
                                            ${config.age === age
                                                        ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105'
                                                        : 'bg-white dark:bg-[#0d0d0d] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.05]'}
                                        `}
                                            >
                                                {age}
                                            </button>
                                        ))}
                                    </div>
                                </Section>

                                <Section title={config.gender === 'male' ? "PENIS TEXTURE" : "GENITAL TYPE"} delay={4}>
                                    <div className="grid grid-cols-3 gap-3">
                                        {CONFIG_OPTIONS.genitals.map((g) => (
                                            <ImageCard
                                                key={g.id}
                                                label={g.label}
                                                image={g.image}
                                                selected={config.genitalType === g.id}
                                                onClick={() => handleConfigChange('genitalType', g.id)}
                                                compact
                                            />
                                        ))}
                                    </div>
                                </Section>

                                <div className="space-y-10">
                                    {config.gender === 'female' && (
                                        <Section title="UPPER VOLUME" delay={5}>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {CONFIG_OPTIONS.breastSizes.map((opt) => (
                                                    <ImageCard
                                                        key={opt.id}
                                                        label={opt.label}
                                                        image={opt.image}
                                                        selected={config.breastSize === opt.id}
                                                        onClick={() => handleConfigChange('breastSize', opt.id)}
                                                        compact
                                                    />
                                                ))}
                                            </div>
                                        </Section>
                                    )}

                                    <Section title="LOWER VOLUME" delay={config.gender === 'female' ? 6 : 5}>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {CONFIG_OPTIONS.assSizes.map((opt) => (
                                                <ImageCard
                                                    key={opt.id}
                                                    label={opt.label}
                                                    image={opt.image}
                                                    selected={config.assSize === opt.id}
                                                    onClick={() => handleConfigChange('assSize', opt.id)}
                                                    compact
                                                />
                                            ))}
                                        </div>
                                    </Section>
                                </div>
                            </div>
                        </div>

                        <div className="relative sm:sticky sm:bottom-8 z-30 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-6 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] mt-20 gap-8 animate-[slideInUp_0.8s_ease-out]">
                            <div className="flex items-center gap-4">
                                <div className="hidden lg:flex items-center gap-4">
                                    <StatusPill label="IDENTITY" value={config.gender} />
                                    <ChevronRight size={18} className="text-gray-400" />
                                    <StatusPill label="MODE" value={config.mode} />
                                    <ChevronRight size={18} className="text-gray-400" />
                                    <StatusPill label="ANATOMY" value={config.bodyType} />
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={!isConfigComplete()}
                                className={`
                            w-full sm:w-auto px-6 py-4 sm:px-12 sm:py-5 md:px-16 md:py-5 rounded-2xl font-black text-lg sm:text-xl md:text-2xl flex items-center justify-center gap-4 transition-all duration-700 active:scale-95
                             ${!isConfigComplete()
                                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50 border border-transparent'
                                        : 'gradient-bg text-white hover:shadow-primary/70 hover:scale-105 shadow-2xl uppercase tracking-tighter ring-2 ring-white/10'
                                    }
                        `}
                            >
                                < Wand2 size={28} className={isConfigComplete() ? "animate-pulse" : ""} />
                                {isConfigComplete() ? "INITIALIZE PIPELINE" : "INCOMPLETE CONFIG"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
        @keyframes slideInUp {
            from { transform: translateY(40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode; delay?: number }> = ({ title, children, delay = 0 }) => (
    <div
        className="bg-white dark:bg-[#0b0b0b] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all duration-700 hover:border-primary/30 shadow-sm hover:shadow-2xl animate-[slideInUp_0.6s_ease-out_forwards] opacity-0"
        style={{ animationDelay: `${delay * 120}ms` }}
    >
        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
            {title}
        </h3>
        {children}
    </div>
);

const StatusPill: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
    <div className={`px-5 py-2 rounded-2xl border text-[10px] font-black tracking-[0.2em] transition-all ${value ? 'border-primary/50 text-primary bg-primary/10 shadow-[0_0_15px_rgba(255,0,82,0.1)]' : 'border-gray-200 dark:border-white/10 text-gray-400'}`}>
        {value ? value.toUpperCase() : label}
    </div>
);

const ImageCard: React.FC<{ label: string; image: string; selected: boolean; onClick: () => void; compact?: boolean }> = ({ label, image, selected, onClick, compact }) => (
    <div
        onClick={onClick}
        className={`
            relative aspect-[3/4] max-h-[220px] sm:max-h-none rounded-3xl overflow-hidden cursor-pointer group transition-all duration-700
            ${selected ? 'ring-4 ring-primary scale-105 shadow-3xl z-10' : 'border border-gray-200 dark:border-white/10 grayscale hover:grayscale-0 hover:border-gray-400 dark:hover:border-white/20 opacity-60 hover:opacity-100 hover:scale-[1.04]'}
        `}
    >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/95 z-10"></div>
        <img
            src={image}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${selected ? 'bg-primary shadow-lg scale-110' : 'bg-black/60 border border-white/30 backdrop-blur-md'}`}>
            {selected && <Check size={18} className="text-white font-black" />}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-center">
            <span className={`font-black uppercase tracking-[0.2em] ${compact ? 'text-[9px]' : 'text-xs'} ${selected ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
        </div>
    </div>
);