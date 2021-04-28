import execa from "execa";

export async function getRef() {
  const { stdout: ref } = await execa("git", [
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ]);

  if (ref.trim() === "HEAD")
    return (await execa("git", ["rev-parse", "HEAD"])).stdout;

  return ref;
}

export async function checkout(revision: string) {
  await execa("git", ["checkout", revision]);
}

export async function isClean() {
  const { stdout } = await execa("git", ["diff-index", "HEAD"]);

  return !stdout.trim();
}

export async function getHEADSha() {
  const { stdout } = await execa("git", ["rev-parse", "HEAD"]);

  return stdout;
}
