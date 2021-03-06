# routers-api

With an Node-Express server usually you have to require all your routes and mount them. That's fine for a few routes, but for large applications this can get heavy.

This module is supposed to make this task a little bit easyer by loading all files within a given folder (defaults to ./routes) and mounting them as routes relatively to the ./routes folder.

For example:

```text
application
  |-> bin
  |-> public
  |-> routes
    |-> index.js
    |-> users.js
    |-> admin
      |-> index.js
      |-> dashboard.js
      |-> customers.js
```

This folder structure would generate the following routes:

```text
/
/users
/admin
/admin/dashboard
/admin/customers
```

_Notice that index.js files are translated to root slashes /._

So, the only thing that this module is expecting is a Router (express.Router()) instance to work.

```javascript
// routes/users.js
const { Router } = require('express')

// your routes goes here

module.exports = Router;
```

This piece of code wraps the whole thing toggether.
The following example is a common "resourcefull" route declaration.

```javascript
// routes/users.js
const { Router } = require('express')

Router.get('/', function(req, res) {
  User.find({}, function(err, users) {
    res.status(200).json(users);
  });
}).get('/:id', function(req, res) {
  var id = req.params.id;
  User.findById(id, function(err, user) {
    if (err) throw err;
    if (!user) res.sendStatus(404);
    res.status(200).json(user);
  });
}).post('/', function(req, res) {
  var body = req.body;
  var user = new User(body);
  user.save(function(err) {
    if (err) throw err;
    res.status(201).json(user);
  });
}).patch('/:id', function(req, res) {
  var id = req.params.id;
  var body = req.body;
  User.findByIdAndUpdate(id, body, function(err, user) {
    if (err) throw err;
    res.sendStatus(200);
  });
}).delete('/:id', function(req, res) {
  var id = req.params.id;
  User.findOneAndRemove(id, function(err) {
    if (err) throw err;
    res.sendStatus(200);
  });
});

module.exports = Router;
```

The above example would generate something like this:

```text
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
```

## Installation & Usage

```sh
npm install routers-api --save
```

```javascript
// app.js
const express = require('express');
const app = express();

// middlewares goes here
app.use(express.static(__dirname, '/public'));
// ...

// require the module and pass the
// express instance
require('routers-api')(app);

// if you don't use the default routes folder
// you can specify the path to your own
// as the second argument
require('routers-api')(app, './path/to/routes');

module.exports = app;
```
