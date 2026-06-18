'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  BookOpen, ArrowRight, ArrowLeft, Search, CheckCircle,
  Calculator, Atom, Beaker, Dna, Book, Globe, Landmark, 
  Briefcase, Calculator as CalcIcon, Wrench, Cpu, Languages
} from 'lucide-react';

interface Subject {
  name: string;
  code: string;
  icon: React.ElementType;
  description: string;
}

export default function SelectSubjectPage() {
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const level = localStorage.getItem('student_level');
    const section = localStorage.getItem('student_section');
    
    if (!level) {
      router.push('/student-dashboard/select-level');
      return;
    }
    if (!section) {
      router.push('/student-dashboard/select-section');
      return;
    }
    
    setSelectedLevel(level);
    setSelectedSection(section);
    loadSubjects(level, section);
  }, []);

  const loadSubjects = (level: string, section: string) => {
    // Subject data with icons
    const subjectMap: Record<string, Record<string, Subject[]>> = {
      'O-Level': {
        'Science': [
          { name: 'Mathematics', code: '4021', icon: Calculator, description: 'Algebra, Trigonometry, Geometry, Calculus' },
          { name: 'Additional Mathematics', code: '4022', icon: Calculator, description: 'Advanced mathematics topics' },
          { name: 'Physics', code: '5051', icon: Atom, description: 'Mechanics, Electricity, Waves, Optics' },
          { name: 'Chemistry', code: '5061', icon: Beaker, description: 'Organic, Inorganic, Physical Chemistry' },
          { name: 'Biology', code: '5081', icon: Dna, description: 'Cell Biology, Genetics, Ecology' },
          { name: 'Human Biology', code: '5082', icon: Dna, description: 'Human anatomy and physiology' },
        ],
        'Arts': [
          { name: 'English Language', code: '1121', icon: Book, description: 'Grammar, Composition, Comprehension' },
          { name: 'English Literature', code: '1131', icon: Book, description: 'Poetry, Prose, Drama' },
          { name: 'French Language', code: '1221', icon: Languages, description: 'French grammar and composition' },
          { name: 'French Literature', code: '1231', icon: Book, description: 'French literary works' },
          { name: 'History', code: '2141', icon: Globe, description: 'African, European, World History' },
          { name: 'Geography', code: '2151', icon: Globe, description: 'Physical and Human Geography' },
          { name: 'Religious Studies', code: '3131', icon: Book, description: 'World religions and ethics' },
        ],
        'Commercial': [
          { name: 'Economics', code: '2281', icon: Briefcase, description: 'Micro and Macro Economics' },
          { name: 'Accounting', code: '2283', icon: Calculator, description: 'Financial Accounting' },
          { name: 'Business Studies', code: '2285', icon: Briefcase, description: 'Business management' },
          { name: 'Commerce', code: '2287', icon: Briefcase, description: 'Trade and commerce' },
          { name: 'Office Practice', code: '2289', icon: Briefcase, description: 'Office administration' },
          { name: 'Typewriting', code: '2291', icon: Book, description: 'Keyboarding skills' },
        ],
        'Technical': [
          { name: 'Technical Drawing', code: '4301', icon: Wrench, description: 'Engineering drawing' },
          { name: 'Building Construction', code: '4303', icon: Wrench, description: 'Construction techniques' },
          { name: 'Woodwork', code: '4305', icon: Wrench, description: 'Woodworking skills' },
          { name: 'Metalwork', code: '4307', icon: Wrench, description: 'Metal fabrication' },
          { name: 'Electronics', code: '4311', icon: Cpu, description: 'Electronic circuits' },
          { name: 'Electricity', code: '4313', icon: Cpu, description: 'Electrical systems' },
          { name: 'Mechanics', code: '4315', icon: Wrench, description: 'Mechanical systems' },
          { name: 'Computer Science', code: '4317', icon: Cpu, description: 'Programming and IT' },
        ],
        'Grammar': [
          { name: 'English Language', code: '1121', icon: Book, description: 'Grammar and composition' },
          { name: 'French Language', code: '1221', icon: Languages, description: 'French language studies' },
          { name: 'German', code: '1241', icon: Languages, description: 'German language' },
          { name: 'Spanish', code: '1251', icon: Languages, description: 'Spanish language' },
          { name: 'Latin', code: '1261', icon: Languages, description: 'Latin language' },
        ],
      },
      'A-Level': {
        'Science': [
          { name: 'Mathematics', code: '7012', icon: Calculator, description: 'Pure and Applied Mathematics' },
          { name: 'Further Mathematics', code: '7020', icon: Calculator, description: 'Advanced Mathematics' },
          { name: 'Physics', code: '7014', icon: Atom, description: 'Advanced Physics' },
          { name: 'Chemistry', code: '7016', icon: Beaker, description: 'Advanced Chemistry' },
          { name: 'Biology', code: '7018', icon: Dna, description: 'Advanced Biology' },
        ],
        'Arts': [
          { name: 'English Language', code: '8011', icon: Book, description: 'Advanced English' },
          { name: 'English Literature', code: '8012', icon: Book, description: 'Advanced Literature' },
          { name: 'French Language', code: '8013', icon: Languages, description: 'Advanced French' },
          { name: 'French Literature', code: '8014', icon: Book, description: 'Advanced French Literature' },
          { name: 'History', code: '8015', icon: Globe, description: 'Advanced History' },
          { name: 'Geography', code: '8016', icon: Globe, description: 'Advanced Geography' },
          { name: 'Religious Studies', code: '8017', icon: Book, description: 'Advanced Religious Studies' },
          { name: 'Philosophy', code: '8018', icon: Book, description: 'Philosophy and ethics' },
        ],
        'Commercial': [
          { name: 'Economics', code: '7102', icon: Briefcase, description: 'Advanced Economics' },
          { name: 'Accounting', code: '7104', icon: Calculator, description: 'Advanced Accounting' },
          { name: 'Business Studies', code: '7106', icon: Briefcase, description: 'Advanced Business Studies' },
        ],
        'Technical': [
          { name: 'Technical Drawing', code: '7151', icon: Wrench, description: 'Advanced Technical Drawing' },
          { name: 'Building Construction', code: '7153', icon: Wrench, description: 'Advanced Construction' },
          { name: 'Woodwork', code: '7155', icon: Wrench, description: 'Advanced Woodwork' },
          { name: 'Metalwork', code: '7157', icon: Wrench, description: 'Advanced Metalwork' },
          { name: 'Electronics', code: '7159', icon: Cpu, description: 'Advanced Electronics' },
          { name: 'Electricity', code: '7161', icon: Cpu, description: 'Advanced Electricity' },
          { name: 'Mechanics', code: '7163', icon: Wrench, description: 'Advanced Mechanics' },
          { name: 'Computer Science', code: '7165', icon: Cpu, description: 'Advanced Computer Science' },
        ],
        'Grammar': [
          { name: 'English Language', code: '8011', icon: Book, description: 'Advanced English Language' },
          { name: 'French Language', code: '8013', icon: Languages, description: 'Advanced French Language' },
        ],
      },
    };

    setSubjects(subjectMap[level]?.[section] || []);
  };

  const selectSubject = async (subject: Subject) => {
    setLoading(true);
    setSelectedSubject(subject.name);
    
    // Save selected subject
    localStorage.setItem('student_subject', subject.name);
    localStorage.setItem('student_subject_code', subject.code);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ 
          selected_subject: subject.name,
          selected_subject_code: subject.code
        })
        .eq('id', user.id);
    }
    
    // Navigate to dashboard
    router.push('/student-dashboard');
  };

  const goBack = () => {
    router.push('/student-dashboard/select-section');
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.includes(searchTerm)
  );

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      Calculator, Atom, Beaker, Dna, Book, Globe, Briefcase, Wrench, Cpu, Languages
    };
    return icons[iconName] || BookOpen;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">{selectedLevel} • {selectedSection}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Choose Your Subject
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select the subject you want to focus on
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by subject name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Subjects Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {filteredSubjects.map((subject) => {
            const Icon = subject.icon;
            const isSelected = selectedSubject === subject.name;
            return (
              <button
                key={subject.code}
                onClick={() => selectSubject(subject)}
                disabled={loading}
                className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all hover:shadow-lg disabled:opacity-50 ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-primary'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">{subject.name}</h3>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {subject.code}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {subject.description}
                    </p>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No subjects found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Section
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
            <span className="w-3 h-3 bg-primary rounded-full"></span>
          </div>
          <div className="w-24"></div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Step 3 of 3: Select Subject</p>
      </div>
    </div>
  );
}