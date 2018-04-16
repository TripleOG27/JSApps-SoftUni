let auth = (()=>{
    function isAuth() {
        return sessionStorage.getItem('authtoken')!==null
    }

    function saveSession(userData) {
        sessionStorage.setItem('authtoken',userData._kmd.authtoken)
        sessionStorage.setItem('username',userData.username)
        sessionStorage.setItem('userId',userData._id)
    }
    function register(username,password) {
        return remote.post('user','','basic',{username,password})
    }
    function login(username, password) {
        return remote.post('user','login','basic',{username,password})
    }
    function logout() {
        return remote.post('user','_logout','kinvey')
    }
    return{
        isAuth,
        login,
        logout,
        register,
        saveSession
    }
})()