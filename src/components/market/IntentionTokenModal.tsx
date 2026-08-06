import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Printer, Share2, Loader2, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppStore } from '../../store/appStore';
import { formatDate, formatINRLakhs, generateTokenId } from '../../utils/formatters';
import type { IntentionToken } from '../../types';

// ─── Form View ────────────────────────────────────────────────────────────────

interface IntentionTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = 'form' | 'receipt';

export function IntentionTokenModal({ isOpen, onClose }: IntentionTokenModalProps) {
  const {
    preferences,
    ingestionContext,
    recommendations,
    selectedFPO,
    intentionToken,
    setIntentionToken,
    setFarmerProfile,
  } = useAppStore();

  const [step, setStep] = useState<ModalStep>(intentionToken ? 'receipt' : 'form');
  const [isGenerating, setIsGenerating] = useState(false);
  const [farmerName, setFarmerName] = useState(preferences.farmerName);
  const [farmerMobile, setFarmerMobile] = useState(preferences.farmerMobile);
  const [village, setVillage] = useState(
    preferences.village || ingestionContext.location?.block || ''
  );
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const topCrop = recommendations[0];

  // Generate QR when receipt is shown
  useEffect(() => {
    if (step === 'receipt' && intentionToken && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, intentionToken.qrPayload, {
        width: 160,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch(console.error);
    }
  }, [step, intentionToken]);

  async function handleGenerate() {
    if (!topCrop || !selectedFPO) return;

    setIsGenerating(true);
    setFarmerProfile(farmerName, farmerMobile, village);

    await new Promise((r) => setTimeout(r, 1200));

    const tokenId = generateTokenId();
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 90); // 90-day validity

    const payload = JSON.stringify({
      tokenId,
      farmerMobile,
      cropId: topCrop.crop.id,
      fpoId: selectedFPO.id,
      acreage: ingestionContext.acreage,
      district: ingestionContext.location?.district ?? 'Unknown',
      issuedAt: now.toISOString(),
    });

    const token: IntentionToken = {
      tokenId,
      farmerName,
      farmerMobile,
      village,
      district: ingestionContext.location?.district ?? 'Unknown',
      acreage: ingestionContext.acreage,
      cropId: topCrop.crop.id,
      cropName: topCrop.crop.name,
      fpoId: selectedFPO.id,
      fpoName: selectedFPO.name,
      season: topCrop.crop.season,
      year: now.getFullYear(),
      issuedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      qrPayload: payload,
      status: 'pending',
    };

    setIntentionToken(token);
    setIsGenerating(false);
    setStep('receipt');
  }

  function handlePrint() {
    window.print();
  }

  const isFormValid = farmerName.trim() && farmerMobile.trim().length >= 10;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        if (!intentionToken) setStep('form');
      }}
      title={step === 'form' ? 'Official Procurement Registration' : 'Registration Acknowledgment'}
      size="md"
    >
      {step === 'form' ? (
        <div className="space-y-4">
          {/* Crop & FPO Info */}
          {topCrop && selectedFPO && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Selected Crop</span>
                <span className="text-sm font-bold text-gray-900">
                  {topCrop.crop.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Procurement Center (FPO)</span>
                <span className="text-sm font-semibold text-[var(--color-goi-navy)] truncate max-w-[180px]">
                  {selectedFPO.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Cultivable Area</span>
                <span className="text-sm font-semibold text-gray-900">
                  {ingestionContext.acreage.toFixed(1)} acres
                </span>
              </div>
            </div>
          )}

          {/* Farmer Details Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="farmer-name"
                className="block text-sm font-bold text-gray-700 mb-1.5"
              >
                Farmer Name <span className="text-red-500">*</span>
              </label>
              <input
                id="farmer-name"
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="Enter full name as per Aadhaar"
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 min-h-[44px] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-goi-saffron)] transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="farmer-mobile"
                className="block text-sm font-bold text-gray-700 mb-1.5"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                id="farmer-mobile"
                type="tel"
                value={farmerMobile}
                onChange={(e) => setFarmerMobile(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 min-h-[44px] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-goi-saffron)] transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="farmer-village"
                className="block text-sm font-bold text-gray-700 mb-1.5"
              >
                Village / Block
              </label>
              <input
                id="farmer-village"
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Village name"
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 min-h-[44px] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-goi-saffron)] transition-colors"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              variant="amber"
              size="lg"
              fullWidth
              isLoading={isGenerating}
              disabled={!isFormValid}
              onClick={handleGenerate}
            >
              {isGenerating ? 'Registering Intention…' : 'Submit Registration'}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">
              By submitting, you register your intent to cultivate the selected crop for the upcoming season.
            </p>
          </div>
        </div>
      ) : (
        /* ─── Receipt View ─────────────────────────────────────── */
        intentionToken ? (
          <div
            className="space-y-4"
            id="intention-receipt"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-900">
                  Registration Successful
                </p>
                <p className="text-xs text-green-700 font-medium">
                  Valid until {formatDate(intentionToken.expiresAt)}
                </p>
              </div>
              <Badge variant="emerald" className="ml-auto shrink-0 bg-green-600 text-white border-transparent">
                {intentionToken.status.toUpperCase()}
              </Badge>
            </div>

            {/* Receipt Card */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm text-gray-900 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">
                    Government of India
                  </p>
                  <p className="text-lg font-black text-[var(--color-goi-navy)] leading-tight">
                    Pre-Sowing Intention Certificate
                  </p>
                </div>
                <div className="p-1 border border-gray-200 rounded bg-white shrink-0">
                  <canvas ref={qrCanvasRef} style={{ width: 64, height: 64 }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm pt-2">
                {[
                  ['Registration ID', intentionToken.tokenId],
                  ['Farmer Name', intentionToken.farmerName],
                  ['Mobile', intentionToken.farmerMobile],
                  ['Village', intentionToken.village || '—'],
                  ['District', intentionToken.district],
                  ['Target Crop', `${intentionToken.cropName}`],
                  ['Procurement Center', intentionToken.fpoName],
                  ['Area', `${intentionToken.acreage.toFixed(1)} acres`],
                  ['Season', `${intentionToken.season} ${intentionToken.year}`],
                  ['Date of Issue', formatDate(intentionToken.issuedAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="font-semibold text-gray-900 text-xs mt-0.5">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 pt-3 text-center">
                <p className="text-[10px] text-gray-500 font-medium">
                  This certificate is a non-binding declaration of intent and is valid for 90
                  days from issue date. Please present this QR code at the designated procurement center.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                leftIcon={<Share2 className="h-4 w-4" />}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Pre-Sowing Intention Certificate',
                      text: `Registration ID: ${intentionToken.tokenId} | Crop: ${intentionToken.cropName} | Center: ${intentionToken.fpoName}`,
                    }).catch(console.error);
                  }
                }}
              >
                Share
              </Button>
            </div>
          </div>
        ) : null
      )}
    </Modal>
  );
}
