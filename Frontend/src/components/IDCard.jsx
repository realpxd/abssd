import { forwardRef } from 'react'
import { getImageUrl } from '../utils/imageUrl.js'

const IDCard = forwardRef(({ user, photoPreview, watermarkText }, ref) => {
  if (!user) return null

  const photoSrc = photoPreview || (user.photo ? getImageUrl(user.photo) : null)

  return (
    <div ref={ref} className="relative w-full bg-white border rounded-xl shadow-md overflow-hidden flex flex-col card-container" style={{ borderColor: 'rgba(35,48,63,0.08)', width: '350px', height: '380px' }}>
      {/* Watermark overlay when requested (e.g., sample preview) */}
      {watermarkText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 40 }}>
          <span style={{ transform: 'rotate(-30deg)', opacity: 0.12, fontSize: 42, fontWeight: 700, color: '#000', letterSpacing: '2px' }}>{watermarkText}</span>
        </div>
      )}
      <div className="h-[56px] px-4 flex items-center gap-3" style={{ background: 'linear-gradient(90deg,#2b5b8f,#3b66a9)' }}>
       <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: '1px solid white' }}>
          <img src="/images/logo.png" alt="logo" className="w-10 h-10 object-cover rounded-full" />
        </div>
        <div>
          <div className="text-white text-[16px] font-bold leading-tight">अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट</div>
          <div className='flex gap-8'>
            <div className="text-gray-100 text-[10px] font-bold leading-tight">8860442044</div>
            <div className='border-r-2 h-4 w-1 border-gray-100'></div>
            <div className="text-gray-100 text-[10px] font-bold leading-tight">abssdtrust@gmail.com</div>

          </div>
        </div>
      </div>

      <div className="flex gap-4 px-4 pl-6 py-6 relative">
        <div className="absolute top-4 right-4 text-gray-600 text-sm">
          <p>{user.memberNumber ? `#${user.memberNumber}` : 'N/A'}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-22 h-22" style={{ width: 86, height: 86, borderRadius: 9999, overflow: 'hidden', border: '3px solid rgba(35,48,63,0.08)', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {photoSrc ? (
              <img src={photoSrc} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-gray-400">{user.username?.[0]?.toUpperCase()}</span>
            )}
          </div>

          <div className="bg-[#133b6b] text-white text-[10px] font-bold px-3 py-[4px] rounded-full">{user.position?.name || 'Member'}</div>
        </div>

        <div className="flex-1 text-[12px]">
          <div>
            <span className="text-gray-600 font-semibold">नाम:</span>
            <span className="text-[#133b6b] font-bold ml-1">{user.username}</span>
          </div>
          <div style={{ height: 6 }}></div>
          <div>
            <span className="text-gray-600 font-semibold">पता:</span>
            <span className="text-[#133b6b] ml-1">{user.address?.city}{user.address?.state ? ', ' + user.address?.state : ''}</span>
          </div>
          <div style={{ height: 6 }}></div>
          <div>
            <span className="text-gray-600 font-semibold">मोबाइल:</span>
            <span className="text-[#133b6b] ml-1">{user.contactNo}</span>
          </div>
          <div style={{ height: 6 }}></div>
          <div>
            <span className="text-gray-600 font-semibold">ईमेल:</span>
            <span className="text-[#133b6b] ml-1">{user.email}</span>
          </div>
          {typeof user.referredBy  === 'object' && <> 
            <div style={{ height: 6 }}></div>
            <div>
              <span className="text-gray-600 font-bold">टीम प्रभारी:</span>
              <span className="text-[#133b6b] ml-1 font-bold">
                {user.referredBy ? (
                  typeof user.referredBy === 'object' ? (
                    `${user.referredBy.username || 'N/A'}${user.referredBy.referralCode ? ` (${user.referredBy.referralCode})` : ''}`
                  ) : (
                    // could be an id or a string fallback
                    String(user.referredBy)
                  )
                ) : 'N/A'}
            </span>
            </div>
          </>
          }
          <div className="pt-2 border-t border-gray-100 mt-2"></div>
        </div>
      </div>

      {user.membershipStatus && (
        <div className="flex justify-center mt-auto">
          {user.membershipStatus === 'pending' && (
            <span className="inline-flex items-center px-2 py-0 rounded-full text-[9px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">Pending Verification</span>
          )}
          {user.membershipStatus === 'active' && (
            <span className="inline-flex items-center px-2 py-0 rounded-full text-[9px] font-semibold bg-green-100 text-green-800 border border-green-200">Active Member</span>
          )}
          {user.membershipStatus === 'inactive' && (
            <span className="inline-flex items-center px-2 py-0 rounded-full text-[9px] font-semibold bg-red-100 text-red-800 border border-red-200">Inactive Member</span>
          )}
        </div>
      )}

      <div className="mt-2 flex border-t border-gray-100 bg-white px-3 py-4 items-center">
        <div className="w-1/2 pr-2">
          <div className="text-[#133b6b] font-bold text-sm">राष्ट्रीय अध्यक्ष</div>
          <div className="h-9 border-b border-dashed border-gray-300 my-2"></div>
        </div>
        <div className="w-1/2 flex items-center justify-end pr-2">
          <div style={{ width: 78, height: 78 }} className="flex flex-col items-center gap-1">
            <div style={{ width: 72, height: 72 }} className="bg-white flex items-center justify-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(user._id)}&size=100x100`} alt="Member QR Code" style={{ width: 72, height: 72 }} />
            </div>
            <div className="text-gray-500 text-[8px] font-bold leading-tight">https://abssd.in</div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default IDCard
