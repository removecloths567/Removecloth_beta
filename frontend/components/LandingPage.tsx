import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Wand2, CloudDownload, CheckCircle2, Plus, Minus, Smile, HeartHandshake, Heart, ShieldCheck, Star } from 'lucide-react';
import { Language } from '../types';

interface LandingPageProps {
  onTryNow: () => void;
  language: Language;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onTryNow, language }) => {
  
  // Dynamic Words State
  const [wordIndex, setWordIndex] = useState(0);
  // Updated words list as requested
  const words = ["Photos", "Crush", "Dreams", "Fantasy", "Neighbors", "Friend", "Relative", "Girlfriend", "Colleague"];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simple Translation Dictionary
  const t = {
    EN: {
      tag: "#1 AI Editor Technology",
      // h1 texts are now handled dynamically in the JSX
      sub: "In just a few clicks, discover what's hidden underneath anyone's clothes, down to the smallest detail. Professional results in seconds.",
      btn_try: "Try For Free",
      
      // New Section Text
      new_title_1: "RemoveCloths is Redefining Digital",
      new_title_2: "Companionship",
      new_sub: "Experience how our companions take intimacy to the next level",
      card_1_t: "Personalized",
      card_1_d: "Watch your companion learn and understand your preferences in real time as you share stories and build memories.",
      card_2_t: "Authentic",
      card_2_d: "State of the art language models, finetuned for natural flowing dialogues will have you doubting the lines between AI and reality.",
      card_3_t: "Compassionate",
      card_3_d: "Accessible and available, your partner is always ready to support your needs and desires.",
      card_4_t: "Secure",
      card_4_d: "Enjoy the comfort of judgement free conversations, backed by advanced encryption and privacy measures.",

      how_title_1: "How does",
      how_title_2: "RemoveCloths AI",
      how_title_3: "work?",
      how_desc: "Our AI Generator software is trained on thousands of photos. This way, it renders as accurately as possible what a person would look like deep edited with no blur.",
      step_1: "Sign up safely and anonymously",
      step_2: "Choose a RemoveCloths generation mode",
      step_3: "Upload an image and get AI result",
      looks_title: "How it looks like?",
      looks_desc: "When you upload an image, our AI program will promptly process it and deliver the highest quality result even with a free trial account.",
      stat_1: "Images Processed",
      stat_2: "Uptime",
      stat_3: "User Rating",
      stat_4: "Support",
      safe_title_1: "It's",
      safe_title_2: "completely safe",
      safe_desc: "We don't save any data. This is completely confidential and your actions are not published anywhere",
      
      // Testimonials
      test_title: "What Are Our Customers Saying?",
      test_sub: "More than 5000 users trust our platform. Let's take a look at their reviews.",
      testimonials: [
        {
          name: "Laura Smith",
          rating: 5,
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          text: "I was impressed by how natural the edits looked on RemoveCloths. I tried several other online apps before, but this one definitely stands out in terms of quality and ease of use. The interface is intuitive, and the results are stunning. Recommend!"
        },
        {
          name: "Nick Betcher",
          rating: 5,
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
          text: "It's the best option for AI editing. I'm not very tech-savvy, but I had no trouble navigating the site. Fast processing speed is also a huge bonus. I was able to create several edits in no time, and the quality was consistently excellent."
        },
        {
          name: "Sophia Rodriguez",
          rating: 5,
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
          text: "This is a fantastic tool for anyone looking to have fun with their photos. I used it on a few old photos, and everyone loved it. The results were surprisingly realistic, and it brought back so many memories with a fun twist. Great job!"
        }
      ],

      faq_title: "FAQ",
      faqs: [
        {
          q: "How do I generate NSFW pics with Remove Cloths?",
          a: "Choose preferable AI undressing mode. Upload a photo or an image you are allowed to use. Our AI Remove Cloths tool automatically recognizes clothes and removes them. You can experiment with different modes like Lingerie, Bikini, NSFW mode and something more spicy."
        },
        {
          q: "What is Remove Cloths?",
          a: "Try Remove Cloths to create unclothed images using our advanced AI technology. Fast and easy online website. This free online generator is available to every user."
        },
        {
          q: "What should I do to get a good result with no blur?",
          a: "The result of Remove Cloths depends 90% on the photo you use and mode you choose. If something goes wrong just pick another image and try a different mode. For the unblured version get the Remove Cloths Pro package."
        },
        {
          q: "Can I use Remove Cloths for free?",
          a: "Yes, once you sign up you will get some free credits to try our AI undressing tool for free."
        },
        {
          q: "Is Remove Cloths legal?",
          a: "Yes, of course. The app operates within legal boundaries, but make sure to comply with local laws and terms of use. Always review the app’s terms and conditions before using it."
        },
        {
          q: "Is Remove Cloths safe?",
          a: "Yes, it's designed with security in mind. The developers have implemented protective measures to ensure user safety and privacy. Regular updates aim to maintain a secure experience for all users."
        },
        {
          q: "Is it true that Remove Cloths works both with male and female photos?",
          a: "Yes, it works with both men and women photos, and even supports anime images. This versatility allows for a wide range of customization options."
        },
        {
          q: "Can I use Remove Cloths free no sign up?",
          a: "To ensure user safety and prevent misuse, sign-up is required for security reasons. This process helps protect users from inappropriate or unauthorized actions."
        },
        {
          q: "Where can I see Remove Cloths examples?",
          a: "You can see examples in the blog, where they provide visuals and demonstrations of how the app works. There, you'll also find examples showcasing how the app works with different types of photos."
        }
      ]
    }
  };

  const text = t[language] || t['EN'];

  return (
    <div className="relative pt-20 pb-12 overflow-hidden bg-gray-50 dark:bg-transparent transition-colors duration-300">
      
      {/* Background Ambience - Added pulse animation */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary opacity-20 blur-[128px] rounded-full pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary opacity-10 blur-[128px] rounded-full pointer-events-none animate-pulse-slow" style={{animationDelay: '1s'}}></div>

      {/* Main Hero Section with Dynamic Text */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 text-center mb-16 relative z-10">
        
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold uppercase tracking-wider text-secondary animate-[fadeIn_0.5s_ease-out] shadow-sm">
          {text.tag}
        </div>
        
        {/* Dynamic Main Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-gray-900 dark:text-white leading-tight drop-shadow-sm dark:drop-shadow-2xl animate-[fadeIn_0.7s_ease-out]">
          {language === 'EN' ? 'Remove Cloths of your' : 'अपने'} <br className="hidden md:block" />
          <span key={wordIndex} className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#ff00f9] to-primary bg-[length:200%_auto] animate-[textGradient_2s_linear_infinite] inline-block mt-1 md:mt-2 pb-3">
            {language === 'EN' ? words[wordIndex] : 'तस्वीरें'}
          </span>
          {language === 'HI' && ' से कपड़े हटाएँ'}
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed drop-shadow-sm dark:drop-shadow-lg font-medium animate-[fadeIn_0.9s_ease-out]">
          {text.sub}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 animate-[fadeIn_1.1s_ease-out]">
          <button 
            onClick={onTryNow}
            className="w-auto px-8 py-3 md:px-10 md:py-5 rounded-full gradient-bg text-white font-bold text-lg md:text-xl hover:shadow-[0_0_30px_rgba(255,0,82,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,0,82,0.2)]"
          >
            {text.btn_try}
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Companionship Feature Grid */}
        <div className="mb-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
              {text.new_title_1} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{text.new_title_2}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">{text.new_sub}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 text-left">
            <NewFeatureCard 
              icon={<Smile className="text-gray-900 dark:text-white w-5 h-5 md:w-6 md:h-6" />}
              title={text.card_1_t}
              desc={text.card_1_d}
            />
            <NewFeatureCard 
              icon={<HeartHandshake className="text-gray-900 dark:text-white w-5 h-5 md:w-6 md:h-6" />}
              title={text.card_2_t}
              desc={text.card_2_d}
            />
            <NewFeatureCard 
              icon={<Heart className="text-gray-900 dark:text-white w-5 h-5 md:w-6 md:h-6" />}
              title={text.card_3_t}
              desc={text.card_3_d}
            />
            <NewFeatureCard 
              icon={<ShieldCheck className="text-gray-900 dark:text-white w-5 h-5 md:w-6 md:h-6" />}
              title={text.card_4_t}
              desc={text.card_4_d}
            />
          </div>
        </div>
      </div>

      {/* How It Works Section - CENTERED & REDESIGNED */}
      <div className="bg-white dark:bg-black relative py-24 border-t border-gray-200 dark:border-white/5 transition-colors duration-300 overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Centered Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 animate-[fadeIn_0.5s_ease-out]">
                    <Zap size={12} fill="currentColor" /> Simple Process
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight animate-[fadeIn_0.7s_ease-out]">
                    {text.how_title_1} <br className="md:hidden" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{text.how_title_2}</span> {text.how_title_3}
                </h2>
                
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto animate-[fadeIn_0.9s_ease-out]">
                    {text.how_desc}
                </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 relative animate-[fadeIn_1.1s_ease-out]">
                {/* Connecting Line (Desktop Only) */}
                <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-white/5 dark:via-white/10 dark:to-white/5 z-0"></div>

                <StepCard 
                    number="01" 
                    text={text.step_1} 
                    icon={<Shield size={28} className="text-white" />} 
                    gradient="from-blue-500 to-cyan-500"
                />
                <StepCard 
                    number="02" 
                    text={text.step_2} 
                    icon={<Wand2 size={28} className="text-white" />} 
                    gradient="from-primary to-pink-500"
                />
                <StepCard 
                    number="03" 
                    text={text.step_3} 
                    icon={<CloudDownload size={28} className="text-white" />} 
                    gradient="from-amber-500 to-orange-500"
                />
            </div>

            {/* Centered Button */}
            <div className="text-center animate-[fadeIn_1.3s_ease-out]">
                <button 
                    onClick={onTryNow}
                    className="group relative inline-flex items-center justify-center px-10 py-4 md:px-12 md:py-5 text-lg font-bold text-white transition-all duration-300 bg-black dark:bg-white dark:text-black rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,0,82,0.3)] focus:outline-none overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <span className="relative flex items-center gap-3">
                        {text.btn_try}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </div>

        </div>
      </div>

      {/* How it looks like - HORIZONTAL ON PC, VERTICAL ON MOBILE */}
      <div className="bg-gray-50 dark:bg-surface relative py-20 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* Text Content - Center on Mobile, Left on PC */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                {text.looks_title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                {text.looks_desc}
              </p>
              <button 
                onClick={onTryNow}
                className="px-8 py-3.5 rounded-full gradient-bg text-white font-bold text-base hover:shadow-[0_0_30px_rgba(255,0,82,0.5)] transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
              >
                {text.btn_try}
              </button>
            </div>

            {/* Image Slider - Full Width Mobile, Half Width PC */}
            <div className="w-full md:w-1/2">
               <ImageSlider />
            </div>

          </div>
        </div>
      </div>

      {/* Safety / Lock Section */}
      <div className="bg-white dark:bg-black relative py-20 border-t border-gray-200 dark:border-white/5 overflow-hidden transition-colors duration-300">
        {/* Glow effect behind lock */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none animate-pulse-slow"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            
            {/* 3D Lock Image */}
            <div className="w-full md:w-1/2 flex justify-center animate-[float_6s_ease-in-out_infinite]">
              <img 
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=800&auto=format&fit=crop" 
                alt="Security Lock 3D" 
                className="max-w-[300px] md:max-w-[400px] drop-shadow-[0_0_50px_rgba(255,0,82,0.3)] hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Text Content */}
            <div className="w-full md:w-1/2 text-left">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                {text.safe_title_1} <br/>
                {text.safe_title_2}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed max-w-md border-l-4 border-primary pl-6">
                {text.safe_desc}
              </p>
              <button 
                onClick={onTryNow}
                className="px-10 py-4 rounded-full gradient-bg text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(255,0,82,0.6)] hover:-translate-y-1 transition-all duration-300"
              >
                {text.btn_try}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 dark:bg-black relative py-24 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">{text.test_title}</h2>
             <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">{text.test_sub}</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {text.testimonials.map((testimonial, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 group transition-all duration-500 hover:-translate-y-2 hover:bg-gray-50 dark:hover:bg-white/[0.07] hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,0,82,0.15)] relative">
                   {/* Avatar & Info */}
                   <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-primary to-secondary">
                             <img src={testimonial.image} alt={testimonial.name} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-black" />
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-900 dark:text-white text-lg">{testimonial.name}</h4>
                           <div className="flex text-amber-500 gap-0.5 mt-1">
                             {[...Array(testimonial.rating)].map((_, k) => <Star key={k} size={14} fill="currentColor" strokeWidth={0} />)}
                           </div>
                        </div>
                   </div>
                   {/* Review Text */}
                   <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base italic border-l-2 border-gray-200 dark:border-white/10 pl-4">
                       "{testimonial.text}"
                   </p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-surface relative py-24 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Left: Title Sticky */}
                <div className="w-full lg:w-1/3">
                    <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white sticky top-24 leading-none">
                        {text.faq_title}
                    </h2>
                </div>

                {/* Right: Accordion */}
                <div className="w-full lg:w-2/3 flex flex-col">
                    {text.faqs.map((item, index) => (
                        <FAQItem key={index} question={item.q} answer={item.a} />
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Social Proof / Stats */}
      <div className="mt-0 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <Stat number="10M+" label={text.stat_1} />
                <Stat number="99.9%" label={text.stat_2} />
                <Stat number="4.9/5" label={text.stat_3} />
                <Stat number="24/7" label={text.stat_4} />
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const NewFeatureCard: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({ icon, title, desc }) => (
  <div className="relative p-4 md:p-8 rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 group transition-all duration-500 hover:-translate-y-2 hover:bg-gray-50 dark:hover:bg-white/[0.07] hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,0,82,0.15)]">
    <div className="mb-3 md:mb-6 w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] shadow-[0_0_20px_rgba(255,0,82,0.3)] group-hover:shadow-[0_0_30px_rgba(255,0,82,0.6)] transition-all duration-300 group-hover:scale-110">
        <div className="w-full h-full rounded-full bg-white dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
             {icon}
        </div>
    </div>
    <h3 className="text-sm md:text-2xl font-bold mb-2 md:mb-4 text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[10px] md:text-sm font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-300">{desc}</p>
  </div>
);

// New StepCard for the redesigned How It Works section
const StepCard: React.FC<{number: string, text: string, icon: React.ReactNode, gradient: string}> = ({ number, text, icon, gradient }) => (
  <div className="h-full p-8 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 group text-center relative overflow-hidden z-10 flex flex-col items-center">
    
    {/* Gradient Blob on Hover */}
    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    
    <div className={`w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br ${gradient} p-[1px] shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
        <div className="w-full h-full rounded-2xl bg-white dark:bg-black flex items-center justify-center text-gray-900 dark:text-white relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`}></div>
            {icon}
        </div>
    </div>
    
    <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2 max-w-[200px]">
        {text}
    </p>

    <div className="absolute top-4 right-6 text-6xl font-black text-gray-200 dark:text-white/[0.03] -z-10 pointer-events-none select-none font-serif italic">
        {number}
    </div>
  </div>
);

const FAQItem: React.FC<{question: string, answer: string}> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b border-gray-200 dark:border-white/10 ${isOpen ? 'bg-gray-50 dark:bg-white/5' : ''} transition-colors duration-300`}>
        <button 
            className="w-full py-8 px-6 flex items-start md:items-center justify-between text-left group gap-4"
            onClick={() => setIsOpen(!isOpen)}
        >
            <span className={`text-xl font-bold transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-gray-900 dark:text-white group-hover:text-primary'}`}>
              {question}
            </span>
            <div className={`shrink-0 w-8 h-8 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary border-primary rotate-180' : 'bg-transparent group-hover:border-primary'}`}>
                {isOpen ? <Minus size={16} className="text-white" /> : <Plus size={16} className="text-gray-600 dark:text-white" />}
            </div>
        </button>
        <div 
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
            <div className="px-6 pb-8">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg border-l-2 border-gray-200 dark:border-white/10 pl-6">
                  {answer}
              </p>
            </div>
        </div>
    </div>
  )
}

const ImageSlider = () => {
  const images = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop", // Model 1
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop", // Model 2
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", // Model 3
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1000&auto=format&fit=crop"  // Model 4
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[3/2] bg-black rounded-[2.5rem] border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl group ring-1 ring-black/5 dark:ring-white/5 animate-float">
      
      {/* Corner Brackets (SVG) */}
      <div className="absolute inset-6 z-30 pointer-events-none opacity-90">
        {/* Top Left */}
        <svg className="absolute top-0 left-0 w-8 h-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3H5a2 2 0 0 0-2 2v4" />
        </svg>
        {/* Top Right */}
        <svg className="absolute top-0 right-0 w-8 h-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v4" />
        </svg>
        {/* Bottom Left */}
        <svg className="absolute bottom-0 left-0 w-8 h-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
        </svg>
        {/* Bottom Right */}
        <svg className="absolute bottom-0 right-0 w-8 h-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
        </svg>
      </div>

      {/* Images with Fade Transition */}
      {images.map((img, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center bg-black ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Using object-contain to ensure the image is seen "clearly" without cropping, on a black background like the reference */}
          <img 
            src={img} 
            alt={`Slide ${index + 1}`} 
            className="h-full w-full object-contain" 
          />
        </div>
      ))}

      {/* Scanning Line Animation - Solid Orange */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        <div className="w-full h-[3px] bg-[#ff6b00] shadow-[0_0_20px_#ff6b00] absolute top-0 animate-[scan_3s_linear_infinite]"></div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {images.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/30 w-1.5'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Deprecated in favor of StepCard, but kept if needed by other logic (none here).
// Removed to keep code clean.

const Stat: React.FC<{number: string, label: string}> = ({number, label}) => (
  <div>
    <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">{number}</div>
    <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">{label}</div>
  </div>
);