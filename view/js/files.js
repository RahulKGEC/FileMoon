axios.defaults.baseURL = SERVER

window.onload = ()=>{
    fetchFiles()
    fetchImage()
}

const getToken = ()=>{
    const options = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
        }
    }
    return options
}

const toast = new Notyf({
    position: {x: 'center', y: 'top'}
})

const logout = ()=>{
    localStorage.clear()
    location.href = "/login"
}

const toggleDrawer = ()=>{
    const drawer = document.getElementById("drawer")
    const rightValue = drawer.style.right
    
    if(rightValue === "0px")
    {
        drawer.style.right = "-33.33%"
    }
    else {
        drawer.style.right = "0px"
    }
}


const uploadFile = async (e)=>{
    e.preventDefault()
    const uploadButton = document.getElementById("upload-btn")

    try {
        const progress = document.getElementById("progress")
        const form = e.target
        const formdata = new FormData(form)

        // Validating file size
        const file = formdata.get('file')
        const size = getSize(file.size)
        if(size > 200)
            return toast.error("File size too large max size 200Mb allowed")


        const options = {
            onUploadProgress: (e)=>{
                const loaded = e.loaded
                const total = e.total
                const percentageValue = Math.floor((loaded*100)/total)
                progress.style.width = percentageValue+'%'
                progress.innerHTML = percentageValue+'%'
            },
            ...getToken()
        }
        uploadButton.disabled = true
        const {data} = await axios.post('/api/file', formdata, options)
        toast.success(`${data.filename} has been uploaded !`)
        fetchFiles()
        progress.style.width = 0
        progress.innerHTML = ''
        form.reset()
        toggleDrawer()
    }
    catch(err)
    {
        toast.error(err.response ? err.response.data.message : err.message)
    }
    finally {
        uploadButton.disabled = false
    }
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
  

const fetchFiles = async ()=>{
    try {
        const {data} = await axios.get('/api/file', getToken())
        const table = document.getElementById("files-table")
        table.innerHTML = ""
        for(let file of data)
        {
            const ui = `
                <tr class="text-gray-500 border-b border-gray-100">
                    <td class="py-4 pl-6 capitalize">${file.filename}</td>
                    <td class="capitalize">${file.type}</td>
                    <td>${getSize(file.size)}</td>
                    <td>${moment(file.createdAt).format('DD MMM YYYY, hh:mm A')}</td>
                    <td>
                        <div class="space-x-3">
                            <button class="bg-rose-400 px-2 py-1 text-white hover:bg-rose-600 rounded" onclick="deleteFile('${file._id}', this)"> 
                                <i class="ri-delete-bin-4-line"></i>
                            </button>

                            <button class="bg-green-400 px-2 py-1 text-white hover:bg-green-500 rounded" onclick="downloadFile('${file._id}', '${file.filename}', this)"> 
                                <i class="ri-download-line"></i>
                            </button>

                            <button class="bg-amber-400 px-2 py-1 text-white hover:bg-amber-600 rounded" onclick="openModalForShare('${file._id}', '${file.filename}')"> 
                                <i class="ri-share-line"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `
            table.innerHTML += ui
        }
    }   
    catch(err)
    {
        toast.error(err.response ? err.response.data.message : err.message)
    }
}

const deleteFile = async (id, button)=>{
    try {
        button.innerHTML = '<i class="fa fa-spinner fa-spin"></i>'
        button.disabled = true
        await axios.delete(`/api/file/${id}`, getToken())
        toast.success("File deleted !")
        fetchFiles()
    }
    catch(err)
    {
        toast.error(err.response ? err.response.data.message : err.message)
    }
    finally {
        button.innerHTML = '<i class="ri-delete-bin-4-line"></i>'
        button.disabled = false
    }
}

const downloadFile = async (id, filename, button)=>{
    try {
        button.innerHTML = '<i class="fa fa-spinner fa-spin"></i>'
        button.disabled = true
        const options = {
            responseType: 'blob',
            ...getToken()
        }
        const {data} = await axios.get(`/api/file/download/${id}`, options)
        const ext = data.type.split("/").pop()
        const url = URL.createObjectURL(data)
        const a = document.createElement("a")
        a.href = url
        a.download = `${filename}.${ext}`
        a.click()
        a.remove()
    }
    catch(err)
    {
        if(!err.response)
            return toast.error(err.message)

        const error = await (err.response.data).text()
        const {message} = JSON.parse(error)
        toast.error(message)
    }
    finally {
        button.innerHTML = '<i class="ri-download-line"></i>'
        button.disabled = false
    }
}

const openModalForShare = (id, filename)=>{
    new Swal({
        showConfirmButton: false,
        html: `
            <form class="text-left flex flex-col gap-6" onsubmit="shareFile('${id}', event)">
                <h1 class="font-medium text-black text-2xl">Email id</h1>
                <input type="email" required class="border border-gray-300 w-full p-3 rounded" placeholder="mail@gmail.com" name="email" />
                <button id="send-button" class="bg-indigo-400 hover:bg-indigo-500 text-white rounded py-3 px-8 w-fit font-medium">Send</button>
                <div class="flex items-center gap-2">
                    <p class="text-gray-500">You are sharing - </p>
                    <p class="text-green-400 font-medium">${filename}</p>
                </div>
            </form>
        `
    })
}

const shareFile = async (id, e)=>{
    const sendButton = document.getElementById("send-button")
    const form = e.target

    try {
        e.preventDefault()
        sendButton.disabled = true
        sendButton.innerHTML = `
            <i class="fa fa-spinner fa-spin mr-2"></i>
            Processing
        `
        const email = form.elements.email.value.trim()
        const payload = {
            email: email,
            fileId: id
        }
        await axios.post('/api/share', payload, getToken())
        toast.success("File sent successfully !")
    }
    catch(err)
    {
        toast.error(err.response ? err.response.data.message : err.message)
    }
    finally {
        Swal.close()
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