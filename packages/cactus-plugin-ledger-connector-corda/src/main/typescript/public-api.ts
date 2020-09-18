export {
  PluginLedgerConnectorCorda,
  IPluginLedgerConnectorCordaOptions,
} from "./plugin-ledger-connector-corda";

export * from "./generated/openapi/typescript-axios/index";

export { PluginFactoryLedgerConnector } from "./plugin-factory-ledger-connector";

export {
  DeployContractJarsEndpoint,
  IDeployContractEndpointOptions,
} from "./web-services/deploy-contract-jars-endpoint";

import { PluginFactoryLedgerConnector } from "./plugin-factory-ledger-connector";

export async function createPluginFactory(
  options?: any
): Promise<PluginFactoryLedgerConnector> {
  return new PluginFactoryLedgerConnector();
}
