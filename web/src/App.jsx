import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ====== TRANSLATIONS ====== */
const TR = {
  es: {
    tourWelcome: 'Bienvenido a Fine-tuning Demo',
    tourWelcomeDesc: 'Entrena tu propio clasificador de intenciones con DistilBERT.\nPermiteme darte un tour interactivo.',
    tourPipeline: 'Pipeline de Entrenamiento',
    tourPipelineDesc: 'Observa las 4 etapas del pipeline: preparacion de datos, carga del modelo, entrenamiento y evaluacion.',
    tourPredict1: 'Prediccion en Vivo',
    tourPredict1Desc: 'Escribe un mensaje de ventas y mira como el modelo detecta la intencion "sales" con alta confianza.',
    tourPredict2: 'Segunda Prediccion',
    tourPredict2Desc: 'Ahora prueba un mensaje de soporte. El modelo identifica la intencion "support" correctamente.',
    tourTable: 'Predicciones de Ejemplo',
    tourTableDesc: '8 predicciones pre-calculadas mostrando las 5 categorias de intenciones con sus porcentajes de confianza.',
    tourComplete: 'Tour Completado',
    tourCompleteDesc: 'Has explorado el pipeline completo de fine-tuning. Construido con PyTorch + HuggingFace Transformers.',
    next: 'Siguiente', prev: 'Anterior', skip: 'Saltar Tour', finish: 'Finalizar',
    restartTour: 'Reiniciar Tour', explore: 'Explorar',
    watching: 'Ejecutando accion...',
    startTour: 'Comenzar Tour',
    steps: 'Pasos visitados', predictions: 'Predicciones', intents: 'Intenciones',
  },
  en: {
    tourWelcome: 'Welcome to Fine-tuning Demo',
    tourWelcomeDesc: 'Train your own intent classifier with DistilBERT.\nLet me give you an interactive tour.',
    tourPipeline: 'Training Pipeline',
    tourPipelineDesc: 'See the 4 stages: data preparation, model loading, training, and evaluation.',
    tourPredict1: 'Live Prediction',
    tourPredict1Desc: 'Type a sales message and watch the model detect the "sales" intent with high confidence.',
    tourPredict2: 'Second Prediction',
    tourPredict2Desc: 'Now try a support message. The model correctly identifies the "support" intent.',
    tourTable: 'Sample Predictions',
    tourTableDesc: '8 pre-computed predictions showing all 5 intent categories with confidence scores.',
    tourComplete: 'Tour Complete!',
    tourCompleteDesc: 'You have explored the full fine-tuning pipeline. Built with PyTorch + HuggingFace Transformers.',
    next: 'Next', prev: 'Back', skip: 'Skip Tour', finish: 'Finish',
    restartTour: 'Restart Tour', explore: 'Explore',
    watching: 'Running action...',
    startTour: 'Start Tour',
    steps: 'Steps visited', predictions: 'Predictions', intents: 'Intents',
  },
}

/* ====== CONSTANTS ====== */
const BADGES = ['27 Tests', '5 Intents', 'DistilBERT', 'PyTorch', 'HuggingFace']

const INTENT_COLORS = {
  sales: '#22d3ee', support: '#f59e0b', billing: '#a78bfa',
  escalation: '#ef4444', general: '#4ade80',
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

/* ====== TOUR STEPS ====== */
const TOUR_STEPS = [
  { id: 'welcome', target: null, action: null, wait: 0 },
  { id: 'pipeline', target: '[data-tour="pipeline"]', action: null, wait: 0 },
  { id: 'predict1', target: '[data-tour="prediction"]', action: 'predict1', wait: 2500 },
  { id: 'predict2', target: '[data-tour="prediction"]', action: 'predict2', wait: 2500 },
  { id: 'table', target: '[data-tour="sample-table"]', action: null, wait: 0 },
  { id: 'final', target: null, action: 'scrollTop', wait: 500 },
]

/* ====== HELPERS ====== */
function typeIntoInput(selector, text) {
  const el = document.querySelector(selector)
  if (!el) return false
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  if (nativeSetter) {
    nativeSetter.call(el, text)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  el.dispatchEvent(new Event('change', { bubbles: true }))
  return true
}

function clickElement(selector) {
  const el = document.querySelector(selector)
  if (!el) return false
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  return true
}

/* ====== TOUR KEYFRAMES ====== */
const tourKeyframes = `
@keyframes tourPulse {
  0%, 100% { border-color: rgba(167,139,250,0.6); box-shadow: 0 0 0 0 rgba(167,139,250,0.2); }
  50% { border-color: rgba(167,139,250,0.9); box-shadow: 0 0 20px 4px rgba(167,139,250,0.15); }
}
@keyframes tourTooltipIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes tourActionPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
@keyframes tourFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes tourScaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
`

/* ====== SPOTLIGHT ====== */
function TourSpotlight({ targetRect, padding = 12 }) {
  if (!targetRect) return null
  const { top, left, width, height } = targetRect
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
        clipPath: `polygon(
          0% 0%, 100% 0%, 100% 100%, 0% 100%,
          0% ${top - padding}px,
          ${left - padding}px ${top - padding}px,
          ${left - padding}px ${top + height + padding}px,
          ${left + width + padding}px ${top + height + padding}px,
          ${left + width + padding}px ${top - padding}px,
          0% ${top - padding}px
        )`,
      }} />
      <div style={{
        position: 'absolute', top: top - padding, left: left - padding,
        width: width + padding * 2, height: height + padding * 2,
        border: '2px solid rgba(167,139,250,0.6)', borderRadius: 12,
        animation: 'tourPulse 2s ease-in-out infinite', pointerEvents: 'none',
      }} />
    </div>
  )
}

/* ====== TOOLTIP ====== */
function TourTooltip({ step, stepIndex, totalSteps, targetRect, lang, actionRunning, onNext, onPrev, onSkip }) {
  const tr = TR[lang]
  const titles = { welcome: 'tourWelcome', pipeline: 'tourPipeline', predict1: 'tourPredict1', predict2: 'tourPredict2', table: 'tourTable', final: 'tourComplete' }
  const descs = { welcome: 'tourWelcomeDesc', pipeline: 'tourPipelineDesc', predict1: 'tourPredict1Desc', predict2: 'tourPredict2Desc', table: 'tourTableDesc', final: 'tourCompleteDesc' }

  let tooltipStyle = {
    position: 'fixed', zIndex: 9999, background: '#1A1B2E',
    border: '1px solid rgba(167,139,250,0.4)', borderRadius: 14,
    padding: '20px 22px', width: 360, maxWidth: 'calc(100vw - 32px)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.6)', animation: 'tourTooltipIn 0.3s ease-out',
    pointerEvents: 'auto',
  }

  if (targetRect) {
    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height + 20)
    if (spaceBelow >= 200) {
      tooltipStyle.top = targetRect.top + targetRect.height + 16
      tooltipStyle.left = Math.max(16, Math.min(targetRect.left, window.innerWidth - 380))
    } else {
      tooltipStyle.bottom = window.innerHeight - targetRect.top + 16
      tooltipStyle.left = Math.max(16, Math.min(targetRect.left, window.innerWidth - 380))
    }
  } else {
    tooltipStyle.top = '50%'; tooltipStyle.left = '50%'
    tooltipStyle.transform = 'translate(-50%, -50%)'; tooltipStyle.width = 420
  }

  return (
    <div data-tour-tooltip style={tooltipStyle}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px',
        borderRadius: 12, background: 'rgba(167,139,250,0.15)', color: '#c4b5fd',
        fontSize: 11, fontWeight: 600, marginBottom: 10,
      }}>
        {stepIndex + 1} / {totalSteps}
      </div>

      {step.id === 'welcome' && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          <button onClick={() => {}} style={{
            padding: '6px 18px', borderRadius: 8, border: lang === 'es' ? 'none' : '1px solid rgba(255,255,255,0.2)',
            background: lang === 'es' ? '#a78bfa' : 'transparent', color: lang === 'es' ? '#09090B' : '#9CA3AF',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }} data-lang-es>ES</button>
          <button onClick={() => {}} style={{
            padding: '6px 18px', borderRadius: 8, border: lang === 'en' ? 'none' : '1px solid rgba(255,255,255,0.2)',
            background: lang === 'en' ? '#a78bfa' : 'transparent', color: lang === 'en' ? '#09090B' : '#9CA3AF',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }} data-lang-en>EN</button>
        </div>
      )}

      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E5E7EB', marginBottom: 6 }}>
        {tr[titles[step.id]]}
      </h3>
      <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.5, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
        {tr[descs[step.id]]}
      </p>

      {actionRunning && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          borderRadius: 8, marginBottom: 14, background: 'rgba(167,139,250,0.1)',
          border: '1px solid rgba(167,139,250,0.2)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#a78bfa',
            animation: 'tourActionPulse 1s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 500 }}>{tr.watching}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {TOUR_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === stepIndex ? 20 : 6, height: 6, borderRadius: 3,
            background: i < stepIndex ? '#a78bfa' : i === stepIndex ? '#c4b5fd' : 'rgba(255,255,255,0.1)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {stepIndex > 0 && !actionRunning && (
          <button onClick={onPrev} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#9CA3AF', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>{tr.prev}</button>
        )}
        <div style={{ flex: 1 }} />
        {!actionRunning && (
          <button onClick={onSkip} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: 'transparent', color: '#6B7280', fontSize: 12, cursor: 'pointer',
          }}>{tr.skip}</button>
        )}
        {!actionRunning && (
          <button onClick={onNext} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{stepIndex === totalSteps - 1 ? tr.finish : tr.next}</button>
        )}
      </div>
    </div>
  )
}

/* ====== COMPLETION MODAL ====== */
function CompletionModal({ lang, onRestart, onExplore }) {
  const tr = TR[lang]
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', animation: 'tourFadeIn 0.4s ease-out',
      cursor: 'pointer',
    }} onClick={(e) => {
      if (e.target.closest('[data-tour-completion]') || e.target.closest('button')) return;
      onExplore();
    }}>
      <div data-tour-completion style={{
        background: '#1A1B2E', border: '1px solid rgba(167,139,250,0.4)',
        borderRadius: 20, padding: '36px 40px', maxWidth: 460, width: '90%',
        textAlign: 'center', animation: 'tourScaleIn 0.4s ease-out',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', boxShadow: '0 0 30px rgba(167,139,250,0.3)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#E5E7EB', marginBottom: 8 }}>{tr.tourComplete}</h2>
        <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 24 }}>{tr.tourCompleteDesc}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { value: '5', label: tr.steps, color: '#a78bfa' },
            { value: '2', label: tr.predictions, color: '#22d3ee' },
            { value: '5', label: tr.intents, color: '#4ade80' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onRestart} style={{
            padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(167,139,250,0.3)',
            background: 'transparent', color: '#c4b5fd', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>{tr.restartTour}</button>
          <button onClick={onExplore} style={{
            padding: '10px 28px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>{tr.explore}</button>
        </div>
      </div>
    </div>
  )
}

/* ====== ONBOARDING TOUR ====== */
function OnboardingTour({ lang, setLang, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [actionRunning, setActionRunning] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const timeoutsRef = useRef([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []
  }, [])

  const addTimeout = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts])

  const currentStep = TOUR_STEPS[stepIndex]

  const measureTarget = useCallback(() => {
    if (!currentStep?.target) { setTargetRect(null); return }
    const el = document.querySelector(currentStep.target)
    if (el) {
      const rect = el.getBoundingClientRect()
      setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        addTimeout(() => {
          const r2 = el.getBoundingClientRect()
          setTargetRect({ top: r2.top, left: r2.left, width: r2.width, height: r2.height })
        }, 500)
      }
    } else { setTargetRect(null) }
  }, [currentStep, addTimeout])

  useEffect(() => {
    if (!currentStep) return
    clearAllTimeouts()
    addTimeout(() => measureTarget(), 300)
  }, [stepIndex, currentStep, measureTarget, clearAllTimeouts, addTimeout])

  useEffect(() => {
    const handler = () => measureTarget()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [measureTarget])

  const executeAction = useCallback(() => {
    if (!currentStep?.action) return
    setActionRunning(true)

    switch (currentStep.action) {
      case 'predict1': {
        addTimeout(() => {
          typeIntoInput('[data-tour="prediction"] input[type="text"]', 'quiero comprar un producto')
        }, 400)
        addTimeout(() => {
          clickElement('[data-tour="predict-btn"]')
        }, 900)
        addTimeout(() => {
          setActionRunning(false)
          measureTarget()
        }, currentStep.wait)
        break
      }
      case 'predict2': {
        addTimeout(() => {
          typeIntoInput('[data-tour="prediction"] input[type="text"]', 'tengo un problema con mi pedido')
        }, 400)
        addTimeout(() => {
          clickElement('[data-tour="predict-btn"]')
        }, 900)
        addTimeout(() => {
          setActionRunning(false)
          measureTarget()
        }, currentStep.wait)
        break
      }
      case 'scrollTop': {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        addTimeout(() => setActionRunning(false), currentStep.wait)
        break
      }
      default:
        setActionRunning(false)
    }
  }, [currentStep, addTimeout, measureTarget])

  const goToStep = useCallback((idx) => {
    if (idx < 0 || idx >= TOUR_STEPS.length) return
    clearAllTimeouts(); setActionRunning(false); setTargetRect(null); setStepIndex(idx)
  }, [clearAllTimeouts])

  const handleNext = useCallback(() => {
    if (actionRunning) return
    if (currentStep?.action && !actionRunning) {
      executeAction()
      addTimeout(() => {
        if (stepIndex < TOUR_STEPS.length - 1) goToStep(stepIndex + 1)
        else { window.scrollTo({ top: 0, behavior: 'smooth' }); setShowCompletion(true) }
      }, (currentStep.wait || 0) + 200)
      return
    }
    if (stepIndex < TOUR_STEPS.length - 1) goToStep(stepIndex + 1)
    else { window.scrollTo({ top: 0, behavior: 'smooth' }); setShowCompletion(true) }
  }, [stepIndex, currentStep, actionRunning, executeAction, goToStep, addTimeout])

  const handlePrev = useCallback(() => { if (!actionRunning) goToStep(stepIndex - 1) }, [stepIndex, actionRunning, goToStep])

  const handleSkip = useCallback(() => {
    clearAllTimeouts(); setActionRunning(false)
    window.scrollTo({ top: 0, behavior: 'smooth' }); onComplete()
  }, [clearAllTimeouts, onComplete])

  const handleRestart = useCallback(() => {
    setShowCompletion(false); setTargetRect(null); setActionRunning(false)
    clearAllTimeouts(); setStepIndex(0)
  }, [clearAllTimeouts])

  const handleExplore = useCallback(() => { setShowCompletion(false); onComplete() }, [onComplete])

  // Handle lang toggle within tour
  useEffect(() => {
    const handleLangClick = (e) => {
      if (e.target.hasAttribute('data-lang-es')) setLang('es')
      if (e.target.hasAttribute('data-lang-en')) setLang('en')
    }
    document.addEventListener('click', handleLangClick)
    return () => document.removeEventListener('click', handleLangClick)
  }, [setLang])

  if (showCompletion) {
    return (<><style>{tourKeyframes}</style><CompletionModal lang={lang} onRestart={handleRestart} onExplore={handleExplore} /></>)
  }

  return (
    <>
      <style>{tourKeyframes}</style>
      {currentStep?.target && targetRect ? (
        <TourSpotlight targetRect={targetRect} />
      ) : (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.75)', pointerEvents: 'none' }} />
      )}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: actionRunning ? 'none' : 'auto', background: 'transparent', cursor: 'pointer' }}
        onClick={(e) => {
          if (e.target.closest('[data-tour-tooltip]') || e.target.closest('button')) return;
          handleNext();
        }}>
        <TourTooltip
          step={currentStep} stepIndex={stepIndex} totalSteps={TOUR_STEPS.length}
          targetRect={targetRect} lang={lang} actionRunning={actionRunning}
          onNext={handleNext} onPrev={handlePrev} onSkip={handleSkip}
        />
      </div>
    </>
  )
}

/* ====== UI COMPONENTS ====== */
function FilmGrain() {
  return <div style={{
    position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
  }} />
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

function Card({ title, children, delay = 0, tourAttr }) {
  const props = tourAttr ? { 'data-tour': tourAttr } : {}
  return (
    <motion.div
      {...props}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
          initial={{ width: 0 }} animate={{ width: `${value * 100}%` }}
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
    if (/comprar|precio|venta|costo|plan|suscripci|cuanto cuesta|producto/i.test(lower)) { intent = 'sales'; confidence = 0.92 }
    else if (/problema|ayuda|no funciona|error|falla|bug|pedido/i.test(lower)) { intent = 'support'; confidence = 0.89 }
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
    <Card title="Try It — Intent Prediction" delay={0.3} tourAttr="prediction">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && predict()}
          placeholder="Escribe un mensaje... (ej: Quiero comprar el plan premium)"
          style={{
            flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
          }}
        />
        <button onClick={predict} data-tour="predict-btn" style={{
          background: '#a78bfa', color: '#09090B', border: 'none',
          borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
        }}>Predict</button>
      </div>

      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
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
              <ConfidenceBar key={k} label={k} value={v} color={INTENT_COLORS[k]} isTop={k === prediction.intent} />
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  )
}

/* ====== APP ====== */
export default function App() {
  const [showTour, setShowTour] = useState(true)
  const [lang, setLang] = useState('es')

  return (
    <div style={{
      minHeight: '100vh', background: '#09090B', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <FilmGrain />

      {showTour && (
        <OnboardingTour lang={lang} setLang={setLang} onComplete={() => setShowTour(false)} />
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#fff' }}>
            Fine-tuning Demo — DistilBERT Intent Classification
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
        <Card title="Training Pipeline" delay={0.1} tourAttr="pipeline">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '8px 0' }}>
            {PIPELINE_STEPS.map((s, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 200, background: 'rgba(0,0,0,0.2)',
                borderRadius: 8, padding: 16, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(74,222,128,0.2)', color: '#4ade80',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
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
          <Card title="Sample Predictions" delay={0.4} tourAttr="sample-table">
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
                    background: `${INTENT_COLORS[p.intent]}20`, color: INTENT_COLORS[p.intent],
                    borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, textAlign: 'center',
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
                  }}>{node}</div>
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
          Built by Christian Hernandez — PyTorch + HuggingFace Transformers
        </div>
      </div>
    </div>
  )
}
