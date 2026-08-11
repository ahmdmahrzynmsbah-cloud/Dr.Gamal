/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  renderType?: 'barcode' | 'qrcode' | 'both';
}

export default function Barcode({ 
  value, 
  width = 1.5, 
  height = 45, 
  showText = true,
  renderType = 'both'
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [barcodeError, setBarcodeError] = useState<boolean>(false);

  // Clean value (only standard ASCII for CODE128)
  const cleanValue = value ? String(value).trim() : '000000';

  // Render CODE128 linear barcode using standard JsBarcode
  useEffect(() => {
    if ((renderType === 'barcode' || renderType === 'both') && svgRef.current && cleanValue) {
      try {
        setBarcodeError(false);
        // Clear previous SVG contents
        svgRef.current.innerHTML = '';
        JsBarcode(svgRef.current, cleanValue, {
          format: 'CODE128',
          width: width || 1.5,
          height: height || 45,
          displayValue: false,
          margin: 8,
          background: '#ffffff',
          lineColor: '#000000',
          flat: true
        });
      } catch (err) {
        console.error('JsBarcode rendering error, trying fallback CODE39:', err);
        try {
          if (svgRef.current) {
            svgRef.current.innerHTML = '';
            JsBarcode(svgRef.current, cleanValue, {
              format: 'CODE39',
              width: width || 1.5,
              height: height || 45,
              displayValue: false,
              margin: 8,
              background: '#ffffff',
              lineColor: '#000000'
            });
          }
        } catch (e) {
          setBarcodeError(true);
        }
      }
    }
  }, [cleanValue, width, height, renderType]);

  // Generate QR code base64 url
  useEffect(() => {
    if (renderType === 'qrcode' || renderType === 'both') {
      if (!cleanValue) return;
      QRCode.toDataURL(cleanValue, {
        margin: 1,
        width: 160,
        errorCorrectionLevel: 'H', // High error correction level for easy camera scanning
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR code:', err));
    }
  }, [cleanValue, renderType]);

  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-3xs hover:shadow-2xs transition-all w-full" dir="ltr">
      
      {/* Container for code rendering based on renderType */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        
        {/* BARCODE RENDER */}
        {(renderType === 'barcode' || renderType === 'both') && (
          <div className="flex flex-col items-center justify-center grow max-w-full">
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden w-full">
              {barcodeError ? (
                <div className="text-rose-500 text-[10px] font-bold p-2 text-center">
                  خطأ في إنشاء الباركود
                </div>
              ) : (
                <svg
                  ref={svgRef}
                  style={{ 
                    maxWidth: '100%',
                    height: `${height}px`
                  }}
                  className="block bg-white"
                />
              )}
            </div>
            {showText && renderType === 'barcode' && (
              <span className="mt-1.5 text-[10px] font-mono tracking-[3px] font-bold text-slate-800 dark:text-slate-100 uppercase text-center">
                {cleanValue}
              </span>
            )}
          </div>
        )}

        {/* QR CODE RENDER */}
        {(renderType === 'qrcode' || renderType === 'both') && qrDataUrl && (
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700 shadow-4xs flex items-center justify-center">
              <img 
                src={qrDataUrl} 
                alt={`QR code for ${value}`} 
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain block" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

      </div>

      {/* Unified Caption display */}
      {showText && renderType !== 'barcode' && (
        <div className="mt-1.5 text-center">
          <span className="text-[10px] font-mono tracking-[2px] font-black text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm uppercase">
            ID: {cleanValue}
          </span>
        </div>
      )}

    </div>
  );
}

