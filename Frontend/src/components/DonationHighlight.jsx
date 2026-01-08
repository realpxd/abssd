const DonationHighlight = () => {
  return (
    <section className="py-14 md:py-18 bg-[#fff7ef]">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10 space-y-3">
          <p className="text-sm uppercase tracking-wide text-orange-600 font-semibold">Support the Mission</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            सहयोग से बदलाव / Your Support Drives Change
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            दान का हर रूप (UPI या बैंक ट्रांसफर) हमारे स्वच्छता अभियानों और समुदाय सहायता को गति देता है।
            Every rupee fuels our cleanliness drives and community programs.
          </p>
        </div>

        <div className="bg-white border border-orange-100 shadow-xl rounded-2xl p-6 md:p-8 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3 text-center md:text-left">
              <p className="text-sm uppercase tracking-wide text-orange-600 font-semibold">Donate & Support</p>
              <h3 className="text-2xl font-bold text-gray-900 leading-snug">दान करें, बदलाव लाएँ / Donate to Drive Change</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                आपका छोटा सा योगदान स्वच्छता अभियानों, शिक्षा कार्यक्रमों और जरूरतमंदों की मदद में लगाया जाता है।
                Every contribution fuels our cleanliness drives and community support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-start justify-center">
                <a
                  href="/donation"
                  className="inline-flex items-center justify-center bg-orange-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-md"
                >
                  दान पेज देखें / Go to Donation Page
                </a>
                <a
                  href="tel:+918860442044"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-orange-200 text-orange-700 font-semibold bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  सहायता चाहिए? कॉल करें
                </a>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">UPI ID</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">abssdtrust@okhdfcbank</p>
                </div>
                <span className="text-xs bg-orange-200 text-orange-800 px-3 py-1 rounded-full font-semibold">UPI</span>
              </div>
              <div className="h-px bg-orange-100 my-3"></div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>खाता नाम / Account Name: Akhil Bhartiya Swachta Sewa Dal</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>खाता संख्या / Account No.: 50200105043929</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>IFSC: HDFC0003814</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>UPI स्कैन या बैंक ट्रांसफर दोनों स्वीकार्य हैं।</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DonationHighlight
