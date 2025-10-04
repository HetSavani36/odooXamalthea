#!/bin/bash

# Script to start both servers reliably

echo "🚀 Starting ExpenseFlow Servers..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set cleanup trap
trap cleanup SIGINT SIGTERM

# Start backend
echo "📡 Starting Backend Server (Port 8000)..."
cd /Users/harmitjetani/Documents/GitHub/odooXamalthea/Backend
node index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server (Port 5173)..."
cd /Users/harmitjetani/Documents/GitHub/odooXamalthea/Frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📡 Backend: http://localhost:8000"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID