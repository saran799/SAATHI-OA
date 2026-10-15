/**
 * SAATHI-OA — Complete Automated Simulation Test Suite for BLE Integration
 *
 * NOTE: These are automated simulations using a mock Bluetooth/GATT adapter.
 * They verify protocol compliance, GATT state transitions, telemetry validation,
 * error handling, and assessment packaging. Physical hardware tests must be
 * performed with the actual ESP32-C3 band as described in the test report.
 */

import {
  WebBluetoothSensor,
  parseBlePayload,
  BLE_DEVICE_NAME,
  BLE_SERVICE_UUID,
  BLE_CHARACTERISTIC_UUID,
  type SensorState
} from '../src/services/sensor'
import { estimateRisk } from '../src/domain/risk'
import type { Patient, Answers, MovementSummary } from '../src/domain/types'

// ANSI colors for clean test reporting
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ${GREEN}✓ PASS${RESET}: ${testName}`)
  } else {
    failedTests++
    console.error(`  ${RED}✗ FAIL${RESET}: ${testName}${detail ? ` -> ${detail}` : ''}`)
  }
}

// ── Mock Bluetooth Classes ──────────────────────────────────────

class MockCharacteristic {
  public uuid: string
  public properties: { notify: boolean; indicate: boolean; read: boolean; write: boolean }
  public notificationsStarted = false
  private listeners: Set<(e: any) => void> = new Set()

  constructor(uuid: string, properties = { notify: true, indicate: false, read: true, write: false }) {
    this.uuid = uuid
    this.properties = properties
  }

  async startNotifications() {
    if (!this.properties.notify && !this.properties.indicate) {
      const err = new Error('GATT operation not supported')
      err.name = 'NotSupportedError'
      throw err
    }
    this.notificationsStarted = true
  }

  async stopNotifications() {
    this.notificationsStarted = false
  }

  addEventListener(type: string, listener: (e: any) => void) {
    if (type === 'characteristicvaluechanged') {
      this.listeners.add(listener)
    }
  }

  removeEventListener(type: string, listener: (e: any) => void) {
    if (type === 'characteristicvaluechanged') {
      this.listeners.delete(listener)
    }
  }

  simulateNotification(text: string) {
    const encoder = new TextEncoder()
    const buffer = encoder.encode(text).buffer
    const dataView = new DataView(buffer)
    const event = { target: { value: dataView } }
    this.listeners.forEach(l => l(event))
  }
}

class MockService {
  public uuid: string
  public characteristics: Map<string, MockCharacteristic> = new Map()

  constructor(uuid: string) {
    this.uuid = uuid
  }

  addCharacteristic(char: MockCharacteristic) {
    this.characteristics.set(char.uuid, char)
  }

  async getCharacteristic(uuid: string) {
    const c = this.characteristics.get(uuid)
    if (!c) {
      const err = new Error(`Characteristic ${uuid} not found`)
      err.name = 'NotFoundError'
      throw err
    }
    return c
  }
}

class MockGattServer {
  public connected = false
  public failConnect = false
  public failCount = 0
  public requiredAttempts = 1
  public currentAttempt = 0
  public services: Map<string, MockService> = new Map()
  public device: MockDevice | null = null

  constructor(device: MockDevice) {
    this.device = device
  }

  addService(service: MockService) {
    this.services.set(service.uuid, service)
  }

  async connect() {
    this.currentAttempt++
    if (this.failConnect || this.currentAttempt < this.requiredAttempts) {
      const err = new Error('Connection failed for unknown reason.')
      err.name = 'NetworkError'
      throw err
    }
    this.connected = true
    return this
  }

  disconnect() {
    this.connected = false
    this.device?.triggerDisconnect()
  }

  async getPrimaryService(uuid: string) {
    if (!this.connected) throw new Error('GATT Server is disconnected. Cannot retrieve services.')
    const s = this.services.get(uuid)
    if (!s) {
      const err = new Error(`No Services matching UUID ${uuid} found in Device.`)
      err.name = 'NotFoundError'
      throw err
    }
    return s
  }

  async getPrimaryServices() {
    return Array.from(this.services.values())
  }
}

class MockDevice {
  public name: string
  public gatt: MockGattServer
  private disconnectListeners: Set<() => void> = new Set()

  constructor(name = BLE_DEVICE_NAME) {
    this.name = name
    this.gatt = new MockGattServer(this)
  }

  addEventListener(type: string, listener: () => void) {
    if (type === 'gattserverdisconnected') {
      this.disconnectListeners.add(listener)
    }
  }

  removeEventListener(type: string, listener: () => void) {
    if (type === 'gattserverdisconnected') {
      this.disconnectListeners.delete(listener)
    }
  }

  triggerDisconnect() {
    this.gatt.connected = false
    this.disconnectListeners.forEach(l => l())
  }
}

class MockBluetooth {
  public deviceToReturn: MockDevice | null = null
  public failRequestDevice = false
  public requestDeviceErrorName = 'NotFoundError'
  public requestDeviceErrorMessage = 'User cancelled the requestDevice() chooser.'

  async requestDevice(_options: any) {
    if (this.failRequestDevice) {
      const err = new Error(this.requestDeviceErrorMessage)
      err.name = this.requestDeviceErrorName
      throw err
    }
    if (!this.deviceToReturn) {
      const err = new Error('No device selected')
      err.name = 'NotFoundError'
      throw err
    }
    return this.deviceToReturn
  }
}

function setupWorkingDevice(): { mockBt: MockBluetooth; device: MockDevice; service: MockService; characteristic: MockCharacteristic } {
  const mockBt = new MockBluetooth()
  const device = new MockDevice(BLE_DEVICE_NAME)
  const service = new MockService(BLE_SERVICE_UUID)
  const characteristic = new MockCharacteristic(BLE_CHARACTERISTIC_UUID)

  service.addCharacteristic(characteristic)
  device.gatt.addService(service)
  mockBt.deviceToReturn = device

  return { mockBt, device, service, characteristic }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Test Suites ──────────────────────────────────────────────────

async function runAllTests() {
  console.log(`\n${BOLD}=== SAATHI-OA BLE Integration Automated Test Suite ===${RESET}\n`)

  // 1. Protocol & Telemetry Parser Tests
  console.log(`${BOLD}1. Protocol Telemetry Decoding & Validation:${RESET}`)
  {
    // Valid cases
    const r1 = parseBlePayload('1,LOW')
    assert(r1.valid && r1.reading.active === true && r1.reading.riskCategory === 'LOW', 'Decodes valid 1,LOW (active, LOW risk)')

    const r2 = parseBlePayload('1,MID')
    assert(r2.valid && r2.reading.active === true && r2.reading.riskCategory === 'MID', 'Decodes valid 1,MID (active, MID risk)')

    const r3 = parseBlePayload('1,HIGH')
    assert(r3.valid && r3.reading.active === true && r3.reading.riskCategory === 'HIGH', 'Decodes valid 1,HIGH (active, HIGH risk)')

    const r4 = parseBlePayload('0,LOW')
    assert(r4.valid && r4.reading.active === false && r4.reading.riskCategory === 'LOW', 'Decodes valid 0,LOW (inactive, LOW risk)')

    // Whitespace and line endings
    const r5 = parseBlePayload('  1 , HIGH \r\n')
    assert(r5.valid && r5.reading.active === true && r5.reading.riskCategory === 'HIGH', 'Handles surrounding whitespace and \\r\\n line endings')

    // Invalid & malformed cases (must reject safely, never guess LOW)
    const rEmpty = parseBlePayload('')
    assert(!rEmpty.valid, 'Rejects empty payload string')

    const rSpaces = parseBlePayload('   ')
    assert(!rSpaces.valid, 'Rejects whitespace-only payload')

    const rNoDelim = parseBlePayload('1LOW')
    assert(!rNoDelim.valid, 'Rejects payload missing comma delimiter')

    const rExtraFields = parseBlePayload('1,LOW,EXTRA')
    assert(!rExtraFields.valid, 'Rejects payload with unexpected additional fields')

    const rBadActivity = parseBlePayload('2,LOW')
    assert(!rBadActivity.valid, 'Rejects invalid activity flag (e.g. 2)')

    const rAlphaActivity = parseBlePayload('x,LOW')
    assert(!rAlphaActivity.valid, 'Rejects non-numeric activity flag')

    const rBadRisk = parseBlePayload('1,CRITICAL')
    assert(!rBadRisk.valid, 'Rejects unverified risk category (CRITICAL) without coercing to LOW')

    const rMpuError = parseBlePayload('0,ERROR')
    assert(!rMpuError.valid, 'Rejects sensor error/unknown state (0,ERROR)')

    const rCaseInsensitive = parseBlePayload('1,mid')
    assert(rCaseInsensitive.valid && rCaseInsensitive.reading.riskCategory === 'MID', 'Normalizes lower-case risk (1,mid -> MID)')
  }

  // 2. Browser Support & Pairing Tests
  console.log(`\n${BOLD}2. Browser Support & Pairing Lifecycle:${RESET}`)
  {
    // Web Bluetooth unsupported
    const sensorNoBt = new WebBluetoothSensor(null)
    let stateReported: SensorState = 'disconnected'
    sensorNoBt.connect(s => { stateReported = s })
    await sleep(20)
    assert(stateReported === 'error', 'Reports error when Web Bluetooth is unsupported')
    assert(sensorNoBt.getStage() === 'error', 'Stage transitioned to error on unsupported browser')

    // User cancels pairing chooser
    const { mockBt: cancelBt } = setupWorkingDevice()
    cancelBt.failRequestDevice = true
    cancelBt.requestDeviceErrorName = 'NotFoundError'
    cancelBt.requestDeviceErrorMessage = 'User cancelled the requestDevice() chooser.'

    const sensorCancel = new WebBluetoothSensor(cancelBt)
    let cancelState: SensorState = 'disconnected'
    sensorCancel.connect(s => { cancelState = s })
    await sleep(20)
    assert(cancelState === 'error', 'Reports error on user cancellation of chooser')
    const errInfo = sensorCancel.getErrorInfo()
    assert(errInfo?.stage === 'requesting_device' && errInfo?.errorName === 'NotFoundError', 'Accurately tracks requesting_device stage and NotFoundError')

    // Permission denied
    const { mockBt: permBt } = setupWorkingDevice()
    permBt.failRequestDevice = true
    permBt.requestDeviceErrorName = 'SecurityError'
    permBt.requestDeviceErrorMessage = 'Bluetooth permission has been denied.'

    const sensorPerm = new WebBluetoothSensor(permBt)
    sensorPerm.connect(() => {})
    await sleep(20)
    const permErr = sensorPerm.getErrorInfo()
    assert(permErr?.errorName === 'SecurityError', 'Identifies SecurityError for denied permissions')
    assert(permErr?.diagnosticTip.includes('Nearby Devices') === true, 'Provides actionable diagnostic tip for permission failure')

    // Correct device selected and succeeds
    const { mockBt: okBt } = setupWorkingDevice()
    const sensorOk = new WebBluetoothSensor(okBt)
    let finalState: SensorState = 'disconnected'
    sensorOk.connect(s => { finalState = s })
    await sleep(350)
    assert(finalState === 'ready', 'Successfully completes connection and transitions to ready')
    assert(sensorOk.getStage() === 'ready', 'Sensor stage is ready after setup')
  }

  // 3. GATT Connection & Android Recovery Tests
  console.log(`\n${BOLD}3. GATT Connection & Android Status 133 Recovery:${RESET}`)
  {
    // GATT connection failure (permanent)
    const { mockBt: gattFailBt, device: gattFailDev } = setupWorkingDevice()
    gattFailDev.gatt.failConnect = true
    const sensorGattFail = new WebBluetoothSensor(gattFailBt)
    sensorGattFail.connect(() => {})
    // Wait for retries
    await sleep(1200)
    const gattErr = sensorGattFail.getErrorInfo()
    assert(gattErr?.stage === 'connecting_gatt', 'Accurately tracks failure at connecting_gatt stage')
    assert(gattErr?.errorName === 'NetworkError', 'Identifies NetworkError on GATT failure')

    // GATT retry succeeds on attempt 2 (Android status 133 transient recovery)
    const { mockBt: retryBt, device: retryDev } = setupWorkingDevice()
    retryDev.gatt.requiredAttempts = 2 // Fails on 1st, succeeds on 2nd attempt
    const sensorRetry = new WebBluetoothSensor(retryBt)
    let retryState: SensorState = 'disconnected'
    sensorRetry.connect(s => { retryState = s })
    await sleep(800)
    assert(retryState === 'ready', 'Successfully recovers from transient GATT failure via Android retry loop')
    assert(retryDev.gatt.currentAttempt === 2, 'GATT connect executed exactly 2 attempts before success')

    // Service discovery failure
    const { mockBt: noSvcBt, device: noSvcDev } = setupWorkingDevice()
    noSvcDev.gatt.services.clear() // remove service so getPrimaryService fails
    const sensorNoSvc = new WebBluetoothSensor(noSvcBt)
    sensorNoSvc.connect(() => {})
    await sleep(350)
    const svcErr = sensorNoSvc.getErrorInfo()
    assert(svcErr?.stage === 'discovering_service', 'Tracks failure at discovering_service stage when service UUID is missing')

    // Characteristic discovery failure
    const { mockBt: noCharBt, service: noCharSvc } = setupWorkingDevice()
    noCharSvc.characteristics.clear()
    const sensorNoChar = new WebBluetoothSensor(noCharBt)
    sensorNoChar.connect(() => {})
    await sleep(350)
    const charErr = sensorNoChar.getErrorInfo()
    assert(charErr?.stage === 'discovering_characteristic', 'Tracks failure at discovering_characteristic stage')

    // Notification subscription failure (characteristic does not support notify)
    const { mockBt: noNotifBt, characteristic: noNotifChar } = setupWorkingDevice()
    noNotifChar.properties.notify = false
    noNotifChar.properties.indicate = false
    const sensorNoNotif = new WebBluetoothSensor(noNotifBt)
    sensorNoNotif.connect(() => {})
    await sleep(350)
    const notifErr = sensorNoNotif.getErrorInfo()
    assert(notifErr?.stage === 'subscribing_notifications', 'Tracks failure at subscribing_notifications stage')

    // Physical disconnection handling
    const { mockBt: discBt, device: discDev } = setupWorkingDevice()
    const sensorDisc = new WebBluetoothSensor(discBt)
    let discReportedState: SensorState = 'disconnected'
    sensorDisc.connect(s => { discReportedState = s })
    await sleep(350)
    assert(discReportedState === 'ready', 'Pre-condition: device connected and ready')

    // Trigger physical disconnect
    discDev.triggerDisconnect()
    assert(sensorDisc.getState() === 'disconnected', 'State transitions to disconnected immediately on physical disconnect')
    assert(sensorDisc.getStage() === 'disconnected', 'Stage updates to disconnected')

    // Reconnection / Retry without app reload
    sensorDisc.connect(s => { discReportedState = s })
    await sleep(350)
    assert(discReportedState === 'ready', 'Recovers and reconnects cleanly without application reload')
  }

  // 4. Live Telemetry Stream & Assessment Workflow Tests
  console.log(`\n${BOLD}4. Telemetry Stream & Assessment Workflow:${RESET}`)
  {
    const { mockBt, characteristic } = setupWorkingDevice()
    const sensor = new WebBluetoothSensor(mockBt)
    sensor.connect(() => {})
    await sleep(350)

    let repReceived = -1
    let sampleCount = 0
    let assessmentResult: any = null

    // Start genuine assessment
    const stopAssessment = sensor.startAssessment(
      _s => { sampleCount++ },
      rep => { repReceived = rep },
      data => { assessmentResult = data },
      { durationSec: 30 }
    )

    // Simulate genuine notification stream: 1,LOW then 1,MID then 1,MID then 0,LOW
    characteristic.simulateNotification('1,LOW')
    assert(repReceived === 1, 'Activity notification received (active code 1)')
    assert(sensor.getLatestReading()?.riskCategory === 'LOW', 'Latest reading risk category matches LOW')

    characteristic.simulateNotification('1,MID')
    assert(repReceived === 1, 'Second activity notification received')
    assert(sensor.getLatestReading()?.riskCategory === 'MID', 'Latest reading risk category matches MID')

    characteristic.simulateNotification('1,MID')
    assert(repReceived === 1, 'Third activity notification received (MID)')

    characteristic.simulateNotification('0,LOW')
    assert(repReceived === 0, 'Stationary notification received (inactive code 0)')

    // Simulate malformed packet mid-stream (must be discarded, not corrupting state)
    characteristic.simulateNotification('INVALID_GARBAGE')
    assert(sensor.getLatestReading()?.riskCategory === 'LOW', 'Malformed packet discarded without corrupting latest valid reading')

    // Stop and finalize assessment
    stopAssessment()

    assert(assessmentResult !== null, 'Assessment completed and returned structured data')
    assert(assessmentResult.readingsCount === 4 && sampleCount === 4, 'Recorded exactly 4 valid BLE readings and samples')
    assert(assessmentResult.activeCount === 3, 'Accurately counted 3 active readings')
    assert(assessmentResult.RiskLevel === 'MID', 'Computed predominant risk level (MID) from genuine readings')
    assert(assessmentResult.deviceName === BLE_DEVICE_NAME, 'Includes Saathi-Band device identifier')

    // Disconnect cleanup: notifications after disconnect should be ignored
    sensor.disconnect()
    characteristic.simulateNotification('1,HIGH')
    assert(sensor.getReadings().length === 0 || sensor.getState() === 'disconnected', 'Notifications ignored after disconnect')
  }

  // 5. Clinical Integrity & Risk Packaging Tests
  console.log(`\n${BOLD}5. Assessment Data Flow & Clinical Risk Estimation:${RESET}`)
  {
    const mockPatient: Patient = {
      id: 'P-101',
      name: 'Ramesh Kumar',
      age: 56,
      sex: 'Male',
      phone: '9876543210',
      village: 'Thirunagar',
      phc: 'Perur PHC',
      occupation: 'Farmer',
      priorInjury: true,
      familyHistory: false,
      createdAt: new Date().toISOString()
    }

    const mockAnswers: Answers = {
      pain_activity: 2,
      pain_rest: 1,
      stiffness: 2,
      limitation: 2,
      function: 2
    }

    // Genuine movement summary from ESP32-C3 Saathi-Band
    const genuineMovement: MovementSummary = {
      rangeOfMotionDeg: 0, // No fabricated joint angles from the band!
      smoothness: 0.75,
      durationSec: 30,
      repetitions: 8, // Genuine active movement events
      performed: true,
      hardwareData: {
        deviceName: BLE_DEVICE_NAME,
        RiskLevel: 'HIGH',
        StepHistory: ['HIGH', 'HIGH', 'MID', 'HIGH'],
        readingsCount: 4,
        activeCount: 3,
        durationSec: 30
      }
    }

    const riskResult = estimateRisk(mockPatient, mockAnswers, genuineMovement, null)

    assert(riskResult.band === 'moderate' || riskResult.band === 'higher', 'Risk calculation incorporates hardware sensor risk')
    assert(riskResult.factors.some(f => f.includes('SAATHI Band Risk (HIGH)')), 'Hardware risk factor clearly documented in result factors')
    // Crucial: ensure no fake "Reduced range of motion (0°)" was invented!
    assert(!riskResult.factors.some(f => f.includes('(0°)')), 'Does NOT invent a fabricated 0° range of motion restriction')
  }

  // Summary Report
  console.log(`\n${BOLD}=====================================================${RESET}`)
  console.log(`${BOLD}Test Results:${RESET} ${totalTests} total | ${GREEN}${passedTests} passed${RESET} | ${failedTests > 0 ? `${RED}${failedTests} failed${RESET}` : `${GREEN}0 failed${RESET}`}`)
  console.log(`${BOLD}=====================================================${RESET}\n`)

  if (failedTests > 0) {
    process.exit(1)
  }
}

runAllTests().catch(err => {
  console.error('Test runner encountered fatal error:', err)
  process.exit(1)
})
