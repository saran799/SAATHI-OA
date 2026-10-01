# SAATHI-OA Run Procedure

Follow these steps in order to fully boot up the application, backend services, and sensor hardware.

### 1. Sensor Hardware Setup (Laptop 2)
- Boot up the sensor on the secondary laptop.
- Start the sensor stream.
- Run **ngrok** on the secondary laptop to expose the sensor stream to the internet.
- Note down the generated ngrok URL.

### 2. Database & Cloud Services Check
- **Neon Database:** Log into Neon and ensure the database is **active** (not suspended). If it is suspended, wake it up.
- **Render Backend:** Render free tiers sleep after inactivity. Ping or visit your Render backend URL (`https://saathi-oa.onrender.com/api/health`) to wake it up.
- **Vercel Frontend:** Verify that the frontend is deployed and active on Vercel.

### 3. Running the Local PHC Environment (Laptop 1)
To run the dashboard and local services, start the following processes in your terminal:

**A. Local Backend API** (The server that might show "Cannot GET /" in the browser but handles API/TTS routes):
```bash
npm run server:dev
```

**B. PHC Dashboard / Frontend App:**
```bash
npm run dev
```
*(If running a separate PHC dashboard folder, navigate to it and run `npm run dev` there).*

### 4. Final Verification
- Update any necessary `.env` files in your frontend with the new **ngrok URL** from step 1 (if required for the camera/sensor integration).
- Open the local dashboard link (e.g., `http://localhost:5173`).
- Ensure the app successfully authenticates, pulls data from the Neon DB, and connects to the sensor stream.
