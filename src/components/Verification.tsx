import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { Award, Search, CheckCircle, XCircle, Calendar, User, FileText } from 'lucide-react';

export function Verification() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(certId || '');
  const [verified, setVerified] = useState(!!certId);

  const certificateData = {
    id: 'QUIB-2026-ML-8472',
    name: 'Rajesh Gonuguntla',
    course: 'Introduction to Machine Learning',
    score: 92,
    issueDate: 'February 17, 2026',
    status: 'valid'
  };

  const handleSearch = () => {
    if (searchId) {
      setVerified(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "var(--display)" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <Award className="w-7 h-7 text-[#E10600]" />
            <span className="text-xl font-bold text-gray-900">Quib</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-[400] text-gray-900 mb-3" style={{ fontFamily: "var(--serif)" }}>Verify Certificate</h1>
          <p className="text-xl text-gray-600">Enter a certificate ID to verify its authenticity</p>
        </div>

        {/* Search Card */}
        <Card variant="elevated" className="p-8 mb-8">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter certificate ID (e.g., QUIB-2026-ML-8472)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              icon={<Search className="w-5 h-5" />}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!searchId} className="px-8">
              Verify
            </Button>
          </div>
        </Card>

        {/* Verification Result */}
        {verified && (
          <Card variant="elevated" className="p-8">
            {/* Status Badge */}
            <div className="flex items-center justify-center mb-8">
              <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl ${
                certificateData.status === 'valid'
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                {certificateData.status === 'valid' ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-[400] text-green-900" style={{ fontFamily: "var(--serif)" }}>Certificate Valid</div>
                      <div className="text-sm text-green-700">This certificate has been verified</div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <div className="text-2xl font-[400] text-red-900" style={{ fontFamily: "var(--serif)" }}>Certificate Not Found</div>
                      <div className="text-sm text-red-700">This certificate could not be verified</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {certificateData.status === 'valid' && (
              <>
                {/* Certificate Details */}
                <div className="border-t border-b border-gray-200 py-8 mb-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Recipient</div>
                        <div className="text-lg font-bold text-gray-900">{certificateData.name}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Course</div>
                        <div className="text-lg font-bold text-gray-900">{certificateData.course}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Score</div>
                        <div className="text-lg font-bold text-gray-900">{certificateData.score}%</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Issue Date</div>
                        <div className="text-lg font-bold text-gray-900">{certificateData.issueDate}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate ID */}
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">Certificate ID</div>
                  <div className="font-mono text-lg font-bold text-gray-900 bg-gray-50 px-6 py-3 rounded-xl inline-block">
                    {certificateData.id}
                  </div>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Info Box */}
        <Card variant="standard" className="p-6 bg-blue-50 border-blue-200 mt-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-blue-900 mb-2">About Quib Verification</div>
              <div className="text-sm text-blue-800 leading-relaxed">
                All Quib certificates include a unique verification ID. This public verification page 
                allows anyone to confirm the authenticity and validity of a certificate. Each certificate 
                includes details about the recipient, course, score, and issue date.
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}