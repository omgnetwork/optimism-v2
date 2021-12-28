/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectWalletMethod } from 'selectors/setupSelector'
import { selectModalState } from 'selectors/uiSelector'

import useInterval from 'util/useInterval'

import {
  fetchBalances,
  fetchGas,
  addTokenList,
  fetchNFTs,
  fetchExits
} from 'actions/networkAction'

import { checkVersion } from 'actions/serviceAction';

import { closeAlert, closeError } from 'actions/uiAction';
import { selectAlert, selectError } from 'selectors/uiSelector';

import DepositModal from 'containers/modals/deposit/DepositModal';
import TransferModal from 'containers/modals/transfer/TransferModal';
import ExitModal from 'containers/modals/exit/ExitModal';

import LedgerConnect from 'containers/modals/ledger/LedgerConnect';
import AddTokenModal from 'containers/modals/addtoken/AddTokenModal';

//Farm
import FarmWrapper from 'containers/farm/FarmWrapper'
import FarmDepositModal from 'containers/modals/farm/FarmDepositModal';
import FarmWithdrawModal from 'containers/modals/farm/FarmWithdrawModal';

//Save
import SaveWrapper from 'containers/save/SaveWrapper'
import SaveDepositModal from 'containers/modals/save/SaveDepositModal'

//DAO
import DAO from 'containers/dao/Dao'
import TransferDaoModal from 'containers/modals/dao/TransferDaoModal'
import DelegateDaoModal from 'containers/modals/dao/DelegateDaoModal'
import DelegateDaoXModal from 'containers/modals/dao/DelegateDaoXModal'
import NewProposalModal from 'containers/modals/dao/NewProposalModal'

import { 
  fetchDaoBalance, 
  fetchDaoVotes, 
  fetchDaoBalanceX, 
  fetchDaoVotesX, 
  fetchDaoProposals, 
  getProposalThreshold 
} from 'actions/daoAction'

import Airdrop from 'containers/airdrop/Airdrop'

import { 
  fetchAirdropStatusL1,
  fetchAirdropStatusL2,
} from 'actions/airdropAction'

import { 
  getFS_Saves,
  getFS_Info,
} from 'actions/fixedAction'

//Wallet Functions
import Account from 'containers/account/Account'
import Transactions from 'containers/transactions/History'
import BobaScope from 'containers/bobaScope/BobaScope'

//Help page
import Help from 'containers/help/Help'

//NFT Example Page
import NFT from 'containers/nft/Nft'

import { useTheme } from '@material-ui/core/styles'
import { Box, Container, useMediaQuery } from '@material-ui/core'
import MainMenu from 'components/mainMenu/MainMenu'


import Alert from 'components/alert/Alert'

import { POLL_INTERVAL } from 'util/constant'

function Home () {

  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const errorMessage = useSelector(selectError)
  const alertMessage = useSelector(selectAlert)

  const [ mobileMenuOpen/*, setMobileMenuOpen*/ ] = useState(false)

  const pageDisplay = useSelector(selectModalState('page'))
  const depositModalState = useSelector(selectModalState('depositModal'))
  const transferModalState = useSelector(selectModalState('transferModal'))
  const exitModalState = useSelector(selectModalState('exitModal'))

  const fast = useSelector(selectModalState('fast'))
  const token = useSelector(selectModalState('token'))

  const addTokenModalState = useSelector(selectModalState('addNewTokenModal'))
  const ledgerConnectModalState = useSelector(selectModalState('ledgerConnectModal'))

  const saveDepositModalState = useSelector(selectModalState('saveDepositModal'))

  const farmDepositModalState = useSelector(selectModalState('farmDepositModal'))
  const farmWithdrawModalState = useSelector(selectModalState('farmWithdrawModal'))

  // DAO modal
  const tranferBobaDaoModalState = useSelector(selectModalState('transferDaoModal'))
  const delegateBobaDaoModalState = useSelector(selectModalState('delegateDaoModal'))
  const delegateBobaDaoXModalState = useSelector(selectModalState('delegateDaoXModal'))
  const proposalBobaDaoModalState = useSelector(selectModalState('newProposalModal'))

  const walletMethod = useSelector(selectWalletMethod())
  //const transactions = useSelector(selectlayer2Transactions, isEqual);

  const handleErrorClose=()=>dispatch(closeError())
  const handleAlertClose=()=>dispatch(closeAlert())

  useEffect(() => {
    const body = document.getElementsByTagName('body')[0];
    mobileMenuOpen
      ? body.style.overflow = 'hidden'
      : body.style.overflow = 'auto';
  }, [ mobileMenuOpen ]);

  // calls only on boot
  useEffect(() => {
    window.scrollTo(0, 0)
    dispatch(addTokenList()) //only need to do this boot
  }, [ dispatch ])

  //get all account balances
  useInterval(() => {
    dispatch(fetchBalances())
    dispatch(fetchNFTs())
    dispatch(fetchAirdropStatusL1())
    dispatch(fetchAirdropStatusL2())
    dispatch(fetchDaoBalance())
    dispatch(fetchDaoVotes())
    dispatch(fetchDaoBalanceX())
    dispatch(fetchDaoVotesX())
    dispatch(fetchDaoProposals())
    dispatch(getProposalThreshold())
    dispatch(fetchGas())
    dispatch(fetchExits())
    dispatch(getFS_Saves())
    dispatch(getFS_Info())
  }, POLL_INTERVAL)

  useEffect(() => {
    checkVersion()
  }, [])

  return (
    <>
      {!!depositModalState && <DepositModal  open={depositModalState}  token={token} fast={fast} />}
      {!!transferModalState && <TransferModal open={transferModalState} token={token} fast={fast} />} 
      {!!exitModalState && <ExitModal open={exitModalState} token={token} fast={fast} />}

      {!!addTokenModalState  && <AddTokenModal   open={addTokenModalState} />}

      {!!saveDepositModalState && <SaveDepositModal  open={saveDepositModalState} />}

      {!!farmDepositModalState && <FarmDepositModal  open={farmDepositModalState} />}
      {!!farmWithdrawModalState && <FarmWithdrawModal open={farmWithdrawModalState} />}

      {!!tranferBobaDaoModalState && <TransferDaoModal open={tranferBobaDaoModalState} />}
      {!!delegateBobaDaoModalState && <DelegateDaoModal open={delegateBobaDaoModalState} />}
      {!!delegateBobaDaoXModalState && <DelegateDaoXModal open={delegateBobaDaoXModalState} />}
      {!!proposalBobaDaoModalState && <NewProposalModal open={proposalBobaDaoModalState} />}

      <Alert
        type='error'
        duration={0}
        open={!!errorMessage}
        onClose={handleErrorClose}
        position={50}
      >
        {errorMessage}
      </Alert>

      <Alert
        type='success'
        duration={0}
        open={!!alertMessage}
        onClose={handleAlertClose}
        position={0}
      >
        {alertMessage}
      </Alert>

      <LedgerConnect
        open={walletMethod === 'browser'
          ? ledgerConnectModalState
          : false
        }
      />

      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%' }}>
        <MainMenu />
        <Container maxWidth="lg" sx={{marginLeft: 'unset' , marginRight: 'unset'}}>
          {pageDisplay === "AccountNow" &&
            <Account/>
          }
          {pageDisplay === "History" &&
            <Transactions/>
          }
          {pageDisplay === "BobaScope" &&
            <BobaScope/>
          }
          {pageDisplay === "NFT" &&
            <NFT/>
          }
          {pageDisplay === "Farm" &&
            <FarmWrapper/>
          }
          {pageDisplay === "Save" &&
            <SaveWrapper/>
          }
          {pageDisplay === "DAO" &&
            <DAO/>
          }
          {pageDisplay === "Airdrop" &&
            <Airdrop/>
          }
          {pageDisplay === "Help" &&
            <Help/>
          }
        </Container>
      </Box>
    </>
  );
}

export default React.memo(Home)
