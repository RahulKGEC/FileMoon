axios.defaults.baseURL = SERVER

const getToken = ()=>{
    const options = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
        }
    }
    return options
}

const logout = ()=>{
    localStorage.clear()
    location.href = "/login"
}

window.onload = ()=>{
    fetchImage()
    showUserDetails()
    fetchFilesReport()
    fetchRecentFiles()
    fetchRecentShared()
}

const toast = new Notyf({
    position: {x: 'center', y: 'top'}
})

const showUserDetails = async ()=>{
    const session = await getSession()
    const fullname = document.getElementById("fullname")
    const email = document.getElementById("email")
    fullname.innerHTML = session.fullname
    email.innerHTML = session.email
}

const getSize = (size) => {
    const kb = size / 1000;
    const mb = kb / 1000;
    const gb = mb / 1000;
  
    if (gb >= 1) return gb.toFixed(2) + ' Gb';
    if (mb >= 1) return mb.toFixed(2) + ' Mb';
    if (kb >= 1) return kb.toFixed(2) + ' Kb';
    return size + ' B';
};
  

const fetchRecentFiles = async ()=>{
    try {
        const {data} = await axios.get("/api/file?limit=3", getToken())
        const recentFilesBox = document.getElementById("recent-files-box")
        for(let item of data)
        {   
            const ui = `
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="font-medium text-zinc-500 capitalize">${item.filename}</h1>
                        <small class="text-gray-500 text-sm">${getSize(item.size)}</small>
                    </div>
                    <p class="text-sm text-gray-600">${moment(item.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
                </div>
            `
            recentFilesBox.innerHTML += ui
        }
    }
    catch(err)
    {
        toast.error(err.response ? err.response.data.message : err.message)
    }
}

const fetchRecentShared = async ()=>{
    try {
        const {data} = await axios.get("/api/share?limit=3", getToken())
        const recentSharedBox = document.getElementById("recent-shared-box")
        for(let item of data)
        {
            const ui = `
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="font-medium text-zinc-500 capitalize">${item.file.filename}</h1>
                        <small class="text-gray-500 text-sm">${item.receiverEmail}</small>
                    </div>
                    <p class="text-sm text-gray-600">${moment(item.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
                </div>
            `
            recentSharedBox.innerHTML += ui
        }
    }
    catch(err)
    {
        toast.error(err.response ? err.response.data.message : err.message)
    }
}

const fetchFilesReport = async ()=>{
    try {
        const {data} = await axios.get("/api/dashboard", getToken())
        const reportCard = document.getElementById("report-card")
        for(let item of data)
        {
            const ui = `
                <div class="overflow-hidden relative bg-white rounded-lg shadow hover:shadow-lg h-40 flex items-center justify-center flex-col">
                    <h1 class="text-xl font-semibold text-gray-600 capitalize">${item._id.split("/")[0]}</h1>
                    <p class="text-4xl font-bold">${item.total}</p>
                    <div 
                        class="flex justify-center items-center w-[100px] h-[100px] rounded-full absolute top-7 -left-4"
                        style="background-image: linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%);"
                        >
                        <i class="ri-file-line text-4xl text-white"></i>
                    </div>
                </div>
            `
            reportCard.innerHTML += ui
        }
    }
    catch(err)
    {
        toast.error(err.response ? err.response.data.message : err.message)
    }
}

const uploadImage = ()=>{
    try {
        const input = document.createElement("input")
        const pic = document.getElementById("pic")
        input.type = "file"
        input.accept = "image/*"
        input.click()
    
        input.onchange = async ()=>{
            const file = input.files[0]
            const formData = new FormData()
            formData.append('picture', file)
            await axios.post("/api/profile-picture", formData, getToken())
            const url = URL.createObjectURL(file)
            pic.src = url
        }
    }
    catch(err)
    {
       toast.error(err.response ? err.response.data.message : err.message) 
    }
}

const fetchImage = async ()=>{
    try {
        const options = {
            responseType: 'blob',
            ...getToken()
        }
        const {data} = await axios.get("/api/profile-picture", options)
        const url = URL.createObjectURL(data)
        const pic = document.getElementById("pic")
        pic.src = url
    }   
    catch(err)
    {
        if(!err.response)
            return toast.error(err.message)

        const error = await (err.response.data).text()
        const {message} = JSON.parse(error)
        toast.error(message)
    }
}