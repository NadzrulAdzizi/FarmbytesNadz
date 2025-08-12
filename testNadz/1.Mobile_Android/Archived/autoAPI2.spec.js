import axios from 'axios';

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

// GET: Fetch all posts
async function getPosts() {
  try {
    const response = await axios.get(BASE_URL);
    console.log('GET posts Response:', response.status, response.data.length, 'posts');
  } catch (error) {
    console.error('Error fetching posts:', error.message);
  }
}

// POST: Create a new post
async function createPost() {
  try {
    const newPost = { title: 'foo', body: 'bar', userId: 1 };
    const response = await axios.post(BASE_URL, newPost);
    console.log('POST new post Response:', response.status, response.data);
  } catch (error) {
    console.error('Error creating post:', error.message);
  }
}

// PUT: Replace a post by ID
async function updatePost(postId) {
  try {
    const updatedPost = { id: postId, title: 'foo-updated', body: 'bar-updated', userId: 1 };
    const response = await axios.put(`${BASE_URL}/${postId}`, updatedPost);
    console.log(`PUT post/${postId} Response:`, response.status, response.data);
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error.message);
  }
}

// PATCH: Modify a post by ID
async function patchPost(postId) {
  try {
    const patchData = { title: 'patched title' };
    const response = await axios.patch(`${BASE_URL}/${postId}`, patchData);
    console.log(`PATCH post/${postId} Response:`, response.status, response.data);
  } catch (error) {
    console.error(`Error patching post ${postId}:`, error.message);
  }
}

// DELETE: Remove a post by ID
async function deletePost(postId) {
  try {
    const response = await axios.delete(`${BASE_URL}/${postId}`);
    console.log(`DELETE post/${postId} Response:`, response.status);
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error.message);
  }
}

// Main flow to demonstrate all operations
async function main() {
  console.log('1. Fetching all posts...');
  await getPosts();

  console.log('\n2. Creating a new post...');
  await createPost();

  console.log('\n3. Replacing post with ID 1...');
  await updatePost(1);

  console.log('\n4. Patching post with ID 1...');
  await patchPost(1);

  console.log('\n5. Deleting post with ID 1...');
  await deletePost(1);
}

main().catch(console.error);
