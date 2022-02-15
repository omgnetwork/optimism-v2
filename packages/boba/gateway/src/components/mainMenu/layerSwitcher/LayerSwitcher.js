
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

import { IconButton, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/styles'
import { switchChain } from 'actions/setupAction.js'
import BobaIcon from 'components/icons/BobaIcon.js'
import EthereumIcon from 'components/icons/EthereumIcon.js'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAccountEnabled, selectJustSwitchedChain, selectLayer } from 'selectors/setupSelector'
import * as S from './LayerSwitcher.styles.js'

import networkService from 'services/networkService';
import truncate from 'truncate-middle';
import WalletPicker from 'components/walletpicker/WalletPicker.js'
import Button from 'components/button/Button.js'

function LayerSwitcher({ isButton = false, size, fullWidth = false }) {

  const dispatch = useDispatch()
  const accountEnabled = useSelector(selectAccountEnabled())
  const justSwitchedChain = useSelector(selectJustSwitchedChain())
  let layer = useSelector(selectLayer())

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const wAddress = networkService.account ? truncate(networkService.account, 6, 4, '...') : '';

  console.log("LS: Layer:", layer)
  console.log("LS: accountEnabled:", accountEnabled)
  console.log("LS: justSwitchedChain:", justSwitchedChain)

  const dispatchSwitchLayer = useCallback((targetLayer) => {
    console.log("LS: switchLayer accountEnabled:", accountEnabled)
    console.log("LS: targetLayer:", targetLayer)
    //if (!accountEnabled) return
    //dispatch(setLayer(layer))
    if (!layer) {
      dispatch(switchChain('L2'))
    }
    else if (layer === 'L1' && targetLayer === 'L2') {
      dispatch(switchChain('L2'))
    }
    else if (layer === 'L2' && targetLayer === 'L1') {
      dispatch(switchChain('L1'))
    }
    else {
      // do nothing - we are on the correct chain
    }
  }, [ dispatch, accountEnabled, layer ])

  if (isButton) {
    return (
      <S.LayerSwitcherWrapperMobile>
        <S.LayerWrapper>
          {!layer ? <WalletPicker /> : layer === 'L1' ? 
            <Button
              type="primary"
              variant="contained"
              size='small'
              fullWidth={fullWidth}
              onClick={() => dispatchSwitchLayer('L2')}
            >
              Switch
            </Button> :
            <Button
              type="primary"
              variant="contained"
              size='small'
              fullWidth={fullWidth}
              onClick={() => dispatchSwitchLayer('L1')}
            >
              Switch
            </Button>
          }
        </S.LayerWrapper>
      </S.LayerSwitcherWrapperMobile>
    )
  }

  if (isMobile) {
    return (
      <S.LayerSwitcherWrapperMobile>
        <S.LayerWrapper>
          <IconButton
            sx={{ gap: '5px' }}
            aria-label="eth"
          >
            <EthereumIcon />
          </IconButton>
          <S.LayerContent>
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }} >Ethereum</Typography>
            {layer === 'L1' ?
              <Typography component='p' variant="body4" sx={{
                color: 'rgba(255, 255, 255, 0.3)'
              }} >{wAddress}</Typography> :
              <Typography variant="body4" sx={{
                opacity: '0.3',
                whiteSpace: 'nowrap'
              }} >Not Connected</Typography>
            }
          </S.LayerContent>
          {!layer ? <WalletPicker /> : layer === 'L1' ? null :
            <Button
              type="primary"
              variant="contained"
              size='small'
              onClick={() => dispatchSwitchLayer('L1')}
            >
              Switch
            </Button>}
        </S.LayerWrapper>
        <S.LayerDivider>
        </S.LayerDivider>
        <S.LayerWrapper>
          <IconButton
            sx={{ gap: '5px' }}
            aria-label="boba"
          >
            <BobaIcon />
          </IconButton>
          <S.LayerContent>
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }} >Boba Network</Typography>
            {layer === 'L2' ?
              <Typography component='p' variant="body4" sx={{
                color: 'rgba(255, 255, 255, 0.3)'
              }} >{wAddress}</Typography> :
              <Typography variant="body4" sx={{
                opacity: '0.3',
                whiteSpace: 'nowrap'
              }} >Not Connected</Typography>
            }
          </S.LayerContent>
          {!layer ? <WalletPicker /> : layer === 'L2' ? null :
            <Button
              type="primary"
              variant="contained"
              size='small'
              onClick={() => dispatchSwitchLayer('L2')}
            >
              Switch
            </Button>
          }
        </S.LayerWrapper>
      </S.LayerSwitcherWrapperMobile>
    )
  }

  return (
    <S.LayerSwitcherWrapper>
      <IconButton
        sx={{ gap: '5px' }}
        onClick={() => { dispatchSwitchLayer('L1') }}
        aria-label="eth"
      >
        <EthereumIcon />
      </IconButton>
      <IconButton
        sx={{ gap: '5px' }}
        onClick={() => { dispatchSwitchLayer('L2') }}
        aria-label="boba"
      >
        <BobaIcon />
      </IconButton>
      {layer === 'L1' ? <S.LayerContent>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }} >Ethereum</Typography>
        <Typography component='p' variant="body4" sx={{
          color: 'rgba(255, 255, 255, 0.3)'
        }} >{wAddress}</Typography>
      </S.LayerContent> : null}
      {!layer ? <S.LayerContent>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }} >Not connected</Typography>
        <Typography variant="body4" sx={{
          opacity: '0.3',
          whiteSpace: 'nowrap'
        }} >Click Chain to Connect</Typography>
      </S.LayerContent> : null}
      {layer === 'L2' ? <S.LayerContent>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }} >Boba Network</Typography>
        <Typography variant="body4" sx={{
          color: 'rgba(255, 255, 255, 0.3)'
        }} >{wAddress}</Typography>
      </S.LayerContent> : null}
    </S.LayerSwitcherWrapper>)
}

export default LayerSwitcher
