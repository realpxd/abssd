import { forwardRef } from 'react'
import { getImageUrl } from '../utils/imageUrl.js'

// Decorative floral corner - small, subtle SVG
const FloralCorner = ({ className = '', fill = '#FDE68A', stroke = '#F97316', opacity = 0.18 }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style={{ opacity }}>
    <g fill={fill} stroke={stroke} strokeWidth="0.6">
      <path d="M10 80 C 20 60, 40 50, 50 40 C 60 30, 80 20, 90 10 L 100 0 L 90 0 C 80 0, 60 10, 50 20 C 40 30, 20 50, 10 80 Z" />
      <circle cx="20" cy="20" r="3" fill={stroke} />
    </g>
  </svg>
)

const IDCard = forwardRef(({ user, photoPreview, watermarkText, design }, ref) => {
  if (!user) return null

  const photoSrc = photoPreview || (user.photo ? getImageUrl(user.photo) : null)

  // Determine design: allow explicit `design` prop override, otherwise use membershipType
  const membershipType = user.membershipType || 'ordinary'
  const variant = design || (membershipType === 'annual' ? 'annual' : 'ordinary')

  // Variant styles
  const headerGradient = variant === 'annual'
    ? 'linear-gradient(90deg,#f97316,#fb923c)' // warm orange-gold
    : 'linear-gradient(90deg,#f97316,#fb7043)' // softer orange

  const bodyBg = variant === 'annual'
    ? 'radial-gradient(circle at 10% 10%, rgba(255,241,204,0.6), rgba(255,249,238,0.85))'
    : 'radial-gradient(circle at 90% 10%, rgba(255,250,240,0.6), rgba(255,255,255,0.9))'

  const headlineColor = '#aa511a' // orange for headlines

  // Helper: format username according to length rules
  const formatUsername = (name) => {
    if (!name) return ''
    const s = String(name).trim()
    if (s.length <= 12) return s
    const parts = s.split(/\s+/)
    if (parts.length === 1) {
      // single long name — show first part truncated to 12 chars
      return parts[0].slice(0, 12)
    }
    const first = parts[0]
    const last = parts[parts.length - 1]
    return `${first} ${last.charAt(0).toLowerCase()}.`
  }

  // Helper: format city and state. If combined length exceeds 15, abbreviate state to initial.
  const formatCityState = (city, state) => {
    const c = city ? String(city).trim() : ''
    const s = state ? String(state).trim() : ''
    if (!c && !s) return 'N/A'
    if (!s) return c || 'N/A'
    const combined = `${c}${s ? ', ' + s : ''}`
    if (combined.length <= 17) return combined
    return `${c}${s ? ', ' + s.charAt(0).toLowerCase() + '.' : ''}`
  }

  // Helper: choose email font size based on length
  const emailStyleFor = (email) => {
    const e = email ? String(email) : ''
    const len = e.length
    // base 15px; reduce if too long
    let fontSize = 15
    if (len > 35) fontSize = 11
    else if (len > 25) fontSize = 13
    return { fontSize: `${fontSize}px` }
  }

  return (
    <div ref={ref} className="relative w-full rounded-xl shadow-md overflow-hidden flex flex-col card-container" style={{ width: '298.58px', height: '396.8px', border: '1px solid rgba(35,48,63,0.06)', fontFamily: 'ui-sans-serif, system-ui, -apple-system' }}>

    {/* // <div ref={ref} className="relative w-full rounded-xl shadow-md overflow-hidden flex flex-col card-container" style={{ width: '390px', height: user.referredBy ? '450px':'430px', border: '1px solid rgba(35,48,63,0.06)', fontFamily: 'ui-sans-serif, system-ui, -apple-system' }}> */}
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none"><FloralCorner /></div>
      <div className="absolute top-0 right-0 w-20 h-20 rotate-90 pointer-events-none"><FloralCorner /></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 -rotate-90 pointer-events-none"><FloralCorner /></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 rotate-180 pointer-events-none"><FloralCorner /></div>

      {/* Watermark overlay when requested */}
      {watermarkText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
          <span style={{ transform: 'rotate(-28deg)', opacity: 0.08, fontSize: 48, fontWeight: 800, color: '#000', letterSpacing: '2px' }}>{watermarkText}</span>
        </div>
      )}

      {/* Header */}
      <div className="h-fit px-4 py-1 flex items-center gap-2" style={{ background: headerGradient }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ border: '2px solid rgba(255,255,255,0.25)' }}>
          <img src="/images/logo.png" alt="logo" className="w-12 h-12 object-cover rounded-full" />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>{'अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट'}</div>
          <div className="flex gap-2 text-white text-[13px] mt-1 opacity-90 text-center items-center align-middle justify-center font-extrabold">
            <div className="text-center">{'(8860442044'}</div>
            <div className="border-r border-white h-4"></div>
            <div className='text-center'>{'ABSSD Trust)'}</div>
            {/* <div className="font-semibold">abssdtrust@gmail.com</div> */}
          </div>
        </div>
      </div>
<div className='flex flex-col justify-between' style={
  {background:  variant === 'annual' ?'orange' : 'rgba(255, 226, 198)',
      //  background: variant === 'annual'? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(/images/'idcard-bg1.jpeg') center/cover no-repeat` : 
      //  `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(/images/'idcard-bg1.jpeg') center/cover no-repeat`,
       height: '100%'

  }
}>
      {/* Body with subtle patterned background */}
      <div className="flex gap-2 px-3 py-3 relative flex-1" style={{ 
        // background: bodyBg
// background: 'url(/images/idcard-bg.jpeg) center/cover no-repeat'

       }}>
        <div className="absolute inset-0 opacity-10" aria-hidden>
          {/* subtle floral pattern using svg background */}
          <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor={variant === 'annual' ? '#fff7ed' : '#fffaf0'} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#g1)" />
            <g transform="translate(10,10)" fill="none" stroke={variant === 'annual' ? '#ffd8a8' : '#ffedd5'} strokeWidth="1">
              <path d="M20 100 C 40 80, 80 60, 120 80 C 160 100, 180 140, 200 160" />
              <path d="M0 60 C 30 40, 70 20, 110 40 C 150 60, 170 100, 200 120" />
            </g>
          </svg>
        </div>

        <div className="absolute top-1 right-2 text-gray-800 text-sm font-bold">
          <p>{user.memberNumber ? `#${user.memberNumber}` : 'N/A'}</p>
        </div>

        <div className="flex flex-col items-center gap-3" style={{ width: 110 }}>
          <div className="rounded-full overflow-hidden" style={{ width: 100, height: 100, border: `3px solid rgba(234,88,12,0.12)`, background: '#fff' }}>
            {photoSrc ? (
              <img src={photoSrc} className="w-full h-full object-cover" alt="member" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-50">
                <span className="text-4xl font-extrabold text-orange-300">{user.username?.[0]?.toUpperCase()}</span>
              </div>
            )}
          </div>

          <div style={{ background: variant === 'annual' ? '#fff7e2' : '#fffaf0' }} className="text-[10px] text-center font-bold px-2 py-1 rounded-full text-orange-700">{user.position?.name || 'Member'}</div>
        </div>

        <div className="flex-1 flex flex-col gap-2 text-[14px]" style={{ paddingTop: 6 }}>
          <div className="mb-2 flex gap-1 items-start">
            <div className="text-gray-700 text-[15px] font-semibold">नाम: </div>
            <div style={{ color: headlineColor }} className="text-[16px] font-extrabold max-w-[130px] break-words underline">{formatUsername(user.username)}</div>
          </div>

          <div className="mb-2 flex gap-1 items-start">
            <div className="text-gray-700 text-[14px] font-semibold">पता: </div>
            <div className="text-gray-800 text-[15px] max-w-[130px] break-words">{formatCityState(user.address?.city, user.address?.state)}</div>
          </div>

            <div className="mb-2 flex gap-1 items-start">
              <div className="text-gray-700 text-[14px] font-semibold">मोबाइल: </div>
              <div className="text-gray-800 text-[15px]">{user.contactNo || 'N/A'}</div>
            </div>
          {user.referredBy && (
            <div className="mt-1 flex gap-1 items-start">
              <div className="text-gray-700 text-[14px] font-semibold">टीम प्रभारी: </div>
              <div className="text-gray-800 text-[15px] font-semibold max-w-[130px] break-words">{typeof user.referredBy === 'object' ? (formatUsername(user.referredBy.username) || 'N/A') : String(formatUsername(user.referredBy))}</div>
            </div>
          )}

        </div>
      </div>
          <div className='flex flex-col items-center justify-center align-middle w-full'>
      <div className="mb-2 flex gap-1 w-full items-start align-middle justify-center">
        <div className="text-gray-700 text-[14px] font-semibold ">ईमेल: </div>
        <div className="text-gray-800 max-w-[200px] break-words" style={emailStyleFor(user.email)}>{user.email || 'N/A'}</div>
      </div>

          <div className="pt-1 mx-auto">
            <div className="inline-block px-2 py-1 rounded-full text-[10px] font-semibold" style={{ background: user.membershipStatus === 'active' ? '#dcfce7' : '#fff7cc', color: user.membershipStatus === 'active' ? '#166534' : '#92400e' }}>{user.membershipStatus === 'active' ? 'Active Member' : (user.membershipStatus || 'Pending')}</div>
          </div>
          </div>


      {/* Footer / signature and QR */}
      <div className="mt-1 flex items-center px-3" style={{ 
        // background: variant === 'annual' ? '#fff7ed' : '#fffaf0'
        }}>
        <div className="w-1/2 pr-2">
          <div style={{ color: headlineColor, fontWeight: 700, fontSize: 18 }}>राष्ट्रीय अध्यक्ष</div>
         {!watermarkText && <div className="mt-2">
            <img
              src="/images/signature.png"
              alt="Signature"
              style={{ width: 100, height: 40, objectFit: 'contain', display: 'block' }}
            />
         </div>}
          <div className={`${watermarkText ? 'h-7' : 'h-2'} border-b border-dashed border-gray-300 my-0 mr-8`}></div>
        </div>
        <div className="w-1/2 flex items-center justify-end pr-1 mt-2">
          <div style={{ width: 76, height: 84 }} className="flex flex-col items-center gap-1">
            <div style={{ width: 52, height: 52 }} className="bg-white flex items-center justify-center rounded-sm overflow-hidden">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(user._id)}&size=100x100`} alt="Member QR Code" style={{ width: 52, height: 52 }} />
            </div>
            <div className="text-gray-800 text-[10px] font-bold leading-tight">https://abssd.in</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
})

export default IDCard
