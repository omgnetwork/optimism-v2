
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

import { Box, Typography, IconButton } from '@mui/material'
import { switchChain } from 'actions/setupAction.js'

import Button from 'components/button/Button'
import BobaIcon from 'components/icons/BobaIcon.js'
import EthereumIcon from 'components/icons/EthereumIcon.js'
import LayerIcon from 'components/icons/LayerIcon'

import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAccountEnabled, selectJustSwitchedChain, selectLayer } from 'selectors/setupSelector'

import * as S from './LayerSwitcher.styles.js'

function LayerSwitcher({ isButton = false, size }) {

  const dispatch = useDispatch()
  const accountEnabled = useSelector(selectAccountEnabled())
  const justSwitchedChain = useSelector(selectJustSwitchedChain())
  let layer = useSelector(selectLayer())

  console.log("LS: Layer:", layer)
  console.log("LS: accountEnabled:", accountEnabled)
  console.log("LS: justSwitchedChain:", justSwitchedChain)

  const dispatchSwitchLayer = useCallback(() => {
    console.log("LS: switchLayer accountEnabled:", accountEnabled)
    //if (!accountEnabled) return
    //dispatch(setLayer(layer))
    if (!layer) {
      dispatch(switchChain('L2'))
    }
    else if (layer === 'L1') {
      dispatch(switchChain('L2'))
    }
    else if (layer === 'L2') {
      dispatch(switchChain('L1'))
    }
  }, [ dispatch, accountEnabled, layer ])

  return (
    <S.LayerSwitcherWrapper>
      {!layer ? <S.LayerContent>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }} >Not connected</Typography>
        <Typography variant="body4" sx={{
          color: 'rgba(255, 255, 255, 0.3)',
          whiteSpace: 'nowrap'
        }} >Click Chain to Connect</Typography>
      </S.LayerContent> : null}
      <IconButton
        sx={{ gap: '5px' }}
        onClick={() => { dispatchSwitchLayer() }}
        aria-label="eth"
      >
        <EthereumIcon active={true} />
      </IconButton>
      {layer === 'L1' ? <S.LayerContent>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }} >Ethereum</Typography>
        <Typography variant="body4" sx={{
          color: 'rgba(255, 255, 255, 0.3)'
        }} >ox810Ff...4F95BB</Typography>
      </S.LayerContent> : null}
      <IconButton
        sx={{ gap: '5px' }}
        onClick={() => { dispatchSwitchLayer() }}
        aria-label="boba"
      >
        <BobaIcon active={true} />
      </IconButton>
      {layer === 'L2' ? <S.LayerContent>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }} >Boba Network</Typography>
        <Typography variant="body4" sx={{
          color: 'rgba(255, 255, 255, 0.3)'
        }} >ox810Ff...4F95BB</Typography>
      </S.LayerContent> : null}
    </S.LayerSwitcherWrapper>)
  // we are not connected to MM so Layer is not defined

  // if (accountEnabled !== true) {
  //   return (
  //   <S.WalletPickerContainer>
  //     <S.WalletPickerWrapper>
  //       <Box sx={{display: 'flex', width: '100%', alignItems: 'center'}}>
  //         <LayerIcon />
  //         <S.Label variant="body2">Layer</S.Label>
  //         <Typography
  //           className={'active'}
  //           variant="body2"
  //           component="span"
  //           color="white"
  //           style={{paddingLeft: '30px', fontSize: '0.7em', lineHeight: '0.9em'}}
  //         >
  //           Wallet not<br/>connected
  //         </Typography>
  //       </Box>
  //     </S.WalletPickerWrapper>
  //   </S.WalletPickerContainer>)
  // }

  // return (
  //   <S.WalletPickerContainer>
  //     <S.WalletPickerWrapper>
  //       <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
  //         <LayerIcon />
  //         <S.Label variant="body2">Layer</S.Label>
  //         <S.LayerSwitch>
  //           <Typography
  //             className={layer === 'L1' ? 'active' : ''}
  //             onClick={() => { if (layer === 'L2') { dispatchSwitchLayer() } }}
  //             variant="body2"
  //             component="span"
  //             color="white">
  //             1
  //           </Typography>
  //           <Typography
  //             className={layer === 'L2' ? 'active' : ''}
  //             onClick={() => { if (layer === 'L1') { dispatchSwitchLayer() } }}
  //             variant="body2"
  //             component="span"
  //             color="white">
  //             2
  //           </Typography>
  //         </S.LayerSwitch>
  //       </Box>
  //     </S.WalletPickerWrapper>
  //   </S.WalletPickerContainer>
  // )
}

export default LayerSwitcher
