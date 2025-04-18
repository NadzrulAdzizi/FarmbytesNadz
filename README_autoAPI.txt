autoAPI.spec.js
This script automates REST API testing using Axios in Node.js. It performs the following HTTP operations: GET, POST, PUT, PATCH, and DELETE on the https://reqres.in API.

Prerequisites
Node.js:

Ensure Node.js is installed on your system.
Verify installation:
Axios:

Install Axios:
Script Workflow
GET Request:

Fetches all posts from the API.
Endpoint: https://reqres.in/api/users?page=2/posts.
POST Request:

Creates a new post with the following payload:
Endpoint: https://reqres.in/api/users/posts.
PUT Request:

Updates an existing post with the following payload:
Endpoint: https://reqres.in/api/users/2/posts/{postId}.
PATCH Request:

Partially updates an existing post with the following payload:
Endpoint: https://reqres.in/api/users/2/posts/{postId}.
DELETE Request:

Deletes a post by its ID.
Endpoint: https://reqres.in/api/users/2/posts/{postId}.
Main Function:

Executes all the above API calls sequentially and logs the responses.
How to Run
Open the terminal in the project directory.
Run the script using Node.js:
Code Explanation
Base URLs:

BASE_URL: Used for GET requests.
BASE_URL_1: Used for POST requests.
BASE_URL_2: Used for PUT requests.
BASE_URL_3: Used for PATCH requests.
BASE_URL_4: Used for DELETE requests.
Functions:

getPosts(): Fetches all posts.
createPost(): Creates a new post.
updatePost(postId): Updates a post with a specific ID.
patchPost(postId): Partially updates a post with a specific ID.
deletePost(postId): Deletes a post with a specific ID.
Error Handling:

Each function includes a try-catch block to handle errors and log appropriate messages.
Dependencies
Node.js
Axios
Troubleshooting
Axios Not Installed:

Install Axios:
Invalid Endpoint:

Verify the API endpoints are correct and accessible.
Network Issues:

Ensure you have an active internet connection to access the https://reqres.in API.
Sample Output
When the script runs successfully, you will see output similar to the following:

Contact
For further assistance, contact the developer or refer to the official Axios documentation.