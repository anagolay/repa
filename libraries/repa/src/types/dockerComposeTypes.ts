/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Small subset of real structure
 */
export interface IDockerCompose extends Record<string, unknown> {
  name?: string;
  version: string;
  services: Record<string, IDockerComposeService>;
  volumes: Record<string, any>;
  networks?: Record<string, any>;
}

export interface IDockerUlimits {
  nproc?: number;
  nofile?: {
    soft: number;
    hard: number;
  };
}

/**
 * Docker compose service
 */
export interface IDockerComposeService extends Record<string, unknown> {
  image: string;
  volumes: string[];
  container_name?: string;
  ports?: (string | number)[];
  labels?: Record<string, any>;
  command: string[] | string;
  networks?: string[];
  /**
   * https://docs.docker.com/compose/compose-file/#ulimits
   */
  ulimits?: IDockerUlimits;
}
