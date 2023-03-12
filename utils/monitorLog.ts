import { timeStamp } from "./timeStamp"
import dotenv from "dotenv"
dotenv.config()


class Monitor {
  log(...args: (string | undefined)[]) {
    console.log(`[${timeStamp()} ${process.env.npm_package_name} Monitor]`, args.filter(arg => arg !== undefined).join(' '))
  }
}

export const monitor = new Monitor()
