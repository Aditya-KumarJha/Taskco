/**
 * Global teardown for Jest tests
 * Ensures all async operations are cleaned up properly
 */
export default async function globalTeardown() {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (global.gc) {
    global.gc();
  }
}
