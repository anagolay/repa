import shell from "shelljs";

/**
 * Execute shell command
 *
 * @param cmd
 * @param options
 */
export function exec(
  cmd: string,
  options?: {
    silent?: boolean;
    fatal?: boolean;
  }
): shell.ShellString {
  const { silent, fatal = true } = options || {};
  if (!silent) {
    console.log(`$ ${cmd}`);
  }
  const res = shell.exec(cmd, { silent: true });
  if (res.code !== 0) {
    console.error("Error: Command failed with code", res.code);
    console.log(res);
    if (fatal) {
      process.exit(1);
    }
  }
  return res;
}
