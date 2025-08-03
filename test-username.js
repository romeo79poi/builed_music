// Simple test for username validation
function validateUsername(username) {
  // Username validation
  if (!username || username.length < 3) {
    return { 
      valid: false, 
      error: "Username must be at least 3 characters long" 
    };
  }

  if (username.length > 20) {
    return { 
      valid: false, 
      error: "Username must be 20 characters or less" 
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { 
      valid: false, 
      error: "Username can only contain letters, numbers, and underscores" 
    };
  }

  // Check if reserved username
  const reservedUsernames = ['admin', 'root', 'api', 'www', 'mail', 'ftp', 'localhost', 'test', 'demo', 'support', 'help'];
  if (reservedUsernames.includes(username.toLowerCase())) {
    return { 
      valid: false, 
      error: "This username is reserved" 
    };
  }

  return { valid: true, error: null };
}

// Test the username "Pagal"
const result = validateUsername("Pagal");
console.log('Username "Pagal" validation result:', result);

// Test some other usernames
const testUsernames = ["test", "admin", "valid_user", "us", "a".repeat(25), "invalid-user"];
testUsernames.forEach(username => {
  const result = validateUsername(username);
  console.log(`Username "${username}": ${result.valid ? 'VALID' : 'INVALID - ' + result.error}`);
});
