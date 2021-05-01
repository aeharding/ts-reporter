/**
 * Thrown when `git status` of your repo shows uncommited
 * work. Commit/stash your changes and try again.
 */
export class UncleanGitWorkingTreeError extends Error {
  constructor(message?: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UncleanGitWorkingTreeError.prototype);
  }
}

/**
 * Thrown when SIGINT detected
 */
export class InterruptError extends Error {
  constructor(message?: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InterruptError.prototype);
  }
}
