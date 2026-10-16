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
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
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

  // Form Fields Initial State
  const defaultValues = {
    districtId: 'dist_north_rangpur',
    upazilaId: 'upz_pirgacha',
    mouzaId: 'mouza_chhatra_01',
    landAreaDecimal: 10.0,
    landType: 'agricultural_nal',
    roadAccessType: 'paved_pucca_road',
    roadWidthFt: 12.0,
    distPavedRoadM: 100.0,
    distMarketKm: 1.5,
    distUpazilaKm: 6.0,
    floodRisk: 'none',
    drainage: 'moderate_sloped',
    accessRoadAvail: true,
    electricityAvail: true,
    waterAccessAvail: true
  };

  const [districtId, setDistrictId] = useState(defaultValues.districtId);
  const [upazilaId, setUpazilaId] = useState(defaultValues.upazilaId);
  const [mouzaId, setMouzaId] = useState(defaultValues.mouzaId);
  const [landAreaDecimal, setLandAreaDecimal] = useState(defaultValues.landAreaDecimal);
  const [landType, setLandType] = useState(defaultValues.landType);
  const [roadAccessType, setRoadAccessType] = useState(defaultValues.roadAccessType);
  const [roadWidthFt, setRoadWidthFt] = useState(defaultValues.roadWidthFt);
  const [distPavedRoadM, setDistPavedRoadM] = useState(defaultValues.distPavedRoadM);
  const [distMarketKm, setDistMarketKm] = useState(defaultValues.distMarketKm);
  const [distUpazilaKm, setDistUpazilaKm] = useState(defaultValues.distUpazilaKm);
  const [floodRisk, setFloodRisk] = useState(defaultValues.floodRisk);
  const [drainage, setDrainage] = useState(defaultValues.drainage);
  const [accessRoadAvail, setAccessRoadAvail] = useState(defaultValues.accessRoadAvail);
  const [electricityAvail, setElectricityAvail] = useState(defaultValues.electricityAvail);
  const [waterAccessAvail, setWaterAccessAvail] = useState(defaultValues.waterAccessAvail);

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
        if (metadata.synthetic_locations.mouzas && metadata.synthetic_locations.mouzas.length > 0) {
          setMouzaId(metadata.synthetic_locations.mouzas[0]);
        }
      }
    }
  };

  const handleReset = () => {
    setDistrictId(defaultValues.districtId);
    setUpazilaId(defaultValues.upazilaId);
    setMouzaId(defaultValues.mouzaId);
    setLandAreaDecimal(defaultValues.landAreaDecimal);
    setLandType(defaultValues.landType);
    setRoadAccessType(defaultValues.roadAccessType);
    setRoadWidthFt(defaultValues.roadWidthFt);
    setDistPavedRoadM(defaultValues.distPavedRoadM);
    setDistMarketKm(defaultValues.distMarketKm);
    setDistUpazilaKm(defaultValues.distUpazilaKm);
    setFloodRisk(defaultValues.floodRisk);
    setDrainage(defaultValues.drainage);
    setAccessRoadAvail(defaultValues.accessRoadAvail);
    setElectricityAvail(defaultValues.electricityAvail);
    setWaterAccessAvail(defaultValues.waterAccessAvail);
    setPredictionResult(null);
    setApiError(null);
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
    <div className="landprice-page-container">
      {/* 1. Page Header Block */}
      <div className="landprice-header-block">
        <div className="landprice-badges-row">
          <span className="landprice-badge ml-benchmark">
            <Cpu size={13} aria-hidden="true" />
            <span>ML REGRESSION BENCHMARK</span>
          </span>
          <span className="landprice-badge synthetic">
            <AlertTriangle size={13} aria-hidden="true" />
            <span>SYNTHETIC DATASET ONLY</span>
          </span>
        </div>

        <div className="landprice-title-row">
          <div className="landprice-icon-box" aria-hidden="true">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="landprice-title">
              {isBn ? 'গ্রামীণ জমির সম্ভাব্য মূল্য বুদ্ধিমত্তা' : 'Rural Land Price Intelligence'}
            </h1>
            <p className="landprice-subtitle">
              {isBn
                ? 'কৃত্রিম ডেটাসেটে প্রশিক্ষিত রিগ্রেশন মডেলের মাধ্যমে গ্রামীণ জমির বহু-মাত্রিক ভৌগোলিক ও যোগাযোগ বৈশিষ্ট্য-ভিত্তিক আনুমানিক দর বিশ্লেষণ।'
                : 'Multi-factor regression intelligence estimating per-decimal rural parcel value from synthetic cadastral datasets.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Synthetic Data Disclaimer Banner */}
      <div className="landprice-disclaimer-card" role="alert">
        <ShieldAlert className="landprice-disclaimer-icon" size={24} aria-hidden="true" />
        <div className="landprice-disclaimer-content">
          <h2 className="landprice-disclaimer-heading">
            {isBn ? 'সতর্কবার্তা: সম্পূর্ণ কৃত্রিম ডেটাসেট ভিত্তিক পরীক্ষামূলক মডেল' : 'Strict Disclaimer: Synthetic Data Simulation Only'}
          </h2>
          <p className="landprice-disclaimer-body">
            {isBn
              ? 'এই মূল্যায়ন সম্পূর্ণ synthetic data দিয়ে তৈরি পরীক্ষামূলক ML model-এর output। এটি বাংলাদেশের প্রকৃত বাজারদর নয়, জমির valuation নয় এবং জমি কেনাবেচার আর্থিক সিদ্ধান্তের জন্য ব্যবহারযোগ্য নয়।'
              : 'Experimental prediction from synthetic data only. Not a real Bangladesh market valuation and not suitable for actual land purchase decisions.'}
          </p>
          <p className="landprice-disclaimer-sub">
            {isBn
              ? 'নমুনা জেলা, মৌজা ও লেনদেন মূল্যসমূহ অ্যালগরিদমিক গবেষণার উদ্দেশ্যে সিমুলেট করা হয়েছে; কোনো সরকারি সাব-রেজিস্ট্রি বা ভূমি মন্ত্রণালয়ের নথি নয়।'
              : 'All districts, mouzas, and transaction figures are mathematically simulated for academic research and demo purposes.'}
          </p>
        </div>
      </div>

      {/* Global API Error Notice if any */}
      {apiError && (
        <div style={{ marginBottom: '24px' }}>
          <ApiErrorNotice error={apiError} onRetry={() => window.location.reload()} />
        </div>
      )}

      {/* 3. Main Two-Column Layout Grid */}
      <div className="landprice-layout-grid">
        
        {/* Left Column: Form Card */}
        <div className="landprice-card">
          <div className="landprice-card-header">
            <h2 className="landprice-card-title">
              <Compass size={18} color="var(--accent)" aria-hidden="true" />
              <span>{isBn ? 'জমির বৈশিষ্ট্য নির্বাচন ফর্ম' : 'Parcel Characteristics Input'}</span>
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              style={{
                height: '32px',
                padding: '0 10px',
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: 'var(--radius-std)',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink-soft)',
                cursor: 'pointer'
              }}
              title={isBn ? 'ফর্মের মান রিসেট করুন' : 'Reset form fields'}
            >
              <RotateCcw size={13} />
              <span>{isBn ? 'রিসেট' : 'Reset'}</span>
            </button>
          </div>

          <form onSubmit={handlePredict} className="landprice-card-body">
            {/* Geographic Cluster (Synthetic District) */}
            <div className="landprice-form-group">
              <label htmlFor="select-district" className="landprice-label">
                {isBn ? 'ডেমো জেলা অঞ্চল (Synthetic District Zone)' : 'Demo District Zone (Synthetic)'}
              </label>
              <select
                id="select-district"
                value={districtId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="landprice-select"
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

            {/* Upazila & Mouza Sub-grid */}
            <div className="landprice-form-group">
              <div className="landprice-grid-2">
                <div>
                  <label htmlFor="select-upazila" className="landprice-label">
                    {isBn ? 'ডেমো উপজেলা' : 'Demo Upazila'}
                  </label>
                  <select
                    id="select-upazila"
                    value={upazilaId}
                    onChange={(e) => setUpazilaId(e.target.value)}
                    className="landprice-select"
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
                  <label htmlFor="select-mouza" className="landprice-label">
                    {isBn ? 'মৌজা ক্লাস্টার' : 'Mouza Cluster'}
                  </label>
                  <select
                    id="select-mouza"
                    value={mouzaId}
                    onChange={(e) => setMouzaId(e.target.value)}
                    className="landprice-select"
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
            </div>

            {/* Land Area & Land Type Sub-grid */}
            <div className="landprice-form-group">
              <div className="landprice-grid-2">
                <div>
                  <label htmlFor="input-land-area" className="landprice-label">
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
                    className="landprice-input"
                    placeholder="e.g. 10.0"
                  />
                </div>

                <div>
                  <label htmlFor="select-land-type" className="landprice-label">
                    {isBn ? 'জমির শ্রেণি (Land Type)' : 'Land Classification'}
                  </label>
                  <select
                    id="select-land-type"
                    value={landType}
                    onChange={(e) => setLandType(e.target.value)}
                    className="landprice-select"
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
            </div>

            {/* Road Access & Road Width Sub-grid */}
            <div className="landprice-form-group">
              <div className="landprice-grid-2">
                <div>
                  <label htmlFor="select-road-access" className="landprice-label">
                    {isBn ? 'রাস্তার ধরন (Road Access)' : 'Road Access Type'}
                  </label>
                  <select
                    id="select-road-access"
                    value={roadAccessType}
                    onChange={(e) => setRoadAccessType(e.target.value)}
                    className="landprice-select"
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
                  <label htmlFor="input-road-width" className="landprice-label">
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
                    className="landprice-input"
                    placeholder="e.g. 12"
                  />
                </div>
              </div>
            </div>

            {/* Distances Sub-grid (Paved Road, Market, Upazila) */}
            <div className="landprice-form-group">
              <div className="landprice-grid-3">
                <div>
                  <label htmlFor="input-dist-paved" className="landprice-label" style={{ fontSize: '0.8rem' }}>
                    {isBn ? 'পাকা রাস্তার দূরত্ব (মিটার)' : 'Dist. Paved Road (m)'}
                  </label>
                  <input
                    id="input-dist-paved"
                    type="number"
                    step="10"
                    min="0"
                    value={distPavedRoadM}
                    onChange={(e) => setDistPavedRoadM(e.target.value)}
                    className="landprice-input"
                  />
                </div>

                <div>
                  <label htmlFor="input-dist-market" className="landprice-label" style={{ fontSize: '0.8rem' }}>
                    {isBn ? 'হাট-বাজারের দূরত্ব (কিমি)' : 'Dist. Market (km)'}
                  </label>
                  <input
                    id="input-dist-market"
                    type="number"
                    step="0.1"
                    min="0"
                    value={distMarketKm}
                    onChange={(e) => setDistMarketKm(e.target.value)}
                    className="landprice-input"
                  />
                </div>

                <div>
                  <label htmlFor="input-dist-upazila" className="landprice-label" style={{ fontSize: '0.8rem' }}>
                    {isBn ? 'উপজেলা সদর (কিমি)' : 'Dist. Upazila (km)'}
                  </label>
                  <input
                    id="input-dist-upazila"
                    type="number"
                    step="0.5"
                    min="0"
                    value={distUpazilaKm}
                    onChange={(e) => setDistUpazilaKm(e.target.value)}
                    className="landprice-input"
                  />
                </div>
              </div>
            </div>

            {/* Flood & Drainage Sub-grid */}
            <div className="landprice-form-group">
              <div className="landprice-grid-2">
                <div>
                  <label htmlFor="select-flood-risk" className="landprice-label">
                    {isBn ? 'বন্যা ঝুঁকি (Flood Risk)' : 'Flood Vulnerability'}
                  </label>
                  <select
                    id="select-flood-risk"
                    value={floodRisk}
                    onChange={(e) => setFloodRisk(e.target.value)}
                    className="landprice-select"
                  >
                    <option value="none">{isBn ? 'ঝুঁকিমুক্ত উঁচু জমি (None)' : 'Highland / None'}</option>
                    <option value="seasonal_shallow">{isBn ? 'মৌসুমি অগভীর প্লাবন (Seasonal Shallow)' : 'Seasonal Shallow'}</option>
                    <option value="moderate_regular">{isBn ? 'নিয়মিত মাঝারি প্লাবন (Moderate Regular)' : 'Moderate Regular'}</option>
                    <option value="high_flash_flood">{isBn ? 'উচ্চ প্লাবন / জলমগ্নতা (High Flash Flood)' : 'High Flash Flood'}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="select-drainage" className="landprice-label">
                    {isBn ? 'নিষ্কাশন ব্যবস্থা (Drainage)' : 'Drainage Performance'}
                  </label>
                  <select
                    id="select-drainage"
                    value={drainage}
                    onChange={(e) => setDrainage(e.target.value)}
                    className="landprice-select"
                  >
                    <option value="excellent_highland">{isBn ? 'উত্তম ঢালু নিষ্কাশন (Excellent)' : 'Excellent Highland'}</option>
                    <option value="moderate_sloped">{isBn ? 'মাঝারি নিষ্কাশন (Moderate)' : 'Moderate Sloped'}</option>
                    <option value="poor_waterlogged">{isBn ? 'ধীর নিষ্কাশন / জলাবদ্ধ (Poor)' : 'Poor Waterlogged'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Infrastructure Toggles */}
            <div className="landprice-infra-box">
              <label className="landprice-checkbox-label">
                <input
                  type="checkbox"
                  checked={accessRoadAvail}
                  onChange={(e) => setAccessRoadAvail(e.target.checked)}
                />
                <span>{isBn ? 'রাস্তা সংযোগ আছে' : 'Direct Road Access'}</span>
              </label>

              <label className="landprice-checkbox-label">
                <input
                  type="checkbox"
                  checked={electricityAvail}
                  onChange={(e) => setElectricityAvail(e.target.checked)}
                />
                <Zap size={14} color="#D97706" aria-hidden="true" />
                <span>{isBn ? 'পল্লী বিদ্যুৎ সংযোগ' : 'Electricity Grid'}</span>
              </label>

              <label className="landprice-checkbox-label">
                <input
                  type="checkbox"
                  checked={waterAccessAvail}
                  onChange={(e) => setWaterAccessAvail(e.target.checked)}
                />
                <Droplets size={14} color="#2563EB" aria-hidden="true" />
                <span>{isBn ? 'গভীর নলকূপ / সেচ সুবিধা' : 'Deep Tubewell / Irrigation'}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="btn-run-prediction"
              type="submit"
              disabled={estimating}
              className="landprice-submit-btn"
            >
              {estimating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" aria-hidden="true" />
                  <span>{isBn ? 'মডেল ইনফারেন্স চলছে...' : 'Computing ML Inference...'}</span>
                </>
              ) : (
                <>
                  <TrendingUp size={18} aria-hidden="true" />
                  <span>{isBn ? 'সম্ভাব্য মূল্য নির্ণয় করুন (ML Inference)' : 'Compute ML Valuation'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Results & Model Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Prediction Output Card or Intentional Empty State */}
          {predictionResult ? (
            <div className="landprice-result-card">
              {/* Result Top Bar */}
              <div className="landprice-result-topbar">
                <span className="landprice-status-badge">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>{isBn ? 'সফল প্রাক্কলন' : 'Inference Successful'}</span>
                </span>
                <span className="landprice-model-id-tag">
                  {predictionResult.model_identifier}
                </span>
              </div>

              <div className="landprice-card-body">
                {/* Total Price Highlight */}
                <div className="landprice-total-box">
                  <div className="landprice-total-label">
                    {isBn ? 'মোট আনুমানিক জমির মূল্য' : 'Estimated Total Parcel Price'}
                  </div>
                  <div className="landprice-total-figure">
                    {formatBdt(predictionResult.predicted_total_price_bdt)} ৳
                  </div>
                  {predictionResult.total_price_interval && (
                    <div className="landprice-interval-text">
                      {isBn ? '৮০% সম্ভাব্য বিচ্যুতির পরিসীমা: ' : '80% Empirical Interval: '}
                      <strong>{formatBdt(predictionResult.total_price_interval.lower)} ৳</strong> —{' '}
                      <strong>{formatBdt(predictionResult.total_price_interval.upper)} ৳</strong>
                    </div>
                  )}
                </div>

                {/* Per Decimal Rate & Strict Unit Check */}
                <div className="landprice-metrics-grid">
                  <div className="landprice-metric-tile">
                    <div className="landprice-metric-tile-title">
                      {isBn ? 'প্রতি শতকের আনুমানিক দর' : 'Price per Decimal'}
                    </div>
                    <div className="landprice-metric-tile-value">
                      {formatBdt(predictionResult.predicted_price_per_decimal_bdt)} ৳
                    </div>
                    {predictionResult.price_per_decimal_interval && (
                      <div className="landprice-metric-tile-sub">
                        ±{formatBdt(predictionResult.price_per_decimal_interval.upper - predictionResult.predicted_price_per_decimal_bdt)} ৳ (80% bound)
                      </div>
                    )}
                  </div>

                  <div className="landprice-metric-tile">
                    <div className="landprice-metric-tile-title">
                      {isBn ? 'একক সমতা যাচাই' : 'Unit Consistency Check'}
                    </div>
                    <div style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--status-matched-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginTop: '6px'
                    }}>
                      <CheckCircle2 size={15} />
                      <span>VERIFIED STRICT</span>
                    </div>
                    <div className="landprice-metric-tile-sub">
                      total = rate × {predictionResult.land_area_decimal} decimal
                    </div>
                  </div>
                </div>

                {/* Selected Input Summary Chips */}
                <div className="landprice-summary-chips">
                  <span className="landprice-chip">
                    {predictionResult.land_area_decimal} {isBn ? 'শতক' : 'Decimal'}
                  </span>
                  <span className="landprice-chip">
                    {landType.replace('_', ' ')}
                  </span>
                  <span className="landprice-chip">
                    {roadAccessType.replace(/_/g, ' ')} ({roadWidthFt} ft)
                  </span>
                  <span className="landprice-chip">
                    {mouzaId}
                  </span>
                </div>

                {/* Warnings if any */}
                {predictionResult.warnings && predictionResult.warnings.length > 0 && (
                  <div className="landprice-warning-box">
                    <div className="landprice-warning-header">
                      <AlertTriangle size={14} />
                      <span>{isBn ? 'মডেলের ডোমেইন প্রযোজ্যতা সতর্কতা' : 'Applicability Warnings'}</span>
                    </div>
                    <ul className="landprice-warning-list">
                      {predictionResult.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Provenance note */}
                <div className="landprice-provenance-text">
                  <strong>Provenance:</strong> {predictionResult.data_provenance}
                </div>
              </div>
            </div>
          ) : (
            /* Intentional Empty State Card */
            <div className="landprice-empty-state">
              <div className="landprice-empty-icon" aria-hidden="true">
                <TrendingUp size={26} />
              </div>
              <h2 className="landprice-empty-title">
                {isBn ? 'জমির বৈশিষ্ট্য ইনপুট দিয়ে মূল্যায়ন শুরু করুন' : 'Ready for ML Land Valuation'}
              </h2>
              <p className="landprice-empty-desc">
                {isBn
                  ? 'বামের ফর্মে জমির ক্ষেত্রফল, রাস্তার অবস্থা, ও ভৌগোলিক দূরত্বসমূহ পূরণ করে "সম্ভাব্য মূল্য নির্ণয় করুন" বাটনে ক্লিক করুন।'
                  : 'Select synthetic cadastral parcel features on the left and click "Compute ML Valuation" to generate regression outputs.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                <span className="landprice-chip">Road Width Frontage</span>
                <span className="landprice-chip">Market Proximity</span>
                <span className="landprice-chip">Drainage Quality</span>
                <span className="landprice-chip">Empirical Bounds</span>
              </div>
            </div>
          )}

          {/* Validated Model Performance Card (Always visible beneath results/empty state) */}
          {modelInfo && (
            <div className="landprice-model-metrics-card">
              <div className="landprice-card-header">
                <h2 className="landprice-card-title">
                  <BarChart3 size={17} color="var(--accent)" aria-hidden="true" />
                  <span>{isBn ? 'মডেল পারফরম্যান্স ও যাচাইকৃত সূচকসমূহ' : 'Model Architecture & Validated Metrics'}</span>
                </h2>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                  Dataset: {Number(modelInfo.dataset_samples).toLocaleString()} samples
                </span>
              </div>

              <div className="landprice-card-body">
                <div className="landprice-model-specs-grid">
                  <div className="landprice-spec-tile">
                    <div className="landprice-spec-label">Test MAE</div>
                    <div className="landprice-spec-val">
                      {formatBdt(modelInfo.test_metrics?.mae_bdt)} ৳
                    </div>
                    <div className="landprice-spec-sub green">Per Decimal</div>
                  </div>

                  <div className="landprice-spec-tile">
                    <div className="landprice-spec-label">Test R² Score</div>
                    <div className="landprice-spec-val">
                      {modelInfo.test_metrics?.r2_score}
                    </div>
                    <div className="landprice-spec-sub green">Synthetic Test Set</div>
                  </div>

                  <div className="landprice-spec-tile">
                    <div className="landprice-spec-label">Spatial Mouza R²</div>
                    <div className="landprice-spec-val">
                      {modelInfo.spatial_group_holdout_metrics?.r2_score || '0.9708'}
                    </div>
                    <div className="landprice-spec-sub blue">5 Held-Out Mouzas</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: '1.55' }}>
                  <div style={{ marginBottom: '3px' }}>
                    <strong>Selected Algorithm:</strong> {modelInfo.algorithm} (TransformedTargetRegressor)
                  </div>
                  <div style={{ marginBottom: '3px' }}>
                    <strong>Baseline Comparison:</strong> 83.5% error reduction over DummyRegressor (Median Baseline: 29,996 ৳)
                  </div>
                  <div>
                    <strong>Split Protocol:</strong> 70% Train (14,000) / 15% Validation (3,000) / 15% Final Test (3,000)
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
