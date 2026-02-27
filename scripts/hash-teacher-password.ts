export {};
const bcrypt = require("bcryptjs") as { hash(value: string, rounds: number): Promise<string> };

async function main() {
  const input = process.argv[2];
  if (!input || !input.trim()) {
    console.error("Usage: npm run teacher:hash -- \"your-plain-password\"");
    process.exit(1);
  }

  const hash = await bcrypt.hash(input.trim(), 10);
  console.log(hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});