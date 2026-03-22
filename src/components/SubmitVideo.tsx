import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Youtube } from 'lucide-react';

interface SubmitVideoProps {
  onSubmit: (videoUrl: string, category: string) => void;
}

export function SubmitVideo({ onSubmit }: SubmitVideoProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl && category) {
      onSubmit(videoUrl, category);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-100 p-3 rounded-lg">
            <Youtube className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h2>Certify Your Video</h2>
            <p className="text-gray-600">Submit your YouTube video for certification</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="videoUrl">YouTube Video URL</Label>
            <Input
              id="videoUrl"
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mt-2"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter the full URL of your YouTube video
            </p>
          </div>

          <div>
            <Label htmlFor="category">Video Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
            Get Certified
          </Button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> The certification process verifies video authenticity, 
            content quality, and compliance with community standards. Processing typically 
            takes a few moments.
          </p>
        </div>
      </Card>
    </div>
  );
}
