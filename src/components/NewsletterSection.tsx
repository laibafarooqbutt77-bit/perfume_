import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setSubscribed(true);
    setEmail('');
  };

  return (
    <section className="py-16 md:py-24 bg-[#141414] text-[#FAF8F5] relative overflow-hidden border-b border-[#292520]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">
          The Maison d’Or Gazette
        </span>

        <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-white font-medium">
          Privileged Invitations & Private Releases
        </h2>

        <p className="text-sm md:text-base text-[#B0A79E] max-w-xl mx-auto font-light leading-relaxed">
          Be the first to receive notifications regarding micro-batch harvests, seasonal extrait decants,
          and private olfactory exhibitions in Pakistan.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-[#1E1B17] border border-[#D4AF37]/40 rounded-lg text-[#E6CA85] animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div className="text-left">
              <p className="text-xs font-semibold tracking-wide uppercase text-white">
                Bienvenue to the Circle
              </p>
              <p className="text-xs text-[#B5ABA0]">
                Thank you for subscribing! Your demonstration invitation has been noted.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8AFA5]" />
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email address..."
                  className="w-full pl-10 pr-4 py-3 bg-[#1C1A17] border border-[#3E3830] text-white text-xs placeholder-[#ACA296] focus:outline-hidden focus:border-[#D4AF37] rounded-xs transition-colors"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FAF8F5] hover:bg-[#D4AF37] text-[#141414] text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-[#F28B82] text-left">{error}</p>
            )}

            <p className="text-[11px] text-[#B8AFA5] text-center">
              * Frontend demonstration. No promotional spam will be delivered.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
