/* eslint-disable @typescript-eslint/no-explicit-any */
import { spawn } from "child_process";
import { equals, includes, join, mergeDeepRight } from "ramda";
import slug from "slug";

import { generateNodeKey } from "./helpers";
import {
  IDockerCompose,
  IDockerComposeService,
  IDockerUlimits,
} from "./types/dockerComposeTypes";
import { IRepaConfig } from "./types/relayChainTypes";
/**
 * docker run ....
 * @param image -
 * @param before -
 * @param after -
 * @returns
 */
export async function dockerRun(
  image: string,
  before: string[],
  after: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["run", ...before, image, ...after];
    const cmd = `docker ${join(" ", args)}`;

    console.debug(cmd);

    const c = spawn("docker", args);

    /**
     * will hold our spec
     */
    const bufferArray: any[] = [];

    c.stdout.on("data", (data) => {
      bufferArray.push(data);
    });
    c.stderr.on("data", (data) => {
      if (!includes("Building chain spec", data)) {
        console.log(`stderr: ${data}`);
        reject(data);
      }
    });

    c.on("close", (code: number) => {
      console.debug(`child process exited with code ${code}`);
      const spec: Record<string, any> = Buffer.concat(bufferArray);
      resolve(spec.toString());
    });
  });
}
/**
 * Generate docker-compose.yml file based on the config
 * @param params
 */
export async function generateRelayDockerCompose(
  config: IRepaConfig,
  outputAppDir: string,
  rawSpecsFileName: string
): Promise<any> {
  const { env: globalEnv, cmdFlags: globalFlags, nodes, image } = config.relay;
  const dockerCompose: IDockerCompose = {
    name: `relaychain_${config.relay.spec.chainType}`,
    version: "3",
    services: {},
    volumes: {},
    networks: {},
  };
  const ulimits: IDockerUlimits = {
    nofile: {
      soft: 65536,
      hard: 65536,
    },
  };
  // generate node key, we are doing this only one time, we could do it for every service for deterministic networking
  const { key: nodeKey, address: nodeAddress } = generateNodeKey(
    config.relay.image
  );

  for (let idx = 0; idx < nodes.length; idx++) {
    const { name, cmdFlags, env, service, port, wsPort, rpcPort, networks } =
      nodes[idx];

    const serviceName = slug(name);

    const ports = [
      ...(!wsPort ? [] : [`${wsPort || 9944 + idx}:9944`]),
      ...(!rpcPort ? [] : [`${rpcPort || 9933 + idx}:9933`]),
      ...(!port ? [] : [`${port || 30333 + idx}:30333`]),
    ];

    let nodeKeyOrBootnode: string = `--node-key=${nodeKey}`;
    let dependsOn: string[] = [];
    if (!equals(idx, 0)) {
      // currently assuming that the relay1 has libp2p port on the 30333, shoudl fix this
      const firstNode = nodes[0];
      const firstNodeServiceName = slug(firstNode.name);
      nodeKeyOrBootnode = `--bootnodes=/dns/${firstNodeServiceName}/tcp/30333/p2p/${nodeAddress}`;

      dependsOn = [firstNodeServiceName];
    }
    const svc: IDockerComposeService = {
      image,
      container_name: slug(join("-", [name, idx])),
      volumes: [`${name}:/data`, `${outputAppDir}:/app`],
      ports,
      command: [
        "--base-path=/data",
        `--chain=/app/${rawSpecsFileName}`,
        "--validator",
        "--ws-external",
        "--rpc-external",
        "--rpc-cors=all",
        `--name=${name}`,
        // '--listen-addr=/ip4/0.0.0.0/tcp/30333',
        ...(globalFlags || []),
        ...(cmdFlags || []),
        nodeKeyOrBootnode,
      ],
      environment: mergeDeepRight(globalEnv, env || {}),
      labels: service?.labels || [],
      networks: service?.networks || [],
      ulimits,
      depends_on: dependsOn,
    };

    dockerCompose.services[serviceName] = svc;
    dockerCompose.volumes[name] = {};
    dockerCompose.networks = { ...dockerCompose.networks, ...networks };
  }

  return dockerCompose;
}
