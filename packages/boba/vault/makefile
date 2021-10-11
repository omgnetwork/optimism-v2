.ONESHELL:

abigen:
	docker run -d --rm -it --name ovm_contracts --entrypoint /bin/bash omgx/deployer:latest
	sleep 5s
	docker cp ovm_contracts:/opt/optimism/packages/contracts/artifacts /tmp/oc
	docker stop ovm_contracts
	docker run --rm -it --name abigen -v /tmp/oc:/tmp/oc --entrypoint /bin/sh ethereum/client-go:alltools-v1.9.16 -c "apk add jq && cat /tmp/oc/contracts/optimistic-ethereum/OVM/chain/OVM_StateCommitmentChain.sol/OVM_StateCommitmentChain.json | jq .abi | abigen --abi - --pkg ovm_scc --out /tmp/oc/ovm_scc.go && cat /tmp/oc/contracts/optimistic-ethereum/OVM/chain/OVM_CanonicalTransactionChain.sol/OVM_CanonicalTransactionChain.json | jq .abi | abigen --abi - --pkg ovm_ctc --out /tmp/oc/ovm_ctc.go && cat /tmp/oc/contracts/optimistic-ethereum/OVM/bridge/messaging/OVM_L1CrossDomainMessenger.sol/OVM_L1CrossDomainMessenger.json | jq .abi | abigen --abi - --pkg ovm_l1cdm --out /tmp/oc/ovm_l1cdm.go"
	mkdir contracts/ovm_ctc || true
	mkdir contracts/ovm_scc || true
	mkdir contracts/ovm_l1cdm || true
	cp /tmp/oc/ovm_ctc.go contracts/ovm_ctc
	cp /tmp/oc/ovm_scc.go contracts/ovm_scc
	cp /tmp/oc/ovm_l1cdm.go contracts/ovm_l1cdm
	rm -rf /tmp/oc
