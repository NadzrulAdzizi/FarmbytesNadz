const axios = require('axios');

// Base URL for the API
const BASE_URL = 'https://reqres.in/api/users?page=2';
const BASE_URL_1 = 'https://reqres.in/api/users';
const BASE_URL_2 = 'https://reqres.in/api/users/2';
const BASE_URL_3 = 'https://reqres.in/api/users/2';
const BASE_URL_4 = 'https://reqres.in/api/users/2';

// Function to perform a GET request
async function getPosts() {
  try {
    const response = await axios.get(`${BASE_URL}/posts`);
    console.log('GET /posts Response:', response.status);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
  }
}

// Function to perform a POST request
async function createPost() {
  try {
    const newPost = {
      name: "morpheus",
      job: "leader"
    };
    const response = await axios.post(`${BASE_URL_1}/posts`, newPost);
    console.log('POST /posts Response:', response.status);
  } catch (error) {
    console.error('Error creating post:', error.message);
  }
}

// Function to perform a PUT request
async function updatePost(postId) {
  try {
    const updatedPost = {
      name: "morpheus",
      job: "zion resident"
    };
    const response = await axios.put(`${BASE_URL_2}/posts/${postId}`, updatedPost);
    console.log(`PUT /posts/${postId} Response:`, response.status);
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error.message);
  }
}

// Function to perform a PATCH request
async function patchPost(postId) {
  try {
    const patchData = {
      job: "zion resident"
    };
    const response = await axios.patch(`${BASE_URL_3}/posts/${postId}`, patchData);
    console.log(`PATCH /posts/${postId} Response:`, response.status);
  } catch (error) {
    console.error(`Error patching post ${postId}:`, error.message);
  }
}

// Function to perform a DELETE request
async function deletePost(postId) {
  try {
    const response = await axios.delete(`${BASE_URL_4}/posts/${postId}`);
    console.log(`DELETE /posts/${postId} Response:`, response.status);
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error.message);
  }
}

// Main function to execute API calls
async function main() {
  console.log('Fetching all posts...');
  await getPosts();

  console.log('\nCreating a new post...');
  await createPost();

  console.log('\nUpdating post with ID 1...');
  await updatePost(1);

  console.log('\nPatching post with ID 1...');
  await patchPost(1);

  console.log('\nDeleting post with ID 1...');
  await deletePost(1);
}

// Execute the main function
main().catch(console.error);