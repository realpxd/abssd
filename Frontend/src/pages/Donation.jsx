const Donation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="block text-orange-600">दान करें</span>
            <span className="block text-3xl md:text-4xl mt-2">Support Our Mission</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            आपका योगदान हमारे समाज सेवा कार्यों में महत्वपूर्ण भूमिका निभाता है।
            <br />
            Your contribution plays a vital role in our social service initiatives.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Bank Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-orange-600">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                बैंक विवरण / Bank Details
              </h2>
            </div>

            <div className="space-y-6">
              {/* Account Name */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500 mb-1">खाता नाम / Account Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  Akhil Bhartiya Swachta Sewa Dal
                </p>
              </div>

              {/* Account Number */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500 mb-1">खाता संख्या / Account Number</p>
                <p className="text-lg font-mono font-semibold text-gray-900 tracking-wider">
                  50200105043929
                </p>
              </div>

              {/* IFSC Code */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500 mb-1">IFSC कोड / IFSC Code</p>
                <p className="text-lg font-mono font-semibold text-gray-900 tracking-wider">
                  HDFC0003814
                </p>
              </div>

              {/* Branch */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500 mb-1">शाखा / Branch</p>
                <p className="text-lg font-semibold text-gray-900">
                  Gurgaon, 122001, Haryana
                </p>
              </div>

              {/* UPI Beneficiary */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500 mb-1">लाभार्थी नाम / Beneficiary Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  Akhil Bhartiya Swachta Sewa Dal
                </p>
              </div>

              {/* Reference Note */}
              <div className="pb-4">
                <p className="text-sm text-gray-500 mb-1">संदर्भ नोट / Reference Note</p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  कृपया भुगतान के Remarks में "ABSSD Donation - Your Name" लिखें ताकि रसीद आसान हो सके।
                  <br />
                  Please add "ABSSD Donation - Your Name" in payment remarks for faster receipt processing.
                </p>
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-600">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">नोट / Note:</span> कृपया दान करने के बाद रसीद के लिए हमसे संपर्क करें।
                <br />
                Please contact us for a receipt after making a donation.
              </p>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-orange-600">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                  <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                QR कोड स्कैन करें / Scan QR Code
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
              {/* QR Code Container */}
              <div className="bg-white p-6 rounded-xl shadow-inner border-4 border-gray-100 mb-6">
                <img
                  src="/images/donation.jpeg"
                  alt="UPI Payment QR Code"
                  className="w-64 h-64"
                />
              </div>

              {/* UPI Details */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-2">UPI ID</p>
                <p className="text-xl font-mono font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                  abssdtrust@okhdfcbank
                </p>
              </div>

              {/* Instructions */}
              <div className="w-full space-y-4">
                <h3 className="font-semibold text-gray-900 text-center mb-3">
                  कैसे दान करें / How to Donate
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-bold">1</span>
                    </div>
                    <p className="text-sm text-gray-700 pt-1">
                      अपना UPI ऐप खोलें (Google Pay, PhonePe, Paytm, आदि)
                      <br />
                      <span className="text-gray-500">Open your UPI app (Google Pay, PhonePe, Paytm, etc.)</span>
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-bold">2</span>
                    </div>
                    <p className="text-sm text-gray-700 pt-1">
                      QR कोड स्कैन करें
                      <br />
                      <span className="text-gray-500">Scan the QR code</span>
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-bold">3</span>
                    </div>
                    <p className="text-sm text-gray-700 pt-1">
                      राशि दर्ज करें और भुगतान पूरा करें
                      <br />
                      <span className="text-gray-500">Enter amount and complete payment</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl shadow-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              अधिक जानकारी के लिए / For More Information
            </h3>
            <p className="text-lg mb-6 opacity-90">
              यदि आपके कोई प्रश्न हैं या रसीद की आवश्यकता है, तो कृपया हमसे संपर्क करें।
              <br />
              If you have any questions or need a receipt, please contact us.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4">
              <a
                href="tel:+918368201717"
                className="inline-flex items-center bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                +91 88604 42044
              </a>
              <a
                href="mailto:info@abssdtrust.org"
                className="inline-flex items-center bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                info@abssdtrust.org
              </a>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-12">
          <p className="text-2xl font-semibold text-gray-800 mb-2">
            आपके योगदान के लिए धन्यवाद! 🙏
          </p>
          <p className="text-xl text-gray-600">
            Thank you for your contribution!
          </p>
        </div>
      </div>
    </div>
  )
}

export default Donation
