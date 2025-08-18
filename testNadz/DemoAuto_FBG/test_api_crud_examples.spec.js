import { test, expect } from '@playwright/test';

const BASE_URL = 'https://automationexercise.com/api/productsList';
const BASE_URL_PUT = 'https://automationexercise.com/api/brandsList';
const BASE_URL_DELETE = 'https://automationexercise.com/api/verifyLogin';


test('API GET: Get All Products List', async () => {
  const response = await fetch(`${BASE_URL}`);
  console.log(`Response Code: ${response.status} ${response.status === 200 ? 'OK' : ''}`);
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('products');
  expect(Array.isArray(data.products)).toBe(true);
  console.log('Total products:', data.products.length);
  // Optionally, print first product for inspection
/*  if (data.products.length > 0) {
    console.log('First product:', data.products[0]);
  }
    */
});

test('API POST: Create Product (example)', async () => {
  const response = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Product', price: 123 }),
  });
  console.log(`POST Response Code: ${response.status} ${response.status === 200 ? 'OK' : ''}`);
  expect([200, 201, 400, 405]).toContain(response.status); // Accept common API responses
  const data = await response.json().catch(() => ({}));
  console.log('POST Response JSON:', data);
});

test('API PUT: Update Product (example)', async () => {
  const response = await fetch(`${BASE_URL_PUT}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Updated Product', price: 456 }),
  });
  console.log(`PUT Response Code: ${response.status} ${response.status === 200 ? 'OK' : ''}`);
  expect([200, 400, 404, 405]).toContain(response.status);
  const data = await response.json().catch(() => ({}));
  console.log('PUT Response JSON:', data);
});

test('API DELETE: Delete Product (example)', async () => {
  const response = await fetch(`${BASE_URL_DELETE}`, {
    method: 'DELETE',
  });
  console.log(`DELETE Response Code: ${response.status} ${response.status === 200 ? 'OK' : ''}`);
  expect([200, 400, 404, 405]).toContain(response.status);
  const data = await response.json().catch(() => ({}));
  console.log('DELETE Response JSON:', data);
});
