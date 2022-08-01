# example-app

Example App for Rocket.Chat containing the code examples from the documentation (with slight variations or corrections):

- https://developer.rocket.chat/apps-engine/getting-started/creating-an-app
- https://developer.rocket.chat/apps-engine/getting-started/event-interfaces
- https://developer.rocket.chat/apps-engine/fundamentals-of-apps/uikit/opening-the-contextual-bar
- https://developer.rocket.chat/apps-engine/fundamentals-of-apps/uikit/action-buttons
- https://developer.rocket.chat/apps-engine/recipes/making-http-requests
- https://developer.rocket.chat/apps-engine/recipes/registering-api-endpoints

Before starting: https://developer.rocket.chat/apps-engine/getting-started/rocket.chat-app-engine-cli

## Summary

- /hello command (implemented at Commands/HelloWorldCommand)
- Pre and Post Sent Message handlers that will ignore a message "test" if sent in another room different than general and that will forward any message posted in a room different than general to the general room (implemented at the ExampleApp)
- /contextualbar command to open contextual bar (implemented at Commands/CtxbarExampleApp and the ExampleApp)
- My Action button as Room Custom Action (implemented at the ExampleApp)
- /get <some url> (example: `/get https://jsonplaceholder.typicode.com/todos/1`) that prints the response for the http GET call into the room as message (implemented at Commands/HTTPRequestCommand)
- HTTP endpoint implemented (visit the APP installed page for the specific HTTP endpoint URL for your install) and call it for example from command line with `curl --data 'Jack=Hello :)&Lucy=Hi!' -X POST http://localhost:3000/api/apps/public/bc4dd4a1-bf9b-408e-83a4-aba7eba0bf02/api` (replace the URL by yours). It posts the message passed in payload replacing `=` by semicolons and insert breaks between key/value pairs. Its implemented at endpoint/Endpoint.
