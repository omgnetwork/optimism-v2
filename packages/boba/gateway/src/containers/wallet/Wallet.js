import { Circle } from "@mui/icons-material";
import { Typography } from '@mui/material';
import PageTitle from "components/pageTitle/PageTitle";
import Nft from "containers/wallet/nft/Nft";
import React, {useState} from "react";
import { useSelector } from 'react-redux';
import { selectAccountEnabled, selectLayer } from "selectors/setupSelector";
import * as S from './wallet.styles';


function Wallet() {

  const [page, setPage] = useState('TOKEN')
  const layer = useSelector(selectLayer());
  const accountEnabled = useSelector(selectAccountEnabled())

  return (
    <S.PageContainer>
      <PageTitle title={`${layer === 'L1' ? 'Ethereum' : 'Boba'} Wallet`} />
      <S.PageSwitcher>
        <Typography
          className={page === 'TOKEN' ? 'active' : ''}
          onClick={() => { setPage('TOKEN'); console.log('Switch to Wallet') }}
          variant="body2"
          component="span"
          color="white">
          Token
        </Typography>
        <Typography
          className={page === 'NFT' ? 'active' : ''}
          onClick={() => { setPage('NFT'); console.log('Switch to NFT') }}
          variant="body2"
          component="span"
          color="white">
          NFT
        </Typography>
      </S.PageSwitcher>
      {
        (!accountEnabled || layer === 'L1') ?
          <Typography variant="body2" sx={{ color: '#FF6A55' }}><Circle sx={{ height: "10px", width: "10px" }} /> Disconnected</Typography>
          : <Typography variant="body2" sx={{ color: '#BAE21A' }}><Circle sx={{ height: "10px", width: "10px" }} /> Connected</Typography>}
      
      <S.PageContent>
        <Nft />
      </S.PageContent>
    </S.PageContainer>
  )
}

export default React.memo(Wallet);
