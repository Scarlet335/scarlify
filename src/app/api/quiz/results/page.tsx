'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Award, Download, Share2 } from 'lucide-react';

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const score = searchParams.get('score');
  const quizId = searchParams.get('quizId');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [subject, setSubject] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserInfo();
    fetchQuizInfo();
  }, [quizId]);

  const fetchLeaderboard = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('user_quiz_attempts')
      .select('user_id, percentage, profiles(full_name)')
      .eq('quiz_id', quizId)
      .order('percentage', { ascending: false })
      .limit(10);
    setLeaderboard(data || []);
  };

  const fetchUserInfo = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      setUserName(profile?.full_name || user.email?.split('@')[0] || 'Student');
    }
  };

  const fetchQuizInfo = async () => {
    if (quizId) {
      const supabase = createClient();
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('subject')
        .eq('id', quizId)
        .single();
      setSubject(quiz?.subject || 'Quiz');
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Scarlify_Certificate_${userName.replace(/\s/g, '_')}.pdf`);
  };

  const getMessage = () => {
    const numScore = parseInt(score || '0');
    if (numScore >= 80) return 'Excellent! 🎉 You mastered this topic!';
    if (numScore >= 60) return 'Good job! 👍 Keep practicing to improve further.';
    if (numScore >= 40) return 'Not bad! 📚 Review the material and try again.';
    return 'Keep studying! 💪 You can do better with more practice.';
  };

  const getScoreColor = () => {
    const numScore = parseInt(score || '0');
    if (numScore >= 80) return 'text-green-600';
    if (numScore >= 60) return 'text-blue-600';
    if (numScore >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const numScore = parseInt(score || '0');
  const showCertificateButton = numScore >= 50;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Quiz Completed! 🎯</h1>
          <p className="text-gray-600 mb-6">{getMessage()}</p>
          
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-6">
            <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}%</span>
          </div>
          
          <div className="space-y-3">
            {/* Certificate Button */}
            {showCertificateButton && (
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Download Certificate
              </button>
            )}
            
            <button
              onClick={() => router.push('/quiz')}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
            >
              Take Another Quiz
            </button>
            <button
              onClick={() => router.push('/student-dashboard')}
              className="w-full py-3 border rounded-lg font-semibold hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                const text = `I scored ${score}% on the ${subject} quiz on Scarlify! 🎓`;
                navigator.clipboard.writeText(text);
                alert('Score copied to clipboard!');
              }}
              className="w-full py-3 text-gray-600 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Your Score
            </button>
          </div>
        </div>
        
        {leaderboard.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">🏆 Leaderboard</h2>
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border-b">
                  <div className="flex items-center gap-3">
                    <span className="font-bold w-6">{idx + 1}.</span>
                    <span>{entry.profiles?.full_name || 'Student'}</span>
                  </div>
                  <span className="font-semibold text-primary">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Certificate</h2>
              <button onClick={() => setShowCertificate(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {/* Certificate Preview */}
            <div 
              ref={certificateRef}
              className="bg-gradient-to-r from-purple-50 to-blue-50 border-4 border-purple-600 rounded-2xl p-8 text-center mb-4"
              style={{ width: '100%', minHeight: '350px' }}
            >
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-purple-800 mb-2">🎓 Scarlify</h1>
                  <p className="text-gray-600">Certificate of Achievement</p>
                </div>
                
                <div className="my-4">
                  <p className="text-gray-600 mb-2">This certificate is proudly presented to</p>
                  <p className="text-2xl font-bold text-purple-700 mb-2">{userName}</p>
                  <p className="text-gray-600 mb-4">
                    for completing the <span className="font-semibold">{subject}</span> quiz with a score of 
                    <span className="font-bold text-green-600"> {score}%</span>
                  </p>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Scarlify Team</p>
                    <div className="w-32 h-0.5 bg-purple-600 mt-1"></div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={downloadCertificate}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Certificate (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}