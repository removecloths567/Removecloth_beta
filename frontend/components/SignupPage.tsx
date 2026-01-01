import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, X, ArrowLeft, Ghost, CheckSquare, User as UserIcon, AlertCircle, Loader2, Check, Circle } from 'lucide-react';
import { API_URL } from '../types';
import { auth, provider, signInWithPopup } from '../src/firebase'; // Ensure this is correct
import { GoogleAuthProvider } from 'firebase/auth';
interface SignupPageProps {
    onBack: () => void;
    onClose: () => void;
    onGuestLogin: () => void;
    onLoginSuccess: () => void;
    onNavigateLogin: () => void;
    onNavigatePrivacy: () => void;
    onNavigateTerms: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onBack, onClose, onGuestLogin, onLoginSuccess, onNavigateLogin, onNavigatePrivacy, onNavigateTerms }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [fieldError, setFieldError] = useState<'username' | 'email' | 'password' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Password Real-time Validation State
    const [pwdCriteria, setPwdCriteria] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider); // Open Google login popup
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const idToken = credential.idToken;  // Get Google ID token

            // Send the ID token to your backend for sign-up
            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_token: idToken, // Send Google ID token to backend
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Google sign-up failed');
            }

            localStorage.setItem('auth_token', data.token); // Store the token
            onLoginSuccess();  // Proceed with sign-up success

        } catch (err: any) {
            setError(err.message || "Google sign-up failed");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle password change and update criteria instantly
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPassword(val);
        setPwdCriteria({
            length: val.length >= 6,
            upper: /[A-Z]/.test(val),
            lower: /[a-z]/.test(val),
            number: /\d/.test(val),
            special: /[@$!%*?&]/.test(val)
        });
    };

    const validateInputs = () => {
        // 1. Username Validation
        const usernameRegex = /^[A-Za-z0-9]{4,}$/;
        if (!usernameRegex.test(username)) {
            setFieldError('username');
            return "Username must be at least 4 characters long and contain only letters and numbers (no spaces).";
        }

        // 2. Email Validation
        const emailLower = email.toLowerCase();
        if (/\s/.test(emailLower)) {
            setFieldError('email');
            return "Email cannot contain spaces.";
        }
        if (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('@yahoo.com')) {
            setFieldError('email');
            return "Only @gmail.com or @yahoo.com addresses are allowed.";
        }

        const localPart = emailLower.split('@')[0];
        const localPartRegex = /^[a-z0-9]+$/;
        if (!localPartRegex.test(localPart)) {
            setFieldError('email');
            return "Email username must contain only letters and digits (no dots).";
        }

        // 3. Password Validation (Check if all criteria met)
        if (!Object.values(pwdCriteria).every(Boolean)) {
            setFieldError('password');
            return "Please fulfill all password requirements below.";
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldError(null);

        if (!termsAccepted) return;

        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email.toLowerCase(),
                    password: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = "Signup failed";
                // Handle backend errors (String or Pydantic Array)
                if (data.detail) {
                    if (typeof data.detail === 'string') {
                        errorMessage = data.detail;
                        if (errorMessage.toLowerCase().includes('email')) setFieldError('email');
                        else if (errorMessage.toLowerCase().includes('username')) setFieldError('username');
                    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
                        // Pydantic validation error array
                        errorMessage = data.detail[0].msg;
                        const loc = data.detail[0].loc || [];
                        if (loc.includes('email')) setFieldError('email');
                        if (loc.includes('username')) setFieldError('username');
                        if (loc.includes('password')) setFieldError('password');
                    }
                }
                throw new Error(errorMessage);
            }

            localStorage.setItem('auth_token', data.token);
            onLoginSuccess();

        } catch (err: any) {
            setError(err.message || "An error occurred during signup");
        } finally {
            setIsLoading(false);
        }
    };

    const PasswordRequirement = ({ met, text }: { met: boolean, text: string }) => (
        <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${met ? 'text-green-400' : 'text-gray-500'}`}>
            {met ? <Check size={14} className="shrink-0" /> : <Circle size={14} className="shrink-0" />}
            <span>{text}</span>
        </div>
    );

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 bg-black flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary opacity-10 blur-[128px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary opacity-10 blur-[128px] rounded-full pointer-events-none"></div>

            <div className="max-w-4xl w-full relative z-10">

                <button
                    onClick={onBack}
                    className="absolute -top-16 left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row relative group">

                    {/* Glowing Border Effect */}
                    <div className="absolute inset-0 rounded-3xl border border-white/5 group-hover:border-primary/30 transition-colors duration-700 pointer-events-none"></div>

                    {/* Left Side - Image */}
                    <div className="hidden md:block w-1/2 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80 z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop"
                            alt="Model"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-8 left-8 z-20">
                            <div className="flex items-center gap-2 mb-4 select-none">
                                <span className="text-3xl text-white tracking-tight">
                                    <span className="text-secondary">R</span>emove
                                </span>
                                <div className="bg-primary px-2.5 py-0.5 rounded-lg shadow-[0_0_20px_rgba(255,0,82,0.5)] flex items-center">
                                    <span className="text-3xl text-white tracking-tight">Cloths</span>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm max-w-xs">Join now and start creating amazing AI edits instantly.</p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 bg-black/40 relative z-20 flex flex-col justify-between">

                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-3xl font-black text-white">Create Account</h2>
                                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                    <div className="flex flex-col">
                                        <span className="text-red-400 font-bold text-sm">Action Required</span>
                                        <p className="text-red-400/80 text-xs leading-relaxed mt-1">{error}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Username Input */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Username</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <UserIcon size={18} className={`transition-colors ${fieldError === 'username' ? 'text-red-500' : 'text-gray-500 group-focus-within/input:text-primary'}`} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={`w-full bg-[#1a1a1a] border rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all font-medium
                                        ${fieldError === 'username'
                                                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-white/10 focus:border-primary/50 focus:ring-primary/50'
                                                }`}
                                            placeholder="johndoe123"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail size={18} className={`transition-colors ${fieldError === 'email' ? 'text-red-500' : 'text-gray-500 group-focus-within/input:text-primary'}`} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full bg-[#1a1a1a] border rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all font-medium
                                        ${fieldError === 'email'
                                                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-white/10 focus:border-primary/50 focus:ring-primary/50'
                                                }`}
                                            placeholder="john@gmail.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className={`transition-colors ${fieldError === 'password' ? 'text-red-500' : 'text-gray-500 group-focus-within/input:text-primary'}`} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className={`w-full bg-[#1a1a1a] border rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all font-medium
                                        ${fieldError === 'password'
                                                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-white/10 focus:border-primary/50 focus:ring-primary/50'
                                                }`}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {/* Professional Password Checklist */}
                                    <div className="bg-[#121212] border border-white/5 rounded-xl p-3 grid grid-cols-2 gap-2 mt-2">
                                        <PasswordRequirement met={pwdCriteria.length} text="6+ Characters" />
                                        <PasswordRequirement met={pwdCriteria.upper} text="1 Uppercase" />
                                        <PasswordRequirement met={pwdCriteria.lower} text="1 Lowercase" />
                                        <PasswordRequirement met={pwdCriteria.number} text="1 Number" />
                                        <div className="col-span-2">
                                            <PasswordRequirement met={pwdCriteria.special} text="1 Special (@$!%*?&)" />
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and Conditions Checkbox */}
                                <div className="flex items-start gap-3 mt-4 group cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
                                    <div className={`
                                mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 shrink-0
                                ${termsAccepted ? 'bg-primary border-primary' : 'bg-[#1a1a1a] border-gray-600 group-hover:border-primary/50'}
                            `}>
                                        {termsAccepted && <CheckSquare size={14} className="text-white" />}
                                    </div>
                                    <label className="text-xs text-gray-400 leading-relaxed cursor-pointer select-none">
                                        I approve of the <span onClick={(e) => { e.stopPropagation(); onNavigatePrivacy(); }} className="text-primary font-bold hover:underline">Privacy Policy</span> and <span onClick={(e) => { e.stopPropagation(); onNavigateTerms(); }} className="text-primary font-bold hover:underline">Terms of Conditions</span>.
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!termsAccepted || isLoading}
                                    className={`w-full py-4 rounded-xl font-bold text-white text-lg mt-2 transition-all relative overflow-hidden flex items-center justify-center
                                ${!termsAccepted || isLoading
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                                            : 'hover:scale-[1.02] shadow-lg hover:shadow-primary/25 cursor-pointer'
                                        }
                            `}
                                    style={termsAccepted && !isLoading ? {
                                        background: 'linear-gradient(270deg, #ff0052, #ff00f9, #ff5e00, #ff0052)',
                                        backgroundSize: '300% 300%',
                                        animation: 'gradientFlow 4s ease infinite'
                                    } : {}}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : (termsAccepted ? 'Create Free Account' : 'Accept Terms to Continue')}
                                </button>
                            </form>

                            {/* Guest Mode Button */}
                            <div className="grid grid-cols-1 gap-3 mt-6">
                                <button onClick={handleGoogleSignup} className="flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                                    <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                                    Sign up with Google
                                </button>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-gray-400 text-sm">
                                    Already have an account? <button onClick={onNavigateLogin} className="text-primary font-bold hover:underline">Sign in</button>
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
