const jwt = require("jsonwebtoken")

const verifyToken = async (req, res)=>{
    try {
        const payload = await jwt.verify(req.body.token, process.env.JWT_SECRET)
        res.status(200).json(payload)
    }
    catch(err)
    {
        res.status(401).json({message: 'Invalid token'})
    }
}

module.exports = {
    verifyToken
}