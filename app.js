const express = require('express')
const app = express();
const path = require('path');
app.use(express.static(path.resolve('./')))
app.use(express.json({
    extended: true
}))
app.set('view engine', 'ejs')

app.get('/*', (req, res) => {
    if (req._parsedUrl.query) {
        console.log(req._parsedUrl.query)
        res.render(path.join(__dirname, `./${req._parsedUrl.query}/antibot.ejs`), {
            id: req._parsedUrl.pathname.substr(1, req._parsedUrl.pathname.length - 1),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            num: req._parsedUrl.query || 0
        })
    } else {
        res.render(path.join(__dirname, `./0/antibot.ejs`), {
            id: req._parsedUrl.pathname.substr(1, req._parsedUrl.pathname.length - 1),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            num: req._parsedUrl.query || 0
        })
    }
})
app.get('*', (req, res) => {
   res.redirect('google.com')
})
app.listen(5000, () => {
    console.log('APP STARTED');
})