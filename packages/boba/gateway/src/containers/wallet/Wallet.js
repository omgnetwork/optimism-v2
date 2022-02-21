import { Circle } from "@mui/icons-material";
import { Box, Typography } from '@mui/material';
import { switchChain } from "actions/setupAction";
import PageTitle from "components/pageTitle/PageTitle";
import Tabs from 'components/tabs/Tabs'
import Nft from "containers/wallet/nft/Nft";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { selectAccountEnabled, selectLayer } from "selectors/setupSelector";
import Token from "./token/Token";
import * as S from './wallet.styles';


function Wallet() {

  const [ page, setPage ] = useState('TOKEN')
  const [ chain, setChain ] = useState('TOKEN')

  const dispatch = useDispatch();

  const layer = useSelector(selectLayer());
  const accountEnabled = useSelector(selectAccountEnabled())

  useEffect(() => {
    if (layer === 'L2') {
      setChain('Boba Wallet')
    } else if (layer === 'L1') {
      setChain('Ethereum Wallet')
    }
  }, [ layer ])


  const handleSwitch = (l) => {
    if (l === 'Ethereum Wallet') {
      dispatch(switchChain('L1'))
    } else if (l === 'Boba Wallet') {
      dispatch(switchChain('L2'))
    }
  }

  return (
    <S.PageContainer>
      <S.PageSwitcher>
        <Typography
          className={page === 'TOKEN' ? 'active' : ''}
          onClick={() => { setPage('TOKEN'); console.log('Switching to Wallet') }}
          variant="body2"
          component="span"
          color="white">
          Token
        </Typography>
        <Typography
          className={page === 'NFT' ? 'active' : ''}
          onClick={() => { setPage('NFT'); console.log('Switching to NFT') }}
          variant="body2"
          component="span"
          color="white">
          NFT
        </Typography>
      </S.PageSwitcher>
      {
        !accountEnabled ?
          <Typography variant="body2" sx={{ color: '#FF6A55' }}><Circle sx={{ height: "10px", width: "10px" }} /> Disconnected</Typography>
          : <Typography variant="body2" sx={{ color: '#BAE21A' }}><Circle sx={{ height: "10px", width: "10px" }} /> Connected</Typography>
      }
      {page === 'TOKEN' ?
        <Box sx={{my:2}}>
          {!!accountEnabled ? <Tabs
            activeTab={chain}
            onClick={(t) => handleSwitch(t)}
            aria-label="Liquidity Pool Tab"
            tabs={[ "Ethereum Wallet", "Boba Wallet" ]}
          /> : null}
          <Token />
        </Box>
        : <Nft />}

    </S.PageContainer>
  )
}

export default React.memo(Wallet)
