const fs = require("fs");

// Read the game.js file and try to evaluate it syntactically
const gameJsContent = fs.readFileSync("game.js", "utf8");

try {
  // Try to parse as JavaScript to check for syntax errors
  new Function(gameJsContent);
  console.log("✓ game.js syntax is valid");
} catch (e) {
  console.log("✗ Syntax error in game.js:");
  console.log(e.message);
  console.log("Line: " + e.stack);
}
