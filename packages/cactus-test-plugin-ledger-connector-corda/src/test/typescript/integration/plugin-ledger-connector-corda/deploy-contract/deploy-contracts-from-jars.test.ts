import { AddressInfo } from "net";
import fs from "fs";
import path from "path";

import test, { Test } from "tape";

import { CordaTestLedger } from "@hyperledger/cactus-test-tooling";

import {
  Configuration,
  DefaultApi,
  PluginLedgerConnectorCorda,
  DeployContractJarsV1Request,
} from "@hyperledger/cactus-plugin-ledger-connector-corda";

import { ApiClient } from "@hyperledger/cactus-sdk";

test("deploys contracts via .jar files", async (t: Test) => {
  const ledger = new CordaTestLedger({
    containerImageVersion: "latest",
    containerImageName: "caio", // FIXME after local testing has been finished
    logLevel: "TRACE",
  });

  test.onFinish(async () => {
    await ledger.stop();
    await ledger.destroy();
  });

  await ledger.start(true); // FIXME
  await ledger.logDebugPorts();

  const corDappsDirA = await ledger.getCorDappsDirPartyA();
  const corDappsDirB = await ledger.getCorDappsDirPartyB();

  const sshConfig = await ledger.getSshConfig();

  // The corda test ledger is an alpine based container and as such it does not
  // have systemd, but supervisord instead so we must alter the start/stop CMDs
  const cordaStartCmd = "supervisorctl start partyA";
  const cordaStopCmd = "supervisorctl stop partyA";

  const connector = new PluginLedgerConnectorCorda({
    sshConfig,
    webAppOptions: { hostname: "127.0.0.1", port: 0 },
    logLevel: "TRACE",
    corDappsDir: corDappsDirA,
    cordaStartCmd,
    cordaStopCmd,
  });

  await connector.installWebServices(undefined);
  test.onFinish(() => connector.shutdown());

  const httpServer = connector
    .getHttpServer()
    .orElseThrow(() => new Error("No HTTP Server set on connector"));

  const addressInfo = httpServer.address() as AddressInfo;
  t.comment(`AddressInfo=${JSON.stringify(addressInfo)}`);

  const apiUrl = `http://${addressInfo.address}:${addressInfo.port}`;

  const configuration: Configuration = new Configuration({
    basePath: apiUrl,
  });
  const apiClient = new ApiClient(configuration).extendWith(DefaultApi);

  const cordappDir = "../../../../jar/cordapps/";

  const jarFilename1 = "workflows.jar";
  const jarFilename2 = "contracts.jar";

  const jarPath1 = path.join(__dirname, cordappDir, jarFilename1);
  const jarPath2 = path.join(__dirname, cordappDir, jarFilename2);

  const jar1B64 = fs.readFileSync(jarPath1, { encoding: "base64" });
  const jar2B64 = fs.readFileSync(jarPath2, { encoding: "base64" });

  const jarFile1 = { filename: jarFilename1, contentBase64: jar1B64 };
  const jarFile2 = { filename: jarFilename2, contentBase64: jar2B64 };

  const jarFiles = [jarFile1, jarFile2];
  const reqBody: DeployContractJarsV1Request = { jarFiles };

  const flowList1 = await connector.getFlowList();
  t.comment(`Flow List 1: ${JSON.stringify(flowList1)}`);

  const res = await apiClient.cordaDeployContractJarsV1(reqBody);
  t.equal(res.status, 200, "res.status === 200");

  const flowList2 = await connector.getFlowList();
  t.comment(`Flow List 2: ${JSON.stringify(flowList2)}`);
  t.end();
});
