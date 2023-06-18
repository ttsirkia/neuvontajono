# Neuvontajono

Neuvontajono is an interactive queueing system for lab sessions (_neuvontajono_
in Finnish) where students can ask help from course assistants. Students see
their position in the queue and assistants see the students in the queue, both
in real time.

The tool supports multiple courses and multiple exercise sessions per course.
Also some statistics is provided about the number of students in each exercise
session.

Currently, only way to login is to use LTI. Course management systems such as
[A+](https://github.com/apluslms/a-plus) support this mechanism to launch
external tools and provide the user information.

## Version 3.0

What's new in this version?

### Updated technology stack

The tool is almost completely rewritten with newer and up-to-date technologies.

The main libraries and technologies used in version 3.0 are (in alphabetical
order):

- [Bootstrap](https://getbootstrap.com/)
- [JSON Web Almost Everything (jose)](https://github.com/panva/jose)
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

It is possible to define for each session group if there are single dates when
the session won't be organized.

### Help text for remote participation

It is possible to define a custom help text for the course or session group to
override the default text.

### Enhanced view of removed participants

Assistant will see now easier who was the previously removed participant, their
details as well as all participants who have been recently removed from the
queue.

### Multiple LTI keys

It is now possible to define as many LTI keys for different learning management
systems as needed instead of sharing only one key with all of them.

## Version 3.1

What's new in this version?

### LTI version 1.3

LTI version 1.3 is now also supported. It can be configured manually or using
LTI Open ID Connect Dynamic Registration Protocol which is supported, for
example, by Moodle to automate the whole LTI registration process simply by
generating a single URL which is entered to Moodle.

## Projector Configuration

In the lab sessions, a video projector can be used to show the queue length, the
next student in the queue, and course-specific images which may contain hints
etc.

To customize the view, you have to create a projector configuration JSON and
make it available online. Define the URL in the course settings. If the
projector configuration is not defined, an analog clock face will be shown
instead of course-specific hints etc.

The configuration file looks like this:

```
projector({
  "course":"http://pathtocourse/course.png",
  "sessions": {"sessionA":"http://pathtocourse/sessionA.png"},
  "pictures": [{start:"2016-09-01 08:00", end:"2016-09-12 16:00", picture:"http://pathtocourse/hintsForSession1.png"}]
});
```

The JSON data must be inside a function called `projector` to allow loading the
file from any domain by using JSONP.

The `course` setting defines the image that will be shown when the queue is not
open. This image is mandatory, the following images are optional.

The `sessions` object defines an image for each lab session identified by its
name. This image will be visible every 15 minutes. A session image may contain,
for example, the names and pictures of the course staff members.

The `pictures` array contains a list of images that will be shown during the
given period. These may contain hints for each week etc. If there are multiple
images shown at the same time, the shown image will be changed every minute.

## Installation

Install [Node.js](https://nodejs.org/en/download/) (tested with version 16.17.0)
and [MongoDB](https://www.mongodb.com/try/download/community) (tested with
version 6.0.1).

Then, `git clone`, `npm install`, and `npm run build`. Check the configuration
in `.env`. If you need to replace these default values, it is suggested to
create a new file `.env.local` which is already defined in `.gitignore` and it
will automatically override `.env`.

The application must be used with
[proxy pass](http://nginx.org/en/docs/http/ngx_http_proxy_module.html). The
service is configured so that it will be available in port 3002 and with the
prefix `/neuvontajono` in the URL. Use the following configuration with NGINX:

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

LTI versions 1.1 and 1.3 are supported.

### Managing LTI keys

There is a specific script `ltitool.ts` to configure the keys. In order to use
it, you need to install `ts-node`:

```
> sudo npm install -g typescript ts-node
```

The tool will use values in `.env` and `.env.local` (if it exists) to configure
the database connection, for example.

Please notice that the keys are stored in the database without any encryption.

If LTI version is changed, the users may get a new identity in Neuvontajono
because of the different contents in the LTI launch request.

### LTI version 1.1

The tool provides four commands: `delete`, `list`, `set`, and `show`.

##### Create a new key:

```
> ts-node ltitool --ltiver=11 --key=test set
```

The tool will output a new random secret for the key `test`. If you run the same
command again, a new secret will be assigned to the same key. You can also
manually specify the secret by using the `--secret` parameter.

##### Delete a key:

```
> ts-node ltitool --ltiver=11 --key=test delete
```

##### List all keys:

```
> ts-node ltitool --ltiver=11 list
```

This will show the names of the existing keys but not the secrets.

##### Show the secret:

```
> ts-node ltitool --ltiver=11 --key=test show
```

Please notice that the keys are stored in the database without any encryption.

#### Launch URL

Configure your LMS so that the LTI launch address will be
`http://your.server.example/neuvontajono/api/lti/v11/login`.

### LTI version 1.3

Before LTI version 1.3 can be used, make sure that either `.env` or `.env.local`
(suggested for production) defines the correct `HOSTNAME_URL` value. It must be
in format `http://domain.example:3002` and start with `http` or `https` and
contain the URL that will be used in browser to access the service. However, the
remaining part `/neuvontajono` must not be added and port is needed only if it is
not 80 or 443 (this should never be the case in production).

It is possible to manually define all the settings or use LTI Open ID Connect
Dynamic Registration Protocol if LMS supports it (e.g. Moodle).

The following claims are required in the LMS launch: `iss`, `sub`, `name`,
`given_name`, `family_name`, and `email`.

To define the correct role for the user, these LTI roles are recognized:

- `http://purl.imsglobal.org/vocab/lis/v2/membership/Instructor#TeachingAssistant`
  for assistants
- `http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor` for teachers.

All other roles are ignored and the user will get only student access if neither
of the roles above are present.

The following commands are available for managing the keys: `create`, `delete`,
`export`, `import`, `initialize`, `list`, `set`, and `show`.

##### Initialize a new key for dynamic registration:

```
> ts-node ltitool --ltiver=13 --name=test initialize
```

It will output a URL which is entered to LMS for automatic registration. Please
notice that in Moodle you need to manully configure after the registration that
the tool will open in a new window or otherwise the LTI launch does not work.

The given name is only for internal use and is not shown in LTI requests in any
way. To define more details about key usage, for example, it is possible to use
`--desc` parameter and give a description. The description can be seen by using
`list` or `show` commands.

##### Initialize a new key manually:

```
> ts-node ltitool --ltiver=13 --name=test --iss=http://domain.example --login=http://domain.example/login create
```

You need to define the issuer (iss) as defined in the launch requests and the
login URL which will be used to fetch the user information during the launch.

The given name is only for internal use and is not shown in LTI requests in any
way. To define more details about key usage, for example, it is possible to use
`--desc` parameter and give a description. The description can be seen by using
`list` or `show` commands.

If the issuer uses a JWKS URL to provide its public key, use the `--jwks`
parameter to define it. Otherwise you must use `import` command after the key is
created to import the public key. The key cannot be used before either the JWKS
URL or public key is defined.

##### Import a public key for the issuer:

```
> ts-node ltitool --ltiver=13 --name=test --file=key.pem import
```

Imports a PEM-encoded SPKI string for the given key and uses it as its public
key. It will override the possibly existing key or JWKS URL.

##### Export the public key of Neuvontajono:

```
> ts-node ltitool --ltiver=13 --name=test --file=key.pem export
```

Exports a PEM-encoded SPKI string for the given key. The public key is not
technically required because Neuvontajono does not send any data towards the LMS
but it is typically needed when a tool is configured. Each key has its own
public key.

You can also use the JWKS URL if that is supported, the URL is shown by using
the `show` command.

##### Delete a key:

```
> ts-node ltitool --ltiver=13 --name=test delete
```

##### List all keys:

```
> ts-node ltitool --ltiver=13 list
```

##### Show details of a key:

```
> ts-node ltitool --ltiver=13 --name=test show
```

This will show all the details of an existing key such as the public keys, JWKS
URLs and all other stored and configured details.

##### Update configuration for a key:

```
> ts-node ltitool --ltiver=13 --name=test set
```

You can update any combination of the following settings by including them to
the command:

`--jwks` The URL for JWKS for fetching the public key of the issuer. Will
replace the possibly existing manually defined public key.

`--iss` The issuer defined in the LTI messages.

`--login` The login URL.

`--deploymentid` The deployment id for the LTI in the LMS. Typically not needed,
but stored during the automated registration process if LMS provides the value.

`--clientid` The client id for the LTI in the LMS. Typically not needed, but
stored during the automated registration process if LMS provides the value.

`--desc` The description of the key

#### Launch URL

If you need to configure the URLs manually, configure your LMS so that the LTI
launch address will be `http://your.server.example/neuvontajono/api/lti/v13/login`
and callback URL will be
`http://your.server.example/neuvontajono/api/lti/v13/callback`.

## Running the service

Use `upstart`, `systemd`, or such mechanism to launch the application
(`npm run start`) when the computer and operating system starts. The mechanism
must also restart the application if it crashes for some reason.

It cannot be started before `npm run build` is initially executed after cloning
the repository or whenever the source code has changed.

## Development

You can run the tool in development mode with the command `npm run dev`. Please
notice that the hot module reload does not work properly with databse models so
if you make any changes to those, always restart the process manually.

In this mode, you can bypass the LTI login by launching the UI with an URL like
this:
`http://localhost:3002/neuvontajono/api/login/testLogin?firstName=First&lastName=Last&course=Course+1&role=teacher&language=fi`

This will allow easily changing the user, course, roles (`student`, `staff` or
`teacher`) and languages (`en` and `fi`).

The source code is formatted with [Prettier](https://prettier.io/) (used as a
plugin inside [VS Code](https://code.visualstudio.com/)) using maximum line
length of 120 characters and two spaces to indent code.

## Instructions

The instructions for using Neuvontajono can be found [here](docs/README.md).

