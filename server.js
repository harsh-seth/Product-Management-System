const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.send('Product Management API')
})

app.get('/hello', (req, res) => {
    res.send({
        "message": "Hello, " + req.query.name + "!"
    })
})

app.post('/hello', (req, res) => {
    res.send({
        "message": "Hello, " + (req.body.name || "Stranger") + "!"
    })
})

app.listen(3000)
console.log("Server is up at 3000")