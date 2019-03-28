# Product Management System
An API driven Product Management System developed in Node and documented in Swagger. The system was designed to make managing product inventories robust while maintaining ease of use. 

## Installation
+ Clone the repository onto your local machine
+ Navigate into the folder with the project files
+ Run ```npm install``` in the command prompt/terminal. It should fetch the ```express```, ```joi``` and ```cors``` packages and install them locally. 
+ Your copy of the project should be good to go. Simply run ```node server.js``` to start an instance of the project.

## Features
### General
+ The system has stores item data as a ```Product```. Products have fields to describe different aspects of the item and these fields can be used to filter through the data
+ All Products have a ```basePrice``` and have to be assigned to a ```taxCategory``` which defines the GST rate applied on it. It is possible to give some Products a ```discount```. 
+ Products have to be assigned a ```Category``` to classify them and a Category can be assigned as a ```parent``` category for others. An example is **Office Supplies** being a parent category for **Paper** and **Stationary**
+ Inputs are validated by ```Joi``` and responses have informative messages 

### Data Manipulation
+ ```Product```s can be loaded into the system as a JSON object (via ```POST /product```) or as form data (via ```POST /product/{productSKU}```)
+ Categories can be added to the system in a similar manner via ```POST /category``` (JSON object) and ```POST /category/{categoryID}``` (form data)
+ Categories and Products can be modified via ```PUT /category``` and ```PUT /product``` respectively. The payload for these requests only need to contain the fields desired to be altered and the unique identifier (```productSKU    ``` or ```categoryID```).
+ Likewise ```DELETE /category/{categoryID}``` and ```DELETE /product/{productSKU}``` is used to remove products and categories from the database. Removing a category will remove *all child categories* (and recursively, their child categories and so on), all products associated with these categories and any other metadata linked to them.

### Searching
+ Fetching all subcategories of a category is a simple as calling ```GET /category/{categoryID}/getSubCategories``` and getting all products associated with a category is achieved by ```GET /category/{categoryID}/getProducts```
+ It is possible to discover other products similar to a product of choice. This can be done by ```GET /product/{productSKU}/getSimilar```
+ There are many endpoints which act as ```filters``` based on metadata of the products and most have variants to accept single queries and a list of queries. More detailed listing is in the Swagger documentation


### Computing Prices
+ The tax rate can be adjusted for each category and viewed via the ```/utils/taxRates``` set of endpoints
+ Items can be put on discount, discounts can be altered and removed via tha ```/utils/discounts``` family of endpoints
+ A detailed breakdown and calculation for the final price is obtained via ```POST /utils/calculateFinalPrice```

### Misc
+ ```/swagger``` fetches a copy of the ```swagger-spec.yaml``` file. It can be used to obtained detailed documentation of the various endpoints
+ ```/``` lists out the different endpoints available for the user

## Guide to view the Swagger Documentation
### Method 1
+ Go to ```https://editor.swagger.io/```
+ Replace any preexisting code there with the contents of ```swagger-spec.yaml```

A copy of the editor then saves itself in your browser's cache and it is able to run as an offline application. The only downside is that it may be harder for you to get it communicating with your locally hosted ```express``` app.

### Method 2
+ If you have ```Visual Studio Code``` installed, then get the ```Swagger Viewer``` extension and it'll set up a copy of Swagger Viewer right in your ```Code``` workspace. It should interact seamlessly with your locally hosted ```express``` app but is known to be a little buggy.

### Method 3
+ Install the npm package ```swagger-editor-dist```
+ Serve it as a static folder via an ```express``` app and you'll have a local version of ```Swagger Editor``` up and running