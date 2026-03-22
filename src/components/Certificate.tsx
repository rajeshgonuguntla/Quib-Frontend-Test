import { useNavigate, useParams } from 'react-router';
import { Button } from './Button';
import { Card } from './Card';
import { Award, Download, Copy, Linkedin, CheckCircle, QrCode } from 'lucide-react';

export function Certificate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const certificateData = {
    userName: 'Rajesh Gonuguntla',
    courseTitle: 'Introduction to Machine Learning',
    score: 92,
    date: 'February 17, 2026',
    certificateId: 'QUIB-2026-ML-8472',
    verificationUrl: 'quib.ai/verify/QUIB-2026-ML-8472'
  };

  const handleDownload = () => {
    alert('Certificate downloaded!');
  };

  const handleCopyLink = () => {
    const url = `https://${certificateData.verificationUrl}`;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          alert('Verification link copied!');
        })
        .catch(() => {
          // Fallback to legacy method
          fallbackCopyTextToClipboard(url);
        });
    } else {
      // Use fallback for browsers that don't support clipboard API
      fallbackCopyTextToClipboard(url);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('Verification link copied!');
    } catch (err) {
      alert('Failed to copy link. Please copy manually: ' + text);
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "var(--display)" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-7 h-7 text-[#E10600]" />
            <span className="text-xl font-bold text-gray-900">Quib</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-[400] text-gray-900 mb-3" style={{ fontFamily: "var(--serif)", letterSpacing: '-0.01em' }}>Certificate Ready!</h1>
          <p className="text-xl text-gray-600">Your achievement has been verified and is ready to share</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Certificate Preview */}
          <div className="lg:col-span-2">
            <Card variant="elevated" className="p-8 bg-white">
              {/* Certificate Design */}
              <div className="aspect-[1.414/1] bg-gradient-to-br from-gray-50 to-white border-8 border-gray-900 rounded-3xl p-12 relative overflow-hidden">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <Award className="w-96 h-96 text-gray-200" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-[#E10600] rounded-2xl flex items-center justify-center">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <span className="text-4xl font-bold text-gray-900">Quib</span>
                    </div>
                    <div className="text-lg text-gray-600 tracking-widest">CERTIFICATE OF COMPLETION</div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-gray-600 mb-4">This is to certify that</div>
                    <div className="text-5xl font-bold text-gray-900 mb-8 border-b-2 border-gray-900 pb-2 px-12" style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>
                      {certificateData.userName}
                    </div>
                    <div className="text-gray-600 mb-4">has successfully completed</div>
                    <div className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>
                      {certificateData.courseTitle}
                    </div>
                    <div className="text-gray-600 mb-2">with a score of</div>
                    <div className="text-4xl font-bold text-[#E10600] mb-8">{certificateData.score}%</div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between border-t-2 border-gray-200 pt-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Date</div>
                      <div className="font-medium text-gray-900">{certificateData.date}</div>
                    </div>

                    <div className="text-center">
                      <div className="w-24 h-24 bg-[#E10600] rounded-full flex items-center justify-center mb-2 relative">
                        <Award className="w-14 h-14 text-white" />
                        <div className="absolute inset-0 border-4 border-[#E10600] rounded-full scale-110" />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Certificate ID</div>
                      <div className="font-mono text-sm font-medium text-gray-900">{certificateData.certificateId}</div>
                    </div>
                  </div>

                  {/* Verification Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <div className="text-xs text-gray-500 mb-1">Verify this certificate at</div>
                    <div className="text-xs font-mono text-gray-700">{certificateData.verificationUrl}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card variant="elevated" className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Download & Share</h3>
              <div className="space-y-3">
                <Button className="w-full justify-center" onClick={handleDownload}>
                  <Download className="w-5 h-5" />
                  Download PDF
                </Button>
                <Button variant="secondary" className="w-full justify-center" onClick={handleCopyLink}>
                  <Copy className="w-5 h-5" />
                  Copy Verification Link
                </Button>
                <Button variant="secondary" className="w-full justify-center">
                  <Linkedin className="w-5 h-5" />
                  Share to LinkedIn
                </Button>
              </div>
            </Card>

            <Card variant="standard" className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Verification</h3>
              <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              <div className="text-sm text-gray-600 text-center">
                Scan to verify certificate authenticity
              </div>
            </Card>

            <Card variant="standard" className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-blue-900 mb-1">Share Your Achievement</div>
                  <div className="text-sm text-blue-800">
                    Add this certificate to your LinkedIn profile to showcase your verified skills
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Certificate Details */}
        <Card variant="standard" className="p-8">
          <h2 className="text-xl font-[400] text-gray-900 mb-6" style={{ fontFamily: "var(--serif)" }}>Certificate Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Recipient</div>
              <div className="font-medium text-gray-900">{certificateData.userName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Course</div>
              <div className="font-medium text-gray-900">{certificateData.courseTitle}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Score</div>
              <div className="font-medium text-gray-900">{certificateData.score}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Issue Date</div>
              <div className="font-medium text-gray-900">{certificateData.date}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Certificate ID</div>
              <div className="font-mono text-sm font-medium text-gray-900">{certificateData.certificateId}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Verification URL</div>
              <button
                onClick={handleCopyLink}
                className="font-mono text-sm text-blue-600 hover:text-blue-700 underline"
              >
                {certificateData.verificationUrl}
              </button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}