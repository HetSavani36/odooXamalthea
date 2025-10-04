import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
// import "./seed.js"

const app = express()
dotenv.config({
    path: './.env'
})

// More permissive CORS configuration
app.use(cors({
    origin: true, // Allow all origins for now
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.get('origin') || 'no-origin'}`);
    next();
});


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import adminRouter from "./routes/admin.route.js";
import expenseRouter from "./routes/expense.route.js";
import dashboardRouter from "./routes/dashboard.route.js";

app.use("/api/auth",authRouter)
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);


app.use("/",(req,res)=>{
    res.send("404: Page Not Found")
})

export { app }