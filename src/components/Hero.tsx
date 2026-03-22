import { BadgeCheck, Shield, Award, ChevronDown, PlayCircle, CheckCircle2, Download } from 'lucide-react';
import { Button } from './ui/button';

interface HeroProps {
  onSubmit: () => void;
  isLoggedIn: boolean;
  onRequestSignIn: () => void;
  onBlogClick: () => void;
}

export function Hero({ onSubmit, isLoggedIn, onRequestSignIn, onBlogClick }: HeroProps) {
  const handleGetCertified = () => {
    onSubmit();
  };

  const scrollToContent = () => {
    const contentSection = document.getElementById('content-section');
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Full Screen Opening Section */}
      <div className="relative h-screen flex items-center justify-center bg-white">
        {/* Top Right Navigation */}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <button 
            className="text-gray-900 hover:text-gray-600 transition-colors"
            onClick={onBlogClick}
          >
            Blog
          </button>
          <Button 
            variant="outline" 
            className="border-gray-300 hover:bg-gray-50"
            onClick={onRequestSignIn}
          >
            Login
          </Button>
          <Button 
            variant="outline" 
            className="border-red-600 hover:bg-red-50"
            onClick={onRequestSignIn}
          >
            Sign up
          </Button>
        </div>

        <div className="text-center w-full">
          <div className="flex items-center justify-center gap-4 mb-8">
            <BadgeCheck className="w-24 h-24 text-red-600" />
            <h1 className="text-6xl text-gray-900">Quib</h1>
          </div>

          {/* Scrolling Text */}
          <div className="relative overflow-hidden w-full max-w-4xl mx-auto mb-12">
            <div className="scrolling-text flex items-center gap-8 whitespace-nowrap">
              <span className="text-gray-400">Don't just learn, get certified for your learning</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Turn your YouTube education into certification</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">From watching to certified achievement</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Make every view count with certification</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Learn. Watch. Get certified.</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Your learning journey deserves certification</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Validate your knowledge, earn your certificate</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Don't just learn, get certified for your learning</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Turn your YouTube education into certification</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">From watching to certified achievement</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Make every view count with certification</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Learn. Watch. Get certified.</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Your learning journey deserves certification</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Validate your knowledge, earn your certificate</span>
              <span className="text-gray-300">•</span>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <button
            onClick={scrollToContent}
            className="animate-bounce inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Scroll to content"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div id="content-section" className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* 3-Step Process Section */}
            <div className="max-w-6xl mx-auto mb-16">
              <div className="text-center mb-12">
                <h2 className="mb-4 text-gray-900">How to Get Certified</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our simple 3-step process makes it easy to transform your YouTube learning into a recognized certificate
                </p>
              </div>
              
              {/* Desktop: Horizontal Flow with Arrows */}
              <div className="hidden md:block mb-12">
                <div className="flex items-stretch justify-between gap-4">
                  {/* Step 1 */}
                  <div className="flex-1">
                    <div className="w-full h-full bg-white border-2 border-red-600 rounded-lg p-6 shadow-lg relative flex flex-col">
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-lg">1</span>
                      </div>
                      <div className="mt-6 text-center flex-1 flex flex-col">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PlayCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h3 className="mb-3 text-gray-900">Start Your Quiz</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Take our quick quiz to verify your understanding and earn your certificate.
                        </p>
                        
                        <div className="mt-auto">
                          <Button 
                            onClick={handleGetCertified} 
                            className="w-full bg-red-600 hover:bg-red-700 h-12 shadow-lg"
                          >
                            Get Certified →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center pt-16">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  {/* Step 2 */}
                  <div className="flex-1">
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg relative h-full flex flex-col">
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-lg">2</span>
                      </div>
                      <div className="mt-6 text-center flex-1 flex flex-col justify-between">
                        <div>
                          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10 text-gray-700" />
                          </div>
                          <h3 className="mb-3 text-gray-900">Complete Quiz</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Answer quiz questions and enter your name for the certificate.
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                          ⏱️ 2 minutes
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center pt-16">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  {/* Step 3 */}
                  <div className="flex-1">
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg relative h-full flex flex-col">
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-lg">3</span>
                      </div>
                      <div className="mt-6 text-center flex-1 flex flex-col justify-between">
                        <div>
                          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Download className="w-10 h-10 text-gray-700" />
                          </div>
                          <h3 className="mb-3 text-gray-900">Download Certificate</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Get your official certificate instantly. Download PDF or share on LinkedIn and social media.
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                          ⏱️ Instant
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile: Vertical Stack */}
              <div className="md:hidden space-y-8 mb-12">
                {/* Step 1 */}
                <div className="relative">
                  <div className="w-full bg-white border-2 border-red-600 rounded-lg p-6 shadow-lg">
                    <div className="absolute -top-5 left-6 bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-lg">1</span>
                    </div>
                    <div className="mt-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                          <PlayCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-gray-900">Start Your Quiz</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Take our quick quiz to verify your understanding and earn your certificate.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          onClick={handleGetCertified}
                          className="w-full bg-red-600 hover:bg-red-700 h-12 shadow-lg"
                        >
                          Get Certified →
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Down arrow */}
                  <div className="flex justify-center my-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
                    <div className="absolute -top-5 left-6 bg-gray-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-lg">2</span>
                    </div>
                    <div className="mt-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-8 h-8 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-gray-900">Complete Quiz</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Answer quiz questions and enter your name for the certificate.
                          </p>
                          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 inline-block">
                            ⏱️ 2 min
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Down arrow */}
                  <div className="flex justify-center my-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
                    <div className="absolute -top-5 left-6 bg-gray-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-lg">3</span>
                    </div>
                    <div className="mt-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                          <Download className="w-8 h-8 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-gray-900">Download Certificate</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Get certificate instantly. Download or share on LinkedIn.
                          </p>
                          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 inline-block">
                            ⏱️ Instant
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why YouTube Certification Section */}
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-center mb-8 text-gray-900">Why Get Certified from YouTube?</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-red-600 rounded-lg p-6">
                  <h3 className="mb-3 text-gray-900">YouTube Learning</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Free & Accessible:</strong> Learn from world-class experts without expensive course fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Real-World Content:</strong> Get practical insights from industry professionals sharing their actual experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Always Updated:</strong> Access the latest information as creators continuously update their content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Learn Your Way:</strong> Choose from millions of videos at your own pace and schedule</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Now Credible:</strong> Transform informal learning into recognized, shareable credentials</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                  <h3 className="mb-3 text-gray-700">Traditional Platforms</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                      <span>Expensive subscription or per-course fees (often $50-$500+)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                      <span>Structured content that may not match your learning style</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                      <span>Content can become outdated between course updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                      <span>Limited selection compared to YouTube's vast library</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                      <span>Certificates often from lesser-known or unaccredited sources</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Three Boxes */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <Shield className="w-10 h-10 mb-4 mx-auto text-gray-900" />
                <h3 className="mb-2 text-gray-900">Verified Learning</h3>
                <p className="text-sm text-gray-600">
                  Turn hours of YouTube education into recognized proof of knowledge
                </p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <Award className="w-10 h-10 mb-4 mx-auto text-gray-900" />
                <h3 className="mb-2 text-gray-900">Career Value</h3>
                <p className="text-sm text-gray-600">
                  Add certified credentials to your resume and LinkedIn profile
                </p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <BadgeCheck className="w-10 h-10 mb-4 mx-auto text-gray-900" />
                <h3 className="mb-2 text-gray-900">Stand Out</h3>
                <p className="text-sm text-gray-600">
                  Differentiate yourself with official YouTube learning certificates
                </p>
              </div>
            </div>

            {/* Support Contact */}
            <div className="mt-16 text-center">
              <p className="text-gray-600">
                For help, contact <a href="mailto:support@cer.today" className="text-red-600 hover:text-red-700 underline">support@cer.today</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}