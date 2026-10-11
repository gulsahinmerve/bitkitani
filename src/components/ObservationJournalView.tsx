import React, { useState } from 'react';
import {
  BookOpen,
  Edit3,
  Check,
  Camera,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import { GardenPlant, ObservationRecord } from '../types';
import {
  formatTurkishShortDate,
  getStatusFromScore,
  getStatusLabel,
} from '../data/initialGardenData';
import { ResilientImage } from './ResilientImage';

interface ObservationJournalViewProps {
  plants: GardenPlant[];
  onUpdateStudentNote: (observationId: string, newNote: string) => void;
  onReanalyzePlant: (plantId: string) => void;
  onOpenTimelineForPlant: (plantId: string) => void;
  onOpenCalendar?: () => void;
  onOpenEncyclopediaForPlant?: (plant: GardenPlant) => void;
}

export const ObservationJournalView: React.FC<ObservationJournalViewProps> = ({
  plants,
  onUpdateStudentNote,
  onReanalyzePlant,
  onOpenTimelineForPlant,
  onOpenCalendar,
  onOpenEncyclopediaForPlant,
}) => {
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>('all');
  const [editingObsId, setEditingObsId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState<string>('');
  const [expandedObsId, setExpandedObsId] = useState<string | null>(null);

  const allObservations: ObservationRecord[] = plants
    .flatMap((p) => p.observations)
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredObservations =
    selectedPlantFilter === 'all'
      ? allObservations
      : allObservations.filter((obs) => obs.plantId === selectedPlantFilter);

  const startEditing = (obs: ObservationRecord) => {
    setEditingObsId(obs.id);
    setEditNoteText(obs.studentNote);
  };

  const saveEdit = (obsId: string) => {
    onUpdateStudentNote(obsId, editNoteText);
    setEditingObsId(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Yıldızkent Ortaokulu · Öğrenci Saha Çalışması ve Haftalık Veri Kayıt Defteri
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14241B] mt-1">
            📓 Yıldızkent Bitki Gözlem ve Araştırma Günlüğü
          </h1>
        </div>

        {/* Interactive Filter Control */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedPlantFilter('all')}
            className={`px-3 py-2 min-h-[40px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedPlantFilter === 'all'
                ? 'bg-white text-[#14241B] shadow-xs'
                : 'text-slate-600 hover:text-[#14241B]'
            }`}
          >
            Tüm Kayıtlar ({allObservations.length})
          </button>
          {plants.map((plant) => (
            <button
              key={plant.id}
              type="button"
              onClick={() => setSelectedPlantFilter(plant.id)}
              className={`px-3 py-2 min-h-[40px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedPlantFilter === plant.id
                  ? 'bg-white text-[#14241B] shadow-xs'
                  : 'text-slate-600 hover:text-[#14241B]'
              }`}
            >
              #{plant.plantNumber} {plant.plantName}
            </button>
          ))}
        </div>
      </div>

      {/* Observation Records List */}
      <div className="space-y-5">
        {filteredObservations.map((obs) => {
          const statusInfo = getStatusLabel(getStatusFromScore(obs.healthScore));
          const isExpanded = expandedObsId === obs.id;

          return (
            <article
              key={obs.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-900/10 space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Photo */}
                <div className="md:col-span-3 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <ResilientImage
                    src={obs.imageUrl}
                    alt={`${obs.plantName} gözlem fotoğrafı`}
                    className="w-full h-full object-cover"
                  />
                  {obs.weekNumber && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0F5338] text-white font-mono text-[11px] font-bold">
                      Hafta {obs.weekNumber}
                    </span>
                  )}
                </div>

                {/* Metadata & Content */}
                <div className="md:col-span-9 space-y-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-emerald-900">
                          #{obs.plantNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {formatTurkishShortDate(obs.date)} ({obs.date})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{obs.location}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-emerald-800">
                          {obs.observerGroup}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-[#14241B] mt-1">
                        {obs.plantName}{' '}
                        <span className="text-sm font-normal italic text-slate-500">
                          ({obs.scientificName})
                        </span>
                      </h2>
                    </div>

                    <div className="text-right">
                      <span className="font-mono tabular-nums text-base font-bold text-[#14241B]">
                        🌱 Sağlık Puanı: {obs.healthScore}/100
                      </span>
                      <span className="block text-xs font-semibold text-slate-700 mt-0.5">
                        {statusInfo.badgeText}
                      </span>
                    </div>
                  </div>

                  {/* AI Advisor & Analysis Summary */}
                  <div className="p-3.5 rounded-xl bg-[#F6F8F5] border border-emerald-900/10 text-xs text-slate-800 space-y-1.5">
                    <p className="font-semibold text-emerald-950">
                      🤖 Yapay Zekâ Bakım Danışmanı Özeti:
                    </p>
                    <p className="leading-relaxed">
                      {obs.analysis.advisorReport ||
                        obs.analysis.similarityStatement}
                    </p>
                    {obs.performedCareAction && (
                      <p className="text-emerald-900 font-medium pt-1 border-t border-slate-200/80">
                        <strong>Uygulanan Bakım:</strong> {obs.performedCareAction}
                      </p>
                    )}
                  </div>

                  {/* Student Note Box (Editable) */}
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-900/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Yıldızkent Öğrenci Gözlem Notu
                      </span>
                      {editingObsId !== obs.id && (
                        <button
                          type="button"
                          onClick={() => startEditing(obs)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 min-h-[36px] px-2"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Notu Düzenle
                        </button>
                      )}
                    </div>

                    {editingObsId === obs.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-amber-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingObsId(null)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            İptal
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(obs.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Kaydet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-800 leading-relaxed">
                        {obs.studentNote}
                      </p>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedObsId(isExpanded ? null : obs.id)
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 min-h-[40px]"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Detaylı Fen Bilimleri ve Bakım Raporunu Gizle
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Detaylı Fen Bilimleri ve Bakım Raporunu Göster
                        </>
                      )}
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenEncyclopediaForPlant && (
                        <button
                          type="button"
                          onClick={() => {
                            const found = plants.find(
                              (p) => p.id === obs.plantId
                            );
                            if (found) onOpenEncyclopediaForPlant(found);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-emerald-700/25 bg-emerald-50 text-xs font-semibold text-emerald-950 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                          Bitki Ansiklopedisi
                        </button>
                      )}
                      {onOpenCalendar && (
                        <button
                          type="button"
                          onClick={onOpenCalendar}
                          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
                        >
                          <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                          Bakım Takvimi
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenTimelineForPlant(obs.plantId)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                        Zaman Grafiği
                      </button>
                      <button
                        type="button"
                        onClick={() => onReanalyzePlant(obs.plantId)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors whitespace-nowrap"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Tekrar Analiz Et
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Full Scientific Details */}
              {isExpanded && (
                <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#14241B]">
                      🔍 Görsel Bulgular & Yaprak Analizi
                    </h4>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {obs.analysis.visualFindings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#14241B]">
                      💡 Öğrenci Bakım Önerileri
                    </h4>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {obs.analysis.careRecommendations.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#14241B]">
                      🧪 Fen Bilimleri Bağlantısı
                    </h4>
                    <p className="text-slate-700">
                      <strong>Fotosentez:</strong>{' '}
                      {obs.analysis.scienceConnections.photosynthesis}
                    </p>
                    <p className="text-slate-700">
                      <strong>Su ve Mineral Taşınması:</strong>{' '}
                      {obs.analysis.scienceConnections.waterAndMineralTransport}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
