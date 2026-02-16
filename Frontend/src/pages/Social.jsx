import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaDownload,
  FaRedo,
} from 'react-icons/fa';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import SEO from '../components/SEO';
import apiClient from '../api/client';

// Canvas positioning constants
const CANVAS_CONFIG = {
  PHOTO: {
    X: 610,
    Y: 205,
    WIDTH: 200,
    HEIGHT: 200,
    RADIUS: 12,
  },
  NAME: {
    X: 600,
    Y: 430,
    FONT: 'bold 36px "Akshar", sans-serif',
    LINE_HEIGHT: 60,
  },
  PHONE: {
    X: 600,
    Y: 468,
    FONT: 'bold 26px "Akshar", sans-serif',
    LINE_HEIGHT: 50,
  },
  ADDRESS: {
    X: 600,
    Y: 505,
    FONT: 'bold 22px "Akshar", sans-serif',
    LINE_HEIGHT: 50,
  },
  TEXT_COLOR: '#003366',
  MAX_WIDTH_OFFSET: 30,
};

const TEMPLATE_IMAGE = '/images/abssdLinkNew.jpeg';
const IMAGE_RENDER_DELAY = 150;

const Social = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState(null);
  const [composedImage, setComposedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle photo upload with validation
  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUserPhoto(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      setOriginalPhotoUrl(imageUrl);
      setUserPhotoUrl(imageUrl);
      setShowCropModal(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle crop complete
  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Create cropped image canvas
  const createCroppedImage = useCallback(() => {
    if (!originalPhotoUrl || !croppedAreaPixels) return;

    const image = new Image();
    image.src = originalPhotoUrl;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          setUserPhotoUrl(reader.result);
          setShowCropModal(false);
        };
      });
    };
  }, [originalPhotoUrl, croppedAreaPixels]);

  // Utility function to draw text on canvas
  const drawTextOnCanvas = useCallback(
    (ctx, nameText, mobileText, addressText) => {
      const canvasWidth = ctx.canvas.width;
      const maxWidth =
        canvasWidth - CANVAS_CONFIG.NAME.X - CANVAS_CONFIG.MAX_WIDTH_OFFSET;

      // NAME - Single line, no wrapping
      ctx.font = CANVAS_CONFIG.NAME.FONT;
      ctx.fillStyle = CANVAS_CONFIG.TEXT_COLOR;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const nameMetrics = ctx.measureText(nameText);
      const nameWidth = nameMetrics.width;

      // Calculate name position - if it exceeds maxWidth, shift it left
      const minX = CANVAS_CONFIG.MAX_WIDTH_OFFSET;
      let nameX = CANVAS_CONFIG.NAME.X;

      if (nameWidth > maxWidth) {
        nameX = Math.max(
          minX,
          canvasWidth - nameWidth - CANVAS_CONFIG.MAX_WIDTH_OFFSET,
        );
      }

      ctx.strokeText(nameText, nameX, CANVAS_CONFIG.NAME.Y);
      ctx.fillText(nameText, nameX, CANVAS_CONFIG.NAME.Y);

      // PHONE - Center it below the name dynamically
      if (mobileText?.trim()) {
        ctx.font = CANVAS_CONFIG.PHONE.FONT;
        ctx.fillStyle = CANVAS_CONFIG.TEXT_COLOR;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';

        const phoneMetrics = ctx.measureText(mobileText);
        const phoneWidth = phoneMetrics.width;
        const phoneX = nameX + (nameWidth - phoneWidth) / 2;

        ctx.strokeText(mobileText, phoneX, CANVAS_CONFIG.PHONE.Y);
        ctx.fillText(mobileText, phoneX, CANVAS_CONFIG.PHONE.Y);
      }

      // ADDRESS - Center it below the name dynamically
      ctx.font = CANVAS_CONFIG.ADDRESS.FONT;
      ctx.fillStyle = CANVAS_CONFIG.TEXT_COLOR;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.textAlign = 'left';

      const addressMetrics = ctx.measureText(addressText);
      const addressWidth = addressMetrics.width;

      // Center the address relative to the name
      const addressX = nameX + (nameWidth - addressWidth) / 2;

      ctx.strokeText(addressText, addressX, CANVAS_CONFIG.ADDRESS.Y);
      ctx.fillText(addressText, addressX, CANVAS_CONFIG.ADDRESS.Y);
    },
    [],
  );

  // Draw rounded rectangle clip path for photo
  const drawRoundedClipPath = useCallback(
    (ctx, x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height,
      );
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    },
    [],
  );

  // Main function to render on canvas
  const renderCanvasImage = useCallback(
    (canvas, photoUrl, nameText, mobileText, addressText) => {
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bgImage = new Image();
      bgImage.crossOrigin = 'anonymous';
      bgImage.src = TEMPLATE_IMAGE;

      bgImage.onload = () => {
        canvas.width = bgImage.width;
        canvas.height = bgImage.height;
        ctx.drawImage(bgImage, 0, 0);

        if (photoUrl) {
          const userImg = new Image();
          userImg.crossOrigin = 'anonymous';
          userImg.src = photoUrl;

          userImg.onload = () => {
            const {
              X: photoX,
              Y: photoY,
              WIDTH: photoWidth,
              HEIGHT: photoHeight,
              RADIUS: radius,
            } = CANVAS_CONFIG.PHOTO;

            ctx.save();
            drawRoundedClipPath(
              ctx,
              photoX,
              photoY,
              photoWidth,
              photoHeight,
              radius,
            );
            ctx.clip();

            // Calculate aspect ratio for proper image fitting
            const imgAspect = userImg.width / userImg.height;
            const frameAspect = photoWidth / photoHeight;

            let drawWidth, drawHeight, drawX, drawY;

            if (imgAspect > frameAspect) {
              drawHeight = photoHeight;
              drawWidth = userImg.width * (photoHeight / userImg.height);
              drawX = photoX - (drawWidth - photoWidth) / 2;
              drawY = photoY;
            } else {
              drawWidth = photoWidth;
              drawHeight = userImg.height * (photoWidth / userImg.width);
              drawX = photoX;
              drawY = photoY - (drawHeight - photoHeight) / 2;
            }

            ctx.drawImage(userImg, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();

            drawTextOnCanvas(ctx, nameText, mobileText, addressText);
          };

          userImg.onerror = () => {
            console.error('Failed to load user photo');
            drawTextOnCanvas(ctx, nameText, mobileText, addressText);
          };
        } else {
          drawTextOnCanvas(ctx, nameText, mobileText, addressText);
        }
      };

      bgImage.onerror = () => {
        console.error('Failed to load template image');
      };
    },
    [drawTextOnCanvas, drawRoundedClipPath],
  );

  // Update preview in real-time
  useEffect(() => {
    if (!previewCanvasRef.current) return;

    renderCanvasImage(
      previewCanvasRef.current,
      userPhotoUrl,
      name || 'Your Name',
      mobile || 'Your Mobile',
      address || 'Your City',
    );
  }, [name, mobile, address, userPhotoUrl, renderCanvasImage]);

  // Generate and save to database
  const generateAndSaveImage = useCallback(async () => {
    if (!name?.trim() || !address?.trim()) {
      alert('Please fill in your name and city');
      return;
    }

    setIsGenerating(true);
    const canvas = canvasRef.current;

    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    try {
      renderCanvasImage(canvas, userPhotoUrl, name, mobile, address);

      // Wait for image to render
      await new Promise((resolve) => setTimeout(resolve, IMAGE_RENDER_DELAY));

      const imageUrl = canvas.toDataURL('image/png', 1.0);
      setComposedImage(imageUrl);
      setShowShareOptions(true);

      // Scroll to top to show the generated image
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Save to database
      setIsSaving(true);
      try {
        await apiClient('/social-cards', {
          method: 'POST',
          body: {
            name: name.trim(),
            mobile: mobile?.trim() || undefined,
            address: address.trim(),
            generated: true,
          },
        });
      } catch (error) {
        console.error('Error saving social card data:', error);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsSaving(false);
      setIsGenerating(false);
    }
  }, [name, mobile, address, userPhotoUrl, renderCanvasImage]);

  // Download image
  const downloadImage = useCallback(() => {
    if (!composedImage) {
      alert('Please generate the image first');
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `ABSSD_${name.trim().replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = composedImage;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  }, [composedImage, name]);

  // Share functions
  const shareOnFacebook = useCallback(() => {
    const text = encodeURIComponent(
      `Check out my ABSSD Trust support! - ${name}`,
    );
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      '_blank',
      'noopener,noreferrer',
    );
  }, [name]);

  const shareOnTwitter = useCallback(() => {
    const text = encodeURIComponent(
      `Check out my ABSSD Trust support! - ${name}\n\n#ABSSDTrust #SocialService`,
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      '_blank',
      'noopener,noreferrer',
    );
  }, [name]);

  const shareOnWhatsApp = useCallback(() => {
    const text = encodeURIComponent(
      `Check out my ABSSD Trust support! - ${name}`,
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }, [name]);

  const shareOnInstagram = useCallback(() => {
    alert('Please download the image and share it on Instagram app');
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setName('');
    setAddress('');
    setMobile('');
    setUserPhoto(null);
    setUserPhotoUrl(null);
    setOriginalPhotoUrl(null);
    setComposedImage(null);
    setShowShareOptions(false);
    setShowCropModal(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <>
      <SEO
        title='Create Your Social Card - ABSSD Trust'
        description='Create and share your personalized ABSSD Trust support card'
        keywords='ABSSD Trust, social card, support, community'
      />

      {/* Crop Modal */}
      {showCropModal && originalPhotoUrl && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-2xl w-full max-w-2xl'>
            <h3 className='text-2xl font-bold text-gray-800 p-6 border-b'>
              Crop Your Photo
            </h3>

            <div className='relative w-full h-96 bg-gray-200'>
              <Cropper
                image={originalPhotoUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape='round'
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
                restrictPosition={true}
              />
            </div>

            {/* Zoom Slider */}
            <div className='p-6 border-t'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Zoom
              </label>
              <input
                type='range'
                min='1'
                max='3'
                step='0.1'
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className='w-full'
              />
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4 p-6 border-t bg-gray-50'>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setUserPhotoUrl(null);
                  setOriginalPhotoUrl(null);
                  setUserPhoto(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className='flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition font-semibold'
              >
                Cancel
              </button>
              <button
                onClick={createCroppedImage}
                className='flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-semibold'
              >
                Crop & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='min-h-screen bg-gradient-to-br from-orange-50 to-orange-100  py-12 px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-orange-600 mb-2'>
              Create Your Social Card
            </h1>
          </div>

          {/* Main Content - Flexbox Layout */}
          <div className='flex flex-col-reverse md:flex-row gap-8'>
            {/* Form Section - Left side on desktop */}
            <div className='w-full lg:w-1/2'>
              <div className='bg-white rounded-lg shadow-xl p-8'>
                <h2 className='text-2xl font-bold text-gray-800  mb-6'>
                  Your Details
                </h2>

                {/* Name Input */}
                <div className='mb-6'>
                  <label
                    htmlFor='name-input'
                    className='block text-gray-700 font-semibold mb-2'
                  >
                    Your Name *
                  </label>
                  <input
                    id='name-input'
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Enter your name'
                    maxLength={50}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition'
                    style={{ fontFamily: 'Akshar, sans-serif' }}
                    aria-required='true'
                    autoComplete='name'
                  />
                </div>

                {/* Mobile Input */}
                <div className='mb-6'>
                  <label
                    htmlFor='mobile-input'
                    className='block text-gray-700 font-semibold mb-2'
                  >
                    Mobile Number
                  </label>
                  <input
                    id='mobile-input'
                    type='tel'
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder='Enter your mobile number'
                    maxLength={15}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition'
                    style={{ fontFamily: 'Akshar, sans-serif' }}
                    autoComplete='tel'
                  />
                </div>

                {/* Address Input */}
                <div className='mb-6'>
                  <label
                    htmlFor='city-input'
                    className='block text-gray-700 font-semibold mb-2'
                  >
                    City *
                  </label>
                  <input
                    id='city-input'
                    type='text'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder='Enter your city'
                    maxLength={30}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition'
                    style={{ fontFamily: 'Akshar, sans-serif' }}
                    aria-required='true'
                    autoComplete='address-level2'
                  />
                </div>

                {/* Photo Upload */}
                <div className='mb-8'>
                  <label
                    htmlFor='photo-upload'
                    className='block text-gray-700 font-semibold mb-2'
                  >
                    Upload Your Photo
                  </label>
                  <div className='flex items-center gap-4 flex-wrap'>
                    <input
                      id='photo-upload'
                      type='file'
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept='image/jpeg,image/jpg,image/png,image/webp'
                      className='hidden'
                      aria-label='Choose photo file'
                    />
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-semibold'
                      aria-label='Choose photo'
                    >
                      Choose Photo
                    </button>
                    {userPhoto && (
                      <span className='text-green-600 font-medium'>
                        ✓ {userPhoto.name}
                      </span>
                    )}
                  </div>
                  {userPhotoUrl && (
                    <div className='mt-4 flex items-end gap-4'>
                      <div>
                        <img
                          src={userPhotoUrl}
                          alt='Your photo preview'
                          className='w-32 h-32 object-cover rounded-full border-4 border-orange-500'
                        />
                      </div>
                      <button
                        type='button'
                        onClick={() => {
                          setOriginalPhotoUrl(userPhotoUrl);
                          setCrop({ x: 0, y: 0 });
                          setZoom(1);
                          setCroppedAreaPixels(null);
                          setShowCropModal(true);
                        }}
                        className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-semibold'
                        aria-label='Edit photo'
                      >
                        Edit Photo
                      </button>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <div className='flex gap-4'>
                  <button
                    onClick={generateAndSaveImage}
                    disabled={
                      isGenerating ||
                      isSaving ||
                      !name?.trim() ||
                      !address?.trim()
                    }
                    className='flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                    aria-label='Generate social card image'
                  >
                    {isGenerating || isSaving
                      ? 'Processing...'
                      : 'Generate Image'}
                  </button>
                  {(name || address || userPhotoUrl) && (
                    <button
                      onClick={resetForm}
                      className='px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition font-bold text-lg shadow-lg flex items-center gap-2'
                      title='Reset Form'
                      aria-label='Reset form'
                    >
                      <FaRedo />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Section - Right side on desktop */}
            <div className='w-full lg:w-1/2'>
              <div className='bg-white rounded-lg shadow-xl p-8 sticky top-8'>
                <h2 className='text-2xl font-bold text-gray-800 mb-4 text-center'>
                  Preview
                </h2>

                {/* Preview Image - Default visible or after generation */}
                <div className='flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[400px]'>
                  {composedImage ? (
                    <img
                      src={composedImage}
                      alt='Generated ABSSD Trust social card'
                      className='max-w-full h-auto rounded-lg shadow-lg border-4 border-orange-500'
                    />
                  ) : (
                    <canvas
                      ref={previewCanvasRef}
                      className='max-w-full h-auto rounded-lg shadow-lg border-4 border-orange-500'
                      style={{ display: 'block', maxHeight: '500px' }}
                      aria-label='Live preview of your social card'
                    />
                  )}
                </div>

                {/* Share Options - Show after generation */}
                {showShareOptions && composedImage && (
                  <div className='mt-8 space-y-4'>
                    {/* Download Button */}
                    <button
                      onClick={downloadImage}
                      className='w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-bold text-lg shadow-lg flex items-center justify-center gap-2'
                      aria-label='Download generated image'
                    >
                      <FaDownload className='text-xl' />
                      Download Image
                    </button>

                    {/* Share Section */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-700 mb-4 text-center'>
                        Share on Social Media
                      </h3>
                      <div className='grid grid-cols-2 gap-4'>
                        <button
                          onClick={shareOnFacebook}
                          className='px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2'
                          aria-label='Share on Facebook'
                        >
                          <FaFacebook className='text-xl' />
                          Facebook
                        </button>
                        <button
                          onClick={shareOnTwitter}
                          className='px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2'
                          aria-label='Share on Twitter'
                        >
                          <FaTwitter className='text-xl' />
                          Twitter
                        </button>
                        <button
                          onClick={shareOnInstagram}
                          className='px-4 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2'
                          aria-label='Share on Instagram'
                        >
                          <FaInstagram className='text-xl' />
                          Instagram
                        </button>
                        <button
                          onClick={shareOnWhatsApp}
                          className='px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2'
                          aria-label='Share on WhatsApp'
                        >
                          <FaWhatsapp className='text-xl' />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for final image */}
      <canvas ref={canvasRef} className='hidden' />
    </>
  );
};

export default Social;
