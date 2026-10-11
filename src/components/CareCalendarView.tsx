import React, { useState } from 'react';
import {
  Calendar,
  Droplets,
  Scissors,
  Compass,
  Sprout,
  FlaskConical,
  TrendingUp,
  PlusCircle,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Camera,
} from 'lucide-react';
import { CareActionRecord, CareActionType, GardenPlant } from '../types';
import {
  formatTurkishShortDate,
  getCareActionMeta,
  getStatusFromScore,
  getStatusLabel,
} from '../data/initialGardenData';
import { ResilientImage } from './ResilientImage';

interface CareCalendarViewProps {
  plants: GardenPlant[];
  onAddCareAction: (payload: {
    plantId: string;
    date: string;
    actionType: CareActionType;
    actionLabel: string;
    description: string;
    studentGroup: string;
  }) => void;
  onReanalyzePlant: (plantId: string) => void;
}

const ACTION_TYPE_OPTIONS: {
  type: CareActionType;
  label: string;
  shortLabel: string;
  defaultTitle: string;
  placeholder: string;
}[] = [
  {
    type: 'watering',
    label: '💧 Sulama',
    shortLabel: 'Sulama',
    defaultTitle: 'Düzenli Kök Sulaması Yapıldı',
    placeholder: 'Örn: Sabah saatlerinde kök bölgesine 3 litre dip sulama yapıldı.',
  },
  {
    type: 'pruning',
    label: '✂️ Budama',
    shortLabel: 'Budama',
    defaultTitle: 'Kuruyan / Lekeli Yapraklar Budandı',
    placeholder: 'Örn: Alt dallardaki sararmış ve lekeli 3 yaprak bahçe makasıyla budandı.',
  },
  {
    type: 'location_change',
    label: '☀️ Yer Değiştirme',
    shortLabel: 'Yer Değiştirme',
    defaultTitle: 'Daha Güneşli / Korunaklı Konuma Taşındı',
    placeholder: 'Örn: Bina gölgesinden çıkarılarak doğrudan güneş alan güney cepheye taşındı.',
  },
  {
    type: 'soil_care',
    label: '🌱 Toprak Bakımı',
    shortLabel: 'Toprak Bakımı',
    defaultTitle: 'Toprak Çapalama ve Havalandırma',
    placeholder: 'Örn: Kök çanağı genişletildi, yabancı otlar temizlendi ve toprak havalandırıldı.',
  },
  {
    type: 'nutrient_support',
    label: '🧪 Besin Desteği',
    shortLabel: 'Besin Desteği',
    defaultTitle: 'Organik Kompost ve Mineral Takviyesi',
    placeholder: 'Örn: Okul kompost kutusundan doğal humus toprağa karıştırıldı.',
  },
];

export const CareCalendarView: React.FC<CareCalendarViewProps> = ({
  plants,
  onAddCareAction,
  onReanalyzePlant,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    plants[0]?.id || ''
  );
  const [actionFilter, setActionFilter] = useState<CareActionType | 'all'>(
    'all'
  );
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Care Action Form State
  const [newActionType, setNewActionType] = useState<CareActionType>('watering');
  const [newActionDate, setNewActionDate] = useState<string>('2026-09-26');
  const [newActionDescription, setNewActionDescription] = useState<string>('');
  const [newStudentGroup, setNewStudentGroup] = useState<string>(
    'Yıldızkent 7-A Fen ve Ekoloji Kulübü'
  );

  const activePlant =
    plants.find((p) => p.id === selectedPlantId) || plants[0];

  if (!activePlant) return null;

  const sortedObservations = [...activePlant.observations].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const plantCareActions: CareActionRecord[] = [
    ...(activePlant.careActions || []),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const filteredCareActions =
    actionFilter === 'all'
      ? plantCareActions
      : plantCareActions.filter((a) => a.actionType === actionFilter);

  // Build weekly buckets so each observation week shows its care actions side-by-side with health score progression
  const weeklyRows = sortedObservations.map((obs, idx) => {
    const prevObs = idx > 0 ? sortedObservations[idx - 1] : null;
    const nextObs =
      idx < sortedObservations.length - 1 ? sortedObservations[idx + 1] : null;

    // Actions belonging to this week window
    const weekActions = filteredCareActions.filter((act) => {
      if (idx === 0 && !nextObs) return true;
      if (idx === 0 && nextObs) {
        return act.date < nextObs.date;
      }
      if (prevObs && nextObs) {
        return act.date >= obs.date && act.date < nextObs.date;
      }
      return act.date >= (prevObs ? prevObs.date : obs.date);
    });

    const scoreDelta = prevObs ? obs.healthScore - prevObs.healthScore : 0;

    return {
      weekNumber: obs.weekNumber || idx + 1,
      observation: obs,
      prevScore: prevObs ? prevObs.healthScore : null,
      scoreDelta,
      actions: weekActions,
    };
  });

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    const metaOption =
      ACTION_TYPE_OPTIONS.find((o) => o.type === newActionType) ||
      ACTION_TYPE_OPTIONS[0];
    const formattedDate = formatTurkishShortDate(newActionDate);
    const descText =
      newActionDescription.trim() ||
      `${formattedDate}: ${metaOption.defaultTitle}.`;

    onAddCareAction({
      plantId: activePlant.id,
      date: newActionDate,
      actionType: newActionType,
      actionLabel: metaOption.defaultTitle,
      description: descText.startsWith(formattedDate)
        ? descText
        : `${formattedDate}: ${descText}`,
      studentGroup:
        newStudentGroup.trim() || 'Yıldızkent Fen Gözlem Ekibi',
    });

    setNewActionDescription('');
    setShowAddForm(false);
  };

  const renderActionIcon = (type: CareActionType) => {
    switch (type) {
      case 'watering':
        return <Droplets className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'pruning':
        return <Scissors className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'location_change':
        return <Compass className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'soil_care':
        return <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'nutrient_support':
        return <FlaskConical className="w-4 h-4 text-purple-600 shrink-0" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Yıldızkent Ortaokulu · Bakım Müdahaleleri ve Haftalık Sağlık Gelişimi Senkronizasyonu
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14241B] mt-1">
            🗓️ İnteraktif Bitki Bakım Takvimi ve Gelişim Matrisi
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              showAddForm
                ? 'bg-amber-700 text-white'
                : 'bg-[#0F5338] text-white hover:bg-[#0B3F2A]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {showAddForm
              ? 'Formu Kapat'
              : '+ Takvime Bakım Eylemi Ekle'}
          </button>

          <button
            type="button"
            onClick={() => onReanalyzePlant(activePlant.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-emerald-800/20 bg-white text-[#14241B] text-xs font-semibold hover:bg-emerald-50 transition-colors whitespace-nowrap"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            Haftalık Fotoğraf Yükle
          </button>
        </div>
      </div>

      {/* Plant Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {plants.map((plant) => {
          const isSelected = plant.id === activePlant.id;
          return (
            <button
              key={plant.id}
              type="button"
              onClick={() => setSelectedPlantId(plant.id)}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#14241B] text-white border-[#14241B]'
                  : 'bg-white text-slate-700 border-emerald-900/15 hover:bg-emerald-50/60'
              }`}
            >
              <span className="font-mono">#{plant.plantNumber}</span>
              <span>{plant.plantName}</span>
              <span className="font-mono tabular-nums opacity-80">
                (🌱 {plant.latestHealthScore}/100)
              </span>
            </button>
          );
        })}
      </div>

      {/* Add New Care Action Interactive Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateAction}
          className="bg-white rounded-2xl p-6 border-2 border-emerald-700/30 space-y-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#14241B]">
                #{activePlant.plantNumber} {activePlant.plantName} İçin Yeni Bakım İşlemi Kaydet
              </h2>
              <p className="text-xs text-slate-600">
                Konum: {activePlant.location} · Yaptığınız sulama, budama veya yer değiştirme işlemini takvime işleyin.
              </p>
            </div>
          </div>

          {/* Action Type Selector Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Uygulanan Bakım Eylemi Türü
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {ACTION_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setNewActionType(opt.type)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    newActionType === opt.type
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-[#F6F8F5] text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Uygulama Tarihi
              </label>
              <input
                type="date"
                required
                value={newActionDate}
                onChange={(e) => setNewActionDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Yıldızkent Ortaokulu Öğrenci Araştırma Grubu
              </label>
              <input
                type="text"
                required
                value={newStudentGroup}
                onChange={(e) => setNewStudentGroup(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Yapılan Bakım İşlemi Açıklaması
            </label>
            <input
              type="text"
              value={newActionDescription}
              onChange={(e) => setNewActionDescription(e.target.value)}
              placeholder={
                ACTION_TYPE_OPTIONS.find((o) => o.type === newActionType)
                  ?.placeholder
              }
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              İptal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
            >
              <Check className="w-4 h-4" />
              Bakım Takvimine Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Action Category Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-900/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#14241B]">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span>Bakım Eylemi Filtresi:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActionFilter('all')}
            className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors ${
              actionFilter === 'all'
                ? 'bg-[#14241B] text-white'
                : 'bg-[#F6F8F5] text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            Tümü ({plantCareActions.length})
          </button>
          {ACTION_TYPE_OPTIONS.map((opt) => {
            const count = plantCareActions.filter(
              (a) => a.actionType === opt.type
            ).length;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setActionFilter(opt.type)}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors ${
                  actionFilter === opt.type
                    ? 'bg-emerald-800 text-white'
                    : 'bg-[#F6F8F5] text-slate-700 hover:bg-emerald-50'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* SIDE-BY-SIDE CARE CALENDAR & WEEKLY HEALTH PROGRESSION MATRIX */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[#14241B]">
            📊 Haftalık Bakım Eylemleri ve Sağlık Puanı Gelişimi (Yan Yana Görünüm)
          </h2>
          <span className="text-xs text-slate-600">
            Sol sütunda öğrencilerin yaptığı bakım eylemleri, sağ sütunda o haftaki sağlık puanı etkisi yer alır.
          </span>
        </div>

        {weeklyRows.map((row) => {
          const obs = row.observation;
          const statusObj = getStatusLabel(getStatusFromScore(obs.healthScore));

          return (
            <div
              key={obs.id}
              className="bg-white rounded-2xl border border-emerald-900/15 overflow-hidden"
            >
              {/* Week Top Banner */}
              <div className="bg-[#F6F8F5] px-5 py-3 border-b border-emerald-900/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0F5338] text-white font-mono text-xs font-bold">
                    HAFTA {row.weekNumber}
                  </span>
                  <span className="text-xs font-semibold text-[#14241B]">
                    Gözlem Tarihi: {formatTurkishShortDate(obs.date)} ({obs.date})
                  </span>
                  <span className="text-xs text-slate-500">
                    · {obs.observerGroup}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">
                    {statusObj.badgeText}
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-[#14241B]">
                    Hafta {row.weekNumber}: {obs.healthScore} Puan
                  </span>
                </div>
              </div>

              {/* Side-by-Side Split: Left = Care Actions Calendar | Right = Weekly Health Development */}
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                {/* LEFT COLUMN (7 cols): Student Care Actions ('sulama', 'budama', 'yer değiştirme' vb.) */}
                <div className="lg:col-span-7 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#14241B] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span>
                        Hafta {row.weekNumber} Uygulanan Öğrenci Bakım Eylemleri
                      </span>
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                      {row.actions.length} Eylem Kaydı
                    </span>
                  </div>

                  {row.actions.length > 0 ? (
                    <div className="space-y-3">
                      {row.actions.map((act) => {
                        const meta = getCareActionMeta(act.actionType);
                        return (
                          <div
                            key={act.id}
                            className="p-3.5 rounded-xl bg-[#F6F8F5] border border-slate-200/90 flex items-start gap-3.5"
                          >
                            {/* Date Calendar Badge */}
                            <div className="w-14 shrink-0 rounded-xl bg-white border border-slate-200 p-2 text-center shadow-2xs">
                              <span className="block text-[10px] font-bold uppercase text-emerald-800">
                                {formatTurkishShortDate(act.date).split(' ')[1]}
                              </span>
                              <span className="block text-base font-bold font-mono text-[#14241B]">
                                {formatTurkishShortDate(act.date).split(' ')[0]}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${meta.badgeClass}`}
                                >
                                  {renderActionIcon(act.actionType)}
                                  <span>{meta.shortLabel}</span>
                                </span>
                                <span className="text-xs font-bold text-[#14241B]">
                                  {act.actionLabel}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">
                                {act.description}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Uygulayan Ekip: {act.studentGroup}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#F6F8F5] border border-dashed border-slate-300 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">
                        {obs.performedCareAction ||
                          'Bu hafta için filtreye uygun bakım eylemi kaydı bulunmuyor.'}
                      </p>
                      <p>
                        Üstteki &ldquo;+ Takvime Bakım Eylemi Ekle&rdquo; butonundan sulama, budama veya yer değiştirme kaydı ekleyebilirsiniz.
                      </p>
                    </div>
                  )}

                  {/* AI Smart Recommendations for this week */}
                  {obs.analysis.smartRecommendations && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        💡 Yapay Zekâ Danışmanının Bu Haftaki Tavsiyeleri:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-200/70">
                          <span className="font-bold text-sky-950 block">
                            💧 Sulama:
                          </span>
                          <span className="text-slate-700 text-[11px]">
                            {obs.analysis.smartRecommendations.watering}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/70">
                          <span className="font-bold text-rose-950 block">
                            ✂️ Budama:
                          </span>
                          <span className="text-slate-700 text-[11px]">
                            {obs.analysis.smartRecommendations.pruning}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70">
                          <span className="font-bold text-amber-950 block">
                            ☀️ Konum / Işık:
                          </span>
                          <span className="text-slate-700 text-[11px]">
                            {obs.analysis.smartRecommendations.locationChange}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN (5 cols): Weekly Health Score & Visual Development */}
                <div className="lg:col-span-5 p-5 sm:p-6 bg-[#F6F8F5]/40 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#14241B] flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                        <span>Hafta {row.weekNumber} Sağlık Gelişimi</span>
                      </h3>

                      {/* Delta Indicator */}
                      {row.prevScore !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-xs font-bold ${
                            row.scoreDelta > 0
                              ? 'bg-emerald-100 text-emerald-900'
                              : row.scoreDelta < 0
                              ? 'bg-red-100 text-red-900'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {row.scoreDelta > 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : row.scoreDelta < 0 ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                          {row.prevScore} → {obs.healthScore} (
                          {row.scoreDelta >= 0
                            ? `+${row.scoreDelta}`
                            : row.scoreDelta}{' '}
                          Puan)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-700 font-mono text-xs font-semibold">
                          Başlangıç Ölçümü
                        </span>
                      )}
                    </div>

                    {/* Health Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">
                          Bitki Sağlık Puanı
                        </span>
                        <span className="font-mono font-bold text-[#14241B]">
                          {obs.healthScore}/100
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            obs.healthScore >= 80
                              ? 'bg-emerald-600'
                              : obs.healthScore >= 60
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${obs.healthScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Thumbnail + Advisor Summary */}
                    <div className="grid grid-cols-12 gap-3 items-center pt-1">
                      <div className="col-span-4 aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                        <ResilientImage
                          src={obs.imageUrl}
                          alt={`${obs.plantName} Hafta ${row.weekNumber}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="col-span-8 space-y-1 text-xs">
                        <p className="font-semibold text-[#14241B]">
                          Görsel Durum ve Canlılık:
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          {obs.analysis.advisorReport ||
                            obs.analysis.similarityStatement}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Student Field Note */}
                  <div className="p-3 rounded-xl bg-white border border-emerald-900/10 text-xs text-slate-700">
                    <span className="font-bold text-emerald-950">
                      Öğrenci Gözlem Notu:{' '}
                    </span>
                    {obs.studentNote}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
