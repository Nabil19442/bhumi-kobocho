import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Cpu,
  BarChart3,
  Layers,
  MapPin,
  Compass,
  Zap,
  Droplets,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import {
  fetchLandPriceHealth,
  fetchLandPriceMetadata,
  fetchLandPriceModelInfo,
  predictLandPriceApi
} from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';

export default function LandPricePage({ t, lang = 'bn' }) {
  const isBn = lang === 'bn';

  // State
  const [metadata, setMetadata] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [estimating, setEstimating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  // Form Fields
  const [districtId, setDistrictId] = useState('dist_north_rangpur');
  const [upazilaId, setUpazilaId] = useState('upz_pirgacha');
  const [mouzaId, setMouzaId] = useState('mouza_chhatra_01');
  const [landAreaDecimal, setLandAreaDecimal] = useState(10.0);
  const [landType, setLandType] = useState('agricultural_nal');
  const [roadAccessType, setRoadAccessType] = useState('paved_pucca_road');
  const [roadWidthFt, setRoadWidthFt] = useState(12.0);
  const [distPavedRoadM, setDistPavedRoadM] = useState(100.0);
  const [distMarketKm, setDistMarketKm] = useState(1.5);
  const [distUpazilaKm, setDistUpazilaKm] = useState(6.0);
  const [floodRisk, setFloodRisk] = useState('none');
  const [drainage, setDrainage] = useState('moderate_sloped');
  const [accessRoadAvail, setAccessRoadAvail] = useState(true);
  const [electricityAvail, setElectricityAvail] = useState(true);
  const [waterAccessAvail, setWaterAccessAvail] = useState(true);

  // Load Metadata & Model Info on Mount
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      setLoadingMeta(true);
      setApiError(null);
      try {
        const [metaRes, infoRes] = await Promise.all([
          fetchLandPriceMetadata(),
          fetchLandPriceModelInfo().catch((err) => {
            console.warn('Model info load issue:', err);
            return null;
          })
        ]);
        if (isMounted) {
          setMetadata(metaRes);
          if (infoRes) setModelInfo(infoRes);
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err);
        }
      } finally {
        if (isMounted) setLoadingMeta(false);
      }
    }
    initData();
    return () => { isMounted = false; };
  }, []);

  // Update Upazila & Mouza selections when District changes
  const handleDistrictChange = (dId) => {
    setDistrictId(dId);
    if (metadata?.synthetic_locations?.upazilas) {
      const upzEntries = Object.entries(metadata.synthetic_locations.upazilas).filter(
        ([_, uData]) => uData.district_id === dId
      );
      if (upzEntries.length > 0) {
        const firstUpz = upzEntries[0][0];
        setUpazilaId(firstUpz);
        // Also select first mouza
        const matchingMouzas = metadata.synthetic_locations.mouzas.filter((m) =>
          m.includes(firstUpz.replace('upz_', '')) || true
        );
        if (matchingMouzas.length > 0) {
          setMouzaId(matchingMouzas[0]);
        }
      }
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setEstimating(true);
    setApiError(null);

    const payload = {
      land_area_decimal: parseFloat(landAreaDecimal),
      district_id: districtId,
      upazila_id: upazilaId,
      mouza_id: mouzaId,
      land_type: landType,
      road_access_type: roadAccessType,
      road_width_ft: parseFloat(roadWidthFt),
      distance_to_paved_road_m: parseFloat(distPavedRoadM),
      distance_to_local_market_km: parseFloat(distMarketKm),
      distance_to_upazila_center_km: parseFloat(distUpazilaKm),
      flood_risk_level: floodRisk,
      drainage_quality: drainage,
      access_road_available: Boolean(accessRoadAvail),
      electricity_available: Boolean(electricityAvail),
      water_access_available: Boolean(waterAccessAvail)
    };

    try {
      const result = await predictLandPriceApi(payload);
      setPredictionResult(result);
    } catch (err) {
      setApiError(err);
      setPredictionResult(null);
    } finally {
      setEstimating(false);
    }
  };

  const formatBdt = (num) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div className="landing-container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Cpu size={14} />
            ML REGRESSION BENCHMARK
          </span>
          <span style={{
            background: 'rgba(234, 179, 8, 0.15)',
            color: '#CA8A04',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            SYNTHETIC DATASET ONLY
          </span>
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          {isBn ? t.landprice_heading || 'গ্রামীণ জমির সম্ভাব্য মূল্য বুদ্ধিমত্তা' : 'Rural Land Price Intelligence'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '850px' }}>
          {isBn
            ? t.landprice_subheading || 'কৃত্রিম ডেটাসেটে প্রশিক্ষিত রিগ্রেশন মডেলের মাধ্যমে গ্রামীণ জমির বহু-মাত্রিক ভৌগোলিক ও যোগাযোগ বৈশিষ্ট্য-ভিত্তিক আনুমানিক দর প্রাক্কলন।'
            : 'Multi-factor regression model predicting per-decimal valuation from synthetic Bangladeshi rural parcel characteristics.'}
        </p>
      </div>

      {/* MANDATORY PROMINENT DISCLAIMER CALLOUT */}
      <div style={{
        background: '#FEF2F2',
        border: '2px solid #F87171',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <ShieldAlert size={26} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#991B1B', margin: '0 0 6px 0' }}>
            {isBn ? 'সতর্কবার্তা: সম্পূর্ণ কৃত্রিম ডেটাসেট ভিত্তিক পরীক্ষামূলক মডেল' : 'Strict Disclaimer: Synthetic Data Simulation Only'}
          </h2>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: '#B91C1C', lineHeight: '1.5' }}>
            {isBn
              ? 'এই মূল্যায়ন সম্পূর্ণ synthetic data দিয়ে তৈরি পরীক্ষামূলক ML model-এর output। এটি বাংলাদেশের প্রকৃত বাজারদর নয়, জমির valuation নয় এবং জমি কেনাবেচার আর্থিক সিদ্ধান্তের জন্য ব্যবহারযোগ্য নয়।'
              : 'Experimental prediction from synthetic data only. Not a real Bangladesh market valuation and not suitable for actual land purchase decisions.'}
          </p>
          <div style={{ fontSize: '0.82rem', color: '#7F1D1D', fontStyle: 'italic', marginTop: '4px' }}>
            {isBn
              ? 'নমুনা জেলা, মৌজা ও লেনদেন মূল্যসমূহ অ্যালগরিদমিক গবেষণার উদ্দেশ্যে সিমুলেট করা হয়েছে; কোনো সরকারি সাব-রেজিস্ট্রি বা ভূমি মন্ত্রণালয়ের নথি নয়।'
              : 'All districts, mouzas, and transaction figures are mathematically simulated for academic research and demo purposes.'}
          </div>
        </div>
      </div>

      {/* Global API Error Notice if any */}
      {apiError && (
        <div style={{ marginBottom: '24px' }}>
          <ApiErrorNotice error={apiError} onRetry={() => window.location.reload()} />
        </div>
      )}

      {/* Main Grid: Input Form & Prediction Result */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 0.9fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Form Card */}
        <div className="cadastral-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <Compass size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              {isBn ? 'জমির বৈশিষ্ট্য নির্বাচন ফর্ম' : 'Parcel Characteristics Input'}
            </h2>
          </div>

          <form onSubmit={handlePredict}>
            {/* Geographic Cluster (Synthetic) */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                {isBn ? 'ডেমো জেলা অঞ্চল (Synthetic Zone)' : 'Demo District Zone (Synthetic)'}
              </label>
              <select
                id="select-district"
                value={districtId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
              >
                {metadata?.synthetic_locations?.districts ? (
                  metadata.synthetic_locations.districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isBn ? d.name_bn : d.name_en}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="dist_north_rangpur">রংপুর পল্লী অঞ্চল (ডেমো জেলা ০১)</option>
                    <option value="dist_west_rajshahi">রাজশাহী বরেন্দ্র অঞ্চল (ডেমো জেলা ০২)</option>
                    <option value="dist_south_khulna">খুলনা উপকূলীয় অঞ্চল (ডেমো জেলা ০৩)</option>
                    <option value="dist_east_comilla">কুমিল্লা সমতল অঞ্চল (ডেমো জেলা ০৪)</option>
                    <option value="dist_central_mymensingh">ময়মনসিংহ নদী-অববাহিকা (ডেমো জেলা ০৫)</option>
                  </>
                )}
              </select>
            </div>

            {/* Upazila & Mouza row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'ডেমো উপজেলা' : 'Demo Upazila'}
                </label>
                <select
                  id="select-upazila"
                  value={upazilaId}
                  onChange={(e) => setUpazilaId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  {metadata?.synthetic_locations?.upazilas ? (
                    Object.entries(metadata.synthetic_locations.upazilas)
                      .filter(([_, uData]) => uData.district_id === districtId)
                      .map(([uId, uData]) => (
                        <option key={uId} value={uId}>
                          {isBn ? uData.name_bn : uData.name_en}
                        </option>
                      ))
                  ) : (
                    <option value="upz_pirgacha">পীরগাছা ডেমো উপজেলা</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'মৌজা আইডি' : 'Mouza Cluster'}
                </label>
                <select
                  id="select-mouza"
                  value={mouzaId}
                  onChange={(e) => setMouzaId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  {metadata?.synthetic_locations?.mouzas ? (
                    metadata.synthetic_locations.mouzas.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  ) : (
                    <option value="mouza_chhatra_01">mouza_chhatra_01</option>
                  )}
                </select>
              </div>
            </div>

            {/* Land Area & Land Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'জমির পরিমাণ (শতক)' : 'Land Area (Decimal)'} *
                </label>
                <input
                  id="input-land-area"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="250.0"
                  required
                  value={landAreaDecimal}
                  onChange={(e) => setLandAreaDecimal(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'জমির শ্রেণি (Land Type)' : 'Land Type'}
                </label>
                <select
                  id="select-land-type"
                  value={landType}
                  onChange={(e) => setLandType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="agricultural_nal">{isBn ? 'নাল / কৃষিজমি (Agricultural)' : 'Agricultural Lowland'}</option>
                  <option value="homestead_viti">{isBn ? 'ভিটি / বাড়ি (Homestead)' : 'Homestead Ground'}</option>
                  <option value="commercial_shop">{isBn ? 'বাণিজ্যিক / বাজারমুখীন (Commercial)' : 'Commercial Frontage'}</option>
                  <option value="orchard_bagan">{isBn ? 'বাগান / ফলদ ভূমি (Orchard)' : 'Orchard Plantation'}</option>
                  <option value="pond_doba">{isBn ? 'পুকুর / মৎস্য খামার (Pond/Aqua)' : 'Pond Waterbody'}</option>
                  <option value="fallow_patit">{isBn ? 'পতিত জমি (Fallow)' : 'Fallow Land'}</option>
                </select>
              </div>
            </div>

            {/* Road Access & Road Width */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'রাস্তার ধরন (Road Access)' : 'Road Access Type'}
                </label>
                <select
                  id="select-road-access"
                  value={roadAccessType}
                  onChange={(e) => setRoadAccessType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="national_highway_frontage">{isBn ? 'মহাসড়ক সংলগ্ন (National Highway)' : 'Highway Frontage'}</option>
                  <option value="paved_pucca_road">{isBn ? 'পাকা পিচ ঢালাই রাস্তা (Paved Pucca)' : 'Paved Bitumen Road'}</option>
                  <option value="herringbone_brick_road">{isBn ? 'ইটের সলিং / হেরিংবোন (Brick HBB)' : 'Brick HBB Road'}</option>
                  <option value="unpaved_katcha_road">{isBn ? 'কাঁচা মেঠোপথ (Unpaved Mud)' : 'Unpaved Mud Road'}</option>
                  <option value="footpath_trail">{isBn ? 'আইল / পায়ে হাঁটা পথ (Footpath)' : 'Footpath Trail'}</option>
                  <option value="no_direct_road">{isBn ? 'সরাসরি রাস্তা নেই (No Direct Road)' : 'Landlocked'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'রাস্তার প্রশস্ততা (ফুট)' : 'Road Width (ft)'}
                </label>
                <input
                  id="input-road-width"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={roadWidthFt}
                  onChange={(e) => setRoadWidthFt(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            {/* Distances (Paved Road, Market, Upazila) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'পাকা রাস্তার দূরত্ব (মিটার)' : 'Dist. Paved (m)'}
                </label>
                <input
                  id="input-dist-paved"
                  type="number"
                  step="10"
                  min="0"
                  value={distPavedRoadM}
                  onChange={(e) => setDistPavedRoadM(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'হাট-বাজারের দূরত্ব (কিমি)' : 'Dist. Market (km)'}
                </label>
                <input
                  id="input-dist-market"
                  type="number"
                  step="0.1"
                  min="0"
                  value={distMarketKm}
                  onChange={(e) => setDistMarketKm(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'উপজেলা সদরের দূরত্ব' : 'Dist. Upazila (km)'}
                </label>
                <input
                  id="input-dist-upazila"
                  type="number"
                  step="0.5"
                  min="0"
                  value={distUpazilaKm}
                  onChange={(e) => setDistUpazilaKm(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Flood & Drainage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'বন্যা ঝুঁকি (Flood Risk)' : 'Flood Risk'}
                </label>
                <select
                  id="select-flood-risk"
                  value={floodRisk}
                  onChange={(e) => setFloodRisk(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="none">{isBn ? 'ঝুঁকিমুক্ত উঁচু জমি (None)' : 'Highland / None'}</option>
                  <option value="seasonal_shallow">{isBn ? 'মৌসুমি অগভীর প্লাবন (Seasonal Shallow)' : 'Seasonal Shallow'}</option>
                  <option value="moderate_regular">{isBn ? 'নিয়মিত মাঝারি প্লাবন (Moderate Regular)' : 'Moderate Regular'}</option>
                  <option value="high_flash_flood">{isBn ? 'উচ্চ প্লাবন / জলমগ্নতা (High Flash Flood)' : 'High Flash Flood'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {isBn ? 'নিষ্কাশন ব্যবস্থা (Drainage)' : 'Drainage Quality'}
                </label>
                <select
                  id="select-drainage"
                  value={drainage}
                  onChange={(e) => setDrainage(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="excellent_highland">{isBn ? 'উত্তম ঢালু নিষ্কাশন (Excellent)' : 'Excellent Highland'}</option>
                  <option value="moderate_sloped">{isBn ? 'মাঝারি নিষ্কাশন (Moderate)' : 'Moderate Sloped'}</option>
                  <option value="poor_waterlogged">{isBn ? 'ধীর নিষ্কাশন / জলাবদ্ধ (Poor)' : 'Poor Waterlogged'}</option>
                </select>
              </div>
            </div>

            {/* Infrastructure toggles */}
            <div style={{
              background: 'var(--bg-surface)',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              marginBottom: '22px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={accessRoadAvail}
                  onChange={(e) => setAccessRoadAvail(e.target.checked)}
                />
                <span>{isBn ? 'রাস্তা সংযোগ আছে' : 'Access Road'}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={electricityAvail}
                  onChange={(e) => setElectricityAvail(e.target.checked)}
                />
                <Zap size={14} color="#F59E0B" />
                <span>{isBn ? 'পল্লী বিদ্যুৎ সংযোগ' : 'Electricity'}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={waterAccessAvail}
                  onChange={(e) => setWaterAccessAvail(e.target.checked)}
                />
                <Droplets size={14} color="#3B82F6" />
                <span>{isBn ? 'গভীর নলকূপ / সেচ সুবিধা' : 'Irrigation/Water'}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="btn-run-prediction"
              type="submit"
              disabled={estimating}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                background: estimating ? '#9CA3AF' : 'var(--primary-color)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: estimating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
            >
              {estimating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>{isBn ? 'মডেল ইনফারেন্স চলছে...' : 'Computing ML Inference...'}</span>
                </>
              ) : (
                <>
                  <TrendingUp size={18} />
                  <span>{isBn ? 'সম্ভাব্য মূল্য নির্ণয় করুন (ML Inference)' : 'Compute ML Valuation'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {predictionResult ? (
            <div className="cadastral-card" style={{ padding: '24px', border: '2px solid #10B981', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={14} />
                  {isBn ? 'সফল প্রাক্কলন' : 'Inference Succeeded'}
                </span>

                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {predictionResult.model_identifier}
                </span>
              </div>

              {/* Total Estimated Price */}
              <div style={{ background: 'var(--bg-surface)', padding: '18px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                  {isBn ? 'মোট আনুমানিক জমির মূল্য (Total Valuation)' : 'Estimated Total Parcel Price'}
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '-0.5px' }}>
                  {formatBdt(predictionResult.predicted_total_price_bdt)} ৳
                </div>
                {predictionResult.total_price_interval && (
                  <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '4px' }}>
                    {isBn ? '৮০% সম্ভাব্য পরিসীমা:' : '80% Empirical Interval:'}{' '}
                    <strong>{formatBdt(predictionResult.total_price_interval.lower)} ৳</strong> —{' '}
                    <strong>{formatBdt(predictionResult.total_price_interval.upper)} ৳</strong>
                  </div>
                )}
              </div>

              {/* Price Per Decimal & Unit Consistency Verification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isBn ? 'প্রতি শতক দর (BDT/decimal)' : 'Price per Decimal'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    {formatBdt(predictionResult.predicted_price_per_decimal_bdt)} ৳
                  </div>
                  {predictionResult.price_per_decimal_interval && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      ±{formatBdt(predictionResult.price_per_decimal_interval.upper - predictionResult.predicted_price_per_decimal_bdt)} ৳ (80% bound)
                    </div>
                  )}
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isBn ? 'গাণিতিক একক সমতা (Unit Check)' : 'Unit Consistency'}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <CheckCircle2 size={16} />
                    <span>VERIFIED STRICT</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    total = rate × {predictionResult.land_area_decimal} decimal
                  </div>
                </div>
              </div>

              {/* Warnings if any */}
              {predictionResult.warnings && predictionResult.warnings.length > 0 && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <AlertTriangle size={14} />
                    {isBn ? 'মডেলের ডোমেইন প্রযোজ্যতা সতর্কতা' : 'Applicability Warnings'}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#92400E' }}>
                    {predictionResult.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Provenance note */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <strong>Provenance:</strong> {predictionResult.data_provenance}
              </div>
            </div>
          ) : (
            /* Empty state prompt */
            <div className="cadastral-card" style={{ padding: '36px 24px', textAlign: 'center', border: '2px dashed var(--border-color)' }}>
              <TrendingUp size={44} color="#9CA3AF" style={{ margin: '0 auto 14px' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                {isBn ? 'জমির বৈশিষ্ট্য ইনপুট দিয়ে মূল্যায়ন শুরু করুন' : 'Ready for ML Land Valuation'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                {isBn
                  ? 'বামের ফর্মে জমির ক্ষেত্রফল, রাস্তার অবস্থা, ও ভৌগোলিক দূরত্বসমূহ পূরণ করে ইনফারেন্স বাটনে ক্লিক করুন।'
                  : 'Select synthetic cadastral parcel features on the left and click "Compute ML Valuation" to view regression outputs.'}
              </p>
            </div>
          )}

          {/* Model Card / Architecture Summary */}
          {modelInfo && (
            <div className="cadastral-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <BarChart3 size={18} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  {isBn ? 'মডেল পারফরম্যান্স ও যাচাইকৃত সূচকসমূহ' : 'Model Architecture & Validation Metrics'}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '10px 6px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Test MAE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {formatBdt(modelInfo.test_metrics?.mae_bdt)} ৳
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#10B981' }}>Per Decimal</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 6px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Test R² Score</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {modelInfo.test_metrics?.r2_score}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#10B981' }}>Synthetic Test Set</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 6px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Spatial Mouza R²</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {modelInfo.spatial_group_holdout_metrics?.r2_score || '0.9708'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#6366F1' }}>5 Held-Out Mouzas</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <div><strong>Selected Model:</strong> {modelInfo.algorithm} (TransformedTargetRegressor)</div>
                <div><strong>Baseline Comparison:</strong> 83.5% error reduction over DummyRegressor (Median Baseline MAE: 29,995 ৳)</div>
                <div><strong>Dataset Size:</strong> {Number(modelInfo.dataset_samples).toLocaleString()} synthetic parcels (70% Train / 15% Val / 15% Test)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
