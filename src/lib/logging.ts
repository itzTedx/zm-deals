import chalk from "chalk";

/**
 * Creates a logger with chalk-styled console output for various log levels.
 * Provides better visual distinction between different types of logs.
 *
 * @param label - Optional label to prefix log messages; defaults to "App"
 * @returns An object with `info`, `success`, `warn`, `error`, `debug`, and `verbose` methods
 */
export function createLog(label = "App") {
  const timestamp = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 2,
    });
    const dateString = now.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      hour12: false,
    });
    return chalk.gray(`[${dateString} ${timeString}]`);
  };
  const labelText = chalk.cyan(`[${label}]`);

  // Helper function to format arguments properly
  const formatArgs = (args: unknown[]): string => {
    return args
      .map((arg) => {
        if (typeof arg === "object" && arg !== null) {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      })
      .join(" ");
  };

  return {
    /**
     * Logs informational messages in blue
     */
    info: (...args: unknown[]) => {
      console.log(`${timestamp()} ${chalk.blue("ℹ")} ${labelText} ${chalk.blue(formatArgs(args))}`);
    },

    /**
     * Logs success messages in green
     */
    success: (...args: unknown[]) => {
      console.log(`${timestamp()} ${chalk.green("✓")} ${labelText} ${chalk.green(formatArgs(args))}`);
    },

    /**
     * Logs warning messages in yellow
     */
    warn: (...args: unknown[]) => {
      console.log(`${timestamp()} ${chalk.yellow("⚠")} ${labelText} ${chalk.yellow(formatArgs(args))}`);
    },

    /**
     * Logs error messages in red
     */
    error: (...args: unknown[]) => {
      console.error(`${timestamp()} ${chalk.red("✗")} ${labelText} ${chalk.red(formatArgs(args))}`);
    },

    /**
     * Logs debug messages in magenta (only in development)
     */
    debug: (...args: unknown[]) => {
      // biome-ignore lint/style/noProcessEnv: NODE_ENV is a standard Node.js environment variable
      if (process.env.NODE_ENV === "development") {
        console.log(`${timestamp()} ${chalk.magenta("🔍")} ${labelText} ${chalk.magenta(formatArgs(args))}`);
      }
    },

    /**
     * Logs verbose messages in gray (only in development)
     */
    verbose: (...args: unknown[]) => {
      // biome-ignore lint/style/noProcessEnv: NODE_ENV is a standard Node.js environment variable
      if (process.env.NODE_ENV === "development") {
        console.log(`${timestamp()} ${chalk.gray("📝")} ${labelText} ${chalk.gray(formatArgs(args))}`);
      }
    },

    /**
     * Logs data objects in a formatted way
     */
    data: (data: unknown, title?: string) => {
      const dataTitle = title ? chalk.cyan(title) : chalk.cyan("Data");
      console.log(
        `${timestamp()} ${chalk.blue("📊")} ${labelText} ${dataTitle}:`,
        chalk.white(JSON.stringify(data, null, 2))
      );
    },

    /**
     * Logs performance metrics
     */
    perf: (operation: string, duration: number) => {
      const color = duration < 100 ? chalk.green : duration < 500 ? chalk.yellow : chalk.red;
      console.log(
        `${timestamp()} ${chalk.blue("⚡")} ${labelText} ${chalk.cyan(operation)}: ${color(`${duration}ms`)}`
      );
    },

    /**
     * Logs HTTP requests
     */
    http: (method: string, url: string, status?: number) => {
      const statusColor = status ? (status < 300 ? chalk.green : status < 400 ? chalk.yellow : chalk.red) : chalk.white;

      console.log(
        `${timestamp()} ${chalk.blue("🌐")} ${labelText} ${chalk.cyan(method)} ${chalk.white(url)} ${status ? statusColor(`(${status})`) : ""}`
      );
    },

    /**
     * Logs database operations
     */
    db: (operation: string, table?: string) => {
      const tableText = table ? chalk.yellow(`[${table}]`) : "";
      console.log(`${timestamp()} ${chalk.blue("🗄️")} ${labelText} ${chalk.cyan(operation)} ${tableText}`);
    },

    /**
     * Logs authentication events
     */
    auth: (event: string, userId?: string) => {
      const userText = userId ? chalk.yellow(`(${userId})`) : "";
      console.log(`${timestamp()} ${chalk.blue("🔐")} ${labelText} ${chalk.cyan(event)} ${userText}`);
    },

    /**
     * Logs file operations
     */
    file: (operation: string, path: string) => {
      console.log(`${timestamp()} ${chalk.blue("📁")} ${labelText} ${chalk.cyan(operation)} ${chalk.white(path)}`);
    },

    /**
     * Creates a section divider
     */
    section: (title: string) => {
      const divider = "=".repeat(50);
      console.log(`\n${chalk.blue(divider)}\n${chalk.cyan.bold(` ${title} `)}\n${chalk.blue(divider)}\n`);
    },

    /**
     * Creates a subsection divider
     */
    subsection: (title: string) => {
      const divider = "-".repeat(30);
      console.log(`\n${chalk.gray(divider)}\n${chalk.cyan(` ${title} `)}\n${chalk.gray(divider)}`);
    },

    /**
     * Logs a progress indicator
     */
    progress: (current: number, total: number, label?: string) => {
      const percentage = Math.round((current / total) * 100);
      const progressBar = "█".repeat(Math.floor(percentage / 5)) + "░".repeat(20 - Math.floor(percentage / 5));
      const labelText = label ? chalk.cyan(label) : "";

      console.log(
        `${timestamp()} ${chalk.blue("📈")} ${labelText} ${chalk.green(progressBar)} ${chalk.white(`${percentage}%`)} (${current}/${total})`
      );
    },
  };
}
