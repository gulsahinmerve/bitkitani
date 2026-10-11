import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Trash2,
} from 'lucide-react';
import { GardenPlant } from '../types';

interface DataBackupBarProps {
  plants: GardenPlant[];
  onRestoreBackup: (restoredPlants: GardenPlant[]) => void;
  onResetToDefaults: () => void;
  onClearAllPlants?: () => void;
}

export const DataBackupBar: React.FC<DataBackupBarProps> = ({
  plants,
  onRestoreBackup,
  onResetToDefaults,
  onClearAllPlants,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);

  const sharedAppUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-6ofdj45v47q2arg64uyca3-40331100281.europe-west2.run.app';

  const totalObservations = plants.reduce(
    (acc, p) => acc + p.observations.length,
    0
  );
  const totalCareActions = plants.reduce(
    (acc, p) => acc + (p.careActions?.length || 0),
    0
  );

  const handleExportJson = () => {
    try {
      const backupPayload = {
        backupVersion: '1.0',
        schoolName: 'Yıldızkent Ortaokulu',
        projectTitle:
          'TÜBİTAK 4006-B Yapay Zekâ Destekli Okul Bahçesi Bitki Sağlığı İzleme Sistemi',
        exportedAt: new Date().toISOString(),
        plantCount: plants.length,
        observationCount: totalObservations,
        careActionCount: totalCareActions,
        plants,
      };

      const jsonString = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonString], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const dateStamp = new Date().toISOString().slice(0, 10);

      const a = document.createElement('a');
      a.href = url;
      a.download = `yildizkent_ortaokulu_bitki_yedek_${dateStamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `JSON yedek dosyası başarıyla indirildi (${plants.length} bitki, ${totalObservations} gözlem, ${totalCareActions} bakım kaydı).`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Yedek dosyası oluşturulurken bir hata oluştu.',
      });
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result;
        if (typeof raw !== 'string') {
          throw new Error('Dosya okunamadı.');
        }

        const parsed = JSON.parse(raw);
        const candidatePlants: GardenPlant[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.plants)
          ? parsed.plants
          : [];

        if (
          !Array.isArray(candidatePlants) ||
          candidatePlants.length === 0 ||
          !candidatePlants[0].id ||
          !candidatePlants[0].plantName ||
          !Array.isArray(candidatePlants[0].observations)
        ) {
          throw new Error(
            'Geçersiz yedek dosyası formatı. Lütfen Yıldızkent Ortaokulu JSON yedek dosyasını seçin.'
          );
        }

        onRestoreBackup(candidatePlants);
        setStatusMessage({
          type: 'success',
          text: `Yedek başarıyla geri yüklendi! ${candidatePlants.length} bitki ve tüm geçmiş gözlem verileri sisteme aktarıldı.`,
        });
      } catch (err: unknown) {
        setStatusMessage({
          type: 'error',
          text:
            err instanceof Error
              ? err.message
              : 'JSON yedek dosyası yüklenirken hata oluştu.',
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCopyMobileLink = async () => {
    try {
      await navigator.clipboard.writeText(sharedAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    sharedAppUrl
  )}`;

  return (
    <section
      aria-label="Veri Koruması JSON Yedekleme ve Mobil Erişim Sistemi"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-900/15 space-y-4"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportJsonFile}
        className="hidden"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>VERİ KORUMASI & JSON YEDEKLEME SİSTEMİ + CEP TELEFONU BAĞLANTISI</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#14241B]">
            💾 Yıldızkent Ortaokulu Gözlem Verilerini Yedekle / Yedekten Geri Yükle
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tüm bitki kayıtlarınızı, fotoğrafları, haftalık analizleri ve bakım takvimini <strong>.json</strong> dosyası olarak cihazınıza indirebilir; istediğiniz zaman veya başka bir telefon/bilgisayarda <strong>Yedekten Aç</strong> butonuyla geri yükleyebilirsiniz.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0F5338] text-white text-xs font-semibold hover:bg-[#0B3F2A] transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            JSON Yedek İndir
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border-2 border-emerald-700/35 bg-emerald-50 text-emerald-950 text-xs font-semibold hover:bg-emerald-100 transition-colors whitespace-nowrap"
          >
            <Upload className="w-4 h-4 text-emerald-800" />
            Yedekten Aç (JSON Yükle)
          </button>

          <button
            type="button"
            onClick={() => setShowMobileModal(!showMobileModal)}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-300 bg-[#F6F8F5] text-[#14241B] text-xs font-semibold hover:bg-slate-200/70 transition-colors whitespace-nowrap"
          >
            <Smartphone className="w-4 h-4 text-emerald-700" />
            📱 Cep Telefonunda Aç
          </button>

          {onClearAllPlants && plants.length > 0 && (
            !confirmClearAll ? (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border border-red-300 bg-red-50 text-red-900 text-xs font-semibold hover:bg-red-100 transition-colors whitespace-nowrap"
                title="Tüm örnek bitkileri silip kendi bahçe bitkilerinizi sıfırdan ekleyin"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-700" />
                Örnek Bitkileri Sil (Sıfırdan Başla)
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-300 px-3 py-1.5 rounded-xl">
                <span className="text-[11px] font-semibold text-red-950">
                  Tüm bitkiler silinsin mi?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAllPlants();
                    setConfirmClearAll(false);
                    setStatusMessage({
                      type: 'success',
                      text: 'Tüm örnek bitkiler silindi! Artık sadece kendi çektiğiniz bitkileri kaydedebilirsiniz.',
                    });
                  }}
                  className="px-2 py-1 rounded bg-red-700 text-white text-[11px] font-bold"
                >
                  Evet, Sil
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2 py-1 rounded bg-white text-slate-700 text-[11px] font-semibold border border-slate-300"
                >
                  İptal
                </button>
              </div>
            )
          )}

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors whitespace-nowrap"
              title="Varsayılan Yıldızkent Ortaokulu verilerine dön"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Örnek Verileri Geri Getir
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-semibold text-amber-950">
                Sıfırlansın mı?
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetToDefaults();
                  setConfirmReset(false);
                  setStatusMessage({
                    type: 'success',
                    text: 'Veriler Yıldızkent Ortaokulu başlangıç örnek verilerine sıfırlandı.',
                  });
                }}
                className="px-2 py-1 rounded bg-amber-700 text-white text-[11px] font-bold"
              >
                Evet
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 rounded bg-white text-slate-700 text-[11px] font-semibold border border-slate-300"
              >
                İptal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold underline shrink-0"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Mobile Link & QR Code Drawer */}
      {showMobileModal && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F8F5] border border-emerald-900/15 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>📱 Cep Telefonundan Nasıl Açılır? (3 Kolay Adım)</span>
            </div>
            <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside leading-relaxed">
              <li>
                Aşağıdaki <strong>Paylaşım Linkini Kopyala</strong> butonuna basıp WhatsApp veya e-posta ile telefonunuza gönderin ya da sağdaki <strong>QR Kodu</strong> telefon kameranızla okutun.
              </li>
              <li>
                Bağlantıyı telefonunuzda <strong>Chrome</strong> (Android) veya <strong>Safari</strong> (iPhone) tarayıcısında açın.
              </li>
              <li>
                Tam ekran uygulama gibi kullanmak için tarayıcı menüsünden <strong>“Ana Ekrana Ekle”</strong> seçeneğine dokunun. Cihazlar arasında veri taşımak için <strong>JSON Yedek İndir / Yedekten Aç</strong> özelliğini kullanabilirsiniz!
              </li>
            </ol>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={sharedAppUrl}
                className="flex-1 min-w-[220px] min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={handleCopyMobileLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#0F5338] text-white text-xs font-semibold hover:bg-[#0B3F2A]"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Link Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Paylaşım Linkini Kopyala
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center bg-white p-3.5 rounded-xl border border-slate-200">
            <img
              src={qrImageUrl}
              alt="Yıldızkent Ortaokulu Mobil Giriş QR Kodu"
              className="w-36 h-36 object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            <span className="text-[11px] font-semibold text-slate-600 mt-2 text-center">
              Telefon Kamerasıyla Okutun
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
