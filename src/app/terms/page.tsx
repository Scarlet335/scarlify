export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                    <div className="prose max-w-none">
                        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                        
                        <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
                        <p className="text-gray-600">By accessing and using Scarlify, you agree to be bound by these Terms of Service.</p>
                        
                        <h2 className="text-xl font-semibold mt-6 mb-3">2. Description of Service</h2>
                        <p className="text-gray-600">Scarlify provides GCE exam preparation materials, including past questions, quizzes, AI tutoring, and study resources.</p>
                        
                        <h2 className="text-xl font-semibold mt-6 mb-3">3. Payments and Refunds</h2>
                        <p className="text-gray-600">Premium subscriptions are processed via Mobile Money. Refunds are provided at our discretion.</p>
                        
                        <h2 className="text-xl font-semibold mt-6 mb-3">4. User Conduct</h2>
                        <p className="text-gray-600">You agree to use the service for educational purposes only and not to share your account with others.</p>
                        
                        <h2 className="text-xl font-semibold mt-6 mb-3">5. Contact</h2>
                        <p className="text-gray-600">For questions about these Terms, contact us at support.scarlify@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}