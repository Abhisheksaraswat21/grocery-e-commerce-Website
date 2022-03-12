function auth(req, res, next) {

    //login hai to aage process krega
    if(req.isAuthenticated()) {
        return next()
    }
    //wrna login page pe bhej dega
    return res.redirect('/login')
}

module.exports = auth