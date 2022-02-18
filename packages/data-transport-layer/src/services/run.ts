/* Imports: External */
import * as dotenv from 'dotenv'
import { Bcfg } from '@eth-optimism/core-utils'
import Config from 'bcfg'

/* Imports: Internal */
import { L1DataTransportService } from './main/service'

type ethNetwork = 'mainnet' | 'kovan' | 'goerli'
;(async () => {
  try {
    dotenv.config()

    const config: Bcfg = new Config('data-transport-layer')
    config.load({
      env: true,
      argv: true,
    })

    const service = new L1DataTransportService({
      nodeEnv: config.str('node-env', 'development'),
      ethNetworkName: config.str('eth-network-name') as ethNetwork,
      release: `data-transport-layer@${process.env.npm_package_version}`,
      dbPath: config.str('db-path', './db'),
      port: config.uint('server-port', 7878),
      arPort: config.uint('registry-port', 8081),
      hostname: config.str('server-hostname', 'localhost'),
      confirmations: config.uint('confirmations', 35),
      l1RpcProvider: config.str('l1-rpc-endpoint'),
      cfgAddressManager: config.str('address-manager'), // Legacy option. New method sets this when the deployer registers it
      pollingInterval: config.uint('polling-interval', 5000),
      logsPerPollingInterval: config.uint('logs-per-polling-interval', 2000),
      dangerouslyCatchAllErrors: config.bool(
        'dangerously-catch-all-errors',
        false
      ),
      l2RpcProvider: config.str('l2-rpc-endpoint'),
      l2ChainId: config.uint('l2-chain-id'),
      syncFromL1: config.bool('sync-from-l1', true),
      syncFromL2: config.bool('sync-from-l2', false),
      transactionsPerPollingInterval: config.uint(
        'transactions-per-polling-interval',
        1000
      ),
      legacySequencerCompatibility: config.bool(
        'legacy-sequencer-compatibility',
        false
      ),
      defaultBackend: config.str('default-backend', 'l1'),
      l1GasPriceBackend: config.str('l1-gas-price-backend', 'l1'),
      useSentry: config.bool('use-sentry', false),
      sentryDsn: config.str('sentry-dsn'),
      sentryTraceRate: config.ufloat('sentry-trace-rate', 0.05),
      ctcDeploymentHeight: config.uint('eth1-ctc-deployment-height') || 0,
    })

    await service.start()
  } catch (err) {
    console.error(
      `Well, that's that. We ran into a fatal error. Here's the dump. Goodbye!`
    )

    throw err
  }
})()
