#matrix-socket-mongo

This repository contains code that demonstrates dynamic MongoDB aggregations through an Express.js application over socket.io. The front end of the application is a simple HTML5 page with Bootstrap and socket.io. You will need to have MongoDB running to run this sample.

To run the sample:

-   Make sure Docker is installed
-   Pull the mongoDB docker image:
    -   docker pull mongo
-   Start up the mongoDB docker container:
    -   docker run -d -p 27017-27019:27017-27019 --name mongodb mongo
-   From the project directory:
    -   npm install
    -   npm run build
    -   npm start
-   Visit the \<project root dir\>/dist/index.html page.

Technologies Used:

-   [HTML5](https://html.spec.whatwg.org/multipage/)
-   [Bootstrap](https://getbootstrap.com/)
-   [sass (scss)](https://sass-lang.com/)
-   [socket.io](https://socket.io/)
-   [Node Express](http://expressjs.com/)
-   [MongoDB](https://www.mongodb.com/)
