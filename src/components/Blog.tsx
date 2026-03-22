import { BadgeCheck, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface BlogProps {
  onBack: () => void;
}

export function Blog({ onBack }: BlogProps) {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--display)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <BadgeCheck className="w-6 h-6 text-green-600" />
              <span className="text-gray-900">Quib</span>
            </button>
            
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Blog Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BadgeCheck className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="mb-4 text-gray-900" style={{ fontFamily: "var(--serif)", fontWeight: 400, letterSpacing: '-0.01em' }}>Our Story: Turning Self-Learning into Verified Achievement</h1>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">
            It started with a simple moment of frustration.
          </p>

          <p className="text-gray-700 mb-6">
            While diving deep into AI tutorials on YouTube — hours of technical deep dives into neural networks, Python, and machine learning — I realized something strange:
          </p>

          <p className="text-gray-700 mb-6">
            <strong>I was learning, but there was no proof that I had learned anything.</strong>
          </p>

          <p className="text-gray-700 mb-6">
            There was no certificate, no validation, and no way to show anyone — an employer, a client, even myself — what I had actually accomplished.
          </p>

          <p className="text-gray-700 mb-6">
            And I wasn't alone. Millions of people around the world spend countless hours learning on platforms like YouTube, yet their progress goes unrecognized.
          </p>

          <p className="text-gray-700 mb-8">
            That's when I asked myself a question:<br />
            <em className="text-gray-900">What if people could get verified, credible recognition for what they learn online — no matter where they learn it?</em>
          </p>

          {/* The Problem Section */}
          <div className="mb-8">
            <h2 className="text-gray-900 mb-4" style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>The Problem</h2>
            <p className="text-gray-700 mb-4">
              <strong>YouTube is the world's biggest learning platform — but it wasn't designed for certification.</strong><br />
              People watch lectures, tutorials, and workshops every day, but their learning remains invisible.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Traditional education offers proof of learning</strong> — degrees, transcripts, and certificates.<br />
              But self-learners, despite mastering real skills, have no official validation.
            </p>
            <p className="text-gray-700 mb-4">
              That gap inspired our mission:
            </p>
            <p className="text-gray-900">
              <strong>To make informal learning verifiable, credible, and recognized globally.</strong>
            </p>
          </div>

          {/* The Solution Section */}
          <div className="mb-8">
            <h2 className="text-gray-900 mb-4" style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>The Solution</h2>
            <p className="text-gray-700 mb-6">
              We're building a platform that turns YouTube learning into verified CERtification.
            </p>
            
            <p className="text-gray-700 mb-4">
              Here's how it works:
            </p>

            <div className="space-y-4 mb-6 ml-4">
              <p className="text-gray-700">
                <strong>1.</strong> Learners link the YouTube videos or playlists they studied.
              </p>

              <p className="text-gray-700">
                <strong>2.</strong> Our AI engine generates a custom quiz or project from that content.
              </p>

              <p className="text-gray-700">
                <strong>3.</strong> Once completed successfully, the learner receives a verified digital CERtificate — with a unique ID, QR code, and public verification page.
              </p>
            </div>

            <p className="text-gray-700 mb-6">
              Every CERtificate is backed by real evidence of effort — including the videos watched, assessments passed, and time invested.
            </p>

            <p className="text-gray-700 mb-6">
              This transforms casual self-learning into formal, verifiable proof of knowledge — something employers and educators can actually trust.
            </p>
          </div>

          {/* The Vision Section */}
          <div className="mb-8">
            <h2 className="text-gray-900 mb-4" style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>The Vision</h2>
            <p className="text-gray-700 mb-6">
              We believe learning shouldn't depend on institutions — it should depend on initiative.
            </p>

            <p className="text-gray-700 mb-6">
              Our vision is to empower self-learners everywhere to build their own learning record — a verifiable portfolio of what they know and how they learned it.
            </p>

            <p className="text-gray-700 mb-6">
              Whether it's a YouTube course on data science, design, or AI, our platform makes that learning visible, credible, and shareable.
            </p>

            <p className="text-gray-700 mb-6">
              Long term, we aim to become the universal credentialing layer for informal learning — a global proof-of-learning network that bridges the gap between education and recognition.
            </p>
          </div>

          {/* The Founder's Belief Section */}
          <div className="mb-8">
            <h2 className="text-gray-900 mb-4" style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>The Founder's Belief</h2>
            <p className="text-gray-700 mb-4">
              <strong>This came from my own experience — feeling that all the hours I spent learning online didn't count for anything.</strong>
            </p>

            <p className="text-gray-700 mb-4">
              As someone constantly learning from online resources, I wanted a way to prove that my time, effort, and curiosity meant something.
            </p>

            <p className="text-gray-700 mb-6">
              Now, I'm building a product that lets every self-learner in the world do the same.
            </p>

            <p className="text-gray-900">
              <strong>Because if you've learned it, you should be able to prove it.</strong>
            </p>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-gray-900 mb-4" style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>Ready to Get CERtified?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of self-learners transforming their knowledge into verified credentials.
            </p>
            <Button
              onClick={onBack}
              className="bg-green-600 hover:bg-green-700 h-12 px-8"
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>
              For help, contact <a href="mailto:support@cer.today" className="text-gray-900 underline">support@cer.today</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
