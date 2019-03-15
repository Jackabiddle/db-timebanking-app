var express = require('express')
var bcrypt = require('bcryptjs')

var User = require('./models/User')

var routes = new express.Router()

var saltRounds = 10

function formatDateForHTML(date) {
  return new Date(date).toISOString().slice(0, -8)
}

// main page
routes.get('/', function(req, res) {
  if (req.cookies.userId) {
    // if we've got a user id, assume we're logged in and redirect to the app:
    res.redirect('/times')
  } else {
    // otherwise, redirect to login
    res.redirect('/sign-in')
  }
})

// show the create account page
routes.get('/create-account', function(req, res) {
  res.render('create-account.html')
})

// handle create account forms:
routes.post('/create-account', function(req, res) {
  var form = req.body

  // TODO: add some validation in here to check

  // hash the password - we dont want to store it directly
  var passwordHash = bcrypt.hashSync(form.password, saltRounds)

  // create the user
  var userId = User.insert(form.name, form.email, passwordHash)

  // set the userId as a cookie
  res.cookie('userId', userId)

  // redirect to the logged in page
  res.redirect('/times')
})

// show the sign-in page
routes.get('/sign-in', function(req, res) {
  res.render('sign-in.html')
})

routes.post('/sign-in', function(req, res) {
  var form = req.body

  // find the user that's trying to log in
  var user = User.findByEmail(form.email)

  // if the user exists...
  if (user) {
    console.log({ form, user })
    if (bcrypt.compareSync(form.password, user.passwordHash)) {
      // the hashes match! set the log in cookie
      res.cookie('userId', user.id)
      // redirect to main app:
      res.redirect('/times')
    } else {
      // if the username and password don't match, say so
      res.render('sign-in.html', {
        errorMessage: 'Email address and password do not match'
      })
    }
  } else {
    // if the user doesnt exist, say so
    res.render('sign-in.html', {
      errorMessage: 'No user with that email exists'
    })
  }
})

// handle signing out
routes.get('/sign-out', function(req, res) {
  // clear the user id cookie
  res.clearCookie('userId')

  // redirect to the login screen
  res.redirect('/sign-in')
})

// list all job times
routes.get('/times', function(req, res) {
  var loggedInUser = User.findById(req.cookies.userId)

  // fake stats - TODO: get real stats from the database
  var totalTasks = 13.45
  var avgHours = 5.42
  var totalHours = 8.12322

  res.render('list-times.html', {
    user: loggedInUser,
    stats: {
      totalTasks: totalTasks.toFixed(2),
      totalHours: totalHours.toFixed(2),
      avgHours: avgHours.toFixed(2)
    },

    // fake times: TODO: get the real contributions from the db
    times: [
      {
        id: 1,
        startTime: '4:36pm 1/11/18',
        task: 'Planting flowers in the communal garden',
        duration: 2.1
      },
      {
        id: 2,
        startTime: '2:10pm 3/11/18',
        task: 'Coaching the children\'s football team',
        duration: 4.5
      },
      {
        id: 3,
        startTime: '3:10pm 4/11/18',
        task: 'Cooking for elderly neighbours',
        duration: 3.5
      }
    ]
  })
})

// show the create time form
routes.get('/times/new', function(req, res) {
  // this is hugely insecure. why?
  var loggedInUser = User.findById(req.cookies.userId)

  res.render('create-time.html', {
    user: loggedInUser
  })
})

// handle the create time form
routes.post('/times/new', function(req, res) {
  var form = req.body

  console.log('create time', form)

  // TODO: save the new time

  res.redirect('/times')
})

// show the edit time form for a specific time
routes.get('/times/:id', function(req, res) {
  var timeId = req.params.id
  console.log('get time', timeId)

  // TODO: get the real time for this id from the db
  var taskRecord = {
    id: timeId,
    startTime: formatDateForHTML('2018-11-4 15:17'),
    duration: 67.4,
    distance: 44.43
  }

  res.render('edit-time.html', {
    time: taskRecord
  })
})

// handle the edit time form
routes.post('/times/:id', function(req, res) {
  var timeId = req.params.id
  var form = req.body

  console.log('edit time', {
    timeId: timeId,
    form: form
  })

  // TODO: edit the time in the db

  res.redirect('/times')
})

// handle deleteing the time
routes.get('/times/:id/delete', function(req, res) {
  var timeId = req.params.id
  console.log('delete time', timeId)

  // TODO: delete the time

  res.redirect('/times')
})

module.exports = routes
