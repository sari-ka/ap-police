Server run instructions

- Install dependencies:

```powershell
cd server
npm install
```

- Create or update `.env` in `server/` with at least:

```
PORT=6100
MONGO_URL=<your MongoDB connection string>
```

- Start server:

```powershell
cd server
npm start
```

Notes:
- The server serves static uploads from the `uploads/` directory.
- If you want hot reload during development, install `nodemon` globally and run `nodemon server.js`.
