export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                    <div className="prose max-w-none">
                        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                        <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
                        <p className="text-gray-600">We collect information you provide directly to us, such as your name, email address, and payment information when you register for our services.</p>
                        
                        <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
                        <p className="text-gray-600">We use your information to provide, maintain, and improve our services, to process your payments, and to communicate with you.</p>
                        
                        <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Security</h2>
                        <p className="text-gray-600">We implement appropriate technical and organizational measures to protect your personal information.</p>
                        
                        <h2 className="text-xl font-semibold mt-6 mb-3">4. Contact Us</h2>
                        <p className="text-gray-600">If you have any questions about this Privacy Policy, please contact us at support.scarlify@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}