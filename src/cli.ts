#!/usr/bin/env -S deno run -A
// create-html-props CLI: Scaffolds a new html-props project
import { copy } from "@std/fs";
import { join } from "@std/path";

function printHelp() {
  console.log(
    `Usage: create-html-props <project-name>\n\nScaffold a new html-props project in a directory.\n`,
  );
}

if (import.meta.main) {
  const [projectName] = Deno.args;
  if (!projectName || projectName === "-h" || projectName === "--help") {
    printHelp();
    Deno.exit(1);
  }

  const templateDir = join(import.meta.dirname ?? ".", "../template");
  const targetDir = join(Deno.cwd(), projectName);

  try {
    await copy(templateDir, targetDir, { overwrite: false });
    console.log(`\n✔ Project created in ${targetDir}`);
    console.log("\nNext steps:");
    console.log(`  cd ${projectName}`);
    console.log(`  deno task dev`);
  } catch (err) {
    if (err instanceof Deno.errors.AlreadyExists) {
      console.error(`Error: Directory '${projectName}' already exists.`);
    } else {
      throw err;
    }
    Deno.exit(1);
  }
}
