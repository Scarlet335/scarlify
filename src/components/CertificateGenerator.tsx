'use client';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateProps {
    studentName: string;
    subject: string;
    score: number;
    date: string;
    onClose: () => void;
}

export default function CertificateGenerator({ studentName, subject, score, date, onClose }: CertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);

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
        pdf.save(`Scarlify_Certificate_${studentName.replace(/\s/g, '_')}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Your Certificate</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                {/* Certificate Preview */}
                <div 
                    ref={certificateRef}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 border-4 border-purple-600 rounded-2xl p-8 text-center mb-4"
                    style={{ width: '550px', height: '400px' }}
                >
                    <div className="h-full flex flex-col justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-purple-800 mb-2">🎓 Scarlify</h1>
                            <p className="text-gray-600">Certificate of Achievement</p>
                        </div>
                        
                        <div>
                            <p className="text-gray-600 mb-2">This certificate is proudly presented to</p>
                            <p className="text-2xl font-bold text-purple-700 mb-2">{studentName}</p>
                            <p className="text-gray-600 mb-4">
                                for completing the <span className="font-semibold">{subject}</span> quiz with a score of 
                                <span className="font-bold text-green-600"> {score}%</span>
                            </p>
                        </div>
                        
                        <div className="flex justify-between items-end mt-4">
                            <div className="text-left">
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium">{date}</p>
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
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                    Download Certificate (PDF)
                </button>
            </div>
        </div>
    );
}