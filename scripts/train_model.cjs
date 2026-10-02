/**
 * OA Risk Model Training Script
 * 
 * Generates synthetic OA patient data based on clinical patterns,
 * then trains a Multi-Layer Perceptron using real gradient descent
 * (backpropagation with cross-entropy loss).
 * 
 * The learned weights are exported to src/domain/model_weights.json
 * for use by the browser-based inference engine.
 * 
 * Run: node scripts/train_model.cjs
 */

const fs = require('fs')
const path = require('path')

// ============================================================
// 1. SYNTHETIC DATA GENERATION (based on OA clinical literature)
// ============================================================

function generateDataset(n = 9000) {
  const data = []
  const rng = () => Math.random()
  const perClass = Math.floor(n / 3)

  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < perClass; i++) {
      // Target severity range for this class
      const severityMin = c === 0 ? 0.0 : c === 1 ? 0.33 : 0.62
      const severityMax = c === 0 ? 0.33 : c === 1 ? 0.62 : 1.0

      // Demographics (biased towards class-appropriate distributions)
      const ageBias = c === 0 ? 0 : c === 1 ? 10 : 20
      const age = Math.min(80, Math.max(30, 30 + ageBias + Math.floor(rng() * 40)))
      const sex = rng() < (0.45 + c * 0.07) ? 1 : 0
      const bmi = c === 2 ? 24 + rng() * 16 : 18 + rng() * 17
      const priorInjury = rng() < (0.08 + c * 0.12) ? 1 : 0
      const familyHistory = rng() < (0.15 + c * 0.10) ? 1 : 0

      // Severity is constrained to this class's range, with noise
      let severity = severityMin + rng() * (severityMax - severityMin)
      // Add slight noise but keep within bounds
      severity += (rng() - 0.5) * 0.08
      severity = Math.max(severityMin, Math.min(severityMax, severity))

    // Questionnaire answers driven by severity + noise
    const qAnswer = (maxVal, weight = 1.0) => {
      const raw = severity * weight + (rng() - 0.5) * 0.3
      return Math.max(0, Math.min(maxVal, Math.round(raw * maxVal)))
    }

    const pain_activity = qAnswer(3, 1.2)    // max 3
    const pain_rest = qAnswer(3, 0.9)        // max 3
    const stiffness = qAnswer(3, 1.0)        // max 3 (0, 2, 3 mapping)
    const limitation = qAnswer(3, 1.1)       // max 3
    const func = qAnswer(3, 1.0)             // max 3
    const swelling = qAnswer(2, 0.8)         // max 2
    const crepitus = qAnswer(2, 0.7)         // max 2
    const duration = qAnswer(2, 1.0)         // max 2

    // Movement data (ROM degrees) — lower ROM = more severe
    const baseRom = 140 - severity * 80 + (rng() - 0.5) * 30
    const rom = Math.max(20, Math.min(150, baseRom))
    const smoothness = Math.max(0, Math.min(1, 1 - severity * 0.7 + (rng() - 0.5) * 0.3))

    // Hardware sensor
    let hwRisk = severity + (rng() - 0.5) * 0.25
    hwRisk = Math.max(0, Math.min(1, hwRisk))

    // Ground truth label is the class we're generating for
    const label = c

    // Feature vector (11 features, all normalized 0–1)
    const features = [
      (age - 30) / 50,                    // 0: age normalized
      sex,                                // 1: sex
      Math.max(0, (bmi - 18) / 22),       // 2: BMI normalized
      priorInjury,                        // 3: prior injury
      familyHistory,                      // 4: family history
      pain_activity / 3,                  // 5: Q1 normalized
      pain_rest / 3,                      // 6: Q2 normalized
      stiffness / 3,                      // 7: Q3 normalized
      limitation / 3,                     // 8: Q4 normalized
      func / 3,                           // 9: Q5 normalized
      (rom - 20) / 130,                   // 10: ROM normalized (inverted — high ROM = low risk)
      smoothness,                         // 11: movement smoothness
      hwRisk,                             // 12: hardware sensor risk
    ]

    data.push({ features, label })
    }
  }
  return data
}

// ============================================================
// 2. NEURAL NETWORK — trained via backpropagation
// ============================================================

class MLP {
  constructor(inputSize, hiddenSizes, outputSize) {
    this.layers = []
    let prevSize = inputSize
    for (const hs of hiddenSizes) {
      this.layers.push({
        w: this._initWeights(prevSize, hs),
        b: new Array(hs).fill(0).map(() => (Math.random() - 0.5) * 0.1),
        // Store activations for backprop
        z: null, a: null,
      })
      prevSize = hs
    }
    // Output layer
    this.layers.push({
      w: this._initWeights(prevSize, outputSize),
      b: new Array(outputSize).fill(0).map(() => (Math.random() - 0.5) * 0.1),
      z: null, a: null,
    })
  }

  _initWeights(rows, cols) {
    // He initialization
    const std = Math.sqrt(2 / rows)
    const w = []
    for (let i = 0; i < rows; i++) {
      const row = []
      for (let j = 0; j < cols; j++) {
        row.push((Math.random() * 2 - 1) * std)
      }
      w.push(row)
    }
    return w
  }

  relu(x) { return Math.max(0, x) }
  reluDeriv(x) { return x > 0 ? 1 : 0 }

  softmax(arr) {
    const max = Math.max(...arr)
    const exps = arr.map(x => Math.exp(x - max))
    const sum = exps.reduce((a, b) => a + b, 0)
    return exps.map(x => x / sum)
  }

  forward(input) {
    let a = input
    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l]
      const isOutput = l === this.layers.length - 1
      const cols = layer.b.length

      const z = new Array(cols)
      for (let j = 0; j < cols; j++) {
        let sum = layer.b[j]
        for (let i = 0; i < a.length; i++) {
          sum += a[i] * layer.w[i][j]
        }
        z[j] = sum
      }
      layer.z = z

      if (isOutput) {
        layer.a = this.softmax(z)
      } else {
        layer.a = z.map(v => this.relu(v))
      }
      a = layer.a
    }
    return a
  }

  backward(input, label, lr) {
    // Forward pass first
    const output = this.forward(input)

    // Compute output layer gradient (softmax + cross-entropy)
    const outLayer = this.layers[this.layers.length - 1]
    const outputGrad = output.map((p, i) => p - (i === label ? 1 : 0))

    // Backprop through layers
    const grads = [outputGrad]
    for (let l = this.layers.length - 2; l >= 0; l--) {
      const nextLayer = this.layers[l + 1]
      const nextGrad = grads[0]
      const layer = this.layers[l]
      const grad = new Array(layer.b.length)

      for (let j = 0; j < layer.b.length; j++) {
        let sum = 0
        for (let k = 0; k < nextGrad.length; k++) {
          sum += nextGrad[k] * nextLayer.w[j][k]
        }
        grad[j] = sum * this.reluDeriv(layer.z[j])
      }
      grads.unshift(grad)
    }

    // Update weights and biases
    let prevA = input
    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l]
      const grad = grads[l]

      for (let j = 0; j < layer.b.length; j++) {
        layer.b[j] -= lr * grad[j]
        for (let i = 0; i < prevA.length; i++) {
          layer.w[i][j] -= lr * grad[j] * prevA[i]
        }
      }
      prevA = layer.a
    }

    // Return cross-entropy loss
    const loss = -Math.log(Math.max(1e-10, output[label]))
    return loss
  }

  predict(features) {
    const probs = this.forward(features)
    let best = 0
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[best]) best = i
    }
    return { probs, classIndex: best }
  }

  exportWeights() {
    return this.layers.map(l => ({
      w: l.w.map(row => row.map(v => parseFloat(v.toFixed(6)))),
      b: l.b.map(v => parseFloat(v.toFixed(6))),
    }))
  }
}

// ============================================================
// 3. TRAINING LOOP
// ============================================================

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function train() {
  console.log('=== OA Risk Model Training ===\n')

  // Generate data
  console.log('Generating 5000 synthetic patient records...')
  const dataset = generateDataset(5000)

  // Split: 80% train, 20% test
  shuffle(dataset)
  const splitAt = Math.floor(dataset.length * 0.8)
  const trainSet = dataset.slice(0, splitAt)
  const testSet = dataset.slice(splitAt)

  console.log(`Train: ${trainSet.length} samples | Test: ${testSet.length} samples`)
  console.log(`Features per sample: ${dataset[0].features.length}`)

  // Label distribution
  const dist = [0, 0, 0]
  dataset.forEach(d => dist[d.label]++)
  console.log(`Label distribution: Low=${dist[0]}, Moderate=${dist[1]}, Higher=${dist[2]}\n`)

  // Create model: 13 inputs -> 32 hidden -> 16 hidden -> 3 outputs
  const model = new MLP(13, [32, 16], 3)

  const epochs = 100
  const lr = 0.005

  console.log(`Architecture: 13 -> 32 (ReLU) -> 16 (ReLU) -> 3 (Softmax)`)
  console.log(`Training for ${epochs} epochs, learning rate = ${lr}\n`)

  for (let epoch = 1; epoch <= epochs; epoch++) {
    shuffle(trainSet)
    let totalLoss = 0

    for (const sample of trainSet) {
      totalLoss += model.backward(sample.features, sample.label, lr)
    }

    if (epoch % 5 === 0 || epoch === 1) {
      const avgLoss = totalLoss / trainSet.length

      // Test accuracy
      let correct = 0
      for (const sample of testSet) {
        const { classIndex } = model.predict(sample.features)
        if (classIndex === sample.label) correct++
      }
      const acc = (correct / testSet.length * 100).toFixed(1)

      console.log(`Epoch ${String(epoch).padStart(3)}  |  Loss: ${avgLoss.toFixed(4)}  |  Test Accuracy: ${acc}%`)
    }
  }

  // Final evaluation
  console.log('\n=== Final Evaluation ===')
  let correct = 0
  const confusion = [[0,0,0],[0,0,0],[0,0,0]]
  for (const sample of testSet) {
    const { classIndex } = model.predict(sample.features)
    if (classIndex === sample.label) correct++
    confusion[sample.label][classIndex]++
  }
  console.log(`Test Accuracy: ${(correct / testSet.length * 100).toFixed(1)}%`)
  console.log('\nConfusion Matrix (rows=actual, cols=predicted):')
  console.log('          Low   Mod   High')
  const labels = ['Low   ', 'Mod   ', 'High  ']
  confusion.forEach((row, i) => {
    console.log(`  ${labels[i]} ${row.map(v => String(v).padStart(5)).join(' ')}`)
  })

  // Export weights
  const weights = model.exportWeights()
  const outPath = path.join(__dirname, '..', 'src', 'domain', 'model_weights.json')
  fs.writeFileSync(outPath, JSON.stringify(weights, null, 2))
  console.log(`\nModel weights exported to: ${outPath}`)
  console.log(`File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`)
  console.log('\nDone! The app will now use these learned weights for inference.')
}

train()
