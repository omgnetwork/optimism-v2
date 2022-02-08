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

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useTheme } from '@emotion/react'

import { Box, Typography, useMediaQuery } from '@mui/material'

import { exitBOBA } from 'actions/networkAction'
import { openAlert } from 'actions/uiAction'

import Button from 'components/button/Button'
import Input from 'components/input/Input'

import { selectLoading } from 'selectors/loadingSelector'
import { selectSignatureStatus_exitTRAD } from 'selectors/signatureSelector'
import { selectLookupPrice } from 'selectors/lookupSelector'

import { amountToUsd, logAmount, toWei_String } from 'util/amountConvert'

import { WrapperActionsModal } from 'components/modal/Modal.styles'

import parse from 'html-react-parser'

import BN from 'bignumber.js'

import { 
  fetchClassicExitCost,
  fetchL2FeeBalance, 
} from 'actions/balanceAction'

import { 
  selectClassicExitCost, //estimated total cost of this exit
  selectL2FeeBalance,
} from 'selectors/balanceSelector'

function DoExitStep({ handleClose, token }) {

  const dispatch = useDispatch()

  const [ value, setValue ] = useState('')
  const [ value_Wei_String, setValue_Wei_String ] = useState('0')  //support for Use Max

  const [ validValue, setValidValue ] = useState(false)
  const loading = useSelector(selectLoading(['EXIT/CREATE']))

  const signatureStatus = useSelector(selectSignatureStatus_exitTRAD)
  const lookupPrice = useSelector(selectLookupPrice)

  const cost = useSelector(selectClassicExitCost)
  const feeBalance = useSelector(selectL2FeeBalance)

  const maxValue = logAmount(token.balance, token.decimals)
  console.log("maxValue",maxValue) //this is now a float represented as a string

  // function setAmount(value) {
  //   //this function can accommodate strings, numbers, 
  //   //and BigNumbers since it's based on "bignumber.js"

  //   console.log("ETH fees:",Number(cost))

  //   const tooSmall = new BN(value).lte(new BN(0.0))
  //   const tooBig   = new BN(value).gt(new BN(maxValue))

  //   if (tooSmall || tooBig) {
  //     setValidValue(false)
  //   } else {
  //     setValidValue(true)
  //   }

  //   setValue(value)
  // }

  function setAmount(value) {

    const tooSmall = new BN(value).lte(new BN(0.0))
    const tooBig   = new BN(value).gt(new BN(maxValue))

    console.log("ETH fees:",Number(cost))
    console.log("Transaction token value:",Number(value))
    console.log("ETH available for fees:",Number(feeBalance))

    if (tooSmall || tooBig) {
      setValidValue(false)
      setValue(value)
      return false
    } else if (token.symbol === 'ETH' && (Number(cost) + Number(value)) > Number(feeBalance)) {
      //insufficient ETH to cover the ETH amount plus gas
      setValidValue(false)
      setValue(value)
      return false
    } else if ((Number(cost) > Number(feeBalance))) {
      //insufficient ETH to pay exit fees
      setValidValue(false)
      setValue(value)
      return false
    } else {
      //Whew, finally!
      setValidValue(true)
      setValue(value)
      return true
    }

  }

  async function doExit() {

    console.log("Amount to exit:", value_Wei_String)

    let res = await dispatch(exitBOBA(token.address, value_Wei_String))

    if (res) {
      dispatch(
        openAlert(
          `${token.symbol} was bridged to L1. You will receive
          ${Number(value).toFixed(3)} ${token.symbol}
          on L1 in 7 days.`
        )
      )
      handleClose()
    }
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  let buttonLabel = 'Cancel'
  if( loading ) buttonLabel = 'Close'

  useEffect(() => {
    if (signatureStatus && loading) {
      //we are all set - can close the window
      //transaction has been sent and signed
      handleClose()
    }
  }, [ signatureStatus, loading, handleClose ])

  useEffect(() => {
    if (typeof(token) !== 'undefined') {
      console.log("Token:",token)
      dispatch(fetchClassicExitCost(token.address))
      dispatch(fetchL2FeeBalance())
    }
  }, [ token, dispatch ])

  let ETHstring = ''
  let warning = false

  if(cost && Number(cost) > 0) {
    
    if (token.symbol !== 'ETH') {
      if(Number(cost) > Number(feeBalance)) {
        warning = true
        ETHstring = `Estimated gas (approval + exit): ${Number(cost).toFixed(4)} ETH 
        <br/>WARNING: your L2 ETH balance of ${Number(feeBalance).toFixed(4)} is not sufficient to cover gas. 
        <br/>TRANSACTION WILL FAIL.` 
      } 
      else if(Number(cost) > Number(feeBalance) * 0.96) {
        warning = true
        ETHstring = `Estimated gas (approval + exit): ${Number(cost).toFixed(4)} ETH 
        <br/>CAUTION: your L2 ETH balance of ${Number(feeBalance).toFixed(4)} is very close to the estimated cost. 
        <br/>TRANSACTION MIGHT FAIL. It would be safer to have slightly more ETH in your L2 wallet to cover gas.` 
      } 
      else {
        ETHstring = `Estimated gas (approval + exit): ${Number(cost).toFixed(4)} ETH` 
      }
    }

    if (token.symbol === 'ETH') {
      if((Number(value) + Number(cost)) > Number(feeBalance)) {
        warning = true
        ETHstring = `Transaction total (amount + approval + exit): ${(Number(value) + Number(cost)).toFixed(4)} ETH 
        <br/>WARNING: your L2 ETH balance of ${Number(feeBalance).toFixed(4)} is not sufficient to cover this transaction. 
        <br/>TRANSACTION WILL FAIL.` 
      }
      else if ((Number(value) + Number(cost)) > Number(feeBalance) * 0.96) {
        warning = true
        ETHstring = `Transaction total (amount + approval + exit): ${(Number(value) + Number(cost)).toFixed(4)} ETH 
        <br/>CAUTION: your L2 ETH balance of ${Number(feeBalance).toFixed(4)} is very close to the estimated total. 
        <br/>TRANSACTION MIGHT FAIL.` 
      } else {
        ETHstring = `Transaction total (amount + approval + exit): ${(Number(value) + Number(cost)).toFixed(4)} ETH` 
      }
    }
  }

  return (
    <>
      <Box>
        <Typography variant="h2" sx={{fontWeight: 700, mb: 3}}>
          Classic Bridge to L1 ({`${token ? token.symbol : ''}`})
        </Typography>

        <Input
          label={'Amount to bridge to L1'}
          placeholder="0"
          value={value}
          type="number"
          onChange={(i)=>{
            setAmount(i.target.value)
            setValue_Wei_String(toWei_String(i.target.value, token.decimals))
          }}
          onUseMax={(i)=>{//they want to use the maximum
            setAmount(maxValue) //so the display value updates for the user
            setValue_Wei_String(token.balance.toString())
          }}
          allowUseAll={true}
          unit={token.symbol}
          maxValue={maxValue}
          variant="standard"
          newStyle
        />

        {validValue && token && (
          <Typography variant="body2" sx={{mt: 2}}>
            {value &&
              `You will receive ${Number(value).toFixed(3)} ${token.symbol}
              ${!!amountToUsd(value, lookupPrice, token) ? `($${amountToUsd(value, lookupPrice, token).toFixed(2)})`: ''}
              on L1. Your funds will be available on L1 in 7 days.`}
          </Typography>
        )}

        {warning && (
          <Typography variant="body2" sx={{mt: 2, color: 'red'}}>
            {parse(ETHstring)}
          </Typography>
        )}

        {!warning && (
          <Typography variant="body2" sx={{mt: 2}}>
            {parse(ETHstring)}
          </Typography>
        )}

        {loading && (
          <Typography variant="body2" sx={{mt: 2, color: 'green'}}>
            This window will close when your transaction has been signed and submitted.
          </Typography>
        )}
      </Box>

      <WrapperActionsModal>
          <Button
            onClick={handleClose}
            color="neutral"
            size="large"
          >
            {buttonLabel}
          </Button>
          {token && (
            <Button
              onClick={doExit}
              color="primary"
              variant="contained"
              loading={loading}
              tooltip={loading ? "Your transaction is still pending. Please wait for confirmation." : "Click here to bridge your funds to L1"}
              disabled={!validValue}
              triggerTime={new Date()}
              fullWidth={isMobile}
              size="large"
            >
              Bridge to L1
            </Button>
          )}
      </WrapperActionsModal>
    </>
  )
}

export default React.memo(DoExitStep)
