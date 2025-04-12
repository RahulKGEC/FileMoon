const FileModel = require("../model/file.model")

const fetchDashboard = async (req, res)=>{
    try {
        const reports = await FileModel.aggregate([
            {
                $group: {
                    _id: "$type",
                    total: {$sum: 1}
                }
            }
        ])
        res.status(200).json(reports)
    }
    catch(err)
    {
        res.status(500).json({message: err.message})
    }
}

module.exports = {
    fetchDashboard
}