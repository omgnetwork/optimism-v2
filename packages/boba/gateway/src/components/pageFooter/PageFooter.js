import { IconButton } from '@mui/material'
import { Telegram, Twitter } from '@mui/icons-material'
import { setPage } from 'actions/uiAction'
import DiscordIcon from 'components/icons/DiscordIcon'
import React from 'react'
import { useDispatch } from 'react-redux'
import BobaLogo from '../../images/boba2/logo-boba2.svg'
import GasSwitcher from '../mainMenu/gasSwitcher/GasSwitcher'
import * as S from './PageFooter.styles'

const PageFooter = () => {
  
  const dispatch = useDispatch();
  
  return (
    <S.Wrapper>
      <S.ContentWrapper>
        <S.FooterLogoWrapper>
          <img
            src={BobaLogo}
            alt="boba logo"
          />
        </S.FooterLogoWrapper>
        <GasSwitcher />
      </S.ContentWrapper>
      <S.FooterDivier />
      <S.FooterLinkWrapper>
        <S.LinkWrapper>
          <S.FooterLink
            component="button"
            variant="body2"
            onClick={() => {
              dispatch(setPage('Help'))
            }}
          >FAQs</S.FooterLink>
          <S.FooterLink
            component="button"
            variant="body2"
            onClick={() => {
              dispatch(setPage('Airdrop'))
            }}
          >AirDrop</S.FooterLink>
          <S.FooterLink
            component="button"
            variant="body2"
            onClick={() => {
              dispatch(setPage('BobaScope'))
            }}
          >System Analytics</S.FooterLink>
        </S.LinkWrapper>
        <S.SocialWrapper>
          <IconButton target='_blank' aria-label="telegram">
            <Telegram />
          </IconButton>
          <IconButton target='_blank' aria-label="telegram">
            <Twitter />
          </IconButton>
          <IconButton target='_blank' aria-label="telegram">
            <DiscordIcon />
          </IconButton>
        </S.SocialWrapper>
      </S.FooterLinkWrapper>
    </S.Wrapper>
  )
}

export default PageFooter
