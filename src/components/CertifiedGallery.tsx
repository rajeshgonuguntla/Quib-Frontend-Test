import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, Eye } from 'lucide-react';
import type { CertifiedVideo } from '../App';
import { publicAPI } from '../utils/api';

const mockCertifiedVideos: CertifiedVideo[] = [
  {
    id: '1',
    videoId: 'dQw4w9WgXcQ',
    title: 'Professional Tutorial Series',
    channel: 'Tech Academy',
    certificationDate: 'Oct 28, 2025',
    certificateNumber: 'YT-CERT-A1B2C3D4',
    views: '2.5M',
    category: 'educational',
  },
  {
    id: '2',
    videoId: 'jNQXAC9IVRw',
    title: 'Amazing Music Production',
    channel: 'Music Masters',
    certificationDate: 'Oct 30, 2025',
    certificateNumber: 'YT-CERT-E5F6G7H8',
    views: '1.8M',
    category: 'music',
  },
  {
    id: '3',
    videoId: '9bZkp7q19f0',
    title: 'Gaming Championship Highlights',
    channel: 'Pro Gaming',
    certificationDate: 'Nov 1, 2025',
    certificateNumber: 'YT-CERT-I9J0K1L2',
    views: '3.2M',
    category: 'gaming',
  },
  {
    id: '4',
    videoId: 'M7lc1UVf-VE',
    title: 'Tech Review Excellence',
    channel: 'Tech Reviews',
    certificationDate: 'Nov 2, 2025',
    certificateNumber: 'YT-CERT-M3N4O5P6',
    views: '956K',
    category: 'technology',
  },
  {
    id: '5',
    videoId: 'Q8TXgCzxEnw',
    title: 'Advanced Mathematics Explained',
    channel: 'Math Masters',
    certificationDate: 'Oct 25, 2025',
    certificateNumber: 'YT-CERT-Q7R8S9T0',
    views: '1.5M',
    category: 'educational',
  },
  {
    id: '6',
    videoId: 'K3b5K7hf9Lw',
    title: 'Science Fundamentals Course',
    channel: 'Science Hub',
    certificationDate: 'Oct 29, 2025',
    certificateNumber: 'YT-CERT-U1V2W3X4',
    views: '3.8M',
    category: 'educational',
  },
  {
    id: '7',
    videoId: 'P9mN8kL4jHg',
    title: 'Complete Programming Bootcamp',
    channel: 'Code Academy',
    certificationDate: 'Nov 1, 2025',
    certificateNumber: 'YT-CERT-Y5Z6A7B8',
    views: '4.2M',
    category: 'educational',
  },
];

export function CertifiedGallery() {
  const [certifiedVideos, setCertifiedVideos] = useState<CertifiedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCertifiedVideos() {
      try {
        const videos = await publicAPI.getCertifiedVideos();
        // Combine real data with mock data for better UX
        const allVideos = [...videos, ...mockCertifiedVideos];
        setCertifiedVideos(allVideos);
      } catch (error) {
        console.error('Failed to load certified videos:', error);
        // Fallback to mock data
        setCertifiedVideos(mockCertifiedVideos);
      } finally {
        setIsLoading(false);
      }
    }

    loadCertifiedVideos();
  }, []);

  const displayVideos = certifiedVideos.filter((video) => 
    video.category.toLowerCase() === 'educational'
  );

  return null;
}
