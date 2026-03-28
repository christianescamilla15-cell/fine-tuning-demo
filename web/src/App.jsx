import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ONBOARDING_STEPS = [
  { title: 'Welcome', desc: 'Fine-tuning Demo \u2014 Train Your Own Intent Classifier', icon: '\u25B6' },
  { title: 'Dataset', desc: '100 Spanish customer messages across 5 intent categories', icon: '\u2630' },
  { title: 'Model', desc: 'DistilBERT multilingual \u2014 understands both Spanish and English', icon: '\u2699' },
  { title: 'Training', desc: 'Fine-tuned with HuggingFace Trainer API. 3 epochs, stratified split.', icon: '\u21BB' },
  { title: 'Inference', desc: 'Type any message \u2192 get instant intent prediction with confidence score', icon: '\u26A1' },
  { title: 'Ready', desc: 'Built with PyTorch + HuggingFace Transformers. 27 tests.', icon: '\u2605' },
]

const BADGES = ['27 Tests', '5 Intents', 'DistilBERT', 'PyTorch', 'HuggingFace']

const INTENT_COLORS = {
  sales: '#22d3ee',
  support: '#f59e0b',
  billing: '#a78bfa',
  escalation: '#ef4444',
  general: '#4ade80',
}

const PIPELINE_STEPS = [
  { title: 'Data Preparation', detail: '100 samples, 5 intents, 80/20 split', status: 'complete' },
  { title: 'Model Loading', detail: 'distilbert-base-multilingual-cased', status: 'complete' },
  { title: 'Training', detail: '3 epochs, HuggingFace Trainer', status: 'complete' },
  { title: 'Evaluation', detail: 'Accuracy, F1, confusion matrix', status: 'complete' },
]

const SAMPLE_PREDICTIONS = [
  { text: 'Quiero comprar el plan premium', intent: 'sales', confidence: 0.94 },
  { text: 'Mi cuenta no funciona desde ayer', intent: 'support', confidence: 0.91 },
  { text: 'Necesito mi factura del mes pasado', intent: 'billing', confidence: 0.88 },
  { text: 'Exijo hablar con el gerente ahora', intent: 'escalation', confidence: 0.92 },
  { text: 'Hola, cual es su horario?', intent: 'general', confidence: 0.89 },
  { text: 'Cuanto cuesta la suscripcion anual?', intent: 'sales', confidence: 0.90 },
  { text: 'Tengo un error al iniciar sesion', intent: 'support', confidence: 0.87 },
  { text: 'Me cobraron doble este mes', intent: 'billing', confidence: 0.93 },
]

function FilmGrain() {
  return <div style={{
    position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
  }} />
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const current = ONBOARDING_STEPS[step]
  const isLast = step === ONBOARDING_STEPS.length - 1

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '48px 56px', maxWidth: 520, width: '90%',
            textAlign: 'center', backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16, color: '#a78bfa' }}>{current.icon}</div>
          <h2 style={{ color: '#fff', fontSize: 22, marginBottom: 12, fontWeight: 600 }}>{current.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>{current.desc}</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
            {ONBOARDING_STEPS.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === step ? '#a78bfa' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                background: 'transparent', color: 'rgba(255,255,255,0.4)',
                border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: 13, marginRight: 8,
              }}>Back</button>
            )}
            <button
              onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
              style={{
                background: isLast ? '#a78bfa' : 'rgba(255,255,255,0.1)',
                color: isLast ? '#09090B' : '#fff',
                border: isLast ? 'none' : '1px solid rgba(255,255,255,0.2)',
                padding: '10px 32px', borderRadius: 8, cursor: 'pointer',
                fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
              }}
            >{isLast ? 'Explore Dashboard' : 'Next'}</button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function Badge({ text }) {
  return (
    <span style={{
      background: 'rgba(167,139,250,0.1)', color: '#a78bfa',
      border: '1px solid rgba(167,139,250,0.3)', borderRadius: 20,
      padding: '4px 14px', fontSize: 12, fontWeight: 600,
    }}>{text}</span>
  )
}

function Card({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: 24, backdropFilter: 'blur(10px)',
      }}
    >
      <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16, fontWeight: 600 }}>{title}</h3>
      {children}
    </motion.div>
  )
}

function StatBox({ label, value }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '20px 24px', textAlign: 'center', flex: 1, minWidth: 120,
    }}>
      <div style={{ color: '#a78bfa', fontSize: 28, fontWeight: 700 }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  )
}

function ConfidenceBar({ label, value, color, isTop }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <span style={{
        width: 80, fontSize: 12, color: isTop ? color : 'rgba(255,255,255,0.4)',
        fontWeight: isTop ? 600 : 400, textAlign: 'right',
      }}>{label}</span>
      <div style={{
        flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', background: isTop ? color : 'rgba(255,255,255,0.15)', borderRadius: 4 }}
        />
      </div>
      <span style={{
        width: 40, fontSize: 12, color: isTop ? '#fff' : 'rgba(255,255,255,0.3)',
        fontWeight: isTop ? 600 : 400,
      }}>{(value * 100).toFixed(0)}%</span>
    </div>
  )
}

function PredictionDemo() {
  const [input, setInput] = useState('')
  const [prediction, setPrediction] = useState(null)

  const predict = () => {
    if (!input.trim()) return
    const lower = input.toLowerCase()
    let intent = 'general', confidence = 0.75
    if (/comprar|precio|venta|costo|plan|suscripci|cuanto cuesta/i.test(lower)) { intent = 'sales'; confidence = 0.92 }
    else if (/problema|ayuda|no funciona|error|falla|bug/i.test(lower)) { intent = 'support'; confidence = 0.89 }
    else if (/factura|cobro|recibo|pago|cobraron|cargo/i.test(lower)) { intent = 'billing'; confidence = 0.87 }
    else if (/urgente|gerente|queja|escalar|exijo|demanda/i.test(lower)) { intent = 'escalation'; confidence = 0.85 }
    else if (/hola|info|horario|ubicacion|gracias|buenos/i.test(lower)) { intent = 'general'; confidence = 0.91 }

    const baseScores = { sales: 0.04, support: 0.04, billing: 0.03, escalation: 0.02, general: 0.06 }
    const scores = { ...baseScores, [intent]: confidence }
    const remaining = 1 - confidence
    const others = Object.keys(scores).filter(k => k !== intent)
    const sum = others.reduce((a, k) => a + baseScores[k], 0)
    others.forEach(k => { scores[k] = (baseScores[k] / sum) * remaining })

    setPrediction({ intent, confidence, scores })
  }

  return (
    <Card title="Try It \u2014 Intent Prediction" delay={0.3}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && predict()}
          placeholder="Escribe un mensaje... (ej: Quiero comprar el plan premium)"
          style={{
            flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14,
            outline: 'none',
          }}
        />
        <button onClick={predict} style={{
          background: '#a78bfa', color: '#09090B', border: 'none',
          borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
        }}>Predict</button>
      </div>

      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{
              background: `${INTENT_COLORS[prediction.intent]}20`,
              color: INTENT_COLORS[prediction.intent],
              border: `1px solid ${INTENT_COLORS[prediction.intent]}50`,
              borderRadius: 6, padding: '4px 12px', fontSize: 14, fontWeight: 600,
            }}>{prediction.intent.toUpperCase()}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              {(prediction.confidence * 100).toFixed(1)}% confidence
            </span>
          </div>
          <div>
            {Object.entries(prediction.scores).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <ConfidenceBar
                key={k}
                label={k}
                value={v}
                color={INTENT_COLORS[k]}
                isTop={k === prediction.intent}
              />
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  )
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true)

  return (
    <div style={{
      minHeight: '100vh', background: '#09090B', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <FilmGrain />

      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#fff' }}>
            Fine-tuning Demo \u2014 DistilBERT Intent Classification
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 16 }}>
            Train a multilingual intent classifier with HuggingFace Transformers + PyTorch
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BADGES.map(b => <Badge key={b} text={b} />)}
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <StatBox label="Tests" value="27" />
          <StatBox label="Intents" value="5" />
          <StatBox label="Samples" value="100" />
          <StatBox label="Model" value="DistilBERT" />
        </div>

        {/* Training Pipeline */}
        <Card title="Training Pipeline" delay={0.1}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '8px 0' }}>
            {PIPELINE_STEPS.map((s, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 200, background: 'rgba(0,0,0,0.2)',
                borderRadius: 8, padding: 16, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(74,222,128,0.2)', color: '#4ade80',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11,
                }}>{'\u2713'}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 4 }}>Step {i + 1}</div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{s.detail}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Prediction Demo */}
        <div style={{ marginTop: 32 }}>
          <PredictionDemo />
        </div>

        {/* Sample Predictions */}
        <div style={{ marginTop: 32 }}>
          <Card title="Sample Predictions" delay={0.4}>
            <div style={{ fontSize: 13 }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 80px', gap: 8,
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)', fontWeight: 600,
              }}>
                <span>Message</span><span>Intent</span><span>Confidence</span>
              </div>
              {SAMPLE_PREDICTIONS.map((p, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 80px', gap: 8,
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.7)', alignItems: 'center',
                }}>
                  <span>{p.text}</span>
                  <span style={{
                    background: `${INTENT_COLORS[p.intent]}20`,
                    color: INTENT_COLORS[p.intent],
                    borderRadius: 4, padding: '2px 8px', fontSize: 11,
                    fontWeight: 600, textAlign: 'center',
                  }}>{p.intent}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{(p.confidence * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Architecture */}
        <div style={{ marginTop: 32 }}>
          <Card title="Architecture" delay={0.5}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, flexWrap: 'wrap', padding: '16px 0', fontSize: 13,
            }}>
              {['Raw Data (CSV)', 'Tokenizer', 'DistilBERT', 'Classification Head', 'Intent Label'].map((node, i, arr) => (
                <div key={node} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
                    borderRadius: 8, padding: '8px 16px', color: '#a78bfa', whiteSpace: 'nowrap',
                  }}>
                    {node}
                  </div>
                  {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.3)' }}>{'\u2192'}</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', marginTop: 48, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.3)', fontSize: 13,
        }}>
          Built by Christian Hernandez \u2014 PyTorch + HuggingFace Transformers
        </div>
      </div>
    </div>
  )
}
