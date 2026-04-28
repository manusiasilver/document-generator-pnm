@echo off
echo Starting Auto Doc Number Services...

echo Starting Backend...
start cmd /k "cd backend && npm start"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo All services started!
