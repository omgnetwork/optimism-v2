import { openModal } from 'actions/uiAction';
import Button from 'components/button/Button';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectLookupPrice } from 'selectors/lookupSelector';
import { amountToUsd, logAmount } from 'util/amountConvert';
import { getCoinImage } from 'util/coinImage';
import * as S from './TokenList.styles';

function TokenList({
  token,
  chain,
  networkLayer,
  disabled,
  loading
}) {

  const dispatch = useDispatch();
  const enabled = (networkLayer === chain) ? true : false
  const logo = getCoinImage(token.symbol)
  const lookupPrice = useSelector(selectLookupPrice)

  const amount = token.symbol === 'ETH' ?
    Number(logAmount(token.balance, token.decimals, 3)).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) :
    Number(logAmount(token.balance, token.decimals, 2)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleModalClick = (modalName, token, fast) => {
    dispatch(openModal(modalName, token, fast))
  }

  return (
    <S.Content>
      <S.TableBody>
        <S.TableCell sx={{ gap: "10px", justifyContent: "flex-start" }}>
          <img src={logo} alt="logo" width={42} height={42} />

          <S.TextTableCell variant="body2" component="div">
            {token.symbol}
          </S.TextTableCell>
        </S.TableCell>
        <S.TableCell sx={{ justifyContent: "flex-start" }}>
          <S.TextTableCell
            variant="body2"
            component="div"
            sx={{ fontWeight: '700' }}
          >
            {amount}
          </S.TextTableCell>
        </S.TableCell>
        <S.TableCell sx={{ justifyContent: "flex-start" }}>
          <S.TextTableCell
            variant="body2"
            component="div"
            sx={{ fontWeight: '700' }}
          >
            {`$${amountToUsd(amount, lookupPrice, token).toFixed(2)}`}
          </S.TextTableCell>
        </S.TableCell>
        <S.TableCell
          sx={{
            gap: '5px',
            width: '40%'
          }}
        >
          {enabled && chain === 'L1' &&
            <>
              <Button
                onClick={() => { handleModalClick('depositModal', token, false) }}
                color='neutral'
                variant="outlined"
                disabled={disabled}
                tooltip="Classic Bridge to Boba L2. This option is always available but is generally more expensive than the swap-based system ('Fast Bridge')."
                fullWidth
              >
                Bridge to L2
              </Button>

              <Button
                onClick={() => { handleModalClick('depositModal', token, true) }}
                color='primary'
                disabled={disabled}
                variant="outlined"
                tooltip="A swap-based bridge to Boba L2. This option is only available if the pool balance is sufficient."
                fullWidth
              >
                Fast Bridge to L2
              </Button>
            </>
          }
          {enabled && chain === 'L2' && token.symbol !== 'OLO' && token.symbol !== 'WAGMIv0' &&
            <>
              <Button
                onClick={() => { handleModalClick('exitModal', token, false) }}
                variant="outlined"
                disabled={disabled}
                tooltip="Classic Bridge to L1. This option is always available but has a 7 day delay before receiving your funds."
                fullWidth
              >
                Bridge to L1
              </Button>
              <Button
                onClick={() => { handleModalClick('exitModal', token, true) }}
                variant="outlined"
                disabled={disabled}
                tooltip="A swap-based bridge to L1 without a 7 day waiting period. There is a fee, however, and this option is only available if the pool balance is sufficient."
                fullWidth
                sx={{ whiteSpace: 'nowrap' }}
              >
                Fast Bridge to L1
              </Button>
              <Button
                onClick={() => { handleModalClick('transferModal', token, false) }}
                variant="outlined"
                disabled={disabled}
                tooltip="Transfer funds from one L2 account to another L2 account."
                fullWidth
              >
                Transfer
              </Button> </>}
        </S.TableCell>
      </S.TableBody>
    </S.Content>
  )
}

export default React.memo(TokenList);
