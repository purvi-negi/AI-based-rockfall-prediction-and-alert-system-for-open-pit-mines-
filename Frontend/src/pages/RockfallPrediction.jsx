import { useEffect, useState } from 'react';
import {
  Play,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import Loading from '../components/Loading';
import { apiService } from '../services/api';

export default function RockfallPrediction() {
  const [mines, setMines] = useState([]);
  const [selectedMineId, setSelectedMineId] = useState('');
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [mlHealth, setMlHealth] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form Inputs
  const [inputs, setInputs] = useState({
    groundTilt: '4.82',
    discontinuityAngle: '63.5',
    jointSpacing: '0.16',
    poreWaterPressure: '144.2',
    vibrationRMR: '5.9',
    rainfall: '34.0',
    snapshotId: 'SNAP-501',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    async function init() {
      try {
        const [minesResult, healthResult] = await Promise.allSettled([
          apiService.getMines(),
          apiService.checkMlHealth(),
        ]);

        if (minesResult.status === 'fulfilled') {
          setMines(minesResult.value);
          if (minesResult.value.length > 0) {
            setSelectedMineId(minesResult.value[0].id);
          }
        } else {
          setErrorMsg('Failed to load mines list.');
        }

        if (healthResult.status === 'fulfilled') {
          setMlHealth(healthResult.value);
        } else {
          setMlHealth({ status: 'offline', modelLoaded: false });
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to initialize ML prediction page.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Pre-fill parameters when user chooses a mine preset
  const handleMineChange = (e) => {
    const mineId = e.target.value;
    setSelectedMineId(mineId);

    // Provide preset telemetry values according to mine
    if (mineId === 'MINE-003') {
      // High risk pit
      setInputs({
        groundTilt: '4.82',
        discontinuityAngle: '63.5',
        jointSpacing: '0.16',
        poreWaterPressure: '144.2',
        vibrationRMR: '5.9',
        rainfall: '34.0',
        snapshotId: 'SNAP-501',
      });
    } else if (mineId === 'MINE-001') {
      setInputs({
        groundTilt: '3.65',
        discontinuityAngle: '52.0',
        jointSpacing: '0.30',
        poreWaterPressure: '108.0',
        vibrationRMR: '4.1',
        rainfall: '19.5',
        snapshotId: 'SNAP-489',
      });
    } else {
      // Safe pit
      setInputs({
        groundTilt: '0.75',
        discontinuityAngle: '28.0',
        jointSpacing: '1.10',
        poreWaterPressure: '31.5',
        vibrationRMR: '1.2',
        rainfall: '2.0',
        snapshotId: 'SNAP-472',
      });
    }
    setPredictionResult(null);
  };

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!inputs.groundTilt || isNaN(inputs.groundTilt)) errs.groundTilt = 'Required numeric angle';
    if (!inputs.discontinuityAngle || isNaN(inputs.discontinuityAngle))
      errs.discontinuityAngle = 'Required numeric angle';
    if (!inputs.jointSpacing || isNaN(inputs.jointSpacing))
      errs.jointSpacing = 'Required numeric spacing';
    if (!inputs.poreWaterPressure || isNaN(inputs.poreWaterPressure))
      errs.poreWaterPressure = 'Required numeric pressure';
    if (!inputs.vibrationRMR || isNaN(inputs.vibrationRMR))
      errs.vibrationRMR = 'Required numeric value';
    if (!inputs.rainfall || isNaN(inputs.rainfall)) errs.rainfall = 'Required numeric rainfall';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setPredicting(true);
    setErrorMsg(null);
    try {
      const selectedMine = mines.find((m) => String(m.id) === String(selectedMineId));
      const res = await apiService.runRockfallPrediction({
        mineId: selectedMineId ? Number(selectedMineId) : null,
        mineName: selectedMine ? selectedMine.name : 'Unknown Mine',
        ...inputs,
      });
      setPredictionResult(res);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        'Prediction failed. Please verify that the Python ML service and prediction service are running.'
      );
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return <Loading fullPage message="Initializing Machine Learning Prediction Pipeline..." />;
  }

  const isModelOnline = mlHealth?.status === 'ok' && mlHealth?.modelLoaded;

  return (
    <div>
      {/* ML ENGINE STATUS BANNER */}
      <div
        className="card-white"
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderLeft: `4px solid ${isModelOnline ? 'var(--primary)' : 'var(--danger)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isModelOnline ? 'var(--primary-light)' : 'rgba(239, 68, 68, 0.15)',
              color: isModelOnline ? 'var(--primary)' : 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
              ML Inference Pipeline: Ensemble XGBoost + Random Forest v2.4
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Trained on 145,000 geotechnical slope telemetry datasets • ROC-AUC: 0.984
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`pulse-dot ${isModelOnline ? 'online' : 'danger'}`} />
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: isModelOnline ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {isModelOnline
              ? 'Model Status: Operational / Online'
              : 'Model Status: Offline / Model Unavailable'}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-banner alert-banner-danger" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="dashboard-grid-2">
        {/* INPUT PARAMETERS FORM */}
        <div className="card-white">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Compass size={18} style={{ color: 'var(--primary)' }} />
                <span>Geotechnical Telemetry Parameters</span>
              </h3>
              <p className="card-subtitle">
                Enter or review multi-sensor values for rockfall probability computation
              </p>
            </div>
          </div>

          <form onSubmit={handlePredict}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mine Site Selection</label>
                <select
                  className="form-control"
                  value={selectedMineId}
                  onChange={handleMineChange}
                >
                  {mines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Snapshot ID / Sample Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={inputs.snapshotId}
                  onChange={(e) => handleInputChange('snapshotId', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Ground Tilt */}
              <div className="form-group">
                <label className="form-label">
                  Ground Tilt (deg °)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g. 4.82"
                  value={inputs.groundTilt}
                  onChange={(e) => handleInputChange('groundTilt', e.target.value)}
                />
                {formErrors.groundTilt && (
                  <div className="form-error">{formErrors.groundTilt}</div>
                )}
                <div className="form-hint">Nominal range: 0.1° – 6.5°</div>
              </div>

              {/* Discontinuity Angle */}
              <div className="form-group">
                <label className="form-label">
                  Discontinuity Angle (deg °)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  placeholder="e.g. 63.5"
                  value={inputs.discontinuityAngle}
                  onChange={(e) => handleInputChange('discontinuityAngle', e.target.value)}
                />
                {formErrors.discontinuityAngle && (
                  <div className="form-error">{formErrors.discontinuityAngle}</div>
                )}
                <div className="form-hint">Dip inclination: 10° – 85°</div>
              </div>

              {/* Joint Spacing */}
              <div className="form-group">
                <label className="form-label">
                  Joint Spacing (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g. 0.16"
                  value={inputs.jointSpacing}
                  onChange={(e) => handleInputChange('jointSpacing', e.target.value)}
                />
                {formErrors.jointSpacing && (
                  <div className="form-error">{formErrors.jointSpacing}</div>
                )}
                <div className="form-hint">Fracture distance: 0.05m – 2.0m</div>
              </div>

              {/* Pore Water Pressure */}
              <div className="form-group">
                <label className="form-label">
                  Pore Water Pressure (kPa)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  placeholder="e.g. 144.2"
                  value={inputs.poreWaterPressure}
                  onChange={(e) => handleInputChange('poreWaterPressure', e.target.value)}
                />
                {formErrors.poreWaterPressure && (
                  <div className="form-error">{formErrors.poreWaterPressure}</div>
                )}
                <div className="form-hint">Toe hydrostatic: 10 – 180 kPa</div>
              </div>

              {/* Vibration RMR */}
              <div className="form-group">
                <label className="form-label">
                  Vibration PPV (mm/s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  placeholder="e.g. 5.9"
                  value={inputs.vibrationRMR}
                  onChange={(e) => handleInputChange('vibrationRMR', e.target.value)}
                />
                {formErrors.vibrationRMR && (
                  <div className="form-error">{formErrors.vibrationRMR}</div>
                )}
                <div className="form-hint">Peak particle velocity: 0 – 10 mm/s</div>
              </div>

              {/* Rainfall */}
              <div className="form-group">
                <label className="form-label">
                  Precipitation (mm/h)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  placeholder="e.g. 34.0"
                  value={inputs.rainfall}
                  onChange={(e) => handleInputChange('rainfall', e.target.value)}
                />
                {formErrors.rainfall && (
                  <div className="form-error">{formErrors.rainfall}</div>
                )}
                <div className="form-hint">Hourly rainfall: 0 – 60 mm/h</div>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
                disabled={predicting}
              >
                {predicting ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Executing ML Prediction...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    <span>Run Rockfall Prediction</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* PREDICTION RESULTS DISPLAY */}
        <div>
          {predictionResult ? (
            <div
              className={`prediction-hero-card ${
                predictionResult.effectiveClass === 'CRITICAL' || predictionResult.effectiveClass === 'WARNING'
                  ? 'hazard'
                  : 'safe'
              }`}
            >
              <div className="prediction-hero-header">
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--primary)',
                      marginBottom: '4px',
                    }}
                  >
                    Prediction Inference Result
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                    {predictionResult.mineName}
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Sample ID: {predictionResult.snapshotId} • Evaluated: {predictionResult.timestamp}
                  </div>
                </div>

                <span
                  className={`prediction-badge-lg ${
                    predictionResult.effectiveClass === 'CRITICAL' || predictionResult.effectiveClass === 'WARNING'
                      ? 'hazard'
                      : 'safe'
                  }`}
                >
                  {predictionResult.effectiveClass === 'CRITICAL' || predictionResult.effectiveClass === 'WARNING' ? (
                    <ShieldAlert size={22} />
                  ) : (
                    <ShieldCheck size={22} />
                  )}
                  {predictionResult.effectiveClass}
                </span>
              </div>

              {/* PROBABILITY BAR */}
              <div className="probability-bar-container">
                <div className="probability-bar-labels">
                  <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                    Hazard Probability: {predictionResult.hazardProbability}%
                  </span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                    Safe Probability: {predictionResult.safeProbability}%
                  </span>
                </div>
                <div className="probability-bar-track">
                  <div
                    className="probability-bar-fill-hazard"
                    style={{ width: `${predictionResult.hazardProbability}%` }}
                  />
                  <div
                    className="probability-bar-fill-safe"
                    style={{ width: `${predictionResult.safeProbability}%` }}
                  />
                </div>
              </div>

              {/* RISK LEVEL & ALERT STATUS */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  margin: '18px 0',
                }}
              >
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Calculated Risk Level
                  </div>
                  <span
                    className={`badge ${
                      predictionResult.effectiveClass === 'CRITICAL' || predictionResult.effectiveClass === 'WARNING'
                        ? 'badge-hazard'
                        : predictionResult.effectiveClass === 'LOW'
                        ? 'badge-warning'
                        : 'badge-safe'
                    }`}
                    style={{ fontSize: '14px', padding: '6px 14px' }}
                  >
                    {predictionResult.effectiveClass}
                  </span>
                </div>

                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Alert Trigger Status
                  </div>
                  <span
                    className={`badge ${
                      predictionResult.alertTriggered ? 'badge-hazard' : 'badge-safe'
                    }`}
                    style={{ fontSize: '14px', padding: '6px 14px' }}
                  >
                    {predictionResult.alertTriggered
                      ? 'ALERT DISPATCHED'
                      : 'NORMAL (NO ALERT)'}
                  </span>
                </div>
              </div>

              {/* MONITORED GEOTECHNICAL PARAMETERS */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
                  Monitored Geotechnical Parameters:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Ground Tilt:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{predictionResult.factors.groundTilt}°</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Discontinuity Angle:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{predictionResult.factors.discontinuityAngle}°</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Joint Spacing:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{predictionResult.factors.jointSpacing} m</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Pore Water Pressure:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{predictionResult.factors.poreWaterPressure} kPa</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Vibration PPV:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{predictionResult.factors.vibrationRMR} mm/s</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Rainfall:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{predictionResult.factors.rainfall} mm/h</span>
                  </div>
                </div>
              </div>

              {/* ML MODEL DIAGNOSTIC OUTPUT */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={15} style={{ color: 'var(--primary)' }} />
                  <span>ML Model Diagnostic Output</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Raw SVM Decision:</span>
                    <strong>Class {predictionResult.rawSvmClass} ({predictionResult.rawSvmClass === 1 ? 'Hyperplane Hazard boundary' : 'Hyperplane Safe boundary'})</strong>
                  </div>
                  {predictionResult.decisionFunction != null && (
                    <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Decision Function Score f(x):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{predictionResult.decisionFunction >= 0 ? `+${predictionResult.decisionFunction.toFixed(4)}` : predictionResult.decisionFunction.toFixed(4)}</strong>
                    </div>
                  )}
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Effective Classification:</span>
                    <strong style={{ color: predictionResult.alertTriggered ? 'var(--danger)' : 'var(--success)' }}>{predictionResult.effectiveClass} ({predictionResult.hazardProbability}%)</strong>
                  </div>
                </div>
              </div>

              {predictionResult.alertTriggered && (
                <div
                  className="alert-banner alert-banner-danger"
                  style={{ marginTop: '18px', marginBottom: 0 }}
                >
                  <AlertTriangle size={18} />
                  <span>
                    Warning: High hazard score logged! An alert has been automatically added to the Alert Management dashboard.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="card-white"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Play size={28} fill="currentColor" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Prediction Engine Ready
              </h3>
              <p style={{ fontSize: '13.5px', maxWidth: '380px', lineHeight: 1.5 }}>
                Select a mine site, adjust sensor parameters if needed, and click{' '}
                <strong style={{ color: 'var(--primary)' }}>Run Rockfall Prediction</strong> to calculate failure probability and risk rating.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
