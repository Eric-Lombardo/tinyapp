# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Go to `localhost:[PORT]` in a browser
- Give TinyApp a whirl!

## Features
### Account Creation
* Create an account with TinyApp:
  * passwords are hashed
  * cookies are encyrpted

### Logging Out
* As simple as clicking the red `Logout` button if you are signed in. Your cookie for this domain will be deleted but don't worry all your short URLs will be saved in our database.

### Your First short link
* Once logged in create a new short link by entering a long URL (make sure to include http://) and click `submit` to get a way shorter link that you can share with everyone!
* You can test out your link to see if it takes you to the right URL by clicking the `Visit Short URL` link
  * <strong>Edit button: </strong>You can always edit the long URL if you made a typo or just want to change it to a more specific path.
  * <strong>Delete button: </strong>When you no longer need that short URL. No commitment, no worries.

### Viewing Your Tiny URLs
* Once logged in click on `My URLs` in the header or if you're on mobile this feature can be accessed by clicking on the hamburger icon and then clicking on `My URLs`

## Sharing Your Short URL
* when making a new short link and after submitting you can copy/paste the `Share Short URL` link and anyone can now view the equivalent long URL.
* If you have many URLs you can access the `My URLs` page and click on the `edit` button of a URL you want to share. From there you can now see the `Share Short URL` link that can be copy/pasted.

