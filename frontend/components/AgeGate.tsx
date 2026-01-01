import React from 'react';

interface AgeGateProps {
  onVerify: () => void;
}

export const AgeGate: React.FC<AgeGateProps> = ({ onVerify }) => {
  const handleReject = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.4s_ease-out] my-auto">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-100"></div>

        <div className="px-6 py-8 md:p-10 flex flex-col items-center">
            
            {/* Header / Logo */}
            <div className="flex flex-col items-center mb-8">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_30px_rgba(255,0,82,0.15)] relative">
                     <span className="font-black text-xl text-primary">18+</span>
                 </div>
                 
                 {/* Logo matched from Header */}
                 <div className="flex items-center gap-1.5 md:gap-2 select-none scale-110">
                    <span className="text-2xl text-white tracking-tight">
                      <span className="text-secondary">R</span>emove
                    </span>
                    <div className="bg-primary px-2.5 py-0.5 rounded-lg shadow-[0_0_15px_rgba(255,0,82,0.4)] flex items-center">
                       <span className="text-2xl text-white tracking-tight">Cloths</span>
                    </div>
                 </div>

                 <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-4">Age Verification</p>
            </div>

            {/* Main Title */}
            <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-8 leading-snug max-w-lg">
                You must be 18 or the legal age in your country.
            </h2>

            {/* Rules List */}
            <div className="w-full bg-[#121212] border border-white/5 rounded-2xl p-6 md:p-8 mb-6">
                <ul className="space-y-4 text-left">
                    <li className="flex items-start gap-3 text-gray-300 text-sm md:text-base leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0"></span>
                        <span>You must be 18 or the legal age in your country.</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300 text-sm md:text-base leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0"></span>
                        <span>You can't use others photos without their permission and persons under 18 years of age.</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300 text-sm md:text-base leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0"></span>
                        <span>You are solely responsible for the images you generate.</span>
                    </li>
                    <li className="flex items-start gap-3 text-white font-semibold text-sm md:text-base leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                        <span>By clicking on Accept you automatically agree to the above terms.</span>
                    </li>
                </ul>
            </div>

            {/* Legal Fine Print */}
            <div className="w-full text-[10px] md:text-[11px] text-gray-500 leading-relaxed space-y-3 mb-8 text-justify">
                <p>
                    By authenticating in our platform, you provide us with the consent to the processing of your personal data in accordance with the 
                    Privacy Policy of the service and agree to the rules of the service use prescribed by the documents of <span className="text-gray-400 font-bold">Remove Cloths</span>.
                </p>
                <p>
                    By authenticating in <span className="text-gray-400 font-bold">Remove Cloths</span>, you also confirm that you use and process within Remove Cloths only photographs containing your 
                    image or image of persons who explicitly provided you with the consent to the processing of their images on Remove Cloths.
                </p>
                <p className="text-red-500/60 font-medium">
                    If we figure out that you use Remove Cloths for processing photographs of persons who did not provide you with explicit consent to the 
                    use of their images on Remove Cloths, your account will be banned, and information about your illegal actions will be transmitted to the 
                    competent law enforcement authorities.
                </p>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 w-full">
                 <button 
                    onClick={handleReject}
                    className="flex-1 py-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-bold transition-all text-sm uppercase tracking-wider hover:border-white/20"
                >
                    Decline
                </button>
                <button 
                    onClick={onVerify}
                    className="flex-[2] py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-[0_0_30px_rgba(255,0,82,0.3)] hover:shadow-[0_0_50px_rgba(255,0,82,0.5)] hover:scale-[1.01] text-sm uppercase tracking-wider relative overflow-hidden group"
                >
                    <span className="relative z-10">Accept</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};