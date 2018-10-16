# Neuvontajono

Neuvontajono is an interactive queueing system for lab sessions (*neuvontajono* in Finnish) where students can ask
help from course assistants. Students see their position in the queue and assistants see the students in the queue,
both in real time.

This was originally a hobby project to get familiar with modern web technologies such as [Node.js](https://nodejs.org/), [Express](http://expressjs.com/), [MongoDB](http://www.mongodb.org), [Mongoose](http://mongoosejs.com/),
[KeystoneJS](http://keystonejs.com/), [Socket.io](http://socket.io) and [React](https://reactjs.org/).

The tool supports multiple courses and multiple exercise sessions per course. Also some statistics is provided about
the number of students in each exercise session.

Currently, only way to login is to use LTI. Course management systems such as [A+](https://github.com/Aalto-LeTech/a-plus)
support this mechanism to launch external tools and provide the user information.

## Version 2.0

The technology stack was updated in version 2.0 to run the application with up-to-date versions of the required
libraries. The most important factor was to update [the KeystoneJS framework](https://github.com/keystonejs/keystone)
to version 4.0 after it was finally published.

### Support for multiple user interface languages

The user interface can now be translated into multiple languages. Currently, there are translations for Finnish
and English. The parameter `launch_presentation_locale` in the LTI launch request defines the language, or a default
language will be used if the parameter is missing. The user interface is created with [React](https://reactjs.org/)
and the localization is made with the [`react-intl`](https://github.com/yahoo/react-intl) library.

## Installation

Install [Node.js](https://nodejs.org/en/download/) (tested with version 8.10) and [MongoDB](https://www.mongodb.com/download-center)
(tested with version 3.6).

Then, `git clone`, `npm install`, and `npm run build`. Check the configuration in `server.js` and change the keys.

The application must be used with [proxy pass](http://nginx.org/en/docs/http/ngx_http_proxy_module.html) because of
the URL mapping. KeystoneJS requires that the application is in the root. As this is not always possible, configure
Nginx so that `/neuvontajono/` points to `http://localhost:3002/`. The URL must be rewritten so that the `/neuvontajono`
part is removed. The proxy pass can be configured with the following setup:

```
location /neuvontajono/ {
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header Host $http_host;
  proxy_set_header X-NginX-Proxy true;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_pass http://localhost:3002/;
  proxy_redirect off;
  proxy_http_version 1.1;
}
```

In order to use the Admin UI provided by KeystoneJS, configure the admin account information in `updates/0.0.1-admins.js`.
Although the Admin UI is not normally needed, remember to change the credentials to prevent unpriviledged access.
Admin UI can be accessed in `http://localhost:3002/keystone`.

Configure the LMS so that the LTI launch address will be `http://your.server.example/neuvontajono/login/lti`.
Check the keys once more in `server.js`.

Use `upstart`, `systemd`, or such mechanism to launch the application (`node server.js`) when the computer and
operating system starts. Make sure that the environment variable `NODE_ENV` is set to `production`. The mechanism
must also restart the application if it crashes for some reason.

If the MongoDB configuration requires a password, use the environment variable `MONGODB_URI` to provide the required
connection string.

## Projector Configuration

In the lab sessions, a video projector can be used to show the queue length, the next student in the queue, and
course-specific images which may contain hints etc.

To customize the view, you have to create a projector configuration JSON and make it available online. Define the
URL in the course settings. If the projector configuration is not defined, an analog clock face will be shown
instead of course-specific hints etc.

The configuration file looks like this:
```
projector({
  "course":"http://pathtocourse/course.png",
  "sessions": {"sessionA":"http://pathtocourse/sessionA.png"},
  "pictures": [{start:"2016-09-01 08:00", end:"2016-09-12 16:00", picture:"http://pathtocourse/hintsForSession1.png"}]
});
```
The JSON data must be inside a function called `projector` to allow loading the file from any domain by using JSONP.

The `course` setting defines the image that will be shown when the queue is not open. This image is mandatory,
the following images are optional.

The `sessions` object defines an image for each lab session identified by its name. This image will be visible every
15 minutes. A session image may contain, for example, the names and pictures of the course staff members.

The `pictures` array contains a list of images that will be shown during the given period. These may contain hints for
each week etc. If there are multiple images shown at the same time, the shown image will be changed every minute.
