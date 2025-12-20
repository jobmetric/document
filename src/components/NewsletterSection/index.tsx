import React, { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Cloud */}
        <div className="absolute top-8 left-8 w-24 h-16 bg-white/20 rounded-full blur-xl"></div>
        
        {/* Mailboxes and Envelopes */}
        <div className="absolute bottom-0 left-0 w-64 h-64">
          {/* Red Mailbox */}
          <div className="absolute bottom-20 left-8 w-16 h-20 bg-red-500 rounded-t-lg">
            <div className="absolute top-0 right-0 w-8 h-8 bg-red-600 rounded-t-lg transform rotate-12 origin-top-right"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-red-600"></div>
          </div>
          
          {/* Orange Mailbox */}
          <div className="absolute bottom-16 left-24 w-20 h-24 bg-orange-500 rounded-t-lg">
            <div className="absolute top-0 right-0 w-10 h-10 bg-orange-600 rounded-t-lg transform rotate-12 origin-top-right"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-orange-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold -rotate-90">
              MAIL
            </div>
          </div>
          
          {/* Flying Envelopes */}
          <div className="absolute top-8 left-12 w-8 h-6 bg-white/80 rounded-sm transform rotate-12"></div>
          <div className="absolute top-16 left-20 w-6 h-4 bg-white/80 rounded-sm transform -rotate-6"></div>
          <div className="absolute top-4 left-32 w-7 h-5 bg-white/80 rounded-sm transform rotate-45"></div>
          
          {/* Dashed Lines */}
          <svg className="absolute top-8 left-12 w-32 h-32" viewBox="0 0 100 100">
            <path
              d="M10,20 Q30,40 50,30 T90,25"
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.3"
            />
          </svg>
          
          {/* Plants */}
          <div className="absolute bottom-0 left-0 w-32 h-24">
            <div className="absolute bottom-0 left-4 w-2 h-16 bg-green-600 rounded-t-full"></div>
            <div className="absolute bottom-12 left-2 w-8 h-8 bg-green-500 rounded-full"></div>
            <div className="absolute bottom-10 left-6 w-6 h-6 bg-green-400 rounded-full"></div>
            <div className="absolute bottom-0 left-12 w-2 h-20 bg-green-600 rounded-t-full"></div>
            <div className="absolute bottom-14 left-10 w-10 h-10 bg-green-500 rounded-full"></div>
          </div>
          
          {/* Blue Glow */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/30 rounded-full blur-2xl"></div>
        </div>
        
        {/* Brain Icon (Top Right) */}
        <div className="absolute top-4 right-8 w-16 h-16 opacity-20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-orange-400">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2.5 13.5V16h-5v-.5c0-.83.67-1.5 1.5-1.5h2c.83 0 1.5.67 1.5 1.5z"/>
          </svg>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Sign up to our newsletter.
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Craven omni memoria patriae zombieland clairvius narcisse religionis sunt diri undead historiarum.
            </p>
          </div>
          
          <div className="relative">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="@enter email-address"
                  required
                  className="flex-1 px-6 py-4 rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 bg-white"
                />
                <button
                  type="submit"
                  className="px-6 py-4 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              {submitted && (
                <p className="mt-4 text-white/90 text-sm">
                  ✓ Successfully subscribed! Check your email.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

