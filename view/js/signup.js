axios.defaults.baseURL = SERVER

const toast = new Notyf({
    position: {x: 'center', y: 'top'}
})

const checkSession = async ()=>{
    const session = await getSession()
    
    if(session)
        location.href = "/dashboard"
}

checkSession()

const signup = async (e)=>{
    try {
        e.preventDefault()
        const form = e.target
        const elements = form.elements
        const payload = {
            fullname: elements.fullname.value,
            email: elements.email.value,
            mobile: elements.mobile.value,
            password: elements.password.value
        }
        
        const {data} = await axios.post('/api/signup', payload)
        form.reset()
        toast.success(data.message)
        setTimeout(()=>{
            location.href = "/login"
        }, 2000)
    }
    catch(err)
    {
        toast.error(err.response ? err.response.data.message : err.message)
    }
}