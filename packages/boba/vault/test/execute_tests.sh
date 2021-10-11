#!/bin/bash

trap 'catch' EXIT
catch() {
  if [ "$RUN_TEST" == "true" ]; then
    echo "Done with tests."
	else
			echo "Not exiting, waiting for Vault pid to exit."
      ps $(pidof vault) -o pid | grep -w $(pidof vault) >/dev/null 2>&1
      while [ "$?" == "0" ]
      do
        sleep 10
        ps $(pidof vault) -o pid | grep -w $(pidof vault) >/dev/null 2>&1
      done
	fi
}

function test_banner {
    echo "************************************************************************************************************************************"
}

function test_plugin {
	if [ "$RUN_TEST" == "true" ]; then
    test_banner
		test_banner
		echo "SMOKE TEST BASIC WALLET FUNCTIONALITY"
		test_banner
		/vault/test/smoke.wallet.sh
		test_banner
		echo "SMOKE TEST OVM SUBMIT BATCH"
		test_banner
		/vault/test/smoke.ovm.sh
		echo "SMOKE TEST OVM CUSTOM ENCODING"
		test_banner
		/vault/test/smoke.encode_asb.sh
	else
			echo "Skipping tests."
	fi
}

test_plugin
