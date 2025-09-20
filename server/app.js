
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin:process.env.CORS_URL,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) //Limit for how much json data will allowed one time.
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

export default app
