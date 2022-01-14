# GLENCOE RESTAURANT

> CRUD Restaurant Order Application With Node Js Server, Cart Functionality and Login/Register Functionality

## Files
* schema (Contains Order and User schema for the database)
* views
    * assets (Contains All Javascript, Images and CSS Files)
    * errors (Contains All Error Pages)
    * pages (Contains All Pages)
      * auth (Contains All Authentication Pages)
      * order (Contains All Order Pages)
      * restaurant (Contains All Restaurant Pages)
      * user (Contains All User Pages)
      * index.pug 
      * success.html
* database-initializer.js (Contains Database Initializer)
* package-lock.json
* package.json
* server.js


## About
In this assignment I have create a web application that authenticates users and allows them to create, read, update orders. It also makes use of the MongoDB database to store Data

## Getting Started

Node Package Used: pug, express, crypto, bycrypt, express-sessions, mongoodb, mongoose, connect-mongo

## Install

To be able to run the web application, you need to install the node modules

2. Install Node Modules
   ```sh
   npm install
3. Start the Server
   ```sh
   npm start
## Features

- Updates the Cart with Selected Procuts
- Implements Add to Cart and Remove from Cart
- Prompts user to checkeout when minimuim order amount has been reached
- Sends POST request and saves user order to Mongo Database
- Hashes User Password at Registration
- Stores User Information in Mongo Database
- Allows User to Login
- Allows User to Logout with error checking
- Allows User to Register
- Allows User to Update Profile

## Testing the Application

* Run the server with the following command:
```sh
npm start
```

* You should then see the homepage of the application as shown below:

![Image](https://i.ibb.co/zFkDyTJ/homepage.png "Home Page")

## Authentication (Login/Register)
* Open the browser and navigate to http://localhost:3000/
* You should see the following page:

![Image](https://i.ibb.co/r4wH0gJ/login.png "Login Page")

* Now you can login with the following credentials:

```
Username: harry
Password: harry
```

* Additionally, you can create your own user account by clicking the [Register](http://localhost:3000/register) button

* Registeration Page:

![Image](https://i.ibb.co/xDBBVRT/register.png "Registeration Page")


* At default, all users privacy settings are set to false

* Initially all users do not have any orders


## Ordering
* You can order using the following steps:
   - Login
   - Click the [Order](http://localhost:3000/home#restaurants) button
   - Select Restaurant
   - Select Products by clicking the add to cart button
   - Chceckout
* NOTE: You can only access restaurant Menu and Cart once you have logged in

## Viewing Orders

* Initially all users do not have any orders

* You can view your order history by clicking the profile button in the dropdown menu beside the username and you should see your order history

* When you click on the order,you will see the order details

* Sample page of orders:

![Image](https://i.ibb.co/VJQxKq8/orderpage.png "User Page")

* NOTE: If you're not logged in you will only be able to view order history of public users

## Updating Profile

* You can update your profile by clicking the profile button in the dropdown menu beside the username and you should see your profile as shown below

![Image](https://i.ibb.co/f8f7Jbv/userpage.png "User Page")


* You should then click the edit profile button to edit your profile

* You should then see an edit page like this:

![Image](https://i.ibb.co/Zhj6F7Z/edituser.png "Edit Page")


* NOTE: You can only update your profile if you are logged in. Also username and ID cannot be changed

* Here you can also change privacy settings

## Viewing Users

* You can view all users by clicking the [Users](http://localhost:3000/users) button

* NOTE: Only public users can be viewed

## Logging Out

* You can logout by clicking the [Logout](http://localhost:3000/logout) in the dropdown from you 

Done By: [Dami Adesola](https://damiadesola.github.io)