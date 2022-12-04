# Neuvontajono

Neuvontajono is an interactive queueing system for lab sessions (_neuvontajono_ in Finnish) where students can ask
help from course assistants. Students see their position in the queue and assistants see the students in the queue,
both in real time.

The tool supports multiple courses and multiple exercise sessions per course. Also some statistics is provided about
the number of students in each exercise session.

Currently, only way to login is to use LTI. Course management systems such as [A+](https://github.com/apluslms/a-plus)
support this mechanism to launch external tools and provide the user information.

## Version 3.0

What's new in this version?

### Updated technology stack

The tool is almost completely rewritten with newer and up-to-date technologies.

The main libraries and technologies used in version 3.0 are (in alphabetical order):

- [Bootstrap](https://getbootstrap.com/)
- [Highlight.js](https://highlightjs.org/)
- [Next.js](https://nextjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [React](https://reactjs.org/)
- [React Hot Toast](https://react-hot-toast.com/)
- [tRPC](https://trpc.io/)
- [socket.io](https://socket.io/)
- [Typegoose](https://typegoose.github.io/typegoose/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/)

### Excluded dates

It is possible to define for each session group if there are single dates
when the session won't be organized.

### Help text for remote participation

It is possible to define a custom help text for the course or session group
to override the default text.

### Enhanced view of removed participants

Assistant will see now easier who was the previously removed participant, their details as
well as all participants who have been recently removed from the queue.

### Multiple LTI keys

It is now possible to define as many LTI keys for different learning management systems as needed instead of
sharing only one key with all of them.

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

## Installation

Install [Node.js](https://nodejs.org/en/download/) (tested with version 16.17.0) and
[MongoDB](https://www.mongodb.com/try/download/community) (tested with version 6.0.1).

Then, `git clone`, `npm install`, and `npm run build`. Check the configuration in `.env`. If you need to replace
these default values, it is suggested to create a new file `.env.local` which is already defined in `.gitignore`
and it will automatically override `.env`.

The application must be used with [proxy pass](http://nginx.org/en/docs/http/ngx_http_proxy_module.html). The
service is configured so that it will be available in port 3002 and with the prefix `/neuvontajono` in the URL.
Use the following configuration with NGINX:

```
location /neuvontajono {
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header Host $http_host;
  proxy_set_header X-NginX-Proxy true;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_pass http://localhost:3002/neuvontajono;
  proxy_redirect off;
  proxy_http_version 1.1;
}
```

## LTI Configuration

LTI version 1.1 is currently supported.

### Managing LTI keys

There is a specific script `ltitool.ts` to configure the keys. In order to use it, you need to install `ts-node`:

```
> sudo npm install -g typescript ts-node
```

The tool provides four commands: `delete`, `list`, `set`, and `show`.

#### Create a new key:

```
> ts-node ltitool --ltiver=11 --key=test set
```

The tool will output a new random secret for the key `test`. If you run the same command again, a new secret will
be assigned to the same key. You can also manually specify the secret by using the `--secret` parameter.

#### Delete a key:

```
> ts-node ltitool --ltiver=11 --key=test delete
```

#### List all keys:

```
> ts-node ltitool --ltiver=11 list
```

This will show the names of the existing keys but not the secrets.

#### Show the secret:

```
> ts-node ltitool --ltiver=11 --key=test show
```

Please notice that the keys are stored in the database without any encryption.

### Launch URL

Configure your LMS so that the LTI launch address will be `http://your.server.example/neuvontajono/api/lti/v11/login`.

## Running the service

Use `upstart`, `systemd`, or such mechanism to launch the application (`npm run start`) when the computer and
operating system starts. The mechanism
must also restart the application if it crashes for some reason.

It cannot be started before `npm run build` is initially executed after cloning the repository or whenever the source
code has changed.

## Development

You can run the tool in development mode with the command `npm run dev`. Please notice that the hot module reload does
not work properly with databse models so if you make any changes to those, always restart the process manually.

In this mode, you can bypass the LTI login by launching the UI with an URL like this:
`http://localhost:3002/neuvontajono/api/login/testLogin?firstName=First&lastName=Last&course=Course+1&role=teacher&language=fi`

This allow easily changing the user, course, roles (`student`, `staff` or `teacher`) and languages (`en` and `fi`).

The source code is formatted with [Prettier](https://prettier.io/) (used as a plugin inside [VS Code](https://code.visualstudio.com/))
using maximum line length of 120 characters and two spaces to indent code.

## Instructions

The instructions for using Neuvontajono can be found [here](docs/README.md).

