/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDockerComposeService } from './dockerComposeTypes';
import { RuntimeGenesisConfig } from './specRelay';

/* eslint-disable @typescript-eslint/naming-convention */
export type ContainerManagementEngine = 'docker' | 'podman';

export interface IRepaConfig {
  version: number;
  /**
   * value of this will become COMPOSE_PROJECT_NAME env
   */
  projectName: string;
  cme: ContainerManagementEngine;
  relay: Relay;
}

export interface Relay {
  image: string;
  spec: Spec;
  env: Env;
  cmdFlags: string[];
  nodes: Node[];
}

export interface Spec {
  name: string;
  chainType: string;
  protocolId?: string;
  sudo?: string;
  runtimeGenesisConfig?: RuntimeGenesisConfig;
}

export interface Env extends Record<string, unknown> {
  RUST_LOG: string;
}

/**
 * Relay chain running node, usually docker service
 */
export interface Node {
  suri: string;
  name: string;
  /**
   * WebSocket port, this is what should be proxied
   */
  wsPort: number;
  /**
   * RPC server port. you an proxy this too
   */
  rpcPort: number;
  /**
   * libp2p communication port
   */
  port: number;
  /**
   * flags, extra stuff you want to pass at the end of the list, directly to the binary
   */
  cmdFlags?: string[];

  env?: Env;
  /**
   * assign the balance to the account that is generated from `suri`
   */
  balance: number;
  /**
   * Overrides for the docker-compose service
   */
  service?: IDockerComposeService;
  /**
   * directly merged with docker-compose top level networks
   */
  networks?: Record<string, any>;
}
