/* 
    Name: Oluwadamilola Adesola
    CU-ID: 101182761
    COMP 2406: Assignment 4
    SERVER FILE
*/
const express = require('express');
const crypto = require('crypto');
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const User = require("./schema/userModel");
const Order = require("./schema/orderModel");
const MongoStore = require('connect-mongo');
let app = express();

app.use('/views', express.static('views'));
app.use('/img', express.static('views/assets/img'));

app.use(express.json());

const jsonInFolder = fs.readdirSync('./restaurants').filter(file => path.extname(file) === '.json');

let restaurants = [];

// JSON Data Initialization
jsonInFolder.forEach(file => {
    let restaurantData = require('./restaurants/' + file);
    let tempData = [];
    let url = (restaurantData.name).replace(/\s+/g, '-').toLowerCase()
    let jsonName = file;
    tempData.push(restaurantData.name);
    tempData.push(restaurantData.delivery_fee);
    tempData.push(restaurantData.min_order);
    tempData.push(url);
    tempData.push(jsonName);
    tempData.push(restaurantData.id);
    restaurants.push(tempData);
});

// Initialize Sessions
app.use(
    session({
        store: MongoStore.create({
            mongoUrl: "mongodb+srv://test:12345@glencoe-cluster.xmhow.mongodb.net/GlencoeRestaurants?retryWrites=true&w=majority",
            collectionName: "sessions",
            ttl: 24 * 60 * 60, // 1 day
            autoRemove: 'native',

        }),
        name: 'user-session',
        secret: crypto.randomBytes(64).toString('hex'),
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        }
    })
);

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

// JSON DATA
function getJsonData() {
    let data = {};
    for (let i = 0; i < restaurants.length; i++) {
        let jsonData = require('./restaurants/' + restaurants[i][4]);
        data[restaurants[i][0]] = jsonData;
    }
    return data;
}


/// URLS
app.route(["/home", "/"]).get(function (req, res) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.send(pug.renderFile("./views/pages/index.pug", {
        restaurants: restaurants,
        session: req.session,
    }));
});

// RESTAURANTS URL
app.route("/restaurants").get(function (req, res) {
    if (req.accepts('text/html')) {
        res.statusCode = 301;
        res.setHeader("Content-Type", "text/html");
        res.redirect("/home#restaurants");
    }
    else if (req.accepts('application/json')) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        let requestedData = getJsonData();
        res.send(requestedData);
    }
    else {
        res.statusCode = 406;
        res.setHeader("Content-Type", "text/html");
        res.send("<h1>Not Acceptable</h1>");
    }
});

// RESTAURANT SPECIFIC URL
app.route("/restaurants/:restaurant").get(function (req, res) {
    let restaurantUrl = req.params.restaurant;
    let requestedRestaurant;
    for (var restaurant in restaurants) {
        if (restaurants[restaurant][3] === restaurantUrl) {
            requestedRestaurant = restaurants[restaurant];
            break;
        }
    }
    if (req.session.loggedIn) {
        if (req.accepts("text/html")) {
            if (requestedRestaurant != null) {
                let restaurantJSON = requestedRestaurant[4];
                if (restaurantJSON != undefined) {
                    let restaurantData = require('./restaurants/' + restaurantJSON);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/html");
                    res.send(pug.renderFile("./views/pages/restaurant/restaurant.pug", {
                        restaurantData: JSON.stringify(restaurantData),
                        restaurants: restaurants,
                        session: req.session,
                    }));
                }
                else {
                    fs.readFile("views/errors/404.html", function (err, data) {
                        if (err) {
                            res.statusCode = 500;
                            res.setHeader("Content-Type", "text/html");
                            res.write("Server error.");
                            res.end();
                            return;

                        }
                        res.statusCode = 404;
                        res.setHeader("Content-Type", "text/html");
                        res.write(data);
                        res.end();
                    });
                }
            }
            else {
                fs.readFile("views/errors/404.html", function (err, data) {
                    if (err) {
                        res.statusCode = 500;
                        res.write("Server error.");
                        res.end();
                        return;
                    }
                    res.statusCode = 404;
                    res.setHeader("Content-Type", "text/html");
                    res.write(data);
                    res.end();
                });
            }
        }
        else if (req.accepts("application/json")) {
            let restaurantJSON = require('./restaurants/' + requestedRestaurant[4]);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify(restaurantJSON));
            res.end();
        }
        else {
            res.statusCode = 406;
            res.setHeader("Content-Type", "text/html");
            res.send("<h1>Not Acceptable</h1>");
            res.end();
        }
    }
    else {
        fs.readFile("views/errors/restaurant403.html", function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.write("Server error.");
                res.end();
                return;
            }
            res.statusCode = 403;
            res.setHeader("Content-Type", "text/html");
            res.write(data);
            res.end();
        });
    }
});

// SUCCESS
app.route("/success").get(function (req, res) {
    fs.readFile("views/pages/success.html", function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/html");
            res.write("Server error.");
            res.end();
            return;

        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.write(data);
        res.end();
    });

});

// FAILURE
app.route("/failure").get(function (req, res) {
    fs.readFile("views/errors/checkout400.html", function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/html");
            res.write("Server error.");
            res.end();
            return;

        }
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/html");
        res.write(data);
        res.end();
    });

});

// CHEKOUT SUCCESS
app.route("/checkout-success").get(function (req, res) {
    fs.readFile("views/pages/success.html", function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.write("Server error.");
            res.end();
            return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.write(data);
        res.end();
    });
});

// CHEKOUT FAILURE
app.route("/checkout-failure").get(function (req, res) {
    fs.readFile("views/errors/404.html", function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.write("Server error.");
            res.end();
            return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.write(data);
        res.end();
    });
});

// CHEKOUT 
app.route("/checkout").post(function (req, res) {
    var body = req.body;
    if (req.session.loggedIn) {
        var neworder = {};
        neworder.date = new Date();
        neworder.restaurantID = body.restaurantId;
        neworder.restaurantName = body.restaurantName;
        neworder.subtotal = body.subtotal;
        neworder.total = body.total;
        neworder.deliveryFee = body.deliveryFee;
        neworder.tax = body.tax;
        neworder.products = body.order;
        const newOrder = new Order(neworder);
        newOrder.save(function (err, order) {
            if (err) {
                console.log(err);
                res.statusCode = 500;
                res.write("Server error.");
                res.end();
                return;
            }
            User.findOne({ username: req.session.userid }, function (err, user) {
                if (err) {
                    res.statusCode = 500;
                    res.write("Server error.");
                    res.end();
                    return;
                }
                user.orders.push(order._id);
                user.save(function (err, user) {
                    if (err) {
                        res.statusCode = 500;
                        res.write("Server error.");
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.write("Order placed successfully.");
                    res.end();
                });
            });

        });
    }
    else {
        fs.readFile("views/errors/checkout401.html", function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.write("Server error.");
                res.end();
                return;
            }
            res.statusCode = 401;
            res.setHeader("Content-Type", "text/html");
            res.write(data);
            res.end();
        });
    }
});

//USERNAME VALIDATION
app.route("/check-username").get(function (req, res) {
    let username = req.query.username;
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            res.statusCode = 500;
        }
        if (user) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.write('Username already exists.');
            res.end();
        }
        else {

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.write('Username available.');
            res.end();
        }
    });
});

// REGISTER ROUTE
app.route("/register")
    .get(function (req, res) {
        fs.readFile("views/pages/auth/register.pug", function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.write("Server error.");
                res.end();
                return;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.write(pug.renderFile("views/pages/auth/register.pug"));
            res.end();
        });
    })
    .post(async (req, res) => {
        let body = req.body;
        if (!(body.email && body.password && body.username && body.fullName)) {
            return res.status(400).send({ error: "Data not formatted properly" });
        }
        // creating a new mongoose doc from user data
        const user = new User(body);
        // generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        user.password = await bcrypt.hash(user.password, salt);
        user.save(function (err) {
            if (err) {
                return res.status(400).send({ error: "Data not formatted properly" });
            }
            req.session.loggedIn = true;
            req.session.userid = user.username;
            return res.status(200).send({ message: "User created successfully" });
        });
    })

// LOGIN ROUTE 
app.route("/login")
    .get(function (req, res) {
        if (req.session.loggedIn) {
            fs.readFile("views/errors/401.html", function (err, data) {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "text/html");
                    res.write("Server error.");
                    res.end();
                    return;

                }
                res.statusCode = 401;
                res.setHeader("Content-Type", "text/html");
                res.write(data);
                res.end();
            });
        }
        else {
            fs.readFile("views/pages/auth/login.pug", function (err, data) {
                if (err) {
                    res.statusCode = 500;
                    res.write("Server error.");
                    res.end();
                    return;
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.write(pug.renderFile("views/pages/auth/login.pug"));
                res.end();
            });
        }
    })
    .post(async (req, res) => {
        const body = req.body;
        if (req.session.loggedIn) {
            fs.readFile("views/errors/401.html", function (err, data) {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "text/html");
                    res.write("Server error.");
                    res.end();
                    return;

                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.write(data);
                res.end();
            });
        }
        else {
            const user = await User.findOne({ username: body.username });
            if (user) {
                // check user password with hashed password stored in the database
                const validPassword = await bcrypt.compare(body.password, user.password);
                if (validPassword) {
                    req.session.loggedIn = true;
                    req.session.userid = body.username;
                    res.status(200).json({ message: "Valid Login Credentials" });
                    return;
                } else {
                    res.status(401).json({ error: "Invalid Login Credentials" });
                }
            }
            else {
                res.status(401).json({ error: "User does not exist" });
            }
        }
    });


// LOGOUT ROUTE
app.route("/logout").get(function (req, res) {
    if (req.session.loggedIn) {
        req.session.destroy(function (err) {
            if (err) {
                res.statusCode = 500;
                res.write("Server error.");
                res.end();
                return;
            }
            fs.readFile("views/pages/auth/logout.html", function (err, data) {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "text/html");
                    res.write("Server error.");
                    res.end();
                    return;

                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.write(data);
                res.end();
            });
        });
    }
    else {
        fs.readFile("views/errors/401.html", function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "text/html");
                res.write("Server error.");
                res.end();
                return;

            }
            res.statusCode = 401;
            res.setHeader("Content-Type", "text/html");
            res.write(data);
            res.end();
        });
        return;
    }
});

//USERS ROUTE
app.route("/users").get(function (req, res) {
    var requestedUser = req.query.username;
    if (requestedUser) {
        User.findOne({ username: { $regex: requestedUser, $options: 'i' }, privacy: false }, function (err, user) {
            if (err) {
                res.statusCode = 500;
                res.write("Server error.");
                res.end();
                return;
            }
            if (user) {
                let userData = [];
                userData.push(user);
                fs.readFile("views/pages/user/users.pug", function (err, data) {
                    if (err) {
                        res.statusCode = 500;
                        res.write("Server error.");
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/html");
                    res.write(pug.renderFile("views/pages/user/users.pug", {
                        users_data: userData,
                        session: req.session,
                        restaurants: restaurants
                    }));
                    res.end();
                });
            }
            else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.write(pug.renderFile("views/pages/user/users.pug", {
                    users_data: [],
                    session: req.session,
                    restaurants: restaurants
                }));
                res.end();
            }

        });
    }
    else {
        User.find({ privacy: false }, function (err, users) {
            if (err) {
                res.statusCode = 500;
            }
            if (users) {
                fs.readFile("views/pages/user/users.pug", function (err, data) {
                    if (err) {
                        res.statusCode = 500;
                        res.write("Server error.");
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/html");
                    res.write(pug.renderFile("views/pages/user/users.pug", {
                        users_data: users,
                        session: req.session,
                        restaurants: restaurants
                    }));
                    res.end();
                });
            }
            else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.write('Users not found.');
                res.end();
            }
        });
    }
});


//SPECIFIC USER ROUTE
app.route("/users/:userId").get(function (req, res) {
    let userID = req.params.userId;
    if (userID) {
        if (req.session.loggedIn) {
            User.findOne({ _id: userID }, function (err, user) {
                if (err) {
                    res.statusCode = 500;
                }
                if (user) {
                    if (user.username == req.session.userid) {
                        User.findOne({ _id: userID }, function (err, user) {
                            if (err){
                                res.statusCode = 500;
                            }
                            if (user){
                                Order.find({ _id: { $in: user.orders } }, function (err, order) {
                                    if (err) {
                                        res.statusCode = 500;
                                    }
                                    if (order) {
                                        res.write(pug.renderFile("views/pages/user/user.pug", {
                                            user: user,
                                            session: req.session,
                                            restaurants: restaurants,
                                            owner: true,
                                            orders: order,
                                        }));
                                        res.end();
                                    }
                                    else {
                                        res.write(pug.renderFile("views/pages/user/user.pug", {
                                            user: user,
                                            session: req.session,
                                            restaurants: restaurants,
                                            owner: true,
                                            orders: [],
                                        }));
                                        res.end();
                                    }
                                });
                            }
                            else{
                                fs.readFile("views/errors/user404.html", function (err, data) {
                                    if (err) {
                                        res.statusCode = 500;
                                        res.write("Server error.");
                                        res.end();
                                        return;
                                    }
                                    res.statusCode = 401;
                                    res.setHeader("Content-Type", "text/html");
                                    res.write(data);
                                    res.end();
                                });
                            }
                        });
                    }
                    else {
                        User.findOne({ _id: userID, privacy: false }, function (err, user) {
                            if(err){
                                res.statusCode = 500;
                            }
                            if (user){
                                Order.find({ _id: { $in: user.orders } }, function (err, order) {
                                    if (err) {
                                        res.statusCode = 500;
                                    }
                                    if (order) {
                                        res.write(pug.renderFile("views/pages/user/user.pug", {
                                            user: user,
                                            session: req.session,
                                            restaurants: restaurants,
                                            owner: false,
                                            orders: order,
                                        }));
                                        res.end();
                                    }
                                    else {
                                        res.write(pug.renderFile("views/pages/user/user.pug", {
                                            user: user,
                                            session: req.session,
                                            restaurants: restaurants,
                                            owner: false,
                                            orders: [],
                                        }));
                                        res.end();
                                    }
                                });
                            }
                            else{
                                fs.readFile("views/errors/user404.html", function (err, data) {
                                    if (err) {
                                        res.statusCode = 500;
                                        res.write("Server error.");
                                        res.end();
                                        return;
                                    }
                                    res.statusCode = 401;
                                    res.setHeader("Content-Type", "text/html");
                                    res.write(data);
                                    res.end();
                                });
                            }
                        });
                    }
                }
                else {
                    fs.readFile("views/errors/users404.html", function (err, data) {
                        if (err) {
                            res.statusCode = 500;
                            res.write("Server error.");
                            res.end();
                            return;
                        }
                        res.statusCode = 401;
                        res.setHeader("Content-Type", "text/html");
                        res.write(data);
                        res.end();
                    });
                }
            });
        }
        else {
            User.findOne({ _id: userID, privacy: false }, function (err, user) {
                if (err) {
                    res.statusCode = 500;
                }
                if (user) {
                    Order.find({ _id: { $in: user.orders } }, function (err, order) {
                        if (err) {
                            res.statusCode = 500;
                        }
                        if (order) {
                            res.write(pug.renderFile("views/pages/user/user.pug", {
                                user: user,
                                session: req.session,
                                restaurants: restaurants,
                                owner: false,
                                orders: order
                            }));
                            res.end();
                        }
                        else {
                            res.write(pug.renderFile("views/pages/user/user.pug", {
                                user: user,
                                session: req.session,
                                restaurants: restaurants,
                                owner: false,
                                orders: []
                            }));
                            res.end();
                        }
                    });
                }
                else {
                    User.findOne({ _id: userID, privacy: true }, function (err, user) {
                        if (err) {
                            res.statusCode = 500;
                        }
                        if (user) {
                            fs.readFile("views/errors/user403.html", function (err, data) {
                                if (err) {
                                    res.statusCode = 500;
                                    res.write("Server error.");
                                    res.end();
                                    return;

                                }
                                res.statusCode = 403;
                                res.setHeader("Content-Type", "text/html");
                                res.write(data);
                                res.end();
                            });
                        }
                        else {
                            fs.readFile("views/errors/user404.html", function (err, data) {
                                if (err) {
                                    res.statusCode = 500;
                                    res.write("Server error.");
                                    res.end();
                                    return;
                                }
                                res.statusCode = 404;
                                res.setHeader("Content-Type", "text/html");
                                res.write(data);
                                res.end();
                            });
                        }
                    });
                }
            });
        }
    }
});

//ORDER ROUTE
app.route("/orders/:orderId").get(function (req, res) {
    let orderID = req.params.orderId;
    if (orderID) {
        if (req.session.loggedIn) {
            User.findOne({ username: req.session.userid }, function (err, user) {
                if (err) {
                    res.statusCode = 500;
                }
                if (user) {
                    if (user.orders.includes(orderID)) {
                        Order.findOne({ _id: orderID }, function (err, order) {
                            if (err) {
                                res.statusCode = 500;
                            }
                            if (order) {
                                res.write(pug.renderFile("views/pages/order/order.pug", {
                                    order: order,
                                    session: req.session,
                                    restaurants: restaurants,
                                    user: user
                                }));
                                res.end();
                            }
                            else {
                                fs.readFile("views/errors/order404.html", function (err, data) {
                                    if (err) {
                                        res.statusCode = 500;
                                        res.write("Server error.");
                                        res.end();
                                        return;
                                    }
                                    res.statusCode = 404;
                                    res.setHeader("Content-Type", "text/html");
                                    res.write(data);
                                    res.end();
                                });
                            }
                        });
                    }
                    else {
                        User.findOne({
                            $and: [
                                { orders: { $in: [orderID] } },
                                { privacy: false }
                            ]
                        }, function (err, user) {
                            if (err) {
                                res.statusCode = 500;
                            }
                            if (user) {
                                Order.findOne({ _id: orderID }, function (err, order) {
                                    if (err) {
                                        res.statusCode = 500;
                                    }
                                    if (order) {
                                        res.write(pug.renderFile("views/pages/order/order.pug", {
                                            order: order,
                                            session: req.session,
                                            restaurants: restaurants,
                                            user: user
                                        }));
                                        res.end();
                                    }
                                    else {
                                        fs.readFile("views/orderfailure.html", function (err, data) {
                                            if (err) {
                                                res.statusCode = 500;
                                                res.write("Server error.");
                                                res.end();
                                                return;
                                            }
                                            res.statusCode = 404;
                                            res.setHeader("Content-Type", "text/html");
                                            res.write(data);
                                            res.end();
                                        });
                                    }
                                });
                            }
                            else {
                                fs.readFile("views/orderfailure.html", function (err, data) {
                                    if (err) {
                                        res.statusCode = 500;
                                        res.write("Server error.");
                                        res.end();
                                        return;
                                    }
                                    res.statusCode = 404;
                                    res.setHeader("Content-Type", "text/html");
                                    res.write(data);
                                    res.end();
                                });
                            }
                        });
                    }
                }
                else {
                    fs.readFile("views/errors/order404.html", function (err, data) {
                        if (err) {
                            res.statusCode = 500;
                            res.write("Server error.");
                            res.end();
                            return;
                        }
                        res.statusCode = 404;
                        res.setHeader("Content-Type", "text/html");
                        res.write(data);
                        res.end();
                    });
                }
            });
        }
        else {
            User.findOne({
                $and: [
                    { orders: { $in: [orderID] } },
                    { privacy: false }
                ]
            }, function (err, user) {
                if (err) {
                    res.statusCode = 500;
                }
                if (user) {
                    Order.findOne({ _id: orderID }, function (err, order) {
                        if (err) {
                            res.statusCode = 500;
                        }
                        if (order) {
                            res.write(pug.renderFile("views/pages/order/order.pug", {
                                order: order,
                                session: req.session,
                                restaurants: restaurants,
                                user: user
                            }));
                            res.end();
                        }
                        else {
                            fs.readFile("views/order404.html", function (err, data) {
                                if (err) {
                                    res.statusCode = 500;
                                    res.write("Server error.");
                                    res.end();
                                    return;
                                }
                                res.statusCode = 404;
                                res.setHeader("Content-Type", "text/html");
                                res.write(data);
                                res.end();
                            });
                        }
                    });
                }
                else {
                    User.findOne({
                        $and: [
                            { orders: { $in: [orderID] } },
                            { privacy: true }
                        ]
                    }, function (err, user) {
                        if (err) {
                            res.statusCode = 500;
                        }
                        if (user) {
                            fs.readFile("views/errors/order403.html", function (err, data) {
                                if (err) {
                                    res.statusCode = 500;
                                    res.write("Server error.");
                                    res.end();
                                    return;

                                }
                                res.statusCode = 403;
                                res.setHeader("Content-Type", "text/html");
                                res.write(data);
                                res.end();
                            });
                        }
                        else {
                            fs.readFile("views/errors/order404.html", function (err, data) {
                                if (err) {
                                    res.statusCode = 500;
                                    res.write("Server error.");
                                    res.end();
                                    return;
                                }
                                res.statusCode = 404;
                                res.setHeader("Content-Type", "text/html");
                                res.write(data);
                                res.end();
                            });
                        }
                    });
                }

            });
        }
    }
});

//PROFILE REROUTE
app.route("/profile/:username").get(function (req, res) {
    let username = req.params.username;
    if (username) {
        User.findOne({ username: username }, function (err, user) {
            if (err) {
                res.statusCode = 500;
            }
            if (user) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.redirect("/users/" + user._id);
                res.end();
            }
            else{
                fs.readFile("views/errors/user404.html", function (err, data) {
                    if (err) {
                        res.statusCode = 500;
                        res.write("Server error.");
                        res.end();
                        return;
                    }
                    res.statusCode = 401;
                    res.setHeader("Content-Type", "text/html");
                    res.write(data);
                    res.end();
                });
            }
        });

    }
});

// UPDATE USER ROUTE
app.route("/users/:userId/edit-profile")
    .get(function (req, res) {
        let userID = req.params.userId;
        if (req.session.loggedIn) {
            if (userID) {
                User.findOne({ _id: userID }, function (err, user) {
                    if (err) {
                        res.statusCode = 500;
                    }
                    if (user) {
                        fs.readFile("views/pages/user/update-user.pug", function (err, data) {
                            if (err) {
                                res.statusCode = 500;
                                res.write("Server error.");
                                res.end();
                                return;
                            }
                            if (user.username == req.session.userid) {
                                res.statusCode = 200;
                                res.setHeader("Content-Type", "text/html");
                                res.write(pug.renderFile("views/pages/user/update-user.pug", {
                                    user: user,
                                    session: req.session,
                                }));
                                res.end();
                            }
                            else {
                                fs.readFile("views/errors/user403.html", function (err, data) {
                                    if (err) {
                                        res.statusCode = 500;
                                        res.setHeader("Content-Type", "text/html");
                                        res.write("Server error.");
                                        res.end();
                                        return;

                                    }
                                    res.statusCode = 403;
                                    res.setHeader("Content-Type", "text/html");
                                    res.write(data);
                                    res.end();
                                });
                            }
                        });
                    }
                    else {
                        fs.readFile("views/errors/user404.html", function (err, data) {
                            if (err) {
                                res.statusCode = 500;
                                res.setHeader("Content-Type", "text/html");
                                res.write("Server error.");
                                res.end();
                                return;

                            }
                            res.statusCode = 404;
                            res.setHeader("Content-Type", "text/html");
                            res.write(data);
                            res.end();
                        });
                    }
                });
            }
        }
        else {
            fs.readFile("views/errors/user403.html", function (err, data) {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "text/html");
                    res.write("Server error.");
                    res.end();
                    return;

                }
                res.statusCode = 403;
                res.setHeader("Content-Type", "text/html");
                res.write(data);
                res.end();
            });
        }
    })
    .put(function (req, res) {
        let userID = req.params.userId;
        if (userID) {
            User.findOne({ _id: userID }, function (err, user) {
                if (err) {
                    res.statusCode = 500;
                }
                if (user) {
                    user.fullName = req.body.fullName;
                    user.username = req.body.username;
                    user.email = req.body.email;
                    user.aboutme = req.body.aboutme;
                    user.location = req.body.location;
                    user.privacy = req.body.privacy;
                    user.save(function (err) {
                        if (err) {
                            res.statusCode = 500;
                            res.write("Server error.");
                            res.end();
                            return;
                        }
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "text/html");
                        res.write("User updated successfully.");
                        res.end();
                    });
                }
            });
        }
    });

// 404 CHECK
app.use(function (req, res) {
    fs.readFile("views/errors/404.html", function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.write("Server error.");
            res.end();
            return;
        }
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html");
        res.write(data);
        res.end();
    });
});
mongoose.connect("mongodb+srv://test:12345@glencoe-cluster.xmhow.mongodb.net/GlencoeRestaurants?retryWrites=true&w=majority", { useNewUrlParser: true });
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to DB");
    app.listen(process.env.PORT || 3000);
});
    

    
