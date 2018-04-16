let remote = (()=>{
    const baseUrl = 'https://baas.kinvey.com/'
    const APP_KEY = 'kid_HyHTfRenM'
    const APP_SECRET = '4ec95d4eb9d744c9ab99e34d97f250b9'


    function makeAuthentication(auth) {
        if(auth==='basic'){
            return `Basic ${btoa(APP_KEY +':'+APP_SECRET)}`
        }else {
            return `Kinvey ${sessionStorage.getItem('authtoken')}`
        }
    }

    //request method(Get,Post,Put)
    //kinvey module(user,appdata)
    //url endmodule
    //authentication
    function makeRequest(method,module,endpoint,auth) {
        return{
            url: baseUrl+module+'/'+APP_KEY+'/'+endpoint,
            method:method,
            headers:{
                'Authorization':makeAuthentication(auth)
            }
        }
    }
    function get(module,endpoint,auth) {
        return $.ajax(makeRequest('GET',module,endpoint,auth))
    }
    function post(module,endpoint,auth,data) {
        let obj = makeRequest('POST',module,endpoint,auth)
        obj["data"] = data
        return $.ajax(obj)
    }
    function update(module,endpoint,auth,data) {
        let obj = makeRequest('PUT',module,endpoint,auth)
        if(data){
            obj["data"]=data}
        return $.ajax(obj)
    }
    function remove(module,endpoint,auth) {
        return $.ajax(makeRequest('DELETE',module,endpoint,auth))
    }
    return{
        get,
        post,
        update,
        remove
    }
})()