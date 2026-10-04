# SAATHI-OA Run Procedure

Follow this exact sequence to boot up the application, backend services, and sensor hardware smoothly.

### 1. Sensor Booting (Laptop 2)
- Boot up the sensor on the secondary laptop.
- Start the sensor stream software.

### 2. Local PHC Environment (Laptop 1)
To run the dashboard and local services, start the following processes in your terminal:
- **Backend API (Cannot GET /):** Run `npm run server:dev` (This handles API/TTS routes and might show "Cannot GET /" in the browser, which is expected).
- **PHC Dashboard App:** Run `npm run dev` to start the frontend application.

### 3. Vercel
- Verify that the frontend is deployed and active on Vercel.

### 4. Neon Database
- Log into Neon and ensure the database is **active**. Check for suspension and wake it up if necessary.

### 5. Render Backend
- Render free tiers sleep after inactivity. Ping or visit your Render backend URL to activate it.

### 6. Ngrok Setup (Laptop 2)
- Run **ngrok** on the secondary laptop to expose the sensor stream to the internet.
- Copy the generated ngrok URL and update any necessary `.env` files or settings in your frontend to connect to the sensor.
