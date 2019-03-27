const express = require('express')
const cors = require('cors')
const joi = require('joi')
const app = express()
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const portNum = 3000

const validators = {
    'category': {
        'categoryID': joi.number().integer().min(0).required(),
        'name': joi.string().default(null),
        'parentCategoryID': joi.number().integer().min(-1).default(null)
    },
    'productCreate': {
        'productSKU': joi.number().integer().min(0).required(),
        'name': joi.string().required(),
        'categoryID': joi.number().integer().min(0).required(),
        'keywords': joi.array().items(joi.string()).default([]),
        'brand': joi.string().required(),
        'color': joi.string().default(null),
        'modeOfSale': joi.string().valid(['online', 'offline', 'both']).required(),
        'basePrice': joi.number().min(0).required(),
        'taxCategoryID': joi.number().integer().min(0).required(),
        'imageURLs': joi.array().items(joi.string()).default([]),
        'stock': joi.number().integer().default(0),
        'status': joi.string().valid(['live', 'draft']).default('draft')
    },
    'productUpdate': {
        'productSKU': joi.number().integer().min(0).required(),
        'name': joi.string().default(null),
        'categoryID': joi.number().integer().min(0).default(null),
        'keywords': joi.array().items(joi.string()).default([]),
        'brand': joi.string().default(null),
        'color': joi.string().default(null),
        'modeOfSale': joi.string().valid(['online', 'offline', 'both']).default(null),
        'basePrice': joi.number().min(0).default(null),
        'taxCategoryID': joi.number().integer().min(0).default(null),
        'imageURLs': joi.array().items(joi.string()).default([]),
        'stock': joi.number().integer().default(0),
        'status': joi.string().valid(['live', 'draft']).default('draft')
    }
}

const messages = {
    'invalidURL': "You tried to access an invalid endpoint!",
    'invalidParameters': "Some parameters passed with the request are missing or invalid!",
    'invalidCatID': "No category exists with that ID!",
    'invalidParentCatID': "No parent category exists with that ID!",
    'invalidProdID': "No product exists with that ID!",
    'invalidTaxCategoryID': "No tax category with that ID exists!",
    'duplicateID': "An item with that ID already exists!",
    'opOK': 'The operation was successful!',
}

const listOfEndpoints = [
    '/', '/swagger',
    '/category', '/category/{categoryID}',
    '/product', '/product/{productSKU}'
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
        categoryID: 1,
        name: "Stationary",
        parentCategoryID: null
    },
    2: {
        categoryID: 2,
        name: "Writing Tools",
        parentCategoryID: 1
    },
    3: {
        categoryID: 3,
        name: "Paper",
        parentCategoryID: 1
    }
}

var products = {
    1: {
        productSKU: 1,
        name: "Ballpoint Pen",
        categoryID: 2,
        keywords: ['pen', 'writing'],
        brand: 'Qazwer Corp.',
        color: 'blue',
        modeOfSale: 'both',
        basePrice: 2,
        taxCategoryID: 1,
        imageURLs: [],
        stock: 2000,
        status: 'live'
    },
    2: {
        productSKU: 2,
        name: "Eraser",
        categoryID: 1,
        keywords: ['rubber'],
        brand: 'Qazwer Corp.',
        color: 'white',
        modeOfSale: 'offline',
        basePrice: 1,
        taxCategoryID: 0,
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

var orders = [
    {
        'status': 'placed',
        'items': {

            '2': 300,
            '1': 50
        }
    },
    {
        'status': 'placed',
        'items': {
            '1': 150
        }
    }
]

const getChildren = async function(parentID) {
    var children = []
    for(var category in categories) {
        if(categories[category]['parentCategoryID'] == parentID)
            children = children.concat(category)
    }
    return children
}

const getDecendants = async function(parentID) {
    const children = await getChildren(parentID)
    var decendants = children
    if (children) {
        for (var i=0; i<children.length; i++) {
            const result = await getDecendants(children[i])
            if (result) 
                decendants = decendants.concat(result)
        }
    }
    return decendants
}

app.get('/', (req, res) => {
    // Send a list of all valid endpoints
    res.send({'listOfEndpoints': listOfEndpoints})
})

app.get('/swagger', (req, res) => {
    // Serve the swagger spec file
    res.sendFile('swagger-spec.yaml', {root: __dirname})
})

app.get('/category/:categoryID', (req, res) => {
    // Get the details of a category
    var categoryID = req.params.categoryID
    if (categoryID) {
        // If valid parameters were passed
        if (categoryID in categories) {
            // If category exists send details
            res.send(categories[categoryID])
        } else {
            // Send resource not found
            res.status(404).send({
                'message': messages['invalidCatID'],
                'status': 'invalidCatID'
            })
        }
    } else {
        // Send invalid parameters
        res.status(400).send({
            'message': messages['invalidParameters'],
            'status': 'invalidParameters'
        })
    }
})

app.post('/category', (req, res) => {
    // Add a new category
    // Validate input provided 
    const result = joi.validate(req.body, validators['category'])
    
    if (result.error) {
        // If validation fails
        res.status(400).send({
            'message': result.error.details[0].message,
            'status': 'invalidParameters'
        })
    } else {
        if (result.value.name == null) {
            res.status(400).send({
                'message': messages['invalidParameters'],
                'status': 'invalidParameters'
            })
        } else if (result.value.categoryID in categories) {
            // If category exists with that ID
            res.status(400).send({
                'message': messages['duplicateID'],
                'status': 'duplicateID'
            })
        } else {
            if (result.value.parentCategoryID != null) {
                // If a parent category ID was provided
                if (!(result.value.parentCategoryID in categories)) {
                    // If parent category ID provided does not exist
                    return res.status(400).send({
                        'message': messages['invalidParentCatID'],
                        'status': 'invalidParentCatID'
                    })
                }
            }
            // Everything checks out, add the category
            categories[result.value.categoryID] = {
                'categoryID': result.value.categoryID,
                'name': result.value.name,
                'parentCategoryID': result.value.parentCategoryID
            }

            res.send({
                'message': messages['opOK'],
                'status': 'opOK'
            })
        }
    }
})

app.put('/category', (req, res) => {
    // Update a category
    // Validate input provided 
    const result = joi.validate(req.body, validators['category'])
    
    if (result.error) {
        // If validation fails
        res.status(400).send({
            'message': result.error.details[0].message,
            'status': 'invalidParameters'
        })
    } else {
        if (result.value.categoryID in categories) {
            // If the category ID exists
            if (result.value.parentCategoryID != null) {
                // If a parent category ID was provided
                if (result.value.parentCategoryID !== -1 && !(result.value.parentCategoryID in categories)) {
                    // If parent category ID provided does not exist
                    return res.status(400).send({
                        'message': messages['invalidParentCatID'],
                        'status': 'invalidParentCatID'
                    })
                }
            }
            // Everything checks out, update the category
            for(var key in req.body) {
                if (key === 'parentCategoryID') {
                    if (req.body[key] === -1) {
                        // To remove parent category from category information
                        categories[req.body.categoryID][key] = null
                        continue
                    }
                }
                // Change the passed fields
                categories[req.body.categoryID][key] = req.body[key]
            }
 
            res.send({
                'message': messages['opOK'],
                'status': 'opOK'
            })
        } else {
            // If category with category ID doesn't exist
            res.status(404).send({
                'message': messages['invalidCatID'],
                'status': 'invalidCatID'
            })
            
        }
    }
})

app.delete('/category/:categoryID', (req, res) => {
    // delete a category, all sub categories and their associated products
    var categoryID = req.params.categoryID
    if (categoryID) {
        // If valid parameters were passed
        if (categoryID in categories) {
            // If category exists, get all decendants of the category,
            // delete categories and associated products          
            getDecendants(categoryID)
            .then(decendants => {return decendants.concat(categoryID)})
            .then(toDelete => {
                for (var prodID in products) {
                    if (products[prodID]['categoryID'] in toDelete) {
                        delete products[prodID]
                    }
                }

                for (var i=0; i<toDelete.length; i++) {
                    delete categories[toDelete[i]]
                }

                return toDelete
            })
            .then(deleted => {
                res.send({
                    'message': messages['opOK'],
                    'status': 'opOK'
                })
            })
        } else {
            // Send resource not found
            res.status(404).send({
                'message': messages['invalidCatID'],
                'status': 'invalidCatID'
            })
        }
    } else {
        // Send invalid parameters
        res.status(400).send({
            'message': messages['invalidParameters'],
            'status': 'invalidParameters'
        })
    }
})

app.get('/product/:productSKU', (req, res) => {
    // Get the details of a product
    var productSKU = req.params.productSKU
    if (productSKU) {
        // If valid parameters were passed
        if (productSKU in products) {
            // If product exists send details
            res.send(products[productSKU])
        } else {
            // Send resource not found
            res.status(404).send({
                'message': messages['invalidProdID'],
                'status': 'invalidProdID'
            })
        }
    } else {
        // Send invalid parameters
        res.status(400).send({
            'message': messages['invalidParameters'],
            'status': 'invalidParameters'
        })
    }
})

app.post('/product', (req, res) => {
    // Add a new product
    // Validate input provided 
    const result = joi.validate(req.body, validators['productCreate'])
    
    if (result.error) {
        // If validation fails
        res.status(400).send({
            'message': result.error.details[0].message,
            'status': 'invalidParameters'
        })
    } else {
        if (result.value.productSKU in products) {
            // If product exists with that SKU
            res.status(400).send({
                'message': messages['duplicateID'],
                'status': 'duplicateID'
            })
        } else if (!(result.value.categoryID in categories)) {
            // If category ID provided does not exist
            res.status(400).send({
                'message': messages['invalidCatID'],
                'status': 'invalidCatID'
            })
        } else if (!(result.value.taxCategoryID in taxBrackets)) {
            // If tax category ID provided doesn't exist
            res.status(400).send({
                'message': messages['invalidTaxCategoryID'],
                'status': 'invalidTaxCategoryID'
            })
        } else {
            // Everything checks out, add the product
            products[result.value.productSKU] = {
                'productSKU': result.value.productSKU,
                'name': result.value.name,
                'categoryID': result.value.categoryID,
                'keywords': result.value.keywords,
                'brand': result.value.brand,
                'color': result.value.color,
                'modeOfSale': result.value.modeOfSale,
                'basePrice': result.value.basePrice,
                'taxCategoryID': result.value.taxCategoryID,
                'imageURLs': result.value.imageURLs,
                'stock': result.value.stock,
                'status': result.value.status
            }

            res.send({
                'message': messages['opOK'],
                'status': 'opOK'
            })
        }
    }
})

app.put('/product', (req, res) => {
    // Update a product
    // Validate input provided 
    const result = joi.validate(req.body, validators['productUpdate'])
    
    if (result.error) {
        // If validation fails
        res.status(400).send({
            'message': result.error.details[0].message,
            'status': 'invalidParameters'
        })
    } else {
        if (result.value.productSKU in products) {
            // If the product exists
            if (result.value.categoryID != null) {
                // If a category ID was provided
                if (!(result.value.categoryID in categories)) {
                    // If category ID provided does not exist
                    return res.status(400).send({
                        'message': messages['invalidCatID'],
                        'status': 'invalidCatID'
                    })
                }
            }
            if (result.value.taxCategoryID != null) {
                // If a tax category ID was provided
                if (!(result.value.taxCategoryID in taxBrackets)) {
                    // If tax category ID provided does not exist
                    return res.status(400).send({
                        'message': messages['invalidTaxCategoryID'],
                        'status': 'invalidTaxCategoryID'
                    })
                }
            }
            // Everything checks out, update the category
            for(var key in req.body) {
                // Change the passed fields
                products[req.body.productSKU][key] = req.body[key]
            }
 
            res.send({
                'message': messages['opOK'],
                'status': 'opOK'
            })
        } else {
            // If product with product ID doesn't exist
            res.status(404).send({
                'message': messages['invalidProdID'],
                'status': 'invalidProdID'
            })
            
        }
    }
})

app.delete('/product/:productSKU', (req, res) => {
    // Delete a product
    var productSKU = req.params.productSKU
    if (productSKU) {
        // If valid parameters were passed
        if (productSKU in products) {
            // If product exists, delete product          
            delete products[productSKU]
            res.send({
                'message': messages['opOK'],
                'status': 'opOK'
            })
        } else {
            // Send resource not found
            res.status(404).send({
                'message': messages['invalidProdID'],
                'status': 'invalidProdID'
            })
        }
    } else {
        // Send invalid parameters
        res.status(400).send({
            'message': messages['invalidParameters'],
            'status': 'invalidParameters'
        })
    }
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
