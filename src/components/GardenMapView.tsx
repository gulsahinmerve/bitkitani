import React, { useState } from 'react';
import {
  MapPin,
  PlusCircle,
  Camera,
  TrendingUp,
  Check,
  Calendar,
  BookOpen,
  BellRing,
} from 'lucide-react';
import { GardenPlant } from '../types';
import {
  SAMPLE_GARDEN_PHOTOS,
  YILDIZKENT_CAMPUS_ZONES,
  formatTurkishShortDate,
  getAnalysisReminderStatus,
  getCareActionMeta,
  getPlantEncyclopedia,
  getStatusFromScore,
  getStatusLabel,
} from '../data/initialGardenData';
import { ResilientImage } from './ResilientImage';

interface GardenMapViewProps {
  plants: GardenPlant[];
  onReanalyzePlant: (plantId: string) => void;
  onOpenTimelineForPlant: (plantId: string) => void;
  onOpenCalendarForPlant?: (plantId: string) => void;
  onOpenEncyclopediaForPlant: (plant: GardenPlant) => void;
  onAddQuickPlantOnMap: (newPlant: {
    plantName: string;
    scientificName: string;
    location: string;
    mapX: number;
    mapY: number;
    healthScore: number;
    studentNote: string;
  }) => void;
}

export const GardenMapView: React.FC<GardenMapViewProps> = ({
  plants,
  onReanalyzePlant,
  onOpenTimelineForPlant,
  onOpenCalendarForPlant,
  onOpenEncyclopediaForPlant,
  onAddQuickPlantOnMap,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    plants[0]?.id || ''
  );
  const [isAddingMode, setIsAddingMode] = useState<boolean>(false);
  const [draftCoords, setDraftCoords] = useState<{ x: number; y: number }>({
    x: 42,
    y: 62,
  });
  const [draftName, setDraftName] = useState<string>('');
  const [draftLocation, setDraftLocation] = useState<string>(
    YILDIZKENT_CAMPUS_ZONES[0].name
  );
  const [draftScore, setDraftScore] = useState<number>(82);
  const [draftNote, setDraftNote] = useState<string>('');

  const selectedPlant =
    plants.find((p) => p.id === selectedPlantId) || plants[0];

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setDraftCoords({
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(90, y)),
    });
  };

  const handleCreateMapPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;
    onAddQuickPlantOnMap({
      plantName: draftName.trim(),
      scientificName: 'Yıldızkent Ortaokulu Bahçe Bitkisi',
      location: draftLocation.trim() || 'Yıldızkent Ortaokulu Bahçesi',
      mapX: draftCoords.x,
      mapY: draftCoords.y,
      healthScore: draftScore,
      studentNote:
        draftNote.trim() ||
        'Yıldızkent Ortaokulu bahçe krokisi üzerinden yeni bitki gözlem noktası eklendi.',
    });
    setDraftName('');
    setDraftNote('');
    setIsAddingMode(false);
  };

  const latestObs = selectedPlant
    ? selectedPlant.observations[selectedPlant.observations.length - 1]
    : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Yıldızkent Ortaokulu Kampüsü · Mekânsal Ekosistem Takibi ve Bitki Envanteri
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14241B] mt-1">
            🗺️ Yıldızkent Ortaokulu Bahçesi Bitki Haritası
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingMode(!isAddingMode)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap self-start ${
            isAddingMode
              ? 'bg-amber-700 text-white'
              : 'bg-emerald-700 text-white hover:bg-emerald-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          {isAddingMode
            ? 'Ekleme Modunu Kapat'
            : '+ Yıldızkent Krokisine Yeni Bitki Ekle'}
        </button>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl px-5 py-3.5 border border-emerald-900/10 text-xs">
        <div className="flex flex-wrap items-center gap-5 font-medium text-slate-800">
          <span className="font-bold text-[#14241B]">Yıldızkent Bahçe Durum Göstergesi:</span>
          <span>🟢 Sağlıklı (80–100 Puan)</span>
          <span>🟡 Takip edilmeli (60–79 Puan)</span>
          <span>🔴 İncelenmeli (0–59 Puan)</span>
        </div>
        <span className="text-slate-500">
          Fotoğraf geçmişi, öneriler ve gelişim grafiği için krokideki bitki noktasına dokunun.
        </span>
      </div>

      {/* Map Blueprint + Selected Plant Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Yıldızkent Ortaokulu SVG Blueprint */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-emerald-900/15 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold text-[#14241B]">
              🏫 Yıldızkent Ortaokulu Yerleşim ve Gözlem Krokisi
            </span>
            {isAddingMode && (
              <span className="text-amber-800 font-semibold">
                Yeni bitki konumunu seçmek için kroki üzerine dokunun (X:%{draftCoords.x}, Y:%{draftCoords.y})
              </span>
            )}
          </div>

          <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden border border-emerald-900/20 bg-[#EBF3E9]">
            <svg
              viewBox="0 0 800 550"
              onClick={handleSvgClick}
              className={`w-full h-full ${
                isAddingMode ? 'cursor-crosshair' : 'cursor-default'
              }`}
              role="img"
              aria-label="Yıldızkent Ortaokulu bahçesi bitki haritası krokisi"
            >
              {/* Grass & Grid Texture */}
              <rect width="800" height="550" fill="#E9F2E6" />
              <g stroke="#D5E5D0" strokeWidth="1">
                {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                  <line key={x} x1={x} y1={0} x2={x} y2={550} />
                ))}
                {[100, 200, 300, 400, 500].map((y) => (
                  <line key={y} x1={0} y1={y} x2={800} y2={y} />
                ))}
              </g>

              {/* Zone 5: Kütüphane & Bilişim Kanadı Kuzeybatı Koridoru */}
              <rect
                x="35"
                y="165"
                width="245"
                height="130"
                rx="16"
                fill="#DDF0D5"
                stroke="#86B97A"
                strokeWidth="2"
              />
              <text
                x="157"
                y="200"
                textAnchor="middle"
                className="fill-emerald-950 text-[12px] font-bold"
              >
                Kütüphane & Bilişim Bahçesi
              </text>
              <text
                x="157"
                y="218"
                textAnchor="middle"
                className="fill-emerald-900 text-[10px]"
              >
                (Ihlamur & Biberiye Parseli)
              </text>

              {/* Zone 1: Yıldızkent Ana Giriş & Atatürk Köşesi Bahçesi */}
              <rect
                x="35"
                y="315"
                width="255"
                height="195"
                rx="18"
                fill="#D4E8CE"
                stroke="#9EC594"
                strokeWidth="2"
              />
              <text
                x="162"
                y="475"
                textAnchor="middle"
                className="fill-emerald-950 text-[12px] font-bold"
              >
                Yıldızkent Ana Giriş & Atatürk Köşesi
              </text>
              <text
                x="162"
                y="493"
                textAnchor="middle"
                className="fill-emerald-900 text-[10px]"
              >
                (Zeytin & Anadolu Karaçamı Alanı)
              </text>

              {/* Zone 2: A Blok Fen Laboratuvarı Önü Gül Tarhı */}
              <rect
                x="315"
                y="170"
                width="215"
                height="105"
                rx="14"
                fill="#DCECD5"
                stroke="#8AB87E"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <text
                x="422"
                y="245"
                textAnchor="middle"
                className="fill-emerald-950 text-[12px] font-bold"
              >
                A Blok Fen Lab. Önü Gül Tarhı
              </text>

              {/* Zone 3: B Blok Ekoloji Köşesi & Uygulama Serası */}
              <rect
                x="555"
                y="50"
                width="210"
                height="185"
                rx="16"
                fill="#CFE8E0"
                stroke="#6BA896"
                strokeWidth="2"
              />
              <text
                x="660"
                y="88"
                textAnchor="middle"
                className="fill-teal-950 text-[12px] font-bold"
              >
                B Blok Ekoloji Köşesi & Sera
              </text>
              <text
                x="660"
                y="105"
                textAnchor="middle"
                className="fill-teal-900 text-[10px]"
              >
                (Tıbbi ve Aromatik Lavanta Alanı)
              </text>

              {/* Main School Building: YILDIZKENT ORTAOKULU A BLOK */}
              <rect
                x="45"
                y="38"
                width="480"
                height="110"
                rx="12"
                fill="#CBD5E1"
                stroke="#475569"
                strokeWidth="2"
              />
              <text
                x="285"
                y="82"
                textAnchor="middle"
                className="fill-slate-900 text-[15px] font-bold"
              >
                YILDIZKENT ORTAOKULU ANA BİNASI (A BLOK)
              </text>
              <text
                x="285"
                y="104"
                textAnchor="middle"
                className="fill-slate-700 text-[11px] font-medium"
              >
                Fen Bilimleri Laboratuvarı · Kütüphane · TÜBİTAK 4006-B Sergi Alanı
              </text>

              {/* Pathways */}
              <path
                d="M 300 148 L 300 525 M 300 295 L 545 295"
                stroke="#E2E8F0"
                strokeWidth="24"
                strokeLinecap="round"
              />

              {/* Zone 4: Çok Amaçlı Spor Sahası Doğu Çınar Koridoru */}
              <rect
                x="545"
                y="265"
                width="220"
                height="245"
                rx="14"
                fill="#E2E8F0"
                stroke="#94A3B8"
                strokeWidth="2"
              />
              <text
                x="655"
                y="345"
                textAnchor="middle"
                className="fill-slate-700 text-[13px] font-bold"
              >
                ÇOK AMAÇLI SPOR SAHASI
              </text>
              <text
                x="655"
                y="365"
                textAnchor="middle"
                className="fill-slate-600 text-[11px]"
              >
                Doğu Çınar & Akçaağaç Koridoru
              </text>

              {/* Plant Markers */}
              {plants.map((plant) => {
                const cx = (plant.mapX / 100) * 800;
                const cy = (plant.mapY / 100) * 550;
                const isSelected = selectedPlant?.id === plant.id;
                const fillHex =
                  plant.status === 'healthy'
                    ? '#059669'
                    : plant.status === 'monitor'
                    ? '#D97706'
                    : '#DC2626';

                return (
                  <g
                    key={plant.id}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelectedPlantId(plant.id);
                    }}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={29}
                        fill={fillHex}
                        fillOpacity={0.24}
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={20}
                      fill={fillHex}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 4 : 2.5}
                    />
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      className="fill-white text-[11px] font-bold font-mono select-none"
                    >
                      {plant.plantNumber}
                    </text>
                    <rect
                      x={cx - 64}
                      y={cy + 24}
                      width={128}
                      height={20}
                      rx={6}
                      fill="#14241B"
                      fillOpacity={0.9}
                    />
                    <text
                      x={cx}
                      y={cy + 38}
                      textAnchor="middle"
                      className="fill-white text-[10px] font-medium select-none"
                    >
                      {plant.plantName.slice(0, 17)} ({plant.latestHealthScore})
                    </text>
                  </g>
                );
              })}

              {/* Draft Marker when adding new plant */}
              {isAddingMode && (
                <g>
                  <circle
                    cx={(draftCoords.x / 100) * 800}
                    cy={(draftCoords.y / 100) * 550}
                    r={22}
                    fill="#0F5338"
                    stroke="#FBBF24"
                    strokeWidth={3}
                    strokeDasharray="4 2"
                  />
                  <text
                    x={(draftCoords.x / 100) * 800}
                    y={(draftCoords.y / 100) * 550 + 4}
                    textAnchor="middle"
                    className="fill-white text-[11px] font-bold font-mono"
                  >
                    YENİ
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right Side: Either New Plant Form OR Selected Plant Inspector (with Photo History, Growth Chart, Recommendations) */}
        <div className="lg:col-span-5 space-y-5">
          {isAddingMode ? (
            <form
              onSubmit={handleCreateMapPlant}
              className="bg-white rounded-2xl p-6 border border-amber-500/40 space-y-4"
            >
              <h2 className="text-lg font-bold text-[#14241B]">
                + Yıldızkent Krokisine Yeni Bitki Ekle (#B-0{plants.length + 1})
              </h2>
              <p className="text-xs text-slate-600">
                Kroki üzerinde seçilen koordinat: X:%{draftCoords.x}, Y:%{draftCoords.y}
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bitki Türü / Adı
                </label>
                <input
                  type="text"
                  required
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Örn: Anadolu Karaçamı, Adaçayı, Süs Elması"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yıldızkent Ortaokulu Bahçe Bölgesi
                </label>
                <select
                  value={draftLocation}
                  onChange={(e) => setDraftLocation(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  {YILDIZKENT_CAMPUS_ZONES.map((z) => (
                    <option key={z.id} value={z.name}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İlk Gözlem Tahmini Sağlık Puanı: {draftScore}/100 (
                  {getStatusLabel(getStatusFromScore(draftScore)).badgeText})
                </label>
                <input
                  type="range"
                  min={20}
                  max={98}
                  value={draftScore}
                  onChange={(e) => setDraftScore(Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Öğrenci Gözlem Notu
                </label>
                <textarea
                  rows={2}
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="Yaprak ve gövde görünümü hakkında ilk gözleminiz..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Bitkiyi Yıldızkent Haritasına Kaydet
              </button>
            </form>
          ) : (
            selectedPlant && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-900/15 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-emerald-900">
                        Bitki No: #{selectedPlant.plantNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Son Analiz: {selectedPlant.lastAnalysisDate}</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#14241B] mt-1">
                      {selectedPlant.plantName}
                    </h2>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{selectedPlant.location}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono tabular-nums text-lg font-bold text-[#14241B]">
                      {selectedPlant.latestHealthScore}/100
                    </span>
                    <span className="block text-xs font-semibold mt-0.5">
                      {getStatusLabel(selectedPlant.status).badgeText}
                    </span>
                  </div>
                </div>

                {/* Weekly Photo History Strip */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-[#14241B]">
                    📸 Haftalık Fotoğraf Geçmişi ve Puan Eğrisi ({selectedPlant.observations.length} Hafta)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPlant.observations.map((obs, idx) => (
                      <div
                        key={obs.id}
                        className="p-1.5 rounded-xl bg-[#F6F8F5] border border-slate-200 space-y-1"
                      >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-200">
                          <ResilientImage
                            src={obs.imageUrl || SAMPLE_GARDEN_PHOTOS[0].imageUrl}
                            alt={`${selectedPlant.plantName} Hafta ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] px-0.5">
                          <span className="font-bold text-slate-700">
                            Hafta {obs.weekNumber || idx + 1}
                          </span>
                          <span className="font-mono font-bold text-emerald-900">
                            {obs.healthScore}p
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest Advisor Report & Smart Recommendations */}
                {latestObs && (
                  <div className="p-3.5 rounded-xl bg-[#F6F8F5] text-xs text-slate-700 space-y-2 border border-emerald-900/10">
                    <p className="font-bold text-[#14241B]">
                      💡 Son Danışman Raporu ve Öneriler:
                    </p>
                    <p className="leading-relaxed">
                      {latestObs.analysis.advisorReport ||
                        latestObs.analysis.similarityStatement}
                    </p>
                    {latestObs.analysis.smartRecommendations && (
                      <div className="pt-1.5 border-t border-slate-200 space-y-1 text-[11px]">
                        <p>
                          <strong>💧 Sulama:</strong>{' '}
                          {latestObs.analysis.smartRecommendations.watering}
                        </p>
                        <p>
                          <strong>✂️ Budama:</strong>{' '}
                          {latestObs.analysis.smartRecommendations.pruning}
                        </p>
                        <p>
                          <strong>☀️ Konum:</strong>{' '}
                          {latestObs.analysis.smartRecommendations.locationChange}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Care Actions Log for this plant */}
                {selectedPlant.careActions && selectedPlant.careActions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-[#14241B]">
                      🗓️ Son Uygulanan Öğrenci Bakım İşlemleri:
                    </p>
                    <div className="space-y-1.5">
                      {selectedPlant.careActions.slice(-2).map((act) => {
                        const meta = getCareActionMeta(act.actionType);
                        return (
                          <div
                            key={act.id}
                            className="px-3 py-2 rounded-lg bg-emerald-50/50 border border-emerald-900/10 text-[11px] flex items-center justify-between gap-2"
                          >
                            <span className="truncate font-medium text-slate-800">
                              <strong>{formatTurkishShortDate(act.date)}:</strong>{' '}
                              {act.actionLabel}
                            </span>
                            <span className="font-semibold text-emerald-900 shrink-0">
                              {meta.shortLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenEncyclopediaForPlant(selectedPlant)}
                    className="min-h-[44px] px-2.5 py-2 rounded-xl border border-emerald-700/30 bg-emerald-50 text-xs font-semibold text-emerald-950 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Ansiklopedi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTimelineForPlant(selectedPlant.id)}
                    className="min-h-[44px] px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Grafik</span>
                  </button>
                  {onOpenCalendarForPlant && (
                    <button
                      type="button"
                      onClick={() => onOpenCalendarForPlant(selectedPlant.id)}
                      className="min-h-[44px] px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Takvim</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onReanalyzePlant(selectedPlant.id)}
                    className="min-h-[44px] px-2.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Analiz</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Yıldızkent Ortaokulu Yerleşim Alanları ve Bitki Türleri Rehberi */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#14241B]">
            🏫 Yıldızkent Ortaokulu Bahçesi Yerleşim Alanları ve Mikroklima Özellikleri
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Okul bahçemizdeki 5 farklı gözlem bölgesinin çevresel koşulları ve temsil edilen bitki türleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {YILDIZKENT_CAMPUS_ZONES.map((zone, idx) => (
            <div
              key={zone.id}
              className="p-4 rounded-xl bg-[#F6F8F5] border border-emerald-900/10 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="font-mono text-[11px] font-bold text-emerald-800">
                  BÖLGE 0{idx + 1}
                </span>
                <h4 className="text-xs font-bold text-[#14241B] leading-snug">
                  {zone.name}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {zone.description}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                <p className="text-slate-700">
                  <strong>İklim:</strong> {zone.microclimate}
                </p>
                <p className="text-emerald-900 font-medium">
                  <strong>Türler:</strong> {zone.typicalSpecies.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete School Garden Plant Directory Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#14241B]">
          Yıldızkent Ortaokulu Bahçesindeki Kayıtlı Bitkiler ({plants.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plants.map((plant) => {
            const statusObj = getStatusLabel(plant.status);
            const isSelected = selectedPlant?.id === plant.id;
            const enc = getPlantEncyclopedia(plant);
            const reminder = getAnalysisReminderStatus(plant.lastAnalysisDate);
            return (
              <div
                key={plant.id}
                onClick={() => setSelectedPlantId(plant.id)}
                className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-emerald-700 ring-2 ring-emerald-700/20'
                    : reminder.isDue
                    ? 'border-amber-500/80'
                    : 'border-emerald-900/10 hover:border-emerald-700/40'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative">
                    <ResilientImage
                      src={plant.latestImageUrl}
                      alt={plant.plantName}
                      className="w-full h-full object-cover"
                    />
                    {reminder.isDue && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-600 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <BellRing className="w-3 h-3" />
                        <span>Analiz Zamanı ({reminder.daysSinceLastAnalysis}g)</span>
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono font-bold text-emerald-900">
                        #{plant.plantNumber}
                      </span>
                      <span
                        className={`font-mono tabular-nums font-semibold ${
                          reminder.isDue ? 'text-amber-700' : 'text-slate-500'
                        }`}
                      >
                        {reminder.isDue
                          ? `🔔 ${reminder.daysSinceLastAnalysis} gün geçti`
                          : plant.lastAnalysisDate}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#14241B] truncate">
                      {plant.plantName}
                    </h4>
                    <p className="text-[11px] italic text-emerald-800 truncate">
                      {plant.scientificName} · {enc.family.split(' ')[0]}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {plant.location}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {statusObj.badgeText}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-[#14241B]">
                      {plant.latestHealthScore}/100
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEncyclopediaForPlant(plant);
                    }}
                    className="w-full min-h-[36px] px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-700/25 text-emerald-950 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Bitki Bilgi Ansiklopedisi</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
