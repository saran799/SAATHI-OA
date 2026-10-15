/**
 * SAATHI Band BLE Service — Production Web Bluetooth implementation
 * for ESP32-C3 Mini with MPU6050.
 *
 * Handles full BLE GATT lifecycle, Android Chrome connection quirks,
 * telemetry decoding, stage-specific diagnostic error reporting,
 * and genuine sensor state tracking.
 */

export const BLE_DEVICE_NAME = 'Saathi-Band'
export const BLE_SERVICE_UUID = 'b5a1c0de-0001-4a7e-9d3c-5aa7b1000001'
export const BLE_CHARACTERISTIC_UUID = 'b5a1c0de-0002-4a7e-9d3c-5aa7b1000001'

export type SensorState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'ready'
  | 'calibrating'
  | 'calibrated'
  | 'error'

export type ConnectionStage =
  | 'idle'
  | 'checking_support'
  | 'requesting_device'
  | 'connecting_gatt'
  | 'discovering_service'
  | 'discovering_characteristic'
  | 'subscribing_notifications'
  | 'ready'
  | 'disconnected'
  | 'error'

export type RiskCategory = 'LOW' | 'MID' | 'HIGH'

export interface BleReading {
  raw: string
  active: boolean // true only when activityCode === 1
  activityCode: 0 | 1
  riskCategory: RiskCategory
  timestamp: number
}

export type ParseResult =
  | { valid: true; reading: BleReading }
  | { valid: false; reason: string; raw: string }

export interface BleErrorInfo {
  stage: ConnectionStage
  errorName: string
  message: string
  diagnosticTip: string
  timestamp: number
}

export interface MovementSample {
  t: number
  angle: number
}

export interface SensorAdapter {
  connect(onState: (s: SensorState) => void, opts?: { fail?: boolean }): () => void
  disconnect(): void
  getState(): SensorState
  getStage(): ConnectionStage
  getDevice(): any
  getServer?(): any
  getCharacteristic?(): any
  getLatestReading(): BleReading | null
  getReadings(): BleReading[]
  clearReadings(): void
  getErrorInfo(): BleErrorInfo | null
  getErrorMessage(): string | null
  onNotification(cb: (reading: BleReading) => void): () => void
  calibrate(onProgress: (pct: number) => void, onDone: (ok: boolean) => void, opts?: { fail?: boolean }): () => void
  startAssessment(
    onSample: (s: MovementSample) => void,
    onRep: (n: number) => void,
    onComplete?: (data: any) => void,
    opts?: { durationSec?: number; noMovement?: boolean }
  ): () => void
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Diagnostic error mapper. Identifies the exact stage of failure and
 * provides specific, actionable troubleshooting guidance for Android Chrome.
 */
export function createBleErrorInfo(stage: ConnectionStage, error: any): BleErrorInfo {
  const errorName = error?.name || 'Error'
  const message = error?.message || String(error)
  let diagnosticTip = ''

  switch (stage) {
    case 'checking_support':
      diagnosticTip = 'Web Bluetooth is not supported in this browser. Please open in Google Chrome on an Android device or PC with Bluetooth enabled.'
      break
    case 'requesting_device':
      if (errorName === 'NotFoundError') {
        diagnosticTip = 'Device selection was cancelled. Make sure the SAATHI Band is powered on and tap Connect to choose "Saathi-Band".'
      } else if (errorName === 'SecurityError') {
        diagnosticTip = 'Bluetooth permission was denied. Please allow Nearby Devices / Bluetooth permission in Android Chrome site settings.'
      } else {
        diagnosticTip = 'Failed to scan for Bluetooth devices. Check that Bluetooth and Location are turned on in your Android settings.'
      }
      break
    case 'connecting_gatt':
      if (errorName === 'NetworkError') {
        diagnosticTip = 'GATT connection failed (Android status 133). Turn the band off and on, ensure no other phone is connected to it, and tap Retry.'
      } else {
        diagnosticTip = 'Could not establish connection with Saathi-Band. Ensure the band is in close proximity and tap Retry.'
      }
      break
    case 'discovering_service':
      diagnosticTip = `Primary service (${BLE_SERVICE_UUID}) could not be resolved on the device. Confirm that the ESP32-C3 firmware has registered this exact UUID.`
      break
    case 'discovering_characteristic':
      diagnosticTip = `Characteristic (${BLE_CHARACTERISTIC_UUID}) could not be found. Confirm characteristic registration in firmware.`
      break
    case 'subscribing_notifications':
      diagnosticTip = 'Failed to subscribe to live BLE notifications. Verify that the band characteristic has NOTIFY or INDICATE enabled in its GATT descriptor.'
      break
    default:
      diagnosticTip = 'An unexpected Bluetooth error occurred. Try disconnecting and tapping Retry.'
  }

  return {
    stage,
    errorName,
    message,
    diagnosticTip,
    timestamp: Date.now()
  }
}

/**
 * Strict parser for actual ESP32-C3 SAATHI Band notifications.
 * Valid examples: '1,LOW', '1,MID', '1,HIGH', '0,LOW'.
 * Rejects any malformed or unexpected payloads without guessing or converting to fake LOW.
 */
export function parseBlePayload(rawText: string): ParseResult {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return { valid: false, reason: 'Empty or non-string notification', raw: String(rawText) }
  }

  // Strip line endings and outer whitespace
  const clean = rawText.replace(/[\r\n]+/g, '').trim()
  const parts = clean.split(',').map(s => s.trim())

  if (parts.length !== 2) {
    return { valid: false, reason: `Expected 2 comma-separated values, received ${parts.length}`, raw: clean }
  }

  const [actStr, riskStr] = parts

  if (actStr !== '0' && actStr !== '1') {
    return { valid: false, reason: `Invalid activity code: "${actStr}". Expected "0" or "1"`, raw: clean }
  }
  const activityCode: 0 | 1 = actStr === '1' ? 1 : 0
  const active = activityCode === 1

  const normalizedRisk = riskStr.toUpperCase()
  if (normalizedRisk !== 'LOW' && normalizedRisk !== 'MID' && normalizedRisk !== 'HIGH') {
    return { valid: false, reason: `Invalid risk category: "${riskStr}". Expected "LOW", "MID", or "HIGH"`, raw: clean }
  }

  return {
    valid: true,
    reading: {
      raw: clean,
      active,
      activityCode,
      riskCategory: normalizedRisk,
      timestamp: Date.now()
    }
  }
}

export function parseBleNotification(rawText: string): BleReading | null {
  const result = parseBlePayload(rawText)
  return result.valid ? result.reading : null
}

export class WebBluetoothSensor implements SensorAdapter {
  private device: any = null
  private server: any = null
  private characteristic: any = null

  private state: SensorState = 'disconnected'
  private stage: ConnectionStage = 'idle'
  private errorInfo: BleErrorInfo | null = null

  private stateListeners: Set<(s: SensorState) => void> = new Set()
  private stageListeners: Set<(st: ConnectionStage) => void> = new Set()
  private readingListeners: Set<(r: BleReading) => void> = new Set()

  private latestReading: BleReading | null = null
  private readings: BleReading[] = []
  private currentAssessmentReadings: BleReading[] = []
  private assessmentActive = false

  // Store bound handler references to prevent duplicate listeners
  private boundDisconnectHandler: (() => void) | null = null
  private boundNotificationHandler: ((event: any) => void) | null = null

  // Optional custom Bluetooth provider for automated mock testing
  private customBluetoothProvider: any = null

  constructor(customBluetoothProvider?: any) {
    if (customBluetoothProvider) {
      this.customBluetoothProvider = customBluetoothProvider
    }
  }

  public setBluetoothProvider(provider: any) {
    this.customBluetoothProvider = provider
  }

  public getState(): SensorState {
    return this.state
  }

  public getStage(): ConnectionStage {
    return this.stage
  }

  public getDevice(): any {
    return this.device
  }

  public getServer(): any {
    return this.server
  }

  public getCharacteristic(): any {
    return this.characteristic
  }

  public getLatestReading(): BleReading | null {
    return this.latestReading
  }

  public getReadings(): BleReading[] {
    return [...this.readings]
  }

  public clearReadings(): void {
    this.readings = []
    this.currentAssessmentReadings = []
    this.latestReading = null
  }

  public getErrorInfo(): BleErrorInfo | null {
    return this.errorInfo
  }

  public getErrorMessage(): string | null {
    return this.errorInfo ? `${this.errorInfo.errorName}: ${this.errorInfo.message}` : null
  }

  private setStage(newStage: ConnectionStage) {
    this.stage = newStage
    this.stageListeners.forEach(listener => {
      try { listener(newStage) } catch (e) { console.error(e) }
    })
  }

  private setState(newState: SensorState, errorInfo?: BleErrorInfo) {
    this.state = newState
    if (errorInfo) {
      this.errorInfo = errorInfo
      this.setStage('error')
    } else if (newState !== 'error') {
      this.errorInfo = null
    }

    this.stateListeners.forEach(listener => {
      try { listener(newState) } catch (e) { console.error(e) }
    })
  }

  public onNotification(cb: (reading: BleReading) => void): () => void {
    this.readingListeners.add(cb)
    return () => { this.readingListeners.delete(cb) }
  }

  public onStageChange(cb: (st: ConnectionStage) => void): () => void {
    this.stageListeners.add(cb)
    return () => { this.stageListeners.delete(cb) }
  }

  private getBluetooth(): any {
    if (this.customBluetoothProvider) return this.customBluetoothProvider
    if (typeof navigator !== 'undefined' && (navigator as any).bluetooth) {
      return (navigator as any).bluetooth
    }
    return null
  }

  public connect(onState: (s: SensorState) => void, _opts?: { fail?: boolean }): () => void {
    this.stateListeners.add(onState)

    // Prevent duplicate connection attempts if already connected & ready
    if (this.state === 'ready' && this.device?.gatt?.connected) {
      onState('ready')
      return () => { this.stateListeners.delete(onState) }
    }

    // If currently in progress, do not spawn parallel connect sequences
    if (this.state === 'connecting') {
      return () => { this.stateListeners.delete(onState) }
    }

    ;(async () => {
      let currentStage: ConnectionStage = 'checking_support'
      try {
        this.setStage('checking_support')
        const bluetooth = this.getBluetooth()
        if (!bluetooth) {
          throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome or Edge over HTTPS.')
        }

        this.setState('connecting')

        currentStage = 'requesting_device'
        this.setStage('requesting_device')

        const device = await bluetooth.requestDevice({
          filters: [{ name: BLE_DEVICE_NAME }],
          optionalServices: [BLE_SERVICE_UUID]
        })

        if (!device) {
          throw new Error('No Bluetooth device was returned by chooser.')
        }

        // Clean up previous device if exists
        this.cleanupDeviceListeners()
        this.device = device

        // Register disconnect listener
        this.boundDisconnectHandler = () => {
          console.warn('[BLE] Physical disconnection detected from Saathi-Band')
          this.setState('disconnected')
          this.setStage('disconnected')
        }
        device.addEventListener('gattserverdisconnected', this.boundDisconnectHandler)

        currentStage = 'connecting_gatt'
        this.setStage('connecting_gatt')

        // Connect GATT with Android-tuned retry loop
        const server = await this.connectGattWithRetry(device, 3)
        this.server = server
        this.setState('connected')

        // Brief settling delay on Android to allow Fluoride stack to populate service cache
        await wait(250)

        currentStage = 'discovering_service'
        this.setStage('discovering_service')

        let service: any = null
        try {
          service = await server.getPrimaryService(BLE_SERVICE_UUID)
        } catch (svcErr: any) {
          let discovered: string[] = []
          try {
            const svcs = await server.getPrimaryServices()
            discovered = svcs.map((s: any) => s.uuid)
          } catch {}
          throw new Error(
            `Primary service (${BLE_SERVICE_UUID}) not found. ` +
            (discovered.length > 0 ? `Device services: [${discovered.join(', ')}]` : svcErr?.message || '')
          )
        }

        currentStage = 'discovering_characteristic'
        this.setStage('discovering_characteristic')

        const characteristic = await service.getCharacteristic(BLE_CHARACTERISTIC_UUID)
        this.characteristic = characteristic

        currentStage = 'subscribing_notifications'
        this.setStage('subscribing_notifications')

        // Verify characteristic capabilities
        const props = characteristic.properties || {}
        if (!props.notify && !props.indicate) {
          throw new Error(`Characteristic ${BLE_CHARACTERISTIC_UUID} does not support notifications or indications`)
        }

        // Clean previous notification handler if any
        if (this.boundNotificationHandler) {
          characteristic.removeEventListener('characteristicvaluechanged', this.boundNotificationHandler)
        }

        // Attach listener BEFORE starting notifications to catch initial packet
        this.boundNotificationHandler = (event: any) => {
          this.handleCharacteristicValueChanged(event)
        }
        characteristic.addEventListener('characteristicvaluechanged', this.boundNotificationHandler)

        await characteristic.startNotifications()

        currentStage = 'ready'
        this.setStage('ready')
        this.setState('ready')
      } catch (err: any) {
        console.error(`[BLE] Connection error at stage [${currentStage}]:`, err)
        const info = createBleErrorInfo(currentStage, err)
        this.setState('error', info)
      }
    })()

    return () => {
      this.stateListeners.delete(onState)
    }
  }

  /**
   * Android GATT Connect with retry and backoff (handles status 133).
   */
  private async connectGattWithRetry(device: any, maxAttempts = 3): Promise<any> {
    let lastError: any = null
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (device.gatt?.connected) {
          return device.gatt
        }
        const server = await device.gatt.connect()
        if (server && server.connected) {
          return server
        }
      } catch (err: any) {
        lastError = err
        console.warn(`[BLE] GATT connection attempt ${attempt}/${maxAttempts} failed:`, err?.message || err)
        if (attempt < maxAttempts) {
          await wait(350 * attempt)
        }
      }
    }
    throw lastError || new Error(`GATT connection failed after ${maxAttempts} attempts`)
  }

  private handleCharacteristicValueChanged(event: any) {
    try {
      const value: DataView = event.target?.value
      if (!value) return

      const decoder = new TextDecoder('utf-8')
      const text = decoder.decode(value)

      const result = parseBlePayload(text)
      if (!result.valid) {
        console.warn('[BLE] Discarded invalid notification payload:', result.reason, 'raw:', result.raw)
        return
      }

      const reading = result.reading
      this.latestReading = reading
      this.readings.push(reading)
      if (this.assessmentActive) {
        this.currentAssessmentReadings.push(reading)
      }

      this.readingListeners.forEach(listener => {
        try { listener(reading) } catch (e) { console.error(e) }
      })
    } catch (err) {
      console.error('[BLE] Notification parse error:', err)
    }
  }

  private cleanupDeviceListeners() {
    try {
      if (this.characteristic && this.boundNotificationHandler) {
        this.characteristic.removeEventListener('characteristicvaluechanged', this.boundNotificationHandler)
      }
      if (this.device && this.boundDisconnectHandler) {
        this.device.removeEventListener('gattserverdisconnected', this.boundDisconnectHandler)
      }
    } catch (e) {
      console.warn('[BLE] Error cleaning up device listeners:', e)
    }
  }

  public disconnect(): void {
    try {
      this.cleanupDeviceListeners()
      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect()
      }
    } catch (e) {
      console.warn('[BLE] Disconnect error:', e)
    } finally {
      this.device = null
      this.server = null
      this.characteristic = null
      this.boundDisconnectHandler = null
      this.boundNotificationHandler = null
      this.setStage('disconnected')
      this.setState('disconnected')
    }
  }

  public calibrate(onProgress: (pct: number) => void, onDone: (ok: boolean) => void, _opts?: { fail?: boolean }): () => void {
    const isReady = this.state === 'ready' && !!this.device?.gatt?.connected
    onProgress(100)
    onDone(isReady)
    return () => {}
  }

  public startAssessment(
    onSample: (s: MovementSample) => void,
    onRep: (n: number) => void,
    onComplete?: (data: any) => void,
    _opts?: { durationSec?: number; noMovement?: boolean }
  ): () => void {
    this.assessmentActive = true
    this.currentAssessmentReadings = []
    const startTime = Date.now()

    const unsubscribe = this.onNotification((reading) => {
      onRep(reading.activityCode)
      onSample({ t: (reading.timestamp - startTime) / 1000, angle: 0 })
    })

    return () => {
      this.assessmentActive = false
      unsubscribe()

      const readings = [...this.currentAssessmentReadings]
      const activeCount = readings.filter(r => r.active).length

      let predominantRisk: RiskCategory = 'LOW'
      if (readings.length > 0) {
        const highCount = readings.filter(r => r.riskCategory === 'HIGH').length
        const midCount = readings.filter(r => r.riskCategory === 'MID').length
        const lowCount = readings.filter(r => r.riskCategory === 'LOW').length

        if (highCount >= midCount && highCount >= lowCount && highCount > 0) predominantRisk = 'HIGH'
        else if (midCount >= lowCount && midCount > 0) predominantRisk = 'MID'
        else predominantRisk = 'LOW'
      }

      const assessmentData = {
        deviceName: BLE_DEVICE_NAME,
        connected: !!this.device?.gatt?.connected,
        RiskLevel: predominantRisk,
        StepHistory: readings.map(r => r.riskCategory),
        readingsCount: readings.length,
        activeCount,
        readings: readings,
        rawReadings: readings.map(r => r.raw),
        latestNotification: this.latestReading?.raw || null,
        durationSec: Math.max(1, Math.round((Date.now() - startTime) / 1000))
      }

      if (onComplete) {
        onComplete(assessmentData)
      }
    }
  }
}

export const sensor: SensorAdapter = new WebBluetoothSensor()
