import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Check, Loader2 } from 'lucide-react';
import type { CertifiedVideo } from '../App';

interface CertificationProcessProps {
  video: CertifiedVideo;
}

const steps = [
  { id: 1, label: 'Verifying video URL', duration: 1000 },
  { id: 2, label: 'Analyzing content', duration: 1500 },
  { id: 3, label: 'Checking authenticity', duration: 1000 },
  { id: 4, label: 'Generating certificate', duration: 500 },
];

export function CertificationProcess({ video }: CertificationProcessProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let totalTime = 0;
    steps.forEach((step, index) => {
      totalTime += step.duration;
      setTimeout(() => {
        setCurrentStep(index + 1);
        setProgress(((index + 1) / steps.length) * 100);
      }, totalTime);
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
          </div>
          <h2 className="mb-2">Certifying Your Video</h2>
          <p className="text-gray-600">Please wait while we process your certification...</p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2 text-center">
            {Math.round(progress)}% Complete
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                index < currentStep
                  ? 'bg-gray-50 border border-gray-900'
                  : index === currentStep
                  ? 'bg-gray-100 border border-gray-400'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentStep
                    ? 'bg-gray-900'
                    : index === currentStep
                    ? 'bg-gray-600'
                    : 'bg-gray-300'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white">{step.id}</span>
                )}
              </div>
              <span
                className={
                  index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Video ID:</strong> {video.videoId}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Category:</strong> {video.category}
          </p>
        </div>
      </Card>
    </div>
  );
}