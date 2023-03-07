/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
export interface RelayPlainSpec {
  name: string;
  id: string;
  chainType: string;
  bootNodes: any[];
  telemetryEndpoints: any;
  protocolId: string;
  properties: any;
  forkBlocks: any;
  badBlocks: any;
  lightSyncState: any;
  codeSubstitutes: CodeSubstitutes;
  genesis: Genesis;
}

export interface CodeSubstitutes {}

export interface Genesis {
  runtime: Runtime;
}

export interface Runtime {
  runtime_genesis_config: RuntimeGenesisConfig;
  session_length_in_blocks: number;
}

export interface RuntimeGenesisConfig {
  system: System;
  babe: Babe;
  indices: Indices;
  balances: Balances;
  session: Session;
  grandpa: Grandpa;
  imOnline: ImOnline;
  authorityDiscovery: AuthorityDiscovery;
  democracy: Democracy;
  council: Council;
  technicalCommittee: TechnicalCommittee;
  phragmenElection: PhragmenElection;
  technicalMembership: TechnicalMembership;
  treasury: any;
  claims: Claims;
  vesting: Vesting;
  nisCounterpartBalances: NisCounterpartBalances;
  configuration: Configuration;
  paras: Paras;
  hrmp: Hrmp;
  registrar: Registrar;
  xcmPallet: XcmPallet;
  beefy: Beefy;
  sudo: Sudo;
}

export interface System {
  code: string;
}

export interface Babe {
  authorities: any[];
  epochConfig: EpochConfig;
}

export interface EpochConfig {
  c: number[];
  allowed_slots: string;
}

export interface Indices {
  indices: any[];
}

export interface Balances {
  balances: [string, number][];
}

export type SessionKey = [string, string, Key];

export interface Session {
  keys: SessionKey[];
}

export interface Key {
  grandpa: string;
  babe: string;
  im_online: string;
  parachain_validator: string;
  authority_discovery: string;
  para_validator: string;
  para_assignment: string;
  beefy: string;
}

export interface Grandpa {
  authorities: any[];
}

export interface ImOnline {
  keys: any[];
}

export interface AuthorityDiscovery {
  keys: any[];
}

export interface Democracy {
  phantom: any;
}

export interface Council {
  phantom: any;
  members: any[];
}

export interface TechnicalCommittee {
  phantom: any;
  members: any[];
}

export interface PhragmenElection {
  members: any[];
}

export interface TechnicalMembership {
  members: any[];
  phantom: any;
}

export interface Claims {
  claims: any[];
  vesting: any[];
}

export interface Vesting {
  vesting: any[];
}

export interface NisCounterpartBalances {
  balances: any[];
}

export interface Configuration {
  config: Config;
}

export interface Config {
  max_code_size: number;
  max_head_data_size: number;
  max_upward_queue_count: number;
  max_upward_queue_size: number;
  max_upward_message_size: number;
  max_upward_message_num_per_candidate: number;
  hrmp_max_message_num_per_candidate: number;
  validation_upgrade_cooldown: number;
  validation_upgrade_delay: number;
  max_pov_size: number;
  max_downward_message_size: number;
  ump_service_total_weight: UmpServiceTotalWeight;
  hrmp_max_parachain_outbound_channels: number;
  hrmp_max_parathread_outbound_channels: number;
  hrmp_sender_deposit: number;
  hrmp_recipient_deposit: number;
  hrmp_channel_max_capacity: number;
  hrmp_channel_max_total_size: number;
  hrmp_max_parachain_inbound_channels: number;
  hrmp_max_parathread_inbound_channels: number;
  hrmp_channel_max_message_size: number;
  code_retention_period: number;
  parathread_cores: number;
  parathread_retries: number;
  group_rotation_frequency: number;
  chain_availability_period: number;
  thread_availability_period: number;
  scheduling_lookahead: number;
  max_validators_per_core: number;
  max_validators: any;
  dispute_period: number;
  dispute_post_conclusion_acceptance_period: number;
  dispute_conclusion_by_time_out_period: number;
  no_show_slots: number;
  n_delay_tranches: number;
  zeroth_delay_tranche_width: number;
  needed_approvals: number;
  relay_vrf_modulo_samples: number;
  ump_max_individual_weight: UmpMaxIndividualWeight;
  pvf_checking_enabled: boolean;
  pvf_voting_ttl: number;
  minimum_validation_upgrade_delay: number;
}

export interface UmpServiceTotalWeight {
  ref_time: number;
  proof_size: number;
}

export interface UmpMaxIndividualWeight {
  ref_time: number;
  proof_size: number;
}

export interface Paras {
  paras: any[];
}

export interface Hrmp {
  preopenHrmpChannels: any[];
}

export interface Registrar {
  nextFreeParaId: number;
}

export interface XcmPallet {
  safeXcmVersion: number;
}

export interface Beefy {
  authorities: any[];
}

export interface Sudo {
  key: string;
}
