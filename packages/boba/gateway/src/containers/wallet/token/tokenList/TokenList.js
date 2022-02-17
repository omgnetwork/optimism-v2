import Button from 'components/button/Button';
import React from 'react';
import { useSelector } from 'react-redux';
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

  const logo = getCoinImage(token.symbol)
  const lookupPrice = useSelector(selectLookupPrice)

  const amount = token.symbol === 'ETH' ?
    Number(logAmount(token.balance, token.decimals, 3)).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) :
    Number(logAmount(token.balance, token.decimals, 2)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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
        <S.TableCell>
          <Button
            onClick={() => { console.log('Click on bridge') }}
            variant="outlined"
            fullWidth
          >
            Bridge
          </Button>
        </S.TableCell>
      </S.TableBody>
    </S.Content>
  )
}

export default React.memo(TokenList);
