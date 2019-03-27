const express = require('express')
const cors = require('cors')
const joi = require('joi')
const app = express()
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const portNum = 3000

const validators = {
    
}

const messages = {
    'invalidURL': "You tried to access an invalid endpoint!"
}

const listOfEndpoints = [
    '/', '/swagger'
]

var taxBrackets = {
    0: 0,
    1: 0.02,
    2: 0.05,
    3: 0.08, 
    4: 0.12,
    5: 0.18,
    6: 0.24
}

var categories = {
    1: {
        name: "Stationary",
        childrenCategoryIds: [2],
    },
    2: {
        name: "Writing Tools",
        childrenCategoryIds: []
    },
    3: {
        name: "Paper",
        childrenCategoryIds: []
    }
}

var products = {
    1: {
        productSKU: 1,
        name: "Ballpoint Pen",
        categoryId: 2,
        keywords: ['pen', 'writing'],
        brand: 'Qazwer Corp.',
        color: 'blue',
        modeOfSale: 'both',
        basePrice: 2,
        taxCategoryId: 1,
        imageURLs: [],
        stock: 2000,
        status: 'live'
    },
    2: {
        productSKU: 2,
        name: "Eraser",
        categoryId: 1,
        keywords: ['rubber'],
        brand: 'Qazwer Corp.',
        color: 'white',
        modeOfSale: 'offline',
        basePrice: 1,
        taxCategoryId: 0,
        imageURLs: [],
        stock: 500,
        status: 'live'
    }
}

var discounts = {
    'product': {
        2: 0.1
    },
    'categories': {
        1: 0.2
    }
}

app.get('/', (req, res) => {
    res.send({'listOfEndpoints': listOfEndpoints})
})

app.get('/swagger', (req, res) => {
    res.sendFile('swagger-spec.yaml', {root: __dirname})
})

app.get('*', (req, res) => {
    res.status(404).send({
        'message': messages['invalidURL'],
        'status': 'invalidURL'
    })
})

app.post('*', (req, res) => {
    res.status(404).send({
        'message': messages['invalidURL'],
        'status': 'invalidURL'
    })
})

app.listen(portNum, () => {
    console.log("Server is up at port", portNum)
})
