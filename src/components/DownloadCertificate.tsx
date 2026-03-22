import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, ArrowLeft, CheckCircle2, BadgeCheck } from 'lucide-react';
import type { CertifiedVideo } from '../App';
import { useRef, useState } from 'react';

interface DownloadCertificateProps {
  video: CertifiedVideo;
  onBack: () => void;
}

export function DownloadCertificate({ video, onBack }: DownloadCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    setIsGenerating(true);
    
    try {
      // Import the libraries dynamically
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Generate canvas from the certificate
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // Higher scale for better quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Convert all elements to use standard color formats
          const clonedElement = clonedDoc.querySelector('[data-certificate-clone]');
          if (clonedElement) {
            // Find all elements with Tailwind classes and apply inline styles
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
              const computedStyle = window.getComputedStyle(el);
              // Force standard color formats
              if (computedStyle.color) {
                el.style.color = computedStyle.color;
              }
              if (computedStyle.backgroundColor) {
                el.style.backgroundColor = computedStyle.backgroundColor;
              }
              if (computedStyle.borderColor) {
                el.style.borderColor = computedStyle.borderColor;
              }
            });
          }
        },
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      // Download the PDF
      pdf.save(`cer-certificate-${video.certificateNumber}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to CERtificate
        </Button>

        <div className="text-center mb-8">
          <h2 className="mb-2 text-gray-900">Download Your CERtificate</h2>
          <p className="text-gray-600">
            Preview and download your CERtificate as a PDF
          </p>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <div
            ref={certificateRef}
            className="p-16"
            style={{ width: '1000px', margin: '0 auto', backgroundColor: '#ffffff' }}
            data-certificate-clone
          >
            <Card className="p-12 relative overflow-hidden" style={{ border: '4px solid #1f2937', backgroundColor: '#ffffff' }}>
              {/* Background Logo Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <BadgeCheck className="w-96 h-96" style={{ color: '#dc2626', opacity: 0.05 }} />
              </div>

              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-24 h-24" style={{ borderTop: '8px solid #d1d5db', borderLeft: '8px solid #d1d5db' }}></div>
              <div className="absolute top-0 right-0 w-24 h-24" style={{ borderTop: '8px solid #d1d5db', borderRight: '8px solid #d1d5db' }}></div>
              <div className="absolute bottom-0 left-0 w-24 h-24" style={{ borderBottom: '8px solid #d1d5db', borderLeft: '8px solid #d1d5db' }}></div>
              <div className="absolute bottom-0 right-0 w-24 h-24" style={{ borderBottom: '8px solid #d1d5db', borderRight: '8px solid #d1d5db' }}></div>

              <div className="text-center space-y-8 relative" style={{ zIndex: 10 }}>
                {/* Header */}
                <div>
                  <div className="flex justify-center mb-6">
                    <CheckCircle2 className="w-16 h-16" style={{ color: '#dc2626' }} />
                  </div>
                  <h1 className="mb-3" style={{ fontSize: '48px', color: '#1f2937', fontWeight: '500' }}>
                    CERtificate of Completion
                  </h1>
                </div>

                {/* Body */}
                <div className="py-10 px-8 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                  <p className="mb-4 text-lg" style={{ color: '#374151' }}>
                    This CERtifies that
                  </p>
                  
                  <h2 className="mb-8 pb-3 inline-block" style={{ fontSize: '36px', color: '#1f2937', borderBottom: '2px solid #d1d5db', fontWeight: '500' }}>
                    {video.userName}
                  </h2>

                  <p className="mb-6 text-lg" style={{ color: '#374151' }}>
                    has successfully passed the course
                  </p>

                  <h3 className="mb-10" style={{ fontSize: '28px', color: '#1f2937', fontWeight: '500' }}>
                    "{video.courseName}"
                  </h3>

                  <div className="space-y-4 text-left max-w-2xl mx-auto pt-8" style={{ borderTop: '2px solid #d1d5db' }}>
                    <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <span className="text-lg" style={{ color: '#4b5563' }}>CERtificate Number:</span>
                      <span className="text-lg" style={{ color: '#1f2937' }}>{video.certificateNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <span className="text-lg" style={{ color: '#4b5563' }}>Category:</span>
                      <Badge variant="secondary" className="text-base px-3 py-1" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
                        {video.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <span className="text-lg" style={{ color: '#4b5563' }}>Date of Completion:</span>
                      <span className="text-lg" style={{ color: '#1f2937' }}>{video.certificationDate}</span>
                    </div>
                  </div>
                </div>



                {/* Footer */}
                <div className="pt-8" style={{ borderTop: '2px solid #e5e7eb' }}>
                  <p className="italic text-lg" style={{ color: '#6b7280' }}>
                    "Excellence in Learning and Achievement"
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Download Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleDownloadPDF}
            className="bg-red-600 hover:bg-red-700"
            size="lg"
            disabled={isGenerating}
          >
            <Download className="w-5 h-5 mr-2" />
            {isGenerating ? 'Generating PDF...' : 'Download as PDF'}
          </Button>
        </div>

        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-gray-900 mb-3">About Your CERtificate</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Your CERtificate is generated in high-quality PDF format</li>
            <li>• The CERtificate includes your unique CERtificate number</li>
            <li>• You can print or share your CERtificate digitally</li>
            <li>• Each CERtificate is uniquely numbered and dated</li>
            <li>• Shows your name and the course you successfully completed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
