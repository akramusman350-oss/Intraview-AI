import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { adminAPI, sessionsAPI, Session } from '@/lib/api';
import { Users, Search, Loader2, Eye, Calendar, Award, FileText, CheckCircle, Clock, BookOpen, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  email: string;
  full_name: string;
  status: string;
  role: string;
  created_at: string;
  profile_info?: {
    phone?: string;
    skills?: string[];
  };
  sessionsCount?: number;
  avgScore?: number;
  lastInterview?: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateSessions, setCandidateSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchCandidates();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (location.state?.viewUserId && candidates.length > 0) {
      const cand = candidates.find(c => c.id === location.state.viewUserId);
      if (cand) {
        handleViewCandidate(cand);
        // Clear state so it doesn't trigger again on reload
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, candidates]);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm]);

  const fetchCandidates = async () => {
    try {
      const data = await adminAPI.getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = [...candidates];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.full_name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      );
    }

    setFilteredCandidates(filtered);
    setPage(1); // Reset page on filter change
  };

  const handleViewCandidate = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsViewDialogOpen(true);
    setSessionsLoading(true);
    setCandidateSessions([]);
    try {
      const [liveRes, historyRes] = await Promise.all([
        sessionsAPI.getLive(1, 50, candidate.id),
        sessionsAPI.getHistory(1, 50, candidate.id),
      ]);
      const allSessions = [...(liveRes.items || []), ...(historyRes.items || [])];
      setCandidateSessions(allSessions);
    } catch (error) {
      console.error('Error fetching candidate sessions:', error);
      toast.error('Failed to load candidate sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleStatusChange = async (candidateId: string, newStatus: 'approved' | 'rejected') => {
    setIsUpdating(candidateId);
    try {
      await adminAPI.updateCandidateStatus(candidateId, newStatus);
      toast.success(`Candidate ${newStatus} successfully`);
      fetchCandidates();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/20 text-success">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive">Rejected</Badge>;
      default:
        return <Badge className="bg-warning/20 text-warning">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage platform users and candidates.</p>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </GlassCard>

        {/* Users Table */}
        <GlassCard className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <Users className="mb-2 h-12 w-12 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-center">Sessions</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.full_name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{formatDate(candidate.created_at)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {candidate.sessionsCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {candidate.avgScore ? (
                        <span className="font-medium text-primary">{Math.round(candidate.avgScore)}%</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewCandidate(candidate)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {filteredCandidates.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center gap-2 p-4 border-t border-border/50 bg-muted/20">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center px-4">Page {page} of {Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE)}</span>
              <Button variant="outline" disabled={page * ITEMS_PER_PAGE >= filteredCandidates.length} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </GlassCard>

        {/* View Candidate Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Candidate Profile & Interviews
              </DialogTitle>
            </DialogHeader>
            {selectedCandidate && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                {/* Profile Details Column */}
                <div className="md:col-span-1 space-y-6 pr-0 md:pr-6 md:border-r border-border/50">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Personal Info</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="font-semibold text-foreground text-sm">{selectedCandidate.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email Address</p>
                        <p className="font-medium text-foreground text-sm break-all">{selectedCandidate.email}</p>
                      </div>
                      {selectedCandidate.profile_info?.phone && (
                        <div>
                          <p className="text-xs text-muted-foreground">Phone Number</p>
                          <p className="font-medium text-foreground text-sm">{selectedCandidate.profile_info.phone}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Joined Platform</p>
                        <p className="font-medium text-foreground text-sm flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(selectedCandidate.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedCandidate.profile_info?.skills && selectedCandidate.profile_info.skills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Extracted Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.profile_info.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/40">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Metrics Summary</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background/50 rounded-lg p-2.5 text-center border border-border/20">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Total</p>
                        <p className="text-lg font-bold text-foreground">{selectedCandidate.sessionsCount || 0}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2.5 text-center border border-border/20">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Avg Score</p>
                        <p className="text-lg font-bold text-primary">
                          {selectedCandidate.avgScore ? `${Math.round(selectedCandidate.avgScore)}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sessions lists Column */}
                <div className="md:col-span-2 space-y-6">
                  {sessionsLoading ? (
                    <div className="flex flex-col h-60 items-center justify-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-sm">Loading candidate's interviews...</p>
                    </div>
                  ) : (
                    <>
                      {/* Job / Position Interviews */}
                      <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Job Position Interviews
                        </h3>
                        {candidateSessions.filter(s => (s as any).interview_mode !== 'course').length === 0 ? (
                          <div className="text-center p-6 bg-muted/20 rounded-xl text-muted-foreground text-sm border border-dashed border-border">
                            No job interviews started yet.
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
                            {candidateSessions
                              .filter(s => (s as any).interview_mode !== 'course')
                              .map(session => (
                                <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border hover:bg-muted/40 transition-all">
                                  <div className="min-w-0 flex-1 pr-3">
                                    <p className="font-semibold text-sm text-foreground capitalize truncate">
                                      {(session as any).position || session.interview_type || 'General Job Interview'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(session.start_time || session.created_at)}
                                      </span>
                                      {session.score && session.score !== 'N/A' && (
                                        <span className="flex items-center gap-1 font-medium text-emerald-400">
                                          <Award className="h-3 w-3" />
                                          Score: {session.score.toString().endsWith('%') ? session.score : `${session.score}%`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(session.status)}
                                    {session.status === 'completed' && (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 gap-1.5 text-xs"
                                        onClick={() => navigate(`/interview/${session.id}/report`, { state: { from: 'users', candidateId: selectedCandidate.id } })}
                                      >
                                        <FileText className="h-3.5 w-3.5" />
                                        Report
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Course Interviews */}
                      <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-secondary" />
                          Course Interviews
                        </h3>
                        {candidateSessions.filter(s => (s as any).interview_mode === 'course').length === 0 ? (
                          <div className="text-center p-6 bg-muted/20 rounded-xl text-muted-foreground text-sm border border-dashed border-border">
                            No course interviews started yet.
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
                            {candidateSessions
                              .filter(s => (s as any).interview_mode === 'course')
                              .map(session => (
                                <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border hover:bg-muted/40 transition-all">
                                  <div className="min-w-0 flex-1 pr-3">
                                    <p className="font-semibold text-sm text-foreground capitalize truncate">
                                      Course: {(session as any).course || 'N/A'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(session.start_time || session.created_at)}
                                      </span>
                                      {session.score && session.score !== 'N/A' && (
                                        <span className="flex items-center gap-1 font-medium text-emerald-400">
                                          <Award className="h-3 w-3" />
                                          Score: {session.score.toString().endsWith('%') ? session.score : `${session.score}%`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(session.status)}
                                    {session.status === 'completed' && (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 gap-1.5 text-xs"
                                        onClick={() => navigate(`/interview/${session.id}/report`, { state: { from: 'users', candidateId: selectedCandidate.id } })}
                                      >
                                        <FileText className="h-3.5 w-3.5" />
                                        Report
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            <DialogFooter className="border-t border-border/50 pt-4">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
