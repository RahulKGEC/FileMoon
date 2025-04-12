const dotenv = require("dotenv")
dotenv.config()

const mongoose = require("mongoose")
mongoose.connect(process.env.DB)

const root = process.cwd()
const express = require("express")
const path = require("path")
const {v4: uniqueId} = require("uuid")

const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req, file, next)=>{
        next(null, 'files/')
    },
    filename: (req, file, next)=>{
        const nameArr = file.originalname.split(".")
        const ext = nameArr.pop()
        const name = `${uniqueId()}.${ext}`
        next(null, name)
    }
})
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 200 * 1000 * 1000
    }
})

const { signup, login, updateImage, fetchImage } = require("./controller/user.controller")
const { createFile, fetchFiles, deleteFile, downloadFile } = require("./controller/file.controller")
const { fetchDashboard } = require("./controller/dashboard.controller")
const { verifyToken } = require("./controller/token.controller")
const { shareFile, fetchShared } = require("./controller/share.controller")
const AuthMiddleware = require("./middleware/auth.middleware")
const app = express()
app.listen(process.env.PORT || 8080)

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static("view"))

// Ui endpoint
const getPath = (filename)=>{
    return path.join(root, "view", filename)
}

app.get("/signup", (req, res)=>{
    const p = getPath("signup.html")
    res.sendFile(p)
})

app.get("/login", (req, res)=>{
    const p = getPath("index.html")
    res.sendFile(p)
})

app.get("/", (req, res)=>{
    const p = getPath("index.html")
    res.sendFile(p)
})

app.get("/dashboard", (req, res)=>{
    const p = getPath("app/dashboard.html")
    res.sendFile(p)
})

app.get("/history", (req, res)=>{
    const p = getPath("app/history.html")
    res.sendFile(p)
})

app.get("/files", (req, res)=>{
    const p = getPath("app/files.html")
    res.sendFile(p)
})

// Api endpoint
app.post('/api/signup', signup)
app.post('/api/login', login)
app.post('/api/profile-picture', AuthMiddleware, upload.single('picture'), updateImage)
app.get('/api/profile-picture', AuthMiddleware, fetchImage)
app.post('/api/file', AuthMiddleware, upload.single('file'), createFile)
app.get('/api/file', AuthMiddleware, fetchFiles)
app.delete('/api/file/:id', AuthMiddleware, deleteFile)
app.get('/api/file/download/:id', downloadFile)
app.get('/api/dashboard', AuthMiddleware, fetchDashboard)
app.post('/api/token/verify', verifyToken)
app.post('/api/share', AuthMiddleware, shareFile)
app.get('/api/share', AuthMiddleware, fetchShared)

// Not found
app.use((req, res)=>{
    res.status(404).json({message: 'Endpoint not found'})
})