import React from 'react';
import { ArrowLeft, Shield, FileText, Scale } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
  type: 'privacy' | 'terms' | 'refund';
}

export const LegalPage: React.FC<LegalPageProps> = ({ onBack, type }) => {
  const getContent = () => {
    switch(type) {
      case 'privacy':
        return {
          title: "Privacy Policy",
          icon: <Shield className="w-8 h-8 text-primary" />,
          content: (
            <>
              <p className="mb-4 text-gray-600 dark:text-gray-300">Last updated: October 24, 2024</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">1. Introduction</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">Welcome to RemoveCloths. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">2. Data We Collect</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong>Identity Data:</strong> includes username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes email address.</li>
                <li><strong>Image Data:</strong> includes photos you upload for processing. NOTE: We strictly do not store generated images permanently. Original and generated images are automatically deleted from our servers within 1 hour.</li>
                <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">3. How We Use Your Data</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600 dark:text-gray-300">
                <li>To provide the service you requested (image processing).</li>
                <li>To manage your account and subscription.</li>
                <li>To improve our website and services.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">4. Data Security</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. Access to uploaded images is strictly limited to the automated processing algorithm.</p>
            </>
          )
        };
      case 'terms':
        return {
          title: "Terms of Service",
          icon: <FileText className="w-8 h-8 text-secondary" />,
          content: (
            <>
              <p className="mb-4 text-gray-600 dark:text-gray-300">Last updated: October 24, 2024</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">1. Agreement to Terms</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with these terms, you are prohibited from using or accessing this site.</p>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">2. Age Requirement</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">You must be at least 18 years of age to use this Website. By using this Website and by agreeing to these terms and conditions you warrant and represent that you are at least 18 years of age.</p>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">3. User Conduct & Acceptable Use</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">You are solely responsible for the content you upload. You agree not to upload:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Images of persons under the age of 18.</li>
                <li>Content that is illegal, threatening, or defamatory.</li>
                <li>Content that infringes on the intellectual property rights of others.</li>
                <li>Images without the consent of the subject depicted.</li>
              </ul>
              <p className="mb-4 text-gray-600 dark:text-gray-300">We reserve the right to ban users who violate these policies without refund.</p>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">4. Intellectual Property</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">The service and its original content, features, and functionality are and will remain the exclusive property of RemoveCloths and its licensors. The service is protected by copyright, trademark, and other laws.</p>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">5. Termination</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </>
          )
        };
      case 'refund':
        return {
          title: "Refund Policy",
          icon: <Scale className="w-8 h-8 text-green-500" />,
          content: (
            <>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Last updated: October 24, 2024</p>
              
              <div className="space-y-6">
                <section>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Refund Policy Overview</h3>
                    <p className="mb-2 text-gray-600 dark:text-gray-300">
                        At RemoveCloths, we strive to ensure our customers are satisfied with our services. However, due to the nature of digital goods and AI processing services, generally, all sales are final. Once credits have been purchased and added to your account, they are non-refundable except under specific conditions outlined below.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Eligibility for Refunds</h3>
                    <p className="mb-2 text-gray-600 dark:text-gray-300">You may be eligible for a refund if:</p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                        <li>You have made a duplicate payment due to a technical error.</li>
                        <li>The service was completely unavailable for a continuous period of 24 hours or more.</li>
                        <li>You have purchased a subscription or credit pack and <strong>have not used any credits</strong> from that purchase within 14 days of the transaction.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3. Non-Refundable Situations</h3>
                    <p className="mb-2 text-gray-600 dark:text-gray-300">Refunds will <strong>not</strong> be issued in the following scenarios:</p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                        <li><strong>Dissatisfaction with AI Results:</strong> The quality of AI generation depends heavily on the input image. We do not refund credits used for generations that you are subjectively unhappy with.</li>
                        <li><strong>Used Credits:</strong> If you have used any portion of your purchased credits, the remaining balance is non-refundable.</li>
                        <li><strong>Policy Violations:</strong> If your account is terminated due to a violation of our Terms of Service (e.g., uploading prohibited content, underage content), you forfeit all remaining credits and rights to a refund.</li>
                        <li><strong>Change of Mind:</strong> We do not offer refunds simply because you changed your mind after using the service.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">4. Subscription Cancellations</h3>
                    <p className="mb-2 text-gray-600 dark:text-gray-300">
                        You may cancel your subscription at any time via your account settings. Cancellation stops future billing but does not refund previous payments. You will retain access to your credits until the end of the current billing cycle.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">5. How to Request a Refund</h3>
                    <p className="mb-2 text-gray-600 dark:text-gray-300">
                        If you believe you qualify for a refund, please contact our support team at <span className="text-primary">support@removecloths.ai</span> with the following details:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                        <li>Your account email address.</li>
                        <li>Transaction ID or Receipt Number.</li>
                        <li>A detailed explanation of why you are requesting a refund.</li>
                    </ul>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        We review all requests within 48 business hours and will notify you of the approval or rejection of your refund.
                    </p>
                </section>
              </div>
            </>
          )
        };
      default:
        return { title: "", icon: null, content: null };
    }
  };

  const data = getContent();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-black animate-[fadeIn_0.5s_ease-out] transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={onBack}
          className="group mb-8 flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-all duration-300 shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
          <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-gray-900 dark:group-hover:text-white">Back</span>
        </button>

        <div className="bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-white/10 pb-8">
            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
              {data.icon}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{data.title}</h1>
          </div>

          {/* Content */}
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            {data.content}
          </div>
        </div>

      </div>
    </div>
  );
};