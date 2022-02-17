# MERN boilerplate

This boilerplate was made as a template to a developer wanting to build an app using the MERN Stack with TypeScript.

# Table of Contents

1. [What is MERN?](#what-is-mern)
1. [Installation](#installation)
1. [Usage](#usage)
1. [Testing](#testing)
1. [Translation](#translation)
1. [License](#license)
1. [Contributing](#contributing)
1. [Questions](#questions)

# What is MERN?

MERN is a stack of technologies that are used to build a web application. It is composed by MongoDB, Express.js, React.js and Node.js. The stack is used to build a web application that can be used to store data and can be used to communicate with other web applications.

[Go up](#table-of-contents)

# Installation

To install the dependencies, run the following command:

```
npm install
```

It will install all the dependencies needed to run the application, then change the directory to the `server` folder and install the dependencies needed to run the server. Then change the directory to the `client` folder and do the same for the client.

## Update

This repository has a custom update method, which updates the root project as well as the server and client. From the root folder, run:

```
npm run update
```

And it will update the root, then the server, resolve dependencies with vulnerabilities, and then do the same for the client. After running this command, the entire project should be up to date.

[Go up](#table-of-contents)

# Usage

## Local

From the root folder, run:

```
npm run dev
```

To start the backend server, and a development frontend server. Upon starting the backend server, the application will create a database called `mongoose`. The database will be used to store the data of the application. You will need a user to login to the application. To sign up, send a POST request to the URL `/signup`, with the following body:

```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "your@email.com",
    "password": "yourpassword"
}
```

The property `lastName` is optional. Upon signing up, the application will return a cookie with the token of the user, so every request will be authenticated.

Some errors you could experience and possible solutions:

1. While running the server, `[nodemon] app crashed - waiting for file changes before starting...`

Solution:

```
npm install -g ts-node
```

It will install the dependencies of ts-node to run the app.

## Publishing

There are many ways to deploy a node.js server, so it will no be detailed in this guide. Nonetheless, before publishing it would be a good practice to build the frontend code with:

```
cd ./client
npm run build
```

[Go up](#table-of-contents)

# Testing

Before pushing any code to the repository, it is a good practice to run the tests. To run the tests, run the following command (it should take a while to complete the tests):

```
cd ./server
npm test
```

If the `email` suite fails, it's probably because you don't have the proper credentials. Please set the proper credentials.

# Translation

Front end translation **should not be done using natural language**, because the library utilized is _key based_ and has reserved characters (like `:` and `.`). Back end translation can be done using natural language, but it is not recommended, as it makes the keys too long.

[Go up](#table-of-contents)

# License

This project is licensed under the GPL-3.0-only license.

[Go up](#table-of-contents)

# Contributing

If you want to contribute to this project, you can fork it on [GitHub](https://github.com/AdrianCarreno/MERN-Boilerplate). Then, you can create a new branch and start working on it. When you are done, you can push your changes to a branch on GitHub, named after the feature you added. After that, make a pull request and the changes will be merged into the master branch (if the merge is successful and relevant).

[Go up](#table-of-contents)

# Questions

[Go up](#table-of-contents)
