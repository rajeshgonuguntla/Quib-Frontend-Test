import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Award, Download, Share2, Eye, Calendar, TrendingUp, ExternalLink, CheckCircle, Search } from 'lucide-react';
import { ShellPage } from '../shell/ShellPage';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

type CertItem = {
  id: string;
  title: string;
  issueDate: string;
  score: number;
  certificateId: string;
  skills: string[];
};

export function MyCertificates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [certificates, setCertificates] = useState<CertItem[]>([]);

  useEffect(() => {
    axios.get('/api/certificates')
      .then((res) => {
        setCertificates((res.data ?? []).map((c: {
          id: string;
          title: string;
          issuedAt?: string;
          scorePercent: number;
          certificateCode: string;
          skills?: string[];
        }) => ({
          id: c.id,
          title: c.title,
          issueDate: c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
          score: c.scorePercent,
          certificateId: c.certificateCode,
          skills: c.skills ?? [],
        })));
      })
      .catch(() => setCertificates([]));
  }, []);

  const filtered = certificates.filter(
    (cert) =>
      cert.title.toLowerCase().includes(searchQuery.toLowerCase())
      || cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = {
    total: certificates.length,
    avgScore: certificates.length ? Math.round(certificates.reduce((acc, c) => acc + c.score, 0) / certificates.length) : 0,
  };

  return (
    <ShellPage label="Library" title="Certificates" description="View, download, and share your earned certificates.">
      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title or ID…" className="pl-9" />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-4"><Award size={18} className="text-muted-foreground" /><div><p className="text-xl font-medium tabular-nums">{stats.total}</p><p className="text-label text-muted-foreground">Total</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><TrendingUp size={18} className="text-muted-foreground" /><div><p className="text-xl font-medium tabular-nums">{stats.avgScore}%</p><p className="text-label text-muted-foreground">Avg score</p></div></CardContent></Card>
        <Card className="hidden sm:block"><CardContent className="flex items-center gap-3 p-4"><Calendar size={18} className="text-muted-foreground" /><div><p className="text-xl font-medium tabular-nums">{filtered.length}</p><p className="text-label text-muted-foreground">Showing</p></div></CardContent></Card>
      </div>

      {filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Award className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{searchQuery ? 'No matches.' : 'Complete quizzes to earn certificates.'}</p>
            <Button className="mt-4" size="sm" onClick={() => navigate('/dashboard')}>Take a quiz</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((cert) => (
            <Card key={cert.id} className="transition-colors hover:border-border/80">
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:gap-6">
                <div className="flex h-36 w-full shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-muted md:w-48">
                  <Award className="mb-2 size-10 text-[var(--brand)]" />
                  <p className="text-label text-muted-foreground">Certificate</p>
                  <p className="text-sm font-medium">{cert.score}%</p>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-medium">{cert.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={12} />{cert.issueDate}</span>
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle size={12} />Verified</span>
                  </div>
                  <p className="text-label mt-3 text-muted-foreground">ID · {cert.certificateId}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cert.skills.map((skill) => <Badge key={skill} variant="muted">{skill}</Badge>)}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => navigate(`/certificate/${cert.id}`)}><Eye size={14} /> View</Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/verify/${cert.certificateId}`)}><ExternalLink size={14} /> Verify</Button>
                    <Button size="sm" variant="outline"><Download size={14} /> PDF</Button>
                    <Button size="sm" variant="outline"><Share2 size={14} /> Share</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ShellPage>
  );
}
