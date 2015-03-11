# Neuvontajono

Interactive queueing system for exercise sessions (*neuvontajono* in Finnish) where students can ask help from course assistants. Students see their position in the queue and assistants see the students in the queue, both in real time.

This is mainly a hobby project to get familiar with modern web technologies such as [Node.js](https://nodejs.org/), [Express](http://expressjs.com/), [MongoDB](http://www.mongodb.org), [Mongoose](http://mongoosejs.com/), [KeystoneJS](http://keystonejs.com/), [Socket.io](http://socket.io) and [Knockout.js](http://knockoutjs.com).

The tool supports multiple courses and multiple exercise sessions per course. Also some statistics is provided about the number of students in each exercise session.

Currently, only way to login is to use LTI. Course management systems such as [A+](https://github.com/Aalto-LeTech/a-plus) support this mechanism to launch external tools. At the moment, the user interface is in Finnish only.

## Installation

Clone, type `npm install` and let npm fetch all the required modules.

The tool must be used with [proxy pass](http://nginx.org/en/docs/http/ngx_http_proxy_module.html) because of the URL mapping. KeystoneJS requires that the application is in the root. As this is not always possible, configure Nginx so that `/neuvontajono/` points to `http://localhost:3000/`.

In order to use the Admin UI provided by KeystoneJS, configure the admin account information in `updates/0.0.1-admins.js`.
