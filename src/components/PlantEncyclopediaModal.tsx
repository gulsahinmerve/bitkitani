import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Sprout,
  Sun,
  MapPin,
  Sparkles,
  CheckCircle2,
  Camera,
  TrendingUp,
  Search,
  FlaskConical,
} from 'lucide-react';
import { GardenPlant } from '../types';
import {
  getPlantEncyclopedia,
  getStatusLabel,
} from '../data/initialGardenData';
import { ResilientImage } from './ResilientImage';

interface PlantEncyclopediaModalProps {
  plant: GardenPlant | null;
  onClose: () => void;
  onReanalyzePlant?: (plantId: string) => void;
  onOpenTimelineForPlant?: (plantId: string) => void;
}

export const PlantEncyclopediaModal: React.FC<PlantEncyclopediaModalProps> = ({
  plant,
  onClose,
  onReanalyzePlant,
  onOpenTimelineForPlant,
}) => {
  if (!plant) return null;

  const enc = getPlantEncyclopedia(plant);
  const statusInfo = getStatusLabel(plant.status);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${plant.plantName} Bitki Bilgi Ansiklopedisi`}
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-emerald-900/20 shadow-2xl">
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-10 bg-[#0F5338] text-white px-5 py-4 sm:px-7 sm:py-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-200 font-semibold">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>YILDIZKENT ORTAOKULU BİTKİ BİLGİ ANSİKLOPEDİSİ</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">#{plant.plantNumber}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {plant.plantName}{' '}
              <span className="text-sm sm:text-base font-normal italic text-emerald-200">
                ({plant.scientificName})
              </span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Ansiklopedi penceresini kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Hero Row: Image + Quick Botanical Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div className="sm:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-emerald-900/15 relative">
              <ResilientImage
                src={plant.latestImageUrl}
                alt={plant.plantName}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#14241B]/90 text-white text-xs font-mono font-bold">
                🌱 Puan: {plant.latestHealthScore}/100 ({statusInfo.dot})
              </span>
            </div>

            <div className="sm:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-800/20 text-xs font-semibold text-emerald-950">
                <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                <span>Botanik Ailesi: {enc.family}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {enc.generalInfo}
              </p>

              <div className="pt-1 space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    <strong className="text-[#14241B]">Okul Bahçesi Konumu:</strong>{' '}
                    {plant.location}
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong className="text-[#14241B]">Doğal Yayılış & Habitat:</strong>{' '}
                    {enc.originAndHabitat}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Botanik Özellikler Tablosu */}
          <div className="bg-[#F6F8F5] rounded-2xl p-5 border border-emerald-900/10 space-y-3.5">
            <h3 className="text-sm sm:text-base font-bold text-[#14241B] flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-700" />
              <span>🌿 Temel Botanik Özellikler</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
                <span className="font-bold text-emerald-900 block">
                  🍃 Yaprak Yapısı ve Dizilişi
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {enc.botanicalTraits.leafType}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
                <span className="font-bold text-emerald-900 block">
                  🪵 Gövde ve Kök Sistemi
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {enc.botanicalTraits.stemAndRoot}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
                <span className="font-bold text-emerald-900 block">
                  🌸 Çiçeklenme Dönemi & Boylanma
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {enc.botanicalTraits.floweringSeason} · Boy: {enc.botanicalTraits.maxHeight}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
                <span className="font-bold text-emerald-900 block">
                  ☀️ İdeal Işık ve Toprak İsteği
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {enc.botanicalTraits.sunAndSoil}
                </p>
              </div>
            </div>
          </div>

          {/* Yıldızkent Ortaokulu Bahçesine Özgü Bakım İpuçları */}
          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-700/25 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-[#14241B] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>🏫 Yıldızkent Ortaokulu Bahçesine Özgü Bakım İpuçları</span>
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800">
              {enc.yildizkentCareTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fen Bilimleri Biliyor muydunuz? */}
          <div className="bg-amber-50/80 rounded-2xl p-4 sm:p-5 border border-amber-700/25 flex items-start gap-3.5 text-xs sm:text-sm">
            <FlaskConical className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950">
                🧪 Fen Bilimleri Köşesi: Biliyor muydunuz?
              </p>
              <p className="text-slate-800 leading-relaxed">
                {enc.scienceDidYouKnow}
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Pencereyi Kapat
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenTimelineForPlant && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTimelineForPlant(plant.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl border border-emerald-800/25 bg-white text-xs font-semibold text-[#14241B] hover:bg-emerald-50"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  Haftalık Gelişim Grafiği
                </button>
              )}
              {onReanalyzePlant && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReanalyzePlant(plant.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0F5338] text-white text-xs font-semibold hover:bg-[#0B3F2A]"
                >
                  <Camera className="w-4 h-4" />
                  Bu Bitkiyi Analiz Et
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlantEncyclopediaViewProps {
  plants: GardenPlant[];
  onSelectPlantModal: (plant: GardenPlant) => void;
  onReanalyzePlant: (plantId: string) => void;
  onOpenTimelineForPlant: (plantId: string) => void;
}

export const PlantEncyclopediaView: React.FC<PlantEncyclopediaViewProps> = ({
  plants,
  onSelectPlantModal,
  onReanalyzePlant,
  onOpenTimelineForPlant,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPlants = plants.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const enc = getPlantEncyclopedia(p);
    return (
      p.plantName.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      enc.family.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Yıldızkent Ortaokulu Kampüs Florası · Botanik Özellikler ve Bahçeye Özgü Bakım Rehberi
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14241B] mt-1">
            📚 Yıldızkent Ortaokulu Bitki Bilgi Ansiklopedisi
          </h1>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bitki adı, aile veya konum ara..."
            className="w-full min-h-[42px] pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Encyclopedia Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlants.map((plant) => {
          const enc = getPlantEncyclopedia(plant);
          const statusInfo = getStatusLabel(plant.status);

          return (
            <article
              key={plant.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-900/15 flex flex-col justify-between space-y-5 hover:border-emerald-700/50 transition-all"
            >
              <div className="space-y-4">
                {/* Top Identity Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                    <ResilientImage
                      src={plant.latestImageUrl}
                      alt={plant.plantName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#14241B]/85 text-white font-mono text-[11px] font-bold">
                      #{plant.plantNumber}
                    </span>
                  </div>

                  <div className="sm:col-span-8 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-800/15 text-[11px] font-semibold">
                        {enc.family}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#14241B]">
                        🌱 {plant.latestHealthScore}/100 ({statusInfo.dot})
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-[#14241B]">
                      {plant.plantName}
                    </h2>
                    <p className="text-xs italic text-slate-500">
                      Bilimsel Adı: {plant.scientificName}
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{plant.location}</span>
                    </p>
                  </div>
                </div>

                {/* General Botanical Description */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {enc.generalInfo}
                </p>

                {/* Compact Botanical Traits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-[#F6F8F5] p-3.5 rounded-xl border border-slate-200/80">
                  <div>
                    <strong className="text-emerald-950 block">🍃 Yaprak Özellikleri:</strong>
                    <span className="text-slate-700">{enc.botanicalTraits.leafType}</span>
                  </div>
                  <div>
                    <strong className="text-emerald-950 block">☀️ Işık ve Toprak:</strong>
                    <span className="text-slate-700">{enc.botanicalTraits.sunAndSoil}</span>
                  </div>
                </div>

                {/* Yıldızkent Ortaokulu Specific Care Tips */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-800/15 space-y-1.5">
                  <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Yıldızkent Ortaokulu Bahçesine Özgü Bakım İpuçları:</span>
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                    {enc.yildizkentCareTips.map((tip, i) => (
                      <li key={i} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectPlantModal(plant)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-[#0F5338] text-white text-xs font-semibold hover:bg-[#0B3F2A] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Tam Ansiklopedi Kartını Aç
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenTimelineForPlant(plant.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                    Gelişim
                  </button>
                  <button
                    type="button"
                    onClick={() => onReanalyzePlant(plant.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl border border-emerald-700/30 bg-emerald-50 text-xs font-semibold text-emerald-950 hover:bg-emerald-100"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-800" />
                    Analiz
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
