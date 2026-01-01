import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X, ArrowLeft, AlertCircle, Loader2, Check, Circle, KeyRound, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../types';
import { auth, provider, signInWithPopup } from '../src/firebase.js'; // Import Firebase methods
import { GoogleAuthProvider } from 'firebase/auth';

// import { auth, provider, signInWithPopup } from "./firebase"; // Import Firebase auth methods
interface LoginPageProps {
    onBack: () => void;
    onClose: () => void;
    onLoginSuccess: () => void;
    onNavigateSignup: () => void;
}



export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onClose, onLoginSuccess, onNavigateSignup }) => {
    // View State: 'login' or 'reset'
    const [view, setView] = useState<'login' | 'reset'>('login');

    // Login State
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Reset Password State
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    // Common State
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Password Validation Criteria State (for Reset Flow)
    const [pwdCriteria, setPwdCriteria] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);

            // ✅ CORRECT way to get ID token
            const idToken = await result.user.getIdToken();

            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_token: idToken,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Google login failed');
            }

            localStorage.setItem('auth_token', data.token);
            onLoginSuccess();

        } catch (err: any) {
            setError(err.message || "Google login failed");
        } finally {
            setIsLoading(false);
        }
    };


    // Handle new password input and update criteria
    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewPassword(val);
        setPwdCriteria({
            length: val.length >= 6,
            upper: /[A-Z]/.test(val),
            lower: /[a-z]/.test(val),
            number: /\d/.test(val),
            special: /[@$!%*?&]/.test(val)
        });
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const emailLower = email.toLowerCase();

        // Quick frontend check
        if (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('@yahoo.com')) {
            setError("Please use a valid Gmail or Yahoo address.");
            setIsLoading(false);
            return;
        }

        const localPart = emailLower.split('@')[0];
        if (localPart.includes('.')) {
            setError("Email username cannot contain dots (system constraint).");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailLower,
                    password: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle Pydantic array errors or string errors
                let msg = "Login failed";
                if (data.detail) {
                    msg = typeof data.detail === 'string' ? data.detail : data.detail[0].msg;
                }
                throw new Error(msg);
            }

            localStorage.setItem('auth_token', data.token);
            onLoginSuccess();

        } catch (err: any) {
            setError(err.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // 1. Validate Email
        const emailLower = resetEmail.toLowerCase();
        if (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('@yahoo.com')) {
            setError("Please enter a valid Gmail or Yahoo address.");
            return;
        }

        // 2. Validate Password Strength
        if (!Object.values(pwdCriteria).every(Boolean)) {
            setError("Please fulfill all password requirements.");
            return;
        }

        // 3. Validate Match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailLower,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle Pydantic array errors or string errors
                let msg = "Failed to reset password.";
                if (data.detail) {
                    msg = typeof data.detail === 'string' ? data.detail : data.detail[0].msg;
                }
                throw new Error(msg);
            }

            // Success
            setResetSuccess(true);
            setTimeout(() => {
                setView('login');
                setResetSuccess(false);
                setResetEmail('');
                setNewPassword('');
                setConfirmPassword('');
                setError(null);
                // Pre-fill login email for convenience
                setEmail(emailLower);
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Failed to reset password. Please try again.");
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
                            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
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
                            <p className="text-gray-300 text-sm max-w-xs">Unlock your imagination with the world's most advanced AI editor.</p>
                        </div>
                    </div>

                    {/* Right Side - Forms Container */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 bg-black/40 relative z-20 flex flex-col justify-between min-h-[600px]">

                        {/* Close Button */}
                        <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-30">
                            <X size={24} />
                        </button>

                        {/* --- LOGIN VIEW --- */}
                        {view === 'login' && (
                            <div className="animate-[fadeIn_0.3s_ease-out]">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-white mb-2">Sign in</h2>
                                    <p className="text-gray-400 text-sm">Welcome back to the future of editing.</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                        <div className="flex flex-col">
                                            <span className="text-red-400 font-bold text-sm">Login Failed</span>
                                            <p className="text-red-400/80 text-xs leading-relaxed mt-1">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleLoginSubmit} className="space-y-5">
                                    {/* Email Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-gray-500 group-focus-within/input:text-primary transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                                placeholder="name@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                                            <button
                                                type="button"
                                                onClick={() => { setError(null); setView('reset'); }}
                                                className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-500 group-focus-within/input:text-primary transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
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
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-4 rounded-xl font-bold text-white text-lg mt-4 transition-all hover:scale-[1.02] shadow-lg hover:shadow-primary/25 relative overflow-hidden flex items-center justify-center ${isLoading ? 'opacity-80' : ''}`}
                                        style={{
                                            background: 'linear-gradient(270deg, #ff0052, #ff00f9, #ff5e00, #ff0052)',
                                            backgroundSize: '300% 300%',
                                            animation: 'gradientFlow 4s ease infinite'
                                        }}
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Sign in"}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-[#0d0d0d] text-gray-500 font-medium">or sign in with</span>
                                    </div>
                                </div>

                                {/* Social Logins */}
                                <div className="grid grid-cols-1 gap-3">
                                    <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                                        <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                                        Google
                                    </button>
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-gray-400 text-sm">
                                        Don't have an account yet? <button onClick={onNavigateSignup} className="text-primary font-bold hover:underline">Sign up</button>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- RESET PASSWORD VIEW --- */}
                        {view === 'reset' && (
                            <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
                                <div className="mb-6">
                                    <button
                                        onClick={() => { setError(null); setView('login'); }}
                                        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider mb-4 transition-colors"
                                    >
                                        <ArrowLeft size={14} /> Back to Login
                                    </button>
                                    <h2 className="text-3xl font-black text-white mb-2">Reset Password</h2>
                                    <p className="text-gray-400 text-sm">Enter your email and create a new secure password.</p>
                                </div>

                                {resetSuccess ? (
                                    <div className="flex flex-col items-center justify-center text-center my-auto animate-[fadeIn_0.5s_ease-out]">
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
                                        <p className="text-gray-400 text-sm">Redirecting you to login...</p>
                                    </div>
                                ) : (
                                    <>
                                        {error && (
                                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                                <div className="flex flex-col">
                                                    <span className="text-red-400 font-bold text-sm">Reset Failed</span>
                                                    <p className="text-red-400/80 text-xs leading-relaxed mt-1">{error}</p>
                                                </div>
                                            </div>
                                        )}

                                        <form onSubmit={handleResetSubmit} className="space-y-4">
                                            {/* Email Input */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail Address</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Mail size={18} className="text-gray-500 group-focus-within/input:text-primary transition-colors" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        value={resetEmail}
                                                        onChange={(e) => setResetEmail(e.target.value)}
                                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                                        placeholder="name@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* New Password Input */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">New Password</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <KeyRound size={18} className="text-gray-500 group-focus-within/input:text-primary transition-colors" />
                                                    </div>
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={handleNewPasswordChange}
                                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                                        placeholder="New secure password"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {/* Password Strength Checklist */}
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

                                            {/* Confirm Password Input */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <KeyRound size={18} className={`transition-colors ${confirmPassword && newPassword !== confirmPassword ? 'text-red-500' : 'text-gray-500 group-focus-within/input:text-primary'}`} />
                                                    </div>
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className={`w-full bg-[#1a1a1a] border rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all font-medium
                                                    ${confirmPassword && newPassword !== confirmPassword
                                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                                                : 'border-white/10 focus:border-primary/50 focus:ring-primary/50'
                                                            }`}
                                                        placeholder="Re-type password"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {confirmPassword && newPassword !== confirmPassword && (
                                                    <p className="text-[10px] text-red-400 ml-1 font-medium animate-pulse">Passwords do not match</p>
                                                )}
                                                {confirmPassword && newPassword === confirmPassword && (
                                                    <p className="text-[10px] text-green-400 ml-1 font-medium flex items-center gap-1"><Check size={10} /> Passwords match</p>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className={`w-full py-4 rounded-xl font-bold text-white text-lg mt-4 transition-all hover:scale-[1.02] shadow-lg hover:shadow-primary/25 relative overflow-hidden flex items-center justify-center ${isLoading ? 'opacity-80' : ''}`}
                                                style={{
                                                    background: 'linear-gradient(270deg, #ff0052, #ff00f9, #ff5e00, #ff0052)',
                                                    backgroundSize: '300% 300%',
                                                    animation: 'gradientFlow 4s ease infinite'
                                                }}
                                            >
                                                {isLoading ? <Loader2 className="animate-spin" /> : "Reset Password"}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}

                        <style>{`
                    @keyframes gradientFlow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}</style>

                    </div>
                </div>
            </div>
        </div>
    );
};
