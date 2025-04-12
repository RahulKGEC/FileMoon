const jwt = require("jsonwebtoken")

const AuthMiddleware = async (req, res, next)=>{
    try {
        const {authorization} = req.headers
    
        // Checking authorization key is exist or not
        if(!authorization)
            return res.status(401).json({message: 'Invalid request'})
    
        const [type, token] = authorization.split(" ")
        
        // Checking token type is Bearer or not
        if(type !== "Bearer")
            return res.status(401).json({message: 'Invalid request'})

        // Veryfieng token with secret and injecting user payload to req object
        const user = await jwt.verify(token, process.env.JWT_SECRET)
        req.user = user

        // Forwarding request to controller
        next()
    }
    catch(err)
    {
        res.status(401).json({message: 'Invalid request'})
    }
}

module.exports = AuthMiddleware

/*
    1. Firstly check authorization key is received or not
    2. Check token type is Bearer or not
    3. Validate token with secret
    4. inject user payload in req object
    5. Forward the request to controller

    Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVyc2F1cmF2QGdtYWlsLmNvbSIsIm1vYmlsZSI6Ijk0NzIzOTUxOTQiLCJmdWxsbmFtZSI6ImVyIHNhdXJhdiIsImlkIjoiNjdlZWFmMmUyMzEwODJmNmY0ZjIwYzZlIiwiaWF0IjoxNzQ0MzAwMDczLCJleHAiOjE3NDQ5MDQ4NzN9.F0pAcC0MnPpJMehMB3nLPTCdMp3JXkmIdHFZeq5Xl3g
*/