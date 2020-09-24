import {
  Logger,
  Checks,
  LogLevelDesc,
  LoggerProvider,
} from "@hyperledger/cactus-common";
import { NodeSSH } from "node-ssh";

export interface INodeShellSessionOptions {
  logLevel?: LogLevelDesc;
  ssh: NodeSSH;
}

export class NodeShellSession {
  public static readonly CLASS_NAME = "NodeShellSession";

  private readonly log: Logger;

  public get className() {
    return NodeShellSession.CLASS_NAME;
  }

  constructor(public readonly options: INodeShellSessionOptions) {
    const fnTag = `${this.className}#constructor()`;
    Checks.truthy(options, `${fnTag} arg options`);
    Checks.truthy(options.ssh, `${fnTag} arg options.ssh`);
    Checks.truthy(options.ssh.isConnected, `${fnTag} ssh.isConnected`);

    const level = this.options.logLevel || "INFO";
    const label = this.className;
    this.log = LoggerProvider.getOrCreate({ level, label });
  }

  public async getFlowNames(): Promise<string[]> {
    const res = await this.options.ssh.execCommand("flow list");
    return res.stdout.split("\n");
  }
}
